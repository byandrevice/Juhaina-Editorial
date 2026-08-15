import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FilmEditorInitialData } from "./film-schema";

type RevisionRow = {
  title: string;
  subtitle: string;
  body: FilmEditorInitialData["body"];
  cover_asset_id: string | null;
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

export async function getFilmForEditing(id: string): Promise<FilmEditorInitialData> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("film_posts")
    .select("id, slug, status, working_revision_id")
    .eq("id", id)
    .single();
  if (!post) notFound();

  const { data } = await supabase
    .from("film_revisions")
    .select("title, subtitle, body, cover_asset_id, cover_position_x, cover_position_y, cover_zoom, film_title, director, film_year, featured, published_at, assets(storage_path)")
    .eq("id", post.working_revision_id)
    .single();
  if (!data) notFound();
  const revision = data as unknown as RevisionRow;
  let coverUrl: string | null = null;
  if (revision.assets?.storage_path) {
    const { data: signed } = await supabase.storage.from("editorial-images").createSignedUrl(revision.assets.storage_path, 3600);
    coverUrl = signed?.signedUrl ?? null;
  }

  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    title: revision.title,
    subtitle: revision.subtitle,
    body: revision.body,
    coverAssetId: revision.cover_asset_id,
    coverPositionX: Number(revision.cover_position_x),
    coverPositionY: Number(revision.cover_position_y),
    coverZoom: Number(revision.cover_zoom),
    filmTitle: revision.film_title,
    director: revision.director,
    filmYear: revision.film_year,
    featured: revision.featured,
    publishedAt: revision.published_at,
    coverUrl,
  };
}
