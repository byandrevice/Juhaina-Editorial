import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const name = String((await request.json()).name ?? "").trim();
  if (!name || name.length > 80) return NextResponse.json({ error: "Use a category name between 1 and 80 characters." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("moodboard_categories")
    .update({ name, updated_at: new Date().toISOString() }).eq("id", id).select("id, name, slug, position").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Category names must be unique." : error.message }, { status: 409 });
  revalidatePath("/moodboards");
  return NextResponse.json({ category: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const transferToId = String(body.transferToId ?? "");
  const supabase = await createClient();
  const { count: categoryCount } = await supabase.from("moodboard_categories").select("id", { count: "exact", head: true });
  if ((categoryCount ?? 0) <= 1) return NextResponse.json({ error: "Keep at least one moodboard category." }, { status: 409 });
  const [{ count: boardCount }, { count: publishedBoardCount }] = await Promise.all([
    supabase.from("moodboard_posts").select("id", { count: "exact", head: true }).eq("category_id", id),
    supabase.from("moodboard_posts").select("id", { count: "exact", head: true }).eq("published_category_id", id),
  ]);
  if ((boardCount ?? 0) > 0 || (publishedBoardCount ?? 0) > 0) {
    if (!transferToId || transferToId === id) return NextResponse.json({ error: "Choose another category for these moodboards." }, { status: 409 });
    const { data: target } = await supabase.from("moodboard_categories").select("id").eq("id", transferToId).maybeSingle();
    if (!target) return NextResponse.json({ error: "The transfer category no longer exists." }, { status: 404 });
    const { data: last } = await supabase.from("moodboard_posts").select("position").eq("category_id", transferToId).order("position", { ascending: false }).limit(1).maybeSingle();
    const { data: moving } = await supabase.from("moodboard_posts").select("id").eq("category_id", id).order("position");
    for (let index = 0; index < (moving ?? []).length; index += 1) {
      await supabase.from("moodboard_posts").update({ category_id: transferToId, position: (last?.position ?? 0) + index + 1, updated_at: new Date().toISOString() }).eq("id", moving![index].id);
    }
    await supabase.from("moodboard_posts").update({ published_category_id: transferToId, updated_at: new Date().toISOString() }).eq("published_category_id", id);
  }
  const { error } = await supabase.from("moodboard_categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: remaining } = await supabase.from("moodboard_categories").select("id").order("position");
  for (let index = 0; index < (remaining ?? []).length; index += 1) await supabase.from("moodboard_categories").update({ position: 1000 + index }).eq("id", remaining![index].id);
  for (let index = 0; index < (remaining ?? []).length; index += 1) await supabase.from("moodboard_categories").update({ position: index + 1 }).eq("id", remaining![index].id);
  revalidatePath("/moodboards");
  return NextResponse.json({ deleted: true, transferred: Math.max(boardCount ?? 0, publishedBoardCount ?? 0) });
}
