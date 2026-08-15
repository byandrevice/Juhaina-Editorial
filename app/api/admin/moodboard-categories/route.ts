import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminIdentity } from "@/lib/admin/auth";
import { slugifyListLabel } from "@/lib/lists-data";
import { createClient } from "@/lib/supabase/server";

const defaults = ["Memory", "Material", "Place"];

async function categoryRows() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("moodboard_categories")
    .select("id, name, slug, position").order("position");
  if (error) throw error;
  return Promise.all((data ?? []).map(async (row) => {
    const { count } = await supabase.from("moodboard_posts").select("id", { count: "exact", head: true })
      .or(`category_id.eq.${row.id},published_category_id.eq.${row.id}`);
    return { id: row.id, name: row.name, slug: row.slug, position: row.position, boardCount: count ?? 0 };
  }));
}

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  try {
    let categories = await categoryRows();
    if (!categories.length) {
      const supabase = await createClient();
      const { error } = await supabase.from("moodboard_categories").insert(defaults.map((name, index) => ({
        owner_id: identity.id, name, slug: slugifyListLabel(name, "category"), position: index + 1,
      })));
      if (error) throw error;
      categories = await categoryRows();
    }
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Categories could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const name = String((await request.json()).name ?? "").trim();
  if (!name || name.length > 80) return NextResponse.json({ error: "Use a category name between 1 and 80 characters." }, { status: 400 });
  const supabase = await createClient();
  const { data: last } = await supabase.from("moodboard_categories").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const baseSlug = slugifyListLabel(name, "category");
  const { data, error } = await supabase.from("moodboard_categories").insert({
    owner_id: identity.id, name, slug: `${baseSlug}-${nanoid(5).toLowerCase()}`, position: (last?.position ?? 0) + 1,
  }).select("id, name, slug, position").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Category names must be unique." : error.message }, { status: 409 });
  revalidatePath("/moodboards");
  return NextResponse.json({ category: { ...data, boardCount: 0 } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const ids = (await request.json()).ids as string[];
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ error: "Choose categories to reorder." }, { status: 400 });
  const supabase = await createClient();
  for (let index = 0; index < ids.length; index += 1) await supabase.from("moodboard_categories").update({ position: 1000 + index }).eq("id", ids[index]);
  for (let index = 0; index < ids.length; index += 1) await supabase.from("moodboard_categories").update({ position: index + 1, updated_at: new Date().toISOString() }).eq("id", ids[index]);
  revalidatePath("/moodboards");
  return NextResponse.json({ reordered: true });
}
