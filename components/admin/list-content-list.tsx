"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listLocalListDrafts, removeLocalListDraft, type LocalListDraftSummary } from "@/lib/admin/list-draft-storage";

type RemoteList = { id: string; slug: string; status: string; title: string; typeLabel: string; periodLabel: string; updatedAt: string };

export function ListContentList() {
  const [remote, setRemote] = useState<RemoteList[]>([]);
  const [local, setLocal] = useState<LocalListDraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const drafts = listLocalListDrafts();
    fetch("/api/admin/lists").then((response) => response.ok ? response.json() : { posts: [] }).then((data) => {
      const posts = (data.posts ?? []) as RemoteList[];
      const remoteIds = new Set(posts.map((post) => post.id));
      setRemote(posts);
      setLocal(drafts.filter((draft) => !remoteIds.has(draft.key)));
    }).finally(() => setLoading(false));
  }, []);

  async function runAction(post: RemoteList, action: "delete" | "duplicate" | "unpublished" | "archived") {
    const key = `${action}:${post.id}`;
    setBusy(key); setError("");
    const response = await fetch(action === "delete" ? `/api/admin/lists/${post.id}` : action === "duplicate" ? `/api/admin/lists/${post.id}/duplicate` : `/api/admin/lists/${post.id}/status`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: action === "unpublished" || action === "archived" ? { "Content-Type": "application/json" } : undefined,
      body: action === "unpublished" || action === "archived" ? JSON.stringify({ status: action }) : undefined,
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "That change could not be completed.");
    else if (action === "delete") setRemote((current) => current.filter((entry) => entry.id !== post.id));
    else if (action === "duplicate") window.location.href = `/admin/lists/${result.post.id}`;
    else setRemote((current) => current.map((entry) => entry.id === post.id ? { ...entry, status: action } : entry));
    setConfirming(""); setBusy("");
  }

  if (loading) return <div className="admin-content-table admin-content-table--loading">Loading your lists…</div>;
  if (!remote.length && !local.length) return <div className="admin-empty-state"><h2>No lists yet.</h2><p>Start a list and arrange up to 20 entries.</p><Link className="admin-link-button" href="/admin/lists/new">Create a list</Link></div>;

  return <div className="admin-content-table">
    {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
    <div className="admin-content-table__head admin-list-table__head"><span>Title</span><span>Type / period</span><span>Status</span><span>Last saved</span><span>Actions</span></div>
    {remote.map((post) => <div className="admin-content-row admin-list-table__row" key={post.id}>
      <Link className="admin-content-row__link admin-list-table__link" href={`/admin/lists/${post.id}`}><strong>{post.title}</strong><span>{post.typeLabel} · {post.periodLabel}</span><span className={`admin-status admin-status--${post.status}`}>{post.status.replaceAll("_", " ")}</span><time>{new Date(post.updatedAt).toLocaleString()}</time></Link>
      <div className="admin-content-row__actions admin-list-actions">
        <button type="button" onClick={() => runAction(post, "duplicate")}>Duplicate</button>
        {post.status === "draft" ? <button type="button" className="admin-text-action--danger" onClick={() => setConfirming(`delete:${post.id}`)}>Delete</button> : null}
        {post.status === "published" || post.status === "published_with_changes" ? <button type="button" onClick={() => setConfirming(`unpublished:${post.id}`)}>Unpublish</button> : null}
        {post.status !== "archived" && post.status !== "draft" ? <button type="button" onClick={() => setConfirming(`archived:${post.id}`)}>Archive</button> : null}
        {confirming.endsWith(post.id) ? <div className="admin-delete-confirm"><span>Are you sure?</span><Button size="small" variant={confirming.startsWith("delete") ? "danger" : "primary"} type="button" disabled={busy === confirming} onClick={() => runAction(post, confirming.split(":")[0] as "delete" | "unpublished" | "archived")}>{busy === confirming ? "Working…" : "Yes"}</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : null}
      </div>
    </div>)}
    {local.map((draft) => <div className="admin-content-row admin-list-table__row" key={draft.key}><Link className="admin-content-row__link admin-list-table__link" href={`/admin/lists/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span>Saved in this browser</span><span className="admin-status">Recovery draft</span><time>{new Date(draft.updatedAt).toLocaleString()}</time></Link><div className="admin-content-row__actions"><button type="button" className="admin-text-action--danger" onClick={() => { removeLocalListDraft(draft.key); setLocal((current) => current.filter((entry) => entry.key !== draft.key)); }}>Delete</button></div></div>)}
  </div>;
}
