import { FilmEditor } from "@/components/admin/film-editor";
import { blankFilmDraft } from "@/lib/admin/film-schema";
import { isLocalAdminDemo } from "@/lib/supabase/config";

export default async function NewFilmPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft } = await searchParams;
  return <FilmEditor initialData={blankFilmDraft} demo={isLocalAdminDemo()} draftKey={draft ?? "new"} />;
}
