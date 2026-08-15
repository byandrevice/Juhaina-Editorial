import { isLocalAdminDemo } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email: string;
  demo: boolean;
};

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (isLocalAdminDemo()) {
    return { id: "local-demo-author", email: "Local preview", demo: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!admin) return null;

  return { id: user.id, email: user.email ?? "Author", demo: false };
}

