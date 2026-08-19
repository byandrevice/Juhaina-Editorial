import { ProjectionEditor } from "@/components/admin/projection-editor";
import { blankProjectionDraft } from "@/lib/admin/projection-schema";
import { isLocalAdminDemo } from "@/lib/supabase/config";

export default async function NewProjectionPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  return <ProjectionEditor initialData={blankProjectionDraft} demo={isLocalAdminDemo()} draftKey={draft ?? "new"} />;
}

