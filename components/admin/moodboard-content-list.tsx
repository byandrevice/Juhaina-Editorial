"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { listLocalMoodboardDrafts, removeLocalMoodboardDraft, removeLocalMoodboardImages, type LocalMoodboardDraftSummary } from "@/lib/admin/moodboard-draft-storage";

type RemoteMoodboard = { id: string; slug: string; status: string; title: string; categoryId: string; categoryName: string; categoryPosition: number; position: number; updatedAt: string };

const orderMoodboards = (posts: RemoteMoodboard[]) => [...posts].sort((a, b) =>
  a.categoryPosition - b.categoryPosition || a.position - b.position || a.title.localeCompare(b.title),
);

export function MoodboardContentList({ demo }: { demo: boolean }) {
  const [remote, setRemote] = useState<RemoteMoodboard[]>([]);
  const [local, setLocal] = useState<LocalMoodboardDraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const drafts = listLocalMoodboardDrafts(); setLocal(drafts);
    if (demo) { setLoading(false); return; }
    fetch("/api/admin/moodboards").then((response) => response.ok ? response.json() : { posts: [] }).then((result) => {
      const posts = (result.posts ?? []) as RemoteMoodboard[]; const ids = new Set(posts.map((post) => post.id));
      setRemote(orderMoodboards(posts)); setLocal(drafts.filter((draft) => !ids.has(draft.key)));
    }).finally(() => setLoading(false));
  }, [demo]);

  async function runAction(post: RemoteMoodboard, action: "delete" | "duplicate" | "unpublished" | "archived") {
    const key = `${action}:${post.id}`; setBusy(key); setError("");
    const response = await fetch(action === "delete" ? `/api/admin/moodboards/${post.id}` : action === "duplicate" ? `/api/admin/moodboards/${post.id}/duplicate` : `/api/admin/moodboards/${post.id}/status`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: action === "unpublished" || action === "archived" ? { "Content-Type": "application/json" } : undefined,
      body: action === "unpublished" || action === "archived" ? JSON.stringify({ status: action }) : undefined,
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "That change could not be completed.");
    else if (action === "delete") setRemote((current) => current.filter((entry) => entry.id !== post.id));
    else if (action === "duplicate") window.location.href = `/admin/moodboards/${result.post.id}`;
    else setRemote((current) => current.map((entry) => entry.id === post.id ? { ...entry, status: action } : entry));
    setConfirming(""); setBusy("");
  }

  async function move(post: RemoteMoodboard, direction: -1 | 1) {
    const key = `move:${post.id}`; setBusy(key); setError("");
    const response = await fetch("/api/admin/moodboards", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, direction }) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "That moodboard could not be moved.");
    else if (result.moved) setRemote((current) => orderMoodboards(current.map((entry) => entry.id === post.id ? { ...entry, position: result.position } : entry.id === result.neighborId ? { ...entry, position: result.neighborPosition } : entry)));
    setBusy("");
  }

  if (loading) return <div className="admin-content-table admin-content-table--loading">Loading your moodboards…</div>;
  if (!remote.length && !local.length) return <div className="admin-empty-state"><h2>No moodboards yet.</h2><p>Start with a color, then arrange up to 50 static image layers.</p><Link className="admin-link-button" href="/admin/moodboards/new">Create a moodboard</Link></div>;
  return <div className="admin-content-table">
    {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
    <div className="admin-content-table__head admin-moodboard-table__head"><span>Title</span><span>Category</span><span>Status</span><span>Last saved</span><span>Actions</span></div>
    {remote.map((post) => {
      const siblings = remote.filter((entry) => entry.categoryId === post.categoryId);
      const siblingIndex = siblings.findIndex((entry) => entry.id === post.id);
      return <div className="admin-content-row admin-moodboard-table__row" key={post.id}><Link className="admin-content-row__link admin-moodboard-table__link" href={`/admin/moodboards/${post.id}`}><strong data-label="Title">{post.title}</strong><span data-label="Category">{post.categoryName}</span><span data-label="Status" className={`admin-status admin-status--${post.status}`}>{post.status.replaceAll("_", " ")}</span><time data-label="Last saved">{new Date(post.updatedAt).toLocaleString()}</time></Link><div className="admin-content-row__actions admin-list-actions"><span className="admin-moodboard-order-actions" aria-label={`Order ${post.title} within ${post.categoryName}`}><button type="button" aria-label={`Move ${post.title} earlier`} disabled={siblingIndex <= 0 || busy === `move:${post.id}`} onClick={() => move(post, -1)}><ArrowUp /></button><button type="button" aria-label={`Move ${post.title} later`} disabled={siblingIndex >= siblings.length - 1 || busy === `move:${post.id}`} onClick={() => move(post, 1)}><ArrowDown /></button></span><button type="button" onClick={() => runAction(post, "duplicate")}>Duplicate</button>{post.status === "draft" ? <button type="button" className="admin-text-action--danger" onClick={() => setConfirming(`delete:${post.id}`)}>Delete</button> : null}{post.status.startsWith("published") ? <button type="button" onClick={() => setConfirming(`unpublished:${post.id}`)}>Unpublish</button> : null}{post.status !== "archived" && post.status !== "draft" ? <button type="button" onClick={() => setConfirming(`archived:${post.id}`)}>Archive</button> : null}{confirming.endsWith(post.id) ? <div className="admin-delete-confirm"><span>Are you sure?</span><Button size="small" variant={confirming.startsWith("delete") ? "danger" : "primary"} type="button" disabled={busy === confirming} onClick={() => runAction(post, confirming.split(":")[0] as "delete" | "unpublished" | "archived")}>{busy === confirming ? "Working…" : "Yes"}</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : null}</div></div>;
    })}
    {local.map((draft) => <div className="admin-content-row admin-moodboard-table__row" key={draft.key}><Link className="admin-content-row__link admin-moodboard-table__link" href={`/admin/moodboards/new?draft=${encodeURIComponent(draft.key)}`}><strong data-label="Title">{draft.title}</strong><span data-label="Category">Saved in this browser</span><span data-label="Status" className="admin-status">Recovery draft</span><time data-label="Last saved">{new Date(draft.updatedAt).toLocaleString()}</time></Link><div className="admin-content-row__actions"><button className="admin-text-action--danger" type="button" onClick={() => { removeLocalMoodboardDraft(draft.key); void removeLocalMoodboardImages(draft.key); setLocal((current) => current.filter((entry) => entry.key !== draft.key)); }}>Delete</button></div></div>)}
  </div>;
}
