import { ProjectionEditor } from "@/components/admin/projection-editor";
import { getProjectionForEditing } from "@/lib/admin/projections-server";

export default async function EditProjectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectionEditor initialData={await getProjectionForEditing(id)} demo={false} draftKey={id} />;
}
