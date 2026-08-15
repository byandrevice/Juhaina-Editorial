import { MoodboardEditor } from "@/components/admin/moodboard-editor";
import { fallbackAdminMoodboardCategories } from "@/lib/admin/moodboard-draft-storage";
import { blankMoodboardDraft } from "@/lib/admin/moodboard-schema";
import { getMoodboardCategories } from "@/lib/admin/moodboards-server";
import { isLocalAdminDemo } from "@/lib/supabase/config";

export default async function NewMoodboardPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams; const demo = isLocalAdminDemo();
  const categories = demo ? fallbackAdminMoodboardCategories : await getMoodboardCategories();
  return <MoodboardEditor initialData={blankMoodboardDraft(categories[0]?.id ?? "")} categories={categories} demo={demo} draftKey={draft ?? "new"} />;
}
