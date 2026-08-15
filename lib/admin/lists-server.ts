import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ArtworkRatio } from "@/lib/lists-data";
import type { ListEditorInitialData } from "./list-schema";

export async function getListForEditing(id: string): Promise<ListEditorInitialData> {
  const supabase = await createClient();
  const { data: post } = await supabase.from("list_posts")
    .select("id, slug, status, working_revision_id").eq("id", id).single();
  if (!post?.working_revision_id) notFound();
  const { data: revision } = await supabase.from("list_revisions")
    .select("id, title, type_label, period_label, artwork_ratio, creator_label, show_ranks")
    .eq("id", post.working_revision_id).single();
  if (!revision) notFound();
  const { data: rows } = await supabase.from("list_items")
    .select("stable_item_id, title, creator, item_year, image_asset_id, image_position_x, image_position_y, image_zoom, image_alt, external_url, assets(storage_path)")
    .eq("revision_id", revision.id).order("position");
  const items = await Promise.all((rows ?? []).map(async (row) => {
    const asset = row.assets as unknown as { storage_path?: string } | null;
    let imageUrl = "";
    if (asset?.storage_path) {
      const { data } = await supabase.storage.from("editorial-images").createSignedUrl(asset.storage_path, 3600);
      imageUrl = data?.signedUrl ?? "";
    }
    return {
      stableItemId: row.stable_item_id,
      title: row.title,
      creator: row.creator,
      year: row.item_year,
      imageAssetId: row.image_asset_id,
      imageUrl,
      imagePositionX: Number(row.image_position_x),
      imagePositionY: Number(row.image_position_y),
      imageZoom: Number(row.image_zoom),
      imageAlt: row.image_alt,
      externalUrl: row.external_url ?? "",
    };
  }));
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    title: revision.title,
    typeLabel: revision.type_label,
    periodLabel: revision.period_label,
    artworkRatio: revision.artwork_ratio as ArtworkRatio,
    creatorLabel: revision.creator_label,
    showRanks: revision.show_ranks,
    items,
  };
}
