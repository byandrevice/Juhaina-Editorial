import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_list", { target_post_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/lists", "layout");
  return NextResponse.json({ published: true });
}
