import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminIdentity } from "@/lib/admin/auth";
import { moodboardDraftSchema, moodboardLayersForDatabase, moodboardRevisionForDatabase } from "@/lib/admin/moodboard-schema";
import { slugifyListLabel } from "@/lib/lists-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("moodboard_posts")
    .select("id, slug, status, position, category_id, updated_at, category:moodboard_categories!moodboard_posts_category_id_fkey(name, position), working_revision:moodboard_revisions!moodboard_posts_working_revision_fkey(title)");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: (data ?? []).map((post) => ({
    id: post.id, slug: post.slug, status: post.status, position: post.position, categoryId: post.category_id, updatedAt: post.updated_at,
    title: (post.working_revision as unknown as { title?: string } | null)?.title ?? "Untitled moodboard",
    categoryName: (post.category as unknown as { name?: string } | null)?.name ?? "Uncategorized",
    categoryPosition: (post.category as unknown as { position?: number } | null)?.position ?? 0,
  })) });
}

export async function PATCH(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json();
  const id = String(body.id ?? "");
  const direction = Number(body.direction);
  if (!id || !new Set([-1, 1]).has(direction)) return NextResponse.json({ error: "Choose a moodboard and direction." }, { status: 400 });
  const supabase = await createClient();
  const { data: current } = await supabase.from("moodboard_posts").select("id, category_id, position").eq("id", id).single();
  if (!current) return NextResponse.json({ error: "Moodboard not found." }, { status: 404 });
  const query = supabase.from("moodboard_posts").select("id, position").eq("category_id", current.category_id);
  const { data: neighbor, error: neighborError } = direction < 0
    ? await query.lt("position", current.position).order("position", { ascending: false }).limit(1).maybeSingle()
    : await query.gt("position", current.position).order("position", { ascending: true }).limit(1).maybeSingle();
  if (neighborError) return NextResponse.json({ error: neighborError.message }, { status: 500 });
  if (!neighbor) return NextResponse.json({ moved: false });
  const { error: firstError } = await supabase.from("moodboard_posts").update({ position: neighbor.position }).eq("id", current.id);
  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 });
  const { error: secondError } = await supabase.from("moodboard_posts").update({ position: current.position }).eq("id", neighbor.id);
  if (secondError) return NextResponse.json({ error: secondError.message }, { status: 500 });
  revalidatePath("/moodboards");
  return NextResponse.json({ moved: true, neighborId: neighbor.id, position: neighbor.position, neighborPosition: current.position });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = moodboardDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the moodboard fields." }, { status: 400 });
  const draft = parsed.data;
  const supabase = await createClient();
  const { data: last } = await supabase.from("moodboard_posts").select("position").eq("category_id", draft.categoryId).order("position", { ascending: false }).limit(1).maybeSingle();
  const slug = `${slugifyListLabel(draft.title, "moodboard")}-${nanoid(6).toLowerCase()}`;
  const { data: post, error: postError } = await supabase.from("moodboard_posts").insert({
    slug, author_id: identity.id, category_id: draft.categoryId, position: (last?.position ?? 0) + 1, status: "draft",
  }).select("id, slug, status").single();
  if (postError || !post) return NextResponse.json({ error: postError?.message ?? "Could not create the moodboard." }, { status: 500 });
  const { data: revision, error: revisionError } = await supabase.from("moodboard_revisions").insert({
    post_id: post.id, revision_number: 1, ...moodboardRevisionForDatabase(draft), immutable: false, created_by: identity.id,
  }).select("id").single();
  if (revisionError || !revision) return NextResponse.json({ error: revisionError?.message ?? "Could not create the working moodboard." }, { status: 500 });
  if (draft.layers.length) {
    const { error } = await supabase.from("moodboard_layers").insert(moodboardLayersForDatabase(revision.id, draft.layers));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await supabase.from("moodboard_posts").update({ working_revision_id: revision.id }).eq("id", post.id);
  return NextResponse.json({ post }, { status: 201 });
}
