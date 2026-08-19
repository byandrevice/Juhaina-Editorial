import { moodboardCategories, type MoodboardCategory } from "./moodboards-data";
import { getHiddenFixtureKeys } from "./fixture-visibility";
import { hasSupabaseConfig } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

type PublishedPost = {
  id: string;
  slug: string;
  published_category_id: string;
  position: number;
  published_revision_id: string;
  updated_at: string;
};

type PublishedRevision = {
  id: string;
  title: string;
  preview_asset_id: string;
  full_asset_id: string;
  updated_at: string;
};

type PublishedAsset = {
  id: string;
  storage_path: string;
  byte_size: number;
};

export async function getPublishedMoodboardCategories(): Promise<MoodboardCategory[]> {
  if (!hasSupabaseConfig()) return moodboardCategories;
  const hidden = await getHiddenFixtureKeys("moodboards");
  if (!hidden) return [];
  const samples = moodboardCategories.map((category) => ({
    ...category,
    boards: category.boards.filter((board) => !hidden.has(`${category.slug}:${board.slug}`)),
  })).filter((category) => category.boards.length > 0);

  try {
    const supabase = createPublicClient();
    const [{ data: categories, error: categoryError }, { data: posts, error: postError }] = await Promise.all([
      supabase.from("moodboard_categories").select("id, slug, name, position").order("position"),
      supabase.from("moodboard_posts")
        .select("id, slug, published_category_id, position, published_revision_id, updated_at")
        .in("status", ["published", "published_with_changes"])
        .order("position"),
    ]);

    if (categoryError || postError || !categories?.length || !posts?.length) return samples;

    const publishedPosts = posts as PublishedPost[];
    const revisionIds = publishedPosts.map((post) => post.published_revision_id).filter(Boolean);
    const { data: revisions, error: revisionError } = await supabase.from("moodboard_revisions")
      .select("id, title, preview_asset_id, full_asset_id, updated_at")
      .in("id", revisionIds);
    if (revisionError || !revisions?.length) return samples;

    const publishedRevisions = revisions as PublishedRevision[];
    const assetIds = Array.from(new Set(publishedRevisions.flatMap((revision) => [revision.preview_asset_id, revision.full_asset_id]).filter(Boolean)));
    const { data: assets, error: assetError } = await supabase.from("assets")
      .select("id, storage_path, byte_size")
      .in("id", assetIds);
    if (assetError || !assets?.length) return samples;

    const assetById = new Map((assets as PublishedAsset[]).map((asset) => [asset.id, asset]));
    const signed = new Map<string, string>();
    await Promise.all((assets as PublishedAsset[]).map(async (asset) => {
      const { data } = await supabase.storage.from("editorial-images").createSignedUrl(asset.storage_path, 60 * 60 * 24);
      if (data?.signedUrl) signed.set(asset.id, data.signedUrl);
    }));

    const postByRevision = new Map(publishedPosts.map((post) => [post.published_revision_id, post]));
    const boards = publishedRevisions.flatMap((revision) => {
      const post = postByRevision.get(revision.id);
      const previewAsset = assetById.get(revision.preview_asset_id);
      const fullAsset = assetById.get(revision.full_asset_id);
      const previewUrl = signed.get(revision.preview_asset_id);
      const fullUrl = signed.get(revision.full_asset_id);
      if (!post || !previewAsset || !fullAsset || !previewUrl || !fullUrl) return [];
      return [{
        categoryId: post.published_category_id,
        board: {
          id: post.id,
          slug: post.slug,
          title: revision.title,
          order: post.position,
          preview: { url: previewUrl, width: 800, height: 450 },
          full: { url: fullUrl, width: 1600, height: 900 },
          mediaWeightBytes: previewAsset.byte_size + fullAsset.byte_size,
          updatedAt: revision.updated_at ?? post.updated_at,
        },
      }];
    });

    const populated = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      order: category.position,
      boards: boards
        .filter((entry) => entry.categoryId === category.id)
        .map((entry) => entry.board)
        .sort((a, b) => a.order - b.order),
    })).filter((category) => category.boards.length > 0);

    const databaseSlugs = new Set(populated.flatMap((category) => category.boards.map((board) => board.slug)));
    const merged = populated.map((category) => {
      const sampleCategory = samples.find((sample) => sample.slug === category.slug);
      return {
        ...category,
        boards: [
          ...category.boards,
          ...(sampleCategory?.boards ?? []).filter((board) => !databaseSlugs.has(board.slug)),
        ].sort((first, second) => first.order - second.order),
      };
    });
    const populatedCategorySlugs = new Set(populated.map((category) => category.slug));
    return [
      ...merged,
      ...samples.filter((category) => !populatedCategorySlugs.has(category.slug)),
    ].sort((first, second) => first.order - second.order);
  } catch {
    return samples;
  }
}
