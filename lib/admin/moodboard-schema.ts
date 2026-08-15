import { z } from "zod";

export const MOODBOARD_WIDTH = 1600;
export const MOODBOARD_HEIGHT = 900;
export const MAX_MOODBOARD_LAYERS = 50;

export const moodboardLayerSchema = z.object({
  stableLayerId: z.string().uuid(),
  assetId: z.string().uuid().nullable(),
  imageUrl: z.string().optional(),
  name: z.string().trim().min(1).max(180),
  alt: z.string().trim().max(300),
  x: z.number().min(-1600).max(3200),
  y: z.number().min(-900).max(1800),
  width: z.number().min(24).max(3200),
  height: z.number().min(24).max(1800),
  rotation: z.number().min(-180).max(180),
  opacity: z.number().min(0.05).max(1),
  visible: z.boolean(),
  locked: z.boolean(),
});

export const moodboardDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Add a moodboard title.").max(160),
  categoryId: z.string().uuid("Choose a category."),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color."),
  previewAssetId: z.string().uuid().nullable(),
  fullAssetId: z.string().uuid().nullable(),
  layers: z.array(moodboardLayerSchema).max(MAX_MOODBOARD_LAYERS, "Moodboards can contain up to 50 image layers."),
});

export const moodboardPublishSchema = moodboardDraftSchema.superRefine((draft, context) => {
  draft.layers.forEach((layer, index) => {
    if ((layer.assetId || layer.imageUrl) && !layer.alt.trim()) {
      context.addIssue({ code: "custom", path: ["layers", index, "alt"], message: `Describe ${layer.name} before publishing.` });
    }
  });
});

export type MoodboardLayerDraft = z.infer<typeof moodboardLayerSchema>;
export type MoodboardDraft = z.infer<typeof moodboardDraftSchema>;
export type MoodboardEditorInitialData = MoodboardDraft & { id?: string; slug?: string; status?: string };
export type AdminMoodboardCategory = { id: string; name: string; slug: string; position: number; boardCount?: number };

export function blankMoodboardDraft(categoryId: string): MoodboardEditorInitialData {
  return {
    title: "",
    categoryId,
    backgroundColor: "#F1EFE9",
    previewAssetId: null,
    fullAssetId: null,
    layers: [],
  };
}

export function moodboardRevisionForDatabase(draft: MoodboardDraft) {
  return {
    title: draft.title,
    background_color: draft.backgroundColor.toUpperCase(),
    preview_asset_id: draft.previewAssetId,
    full_asset_id: draft.fullAssetId,
  };
}

export function moodboardLayersForDatabase(revisionId: string, layers: MoodboardLayerDraft[]) {
  return layers.map((layer, index) => ({
    revision_id: revisionId,
    stable_layer_id: layer.stableLayerId,
    position: index + 1,
    asset_id: layer.assetId,
    name: layer.name,
    alt_text: layer.alt,
    x: layer.x,
    y: layer.y,
    layer_width: layer.width,
    layer_height: layer.height,
    rotation: layer.rotation,
    opacity: layer.opacity,
    visible: layer.visible,
    locked: layer.locked,
  }));
}
