import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { listDraftForDatabase, listDraftSchema, listItemsForDatabase } from "@/lib/admin/list-schema";
import { slugifyListLabel } from "@/lib/lists-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("list_posts")
    .select("id, slug, status, updated_at, working_revision:list_revisions!list_posts_working_revision_fkey(title,type_label,period_label)")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: (data ?? []).map((post) => {
    const revision = post.working_revision as unknown as { title?: string; type_label?: string; period_label?: string } | null;
    return { id: post.id, slug: post.slug, status: post.status, updatedAt: post.updated_at, title: revision?.title ?? "Untitled list", typeLabel: revision?.type_label ?? "", periodLabel: revision?.period_label ?? "" };
  }) });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = listDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the list fields." }, { status: 400 });
  const draft = parsed.data;
  const supabase = await createClient();
  const slug = `${slugifyListLabel(draft.title)}-${nanoid(6).toLowerCase()}`;
  const { data: post, error: postError } = await supabase.from("list_posts").insert({ slug, author_id: identity.id, status: "draft" }).select("id, slug, status").single();
  if (postError || !post) return NextResponse.json({ error: postError?.message ?? "Could not create the list." }, { status: 500 });
  const { data: revision, error: revisionError } = await supabase.from("list_revisions").insert({ post_id: post.id, revision_number: 1, ...listDraftForDatabase(draft), immutable: false, created_by: identity.id }).select("id").single();
  if (revisionError || !revision) return NextResponse.json({ error: revisionError?.message ?? "Could not create the working list." }, { status: 500 });
  const { error: itemError } = await supabase.from("list_items").insert(listItemsForDatabase(revision.id, draft.items));
  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 });
  const { error: updateError } = await supabase.from("list_posts").update({ working_revision_id: revision.id }).eq("id", post.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ post }, { status: 201 });
}
