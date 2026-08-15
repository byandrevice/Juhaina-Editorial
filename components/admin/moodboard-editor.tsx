"use client";

import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowsInSimple,
  ArrowsOutSimple,
  Copy,
  DotsSixVertical,
  Eye,
  EyeSlash,
  ImageSquare,
  Lock,
  LockOpen,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldHint, FieldLabel, Input } from "@/components/ui/field";
import {
  loadDemoMoodboardCategories,
  loadLocalMoodboardDraft,
  loadLocalMoodboardImage,
  MOODBOARD_CATEGORIES_CHANGED_EVENT,
  MOODBOARD_CATEGORY_STORAGE_KEY,
  removeLocalMoodboardDraft,
  removeLocalMoodboardImages,
  saveLocalMoodboardDraft,
  saveLocalMoodboardImage,
} from "@/lib/admin/moodboard-draft-storage";
import {
  MAX_MOODBOARD_LAYERS,
  MOODBOARD_HEIGHT,
  MOODBOARD_WIDTH,
  moodboardDraftSchema,
  moodboardPublishSchema,
  type AdminMoodboardCategory,
  type MoodboardEditorInitialData,
  type MoodboardLayerDraft,
} from "@/lib/admin/moodboard-schema";

const maximumImageSize = 25 * 1024 * 1024;
const acceptedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".apng",
  ".webp",
  ".avif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
];
const acceptValue =
  "image/jpeg,image/png,image/apng,image/webp,image/avif,image/heic,image/heif,image/tiff,image/bmp,.heic,.heif,.tif,.tiff,.bmp";
const commonPreviewTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/apng",
  "image/webp",
  "image/avif",
]);

type Gesture = {
  layerId: string;
  mode: "move" | "resize";
  handle?: "nw" | "ne" | "sw" | "se";
  startX: number;
  startY: number;
  scale: number;
  original: MoodboardLayerDraft;
  before: MoodboardEditorInitialData;
};

type InspectorDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type LayerContextMenu = {
  layerId: string;
  x: number;
  y: number;
};

type LayerListDrag = {
  pointerId: number;
  sourceId: string;
  startX: number;
  startY: number;
  before: MoodboardEditorInitialData;
  list: HTMLOListElement;
  active: boolean;
  changed: boolean;
};

type CanvasView = {
  scale: number;
  x: number;
  y: number;
};

type CanvasPinch = {
  anchorX: number;
  anchorY: number;
  startDistance: number;
  startScale: number;
};

type CanvasPan = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));
const round = (value: number) => Math.round(value * 100) / 100;
const clone = (value: MoodboardEditorInitialData) => structuredClone(value);

async function imageDimensions(url: string) {
  const response = await fetch(url);
  const bitmap = await createImageBitmap(await response.blob());
  const result = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return result;
}

async function renderMoodboard(
  data: MoodboardEditorInitialData,
  width: number,
) {
  const height = Math.round((width * MOODBOARD_HEIGHT) / MOODBOARD_WIDTH);
  const scale = width / MOODBOARD_WIDTH;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("This browser could not prepare the moodboard image.");
  context.fillStyle = data.backgroundColor;
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  for (const layer of data.layers) {
    if (!layer.visible || !layer.imageUrl) continue;
    const response = await fetch(layer.imageUrl);
    const bitmap = await createImageBitmap(await response.blob());
    const x = layer.x * scale;
    const y = layer.y * scale;
    const layerWidth = layer.width * scale;
    const layerHeight = layer.height * scale;
    context.save();
    context.globalAlpha = layer.opacity;
    context.translate(x + layerWidth / 2, y + layerHeight / 2);
    context.rotate((layer.rotation * Math.PI) / 180);
    context.drawImage(
      bitmap,
      -layerWidth / 2,
      -layerHeight / 2,
      layerWidth,
      layerHeight,
    );
    context.restore();
    bitmap.close();
  }
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The moodboard image could not be rendered.")),
      "image/webp",
      0.92,
    ),
  );
}

