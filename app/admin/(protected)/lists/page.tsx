import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { ListContentList } from "@/components/admin/list-content-list";

export default function AdminListsPage() {
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-eyebrow">Content</p><h1>Lists</h1><p>Create, arrange, publish, and revise collections.</p></div><Link className="admin-link-button" href="/admin/lists/new"><Plus aria-hidden="true" /> New list</Link></header><ListContentList /></main>;
}
