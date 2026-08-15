import { redirect } from "next/navigation";
import { AdminSignIn } from "@/components/admin/admin-sign-in";
import { getAdminIdentity } from "@/lib/admin/auth";
import { hasSupabaseConfig, isLocalAdminDemo } from "@/lib/supabase/config";

export default async function AdminSignInPage() {
  const identity = await getAdminIdentity();
  if (identity) redirect("/admin");

  return (
    <main className="admin-sign-in">
      <div className="admin-sign-in__card">
        <p className="admin-eyebrow">Second Viewing</p>
        <h1>Welcome back.</h1>
        <p>Sign in to write, revise, and publish your editorial work.</p>
        <AdminSignIn
          configured={hasSupabaseConfig()}
          demo={isLocalAdminDemo()}
        />
      </div>
    </main>
  );
}
