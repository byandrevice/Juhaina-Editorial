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
import { listLocalListDrafts, removeLocalListDraft, type LocalListDraftSummary } from "@/lib/admin/list-draft-storage";
import { listLocalMoodboardDrafts, removeLocalMoodboardDraft, removeLocalMoodboardImages, type LocalMoodboardDraftSummary } from "@/lib/admin/moodboard-draft-storage";
import { listLocalProjectionDrafts, removeLocalProjectionDraft, removeLocalProjectionImage, type LocalProjectionDraftSummary } from "@/lib/admin/projection-draft-storage";

export function AdminDraftRecovery() {
  const [drafts, setDrafts] = useState<LocalDraftSummary[]>([]);
  const [listDrafts, setListDrafts] = useState<LocalListDraftSummary[]>([]);
  const [moodboardDrafts, setMoodboardDrafts] = useState<LocalMoodboardDraftSummary[]>([]);
  const [projectionDrafts, setProjectionDrafts] = useState<LocalProjectionDraftSummary[]>([]);
  const [confirming, setConfirming] = useState("");
  useEffect(() => { setDrafts(listLocalDrafts()); setListDrafts(listLocalListDrafts()); setMoodboardDrafts(listLocalMoodboardDrafts()); setProjectionDrafts(listLocalProjectionDrafts()); }, []);

  async function deleteDraft(draft: LocalDraftSummary) {
    removeLocalDraft(draft.key);
    await removeDraftImage(draft.key);
    setDrafts((current) => current.filter((entry) => entry.key !== draft.key));
    setConfirming("");
  }

  function deleteListDraft(draft: LocalListDraftSummary) {
    removeLocalListDraft(draft.key);
    setListDrafts((current) => current.filter((entry) => entry.key !== draft.key));
    setConfirming("");
  }

  async function deleteMoodboardDraft(draft: LocalMoodboardDraftSummary) {
    removeLocalMoodboardDraft(draft.key);
    await removeLocalMoodboardImages(draft.key);
    setMoodboardDrafts((current) => current.filter((entry) => entry.key !== draft.key));
    setConfirming("");
  }

  async function deleteProjectionDraft(draft: LocalProjectionDraftSummary) {
    removeLocalProjectionDraft(draft.key);
    await removeLocalProjectionImage(draft.key);
    setProjectionDrafts((current) => current.filter((entry) => entry.key !== draft.key));
    setConfirming("");
  }

  return (
    <section className="admin-recovery">
      <div><p className="admin-eyebrow">Recovery drafts</p><h2>Saved in this browser</h2></div>
      {drafts.length || listDrafts.length || moodboardDrafts.length || projectionDrafts.length ? (
        <ul>{drafts.map((draft) => <li key={`film:${draft.key}`}><Link href={`/admin/films/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span>Film Thoughts · Saved {new Date(draft.updatedAt).toLocaleString()}</span></Link>{confirming === `film:${draft.key}` ? <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" onClick={() => deleteDraft(draft)}>Yes</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(`film:${draft.key}`)}>Delete draft</button>}</li>)}{listDrafts.map((draft) => <li key={`list:${draft.key}`}><Link href={`/admin/lists/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span>Lists · Saved {new Date(draft.updatedAt).toLocaleString()}</span></Link>{confirming === `list:${draft.key}` ? <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" onClick={() => deleteListDraft(draft)}>Yes</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(`list:${draft.key}`)}>Delete draft</button>}</li>)}{moodboardDrafts.map((draft) => <li key={`moodboard:${draft.key}`}><Link href={`/admin/moodboards/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span>Moodboards · Saved {new Date(draft.updatedAt).toLocaleString()}</span></Link>{confirming === `moodboard:${draft.key}` ? <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" onClick={() => deleteMoodboardDraft(draft)}>Yes</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(`moodboard:${draft.key}`)}>Delete draft</button>}</li>)}{projectionDrafts.map((draft) => <li key={`projection:${draft.key}`}><Link href={`/admin/projections/new?draft=${encodeURIComponent(draft.key)}`}><strong>{draft.title}</strong><span>Projections · Saved {new Date(draft.updatedAt).toLocaleString()}</span></Link>{confirming === `projection:${draft.key}` ? <div className="admin-delete-confirm"><span>Delete?</span><Button size="small" variant="danger" type="button" onClick={() => deleteProjectionDraft(draft)}>Yes</Button><button type="button" onClick={() => setConfirming("")}>Cancel</button></div> : <button type="button" className="admin-text-action admin-text-action--danger" onClick={() => setConfirming(`projection:${draft.key}`)}>Delete draft</button>}</li>)}</ul>
      ) : <p className="admin-empty-copy">Your in-progress work will appear here automatically.</p>}
    </section>
  );
}
