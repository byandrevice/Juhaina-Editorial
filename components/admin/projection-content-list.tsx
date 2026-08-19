"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  listLocalProjectionDrafts,
  removeLocalProjectionDraft,
  removeLocalProjectionImage,
  type LocalProjectionDraftSummary,
} from "@/lib/admin/projection-draft-storage";

type RemoteProjection = { id: string; slug: string; status: string; title: string; updatedAt: string };

export function ProjectionContentList() {
  const [remote, setRemote] = useState<RemoteProjection[]>([]);
  const [local, setLocal] = useState<LocalProjectionDraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const drafts = listLocalProjectionDrafts();
    fetch("/api/admin/projections").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Projections could not be loaded.");
      const posts = (result.posts ?? []) as RemoteProjection[];
      const ids = new Set(posts.map((post) => post.id));
      setRemote(posts); setLocal(drafts.filter((draft) => !ids.has(draft.key)));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Projections could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function runAction(post: RemoteProjection, action: "delete" | "unpublished" | "archived") {
    const key = `${action}:${post.id}`; setBusy(key); setError("");
    const response = await fetch(action === "delete" ? `/api/admin/projections/${post.id}` : `/api/admin/projections/${post.id}/status`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: action === "delete" ? undefined : { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ status: action }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "That change could not be completed.");
    else if (action === "delete") setRemote((current) => current.filter((entry) => entry.id !== post.id));
    else setRemote((current) => current.map((entry) => entry.id === post.id ? { ...entry, status: action } : entry));
    setConfirming(""); setBusy("");
  }

  if (loading) return <div className="admin-content-table admin-content-table--loading">Loading projections…</div>;
  if (!remote.length && !local.length) return <div className="admin-empty-state"><h2>No projections yet.</h2><p>Start a draft for culture and current-events writing.</p><Link className="admin-link-button" href="/admin/projections/new">Create a projection</Link></div>;

  return <div className="admin-content-table">
    {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
    <div className="admin-content-table__head"><span>Title</span><span>Status</span><span>Last saved</span><span>Actions</span></div>
    {remote.map((post) => <div className="admin-content-row" key={post.id}>
      <Link className="admin-content-row__link" href={`/admin/projections/${post.id}`}><strong>{post.title}</strong><span className={`admin-status admin-status--${post.status}`}>{post.status.replaceAll("_", " ")}</span><time>{new Date(post.updatedAt).toLocaleString()}</time></Link>
      <div className="admin-content-row__actions admin-list-actions">
        {post.status === "draft" ? <button type="button" className="admin-text-action--danger" onClick={() => setConfirming(`delete:${post.id}`)}>Delete</button> : null}
        {post.status.startsWith("published") ? <button type="button" onClick={() => setConfirming(`unpublished:${post.id}`)}>Unpublish</button> : null}
        {post.status !== "archived" && post.status !== "draft" ? <button type="button" onClick={() => setConfirming(`archived:${post.id}`)}>Archive</button> : null}
        {confirming.endsWith(post.id) ? <div className="admin-delete-confirm"><span>Are you sure?</span><Button size="small" variant={confirming.startsWith("delete") ? "danger" : "primary"} disabled={busy === confirming} onClick={() => runAction(post, confirming.split(":")[0] as "delete" | "unpublished" | "archived")}>{busy === confirming ? "Working…" : "Yes"}</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : null}
      </div>
    </div>)}
    {local.map((draft) => <div className="admin-content-row" key={draft.key}><Link className="admin-content-row__link" href={`/admin/projections/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span className="admin-status">Recovery draft</span><time>{new Date(draft.updatedAt).toLocaleString()}</time></Link><div className="admin-content-row__actions"><button type="button" className="admin-text-action--danger" onClick={() => { removeLocalProjectionDraft(draft.key); void removeLocalProjectionImage(draft.key); setLocal((current) => current.filter((entry) => entry.key !== draft.key)); }}>Delete</button></div></div>)}
  </div>;
}

