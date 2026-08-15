import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { listDraftForDatabase, listDraftSchema, listItemsForDatabase } from "@/lib/admin/list-schema";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = listDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the list fields." }, { status: 400 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("list_posts").select("working_revision_id, published_revision_id, status").eq("id", id).single();
  if (!post?.working_revision_id) return NextResponse.json({ error: "List not found." }, { status: 404 });
  const draft = parsed.data;
  const { error: revisionError } = await supabase.from("list_revisions").update({ ...listDraftForDatabase(draft), updated_at: new Date().toISOString() }).eq("id", post.working_revision_id).eq("immutable", false);
  if (revisionError) return NextResponse.json({ error: revisionError.message }, { status: 500 });
  const { error: deleteError } = await supabase.from("list_items").delete().eq("revision_id", post.working_revision_id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  const { error: itemError } = await supabase.from("list_items").insert(listItemsForDatabase(post.working_revision_id, draft.items));
  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 });
  const nextStatus = post.status === "unpublished" || post.status === "archived"
    ? post.status
    : post.published_revision_id
      ? "published_with_changes"
      : "draft";
  await supabase.from("list_posts").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ post: { id } });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("list_posts").select("status, working_revision_id").eq("id", id).single();
  if (!post) return NextResponse.json({ error: "List not found." }, { status: 404 });
  if (post.status !== "draft") return NextResponse.json({ error: "Only drafts that have never been published can be deleted." }, { status: 409 });
  await supabase.from("list_posts").update({ working_revision_id: null }).eq("id", id);
  const { error } = await supabase.from("list_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
