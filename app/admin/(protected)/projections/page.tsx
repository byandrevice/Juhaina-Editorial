import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ProjectionContentList } from "@/components/admin/projection-content-list";

export default function AdminProjectionsPage() {
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-eyebrow">Content</p><h1>Projections</h1><p>Draft and publish writing on culture and current events.</p></div><Link className="admin-link-button" href="/admin/projections/new"><Plus aria-hidden="true" /> New projection</Link></header><ProjectionContentList /></main>;
}

