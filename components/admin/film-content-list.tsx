"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  listLocalDrafts,
  removeDraftImage,
  removeLocalDraft,
  type LocalDraftSummary,
} from "@/lib/admin/draft-storage";

type RemotePost = { id: string; slug: string; status: string; title: string; updatedAt: string };

export function FilmContentList() {
  const [remote, setRemote] = useState<RemotePost[]>([]);
  const [local, setLocal] = useState<LocalDraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [confirming, setConfirming] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const browserDrafts = listLocalDrafts();
    fetch("/api/admin/films")
      .then((response) => response.ok ? response.json() : { posts: [] })
      .then((data) => {
        const posts = (data.posts ?? []) as RemotePost[];
        const publishedIds = new Set(
          posts.filter((post) => post.status === "published").map((post) => post.id),
        );
        const remainingDrafts = browserDrafts.filter((draft) => {
          if (!publishedIds.has(draft.key)) return true;
          removeLocalDraft(draft.key);
          void removeDraftImage(draft.key);
          return false;
        });
        setRemote(posts);
        setLocal(remainingDrafts);
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteRemoteDraft(post: RemotePost) {
    const key = `remote:${post.id}`;
    setDeleting(key);
    setError("");
    const response = await fetch(`/api/admin/films/${post.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "The draft could not be deleted.");
      setDeleting("");
      return;
    }
    removeLocalDraft(post.id);
    await removeDraftImage(post.id);
    setRemote((current) => current.filter((entry) => entry.id !== post.id));
    setLocal((current) => current.filter((entry) => entry.key !== post.id));
    setConfirming("");
    setDeleting("");
  }

  async function deleteRecoveryDraft(draft: LocalDraftSummary) {
    const key = `local:${draft.key}`;
    setDeleting(key);
    setError("");
    removeLocalDraft(draft.key);
    await removeDraftImage(draft.key);
    setLocal((current) => current.filter((entry) => entry.key !== draft.key));
    setConfirming("");
    setDeleting("");
  }

  if (loading) return <div className="admin-content-table admin-content-table--loading">Loading your writing…</div>;
  if (!remote.length && !local.length) return <div className="admin-empty-state"><h2>No essays yet.</h2><p>Start your first Film Thoughts draft. It will save automatically as you write.</p><Link className="admin-link-button" href="/admin/films/new">Create an essay</Link></div>;

  return (
    <div className="admin-content-table">
      {error ? <div className="admin-content-error" role="alert">{error}</div> : null}
      <div className="admin-content-table__head"><span>Title</span><span>Status</span><span>Last saved</span><span>Actions</span></div>
      {remote.map((post) => {
        const key = `remote:${post.id}`;
        const canDelete = post.status === "draft";
        return (
          <div className="admin-content-row" key={post.id}>
            <Link className="admin-content-row__link" href={`/admin/films/${post.id}`}>
              <strong>{post.title}</strong>
              <span className={`admin-status admin-status--${post.status}`}>{post.status.replaceAll("_", " ")}</span>
              <time>{new Date(post.updatedAt).toLocaleString()}</time>
            </Link>
            <div className="admin-content-row__actions">
              {canDelete && confirming !== key ? <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(key)}>Delete draft</button> : null}
              {canDelete && confirming === key ? <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" disabled={deleting === key} onClick={() => deleteRemoteDraft(post)}>{deleting === key ? "Deleting…" : "Yes"}</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : null}
            </div>
          </div>
        );
      })}
      {local.map((draft) => {
        const key = `local:${draft.key}`;
        return (
          <div className="admin-content-row" key={draft.key}>
            <Link className="admin-content-row__link" href={`/admin/films/new?draft=${encodeURIComponent(draft.key)}`}>
              <strong>{draft.title}</strong>
              <span className="admin-status">Recovery draft</span>
              <time>{new Date(draft.updatedAt).toLocaleString()}</time>
            </Link>
            <div className="admin-content-row__actions">
              {confirming !== key ? <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(key)}>Delete draft</button> : <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" disabled={deleting === key} onClick={() => deleteRecoveryDraft(draft)}>{deleting === key ? "Deleting…" : "Yes"}</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
