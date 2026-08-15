import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { filmDraftSchema } from "@/lib/admin/film-schema";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("film_posts")
    .select("status, working_revision_id")
    .eq("id", id)
    .single();

  if (!post) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  if (post.status !== "draft") {
    return NextResponse.json(
      { error: "Only unpublished drafts can be deleted." },
      { status: 409 },
    );
  }

  let coverAssetId: string | null = null;
  if (post.working_revision_id) {
    const { data: revision } = await supabase
      .from("film_revisions")
      .select("cover_asset_id")
      .eq("id", post.working_revision_id)
      .single();
    coverAssetId = revision?.cover_asset_id ?? null;
  }

  const { error: detachError } = await supabase
    .from("film_posts")
    .update({ working_revision_id: null })
    .eq("id", id);
  if (detachError) {
    return NextResponse.json({ error: detachError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from("film_posts").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (coverAssetId) {
    const { count } = await supabase
      .from("film_revisions")
      .select("id", { count: "exact", head: true })
      .eq("cover_asset_id", coverAssetId);
    if (!count) {
      const { data: asset } = await supabase
        .from("assets")
        .select("storage_path")
        .eq("id", coverAssetId)
        .single();
      if (asset?.storage_path) {
        await supabase.storage.from("editorial-images").remove([asset.storage_path]);
      }
      await supabase.from("assets").delete().eq("id", coverAssetId);
    }
  }

  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = filmDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the draft fields." }, { status: 400 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("film_posts").select("working_revision_id, published_revision_id").eq("id", id).single();
  if (!post?.working_revision_id) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  const draft = parsed.data;
  const { error } = await supabase.from("film_revisions").update({
    title: draft.title, subtitle: draft.subtitle, body: draft.body, cover_asset_id: draft.coverAssetId,
    cover_position_x: draft.coverPositionX, cover_position_y: draft.coverPositionY,
    cover_zoom: draft.coverZoom,
    film_title: draft.filmTitle, director: draft.director, film_year: draft.filmYear,
    featured: draft.featured, published_at: draft.publishedAt, updated_at: new Date().toISOString(),
  }).eq("id", post.working_revision_id).eq("immutable", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("film_posts").update({
    status: post.published_revision_id ? "published_with_changes" : "draft",
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  return NextResponse.json({ post: { id } });
}
