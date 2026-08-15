import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { moodboardDraftSchema, moodboardLayersForDatabase, moodboardRevisionForDatabase } from "@/lib/admin/moodboard-schema";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = moodboardDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the moodboard fields." }, { status: 400 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("moodboard_posts").select("working_revision_id, published_revision_id, status, category_id").eq("id", id).single();
  if (!post?.working_revision_id) return NextResponse.json({ error: "Moodboard not found." }, { status: 404 });
  const draft = parsed.data;
  const { error: revisionError } = await supabase.from("moodboard_revisions").update({ ...moodboardRevisionForDatabase(draft), updated_at: new Date().toISOString() }).eq("id", post.working_revision_id).eq("immutable", false);
  if (revisionError) return NextResponse.json({ error: revisionError.message }, { status: 500 });
  await supabase.from("moodboard_layers").delete().eq("revision_id", post.working_revision_id);
  if (draft.layers.length) {
    const { error } = await supabase.from("moodboard_layers").insert(moodboardLayersForDatabase(post.working_revision_id, draft.layers));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  let nextPosition: number | undefined;
  if (post.category_id !== draft.categoryId) {
    const { data: last } = await supabase.from("moodboard_posts").select("position").eq("category_id", draft.categoryId).order("position", { ascending: false }).limit(1).maybeSingle();
    nextPosition = (last?.position ?? 0) + 1;
  }
  const nextStatus = post.status === "unpublished" || post.status === "archived" ? post.status : post.published_revision_id ? "published_with_changes" : "draft";
  await supabase.from("moodboard_posts").update({
    category_id: draft.categoryId, ...(nextPosition ? { position: nextPosition } : {}), status: nextStatus, updated_at: new Date().toISOString(),
  }).eq("id", id);
  return NextResponse.json({ post: { id } });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("moodboard_posts").select("status").eq("id", id).single();
  if (!post) return NextResponse.json({ error: "Moodboard not found." }, { status: 404 });
  if (post.status !== "draft") return NextResponse.json({ error: "Only never-published drafts can be deleted." }, { status: 409 });
  await supabase.from("moodboard_posts").update({ working_revision_id: null }).eq("id", id);
  const { error } = await supabase.from("moodboard_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
