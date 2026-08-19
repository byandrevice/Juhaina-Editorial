import { notFound } from "next/navigation";
import { FilmIndex } from "@/components/film-index";
import { ProjectionIndex } from "@/components/projection-index";
import { getPublicFilmEssays } from "@/lib/films-data";

const sections = new Set(["films", "projections"]);

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  return Array.from(sections, (section) => ({ section }));
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;

  if (!sections.has(section)) {
    notFound();
  }

  if (section === "films") {
    const essays = await getPublicFilmEssays();
    return <FilmIndex essays={essays} />;
  }

  return <ProjectionIndex />;
}
