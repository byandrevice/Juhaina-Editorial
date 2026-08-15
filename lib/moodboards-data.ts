export type Moodboard = {
  id: string;
  slug: string;
  title: string;
  order: number;
  preview: { url: string; width: number; height: number };
  full: { url: string; width: number; height: number };
  mediaWeightBytes: number;
  updatedAt: string;
};

export type MoodboardCategory = {
  id: string;
  slug: string;
  name: string;
  order: number;
  boards: Moodboard[];
};

const board = (
  category: string,
  slug: string,
  title: string,
  order: number,
  image: string,
): Moodboard => ({
  id: `${category}-${slug}`,
  slug,
  title,
  order,
  preview: { url: image, width: 1536, height: 864 },
  full: { url: image, width: 1536, height: 864 },
  mediaWeightBytes: 0,
  updatedAt: "2026-08-13T00:00:00.000Z",
});

export const moodboardCategories: MoodboardCategory[] = [
  {
    id: "memory",
    slug: "memory",
    name: "Memory",
    order: 1,
    boards: [
      board("memory", "after-the-light", "After the Light", 1, "/images/moodboards/after-the-light.jpg"),
      board("memory", "private-archives", "Private Archives", 2, "/images/moodboards/private-archives.jpg"),
      board("memory", "summer-cinema", "Summer Cinema", 3, "/images/moodboards/summer-cinema.jpg"),
    ],
  },
  {
    id: "material",
    slug: "material",
    name: "Material",
    order: 2,
    boards: [
      board("material", "domestic-ritual", "Domestic Ritual", 1, "/images/moodboards/domestic-ritual.jpg"),
      board("material", "clothing-as-architecture", "Clothing as Architecture", 2, "/images/moodboards/clothing-as-architecture.jpg"),
      board("material", "flowers-as-evidence", "Flowers as Evidence", 3, "/images/moodboards/flowers-as-evidence.jpg"),
    ],
  },
  {
    id: "place",
    slug: "place",
    name: "Place",
    order: 3,
    boards: [
      board("place", "city-after-rain", "City After Rain", 1, "/images/moodboards/city-after-rain.jpg"),
      board("place", "thresholds", "Thresholds", 2, "/images/moodboards/thresholds.jpg"),
      board("place", "the-written-margin", "The Written Margin", 3, "/images/moodboards/the-written-margin.jpg"),
    ],
  },
];
