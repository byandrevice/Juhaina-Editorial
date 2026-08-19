import { filmEssays } from "./film-essays";
import { getFallbackLists } from "./lists-data";
import { moodboardCategories } from "./moodboards-data";
import { projectionEssays } from "./projection-essays";

export type FixtureSection = "films" | "lists" | "moodboards" | "projections";

export type FixtureEntry = {
  section: FixtureSection;
  key: string;
  title: string;
  detail: string;
};

export const fixtureEntries: FixtureEntry[] = [
  ...filmEssays.map((essay) => ({
    section: "films" as const,
    key: essay.slug,
    title: essay.title,
    detail: `${essay.filmTitle} · ${essay.publishedAt}`,
  })),
  ...projectionEssays.map((essay) => ({
    section: "projections" as const,
    key: essay.slug,
    title: essay.title,
    detail: `${essay.subjectTitle} · ${essay.publishedAt}`,
  })),
  ...getFallbackLists().map((list) => ({
    section: "lists" as const,
    key: `${list.typeSlug}:${list.periodSlug}`,
    title: list.title,
    detail: `${list.typeLabel} · ${list.periodLabel}`,
  })),
  ...moodboardCategories.flatMap((category) => category.boards.map((board) => ({
    section: "moodboards" as const,
    key: `${category.slug}:${board.slug}`,
    title: board.title,
    detail: category.name,
  }))),
];

