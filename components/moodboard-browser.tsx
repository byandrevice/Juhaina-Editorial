"use client";

import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Moon,
  Sun,
  X,
} from "@phosphor-icons/react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Moodboard, MoodboardCategory } from "@/lib/moodboards-data";

type Theme = "light" | "dark";
type BoardMotion = "idle" | "next-out" | "next-settle" | "previous-out" | "previous-settle";
type Axis = "x" | "y" | null;

type MoodboardBrowserProps = {
  categories: MoodboardCategory[];
};

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  axis: Axis;
  startedAt: number;
};

const mod = (value: number, length: number) => ((value % length) + length) % length;

const depthPose = (depth: number) => {
  if (depth === 0) return { x: 0, y: 0, rotate: 0, scale: 1, dim: 0 };
  if (depth === 1) return { x: 4.8, y: -0.5, rotate: 0.5, scale: 0.958, dim: 0.3 };
  if (depth === 2) return { x: -4.8, y: -1, rotate: -0.65, scale: 0.92, dim: 0.48 };
  return { x: -4.8, y: -1.2, rotate: -0.65, scale: 0.905, dim: 0.56 };
};

function nearestSlot(index: number, virtualIndex: number, count: number) {
  return index + count * Math.round((virtualIndex - index) / count);
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function ArrowButton({
  direction,
  disabled,
  nudged,
  onClick,
}: {
  direction: "up" | "right" | "down" | "left";
  disabled?: boolean;
  nudged: boolean;
  onClick: () => void;
}) {
  const Icon = {
    up: CaretUp,
    right: CaretRight,
    down: CaretDown,
    left: CaretLeft,
  }[direction];

  return (
    <button
      type="button"
      className={`moodboard-arrow moodboard-arrow--${direction}${nudged ? " is-nudged" : ""}`}
      aria-label={`${direction[0].toUpperCase()}${direction.slice(1)}`}
      disabled={disabled}
      data-chrome="true"
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={20} weight="light" />
    </button>
  );
}

export function MoodboardBrowser({ categories }: MoodboardBrowserProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frontCardRef = useRef<HTMLButtonElement>(null);
  const boardTimers = useRef<number[]>([]);
  const categoryTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const openedRef = useRef<Moodboard | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [categoryMoving, setCategoryMoving] = useState(false);
  const [boardIndexes, setBoardIndexes] = useState(() => categories.map(() => 0));
  const [boardMotion, setBoardMotion] = useState<BoardMotion>("idle");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState({ axis: null as Axis, x: 0, y: 0 });
  const [opened, setOpened] = useState<Moodboard | null>(null);
  const [openVisible, setOpenVisible] = useState(false);
  const [nudge, setNudge] = useState<"up" | "right" | "down" | "left" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const hasInteracted = useRef(false);

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  const categoryCount = categories.length;
  const liveCategoryIndex = categoryCount ? mod(virtualIndex, categoryCount) : 0;
  const liveCategory = categories[liveCategoryIndex];
  const liveBoardIndex = liveCategory ? mod(boardIndexes[liveCategoryIndex] ?? 0, liveCategory.boards.length || 1) : 0;
  const liveBoard = liveCategory?.boards[liveBoardIndex];

  const clearBoardTimers = useCallback(() => {
    boardTimers.current.forEach(window.clearTimeout);
    boardTimers.current = [];
  }, []);

  const echoArrow = useCallback((direction: "up" | "right" | "down" | "left") => {
    setNudge(direction);
    window.setTimeout(() => setNudge((current) => (current === direction ? null : current)), 160);
  }, []);

  useEffect(() => {
    if (reducedMotion || categoryCount < 2) return;
    const discoveryTimer = window.setTimeout(() => {
      if (!hasInteracted.current && !openedRef.current) echoArrow("down");
    }, 2600);
    return () => window.clearTimeout(discoveryTimer);
  }, [categoryCount, echoArrow, reducedMotion]);

  const announceBoard = useCallback((categoryIndex: number, boardIndex: number) => {
    const category = categories[categoryIndex];
    const board = category?.boards[mod(boardIndex, category.boards.length || 1)];
    if (category && board) {
      setAnnouncement(`${board.title}, ${mod(boardIndex, category.boards.length) + 1} of ${category.boards.length}`);
    }
  }, [categories]);

  const moveBoard = useCallback((direction: "next" | "previous") => {
    if (busy || opened || !liveCategory || liveCategory.boards.length < 2) return;
    hasInteracted.current = true;
    clearBoardTimers();
    setBusy(true);
    echoArrow(direction === "next" ? "right" : "left");

    if (reducedMotion) {
      const nextIndex = liveBoardIndex + (direction === "next" ? 1 : -1);
      setBoardIndexes((indexes) => indexes.map((value, index) => (
        index === liveCategoryIndex ? mod(nextIndex, liveCategory.boards.length) : value
      )));
      setBoardMotion("idle");
      boardTimers.current.push(window.setTimeout(() => {
        setBusy(false);
        announceBoard(liveCategoryIndex, nextIndex);
      }, 260));
      return;
    }

    setBoardMotion(direction === "next" ? "next-out" : "previous-out");
    const rotateAt = direction === "next" ? 270 : 280;
    const unlockAt = direction === "next" ? 630 : 660;
    boardTimers.current.push(window.setTimeout(() => {
      const nextIndex = liveBoardIndex + (direction === "next" ? 1 : -1);
      setBoardIndexes((indexes) => indexes.map((value, index) => (
        index === liveCategoryIndex ? mod(nextIndex, liveCategory.boards.length) : value
      )));
      setBoardMotion(direction === "next" ? "next-settle" : "previous-settle");
    }, rotateAt));
    boardTimers.current.push(window.setTimeout(() => {
      const nextIndex = liveBoardIndex + (direction === "next" ? 1 : -1);
      setBoardMotion("idle");
      setBusy(false);
      announceBoard(liveCategoryIndex, nextIndex);
    }, unlockAt));
  }, [announceBoard, busy, clearBoardTimers, echoArrow, liveBoardIndex, liveCategory, liveCategoryIndex, opened, reducedMotion]);

  const moveCategory = useCallback((direction: "next" | "previous") => {
    if (busy || opened || categoryCount < 2) return;
    hasInteracted.current = true;
    if (categoryTimer.current) window.clearTimeout(categoryTimer.current);
    const delta = direction === "next" ? 1 : -1;
    const nextVirtual = virtualIndex + delta;
    const nextLive = mod(nextVirtual, categoryCount);
    setBusy(true);
    setCategoryMoving(true);
    setDrag({ axis: null, x: 0, y: 0 });
    echoArrow(direction === "next" ? "down" : "up");
    setVirtualIndex(nextVirtual);
    categoryTimer.current = window.setTimeout(() => {
      setCategoryMoving(false);
      setBusy(false);
      setAnnouncement(categories[nextLive].name);
      if (Math.abs(nextVirtual) >= 40 * categoryCount) {
        setVirtualIndex(nextLive);
      }
    }, reducedMotion ? 200 : 640);
  }, [busy, categories, categoryCount, echoArrow, opened, reducedMotion, virtualIndex]);

  const writeDeepLink = useCallback((category: MoodboardCategory, board: Moodboard) => {
    const hash = `#${category.slug}/${board.slug}`;
    if (window.location.hash !== hash) window.history.pushState({ moodboard: true }, "", hash);
  }, []);

  const openBoard = useCallback((board = liveBoard, category = liveCategory, updateHistory = true) => {
    if (!board || !category || busy || opened) return;
    hasInteracted.current = true;
    setBusy(true);
    setOpened(board);
    if (updateHistory) writeDeepLink(category, board);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setOpenVisible(true)));
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setBusy(false);
      closeRef.current?.focus();
    }, reducedMotion ? 220 : 720);
  }, [busy, liveBoard, liveCategory, opened, reducedMotion, writeDeepLink]);

  const closeBoard = useCallback((useHistory = true, force = false) => {
    if (!opened || (busy && !force)) return;
    setBusy(true);
    setOpenVisible(false);
    if (useHistory && window.history.state?.moodboard) {
      window.history.back();
    } else if (useHistory && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setOpened(null);
      setBusy(false);
      frontCardRef.current?.focus();
    }, reducedMotion ? 220 : 660);
  }, [busy, opened, reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stopWheel = (event: WheelEvent) => event.preventDefault();
    root.addEventListener("wheel", stopWheel, { passive: false });
    return () => root.removeEventListener("wheel", stopWheel);
  }, []);

  useEffect(() => () => {
    clearBoardTimers();
    if (categoryTimer.current) window.clearTimeout(categoryTimer.current);
    if (openTimer.current) window.clearTimeout(openTimer.current);
  }, [clearBoardTimers]);

  useEffect(() => {
    const resolveHash = () => {
      const [categorySlug, boardSlug] = window.location.hash.replace(/^#/, "").split("/");
      if (!categorySlug || !boardSlug) {
        if (openedRef.current) {
          setBusy(true);
          setOpenVisible(false);
          if (openTimer.current) window.clearTimeout(openTimer.current);
          openTimer.current = window.setTimeout(() => {
            setOpened(null);
            setBusy(false);
            frontCardRef.current?.focus();
          }, reducedMotion ? 220 : 660);
        }
        return;
      }
      const categoryIndex = categories.findIndex((category) => category.slug === categorySlug);
      const boardIndex = categories[categoryIndex]?.boards.findIndex((board) => board.slug === boardSlug) ?? -1;
      if (categoryIndex < 0 || boardIndex < 0) return;
      setVirtualIndex(categoryIndex);
      setBoardIndexes((indexes) => indexes.map((value, index) => index === categoryIndex ? boardIndex : value));
      if (!openedRef.current) {
        const board = categories[categoryIndex].boards[boardIndex];
        setBusy(true);
        setOpened(board);
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => setOpenVisible(true)));
        if (openTimer.current) window.clearTimeout(openTimer.current);
        openTimer.current = window.setTimeout(() => {
          setBusy(false);
          closeRef.current?.focus();
        }, reducedMotion ? 220 : 720);
      }
    };
    resolveHash();
    window.addEventListener("popstate", resolveHash);
    return () => window.removeEventListener("popstate", resolveHash);
  }, [categories, reducedMotion]);

  useEffect(() => {
    if (!liveCategory || liveCategory.boards.length < 2) return;
    const before = liveCategory.boards[mod(liveBoardIndex - 1, liveCategory.boards.length)];
    const after = liveCategory.boards[mod(liveBoardIndex + 1, liveCategory.boards.length)];
    [before, after].forEach((board) => {
      const image = new window.Image();
      image.src = board.preview.url;
    });
  }, [liveBoardIndex, liveCategory]);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea, select")) return;
    if (event.key === "Escape" && opened) {
      event.preventDefault();
      closeBoard();
      return;
    }
    if (opened || busy) return;
    if (event.key === "ArrowRight") { event.preventDefault(); moveBoard("next"); }
    if (event.key === "ArrowLeft") { event.preventDefault(); moveBoard("previous"); }
    if (event.key === "ArrowDown") { event.preventDefault(); moveCategory("next"); }
    if (event.key === "ArrowUp") { event.preventDefault(); moveCategory("previous"); }
    if ((event.key === "Enter" || event.key === " ") && document.activeElement === frontCardRef.current) {
      event.preventDefault();
      openBoard();
    }
  }, [busy, closeBoard, moveBoard, moveCategory, openBoard, opened]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (busy || opened || (event.target as HTMLElement).closest("[data-chrome]")) return;
    hasInteracted.current = true;
    rootRef.current?.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      axis: null,
      startedAt: event.timeStamp,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (!current.axis) return;
    event.preventDefault();
    const dt = Math.max(1, event.timeStamp - current.lastTime);
    current.velocityX = (event.clientX - current.lastX) / dt;
    current.velocityY = (event.clientY - current.lastY) / dt;
    current.lastX = event.clientX;
    current.lastY = event.clientY;
    current.lastTime = event.timeStamp;
    if (current.axis === "x" && (liveCategory?.boards.length ?? 0) > 1) {
      setDrag({ axis: "x", x: dx, y: 0 });
    } else if (current.axis === "y" && categoryCount > 1) {
      setDrag({ axis: "y", x: 0, y: dy });
    }
  };

  const finishPointer = (event: ReactPointerEvent<HTMLElement>, cancelled = false) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    const elapsed = event.timeStamp - current.startedAt;
    gesture.current = null;
    rootRef.current?.releasePointerCapture(event.pointerId);

    if (cancelled) {
      setDrag({ axis: null, x: 0, y: 0 });
      return;
    }

    if (!current.axis && elapsed < 550 && Math.hypot(dx, dy) <= 6) {
      openBoard();
      return;
    }

    if (current.axis === "x" && liveCategory) {
      const width = frontCardRef.current?.getBoundingClientRect().width || 1;
      const commit = Math.abs(dx) > 0.2 * width || (
        Math.abs(current.velocityX) > 0.55 &&
        Math.abs(dx) > 0.06 * width &&
        Math.sign(current.velocityX) === Math.sign(dx)
      );
      setDrag({ axis: null, x: 0, y: 0 });
      if (commit) moveBoard(dx < 0 ? "next" : "previous");
      return;
    }

    if (current.axis === "y") {
      const height = window.innerHeight;
      const commit = Math.abs(dy) > 0.17 * height || (
        Math.abs(current.velocityY) > 0.5 &&
        Math.abs(dy) > 0.05 * height &&
        Math.sign(current.velocityY) === Math.sign(dy)
      );
      setDrag({ axis: null, x: 0, y: 0 });
      if (commit) moveCategory(dy < 0 ? "next" : "previous");
    }
  };

  const panelSlots = useMemo(() => categories.map((_, index) => (
    nearestSlot(index, virtualIndex, categoryCount)
  )), [categories, categoryCount, virtualIndex]);

  if (!categoryCount) {
    return <main className="moodboard-browser moodboard-browser--empty"><em>Moodboards forthcoming</em></main>;
  }

  const dragProgress = drag.axis === "x"
    ? Math.min(Math.abs(drag.x) / Math.max(1, (frontCardRef.current?.offsetWidth ?? 1) * 0.45), 1) * 0.42
    : 0;

  return (
    <main
      ref={rootRef}
      className={`moodboard-browser moodboard-browser--${theme}${opened ? " is-open" : ""}${drag.axis ? " is-dragging" : ""}`}
      data-board-motion={boardMotion}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      <div className="moodboard-theme" role="group" aria-label="Color theme" data-chrome="true">
        <button
          type="button"
          className={theme === "light" ? "is-active" : ""}
          aria-label="Use light theme"
          aria-pressed={theme === "light"}
          onClick={() => setTheme("light")}
        >
          <Sun aria-hidden="true" size={18} weight="light" />
        </button>
        <button
          type="button"
          className={theme === "dark" ? "is-active" : ""}
          aria-label="Use dark theme"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme("dark")}
        >
          <Moon aria-hidden="true" size={17} weight="light" />
        </button>
      </div>

      <ArrowButton direction="up" nudged={nudge === "up"} disabled={categoryCount < 2} onClick={() => moveCategory("previous")} />
      <ArrowButton direction="right" nudged={nudge === "right"} disabled={(liveCategory?.boards.length ?? 0) < 2} onClick={() => moveBoard("next")} />
      <ArrowButton direction="down" nudged={nudge === "down"} disabled={categoryCount < 2} onClick={() => moveCategory("next")} />
      <ArrowButton direction="left" nudged={nudge === "left"} disabled={(liveCategory?.boards.length ?? 0) < 2} onClick={() => moveBoard("previous")} />

      <div
        className={`moodboard-track${categoryMoving ? " is-moving" : ""}${drag.axis === "y" ? " is-following" : ""}`}
        style={{
          "--moodboard-vi": virtualIndex,
          "--moodboard-drag-y": `${drag.axis === "y" ? drag.y : 0}px`,
          "--moodboard-page-duration": reducedMotion ? "200ms" : "640ms",
        } as CSSProperties}
      >
        {categories.map((category, categoryIndex) => {
          const isLive = categoryIndex === liveCategoryIndex;
          const selectedIndex = mod(boardIndexes[categoryIndex] ?? 0, category.boards.length || 1);
          return (
            <section
              key={category.id}
              className="moodboard-panel"
              aria-hidden={!isLive}
              style={{ top: `${panelSlots[categoryIndex] * 100}%` }}
            >
              <h1 className="moodboard-category-name">{category.name}</h1>
              {category.boards.length ? (
                <div className="moodboard-stack" aria-label={`${category.name} moodboards`}>
                  {category.boards.map((board, boardIndex) => {
                    const depth = mod(boardIndex - selectedIndex, category.boards.length);
                    const pose = depthPose(depth);
                    const isFront = depth === 0;
                    const isPreviousBack = depth === category.boards.length - 1;
                    const dragFollowerDepth = drag.axis === "x" && isLive && depth > 0
                      ? Math.max(0, depth - dragProgress)
                      : depth;
                    const followerPose = depthPose(dragFollowerDepth);
                    const motionPose = boardMotion === "next-out" && depth > 0
                      ? depthPose(depth - 1)
                      : boardMotion === "previous-out" && !isPreviousBack
                        ? depthPose(depth + 1)
                        : pose;
                    const activePose = drag.axis === "x" && isLive
                      ? (isFront ? {
                          x: (drag.x / Math.max(1, frontCardRef.current?.offsetWidth ?? 1)) * 100,
                          y: (Math.abs(drag.x) * 0.03 / Math.max(1, frontCardRef.current?.offsetWidth ?? 1)) * 100,
                          rotate: Math.max(-4.5, Math.min(4.5, (drag.x / Math.max(1, frontCardRef.current?.offsetWidth ?? 1)) * 7)),
                          scale: 1,
                          dim: 0,
                        } : followerPose)
                      : motionPose;

                    return (
                      <button
                        key={board.id}
                        ref={isLive && isFront ? frontCardRef : undefined}
                        type="button"
                        className={`moodboard-card${isFront ? " is-front" : ""}${isPreviousBack ? " is-previous-back" : ""}`}
                        role="button"
                        aria-label={isFront ? `Open moodboard: ${board.title}` : undefined}
                        aria-hidden={!isLive || !isFront}
                        tabIndex={isLive && isFront ? 0 : -1}
                        data-depth={Math.min(depth, 3)}
                        style={{
                          "--card-x": `${activePose.x}%`,
                          "--card-y": `${activePose.y}%`,
                          "--card-rotate": `${activePose.rotate}deg`,
                          "--card-scale": activePose.scale,
                          "--card-dim": activePose.dim,
                          zIndex: category.boards.length - depth,
                        } as CSSProperties}
                        onClick={(event) => event.preventDefault()}
                      >
                        <span className="moodboard-card__mount">
                          <span className="moodboard-card__plate">
                            {/* Generated 16:9 derivatives are displayed contain-fit by contract. */}
                            <img src={board.preview.url} alt="" draggable={false} />
                          </span>
                          <span className="moodboard-card__title">{board.title}</span>
                          <span className="moodboard-card__veil" aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : <em className="moodboard-empty-message">Moodboards forthcoming</em>}
            </section>
          );
        })}
      </div>

      {opened ? (
        <div className={`moodboard-expanded${openVisible ? " is-visible" : ""}`}>
          <div className="moodboard-expanded__veil" />
          <button
            type="button"
            className="moodboard-expanded__art"
            aria-label={`Close moodboard: ${opened.title}`}
            onClick={() => closeBoard()}
          >
            <img src={opened.full.url} alt={opened.title} />
          </button>
          <p className="moodboard-expanded__label">{opened.title}</p>
          <button
            ref={closeRef}
            type="button"
            className="moodboard-expanded__close"
            aria-label="Close moodboard"
            data-chrome="true"
            onClick={() => closeBoard()}
          >
            <X aria-hidden="true" size={18} weight="light" />
          </button>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </main>
  );
}
