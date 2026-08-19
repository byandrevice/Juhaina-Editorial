export type ProjectionEssay = {
  slug: string;
  title: string;
  excerpt: string;
  subjectTitle: string;
  creator: string;
  subjectYear: number;
  publishedAt: string;
  readingTime: number;
  still: {
    src: string;
    alt: string;
    focalX: number;
    focalY: number;
    zoom?: number;
  };
};

export const projectionEssays: ProjectionEssay[] = [
  {
    slug: "the-empty-room-in-aftersun",
    title: "The Empty Room in Aftersun",
    excerpt: "Memory, grief, and the image that arrives too late.",
    subjectTitle: "Aftersun",
    creator: "Charlotte Wells",
    subjectYear: 2022,
    publishedAt: "2026-07-22",
    readingTime: 14,
    still: {
      src: "/images/projections/mirrors-edge/01.webp",
      alt: "A glass-walled interior overlooks a night city under cool green light",
      focalX: 0.5,
      focalY: 0.5,
    },
  },
  {
    slug: "perfect-days-repeated",
    title: "Perfect Days, Repeated",
    excerpt: "Wim Wenders and the discipline of attention.",
    subjectTitle: "Perfect Days",
    creator: "Wim Wenders",
    subjectYear: 2023,
    publishedAt: "2026-07-09",
    readingTime: 11,
    still: {
      src: "/images/projections/mirrors-edge/02.webp",
      alt: "A runner looks down across white rooftops marked by vivid orange paths",
      focalX: 0.58,
      focalY: 0.5,
    },
  },
  {
    slug: "the-beast-has-no-present",
    title: "The Beast Has No Present",
    excerpt: "Desire, technology, and fear across three eras.",
    subjectTitle: "The Beast",
    creator: "Bertrand Bonello",
    subjectYear: 2023,
    publishedAt: "2026-06-28",
    readingTime: 16,
    still: {
      src: "/images/projections/mirrors-edge/03.webp",
      alt: "A bright yellow industrial stairway leads toward a red equipment box",
      focalX: 0.5,
      focalY: 0.52,
    },
  },
  {
    slug: "all-we-imagine-as-light",
    title: "All We Imagine as Light",
    excerpt: "Friendship, solitude, and the private life of a city.",
    subjectTitle: "All We Imagine as Light",
    creator: "Payal Kapadia",
    subjectYear: 2024,
    publishedAt: "2026-06-11",
    readingTime: 12,
    still: {
      src: "/images/projections/mirrors-edge/04.webp",
      alt: "A vast yellow-and-white shopping atrium rises around empty balconies",
      focalX: 0.5,
      focalY: 0.5,
    },
  },
  {
    slug: "i-saw-the-tv-glow-and-the-long-goodbye",
    title: "I Saw the TV Glow and the Long Goodbye",
    excerpt: "Adolescence remembered through haunted media.",
    subjectTitle: "I Saw the TV Glow",
    creator: "Jane Schoenbrun",
    subjectYear: 2024,
    publishedAt: "2026-05-30",
    readingTime: 13,
    still: {
      src: "/images/projections/mirrors-edge/05.webp",
      alt: "White rooftops and blue glass towers stretch beneath a clear sky",
      focalX: 0.5,
      focalY: 0.5,
    },
  },
  {
    slug: "do-not-expect-too-much-from-the-end-of-the-world",
    title: "Do Not Expect Too Much from the End of the World",
    excerpt: "Work, exhaustion, performance, and the image economy.",
    subjectTitle: "Do Not Expect Too Much…",
    creator: "Radu Jude",
    subjectYear: 2023,
    publishedAt: "2026-05-17",
    readingTime: 18,
    still: {
      src: "/images/projections/mirrors-edge/06.webp",
      alt: "A lone runner stands above a sprawling white city of rooftops and towers",
      focalX: 0.68,
      focalY: 0.5,
    },
  },
];

export function orderedProjectionEssays() {
  return [...projectionEssays].sort((first, second) =>
    second.publishedAt.localeCompare(first.publishedAt),
  );
}

export function projectionPublicationDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
