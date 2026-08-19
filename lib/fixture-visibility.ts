import { createPublicClient } from "./supabase/public";
import type { FixtureSection } from "./fixture-registry";

export async function getHiddenFixtureKeys(section: FixtureSection): Promise<Set<string> | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("fixture_visibility")
      .select("fixture_key")
      .eq("section", section)
      .eq("hidden", true);

    if (error) return null;
    return new Set((data ?? []).map((row) => row.fixture_key));
  } catch {
    return null;
  }
}

