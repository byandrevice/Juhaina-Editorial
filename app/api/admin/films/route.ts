import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { filmDraftSchema } from "@/lib/admin/film-schema";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
  return `${base || "film-essay"}-${nanoid(6).toLowerCase()}`;
}

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("film_posts")
    .select("id, slug, status, updated_at, working_revision:film_revisions!film_posts_working_revision_fkey(title)")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const posts = (data ?? []).map((post) => ({
    id: post.id, slug: post.slug, status: post.status, updatedAt: post.updated_at,
    title: (post.working_revision as unknown as { title?: string } | null)?.title ?? "Untitled film essay",
  }));
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = filmDraftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the draft fields." }, { status: 400 });
  const draft = parsed.data;
  const supabase = await createClient();

  const { data: post, error: postError } = await supabase.from("film_posts").insert({
    slug: slugify(draft.title), author_id: identity.id, status: "draft",
  }).select("id, slug, status").single();
  if (postError || !post) return NextResponse.json({ error: postError?.message ?? "Could not create the draft." }, { status: 500 });

  const { data: revision, error: revisionError } = await supabase.from("film_revisions").insert({
    post_id: post.id, revision_number: 1, title: draft.title, subtitle: draft.subtitle,
    body: draft.body, cover_asset_id: draft.coverAssetId, cover_position_x: draft.coverPositionX,
    cover_position_y: draft.coverPositionY, cover_zoom: draft.coverZoom,
    film_title: draft.filmTitle, director: draft.director,
    film_year: draft.filmYear, featured: draft.featured, published_at: draft.publishedAt,
    immutable: false, created_by: identity.id,
  }).select("id").single();
  if (revisionError || !revision) return NextResponse.json({ error: revisionError?.message ?? "Could not create the working revision." }, { status: 500 });

  const { error: updateError } = await supabase.from("film_posts").update({ working_revision_id: revision.id }).eq("id", post.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ post }, { status: 201 });
}
