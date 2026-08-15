import { ArrowSquareOut, House, Images, ListBullets, Newspaper, SignOut } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminIdentity } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/sign-in");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin">Second Viewing <span>Admin</span></Link>
          <nav aria-label="Administration">
            <Link href="/admin"><House aria-hidden="true" /> Overview</Link>
            <Link href="/admin/films"><Newspaper aria-hidden="true" /> Film Thoughts</Link>
            <Link href="/admin/moodboards"><Images aria-hidden="true" /> Moodboards</Link>
            <Link href="/admin/lists"><ListBullets aria-hidden="true" /> Lists</Link>
            <span aria-disabled="true"><ListBullets aria-hidden="true" /> Projections <small>Later</small></span>
          </nav>
        </div>
        <div className="admin-sidebar__footer">
          <Link href="/" target="_blank">View website <ArrowSquareOut aria-hidden="true" /></Link>
          <span>{identity.email}</span>
          {!identity.demo ? <form action="/auth/sign-out" method="post"><button><SignOut aria-hidden="true" /> Sign out</button></form> : null}
        </div>
      </aside>
      <div className="admin-workspace">{identity.demo ? <div className="admin-demo-banner">Local preview — connect Supabase before production</div> : null}{children}</div>
    </div>
  );
}
