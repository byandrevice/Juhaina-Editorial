"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  slugifyListLabel,
  type ListCollection,
  type ListType,
  type ListYear,
} from "@/lib/lists-data";

const referenceWidth = 1440;
const referenceHeight = 780;
const cardWidth = 126;
const centerX = 720;
const centerY = 368;
const radiusX = 548;
const radiusY = 288;
const revolutionSeconds = 45;

const listsDisplayFont = '"Libre Caslon Text", Georgia, serif';
const posterSize = 115;
type FilterTransition = {
  phase: "collapsing" | "expanding";
  startedAt: number;
  nextType: ListType;
  nextYear: ListYear;
};

const filterCollapseDuration = 480;
const filterExpandDuration = 720;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5);
}

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

function pathFor(type: ListType, year: ListYear, rank?: string | null, listView = false) {
  const base = `/lists/${slugifyListLabel(type)}/${year === "All time" ? "all" : slugifyListLabel(year)}`;
  const pathname = rank ? `${base}/${rank}` : base;
  const query = new URLSearchParams();
  if (listView) query.set("view", "list");
  return query.size ? `${pathname}?${query}` : pathname;
}

export function ListsHalo({
  collections,
  initialType,
  initialYear,
  initialRank,
  initialListView,
}: {
  collections: ListCollection[];
  initialType: ListType;
  initialYear: ListYear;
  initialRank: string | null;
  initialListView: boolean;
}) {
  const [type, setType] = useState(initialType);
  const [year, setYear] = useState(initialYear);
  const [phase, setPhase] = useState(0);
  const [focus, setFocus] = useState(5);
  const [selected, setSelected] = useState<number | null>(initialRank ? Math.max(0, Number(initialRank) - 1) : null);
  const [openMenu, setOpenMenu] = useState<"type" | "year" | null>(null);
  const [listView, setListView] = useState(initialListView);
  const [bloom, setBloom] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [settleUntil, setSettleUntil] = useState(Date.now() + 900);
  const [stageScale, setStageScale] = useState(1);
  const [compact, setCompact] = useState(false);
  const [stageSize, setStageSize] = useState({ width: referenceWidth, height: referenceHeight });
  const [filterMotion, setFilterMotion] = useState<"idle" | "collapsing" | "expanding">("idle");
  const phaseRef = useRef(phase);
  const selectedRef = useRef(selected);
  const listViewRef = useRef(listView);
  const reducedRef = useRef(reducedMotion);
  const settleRef = useRef(settleUntil);
  const typeRef = useRef(type);
  const yearRef = useRef(year);
  const filterMotionRef = useRef(false);
  const filterTransitionRef = useRef<FilterTransition | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => collections.find((entry) => entry.typeLabel === type && entry.periodLabel === year) ?? collections[0], [collections, type, year]);
  const typeOptions = useMemo(() => Array.from(new Set(collections.map((entry) => entry.typeLabel))), [collections]);
  const periodOptions = useMemo(() => collections.filter((entry) => entry.typeLabel === type).map((entry) => entry.periodLabel), [collections, type]);
  const count = list.items.length;

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { listViewRef.current = listView; }, [listView]);
  useEffect(() => { reducedRef.current = reducedMotion; }, [reducedMotion]);
  useEffect(() => { settleRef.current = settleUntil; }, [settleUntil]);
  useEffect(() => { typeRef.current = type; }, [type]);
  useEffect(() => { yearRef.current = year; }, [year]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const hadStudyParams = ["font", "poster", "theme"].some((key) => url.searchParams.has(key));
    if (hadStudyParams) {
      url.searchParams.delete("font");
      url.searchParams.delete("poster");
      url.searchParams.delete("theme");
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }
  }, []);

  const closeDetail = useCallback((updateUrl = true) => {
    const previous = selectedRef.current;
    setSelected(null);
    selectedRef.current = null;
    setSettleUntil(Date.now() + 2000);
    settleRef.current = Date.now() + 2000;
    if (updateUrl) window.history.replaceState(null, "", pathFor(typeRef.current, yearRef.current));
    window.setTimeout(() => { if (previous != null) cardRefs.current[previous]?.focus(); }, 760);
  }, []);

  const selectItem = useCallback((index: number, push = true) => {
    setSelected(index);
    selectedRef.current = index;
    setFocus(index);
    setSettleUntil(Date.now() + 900);
    settleRef.current = Date.now() + 900;
    if (push) window.history.pushState(null, "", pathFor(typeRef.current, yearRef.current, String(index + 1)));
  }, []);

  const step = useCallback((direction: number) => {
    const length = collections.find((entry) => entry.typeLabel === typeRef.current && entry.periodLabel === yearRef.current)?.items.length ?? 1;
    if (selectedRef.current != null) {
      const next = Math.max(0, Math.min(length - 1, selectedRef.current + direction));
      if (next !== selectedRef.current) selectItem(next, false);
      window.history.replaceState(null, "", pathFor(typeRef.current, yearRef.current, String(next + 1)));
      return;
    }
    const nextPhase = wrap(phaseRef.current + direction, length);
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
    setFocus(wrap(Math.round(nextPhase) + Math.round(length / 2), length));
    setSettleUntil(Date.now() + 620);
    settleRef.current = Date.now() + 620;
  }, [collections, selectItem]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      const nextCompact = bounds.width < 700;
      setCompact(nextCompact);
      setStageSize({ width: bounds.width, height: bounds.height });
      setStageScale(nextCompact
        ? Math.min(0.86, Math.max(0.62, bounds.width / 620))
        : Math.min(1, bounds.width / referenceWidth, bounds.height / referenceHeight));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let accumulator = 0;
    const tick = (now: number) => {
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      accumulator += delta;
      const phaseFrame = filterMotionRef.current ? 0 : 0.06;
      if (accumulator > phaseFrame && !reducedRef.current && selectedRef.current == null && !listViewRef.current) {
        const length = collections.find((entry) => entry.typeLabel === typeRef.current && entry.periodLabel === yearRef.current)?.items.length ?? 1;
        const next = wrap(phaseRef.current + (length / revolutionSeconds) * accumulator, length);
        phaseRef.current = next;
        setPhase(next);
        setFocus(wrap(Math.round(next) + Math.round(length / 2), length));
        accumulator = 0;
      }

      const filterTransition = filterTransitionRef.current;
      if (filterTransition && !reducedRef.current) {
        const duration = filterTransition.phase === "collapsing" ? filterCollapseDuration : filterExpandDuration;
        const progress = Math.min(1, (now - filterTransition.startedAt) / duration);

        if (filterTransition.phase === "collapsing") {
          setBloom(1 - easeInOutCubic(progress));
          if (progress === 1) {
            const nextLength = collections.find((entry) => entry.typeLabel === filterTransition.nextType && entry.periodLabel === filterTransition.nextYear)?.items.length ?? 1;
            setBloom(0);
            setType(filterTransition.nextType);
            setYear(filterTransition.nextYear);
            typeRef.current = filterTransition.nextType;
            yearRef.current = filterTransition.nextYear;
            setFocus(wrap(Math.round(phaseRef.current) + Math.round(nextLength / 2), nextLength));
            setSelected(null);
            selectedRef.current = null;
            setListView(false);
            listViewRef.current = false;
            setFilterMotion("expanding");
            filterTransitionRef.current = { ...filterTransition, phase: "expanding", startedAt: now };
            window.history.replaceState(null, "", pathFor(filterTransition.nextType, filterTransition.nextYear));
          }
        } else {
          setBloom(easeOutQuint(progress));
          if (progress === 1) {
            setBloom(1);
            setFilterMotion("idle");
            filterMotionRef.current = false;
            filterTransitionRef.current = null;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [collections]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selectedRef.current != null) {
        if (event.key === "Escape") { event.preventDefault(); closeDetail(); }
        return;
      }
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    };
    const onPop = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const rank = /^\d{1,2}$/.test(parts[3] ?? "") ? Number(parts[3]) - 1 : null;
      setSelected(rank);
      selectedRef.current = rank;
      setListView(new URLSearchParams(window.location.search).get("view") === "list");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("popstate", onPop); };
  }, [closeDetail, step]);

  useEffect(() => {
    if (selected == null) return;
    window.history.replaceState(null, "", pathFor(type, year, list.items[selected]?.rank));
  }, [list.items, selected, type, year]);

  useEffect(() => {
    if (selected == null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function changeFilter(next: { type?: ListType; year?: ListYear }) {
    const nextType = next.type ?? type;
    const nextYear = next.year ?? (next.type && next.type !== type
      ? collections.find((entry) => entry.typeLabel === next.type)?.periodLabel ?? year
      : year);
    setOpenMenu(null);
    if (reducedMotion) {
      setType(nextType); setYear(nextYear); setPhase(0); setFocus(5); setSelected(null); setListView(false);
      window.history.replaceState(null, "", pathFor(nextType, nextYear));
      return;
    }
    setFilterMotion("collapsing");
    filterMotionRef.current = true;
    filterTransitionRef.current = {
      phase: "collapsing",
      startedAt: performance.now(),
      nextType,
      nextYear,
    };
  }

  function toggleListView() {
    const next = !listView;
    setListView(next);
    listViewRef.current = next;
    setSelected(null);
    selectedRef.current = null;
    window.history.pushState(null, "", pathFor(type, year, null, next));
  }

  function finishSwipe(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    dragStart.current = null;
    if (selectedRef.current != null) return;
    if (Math.abs(deltaX) > 34 && Math.abs(deltaX) > Math.abs(deltaY)) step(deltaX < 0 ? 1 : -1);
  }

  const structural = !reducedMotion && (filterMotion !== "idle" || selected != null || Date.now() < settleUntil);

  const posterScale = posterSize / 100;
  const posterWidth = cardWidth * posterScale;
  const coverRatio = list.artworkRatio === "square_1_1" ? 1 : list.artworkRatio === "book_5_8" ? 5 / 8 : list.artworkRatio === "landscape_16_9" ? 16 / 9 : 2 / 3;
  const posterHeight = (cardWidth / coverRatio) * posterScale;
  const cardVisualHeight = posterHeight + 78;
  const badgeSize = Math.min(54, 34 + posterScale * 6);
  const compactRadiusX = Math.max(205, (stageSize.width / 2 - (posterWidth * stageScale) / 2 - 16) / stageScale);
  const compactRadiusY = (stageSize.height * 0.36) / stageScale;
  const layoutRadiusX = compact
    ? compactRadiusX
    : posterSize > 125 ? Math.min(radiusX, centerX - posterWidth / 2 - 24) : radiusX;
  const layoutRadiusY = compact
    ? compactRadiusY
    : posterSize > 125 ? Math.max(0, Math.min(radiusY, centerY - cardVisualHeight / 2 - 18)) : radiusY;

  return (
    <main className="lists-page lists-page--dark" style={{ "--lists-display-font": listsDisplayFont, "--lists-poster-width": `${posterWidth}px`, "--lists-poster-height": `${posterHeight}px`, "--lists-badge-size": `${badgeSize}px` } as CSSProperties} onClick={() => { if (selectedRef.current != null) closeDetail(); }}>
      <div className="lists-stage-shell">
        <div ref={stageRef} className={`lists-stage${reducedMotion ? " lists-stage--reduced" : ""}`} onPointerDown={(event) => { if (event.target === event.currentTarget) dragStart.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={finishSwipe} onClick={(event) => { if (selected != null && event.target === event.currentTarget) closeDetail(); }}>
          <div className="lists-stage__scaler" style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}>
            {list.items.map((item, index) => {
              const angle = (-90 + (360 / count) * (index - phase)) * Math.PI / 180;
              const sine = Math.sin(angle);
              const depth = (sine + 1) / 2;
              let x = centerX + layoutRadiusX * Math.cos(angle);
              let y = centerY + layoutRadiusY * sine;
              let scale = 0.84 + 0.16 * depth;
              let opacity = 1;
              let zIndex = 10 + Math.round(depth * 100);
              if (bloom < 1) {
                x = centerX + (x - centerX) * bloom;
                y = centerY + (y - centerY) * bloom;
                scale *= 0.16 + 0.84 * bloom;
                opacity *= bloom;
              }
              const isSelected = selected === index;
              if (selected != null && reducedMotion) {
                opacity = isSelected ? 0.16 : 0;
              } else if (selected != null) {
                if (isSelected) {
                  x = compact ? centerX : 452;
                  y = compact ? 275 : 388;
                  scale = compact ? Math.min(3, 3 / posterScale) : Math.min(2.55, 2.55 / posterScale);
                  opacity = 1;
                  zIndex = 300;
                }
                else { x = centerX + (x - centerX) * 1.42; y = 390 + (y - 390) * 1.42; scale *= 0.74; opacity *= 0.26; }
              }
              return (
                <button ref={(node) => { cardRefs.current[index] = node; }} type="button" className={`lists-card${focus === index && selected == null ? " lists-card--focused" : ""}${isSelected ? " lists-card--selected" : ""}`} aria-label={`${item.rank} ${item.title}`} key={`${item.rank}-${item.title}`} style={{ opacity, zIndex, transform: `translate3d(${x - posterWidth / 2}px, ${y - cardVisualHeight / 2}px, 0) scale(${scale})`, transitionProperty: reducedMotion || filterMotion !== "idle" ? "none" : "transform, opacity", transitionDuration: reducedMotion || filterMotion !== "idle" ? "0ms" : structural ? "720ms, 520ms" : "140ms, 300ms", transitionTimingFunction: structural ? "cubic-bezier(.22,.61,.24,1), ease" : "linear, ease", transitionDelay: "0ms" }} onClick={(event) => { event.stopPropagation(); if (selectedRef.current != null) closeDetail(); else selectItem(index); }}>
                  <span className="lists-card__poster">
                    <span className="lists-card__image" style={{ backgroundColor: item.tone }}>
                      {item.image ? <img src={item.image} alt={item.imageAlt || item.title} draggable={false} style={{ objectPosition: `${item.imagePositionX ?? 50}% ${item.imagePositionY ?? 50}%`, transform: `scale(${item.imageZoom ?? 1})` }} /> : null}
                    </span>
                    {list.showRanks ? <span className="lists-card__rank-badge">{item.rank}</span> : null}
                  </span>
                  <span className="lists-card__label">
                    <span className="lists-card__title">{item.title}</span>
                    <span className="lists-card__meta"><span>{item.creator}</span><time>{item.year}</time></span>
                  </span>
                </button>
              );
            })}

            {selected == null ? <section className={`lists-center${bloom < 1 ? " lists-center--transitioning" : ""}${posterSize > 125 ? " lists-center--oversized" : ""}`}>
              <div className="lists-filters">
                <div className="lists-filter"><span>Type</span><button type="button" aria-expanded={openMenu === "type"} onClick={() => setOpenMenu(openMenu === "type" ? null : "type")}>{type}<small>▾</small></button>{openMenu === "type" ? <div className="lists-menu">{typeOptions.map((option) => <button type="button" className={option === type ? "is-active" : ""} key={option} onClick={() => changeFilter({ type: option })}>{option}</button>)}</div> : null}</div>
                <i aria-hidden="true" />
                <div className="lists-filter"><span>Period</span><button type="button" aria-expanded={openMenu === "year"} onClick={() => setOpenMenu(openMenu === "year" ? null : "year")}>{year}<small>▾</small></button>{openMenu === "year" ? <div className="lists-menu">{periodOptions.map((option) => <button type="button" className={option === year ? "is-active" : ""} key={option} onClick={() => changeFilter({ year: option })}>{option}</button>)}</div> : null}</div>
              </div>
              <h1>{list.title}</h1>
              <button type="button" className="lists-view-toggle" onClick={toggleListView}>View as list</button>
            </section> : null}

            {selected != null ? <section className="lists-detail">
              <button className="lists-detail__close" type="button" onClick={() => closeDetail()}>✕ <span>Esc</span></button>
              <div className="lists-detail__kicker"><span>{list.title}</span></div>
              <h1>{list.items[selected].title}</h1>
              <p className="lists-detail__meta"><span>{list.items[selected].creator}</span><time>{list.items[selected].year}</time></p>
              {list.items[selected].externalUrl ? <a className="lists-detail__link" href={list.items[selected].externalUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Visit link ↗</a> : null}
            </section> : null}

          </div>

          {listView ? <section className="lists-linear">
            <header><h1>{list.title}</h1><button type="button" onClick={toggleListView}>View posters</button></header>
            <div>{list.items.map((item, index) => <button type="button" className={`lists-linear__row${list.showRanks ? "" : " lists-linear__row--unranked"}`} key={item.rank} onClick={() => { setListView(false); listViewRef.current = false; selectItem(index); }}>{list.showRanks ? <span>{item.rank}</span> : null}<i style={{ backgroundColor: item.tone, backgroundImage: item.image ? `url(${item.image})` : undefined }} /><strong>{item.title}</strong><small><span>{item.creator}</span><time>{item.year}</time></small></button>)}</div>
          </section> : null}
        </div>
      </div>
    </main>
  );
}
