import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminIdentity } from "@/lib/admin/auth";
import { fixtureEntries } from "@/lib/fixture-registry";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  section: z.enum(["films", "lists", "moodboards", "projections"]),
  key: z.string().min(1).max(240),
  hidden: z.boolean(),
});

export async function GET() {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.from("fixture_visibility").select("section, fixture_key, hidden");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hidden = new Set((data ?? []).filter((row) => row.hidden).map((row) => `${row.section}:${row.fixture_key}`));
  return NextResponse.json({
    fixtures: fixtureEntries.map((entry) => ({ ...entry, hidden: hidden.has(`${entry.section}:${entry.key}`) })),
  });
}

export async function PATCH(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose valid sample content." }, { status: 400 });

  const exists = fixtureEntries.some((entry) => entry.section === parsed.data.section && entry.key === parsed.data.key);
  if (!exists) return NextResponse.json({ error: "Sample content was not found." }, { status: 404 });

  const supabase = await createClient();
  const { error } = parsed.data.hidden
    ? await supabase.from("fixture_visibility").upsert({
        section: parsed.data.section,
        fixture_key: parsed.data.key,
        hidden: true,
        updated_by: identity.id,
        updated_at: new Date().toISOString(),
      })
    : await supabase.from("fixture_visibility").delete()
        .eq("section", parsed.data.section)
        .eq("fixture_key", parsed.data.key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath(`/${parsed.data.section}`);
  if (parsed.data.section === "films") revalidatePath("/films/[slug]", "page");
  if (parsed.data.section === "projections") revalidatePath("/projections/[slug]", "page");
  if (parsed.data.section === "lists") revalidatePath("/lists", "layout");
  return NextResponse.json({ hidden: parsed.data.hidden });
}
