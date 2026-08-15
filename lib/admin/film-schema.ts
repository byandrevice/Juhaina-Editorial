import type { JSONContent } from "@tiptap/react";
import { z } from "zod";

export const emptyDocument: JSONContent = { type: "doc", content: [] };

export const filmDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Add a headline.").max(160),
  subtitle: z.string().trim().max(280),
  body: z.custom<JSONContent>((value) => {
    if (!value || typeof value !== "object") return false;
    const document = value as { type?: unknown; content?: unknown };
    return document.type === "doc" && (document.content === undefined || Array.isArray(document.content));
  }, "Article body is invalid."),
  coverAssetId: z.string().uuid().nullable(),
  coverPositionX: z.number().min(0).max(100),
  coverPositionY: z.number().min(0).max(100),
  coverZoom: z.number().min(1).max(3),
  filmTitle: z.string().trim().max(160),
  director: z.string().trim().max(160),
  filmYear: z.number().int().min(1888).max(2200).nullable(),
  featured: z.boolean(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export type FilmDraft = z.infer<typeof filmDraftSchema>;

export const blankFilmDraft: FilmDraft = {
  title: "",
  subtitle: "",
  body: emptyDocument,
  coverAssetId: null,
  coverPositionX: 50,
  coverPositionY: 50,
  coverZoom: 1,
  filmTitle: "",
  director: "",
  filmYear: null,
  featured: false,
  publishedAt: null,
};

export type FilmEditorInitialData = FilmDraft & {
  id?: string;
  slug?: string;
  status?: string;
  coverUrl?: string | null;
};
