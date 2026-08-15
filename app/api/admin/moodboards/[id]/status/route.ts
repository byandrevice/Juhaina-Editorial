import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const status = String((await request.json()).status ?? "");
  if (!new Set(["unpublished", "archived"]).has(status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("moodboard_posts").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/moodboards");
  return NextResponse.json({ status });
}
