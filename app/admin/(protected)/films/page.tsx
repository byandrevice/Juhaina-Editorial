import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { FilmContentList } from "@/components/admin/film-content-list";

export default function AdminFilmsPage() {
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-eyebrow">Content</p><h1>Film Thoughts</h1><p>Drafts and published essays, all in one place.</p></div><Link className="admin-link-button" href="/admin/films/new"><Plus aria-hidden="true" /> New essay</Link></header><FilmContentList /></main>;
}

