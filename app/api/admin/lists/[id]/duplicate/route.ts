import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: source } = await supabase.from("list_posts").select("slug, working_revision_id").eq("id", id).single();
  if (!source?.working_revision_id) return NextResponse.json({ error: "List not found." }, { status: 404 });
  const { data: revision } = await supabase.from("list_revisions").select("title,type_label,type_slug,period_label,period_slug,artwork_ratio,creator_label,show_ranks").eq("id", source.working_revision_id).single();
  if (!revision) return NextResponse.json({ error: "Working list not found." }, { status: 404 });
  const { data: post, error: postError } = await supabase.from("list_posts").insert({ slug: `${source.slug}-copy-${nanoid(5).toLowerCase()}`, author_id: identity.id, status: "draft" }).select("id").single();
  if (postError || !post) return NextResponse.json({ error: postError?.message ?? "Could not duplicate this list." }, { status: 500 });
  const { data: copy, error: revisionError } = await supabase.from("list_revisions").insert({ post_id: post.id, revision_number: 1, title: `${revision.title} (copy)`, type_label: revision.type_label, type_slug: revision.type_slug, period_label: revision.period_label, period_slug: revision.period_slug, artwork_ratio: revision.artwork_ratio, creator_label: revision.creator_label, show_ranks: revision.show_ranks, immutable: false, created_by: identity.id }).select("id").single();
  if (revisionError || !copy) return NextResponse.json({ error: revisionError?.message ?? "Could not duplicate this list." }, { status: 500 });
  const { data: items } = await supabase.from("list_items").select("stable_item_id,position,title,creator,item_year,image_asset_id,image_position_x,image_position_y,image_zoom,image_alt,external_url").eq("revision_id", source.working_revision_id).order("position");
  if (items?.length) await supabase.from("list_items").insert(items.map((item) => ({ ...item, revision_id: copy.id, stable_item_id: crypto.randomUUID() })));
  await supabase.from("list_posts").update({ working_revision_id: copy.id }).eq("id", post.id);
  return NextResponse.json({ post: { id: post.id } }, { status: 201 });
}
