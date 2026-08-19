import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProjectionEditorInitialData } from "./projection-schema";

type RevisionRow = {
  title: string; excerpt: string; body: ProjectionEditorInitialData["body"];
  cover_asset_id: string | null; cover_position_x: number; cover_position_y: number;
  cover_zoom: number; image_alt: string; subject_title: string; creator: string;
  subject_year: number | null; reading_time: number; published_at: string | null;
  assets: { storage_path: string } | null;
};

export async function getProjectionForEditing(id: string): Promise<ProjectionEditorInitialData> {
  const supabase = await createClient();
  const { data: post } = await supabase.from("projection_posts")
    .select("id, slug, status, working_revision_id").eq("id", id).single();
  if (!post) notFound();
  const { data } = await supabase.from("projection_revisions")
    .select("title, excerpt, body, cover_asset_id, cover_position_x, cover_position_y, cover_zoom, image_alt, subject_title, creator, subject_year, reading_time, published_at, assets(storage_path)")
    .eq("id", post.working_revision_id).single();
  if (!data) notFound();
  const revision = data as unknown as RevisionRow;
  let coverUrl: string | null = null;
  if (revision.assets?.storage_path) {
    const { data: signed } = await supabase.storage.from("editorial-images").createSignedUrl(revision.assets.storage_path, 3600);
    coverUrl = signed?.signedUrl ?? null;
  }
  return {
    id: post.id, slug: post.slug, status: post.status,
    title: revision.title, excerpt: revision.excerpt, body: revision.body,
    coverAssetId: revision.cover_asset_id,
    coverPositionX: Number(revision.cover_position_x), coverPositionY: Number(revision.cover_position_y),
    coverZoom: Number(revision.cover_zoom), imageAlt: revision.image_alt,
    subjectTitle: revision.subject_title, creator: revision.creator,
    subjectYear: revision.subject_year, readingTime: revision.reading_time,
    publishedAt: revision.published_at, coverUrl,
  };
}
