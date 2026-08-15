import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmIndex } from "@/components/film-index";
import { getPublishedFilmEssays } from "@/lib/films-data";

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
    const essays = await getPublishedFilmEssays();
    return <FilmIndex essays={essays} />;
  }

  return (
    <main className="section-placeholder">
      <p>{section}</p>
      <Link href="/">back to second viewing</Link>
    </main>
  );
}
