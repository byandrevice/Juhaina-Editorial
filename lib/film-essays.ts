export type FilmEssay = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  filmTitle: string;
  director: string;
  filmYear: number;
  featured: boolean;
  imageSrc?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
};

export const filmEssays: FilmEssay[] = [
  {
    slug: "the-empty-room-in-aftersun",
    title: "The Empty Room in Aftersun",
    publishedAt: "2026-07-22",
    excerpt: "Memory, grief, and the image that arrives too late.",
    filmTitle: "Aftersun",
    director: "Charlotte Wells",
    filmYear: 2022,
    featured: true,
    imageSrc: "/images/film-placeholders/aftersun-placeholder.webp",
  },
  {
    slug: "perfect-days-repeated",
    title: "Perfect Days, Repeated",
    publishedAt: "2026-07-09",
    excerpt: "Wim Wenders and the discipline of attention.",
    filmTitle: "Perfect Days",
    director: "Wim Wenders",
    filmYear: 2023,
    featured: false,
    imageSrc: "/images/film-placeholders/perfect-days-placeholder.webp",
  },
  {
    slug: "the-beast-has-no-present",
    title: "The Beast Has No Present",
    publishedAt: "2026-06-28",
    excerpt: "Desire, technology, and fear across three eras.",
    filmTitle: "The Beast",
    director: "Bertrand Bonello",
    filmYear: 2023,
    featured: false,
    imageSrc: "/images/film-placeholders/the-beast-placeholder.webp",
  },
  {
    slug: "all-we-imagine-as-light",
    title: "All We Imagine as Light",
    publishedAt: "2026-06-11",
    excerpt: "Friendship, solitude, and the private life of a city.",
    filmTitle: "All We Imagine as Light",
    director: "Payal Kapadia",
    filmYear: 2024,
    featured: false,
    imageSrc: "/images/film-placeholders/all-we-imagine-placeholder.webp",
  },
  {
    slug: "i-saw-the-tv-glow-and-the-long-goodbye",
    title: "I Saw the TV Glow and the Long Goodbye",
    publishedAt: "2026-05-30",
    excerpt: "Adolescence remembered through haunted media.",
    filmTitle: "I Saw the TV Glow",
    director: "Jane Schoenbrun",
    filmYear: 2024,
    featured: false,
    imageSrc: "/images/film-placeholders/tv-glow-placeholder.webp",
  },
  {
    slug: "do-not-expect-too-much-from-the-end-of-the-world",
    title: "Do Not Expect Too Much from the End of the World",
    publishedAt: "2026-05-17",
    excerpt: "Work, exhaustion, performance, and the image economy.",
    filmTitle: "Do Not Expect Too Much from the End of the World",
    director: "Radu Jude",
    filmYear: 2023,
    featured: false,
    imageSrc: "/images/film-placeholders/end-of-world-placeholder.webp",
  },
];

export function orderFilmEssays(essays: FilmEssay[]) {
  return [...essays].sort((first, second) => {
    if (first.featured !== second.featured) {
      return Number(second.featured) - Number(first.featured);
    }

    return second.publishedAt.localeCompare(first.publishedAt);
  });
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ordinalSuffix(day: number) {
  const finalTwoDigits = day % 100;

  if (finalTwoDigits >= 11 && finalTwoDigits <= 13) return "th";

  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

export function formatPublicationDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${monthNames[month - 1]} ${day}${ordinalSuffix(day)}, ${year}`;
}
