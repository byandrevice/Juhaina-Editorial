import type { JSONContent } from "@tiptap/react";
import { getHiddenFixtureKeys } from "./fixture-visibility";
import { orderedProjectionEssays, projectionEssays, type ProjectionEssay } from "./projection-essays";
import { hasSupabaseConfig } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

export type PublishedProjectionEssay = ProjectionEssay & { body?: JSONContent };

type PublishedRevision = {
  title: string;
  excerpt: string;
  body: JSONContent;
  cover_position_x: number;
  cover_position_y: number;
  cover_zoom: number;
  image_alt: string;
  subject_title: string;
  creator: string;
  subject_year: number | null;
  reading_time: number;
  published_at: string | null;
  assets: { storage_path: string } | null;
};

async function signedCover(path: string | undefined) {
  if (!path) return undefined;
  const supabase = createPublicClient();
  const { data } = await supabase.storage.from("editorial-images").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl;
}

export async function getPublishedProjectionEssays(): Promise<PublishedProjectionEssay[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = createPublicClient();
  const { data: posts, error } = await supabase
    .from("projection_posts")
    .select("slug, published_revision_id")
    .in("status", ["published", "published_with_changes"]);
  if (error || !posts?.length) return [];

  const essays = await Promise.all(posts.map(async (post) => {
    const { data } = await supabase.from("projection_revisions")
      .select("title, excerpt, body, cover_position_x, cover_position_y, cover_zoom, image_alt, subject_title, creator, subject_year, reading_time, published_at, assets(storage_path)")
      .eq("id", post.published_revision_id)
      .single();
    if (!data) return null;
    const revision = data as unknown as PublishedRevision;
    const src = await signedCover(revision.assets?.storage_path);
    if (!src) return null;
    return {
      slug: post.slug,
      title: revision.title,
      excerpt: revision.excerpt,
      subjectTitle: revision.subject_title,
      creator: revision.creator,
      subjectYear: revision.subject_year ?? new Date().getFullYear(),
      publishedAt: revision.published_at ?? new Date().toISOString().slice(0, 10),
      readingTime: revision.reading_time,
      still: {
        src,
        alt: revision.image_alt,
        focalX: Number(revision.cover_position_x) / 100,
        focalY: Number(revision.cover_position_y) / 100,
        zoom: Number(revision.cover_zoom),
      },
      body: revision.body,
    } satisfies PublishedProjectionEssay;
  }));
  return essays.filter(Boolean).sort((first, second) => second!.publishedAt.localeCompare(first!.publishedAt)) as PublishedProjectionEssay[];
}

export async function getPublicProjectionEssays(): Promise<PublishedProjectionEssay[]> {
  if (!hasSupabaseConfig()) return orderedProjectionEssays();
  const [published, hidden] = await Promise.all([
    getPublishedProjectionEssays(),
    getHiddenFixtureKeys("projections"),
  ]);
  if (!hidden) return published;
  const publishedSlugs = new Set(published.map((essay) => essay.slug));
  const samples = projectionEssays.filter((essay) => !hidden.has(essay.slug) && !publishedSlugs.has(essay.slug));
  return [...published, ...samples].sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
}

export async function getPublicProjectionEssay(slug: string) {
  return (await getPublicProjectionEssays()).find((essay) => essay.slug === slug) ?? null;
}
