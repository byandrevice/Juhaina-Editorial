import { ListEditor } from "@/components/admin/list-editor";
import { getListForEditing } from "@/lib/admin/lists-server";

export default async function EditListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListEditor initialData={await getListForEditing(id)} demo={false} draftKey={id} />;
}
