"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowSquareOut,
  ImageSquare,
  TextB,
  TextItalic,
  TextHTwo,
  Quotes,
  ListBullets,
  ListNumbers,
  UploadSimple,
} from "@phosphor-icons/react";
import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldHint, FieldLabel, Input } from "@/components/ui/field";
import {
  filmDraftSchema,
  type FilmDraft,
  type FilmEditorInitialData,
} from "@/lib/admin/film-schema";
import {
  loadDraftImage,
  loadLocalDraft,
  removeDraftImage,
  removeLocalDraft,
  saveDraftImage,
  saveLocalDraft,
} from "@/lib/admin/draft-storage";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const maximumImageSize = 6 * 1024 * 1024;

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function clampZoom(value: number) {
  return Math.min(3, Math.max(1, value));
}

function EditorToolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"), italic: current.isActive("italic"),
      heading: current.isActive("heading", { level: 2 }), quote: current.isActive("blockquote"),
      bullets: current.isActive("bulletList"), numbers: current.isActive("orderedList"),
    }),
  });
  const tools = [
    ["Bold", TextB, state.bold, () => editor.chain().focus().toggleBold().run()],
    ["Italic", TextItalic, state.italic, () => editor.chain().focus().toggleItalic().run()],
    ["Heading", TextHTwo, state.heading, () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ["Quote", Quotes, state.quote, () => editor.chain().focus().toggleBlockquote().run()],
    ["Bulleted list", ListBullets, state.bullets, () => editor.chain().focus().toggleBulletList().run()],
    ["Numbered list", ListNumbers, state.numbers, () => editor.chain().focus().toggleOrderedList().run()],
  ] as const;

  return <div className="admin-editor-toolbar" role="toolbar" aria-label="Body formatting">{tools.map(([label, Icon, active, action]) => <button key={label} type="button" aria-label={label} aria-pressed={active} onClick={action}><Icon aria-hidden="true" /></button>)}</div>;
}

