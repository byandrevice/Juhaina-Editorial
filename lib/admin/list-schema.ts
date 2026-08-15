import { z } from "zod";
import { slugifyListLabel, type ArtworkRatio } from "@/lib/lists-data";

export const artworkRatioOptions: Array<{ value: ArtworkRatio; label: string; short: string }> = [
  { value: "poster_2_3", label: "2:3 — Movie poster", short: "2:3" },
  { value: "book_5_8", label: "5:8 — Book cover", short: "5:8" },
  { value: "square_1_1", label: "1:1 — Album artwork", short: "1:1" },
  { value: "landscape_16_9", label: "16:9 — Landscape / widescreen", short: "16:9" },
];

export const listItemSchema = z.object({
  stableItemId: z.string().uuid(),
  title: z.string().trim().min(1, "Add an item title.").max(180),
  creator: z.string().trim().max(180),
  year: z.string().trim().max(80),
  imageAssetId: z.string().uuid().nullable(),
  imageUrl: z.string().optional(),
  imagePositionX: z.number().min(0).max(100),
  imagePositionY: z.number().min(0).max(100),
  imageZoom: z.number().min(1).max(3),
  imageAlt: z.string().trim().max(300),
  externalUrl: z.union([z.literal(""), z.string().url("Use a complete link beginning with https://").max(2048)]),
}).superRefine((item, context) => {
  if ((item.imageAssetId || item.imageUrl) && !item.imageAlt) {
    context.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the artwork for readers using assistive technology." });
  }
});

export const listDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Add a list title.").max(160),
  typeLabel: z.string().trim().min(1, "Add a type.").max(80),
  periodLabel: z.string().trim().min(1, "Add a period.").max(80),
  artworkRatio: z.enum(["poster_2_3", "book_5_8", "square_1_1", "landscape_16_9"]),
  creatorLabel: z.string().trim().min(1, "Name the creator field.").max(50),
  showRanks: z.boolean(),
  items: z.array(listItemSchema).min(1, "Add at least one item.").max(20, "Lists can contain up to 20 items."),
});

export type ListDraft = z.infer<typeof listDraftSchema>;
export type ListDraftItem = z.infer<typeof listItemSchema>;
export type ListEditorInitialData = ListDraft & { id?: string; slug?: string; status?: string };

export function newListItem(): ListDraftItem {
  return {
    stableItemId: crypto.randomUUID(),
    title: "",
    creator: "",
    year: "",
    imageAssetId: null,
    imageUrl: "",
    imagePositionX: 50,
    imagePositionY: 50,
    imageZoom: 1,
    imageAlt: "",
    externalUrl: "",
  };
}

export const blankListDraft: ListEditorInitialData = {
  title: "Favorite Films of 2024",
  typeLabel: "Films",
  periodLabel: "2024",
  artworkRatio: "poster_2_3",
  creatorLabel: "Director",
  showRanks: true,
  items: [newListItem()],
};

export function listDraftForDatabase(draft: ListDraft) {
  return {
    title: draft.title,
    type_label: draft.typeLabel,
    type_slug: slugifyListLabel(draft.typeLabel, "type"),
    period_label: draft.periodLabel,
    period_slug: draft.periodLabel.toLowerCase() === "all time" ? "all" : slugifyListLabel(draft.periodLabel, "period"),
    artwork_ratio: draft.artworkRatio,
    creator_label: draft.creatorLabel,
    show_ranks: draft.showRanks,
  };
}

export function listItemsForDatabase(revisionId: string, items: ListDraftItem[]) {
  return items.map((item, index) => ({
    revision_id: revisionId,
    stable_item_id: item.stableItemId,
    position: index + 1,
    title: item.title,
    creator: item.creator,
    item_year: item.year,
    image_asset_id: item.imageAssetId,
    image_position_x: item.imagePositionX,
    image_position_y: item.imagePositionY,
    image_zoom: item.imageZoom,
    image_alt: item.imageAlt,
    external_url: item.externalUrl || null,
  }));
}
