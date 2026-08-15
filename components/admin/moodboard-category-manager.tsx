"use client";

import { ArrowDown, ArrowUp, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadDemoMoodboardCategories, saveDemoMoodboardCategories } from "@/lib/admin/moodboard-draft-storage";
import type { AdminMoodboardCategory } from "@/lib/admin/moodboard-schema";

export function MoodboardCategoryManager({ demo }: { demo: boolean }) {
  const [categories, setCategories] = useState<AdminMoodboardCategory[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState("");
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState("");
  const [transferToId, setTransferToId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) { setCategories(loadDemoMoodboardCategories()); return; }
    fetch("/api/admin/moodboard-categories").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCategories(result.categories);
    }).catch((reason) => setError(reason.message));
  }, [demo]);

  async function createCategory() {
    const name = newName.trim();
    if (!name) { setError("Enter a category name first."); return; }
    setBusy(true); setError("");
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) { setError("Category names must be unique."); setBusy(false); return; }
    if (demo) {
      const next = [...categories, { id: crypto.randomUUID(), name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), position: categories.length + 1, boardCount: 0 }];
      setCategories(next); saveDemoMoodboardCategories(next); setNewName(""); setBusy(false); return;
    }
    const response = await fetch("/api/admin/moodboard-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (response.ok) { setCategories((current) => [...current, result.category]); setNewName(""); }
    else setError(result.error);
    setBusy(false);
  }

  async function renameCategory(category: AdminMoodboardCategory) {
    const name = editName.trim(); if (!name) return;
    setBusy(true); setError("");
    if (categories.some((entry) => entry.id !== category.id && entry.name.toLowerCase() === name.toLowerCase())) { setError("Category names must be unique."); setBusy(false); return; }
    if (demo) {
      const next = categories.map((entry) => entry.id === category.id ? { ...entry, name } : entry);
      setCategories(next); saveDemoMoodboardCategories(next); setEditing(""); setBusy(false); return;
    }
    const response = await fetch(`/api/admin/moodboard-categories/${category.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (response.ok) { setCategories((current) => current.map((entry) => entry.id === category.id ? { ...entry, name } : entry)); setEditing(""); }
    else setError(result.error);
    setBusy(false);
  }

  async function move(index: number, delta: number) {
    const target = index + delta; if (target < 0 || target >= categories.length) return;
    const next = [...categories]; [next[index], next[target]] = [next[target], next[index]];
    const positioned = next.map((category, position) => ({ ...category, position: position + 1 }));
    setCategories(positioned);
    if (demo) { saveDemoMoodboardCategories(positioned); return; }
    const response = await fetch("/api/admin/moodboard-categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: positioned.map((category) => category.id) }) });
    if (!response.ok) setError((await response.json()).error);
  }

  async function deleteCategory(category: AdminMoodboardCategory) {
    setBusy(true); setError("");
    if (categories.length <= 1) { setError("Keep at least one moodboard category."); setBusy(false); return; }
    if ((category.boardCount ?? 0) > 0 && !transferToId) { setError("Choose where to move these moodboards."); setBusy(false); return; }
    if (demo) {
      const next = categories.filter((entry) => entry.id !== category.id).map((entry, index) => ({ ...entry, position: index + 1 }));
      setCategories(next); saveDemoMoodboardCategories(next); setDeleting(""); setBusy(false); return;
    }
    const response = await fetch(`/api/admin/moodboard-categories/${category.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transferToId }) });
    const result = await response.json();
    if (response.ok) { setCategories((current) => current.filter((entry) => entry.id !== category.id).map((entry, index) => ({ ...entry, position: index + 1, boardCount: entry.id === transferToId ? (entry.boardCount ?? 0) + (category.boardCount ?? 0) : entry.boardCount }))); setDeleting(""); setTransferToId(""); }
    else setError(result.error);
    setBusy(false);
  }

  return <section className="admin-category-manager" aria-labelledby="category-heading">
    <div className="admin-category-manager__heading"><div><p className="admin-eyebrow">Organization</p><h2 id="category-heading">Categories</h2><p>Add, rename, reorder, or safely remove the sections readers browse.</p></div><div className="admin-category-manager__add"><input className="admin-input" aria-label="New category name" value={newName} onChange={(event) => { setNewName(event.target.value); if (error === "Enter a category name first.") setError(""); }} placeholder="New category" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void createCategory(); } }} /><Button size="small" type="button" disabled={busy} aria-busy={busy} onClick={createCategory}><Plus /> {busy ? "Adding…" : "Add"}</Button></div></div>
    {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
    <ol>{categories.map((category, index) => <li key={category.id}>
      <span className="admin-category-manager__position">{index + 1}</span>
      {editing === category.id ? <div className="admin-category-manager__edit"><input className="admin-input" autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} /><Button size="small" type="button" onClick={() => renameCategory(category)} disabled={busy}>Save</Button><button type="button" onClick={() => setEditing("")}>Cancel</button></div> : <div className="admin-category-manager__name"><strong>{category.name}</strong><span>{category.boardCount ?? 0} moodboard{category.boardCount === 1 ? "" : "s"}</span></div>}
      <div className="admin-category-manager__actions"><button type="button" aria-label={`Move ${category.name} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></button><button type="button" aria-label={`Move ${category.name} down`} disabled={index === categories.length - 1} onClick={() => move(index, 1)}><ArrowDown /></button><button type="button" aria-label={`Rename ${category.name}`} onClick={() => { setEditing(category.id); setEditName(category.name); }}><PencilSimple /></button><button className="admin-text-action--danger" type="button" aria-label={`Delete ${category.name}`} onClick={() => { setDeleting(category.id); setTransferToId(""); }}><Trash /></button></div>
      {deleting === category.id ? <div className="admin-category-delete"><p>{(category.boardCount ?? 0) > 0 ? `Move ${category.boardCount} moodboard${category.boardCount === 1 ? "" : "s"} before deleting this category.` : "Delete this empty category?"}</p>{(category.boardCount ?? 0) > 0 ? <select value={transferToId} onChange={(event) => setTransferToId(event.target.value)}><option value="">Choose destination…</option>{categories.filter((entry) => entry.id !== category.id).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select> : null}<Button size="small" variant="danger" type="button" disabled={busy} onClick={() => deleteCategory(category)}>{busy ? "Working…" : "Delete category"}</Button><button type="button" onClick={() => setDeleting("")}>Cancel</button></div> : null}
    </li>)}</ol>
  </section>;
}
