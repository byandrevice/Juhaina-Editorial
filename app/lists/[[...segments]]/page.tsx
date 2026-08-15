import { ListsHalo } from "@/components/lists-halo";
import { getPublishedListCollections } from "@/lib/published-lists";
import { redirect } from "next/navigation";

type ListsPageProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function ListsPage({ params, searchParams }: ListsPageProps) {
  const { segments = [] } = await params;
  const query = await searchParams;
  const collections = await getPublishedListCollections();
  const typeOptions = Array.from(new Map(collections.map((list) => [list.typeSlug, list.typeLabel])).entries());
  const typeMatch = typeOptions.find(([slug]) => slug === segments[0]) ?? typeOptions[0];
  if (!typeMatch) redirect("/");
  if (segments[0] && typeMatch[0] !== segments[0]) redirect(`/lists/${typeMatch[0]}/${segments[1] ?? "2024"}`);
  const matchingType = collections.filter((list) => list.typeSlug === typeMatch[0]);
  const periodMatch = matchingType.find((list) => list.periodSlug === segments[1]) ?? matchingType[0];
  if (!periodMatch) redirect("/");
  const type = typeMatch[1];
  const year = periodMatch.periodLabel;
  const rank = /^\d{1,2}$/.test(segments[2] ?? "") ? segments[2] : null;
  return <ListsHalo collections={collections} initialType={type} initialYear={year} initialRank={rank} initialListView={query.view === "list"} />;
}