export function MoodboardEditor({
  initialData,
  categories,
  demo,
  draftKey: requestedKey,
}: {
  initialData: MoodboardEditorInitialData;
  categories: AdminMoodboardCategory[];
  demo: boolean;
  draftKey?: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stageWrap = useRef<HTMLDivElement>(null);
  const fullscreenHost = useRef<HTMLElement>(null);
  const floatingInspector = useRef<HTMLElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const inspectorDrag = useRef<InspectorDrag | null>(null);
  const layerListDrag = useRef<LayerListDrag | null>(null);
  const canvasPointers = useRef(new Map<number, { x: number; y: number }>());
  const canvasPinch = useRef<CanvasPinch | null>(null);
  const canvasPan = useRef<CanvasPan | null>(null);
  const canvasViewRef = useRef<CanvasView>({ scale: 1, x: 0, y: 0 });
  const spacePressed = useRef(false);
  const history = useRef<MoodboardEditorInitialData[]>([]);
  const future = useRef<MoodboardEditorInitialData[]>([]);
  const hydrated = useRef(false);
  const recoveryEnabled = useRef(true);
  const [data, setData] = useState(initialData);
  const [editorCategories, setEditorCategories] = useState(categories);
  const [postId, setPostId] = useState(initialData.id);
  const draftKey = requestedKey ?? postId ?? "new";
  const [selectedId, setSelectedId] = useState<string | null>(
    initialData.layers.at(-1)?.stableLayerId ?? null,
  );
  const [saveState, setSaveState] = useState("Not saved yet");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [guides, setGuides] = useState({ vertical: false, horizontal: false });
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [colorText, setColorText] = useState(
    initialData.backgroundColor.toUpperCase(),
  );
  const [historyVersion, setHistoryVersion] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasView, setCanvasView] = useState<CanvasView>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isCanvasPanning, setIsCanvasPanning] = useState(false);
  const [inspectorPosition, setInspectorPosition] = useState({ x: 24, y: 24 });
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [layerContextMenu, setLayerContextMenu] =
    useState<LayerContextMenu | null>(null);
  const [rotationText, setRotationText] = useState("0");
  const [opacityText, setOpacityText] = useState("100");

  useEffect(() => {
    const recovered = loadLocalMoodboardDraft(draftKey);
    const next = recovered ? { ...initialData, ...recovered } : initialData;
    setData(next);
    setColorText(next.backgroundColor.toUpperCase());
    if (recovered) {
      setNotice("Recovered your last browser-saved version.");
      setSaveState(
        `Recovered ${new Date(recovered.updatedAt).toLocaleString()}`,
      );
    }
    setRecentColors(
      JSON.parse(
        localStorage.getItem("second-viewing:moodboard-recent-colors") ?? "[]",
      ),
    );
    hydrated.current = true;
    let disposed = false;
    Promise.all(
      next.layers.map(async (layer) => {
        const file = await loadLocalMoodboardImage(
          draftKey,
          layer.stableLayerId,
        ).catch(() => null);
        return file
          ? { id: layer.stableLayerId, url: URL.createObjectURL(file) }
          : null;
      }),
    ).then((restored) => {
      if (disposed) {
        restored.forEach((entry) => entry && URL.revokeObjectURL(entry.url));
        return;
      }
      setData((current) => ({
        ...current,
        layers: current.layers.map((layer) => {
          const local = restored.find(
            (entry) => entry?.id === layer.stableLayerId,
          );
          return local ? { ...layer, imageUrl: local.url } : layer;
        }),
      }));
    });
    return () => {
      disposed = true;
    };
  }, [draftKey, initialData]);

  useEffect(() => {
    let disposed = false;
    async function refreshCategories() {
      if (demo) {
        if (!disposed) setEditorCategories(loadDemoMoodboardCategories());
        return;
      }
      const response = await fetch("/api/admin/moodboard-categories");
      if (!response.ok) return;
      const result = await response.json();
      if (!disposed) setEditorCategories(result.categories ?? []);
    }
    function categoryChange(event: Event) {
      const changed = (event as CustomEvent<AdminMoodboardCategory[]>).detail;
      if (Array.isArray(changed)) setEditorCategories(changed);
      else void refreshCategories();
    }
    function storageChange(event: StorageEvent) {
      if (event.key === MOODBOARD_CATEGORY_STORAGE_KEY)
        void refreshCategories();
    }
    void refreshCategories();
    window.addEventListener(MOODBOARD_CATEGORIES_CHANGED_EVENT, categoryChange);
    window.addEventListener("storage", storageChange);
    window.addEventListener("focus", refreshCategories);
    return () => {
      disposed = true;
      window.removeEventListener(
        MOODBOARD_CATEGORIES_CHANGED_EVENT,
        categoryChange,
      );
      window.removeEventListener("storage", storageChange);
      window.removeEventListener("focus", refreshCategories);
    };
  }, [demo]);

  useEffect(() => {
    if (
      !editorCategories.length ||
      editorCategories.some((category) => category.id === data.categoryId)
    )
      return;
    setData((current) => ({ ...current, categoryId: editorCategories[0].id }));
  }, [data.categoryId, editorCategories]);

  useEffect(() => {
    function fullscreenChange() {
      const active = document.fullscreenElement === fullscreenHost.current;
      const resetView = { scale: 1, x: 0, y: 0 };
      canvasViewRef.current = resetView;
      setCanvasView(resetView);
      canvasPointers.current.clear();
      canvasPinch.current = null;
      canvasPan.current = null;
      spacePressed.current = false;
      setIsCanvasPanning(false);
      setIsFullscreen(active);
      if (!active) return;
      window.requestAnimationFrame(() => {
        const panel = floatingInspector.current?.getBoundingClientRect();
        setInspectorPosition({
          x: Math.max(12, window.innerWidth - (panel?.width ?? 224) - 20),
          y: Math.max(12, window.innerHeight - (panel?.height ?? 384) - 20),
        });
      });
    }
    document.addEventListener("fullscreenchange", fullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", fullscreenChange);
  }, []);

  useEffect(() => {
    const viewport = stageWrap.current;
    if (!isFullscreen || !viewport) return;
    function zoomWithTrackpad(event: WheelEvent) {
      const current = canvasViewRef.current;
      if (!event.ctrlKey) {
        if (current.scale <= 1) return;
        event.preventDefault();
        const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
        const pageX =
          event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport!.clientWidth
            : unit;
        const pageY =
          event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport!.clientHeight
            : unit;
        updateCanvasView({
          ...current,
          x: current.x - event.deltaX * pageX,
          y: current.y - event.deltaY * pageY,
        });
        return;
      }
      event.preventDefault();
      const bounds = viewport!.getBoundingClientRect();
      const cursorX = event.clientX - bounds.left - bounds.width / 2;
      const cursorY = event.clientY - bounds.top - bounds.height / 2;
      const nextScale = clamp(
        current.scale * Math.exp(-event.deltaY * 0.012),
        0.6,
        4,
      );
      const anchorX = (cursorX - current.x) / current.scale;
      const anchorY = (cursorY - current.y) / current.scale;
      updateCanvasView({
        scale: nextScale,
        x: cursorX - anchorX * nextScale,
        y: cursorY - anchorY * nextScale,
      });
    }
    viewport.addEventListener("wheel", zoomWithTrackpad, { passive: false });
    return () => viewport.removeEventListener("wheel", zoomWithTrackpad);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || !stageWrap.current || !stage.current) return;
    let frame = 0;
    const constrainAfterResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() =>
        updateCanvasView(canvasViewRef.current),
      );
    };
    const observer = new ResizeObserver(constrainAfterResize);
    observer.observe(stageWrap.current);
    observer.observe(stage.current);
    window.addEventListener("resize", constrainAfterResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", constrainAfterResize);
      window.cancelAnimationFrame(frame);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!hydrated.current || !recoveryEnabled.current) return;
    setSaveState("Saving in this browser…");
    const timeout = window.setTimeout(() => {
      const updated = saveLocalMoodboardDraft(draftKey, {
        ...data,
        id: postId,
      });
      setSaveState(
        `Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      );
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, draftKey, postId]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true']"),
      );
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (
        isFullscreen &&
        event.code === "Space" &&
        !editing &&
        !target?.closest("button, a") &&
        !modifier &&
        !event.altKey
      ) {
        event.preventDefault();
        spacePressed.current = true;
        return;
      }
      if (modifier && key === "z" && !editing) {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      const activeLayer = data.layers.find(
        (layer) => layer.stableLayerId === selectedId,
      );
      if (modifier && key === "d" && !editing && activeLayer) {
        event.preventDefault();
        void duplicateLayer(activeLayer);
        return;
      }
      if (
        !modifier &&
        !editing &&
        activeLayer &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        event.preventDefault();
        removeLayer(activeLayer);
        return;
      }
      if (event.key === "Escape") setLayerContextMenu(null);
    }
    function keyboardUp(event: KeyboardEvent) {
      if (event.code === "Space") spacePressed.current = false;
    }
    function releaseKeyboardAndPan() {
      spacePressed.current = false;
      canvasPan.current = null;
      setIsCanvasPanning(false);
    }
    window.addEventListener("keydown", keyboard);
    window.addEventListener("keyup", keyboardUp);
    window.addEventListener("blur", releaseKeyboardAndPan);
    return () => {
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("keyup", keyboardUp);
      window.removeEventListener("blur", releaseKeyboardAndPan);
    };
  });

  useEffect(() => {
    if (!layerContextMenu) return;
    const close = () => setLayerContextMenu(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("blur", close);
    };
  }, [layerContextMenu]);

  const selected =
    data.layers.find((layer) => layer.stableLayerId === selectedId) ?? null;
  const contextLayer = layerContextMenu
    ? (data.layers.find(
        (layer) => layer.stableLayerId === layerContextMenu.layerId,
      ) ?? null)
    : null;
  useEffect(() => {
    if (!selected) return;
    setRotationText(String(Math.round(selected.rotation)));
    setOpacityText(String(Math.round(selected.opacity * 100)));
  }, [selected?.opacity, selected?.rotation, selectedId]);
  const validation = useMemo(
    () => moodboardDraftSchema.safeParse(data),
    [data],
  );
  const publishValidation = useMemo(
    () => moodboardPublishSchema.safeParse(data),
    [data],
  );
  const title = data.title.trim() || "Untitled moodboard";

  function commit(
    mutator: (
      current: MoodboardEditorInitialData,
    ) => MoodboardEditorInitialData,
  ) {
    setData((current) => {
      history.current.push(clone(current));
      if (history.current.length > 60) history.current.shift();
      future.current = [];
      return mutator(current);
    });
    setHistoryVersion((version) => version + 1);
  }
  function undo() {
    const previous = history.current.pop();
    if (!previous) return;
    setColorText(previous.backgroundColor.toUpperCase());
    setData((current) => {
      future.current.push(clone(current));
      return previous;
    });
    setHistoryVersion((version) => version + 1);
  }
  function redo() {
    const next = future.current.pop();
    if (!next) return;
    setColorText(next.backgroundColor.toUpperCase());
    setData((current) => {
      history.current.push(clone(current));
      return next;
    });
    setHistoryVersion((version) => version + 1);
  }
  function beginRangeChange() {
    history.current.push(clone(data));
    if (history.current.length > 60) history.current.shift();
    future.current = [];
    setHistoryVersion((version) => version + 1);
  }
  function patchLayer(
    id: string,
    patch: Partial<MoodboardLayerDraft>,
    remember = true,
  ) {
    const apply = (current: MoodboardEditorInitialData) => ({
      ...current,
      layers: current.layers.map((layer) =>
        layer.stableLayerId === id ? { ...layer, ...patch } : layer,
      ),
    });
    remember ? commit(apply) : setData(apply);
  }

  function beginGesture(
    event: React.PointerEvent,
    layer: MoodboardLayerDraft,
    mode: Gesture["mode"],
    handle?: Gesture["handle"],
  ) {
    event.stopPropagation();
    setSelectedId(layer.stableLayerId);
    if (
      isFullscreen &&
      event.pointerType === "touch" &&
      canvasPointers.current.size >= 2
    )
      return;
    if (layer.locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return;
    gesture.current = {
      layerId: layer.stableLayerId,
      mode,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      scale: bounds.width / MOODBOARD_WIDTH,
      original: { ...layer },
      before: clone(data),
    };
  }

  function moveGesture(event: React.PointerEvent) {
    const active = gesture.current;
    if (!active) return;
    const dx = (event.clientX - active.startX) / active.scale;
    const dy = (event.clientY - active.startY) / active.scale;
    if (active.mode === "move") {
      let x = active.original.x + dx;
      let y = active.original.y + dy;
      const centerX = x + active.original.width / 2;
      const centerY = y + active.original.height / 2;
      const vertical = Math.abs(centerX - MOODBOARD_WIDTH / 2) < 14;
      const horizontal = Math.abs(centerY - MOODBOARD_HEIGHT / 2) < 14;
      if (vertical) x = MOODBOARD_WIDTH / 2 - active.original.width / 2;
      if (horizontal) y = MOODBOARD_HEIGHT / 2 - active.original.height / 2;
      setGuides({ vertical, horizontal });
      patchLayer(active.layerId, { x: round(x), y: round(y) }, false);
      return;
    }
    const handle = active.handle ?? "se";
    const direction =
      handle === "se"
        ? (dx + dy) / 2
        : handle === "nw"
          ? -(dx + dy) / 2
          : handle === "ne"
            ? (dx - dy) / 2
            : (-dx + dy) / 2;
    const nextWidth = clamp(active.original.width + direction, 24, 3200);
    const factor = nextWidth / active.original.width;
    const nextHeight = active.original.height * factor;
    const patch: Partial<MoodboardLayerDraft> = {
      width: round(nextWidth),
      height: round(nextHeight),
    };
    if (handle.includes("w"))
      patch.x = round(active.original.x + active.original.width - nextWidth);
    if (handle.includes("n"))
      patch.y = round(active.original.y + active.original.height - nextHeight);
    patchLayer(active.layerId, patch, false);
  }

  function endGesture() {
    if (!gesture.current) return;
    history.current.push(gesture.current.before);
    future.current = [];
    gesture.current = null;
    setGuides({ vertical: false, horizontal: false });
    setHistoryVersion((version) => version + 1);
  }

  function constrainCanvasView(view: CanvasView) {
    const viewport = stageWrap.current?.getBoundingClientRect();
    const canvas = stage.current;
    if (!viewport || !canvas)
      return { ...view, x: round(view.x), y: round(view.y) };
    const maximumX = Math.max(
      0,
      (canvas.offsetWidth * view.scale - viewport.width) / 2,
    );
    const maximumY = Math.max(
      0,
      (canvas.offsetHeight * view.scale - viewport.height) / 2,
    );
    return {
      scale: round(view.scale),
      x: round(clamp(view.x, -maximumX, maximumX)),
      y: round(clamp(view.y, -maximumY, maximumY)),
    };
  }

  function updateCanvasView(view: CanvasView) {
    const next = constrainCanvasView(view);
    canvasViewRef.current = next;
    setCanvasView(next);
  }

  function beginCanvasPinch(event: React.PointerEvent<HTMLDivElement>) {
    if (!isFullscreen || event.pointerType !== "touch") return;
    canvasPointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (canvasPointers.current.size !== 2) return;
    if (gesture.current) endGesture();
    const [first, second] = [...canvasPointers.current.values()];
    const bounds = stageWrap.current?.getBoundingClientRect();
    if (!bounds) return;
    const centerX = (first.x + second.x) / 2 - bounds.left - bounds.width / 2;
    const centerY = (first.y + second.y) / 2 - bounds.top - bounds.height / 2;
    const current = canvasViewRef.current;
    canvasPinch.current = {
      anchorX: (centerX - current.x) / current.scale,
      anchorY: (centerY - current.y) / current.scale,
      startDistance: Math.hypot(second.x - first.x, second.y - first.y),
      startScale: current.scale,
    };
  }

  function moveCanvasPinch(event: React.PointerEvent<HTMLDivElement>) {
    if (!canvasPointers.current.has(event.pointerId)) return;
    canvasPointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const active = canvasPinch.current;
    if (!active || canvasPointers.current.size < 2) return;
    event.preventDefault();
    const [first, second] = [...canvasPointers.current.values()];
    const bounds = stageWrap.current?.getBoundingClientRect();
    if (!bounds) return;
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    const nextScale = clamp(
      active.startScale * (distance / Math.max(active.startDistance, 1)),
      0.6,
      4,
    );
    const centerX = (first.x + second.x) / 2 - bounds.left - bounds.width / 2;
    const centerY = (first.y + second.y) / 2 - bounds.top - bounds.height / 2;
    updateCanvasView({
      scale: nextScale,
      x: centerX - active.anchorX * nextScale,
      y: centerY - active.anchorY * nextScale,
    });
  }

  function endCanvasPinch(event: React.PointerEvent<HTMLDivElement>) {
    canvasPointers.current.delete(event.pointerId);
    if (canvasPointers.current.size < 2) canvasPinch.current = null;
  }

  function beginCanvasPan(event: React.PointerEvent<HTMLDivElement>) {
    if (
      !isFullscreen ||
      event.pointerType === "touch" ||
      canvasViewRef.current.scale <= 1 ||
      (event.button !== 1 && !(event.button === 0 && spacePressed.current))
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = canvasViewRef.current;
    canvasPan.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      originY: current.y,
    };
    setIsCanvasPanning(true);
  }

  function moveCanvasPan(event: React.PointerEvent<HTMLDivElement>) {
    const active = canvasPan.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    updateCanvasView({
      ...canvasViewRef.current,
      x: active.originX + event.clientX - active.startX,
      y: active.originY + event.clientY - active.startY,
    });
  }

  function endCanvasPan(event: React.PointerEvent<HTMLDivElement>) {
    if (canvasPan.current?.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    canvasPan.current = null;
    setIsCanvasPanning(false);
  }

  function beginCanvasNavigation(event: React.PointerEvent<HTMLDivElement>) {
    beginCanvasPinch(event);
    beginCanvasPan(event);
  }

  function moveCanvasNavigation(event: React.PointerEvent<HTMLDivElement>) {
    moveCanvasPinch(event);
    moveCanvasPan(event);
  }

  function endCanvasNavigation(event: React.PointerEvent<HTMLDivElement>) {
    endCanvasPinch(event);
    endCanvasPan(event);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === fullscreenHost.current)
        await document.exitFullscreen();
      else await fullscreenHost.current?.requestFullscreen();
    } catch {
      setNotice(
        "Full screen could not open in this browser. Try the browser's full-screen control instead.",
      );
    }
  }

  function beginInspectorDrag(event: React.PointerEvent) {
    if (!isFullscreen) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    inspectorDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: inspectorPosition.x,
      originY: inspectorPosition.y,
    };
  }

  function moveInspector(event: React.PointerEvent) {
    const active = inspectorDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const panel = floatingInspector.current?.getBoundingClientRect();
    const maximumX = Math.max(8, window.innerWidth - (panel?.width ?? 224) - 8);
    const maximumY = Math.max(
      8,
      window.innerHeight - (panel?.height ?? 384) - 8,
    );
    setInspectorPosition({
      x: clamp(active.originX + event.clientX - active.startX, 8, maximumX),
      y: clamp(active.originY + event.clientY - active.startY, 8, maximumY),
    });
  }

  function endInspectorDrag(event: React.PointerEvent) {
    if (inspectorDrag.current?.pointerId !== event.pointerId) return;
    inspectorDrag.current = null;
  }

  async function accept(files: FileList | File[]) {
    const incoming = Array.from(files);
    if (data.layers.length + incoming.length > MAX_MOODBOARD_LAYERS)
      return setNotice("A moodboard can contain up to 50 image layers.");
    setBusy(true);
    setNotice("");
    const additions: MoodboardLayerDraft[] = [];
    for (const file of incoming) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (file.type === "image/gif" || extension === ".gif") {
        setNotice("GIF files are not accepted. Export a static frame instead.");
        continue;
      }
      if (
        !acceptedExtensions.includes(extension) &&
        !file.type.startsWith("image/")
      ) {
        setNotice(`${file.name} is not a supported image.`);
        continue;
      }
      if (file.size > maximumImageSize) {
        setNotice(`${file.name} is larger than 25 MB.`);
        continue;
      }
      const id = crypto.randomUUID();
      let url = "";
      let assetId: string | null = null;
      if (demo) {
        if (!commonPreviewTypes.has(file.type)) {
          setNotice(
            `${file.name} needs the connected image converter. Try PNG or WebP in local preview.`,
          );
          continue;
        }
        url = URL.createObjectURL(file);
      } else {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/admin/assets?scope=moodboard", {
          method: "POST",
          body: form,
        });
        const result = await response.json();
        if (!response.ok) {
          setNotice(result.error ?? `${file.name} could not be uploaded.`);
          continue;
        }
        url = result.asset.url;
        assetId = result.asset.id;
      }
      await saveLocalMoodboardImage(draftKey, id, file);
      const dimensions = await imageDimensions(url);
      const fit = Math.min(620 / dimensions.width, 420 / dimensions.height, 1);
      const width = Math.max(80, dimensions.width * fit);
      const height = Math.max(80, dimensions.height * fit);
      additions.push({
        stableLayerId: id,
        assetId,
        imageUrl: url,
        name: file.name.replace(/\.[^.]+$/, ""),
        alt: "",
        x: (MOODBOARD_WIDTH - width) / 2 + additions.length * 24,
        y: (MOODBOARD_HEIGHT - height) / 2 + additions.length * 18,
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
      });
    }
    if (additions.length) {
      commit((current) => ({
        ...current,
        layers: [...current.layers, ...additions],
      }));
      setSelectedId(additions.at(-1)!.stableLayerId);
    }
    setBusy(false);
  }

  function beginLayerListDrag(event: React.PointerEvent, layerId: string) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-layer-control]")) return;
    const list = event.currentTarget.closest("ol");
    if (!list) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(layerId);
    layerListDrag.current = {
      pointerId: event.pointerId,
      sourceId: layerId,
      startX: event.clientX,
      startY: event.clientY,
      before: clone(data),
      list,
      active: false,
      changed: false,
    };
  }

  function moveLayerListDrag(event: React.PointerEvent) {
    const active = layerListDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (
      !active.active &&
      Math.hypot(event.clientX - active.startX, event.clientY - active.startY) <
        4
    )
      return;
    event.preventDefault();
    if (!active.active) {
      active.active = true;
      setDraggedLayerId(active.sourceId);
    }
    const rows = Array.from(
      active.list.querySelectorAll<HTMLElement>("[data-moodboard-layer-id]"),
    );
    const remaining = rows.filter(
      (row) => row.dataset.moodboardLayerId !== active.sourceId,
    );
    const insertionIndex = remaining.findIndex((row) => {
      const bounds = row.getBoundingClientRect();
      return event.clientY < bounds.top + bounds.height / 2;
    });
    const nextVisualOrder = remaining.map(
      (row) => row.dataset.moodboardLayerId!,
    );
    nextVisualOrder.splice(
      insertionIndex < 0 ? nextVisualOrder.length : insertionIndex,
      0,
      active.sourceId,
    );
    setData((current) => {
      const currentVisualOrder = [...current.layers]
        .reverse()
        .map((layer) => layer.stableLayerId);
      if (
        currentVisualOrder.every(
          (layerId, index) => layerId === nextVisualOrder[index],
        )
      )
        return current;
      const byId = new Map(
        current.layers.map((layer) => [layer.stableLayerId, layer]),
      );
      active.changed = true;
      return {
        ...current,
        layers: [...nextVisualOrder]
          .reverse()
          .map((layerId) => byId.get(layerId)!)
          .filter(Boolean),
      };
    });
  }

  function endLayerListDrag(event: React.PointerEvent) {
    const active = layerListDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.changed) {
      history.current.push(active.before);
      if (history.current.length > 60) history.current.shift();
      future.current = [];
      setHistoryVersion((version) => version + 1);
    }
    layerListDrag.current = null;
    setDraggedLayerId(null);
  }

  function cancelLayerListDrag() {
    const active = layerListDrag.current;
    if (active?.changed) setData(active.before);
    layerListDrag.current = null;
    setDraggedLayerId(null);
  }

  function openLayerContextMenu(event: React.MouseEvent, layerId: string) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(layerId);
    setLayerContextMenu({
      layerId,
      x: clamp(event.clientX, 8, Math.max(8, window.innerWidth - 190)),
      y: clamp(event.clientY, 8, Math.max(8, window.innerHeight - 106)),
    });
  }

  async function duplicateLayer(layer: MoodboardLayerDraft) {
    const copy = {
      ...layer,
      stableLayerId: crypto.randomUUID(),
      x: layer.x + 28,
      y: layer.y + 28,
      name: `${layer.name} copy`,
    };
    const localFile = await loadLocalMoodboardImage(
      draftKey,
      layer.stableLayerId,
    ).catch(() => null);
    if (localFile)
      await saveLocalMoodboardImage(draftKey, copy.stableLayerId, localFile);
    commit((current) => ({ ...current, layers: [...current.layers, copy] }));
    setSelectedId(copy.stableLayerId);
  }

  function removeLayer(layer: MoodboardLayerDraft) {
    commit((current) => ({
      ...current,
      layers: current.layers.filter(
        (entry) => entry.stableLayerId !== layer.stableLayerId,
      ),
    }));
    setSelectedId(null);
  }

  function useBackgroundColor(color: string) {
    const normalized = color.toUpperCase();
    setColorText(normalized);
    commit((current) => ({ ...current, backgroundColor: normalized }));
  }

  function rememberColor(color: string) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;
    const next = [
      color.toUpperCase(),
      ...recentColors.filter(
        (entry) => entry.toUpperCase() !== color.toUpperCase(),
      ),
    ].slice(0, 8);
    setRecentColors(next);
    localStorage.setItem(
      "second-viewing:moodboard-recent-colors",
      JSON.stringify(next),
    );
  }

  function commitRotationValue() {
    if (!selected) return;
    const parsed = Number(rotationText);
    const next = Number.isFinite(parsed)
      ? clamp(parsed, -180, 180)
      : selected.rotation;
    setRotationText(String(Math.round(next)));
    patchLayer(selected.stableLayerId, { rotation: next }, false);
  }

  function commitOpacityValue() {
    if (!selected) return;
    const parsed = Number(opacityText);
    const next = Number.isFinite(parsed)
      ? clamp(parsed, 5, 100)
      : selected.opacity * 100;
    setOpacityText(String(Math.round(next)));
    patchLayer(selected.stableLayerId, { opacity: next / 100 }, false);
  }

  async function persist(payload = data) {
    const parsed = moodboardDraftSchema.safeParse(payload);
    if (!parsed.success) {
      setNotice(
        parsed.error.issues[0]?.message ?? "Check the missing information.",
      );
      return null;
    }
    setBusy(true);
    setSaveState("Saving…");
    if (demo) {
      const updated = saveLocalMoodboardDraft(draftKey, payload);
      setSaveState(
        `Saved ${new Date(updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      );
      setBusy(false);
      return postId ?? "demo";
    }
    const response = await fetch(
      postId ? `/api/admin/moodboards/${postId}` : "/api/admin/moodboards",
      {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error ?? "The moodboard could not be saved.");
      setSaveState("Save failed");
      setBusy(false);
      return null;
    }
    const id = result.post.id as string;
    setPostId(id);
    setSaveState("Saved to Second Viewing");
    setBusy(false);
    if (!postId) router.replace(`/admin/moodboards/${id}`);
    return id;
  }

  async function uploadOutput(blob: Blob, name: string) {
    const form = new FormData();
    form.set("file", new File([blob], name, { type: "image/webp" }));
    const response = await fetch("/api/admin/assets?scope=moodboard-output", {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error ?? "The preview could not be uploaded.");
    return result.asset.id as string;
  }

  async function publish() {
    const parsed = moodboardPublishSchema.safeParse(data);
    if (!parsed.success) {
      setNotice(
        parsed.error.issues[0]?.message ?? "Check the missing information.",
      );
      return;
    }
    if (demo) {
      setNotice("This local preview cannot publish live.");
      return;
    }
    setBusy(true);
    setSaveState("Preparing complete images…");
    try {
      const [fullBlob, previewBlob] = await Promise.all([
        renderMoodboard(data, 1600),
        renderMoodboard(data, 800),
      ]);
      const [fullAssetId, previewAssetId] = await Promise.all([
        uploadOutput(fullBlob, `${title}-full.webp`),
        uploadOutput(previewBlob, `${title}-preview.webp`),
      ]);
      const finalData = { ...data, fullAssetId, previewAssetId };
      setData(finalData);
      const id = await persist(finalData);
      if (!id || id === "demo") return;
      setBusy(true);
      setSaveState("Publishing…");
      const response = await fetch(`/api/admin/moodboards/${id}/publish`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ?? "The moodboard could not be published.",
        );
      recoveryEnabled.current = false;
      removeLocalMoodboardDraft(draftKey);
      await removeLocalMoodboardImages(draftKey);
      if (id !== draftKey) {
        removeLocalMoodboardDraft(id);
        await removeLocalMoodboardImages(id);
      }
      router.push("/admin/moodboards");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The moodboard could not be published.",
      );
      setSaveState("Publish failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-editor-page admin-moodboard-editor-page">
      <header className="admin-editor-header">
        <div className="admin-editor-header__identity">
          <Link href="/admin/moodboards" aria-label="Back to Moodboards">
            <ArrowLeft />
          </Link>
          <div>
            <p>Moodboards</p>
            <h1>{title}</h1>
          </div>
        </div>
        <div className="admin-editor-header__actions">
          <span className="admin-save-state" aria-live="polite">
            {saveState}
          </span>
          <Button
            variant="ghost"
            type="button"
            disabled={!history.current.length}
            data-history-version={historyVersion}
            onClick={undo}
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            type="button"
            disabled={!future.current.length}
            data-history-version={historyVersion}
            onClick={redo}
          >
            Redo
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={busy}
            onClick={() => persist()}
          >
            Save draft
          </Button>
          <Button type="button" disabled={busy} onClick={publish}>
            {busy
              ? "Working…"
              : initialData.status?.startsWith("published")
                ? "Republish"
                : "Publish"}
          </Button>
        </div>
      </header>
      {notice ? (
        <div className="admin-editor-notice" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="admin-moodboard-editor-layout">
        <section className="admin-editor-section admin-moodboard-settings">
          <div className="admin-editor-section__heading">
            <span>1</span>
            <div>
              <h2>Moodboard settings</h2>
              <p>
                Name the board, choose its category, and set its required canvas
                color.
              </p>
            </div>
          </div>
          <div className="admin-moodboard-settings__grid">
            <div className="admin-field">
              <FieldLabel htmlFor="moodboard-title">Title</FieldLabel>
              <Input
                id="moodboard-title"
                placeholder="Give this moodboard a title"
                value={data.title}
                onChange={(event) =>
                  setData({ ...data, title: event.target.value })
                }
              />
            </div>
            <div className="admin-field">
              <FieldLabel htmlFor="moodboard-category">Category</FieldLabel>
              <select
                id="moodboard-category"
                value={data.categoryId}
                onChange={(event) =>
                  setData({ ...data, categoryId: event.target.value })
                }
              >
                {editorCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldHint>
                Changing this moves the moodboard without rebuilding it.
              </FieldHint>
            </div>
            <div className="admin-field">
              <div className="admin-field-label-row">
                <FieldLabel htmlFor="moodboard-color">
                  Background color
                </FieldLabel>
                <button
                  type="button"
                  onClick={() => useBackgroundColor("#F1EFE9")}
                >
                  Reset
                </button>
              </div>
              <div className="admin-color-field">
                <input
                  id="moodboard-color"
                  type="color"
                  value={data.backgroundColor}
                  onChange={(event) => useBackgroundColor(event.target.value)}
                  onBlur={() => rememberColor(data.backgroundColor)}
                />
                <Input
                  aria-label="Background hex value"
                  value={colorText}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/.test(value)) {
                      setColorText(value);
                      if (/^#[0-9A-F]{6}$/.test(value))
                        setData((current) => ({
                          ...current,
                          backgroundColor: value,
                        }));
                    }
                  }}
                  onBlur={() => {
                    if (/^#[0-9A-F]{6}$/.test(colorText))
                      rememberColor(colorText);
                    else setColorText(data.backgroundColor.toUpperCase());
                  }}
                />
              </div>
              {recentColors.length ? (
                <div className="admin-recent-colors" aria-label="Recent colors">
                  {recentColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      style={{ background: color }}
                      aria-label={`Use ${color}`}
                      onClick={() => useBackgroundColor(color)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
        <section
          ref={fullscreenHost}
          className={`admin-editor-section admin-moodboard-canvas-section${isFullscreen ? " is-fullscreen" : ""}`}
        >
          <div className="admin-editor-section__heading">
            <span>2</span>
            <div>
              <h2>Canvas</h2>
              <p>
                Drag layers freely. Resize from a corner; hold nothing—the
                original proportions stay intact.
              </p>
            </div>
            <strong>{data.layers.length} / 50</strong>
          </div>
          <input
            ref={input}
            className="sr-only"
            type="file"
            multiple
            accept={acceptValue}
            onChange={(event) => {
              if (event.target.files) accept(event.target.files);
              event.target.value = "";
            }}
          />
          <div className="admin-moodboard-canvas-toolbar">
            <Button
              className="admin-moodboard-fullscreen-button"
              size="small"
              type="button"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <ArrowsInSimple /> : <ArrowsOutSimple />}
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </Button>
            <span>
              {isFullscreen
                ? `Pinch to zoom · Scroll, Space-drag, or middle-drag to pan · ${Math.round(canvasView.scale * 100)}%`
                : "16:9 · Images outside the edge are clipped only in the finished moodboard."}
            </span>
          </div>
          <div
            ref={stageWrap}
            className={`admin-moodboard-stage-wrap${isCanvasPanning ? " is-panning" : ""}`}
            onPointerDownCapture={beginCanvasNavigation}
            onPointerMoveCapture={moveCanvasNavigation}
            onPointerUpCapture={endCanvasNavigation}
            onPointerCancelCapture={endCanvasNavigation}
            onLostPointerCapture={endCanvasNavigation}
          >
            <div
              ref={stage}
              className="admin-moodboard-stage"
              style={{
                background: /^#[0-9A-Fa-f]{6}$/.test(data.backgroundColor)
                  ? data.backgroundColor
                  : "#F1EFE9",
                transform: isFullscreen
                  ? `translate3d(${canvasView.x}px, ${canvasView.y}px, 0) scale(${canvasView.scale})`
                  : undefined,
              }}
              onPointerDown={() => setSelectedId(null)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (event.dataTransfer.files.length)
                  accept(event.dataTransfer.files);
              }}
            >
              {guides.vertical ? (
                <i className="admin-moodboard-guide admin-moodboard-guide--vertical" />
              ) : null}
              {guides.horizontal ? (
                <i className="admin-moodboard-guide admin-moodboard-guide--horizontal" />
              ) : null}
              {data.layers.map((layer) => (
                <div
                  key={layer.stableLayerId}
                  className={`admin-moodboard-layer${selectedId === layer.stableLayerId ? " is-selected" : ""}${layer.locked ? " is-locked" : ""}`}
                  style={{
                    left: `${(layer.x / MOODBOARD_WIDTH) * 100}%`,
                    top: `${(layer.y / MOODBOARD_HEIGHT) * 100}%`,
                    width: `${(layer.width / MOODBOARD_WIDTH) * 100}%`,
                    height: `${(layer.height / MOODBOARD_HEIGHT) * 100}%`,
                    transform: `rotate(${layer.rotation}deg)`,
                    opacity: layer.visible ? layer.opacity : 0,
                    zIndex: data.layers.indexOf(layer) + 1,
                  }}
                  onContextMenu={(event) =>
                    openLayerContextMenu(event, layer.stableLayerId)
                  }
                  onPointerDown={(event) => beginGesture(event, layer, "move")}
                  onPointerMove={moveGesture}
                  onPointerUp={endGesture}
                  onPointerCancel={endGesture}
                  onLostPointerCapture={endGesture}
                >
                  <img src={layer.imageUrl} alt="" draggable={false} />
                  {selectedId === layer.stableLayerId && !layer.locked
                    ? (["nw", "ne", "sw", "se"] as const).map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          className={`admin-moodboard-resize admin-moodboard-resize--${handle}`}
                          aria-label={`Resize ${layer.name} from ${handle}`}
                          onPointerDown={(event) =>
                            beginGesture(event, layer, "resize", handle)
                          }
                          onPointerMove={moveGesture}
                          onPointerUp={endGesture}
                          onPointerCancel={endGesture}
                          onLostPointerCapture={endGesture}
                        />
                      ))
                    : null}
                </div>
              ))}
            </div>
          </div>
          {!data.layers.length ? (
            <button
              className="admin-moodboard-empty"
              type="button"
              onClick={() => input.current?.click()}
            >
              <ImageSquare />
              <strong>Drop images here</strong>
              <span>or choose files from this computer</span>
              <small>
                JPG, PNG, APNG, WebP, AVIF, HEIC, HEIF, TIFF, or BMP · 25 MB
                each
              </small>
            </button>
          ) : null}
          {isFullscreen ? (
            <aside
              ref={floatingInspector}
              className="admin-moodboard-floating-inspector"
              style={{ left: inspectorPosition.x, top: inspectorPosition.y }}
            >
              <div
                className="admin-moodboard-floating-inspector__drag"
                onPointerDown={beginInspectorDrag}
                onPointerMove={moveInspector}
                onPointerUp={endInspectorDrag}
                onPointerCancel={endInspectorDrag}
                onLostPointerCapture={endInspectorDrag}
              >
                <DotsSixVertical />
                <strong>Canvas controls</strong>
                <button
                  type="button"
                  aria-label="Undo last canvas change"
                  title="Undo"
                  disabled={!history.current.length}
                  data-history-version={historyVersion}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={undo}
                >
                  <ArrowCounterClockwise />
                </button>
                <span>Drag</span>
              </div>
              <div className="admin-moodboard-floating-inspector__body">
                <div className="admin-field">
                  <FieldLabel htmlFor="moodboard-fullscreen-color">
                    Background
                  </FieldLabel>
                  <div className="admin-color-field">
                    <input
                      id="moodboard-fullscreen-color"
                      type="color"
                      value={data.backgroundColor}
                      onChange={(event) =>
                        useBackgroundColor(event.target.value)
                      }
                      onBlur={() => rememberColor(data.backgroundColor)}
                    />
                    <Input
                      aria-label="Full-screen background hex value"
                      value={colorText}
                      onChange={(event) => {
                        const value = event.target.value.toUpperCase();
                        if (/^#[0-9A-F]{0,6}$/.test(value)) {
                          setColorText(value);
                          if (/^#[0-9A-F]{6}$/.test(value))
                            setData((current) => ({
                              ...current,
                              backgroundColor: value,
                            }));
                        }
                      }}
                      onBlur={() => {
                        if (/^#[0-9A-F]{6}$/.test(colorText))
                          rememberColor(colorText);
                        else setColorText(data.backgroundColor.toUpperCase());
                      }}
                    />
                  </div>
                </div>
                <div className="admin-moodboard-floating-inspector__layers-header">
                  <strong>Layers</strong>
                  <button
                    type="button"
                    aria-label="Add images in full screen"
                    disabled={busy || data.layers.length >= 50}
                    onClick={() => input.current?.click()}
                  >
                    <Plus />
                  </button>
                </div>
                {data.layers.length ? (
                  <ol>
                    {[...data.layers].reverse().map((layer) => (
                      <li
                        key={layer.stableLayerId}
                        className={`${selectedId === layer.stableLayerId ? "is-selected" : ""}${draggedLayerId === layer.stableLayerId ? " is-dragging" : ""}`}
                        data-moodboard-layer-id={layer.stableLayerId}
                        title="Drag anywhere on this row to reorder"
                        onPointerDown={(event) =>
                          beginLayerListDrag(event, layer.stableLayerId)
                        }
                        onPointerMove={moveLayerListDrag}
                        onPointerUp={endLayerListDrag}
                        onPointerCancel={cancelLayerListDrag}
                        onLostPointerCapture={cancelLayerListDrag}
                        onContextMenu={(event) =>
                          openLayerContextMenu(event, layer.stableLayerId)
                        }
                      >
                        <button
                          className="admin-moodboard-floating-layer-row"
                          type="button"
                          onClick={() => setSelectedId(layer.stableLayerId)}
                        >
                          <span>
                            {layer.imageUrl ? (
                              <img src={layer.imageUrl} alt="" />
                            ) : (
                              <ImageSquare />
                            )}
                          </span>
                          <strong>{layer.name}</strong>
                        </button>
                        <span
                          className="admin-moodboard-layer-drag-handle"
                          aria-hidden="true"
                        >
                          <DotsSixVertical />
                        </span>
                        <div>
                          <button
                            type="button"
                            data-layer-control
                            aria-label={
                              layer.visible
                                ? `Hide ${layer.name}`
                                : `Show ${layer.name}`
                            }
                            onClick={() =>
                              patchLayer(layer.stableLayerId, {
                                visible: !layer.visible,
                              })
                            }
                          >
                            {layer.visible ? <Eye /> : <EyeSlash />}
                          </button>
                          <button
                            type="button"
                            data-layer-control
                            aria-label={
                              layer.locked
                                ? `Unlock ${layer.name}`
                                : `Lock ${layer.name}`
                            }
                            onClick={() =>
                              patchLayer(layer.stableLayerId, {
                                locked: !layer.locked,
                              })
                            }
                          >
                            {layer.locked ? <Lock /> : <LockOpen />}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="admin-moodboard-layers__empty">
                    Add an image to start building.
                  </p>
                )}
                {selected ? (
                  <div className="admin-moodboard-floating-inspector__selected">
                    <label className="admin-moodboard-number-field">
                      <span>Rotation</span>
                      <span>
                        <input
                          aria-label="Rotation in degrees"
                          type="text"
                          inputMode="decimal"
                          value={rotationText}
                          onFocus={beginRangeChange}
                          onChange={(event) =>
                            setRotationText(event.target.value)
                          }
                          onBlur={commitRotationValue}
                          onKeyDown={(event) => {
                            if (event.key === "Enter")
                              event.currentTarget.blur();
                          }}
                        />
                        <small>°</small>
                      </span>
                    </label>
                    <label className="admin-moodboard-number-field">
                      <span>Opacity</span>
                      <span>
                        <input
                          aria-label="Opacity percentage"
                          type="text"
                          inputMode="decimal"
                          value={opacityText}
                          onFocus={beginRangeChange}
                          onChange={(event) =>
                            setOpacityText(event.target.value)
                          }
                          onBlur={commitOpacityValue}
                          onKeyDown={(event) => {
                            if (event.key === "Enter")
                              event.currentTarget.blur();
                          }}
                        />
                        <small>%</small>
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}
          {layerContextMenu && contextLayer ? (
            <div
              className="admin-moodboard-layer-menu"
              role="menu"
              aria-label={`${contextLayer.name} actions`}
              style={{ left: layerContextMenu.x, top: layerContextMenu.y }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  void duplicateLayer(contextLayer);
                  setLayerContextMenu(null);
                }}
              >
                <Copy />
                <span>Duplicate layer</span>
                <kbd>⌘D</kbd>
              </button>
              <button
                className="admin-text-action--danger"
                type="button"
                role="menuitem"
                onClick={() => {
                  removeLayer(contextLayer);
                  setLayerContextMenu(null);
                }}
              >
                <Trash />
                <span>Delete layer</span>
                <kbd>Delete</kbd>
              </button>
            </div>
          ) : null}
        </section>
        <aside className="admin-moodboard-layers">
          <div className="admin-moodboard-layers__header">
            <div>
              <p className="admin-eyebrow">Canvas</p>
              <h2>Layers</h2>
            </div>
            <button
              type="button"
              aria-label="Add images"
              onClick={() => input.current?.click()}
            >
              <Plus />
            </button>
          </div>
          {data.layers.length ? (
            <ol>
              {[...data.layers].reverse().map((layer) => (
                <li
                  key={layer.stableLayerId}
                  className={`${selectedId === layer.stableLayerId ? "is-selected" : ""}${draggedLayerId === layer.stableLayerId ? " is-dragging" : ""}`}
                  data-moodboard-layer-id={layer.stableLayerId}
                  title="Drag anywhere on this row to reorder"
                  onPointerDown={(event) =>
                    beginLayerListDrag(event, layer.stableLayerId)
                  }
                  onPointerMove={moveLayerListDrag}
                  onPointerUp={endLayerListDrag}
                  onPointerCancel={cancelLayerListDrag}
                  onLostPointerCapture={cancelLayerListDrag}
                  onContextMenu={(event) =>
                    openLayerContextMenu(event, layer.stableLayerId)
                  }
                >
                  <button
                    className="admin-moodboard-layer-row"
                    type="button"
                    onClick={() => setSelectedId(layer.stableLayerId)}
                  >
                    <span>
                      {layer.imageUrl ? (
                        <img src={layer.imageUrl} alt="" />
                      ) : (
                        <ImageSquare />
                      )}
                    </span>
                    <strong>{layer.name}</strong>
                  </button>
                  <span
                    className="admin-moodboard-layer-drag-handle"
                    aria-hidden="true"
                  >
                    <DotsSixVertical />
                  </span>
                  <div>
                    <button
                      type="button"
                      data-layer-control
                      aria-label={
                        layer.visible
                          ? `Hide ${layer.name}`
                          : `Show ${layer.name}`
                      }
                      onClick={() =>
                        patchLayer(layer.stableLayerId, {
                          visible: !layer.visible,
                        })
                      }
                    >
                      {layer.visible ? <Eye /> : <EyeSlash />}
                    </button>
                    <button
                      type="button"
                      data-layer-control
                      aria-label={
                        layer.locked
                          ? `Unlock ${layer.name}`
                          : `Lock ${layer.name}`
                      }
                      onClick={() =>
                        patchLayer(layer.stableLayerId, {
                          locked: !layer.locked,
                        })
                      }
                    >
                      {layer.locked ? <Lock /> : <LockOpen />}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="admin-moodboard-layers__empty">
              Your images will appear here from front to back.
            </p>
          )}
          {selected ? (
            <div className="admin-moodboard-layer-controls">
              <div className="admin-field">
                <FieldLabel htmlFor="layer-alt">Image description</FieldLabel>
                <textarea
                  id="layer-alt"
                  className="admin-input admin-textarea"
                  value={selected.alt}
                  onChange={(event) =>
                    patchLayer(
                      selected.stableLayerId,
                      { alt: event.target.value },
                      false,
                    )
                  }
                  placeholder="Describe this image for readers who cannot see it"
                />
              </div>
              <div className="admin-moodboard-number-fields">
                <label className="admin-moodboard-number-field">
                  <span>Rotation</span>
                  <span>
                    <input
                      aria-label="Rotation in degrees"
                      type="text"
                      inputMode="decimal"
                      value={rotationText}
                      onFocus={beginRangeChange}
                      onChange={(event) => setRotationText(event.target.value)}
                      onBlur={commitRotationValue}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                    <small>°</small>
                  </span>
                </label>
                <label className="admin-moodboard-number-field">
                  <span>Opacity</span>
                  <span>
                    <input
                      aria-label="Opacity percentage"
                      type="text"
                      inputMode="decimal"
                      value={opacityText}
                      onFocus={beginRangeChange}
                      onChange={(event) => setOpacityText(event.target.value)}
                      onBlur={commitOpacityValue}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                    <small>%</small>
                  </span>
                </label>
              </div>
            </div>
          ) : null}
          <div className="admin-moodboard-safety">
            <strong>Safe editing</strong>
            <p>
              Only one layer is selected at a time. Published versions stay
              unchanged until you choose Republish.
            </p>
          </div>
          {!validation.success ? (
            <p className="admin-field-error">
              {validation.error.issues[0]?.message}
            </p>
          ) : !publishValidation.success ? (
            <p className="admin-draft-ready-copy">
              Draft is safe. {publishValidation.error.issues[0]?.message}
            </p>
          ) : (
            <strong className="admin-ready-copy">Ready to publish</strong>
          )}
        </aside>
      </div>
    </main>
  );
}
