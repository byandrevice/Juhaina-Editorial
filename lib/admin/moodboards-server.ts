import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminIdentity } from "./auth";
import type { AdminMoodboardCategory, MoodboardEditorInitialData } from "./moodboard-schema";

export async function getMoodboardCategories(): Promise<AdminMoodboardCategory[]> {
  const supabase = await createClient();
  let { data } = await supabase.from("moodboard_categories")
    .select("id, name, slug, position")
    .order("position");
  if (!data?.length) {
    const identity = await getAdminIdentity();
    if (identity && !identity.demo) {
      await supabase.from("moodboard_categories").insert(["Memory", "Material", "Place"].map((name, index) => ({ owner_id: identity.id, name, slug: name.toLowerCase(), position: index + 1 })));
      const refreshed = await supabase.from("moodboard_categories").select("id, name, slug, position").order("position");
      data = refreshed.data;
    }
  }
  return Promise.all((data ?? []).map(async (row) => {
    const { count } = await supabase.from("moodboard_posts").select("id", { count: "exact", head: true })
      .or(`category_id.eq.${row.id},published_category_id.eq.${row.id}`);
    return { id: row.id, name: row.name, slug: row.slug, position: row.position, boardCount: count ?? 0 };
  }));
}

export async function getMoodboardForEditing(id: string): Promise<MoodboardEditorInitialData> {
  const supabase = await createClient();
  const { data: post } = await supabase.from("moodboard_posts")
    .select("id, slug, status, category_id, working_revision_id").eq("id", id).single();
  if (!post?.working_revision_id) notFound();
  const { data: revision } = await supabase.from("moodboard_revisions")
    .select("id, title, background_color, preview_asset_id, full_asset_id")
    .eq("id", post.working_revision_id).single();
  if (!revision) notFound();
  const { data: rows } = await supabase.from("moodboard_layers")
    .select("stable_layer_id, position, asset_id, name, alt_text, x, y, layer_width, layer_height, rotation, opacity, visible, locked, assets(storage_path)")
    .eq("revision_id", revision.id).order("position");
  const layers = await Promise.all((rows ?? []).map(async (row) => {
    const asset = row.assets as unknown as { storage_path?: string } | null;
    let imageUrl = "";
    if (asset?.storage_path) {
      const { data } = await supabase.storage.from("editorial-images").createSignedUrl(asset.storage_path, 3600);
      imageUrl = data?.signedUrl ?? "";
    }
    return {
      stableLayerId: row.stable_layer_id,
      assetId: row.asset_id,
      imageUrl,
      name: row.name,
      alt: row.alt_text,
      x: Number(row.x), y: Number(row.y), width: Number(row.layer_width), height: Number(row.layer_height),
      rotation: Number(row.rotation), opacity: Number(row.opacity), visible: row.visible, locked: row.locked,
    };
  }));
  return {
    id: post.id, slug: post.slug, status: post.status, categoryId: post.category_id,
    title: revision.title, backgroundColor: revision.background_color,
    previewAssetId: revision.preview_asset_id, fullAssetId: revision.full_asset_id, layers,
  };
}
