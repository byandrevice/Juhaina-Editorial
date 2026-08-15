import { MoodboardBrowser } from "@/components/moodboard-browser";
import { getPublishedMoodboardCategories } from "@/lib/published-moodboards";

export default async function MoodboardsPage() {
  const categories = await getPublishedMoodboardCategories();
  return <MoodboardBrowser categories={categories} />;
}
