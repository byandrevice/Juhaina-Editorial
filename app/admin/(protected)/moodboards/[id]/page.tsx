import { MoodboardEditor } from "@/components/admin/moodboard-editor";
import { getMoodboardCategories, getMoodboardForEditing } from "@/lib/admin/moodboards-server";

export default async function EditMoodboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [initialData, categories] = await Promise.all([getMoodboardForEditing(id), getMoodboardCategories()]);
  return <MoodboardEditor initialData={initialData} categories={categories} demo={false} draftKey={id} />;
}
