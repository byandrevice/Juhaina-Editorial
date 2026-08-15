import { getFallbackLists, type ArtworkRatio, type ListCollection } from "./lists-data";
import { hasSupabaseConfig } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

type PublishedRevision = {
  id: string;
  title: string;
  type_label: string;
  type_slug: string;
  period_label: string;
  period_slug: string;
  artwork_ratio: ArtworkRatio;
  creator_label: string;
  show_ranks: boolean;
};

type PublishedItem = {
  revision_id: string;
  position: number;
  title: string;
  creator: string;
  item_year: string;
  image_position_x: number;
  image_position_y: number;
  image_zoom: number;
  image_alt: string;
  external_url: string | null;
  assets: { storage_path: string } | null;
};

export async function getPublishedListCollections(): Promise<ListCollection[]> {
  if (!hasSupabaseConfig()) return getFallbackLists();
  try {
    const supabase = createPublicClient();
    const { data: posts, error } = await supabase.from("list_posts")
      .select("id, slug, published_revision_id")
      .in("status", ["published", "published_with_changes"]);
    if (error || !posts?.length) return getFallbackLists();

    const revisionIds = posts.map((post) => post.published_revision_id).filter(Boolean) as string[];
    const [{ data: revisions }, { data: items }] = await Promise.all([
      supabase.from("list_revisions")
        .select("id, title, type_label, type_slug, period_label, period_slug, artwork_ratio, creator_label, show_ranks")
        .in("id", revisionIds),
      supabase.from("list_items")
        .select("revision_id, position, title, creator, item_year, image_position_x, image_position_y, image_zoom, image_alt, external_url, assets(storage_path)")
        .in("revision_id", revisionIds)
        .order("position"),
    ]);
    if (!revisions?.length) return getFallbackLists();

    const paths = new Set((items ?? []).map((item) => (item.assets as unknown as { storage_path?: string } | null)?.storage_path).filter(Boolean) as string[]);
    const signed = new Map<string, string>();
    await Promise.all(Array.from(paths).map(async (path) => {
      const { data } = await supabase.storage.from("editorial-images").createSignedUrl(path, 60 * 60 * 24);
      if (data?.signedUrl) signed.set(path, data.signedUrl);
    }));

    const postByRevision = new Map(posts.map((post) => [post.published_revision_id, post]));
    return (revisions as PublishedRevision[]).map((revision) => {
      const post = postByRevision.get(revision.id);
      return {
        id: post?.id,
        slug: post?.slug,
        title: revision.title,
        typeLabel: revision.type_label,
        typeSlug: revision.type_slug,
        periodLabel: revision.period_label,
        periodSlug: revision.period_slug,
        artworkRatio: revision.artwork_ratio,
        creatorLabel: revision.creator_label,
        showRanks: revision.show_ranks,
        items: (items as unknown as PublishedItem[] ?? []).filter((item) => item.revision_id === revision.id).map((item) => {
          const path = item.assets?.storage_path;
          return {
            rank: String(item.position),
            title: item.title,
            creator: item.creator,
            year: item.item_year,
            note: "",
            tone: "#8d948f",
            image: path ? signed.get(path) : undefined,
            imagePositionX: Number(item.image_position_x),
            imagePositionY: Number(item.image_position_y),
            imageZoom: Number(item.image_zoom),
            imageAlt: item.image_alt,
            externalUrl: item.external_url ?? undefined,
          };
        }),
      };
    });
  } catch {
    return getFallbackLists();
  }
}
