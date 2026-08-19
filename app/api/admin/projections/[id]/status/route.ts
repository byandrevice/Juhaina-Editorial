import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({ status: z.enum(["unpublished", "archived"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("projection_posts").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/projections");
  revalidatePath("/projections/[slug]", "page");
  return NextResponse.json({ status: parsed.data.status });
}
