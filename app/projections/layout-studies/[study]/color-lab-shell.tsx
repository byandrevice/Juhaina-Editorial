"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { projectionPalettes } from "@/lib/projection-palettes";
import styles from "./study.module.css";

const storageKey = "second-viewing:projection-reader-palette";

type PaletteStyle = CSSProperties & {
  "--study-bg": string;
  "--study-fg": string;
};

export function ColorLabShell({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const [paletteId, setPaletteId] = useState("home");
  const [isReady, setIsReady] = useState(false);
  const paletteIndex = Math.max(
    0,
    projectionPalettes.findIndex((palette) => palette.id === paletteId),
  );
  const activePalette = projectionPalettes[paletteIndex];

  useEffect(() => {
    const searchPalette = new URLSearchParams(window.location.search).get("palette");
    const savedPalette = window.localStorage.getItem(storageKey);
    const initialPalette = [searchPalette, savedPalette].find(
      (candidate) => candidate && projectionPalettes.some(({ id }) => id === candidate),
    );

    if (initialPalette) setPaletteId(initialPalette);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    window.localStorage.setItem(storageKey, paletteId);
    const url = new URL(window.location.href);
    url.searchParams.set("palette", paletteId);
    window.history.replaceState(null, "", url);
  }, [isReady, paletteId]);

  const paletteStyle = useMemo<PaletteStyle>(
    () => ({
      "--study-bg": activePalette.background,
      "--study-fg": activePalette.foreground,
    }),
    [activePalette],
  );

  function cyclePalette(direction: -1 | 1) {
    const nextIndex =
      (paletteIndex + direction + projectionPalettes.length) % projectionPalettes.length;
    setPaletteId(projectionPalettes[nextIndex].id);
  }

  return (
    <main className={className} style={paletteStyle} data-palette={activePalette.id}>
      {children}
      <section className={styles.colorLab} aria-label="Projection color palette">
        <div className={styles.colorLabReadout}>
          <span>{activePalette.label}</span>
          <output aria-live="polite">
            {activePalette.background} / {activePalette.foreground}
          </output>
          {"note" in activePalette ? (
            <span className={styles.colorLabNote} title={activePalette.note}>
              Assumed #66FFC5
            </span>
          ) : null}
        </div>
        <div className={styles.colorLabControls}>
          <button
            type="button"
            onClick={() => cyclePalette(-1)}
            aria-label="Previous color palette"
          >
            <CaretLeft aria-hidden="true" weight="bold" />
          </button>
          <div
            className={styles.colorLabOptions}
            role="group"
            aria-label="Choose a color palette"
          >
            {projectionPalettes.map((palette) => (
              <button
                key={palette.id}
                type="button"
                className={styles.colorLabSwatch}
                style={{ background: palette.background, color: palette.foreground }}
                aria-label={`${palette.label}: ${palette.background} background, ${palette.foreground} text`}
                aria-pressed={palette.id === activePalette.id}
                onClick={() => setPaletteId(palette.id)}
                title={`${palette.label} · ${palette.background} / ${palette.foreground}${"note" in palette ? " · #66FFCS interpreted as #66FFC5" : ""}`}
              >
                Aa
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => cyclePalette(1)}
            aria-label="Next color palette"
          >
            <CaretRight aria-hidden="true" weight="bold" />
          </button>
        </div>
      </section>
    </main>
  );
}