export function FilmEditor({
  initialData,
  demo,
  draftKey: requestedDraftKey,
}: {
  initialData: FilmEditorInitialData;
  demo: boolean;
  draftKey?: string;
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
  const imageFrame = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ x: number; y: number; positionX: number; positionY: number } | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchOrigin = useRef<{ distance: number; zoom: number } | null>(null);

  const { register, control, reset, setValue, getValues, handleSubmit, formState: { errors } } = useForm<FilmDraft>({
    resolver: zodResolver(filmDraftSchema),
    defaultValues: initialData,
  });
  const values = useWatch({ control }) as FilmDraft;

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: initialData.body,
    immediatelyRender: false,
    editorProps: { attributes: { class: "admin-rich-text", "aria-label": "Article body" } },
    onUpdate: ({ editor: current }) => setValue("body", current.getJSON(), { shouldDirty: true }),
  });

  useEffect(() => {
    let objectUrl = "";
    async function restore() {
      const recovered = loadLocalDraft(draftKey);
      if (recovered) {
        reset({ ...initialData, ...recovered, coverZoom: recovered.coverZoom ?? 1 });
        editor?.commands.setContent(recovered.body);
        setNotice("Recovered your last browser-saved version.");
        setSaveState("saved");
        setSaveLabel(`Recovered ${new Date(recovered.updatedAt).toLocaleString()}`);
      }
      const image = await loadDraftImage(draftKey);
      if (image) {
        objectUrl = URL.createObjectURL(image);
        setCoverUrl(objectUrl);
      }
      hydrated.current = true;
    }
    restore();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [draftKey, editor, reset]);

  useEffect(() => {
    if (!hydrated.current || !recoveryEnabled.current || !values) return;
    setSaveState("saving");
    setSaveLabel("Saving in this browser…");
    const timeout = window.setTimeout(() => {
      if (!recoveryEnabled.current) return;
      try {
        const updated = saveLocalDraft(draftKey, { ...values, id: postId, slug: initialData.slug, status: initialData.status, coverUrl: initialData.coverUrl });
        setSaveState("saved");
        setSaveLabel(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      } catch {
        setSaveState("error");
        setSaveLabel("Browser recovery save failed");
      }
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [values, draftKey, postId, initialData.slug, initialData.status, initialData.coverUrl]);

  useEffect(() => {
    function saveBeforeLeaving() {
      if (!hydrated.current || !recoveryEnabled.current) return;
      saveLocalDraft(draftKey, {
        ...getValues(),
        id: postId,
        slug: initialData.slug,
        status: initialData.status,
        coverUrl: initialData.coverUrl,
      });
    }
    window.addEventListener("pagehide", saveBeforeLeaving);
    return () => window.removeEventListener("pagehide", saveBeforeLeaving);
  }, [draftKey, getValues, initialData.coverUrl, initialData.slug, initialData.status, postId]);

  const title = values?.title?.trim() || "Untitled film essay";
  const positionX = values?.coverPositionX ?? 50;
  const positionY = values?.coverPositionY ?? 50;
  const zoom = values?.coverZoom ?? 1;

  useEffect(() => {
    const frame = imageFrame.current;
    if (!frame || !coverUrl) return;

    function zoomWithTrackpad(event: WheelEvent) {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const currentZoom = getValues("coverZoom") ?? 1;
      setValue("coverZoom", clampZoom(currentZoom - event.deltaY * 0.01), { shouldDirty: true });
    }

    frame.addEventListener("wheel", zoomWithTrackpad, { passive: false });
    return () => frame.removeEventListener("wheel", zoomWithTrackpad);
  }, [coverUrl, getValues, setValue]);

  async function acceptImage(file: File) {
    setNotice("");
    if (!acceptedImageTypes.includes(file.type)) return setNotice("Choose a JPG, PNG, WebP, AVIF, or GIF image.");
    if (file.size > maximumImageSize) return setNotice("This image is over 6 MB. Export a smaller web copy and try again.");
    setImageBusy(true);
    await saveDraftImage(draftKey, file);
    setCoverUrl((current) => { if (current.startsWith("blob:")) URL.revokeObjectURL(current); return URL.createObjectURL(file); });

    if (!demo) {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/assets", { method: "POST", body: formData });
      const result = await response.json();
      if (response.ok) {
        setValue("coverAssetId", result.asset.id, { shouldDirty: true });
        setCoverUrl(result.asset.url);
      } else setNotice(result.error ?? "The image could not be uploaded.");
    }
    setImageBusy(false);
  }

  function startImageDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!coverUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size === 2) {
      const [first, second] = Array.from(activePointers.current.values());
      pinchOrigin.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        zoom,
      };
      dragOrigin.current = null;
      return;
    }

    dragOrigin.current = { x: event.clientX, y: event.clientY, positionX, positionY };
  }

  function moveImage(event: React.PointerEvent<HTMLDivElement>) {
    if (!activePointers.current.has(event.pointerId) || !imageFrame.current) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size >= 2 && pinchOrigin.current) {
      const [first, second] = Array.from(activePointers.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (pinchOrigin.current.distance > 0) {
        setValue("coverZoom", clampZoom(pinchOrigin.current.zoom * (distance / pinchOrigin.current.distance)), { shouldDirty: true });
      }
      return;
    }

    if (!dragOrigin.current) return;
    const bounds = imageFrame.current.getBoundingClientRect();
    setValue("coverPositionX", clamp(dragOrigin.current.positionX - ((event.clientX - dragOrigin.current.x) / bounds.width) * 100), { shouldDirty: true });
    setValue("coverPositionY", clamp(dragOrigin.current.positionY - ((event.clientY - dragOrigin.current.y) / bounds.height) * 100), { shouldDirty: true });
  }

  function endImageGesture(event: React.PointerEvent<HTMLDivElement>) {
    activePointers.current.delete(event.pointerId);
    dragOrigin.current = null;
    pinchOrigin.current = null;

    const remaining = Array.from(activePointers.current.values())[0];
    if (remaining) {
      dragOrigin.current = {
        x: remaining.x,
        y: remaining.y,
        positionX: getValues("coverPositionX"),
        positionY: getValues("coverPositionY"),
      };
    }
  }

  function handleImageKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "+" && event.key !== "=" && event.key !== "-") return;
    event.preventDefault();
    setValue("coverZoom", clampZoom(zoom + (event.key === "-" ? -0.1 : 0.1)), { shouldDirty: true });
  }

  async function persistDraft(data: FilmDraft) {
    setSaveState("saving");
    if (demo) {
      const updated = saveLocalDraft(draftKey, data);
      setSaveState("saved");
      setSaveLabel(`Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      return postId ?? null;
    }
    const response = await fetch(postId ? `/api/admin/films/${postId}` : "/api/admin/films", {
      method: postId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      setSaveState("error");
      setNotice(result.error ?? "The draft could not be saved.");
      return null;
    }
    setPostId(result.post.id);
    setSaveState("saved");
    setSaveLabel("Saved to Second Viewing");
    if (!postId) router.replace(`/admin/films/${result.post.id}`);
    return result.post.id as string;
  }

  const saveDraft = handleSubmit(persistDraft, () => setNotice("Add the missing information before saving."));

  const publish = handleSubmit(async (data) => {
    if (!coverUrl) return setNotice("Add a cover image before publishing.");
    const id = await persistDraft(data);
    if (!id || demo) {
      if (demo) setNotice("This is a local preview. Connect Supabase to publish live.");
      return;
    }
    const response = await fetch(`/api/admin/films/${id}/publish`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error ?? "The essay could not be published.");
    recoveryEnabled.current = false;
    removeLocalDraft(draftKey);
    if (id !== draftKey) removeLocalDraft(id);
    await Promise.all([
      removeDraftImage(draftKey),
      id !== draftKey ? removeDraftImage(id) : Promise.resolve(),
    ]);
    router.push("/admin/films");
  }, () => setNotice("Add the missing information before publishing."));

  return (
    <main className="admin-editor-page">
      <header className="admin-editor-header">
        <div className="admin-editor-header__identity"><Link href="/admin/films" aria-label="Back to Film Thoughts"><ArrowLeft aria-hidden="true" /></Link><div><p>Film Thoughts</p><h1>{title}</h1></div></div>
        <div className="admin-editor-header__actions"><span className={`admin-save-state admin-save-state--${saveState}`} aria-live="polite">{saveLabel}</span>{initialData.slug ? <Link className="admin-preview-link" href={`/films/${initialData.slug}`} target="_blank">Preview <ArrowSquareOut aria-hidden="true" /></Link> : null}<Button variant="secondary" type="button" onClick={saveDraft}>Save draft</Button><Button type="button" onClick={publish}>Publish</Button></div>
      </header>
      {notice ? <div className="admin-editor-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")}>Dismiss</button></div> : null}

      <form className="admin-editor-layout" onSubmit={(event) => event.preventDefault()}>
        <div className="admin-editor-main">
          <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>1</span><div><h2>Story</h2><p>The title and short introduction readers see first.</p></div></div><div className="admin-field"><FieldLabel htmlFor="film-title">Headline</FieldLabel><Input id="film-title" placeholder="The Empty Room in Aftersun" {...register("title")} /><FieldHint>Up to 160 characters.</FieldHint>{errors.title ? <p className="admin-field-error">{errors.title.message}</p> : null}</div><div className="admin-field"><FieldLabel htmlFor="film-subtitle">Subheader</FieldLabel><Input id="film-subtitle" placeholder="Memory, grief, and the image that arrives too late." {...register("subtitle")} /><FieldHint>A concise sentence that appears on the index and article page.</FieldHint></div></section>

          <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>2</span><div><h2>Cover image</h2><p>Drop in an image, then drag and zoom to choose what readers see.</p></div></div><div className={`admin-image-uploader${coverUrl ? " admin-image-uploader--filled" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) acceptImage(file); }}><input ref={fileInput} className="sr-only" type="file" accept={acceptedImageTypes.join(",")} onChange={(event) => { const file = event.target.files?.[0]; if (file) acceptImage(file); }} />{coverUrl ? <><div ref={imageFrame} className="admin-image-crop" tabIndex={0} role="img" aria-label="Cover crop preview. Drag to reposition. Pinch, use a trackpad, or use the zoom slider to zoom." onPointerDown={startImageDrag} onPointerMove={moveImage} onPointerUp={endImageGesture} onPointerCancel={endImageGesture} onKeyDown={handleImageKeyDown}><img src={coverUrl} alt="" draggable={false} style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})`, transformOrigin: `${positionX}% ${positionY}%` }} /><span>Drag to reposition · pinch to zoom</span></div><div className="admin-image-controls"><Button variant="secondary" size="small" type="button" onClick={() => fileInput.current?.click()}><UploadSimple aria-hidden="true" /> Replace image</Button><label>Zoom <output>{Math.round(zoom * 100)}%</output><input type="range" min="100" max="300" step="5" value={Math.round(zoom * 100)} onChange={(event) => setValue("coverZoom", Number(event.target.value) / 100, { shouldDirty: true })} /></label></div></> : <button type="button" className="admin-image-empty" onClick={() => fileInput.current?.click()} disabled={imageBusy}><ImageSquare aria-hidden="true" /><strong>{imageBusy ? "Preparing image…" : "Drop an image here"}</strong><span>or choose from your computer</span><small>JPG, PNG, WebP, AVIF, or GIF · up to 6 MB</small></button>}</div></section>

          <section className="admin-editor-section"><div className="admin-editor-section__heading"><span>3</span><div><h2>Body</h2><p>Write or paste the full article. Formatting stays deliberately simple.</p></div></div>{editor ? <div className="admin-body-editor"><EditorToolbar editor={editor} /><EditorContent editor={editor} /></div> : <div className="admin-body-editor admin-body-editor--loading">Opening the editor…</div>}</section>
        </div>

        <aside className="admin-editor-aside"><div className="admin-editor-aside__card"><p className="admin-eyebrow">Publication details</p><div className="admin-field"><FieldLabel htmlFor="film-name">Film title</FieldLabel><Input id="film-name" placeholder="Aftersun" {...register("filmTitle")} /></div><div className="admin-field"><FieldLabel htmlFor="film-director">Director</FieldLabel><Input id="film-director" placeholder="Charlotte Wells" {...register("director")} /></div><div className="admin-field"><FieldLabel htmlFor="film-year">Film year</FieldLabel><Controller name="filmYear" control={control} render={({ field }) => <Input id="film-year" type="number" min="1888" max="2200" placeholder="2022" value={field.value ?? ""} onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} />} /></div><div className="admin-field"><FieldLabel htmlFor="published-at">Publication date</FieldLabel><Controller name="publishedAt" control={control} render={({ field }) => <Input id="published-at" type="date" value={field.value ?? ""} onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.value || null)} />} /><FieldHint>Leave blank to use the day you publish.</FieldHint></div><label className="admin-checkbox"><input type="checkbox" {...register("featured")} /><span><strong>Feature this essay</strong><small>Keep it at the top of Film Thoughts.</small></span></label></div><div className="admin-editor-aside__card admin-safety-card"><strong>Your work is protected.</strong><p>A recovery copy is saved in this browser as you type. Once Supabase is connected, saved drafts are also kept in the central workspace.</p></div></aside>
      </form>
    </main>
  );
}
