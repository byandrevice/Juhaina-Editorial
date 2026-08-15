import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: source } = await supabase.from("moodboard_posts")
    .select("slug, category_id, working_revision_id").eq("id", id).single();
  if (!source?.working_revision_id) return NextResponse.json({ error: "Moodboard not found." }, { status: 404 });
  const { data: revision } = await supabase.from("moodboard_revisions")
    .select("title, background_color, preview_asset_id, full_asset_id").eq("id", source.working_revision_id).single();
  if (!revision) return NextResponse.json({ error: "Working moodboard not found." }, { status: 404 });
  const { data: last } = await supabase.from("moodboard_posts").select("position").eq("category_id", source.category_id).order("position", { ascending: false }).limit(1).maybeSingle();
  const { data: post, error: postError } = await supabase.from("moodboard_posts").insert({
    slug: `${source.slug}-copy-${nanoid(5).toLowerCase()}`, author_id: identity.id,
    category_id: source.category_id, position: (last?.position ?? 0) + 1, status: "draft",
  }).select("id").single();
  if (postError || !post) return NextResponse.json({ error: postError?.message ?? "Could not duplicate the moodboard." }, { status: 500 });
  const { data: copy, error: revisionError } = await supabase.from("moodboard_revisions").insert({
    post_id: post.id, revision_number: 1, title: `${revision.title} — Copy`, background_color: revision.background_color,
    preview_asset_id: revision.preview_asset_id, full_asset_id: revision.full_asset_id, immutable: false, created_by: identity.id,
  }).select("id").single();
  if (revisionError || !copy) return NextResponse.json({ error: revisionError?.message ?? "Could not duplicate the layout." }, { status: 500 });
  const { data: layers } = await supabase.from("moodboard_layers").select("stable_layer_id, position, asset_id, name, alt_text, x, y, layer_width, layer_height, rotation, opacity, visible, locked").eq("revision_id", source.working_revision_id).order("position");
  if (layers?.length) await supabase.from("moodboard_layers").insert(layers.map((layer) => ({ ...layer, revision_id: copy.id })));
  await supabase.from("moodboard_posts").update({ working_revision_id: copy.id }).eq("id", post.id);
  return NextResponse.json({ post: { id: post.id } }, { status: 201 });
}
