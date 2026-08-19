"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FixtureEntry, FixtureSection } from "@/lib/fixture-registry";

type ManagedFixture = FixtureEntry & { hidden: boolean };

const labels: Record<FixtureSection, string> = {
  films: "Film Thoughts",
  moodboards: "Moodboards",
  projections: "Projections",
  lists: "Lists",
};

export function SampleContentManager() {
  const [fixtures, setFixtures] = useState<ManagedFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/fixtures")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Sample content could not be loaded.");
        setFixtures(result.fixtures ?? []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Sample content could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => Object.entries(labels).map(([section, label]) => ({
    section: section as FixtureSection,
    label,
    entries: fixtures.filter((entry) => entry.section === section),
  })), [fixtures]);

  async function setHidden(entry: ManagedFixture, hidden: boolean) {
    const id = `${entry.section}:${entry.key}`;
    setBusy(id); setError("");
    const response = await fetch("/api/admin/fixtures", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: entry.section, key: entry.key, hidden }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "That change could not be saved.");
    else setFixtures((current) => current.map((fixture) => fixture.section === entry.section && fixture.key === entry.key ? { ...fixture, hidden } : fixture));
    setBusy("");
  }

  if (loading) return <div className="admin-content-table admin-content-table--loading">Loading sample content…</div>;

  return <div className="admin-sample-groups">
    {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
    {groups.map((group) => <section className="admin-sample-group" key={group.section}>
      <div className="admin-sample-group__heading"><h2>{group.label}</h2><span>{group.entries.filter((entry) => !entry.hidden).length} visible samples</span></div>
      <div className="admin-content-table">
        {group.entries.map((entry) => {
          const id = `${entry.section}:${entry.key}`;
          return <div className="admin-sample-row" key={id}>
            <div><strong>{entry.title}</strong><span>{entry.detail}</span></div>
            <span className={`admin-status${entry.hidden ? " admin-status--unpublished" : " admin-status--published"}`}>{entry.hidden ? "Removed" : "Visible"}</span>
            <Button size="small" variant={entry.hidden ? "secondary" : "danger"} disabled={busy === id} onClick={() => setHidden(entry, !entry.hidden)}>
              {busy === id ? "Saving…" : entry.hidden ? "Restore sample" : "Remove sample"}
            </Button>
          </div>;
        })}
      </div>
    </section>)}
  </div>;
}

