"use client";

import { ArrowDown, ArrowLeft, ArrowUp, ArrowsOutCardinal, DotsSixVertical, ImageSquare, Plus, Trash, UploadSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldHint, FieldLabel, Input } from "@/components/ui/field";
import { artworkRatioOptions, listDraftSchema, newListItem, type ListDraftItem, type ListEditorInitialData } from "@/lib/admin/list-schema";
import { loadLocalListDraft, loadLocalListImage, removeLocalListDraft, removeLocalListImages, saveLocalListDraft, saveLocalListImage } from "@/lib/admin/list-draft-storage";

const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const maximumImageSize = 6 * 1024 * 1024;

function clamp(value: number, minimum: number, maximum: number) { return Math.min(maximum, Math.max(minimum, value)); }

function ItemArtwork({ draftKey, item, ratio, demo, onChange }: { draftKey: string; item: ListDraftItem; ratio: string; demo: boolean; onChange: (patch: Partial<ListDraftItem>) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; positionX: number; positionY: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const restored = useRef(false);
  const ratioValue = ratio === "square_1_1" ? "1 / 1" : ratio === "book_5_8" ? "5 / 8" : ratio === "landscape_16_9" ? "16 / 9" : "2 / 3";

  useEffect(() => {
    if (item.imageUrl || restored.current) return;
    restored.current = true;
    let objectUrl = "";
    loadLocalListImage(draftKey, item.stableItemId).then((file) => {
      if (!file) return;
      objectUrl = URL.createObjectURL(file);
      onChange({ imageUrl: objectUrl });
    });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [draftKey, item.imageUrl, item.stableItemId]);

  async function accept(file: File) {
    setError("");
    if (!allowedImages.includes(file.type)) return setError("Use JPG, PNG, WebP, AVIF, or GIF.");
    if (file.size > maximumImageSize) return setError("Choose an image 6 MB or smaller.");
    setBusy(true);
    await saveLocalListImage(draftKey, item.stableItemId, file);
    const localUrl = URL.createObjectURL(file);
    onChange({ imageUrl: localUrl });
    if (!demo) {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/assets", { method: "POST", body: form });
      const result = await response.json();
      if (response.ok) onChange({ imageAssetId: result.asset.id, imageUrl: result.asset.url });
      else setError(result.error ?? "The image could not be uploaded.");
    }
    setBusy(false);
  }

  return <div className="admin-list-artwork">
    <input ref={input} className="sr-only" type="file" accept={allowedImages.join(",")} onChange={(event) => { const file = event.target.files?.[0]; if (file) accept(file); }} />
    {item.imageUrl ? <div ref={frame} className="admin-list-artwork__crop" style={{ aspectRatio: ratioValue }} onDragStart={(event) => event.preventDefault()} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, positionX: item.imagePositionX, positionY: item.imagePositionY }; }} onPointerMove={(event) => { if (!drag.current || !frame.current) return; const bounds = frame.current.getBoundingClientRect(); onChange({ imagePositionX: clamp(drag.current.positionX - ((event.clientX - drag.current.x) / bounds.width) * 100, 0, 100), imagePositionY: clamp(drag.current.positionY - ((event.clientY - drag.current.y) / bounds.height) * 100, 0, 100) }); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <img src={item.imageUrl} alt="" draggable={false} style={{ objectPosition: `${item.imagePositionX}% ${item.imagePositionY}%`, transform: `scale(${item.imageZoom})`, transformOrigin: `${item.imagePositionX}% ${item.imagePositionY}%` }} />
      <span><ArrowsOutCardinal aria-hidden="true" /> Drag to reposition</span>
    </div> : <button className="admin-list-artwork__empty" style={{ aspectRatio: ratioValue }} type="button" onClick={() => input.current?.click()} disabled={busy}><ImageSquare aria-hidden="true" /><strong>{busy ? "Preparing…" : "Add artwork"}</strong><small>Optional</small></button>}
    {item.imageUrl ? <div className="admin-list-artwork__controls"><button type="button" onClick={() => input.current?.click()}><UploadSimple aria-hidden="true" /> Replace</button><label>Zoom <output>{Math.round(item.imageZoom * 100)}%</output><input type="range" min="100" max="300" step="5" value={Math.round(item.imageZoom * 100)} onChange={(event) => onChange({ imageZoom: Number(event.target.value) / 100 })} /></label></div> : null}
    {error ? <p className="admin-field-error">{error}</p> : null}
  </div>;
}

export function ListEditor({ initialData, demo, draftKey: requestedKey }: { initialData: ListEditorInitialData; demo: boolean; draftKey?: string }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [postId, setPostId] = useState(initialData.id);
  const draftKey = requestedKey ?? postId ?? "new";
  const [saveState, setSaveState] = useState("Not saved yet");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);
  const hydrated = useRef(false);
  const recoveryEnabled = useRef(true);

  useEffect(() => {
    const recovered = loadLocalListDraft(draftKey);
    if (recovered) { setData({ ...initialData, ...recovered }); setNotice("Recovered your last browser-saved version."); setSaveState(`Recovered ${new Date(recovered.updatedAt).toLocaleString()}`); }
    hydrated.current = true;
  }, [draftKey, initialData]);

  useEffect(() => {
    if (!hydrated.current || !recoveryEnabled.current) return;
    setSaveState("Saving in this browser…");
    const timeout = window.setTimeout(() => {
      const updated = saveLocalListDraft(draftKey, { ...data, id: postId });
      setSaveState(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, draftKey, postId]);

  useEffect(() => {
    const save = () => { if (recoveryEnabled.current) saveLocalListDraft(draftKey, { ...data, id: postId }); };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, [data, draftKey, postId]);

  const title = data.title.trim() || "Untitled list";
  const ratio = artworkRatioOptions.find((option) => option.value === data.artworkRatio);
  const validation = useMemo(() => listDraftSchema.safeParse(data), [data]);

  function updateItem(index: number, patch: Partial<ListDraftItem>) {
    setData((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= data.items.length || from === to) return;
    setData((current) => { const items = [...current.items]; const [item] = items.splice(from, 1); items.splice(to, 0, item); return { ...current, items }; });
  }

  async function persist() {
    const parsed = listDraftSchema.safeParse(data);
    if (!parsed.success) { setNotice(parsed.error.issues[0]?.message ?? "Check the missing information."); return null; }
    setBusy(true); setSaveState("Saving…");
    if (demo) { const updated = saveLocalListDraft(draftKey, data); setSaveState(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`); setBusy(false); return postId ?? "demo"; }
    const response = await fetch(postId ? `/api/admin/lists/${postId}` : "/api/admin/lists", { method: postId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "The list could not be saved."); setSaveState("Save failed"); setBusy(false); return null; }
    setPostId(result.post.id); setSaveState("Saved to Second Viewing"); setBusy(false);
    if (!postId) router.replace(`/admin/lists/${result.post.id}`);
    return result.post.id as string;
  }

  async function publish() {
    const id = await persist();
    if (!id || demo) { if (demo) setNotice("This local preview cannot publish live."); return; }
    setBusy(true);
    const response = await fetch(`/api/admin/lists/${id}/publish`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error === "another live list already uses this Type and Period" ? "A live list already uses this Type and Period. Change one of those fields before publishing." : result.error ?? "The list could not be published."); setBusy(false); return; }
    recoveryEnabled.current = false; removeLocalListDraft(draftKey); if (id !== draftKey) removeLocalListDraft(id);
    await removeLocalListImages(draftKey, data.items.map((item) => item.stableItemId));
    router.push("/admin/lists");
  }

  return <main className="admin-editor-page admin-list-editor-page">
    <header className="admin-editor-header"><div className="admin-editor-header__identity"><Link href="/admin/lists" aria-label="Back to Lists"><ArrowLeft aria-hidden="true" /></Link><div><p>Lists</p><h1>{title}</h1></div></div><div className="admin-editor-header__actions"><span className="admin-save-state" aria-live="polite">{saveState}</span><Button variant="secondary" type="button" disabled={busy} onClick={persist}>Save draft</Button><Button type="button" disabled={busy} onClick={publish}>{busy ? "Working…" : initialData.status === "published" || initialData.status === "published_with_changes" ? "Republish" : "Publish"}</Button></div></header>
    {notice ? <div className="admin-editor-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")}>Dismiss</button></div> : null}
    <div className="admin-list-editor-layout">
      <section className="admin-editor-section admin-list-settings"><div className="admin-editor-section__heading"><span>1</span><div><h2>List settings</h2><p>Name the list and decide how readers will find it.</p></div></div>
        <div className="admin-list-settings__grid">
          <div className="admin-field admin-list-settings__title"><FieldLabel htmlFor="list-title">List title</FieldLabel><Input id="list-title" value={data.title} onChange={(event) => setData({ ...data, title: event.target.value })} /><FieldHint>This can be more specific than Type and Period.</FieldHint></div>
          <div className="admin-field admin-list-settings__type"><FieldLabel htmlFor="list-type">Type</FieldLabel><Input id="list-type" list="list-type-suggestions" value={data.typeLabel} onChange={(event) => setData({ ...data, typeLabel: event.target.value })} /><datalist id="list-type-suggestions"><option value="Films" /><option value="Albums" /><option value="Books" /></datalist><FieldHint>Custom values automatically appear in the public filter.</FieldHint></div>
          <div className="admin-field admin-list-settings__period"><FieldLabel htmlFor="list-period">Period</FieldLabel><Input id="list-period" list="list-period-suggestions" value={data.periodLabel} onChange={(event) => setData({ ...data, periodLabel: event.target.value })} /><datalist id="list-period-suggestions"><option value="2026" /><option value="2025" /><option value="2024" /><option value="All time" /><option value="Mid 1990s" /></datalist><FieldHint>Custom values, such as Mid 1990s, automatically appear in the public filter.</FieldHint></div>
          <div className="admin-field admin-list-settings__creator"><FieldLabel htmlFor="creator-label">Creator Type</FieldLabel><Input id="creator-label" value={data.creatorLabel} onChange={(event) => setData({ ...data, creatorLabel: event.target.value })} placeholder="Director" /><FieldHint>For example: Director, Author, or Artist.</FieldHint></div>
          <div className="admin-field admin-list-settings__artwork"><FieldLabel htmlFor="artwork-ratio">Poster Format</FieldLabel><select id="artwork-ratio" value={data.artworkRatio} onChange={(event) => setData({ ...data, artworkRatio: event.target.value as ListEditorInitialData["artworkRatio"] })}>{artworkRatioOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <label className="admin-checkbox admin-list-settings__rankings"><input type="checkbox" checked={data.showRanks} onChange={(event) => setData({ ...data, showRanks: event.target.checked })} /><span><strong>Show rankings</strong><small>Turn this off for an ordered but unranked collection. Drag order is preserved either way.</small></span></label>
        </div>
      </section>
      <section className="admin-editor-section"><div className="admin-editor-section__heading admin-list-items-heading"><span>2</span><div><h2>Items</h2><p>Arrange 1–20 entries. Reorder with the grip handle or arrow buttons.</p></div><strong>{data.items.length} / 20</strong></div>
        <div className="admin-list-items">{data.items.map((item, index) => <article className={`admin-list-item${dragged === index ? " is-dragging" : ""}`} key={item.stableItemId} onDragOver={(event) => { if (dragged !== null) event.preventDefault(); }} onDrop={() => { if (dragged !== null) moveItem(dragged, index); setDragged(null); }}>
          <div className="admin-list-item__order"><div className="admin-list-item__drag-handle" draggable aria-hidden="true" title="Drag to reorder" onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.stableItemId); setDragged(index); }} onDragEnd={() => setDragged(null)}><DotsSixVertical /></div><span>{data.showRanks ? index + 1 : "•"}</span><div><button type="button" aria-label={`Move ${item.title || `item ${index + 1}`} up`} disabled={index === 0} onClick={() => moveItem(index, index - 1)}><ArrowUp /></button><button type="button" aria-label={`Move ${item.title || `item ${index + 1}`} down`} disabled={index === data.items.length - 1} onClick={() => moveItem(index, index + 1)}><ArrowDown /></button></div></div>
          <ItemArtwork draftKey={draftKey} item={item} ratio={data.artworkRatio} demo={demo} onChange={(patch) => updateItem(index, patch)} />
          <div className="admin-list-item__fields"><div className="admin-field"><FieldLabel htmlFor={`item-title-${item.stableItemId}`}>Title</FieldLabel><Input id={`item-title-${item.stableItemId}`} value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} /></div><div className="admin-list-item__field-row"><div className="admin-field"><FieldLabel htmlFor={`creator-${item.stableItemId}`}>{data.creatorLabel || "Creator"}</FieldLabel><Input id={`creator-${item.stableItemId}`} value={item.creator} onChange={(event) => updateItem(index, { creator: event.target.value })} /></div><div className="admin-field"><FieldLabel htmlFor={`year-${item.stableItemId}`}>Year</FieldLabel><Input id={`year-${item.stableItemId}`} value={item.year} onChange={(event) => updateItem(index, { year: event.target.value })} /></div></div><div className="admin-field"><FieldLabel htmlFor={`alt-${item.stableItemId}`}>Image description</FieldLabel><Input id={`alt-${item.stableItemId}`} value={item.imageAlt} onChange={(event) => updateItem(index, { imageAlt: event.target.value })} placeholder="Describe the artwork for readers who cannot see it" /></div><div className="admin-field"><FieldLabel htmlFor={`url-${item.stableItemId}`}>External link <small>Optional</small></FieldLabel><Input id={`url-${item.stableItemId}`} type="url" value={item.externalUrl} onChange={(event) => updateItem(index, { externalUrl: event.target.value })} placeholder="https://…" /><FieldHint>Only appears in Poster View when supplied.</FieldHint></div></div>
          <button className="admin-list-item__remove" type="button" aria-label={`Remove ${item.title || `item ${index + 1}`}`} disabled={data.items.length === 1} onClick={() => setData({ ...data, items: data.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash aria-hidden="true" /></button>
        </article>)}</div>
        <button className="admin-add-list-item" type="button" disabled={data.items.length >= 20} onClick={() => setData({ ...data, items: [...data.items, newListItem()] })}><Plus aria-hidden="true" /> {data.items.length >= 20 ? "20-item maximum reached" : "Add another item"}</button>
      </section>
      <aside className="admin-list-preview"><p className="admin-eyebrow">Live structure preview</p><h2>{title}</h2><dl><div><dt>Type</dt><dd>{data.typeLabel || "—"}</dd></div><div><dt>Period</dt><dd>{data.periodLabel || "—"}</dd></div><div><dt>Format</dt><dd>{ratio?.label}</dd></div><div><dt>Rank circles</dt><dd>{data.showRanks ? "Shown" : "Hidden"}</dd></div></dl><p>Images remain optional. Missing artwork uses a neutral placeholder until the list is edited.</p>{!validation.success ? <strong>{validation.error.issues[0]?.message}</strong> : <strong>Ready to save</strong>}</aside>
    </div>
  </main>;
}
