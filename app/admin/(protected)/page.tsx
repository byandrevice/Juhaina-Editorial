import { ArrowRight, ImageSquare, ListNumbers, Newspaper, NotePencil } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { AdminDraftRecovery } from "@/components/admin/admin-draft-recovery";

export default function AdminDashboardPage() {
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-eyebrow">Workspace</p><h1>What would you like to work on?</h1><p>Everything for Second Viewing lives here, organized by section.</p></div>
        <Link className="admin-link-button" href="/admin/films/new"><NotePencil aria-hidden="true" /> New film essay</Link>
      </header>

      <section className="admin-section-grid" aria-label="Editorial sections">
        <Link className="admin-section-card admin-section-card--active" href="/admin/films">
          <Newspaper aria-hidden="true" /><div><span>Ready</span><h2>Film Thoughts</h2><p>Write, revise, feature, and publish film criticism.</p></div><ArrowRight aria-hidden="true" />
        </Link>
        <Link className="admin-section-card admin-section-card--active" href="/admin/moodboards"><ImageSquare aria-hidden="true" /><div><span>Ready</span><h2>Moodboards</h2><p>Arrange, organize, and publish visual collections.</p></div><ArrowRight aria-hidden="true" /></Link>
        <article className="admin-section-card"><NotePencil aria-hidden="true" /><div><span>Coming later</span><h2>Projections</h2><p>Publish writing on culture and current events.</p></div></article>
        <Link className="admin-section-card admin-section-card--active" href="/admin/lists"><ListNumbers aria-hidden="true" /><div><span>Ready</span><h2>Lists</h2><p>Build, reorder, and publish ranked or unranked collections.</p></div><ArrowRight aria-hidden="true" /></Link>
      </section>

      <AdminDraftRecovery />
    </main>
  );
}
