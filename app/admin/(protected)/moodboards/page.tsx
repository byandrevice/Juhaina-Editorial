import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { MoodboardCategoryManager } from "@/components/admin/moodboard-category-manager";
import { MoodboardContentList } from "@/components/admin/moodboard-content-list";
import { isLocalAdminDemo } from "@/lib/supabase/config";

export default function AdminMoodboardsPage() {
  const demo = isLocalAdminDemo();
  return <main className="admin-page admin-moodboards-page"><header className="admin-page-header"><div><p className="admin-eyebrow">Content</p><h1>Moodboards</h1><p>Compose visual collections and organize how readers browse them.</p></div><Link className="admin-link-button" href="/admin/moodboards/new"><Plus /> New moodboard</Link></header><MoodboardContentList demo={demo} /><MoodboardCategoryManager demo={demo} /></main>;
}
