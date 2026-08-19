import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { emptyDocument } from "./film-schema";

export const projectionDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Add a headline.").max(160),
  excerpt: z.string().trim().max(280),
  body: z.custom<JSONContent>((value) => {
    if (!value || typeof value !== "object") return false;
    const document = value as { type?: unknown; content?: unknown };
    return document.type === "doc" && (document.content === undefined || Array.isArray(document.content));
  }, "Article body is invalid."),
  coverAssetId: z.string().uuid().nullable(),
  coverPositionX: z.number().min(0).max(100),
  coverPositionY: z.number().min(0).max(100),
  coverZoom: z.number().min(1).max(3),
  imageAlt: z.string().trim().max(300),
  subjectTitle: z.string().trim().max(160),
  creator: z.string().trim().max(160),
  subjectYear: z.number().int().min(1000).max(2200).nullable(),
  readingTime: z.number().int().min(1).max(120),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export type ProjectionDraft = z.infer<typeof projectionDraftSchema>;

export const blankProjectionDraft: ProjectionDraft = {
  title: "",
  excerpt: "",
  body: emptyDocument,
  coverAssetId: null,
  coverPositionX: 50,
  coverPositionY: 50,
  coverZoom: 1,
  imageAlt: "",
  subjectTitle: "",
  creator: "",
  subjectYear: null,
  readingTime: 5,
  publishedAt: null,
};

export type ProjectionEditorInitialData = ProjectionDraft & {
  id?: string;
  slug?: string;
  status?: string;
  coverUrl?: string | null;
};

