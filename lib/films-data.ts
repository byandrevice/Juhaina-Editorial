import type { JSONContent } from "@tiptap/react";
import { filmEssays, orderFilmEssays, type FilmEssay } from "./film-essays";
import { getHiddenFixtureKeys } from "./fixture-visibility";
import { hasSupabaseConfig } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

export type PublishedFilmEssay = FilmEssay & { body?: JSONContent };

type PublishedRevision = {
  title: string;
  subtitle: string;
  body: JSONContent;
  cover_position_x: number;
  cover_position_y: number;
  cover_zoom: number;
  film_title: string;
  director: string;
  film_year: number | null;
  featured: boolean;
  published_at: string | null;
  assets: { storage_path: string } | null;
};

async function coverUrl(path: string | undefined) {
  if (!path) return undefined;
  const supabase = createPublicClient();
  const { data } = await supabase.storage.from("editorial-images").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl;
}

export async function getPublishedFilmEssays(): Promise<PublishedFilmEssay[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = createPublicClient();
  const { data: posts, error } = await supabase
    .from("film_posts")
    .select("slug, published_revision_id")
    .in("status", ["published", "published_with_changes"]);
  if (error || !posts?.length) return [];

  const essays = await Promise.all(posts.map(async (post) => {
    const { data } = await supabase
      .from("film_revisions")
      .select("title, subtitle, body, cover_position_x, cover_position_y, cover_zoom, film_title, director, film_year, featured, published_at, assets(storage_path)")
      .eq("id", post.published_revision_id)
      .single();
    if (!data) return null;
    const revision = data as unknown as PublishedRevision;
    return {
      slug: post.slug,
      title: revision.title,
      publishedAt: revision.published_at ?? new Date().toISOString().slice(0, 10),
      excerpt: revision.subtitle,
      filmTitle: revision.film_title,
      director: revision.director,
      filmYear: revision.film_year ?? new Date().getFullYear(),
      featured: revision.featured,
      imageSrc: await coverUrl(revision.assets?.storage_path),
      imagePositionX: Number(revision.cover_position_x),
      imagePositionY: Number(revision.cover_position_y),
      imageZoom: Number(revision.cover_zoom),
      body: revision.body,
    } satisfies PublishedFilmEssay;
  }));
  return orderFilmEssays(essays.filter(Boolean) as PublishedFilmEssay[]);
}

export async function getPublishedFilmEssay(slug: string) {
  const essays = await getPublishedFilmEssays();
  return essays.find((essay) => essay.slug === slug) ?? null;
}

export async function getPublicFilmEssays(): Promise<PublishedFilmEssay[]> {
  if (!hasSupabaseConfig()) return orderFilmEssays(filmEssays);
  const [published, hidden] = await Promise.all([
    getPublishedFilmEssays(),
    getHiddenFixtureKeys("films"),
  ]);
  if (!hidden) return orderFilmEssays(published);
  const publishedSlugs = new Set(published.map((essay) => essay.slug));
  const samples = filmEssays.filter((essay) => !hidden.has(essay.slug) && !publishedSlugs.has(essay.slug));
  return orderFilmEssays([...published, ...samples]);
}

export async function getPublicFilmEssay(slug: string) {
  const essays = await getPublicFilmEssays();
  return essays.find((essay) => essay.slug === slug) ?? null;
}
