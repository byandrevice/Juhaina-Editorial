"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowSquareOut, ImageSquare, TextB, TextHTwo, TextItalic, UploadSimple } from "@phosphor-icons/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldHint, FieldLabel, Input } from "@/components/ui/field";
import {
  loadLocalProjectionDraft, loadLocalProjectionImage, removeLocalProjectionDraft,
  removeLocalProjectionImage, saveLocalProjectionDraft, saveLocalProjectionImage,
} from "@/lib/admin/projection-draft-storage";
import { projectionDraftSchema, type ProjectionDraft, type ProjectionEditorInitialData } from "@/lib/admin/projection-schema";

const accepted = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const maximumSize = 6 * 1024 * 1024;

function ProjectionToolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const state = useEditorState({ editor, selector: ({ editor: current }) => ({
    bold: current.isActive("bold"), italic: current.isActive("italic"), heading: current.isActive("heading", { level: 2 }),
  }) });
  return <div className="admin-editor-toolbar" role="toolbar" aria-label="Body formatting">
    <button type="button" aria-label="Bold" aria-pressed={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><TextB /></button>
    <button type="button" aria-label="Italic" aria-pressed={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><TextItalic /></button>
    <button type="button" aria-label="Heading" aria-pressed={state.heading} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><TextHTwo /></button>
  </div>;
}

export function ProjectionEditor({ initialData, demo, draftKey: requestedDraftKey }: {
  initialData: ProjectionEditorInitialData; demo: boolean; draftKey?: string;
}) {
  const router = useRouter();
  const [postId, setPostId] = useState(initialData.id);
  const draftKey = requestedDraftKey ?? postId ?? "new";
  const [coverUrl, setCoverUrl] = useState(initialData.coverUrl ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveLabel, setSaveLabel] = useState("Not saved yet");
  const [notice, setNotice] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const hydrated = useRef(false);
  const recoveryEnabled = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);

  const { register, control, reset, setValue, handleSubmit, formState: { errors } } = useForm<ProjectionDraft>({
    resolver: zodResolver(projectionDraftSchema), defaultValues: initialData,
  });
  const values = useWatch({ control }) as ProjectionDraft;
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: initialData.body, immediatelyRender: false,
    editorProps: { attributes: { class: "admin-rich-text", "aria-label": "Article body" } },
    onUpdate: ({ editor: current }) => setValue("body", current.getJSON(), { shouldDirty: true }),
  });

  useEffect(() => {
    let objectUrl = "";
    async function restore() {
      const recovered = loadLocalProjectionDraft(draftKey);
      if (recovered) {
        reset({ ...initialData, ...recovered }); editor?.commands.setContent(recovered.body);
        setNotice("Recovered your last browser-saved version."); setSaveState("saved");
        setSaveLabel(`Recovered ${new Date(recovered.updatedAt).toLocaleString()}`);
      }
      const image = await loadLocalProjectionImage(draftKey);
      if (image) { objectUrl = URL.createObjectURL(image); setCoverUrl(objectUrl); }
      hydrated.current = true;
    }
    void restore();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [draftKey, editor, initialData, reset]);

  useEffect(() => {
    if (!hydrated.current || !recoveryEnabled.current || !values) return;
    setSaveState("saving"); setSaveLabel("Saving in this browser…");
    const timeout = window.setTimeout(() => {
      try {
        const updated = saveLocalProjectionDraft(draftKey, { ...values, id: postId, slug: initialData.slug, status: initialData.status, coverUrl: initialData.coverUrl });
        setSaveState("saved"); setSaveLabel(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      } catch { setSaveState("error"); setSaveLabel("Browser recovery save failed"); }
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [draftKey, initialData.coverUrl, initialData.slug, initialData.status, postId, values]);

  async function acceptImage(file: File) {
    setNotice("");
    if (!accepted.includes(file.type)) return setNotice("Choose a JPG, PNG, WebP, AVIF, or GIF image.");
    if (file.size > maximumSize) return setNotice("This image is over 6 MB. Export a smaller web copy and try again.");
    setImageBusy(true); await saveLocalProjectionImage(draftKey, file);
    setCoverUrl((current) => { if (current.startsWith("blob:")) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
    if (!demo) {
      const formData = new FormData(); formData.set("file", file);
      const response = await fetch("/api/admin/assets", { method: "POST", body: formData });
      const result = await response.json();
      if (response.ok) { setValue("coverAssetId", result.asset.id, { shouldDirty: true }); setCoverUrl(result.asset.url); }
      else setNotice(result.error ?? "The image could not be uploaded.");
    }
    setImageBusy(false);
  }

  async function persistDraft(data: ProjectionDraft) {
    setSaveState("saving"); setNotice("");
    if (demo) {
      const updated = saveLocalProjectionDraft(draftKey, data); setSaveState("saved");
      setSaveLabel(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      return postId ?? null;
    }
    const response = await fetch(postId ? `/api/admin/projections/${postId}` : "/api/admin/projections", {
      method: postId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) { setSaveState("error"); setNotice(result.error ?? "The draft could not be saved."); return null; }
    setPostId(result.post.id); setSaveState("saved"); setSaveLabel("Saved to Second Viewing");
    if (!postId) router.replace(`/admin/projections/${result.post.id}`);
    return result.post.id as string;
  }

  const saveDraft = handleSubmit(persistDraft, () => setNotice("Add the missing information before saving."));
  const publish = handleSubmit(async (data) => {
    if (!coverUrl) return setNotice("Add a cover image before publishing.");
    if (!data.imageAlt.trim()) return setNotice("Add an image description before publishing.");
    const id = await persistDraft(data);
    if (!id || demo) { if (demo) setNotice("This is a local preview. Connect Supabase to publish live."); return; }
    const response = await fetch(`/api/admin/projections/${id}/publish`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error ?? "The projection could not be published.");
    recoveryEnabled.current = false; removeLocalProjectionDraft(draftKey);
    if (id !== draftKey) removeLocalProjectionDraft(id);
    await Promise.all([removeLocalProjectionImage(draftKey), id !== draftKey ? removeLocalProjectionImage(id) : Promise.resolve()]);
    router.push("/admin/projections");
  }, () => setNotice("Add the missing information before publishing."));

  const title = values?.title?.trim() || "Untitled projection";
  const positionX = values?.coverPositionX ?? 50;
  const positionY = values?.coverPositionY ?? 50;
  const zoom = values?.coverZoom ?? 1;

  return <main className="admin-editor-page">
    <header className="admin-editor-header"><div className="admin-editor-header__identity"><Link href="/admin/projections" aria-label="Back to Projections"><ArrowLeft /></Link><div><p>Projections</p><h1>{title}</h1></div></div><div className="admin-editor-header__actions"><span className={`admin-save-state admin-save-state--${saveState}`} aria-live="polite">{saveLabel}</span>{initialData.slug ? <Link className="admin-preview-link" href={`/projections/${initialData.slug}`} target="_blank">Preview <ArrowSquareOut /></Link> : null}<Button variant="secondary" type="button" onClick={saveDraft}>Save draft</Button><Button type="button" onClick={publish}>Publish</Button></div></header>
    {notice ? <div className="admin-editor-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")}>Dismiss</button></div> : null}
    <form className="admin-editor-layout" onSubmit={(event) => event.preventDefault()}>
      <div className="admin-editor-main">
        <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>1</span><div><h2>Story</h2><p>The headline and introduction readers see first.</p></div></div><div className="admin-field"><FieldLabel htmlFor="projection-title">Headline</FieldLabel><Input id="projection-title" {...register("title")} />{errors.title ? <p className="admin-field-error">{errors.title.message}</p> : null}</div><div className="admin-field"><FieldLabel htmlFor="projection-excerpt">Subheader</FieldLabel><Input id="projection-excerpt" {...register("excerpt")} /><FieldHint>Up to 280 characters.</FieldHint></div></section>
        <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>2</span><div><h2>Cover image</h2><p>Upload an image and tune its focal position for the approved layout.</p></div></div><div className={`admin-image-uploader${coverUrl ? " admin-image-uploader--filled" : ""}`}><input ref={fileInput} className="sr-only" type="file" accept={accepted.join(",")} onChange={(event) => { const file = event.target.files?.[0]; if (file) void acceptImage(file); }} />{coverUrl ? <><div className="admin-image-crop"><img src={coverUrl} alt="" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})`, transformOrigin: `${positionX}% ${positionY}%` }} /></div><Button variant="secondary" size="small" type="button" onClick={() => fileInput.current?.click()}><UploadSimple /> Replace image</Button></> : <button type="button" className="admin-image-empty" disabled={imageBusy} onClick={() => fileInput.current?.click()}><ImageSquare /><strong>{imageBusy ? "Preparing image…" : "Choose a cover image"}</strong><small>JPG, PNG, WebP, AVIF, or GIF · up to 6 MB</small></button>}</div><div className="admin-field"><FieldLabel htmlFor="projection-alt">Image description</FieldLabel><Input id="projection-alt" {...register("imageAlt")} /><FieldHint>Describe the image for readers who cannot see it.</FieldHint></div><div className="admin-image-controls"><label>Horizontal focal point <output>{Math.round(positionX)}%</output><input type="range" min="0" max="100" value={positionX} onChange={(event) => setValue("coverPositionX", Number(event.target.value), { shouldDirty: true })} /></label><label>Vertical focal point <output>{Math.round(positionY)}%</output><input type="range" min="0" max="100" value={positionY} onChange={(event) => setValue("coverPositionY", Number(event.target.value), { shouldDirty: true })} /></label><label>Zoom <output>{Math.round(zoom * 100)}%</output><input type="range" min="100" max="300" step="5" value={Math.round(zoom * 100)} onChange={(event) => setValue("coverZoom", Number(event.target.value) / 100, { shouldDirty: true })} /></label></div></section>
        <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>3</span><div><h2>Body</h2><p>Write or paste the complete article.</p></div></div>{editor ? <div className="admin-body-editor"><ProjectionToolbar editor={editor} /><EditorContent editor={editor} /></div> : <div className="admin-body-editor admin-body-editor--loading">Opening the editor…</div>}</section>
      </div>
      <aside className="admin-editor-aside"><div className="admin-editor-aside__card"><p className="admin-eyebrow">Publication details</p><div className="admin-field"><FieldLabel htmlFor="projection-subject">Subject</FieldLabel><Input id="projection-subject" {...register("subjectTitle")} /></div><div className="admin-field"><FieldLabel htmlFor="projection-creator">Creator or source</FieldLabel><Input id="projection-creator" {...register("creator")} /></div><div className="admin-field"><FieldLabel htmlFor="projection-year">Subject year</FieldLabel><Controller name="subjectYear" control={control} render={({ field }) => <Input id="projection-year" type="number" min="1000" max="2200" value={field.value ?? ""} onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} />} /></div><div className="admin-field"><FieldLabel htmlFor="projection-reading-time">Reading time</FieldLabel><Controller name="readingTime" control={control} render={({ field }) => <Input id="projection-reading-time" type="number" min="1" max="120" value={field.value} onBlur={field.onBlur} onChange={(event) => field.onChange(Number(event.target.value))} />} /><FieldHint>Minutes.</FieldHint></div><div className="admin-field"><FieldLabel htmlFor="projection-date">Publication date</FieldLabel><Controller name="publishedAt" control={control} render={({ field }) => <Input id="projection-date" type="date" value={field.value ?? ""} onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.value || null)} />} /></div></div><div className="admin-editor-aside__card admin-safety-card"><strong>Your work is protected.</strong><p>A browser recovery copy is saved while you type. Save draft writes the canonical copy to Supabase.</p></div></aside>
    </form>
  </main>;
}
