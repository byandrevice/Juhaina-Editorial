import { ListEditor } from "@/components/admin/list-editor";
import { blankListDraft } from "@/lib/admin/list-schema";
import { isLocalAdminDemo } from "@/lib/supabase/config";

export default async function NewListPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  return <ListEditor initialData={blankListDraft} demo={isLocalAdminDemo()} draftKey={draft ?? "new"} />;
}
