import { FilmEditor } from "@/components/admin/film-editor";
import { getFilmForEditing } from "@/lib/admin/films-server";

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialData = await getFilmForEditing(id);
  return <FilmEditor initialData={initialData} demo={false} draftKey={id} />;
}

