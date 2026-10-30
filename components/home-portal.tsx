"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalModel } from "./portal-model";
import { homeModelPosters } from "@/lib/home-model-posters";

export type FontChoice = "syne-tactile" | "syne-mono" | "ncl-bhagnes";
type RotationChoice = "slow" | "medium" | "fast";
type LabelScaleChoice = "current" | "75" | "65" | "60" | "55" | "50";
type IconScaleChoice = "small" | "current" | "large";
type PortalId = "films" | "moodboards" | "projections" | "lists";
type ModelId =
  | "vcr"
  | "camellia"
  | "cigarette-box"
  | "air-conditioner"
  | "camcorder"
  | "audio-recorder"
  | "video-walkman"
  | "nokia";

type PortalConfig = {
  id: PortalId;
  label: string;
  href: string;
  defaultModel: ModelId;
  modelScale: number;
};

type ModelOption = {
  id: ModelId;
  label: string;
  model: string;
  poster?: string;
  rotation: [number, number, number];
  cameraDistance?: number;
  rotationPeriodMultiplier?: number;
};

const modelOptions: ModelOption[] = [
  {
    id: "vcr",
    label: "Hanseatic VCR",
    model: "/models/home/vcr-hanseatic-vcr-200.glb",
    poster: homeModelPosters.vcr,
    rotation: [-0.04, -0.2, 0],
    cameraDistance: 7.2,
    rotationPeriodMultiplier: 28 / 18,
  },
  {
    id: "camellia",
    label: "Camellia flower",
    model: "/models/home/camellia-sasanqua-shishigashira.glb",
    poster: homeModelPosters.camellia,
    rotation: [-0.2, -0.35, -0.04],
  },
  {
    id: "cigarette-box",
    label: "Cigarette box",
    model: "/models/home/cigarette-box.glb",
    poster: homeModelPosters["cigarette-box"],
    rotation: [0.12, -0.35, 0.04],
  },
  {
    id: "air-conditioner",
    label: "LG air conditioner",
    model: "/models/home/air-conditioner.glb",
    rotation: [0.02, -0.25, 0],
  },
  {
    id: "camcorder",
    label: "PSX camcorder",
    model: "/models/home/candidates/psx-handheld-camcorder.glb",
    rotation: [-0.06, -0.4, 0],
  },
  {
    id: "audio-recorder",
    label: "Audio recorder",
    model: "/models/home/candidates/audio-recorder.glb",
    rotation: [0.04, -0.32, 0],
  },
  {
    id: "video-walkman",
    label: "Sony GV-8 Walkman",
    model: "/models/home/candidates/sony-gv-8-video-walkman.glb",
    rotation: [-0.04, -0.28, 0],
  },
  {
    id: "nokia",
    label: "PSX Nokia",
    model: "/models/home/candidates/psx-nokia.glb",
    poster: homeModelPosters.nokia,
    rotation: [-0.08, -0.3, 0.03],
  },
];

const portals: PortalConfig[] = [
  {
    id: "lists",
    label: "lists",
    href: "/lists",
    defaultModel: "nokia",
    modelScale: 0.68,
  },
  {
    id: "moodboards",
    label: "mood board",
    href: "/moodboards",
    defaultModel: "camellia",
    modelScale: 0.82,
  },
  {
    id: "films",
    label: "films",
    href: "/films",
    defaultModel: "vcr",
    modelScale: 1.2,
  },
  {
    id: "projections",
    label: "projections",
    href: "/projections",
    defaultModel: "cigarette-box",
    modelScale: 0.5,
  },
];

const defaultModels = Object.fromEntries(
  portals.map((portal) => [portal.id, portal.defaultModel]),
) as Record<PortalId, ModelId>;

const fontOptions: Array<{
  value: FontChoice;
  label: string;
  licensed: boolean;
}> = [
  { value: "syne-tactile", label: "Syne Tactile", licensed: true },
  { value: "syne-mono", label: "Syne Mono", licensed: true },
  { value: "ncl-bhagnes", label: "NCL Bhagnes", licensed: true },
];

const rotationOptions: Array<{
  value: RotationChoice;
  label: string;
  secondsPerRevolution: number;
}> = [
  { value: "slow", label: "Slow · 28 sec", secondsPerRevolution: 28 },
  { value: "medium", label: "Medium · 18 sec", secondsPerRevolution: 18 },
  { value: "fast", label: "Fast · 10 sec", secondsPerRevolution: 10 },
];

const labelScaleOptions: Array<{
  value: LabelScaleChoice;
  label: string;
}> = [
  { value: "current", label: "Current · 100%" },
  { value: "75", label: "75%" },
  { value: "65", label: "65%" },
  { value: "60", label: "60%" },
  { value: "55", label: "55%" },
  { value: "50", label: "50%" },
];

const iconScaleOptions: Array<{ value: IconScaleChoice; label: string }> = [
  { value: "small", label: "Small · 85%" },
  { value: "current", label: "Current · 100%" },
  { value: "large", label: "Large · 115%" },
];

export function HomePortal() {
  const [font, setFont] = useState<FontChoice>("syne-mono");
  const [showTypeLab, setShowTypeLab] = useState(false);
  const [captureScaleHalf, setCaptureScaleHalf] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("font") === "syne-tactile") setFont("syne-tactile");
    setShowTypeLab(params.get("type-lab") === "1");
    setCaptureScaleHalf(params.get("capture") === "1");
  }, []);
  const [rotationSpeed, setRotationSpeed] =
    useState<RotationChoice>("fast");
  const [labelScale, setLabelScale] =
    useState<LabelScaleChoice>("75");
  const [iconScale, setIconScale] =
    useState<IconScaleChoice>("current");
  const [studyPage, setStudyPage] = useState<1 | 2>(1);
  const [selectedModels, setSelectedModels] =
    useState<Record<PortalId, ModelId>>(defaultModels);
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const rotationPeriod =
    rotationOptions.find((option) => option.value === rotationSpeed)
      ?.secondsPerRevolution ?? 18;

  function chooseFont(nextFont: FontChoice) {
    if (nextFont === "ncl-bhagnes") return;
    setFont(nextFont);
  }

  function cycleModel(portalId: PortalId, direction: -1 | 1) {
    setSelectedModels((current) => {
      const currentIndex = modelOptions.findIndex(
        (option) => option.id === current[portalId],
      );
      const nextIndex =
        (currentIndex + direction + modelOptions.length) % modelOptions.length;

      return { ...current, [portalId]: modelOptions[nextIndex].id };
    });
  }

  return (
    <main
      className={`portal-home${captureScaleHalf ? " portal-home--capture-scale" : ""}`}
      data-font={font}
      data-label-scale={labelScale}
      data-icon-scale={iconScale}
    >
      <h1 className="sr-only">Second Viewing</h1>
      <p className="sr-only">
        Choose a section: films, moodboards, projections, or lists.
      </p>

      <div className="portal-field" aria-label="Editorial sections">
        {portals.map((portal) => {
          const selectedModel =
            modelOptions.find(
              (option) => option.id === selectedModels[portal.id],
            ) ?? modelOptions[0];

          return (
            <Link
              className={`portal portal--${portal.id}`}
              href={portal.href}
              key={portal.id}
              aria-label={`Open ${portal.label}`}
              onPointerEnter={() => setActivePortal(portal.id)}
              onPointerLeave={() => setActivePortal(null)}
              onFocus={() => setActivePortal(portal.id)}
              onBlur={() => setActivePortal(null)}
            >
              <PortalModel
                key={`${portal.id}-${selectedModel.id}`}
                src={selectedModel.model}
                poster={selectedModel.poster}
                rotation={selectedModel.rotation}
                rotationPeriod={
                  rotationPeriod *
                  (selectedModel.rotationPeriodMultiplier ?? 1)
                }
                modelScale={portal.modelScale}
                cameraDistance={selectedModel.cameraDistance}
                active={activePortal === portal.id}
              />
              {portal.id === "moodboards" ? (
                <span className="portal__label portal__label--mood" aria-hidden="true">
                  <span>mood</span>
                  <span>board</span>
                </span>
              ) : (
                <span className="portal__label" aria-hidden="true">
                  {portal.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {showTypeLab ? (
        <aside className="type-lab" aria-label="Homepage review controls">
          <div className="type-lab__header">
            <div>
              <p>{studyPage === 1 ? "type study" : "object study"}</p>
              <span>{studyPage} / 2</span>
            </div>
            <button
              className="type-lab__page-button"
              type="button"
              aria-label={
                studyPage === 1
                  ? "Open 3D object study"
                  : "Return to type study"
              }
              onClick={() => setStudyPage(studyPage === 1 ? 2 : 1)}
            >
              {studyPage === 1 ? "→" : "←"}
            </button>
          </div>

          {studyPage === 1 ? (
            <>
              <div className="type-lab__group">
                <p>label font</p>
                <div role="group" aria-label="Label font">
                  {fontOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      disabled={!option.licensed}
                      aria-pressed={font === option.value}
                      title={
                        option.licensed
                          ? undefined
                          : "A commercial font license is required before this option can be embedded."
                      }
                      onClick={() => chooseFont(option.value)}
                    >
                      {option.label}
                      {!option.licensed ? " — license needed" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div className="type-lab__group">
                <p>rotation period</p>
                <div role="group" aria-label="Object rotation speed">
                  {rotationOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      aria-pressed={rotationSpeed === option.value}
                      onClick={() => setRotationSpeed(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="type-lab__group">
                <p>label size</p>
                <div role="group" aria-label="Label size">
                  {labelScaleOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      aria-pressed={labelScale === option.value}
                      onClick={() => setLabelScale(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="type-lab__group">
                <p>3D icon size</p>
                <div role="group" aria-label="3D object size">
                  {iconScaleOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      aria-pressed={iconScale === option.value}
                      onClick={() => setIconScale(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="object-study">
              <p className="object-study__intro">
                Cycle each section independently. The homepage updates live.
              </p>
              {portals.map((portal) => {
                const currentIndex = modelOptions.findIndex(
                  (option) => option.id === selectedModels[portal.id],
                );
                const currentModel = modelOptions[currentIndex];

                return (
                  <div className="object-study__row" key={portal.id}>
                    <div className="object-study__meta">
                      <p>{portal.label}</p>
                      <span>
                        {currentIndex + 1} / {modelOptions.length}
                      </span>
                    </div>
                    <div
                      className="object-study__picker"
                      role="group"
                      aria-label={`${portal.label} 3D model`}
                    >
                      <button
                        type="button"
                        aria-label={`Previous model for ${portal.label}`}
                        onClick={() => cycleModel(portal.id, -1)}
                      >
                        ←
                      </button>
                      <output aria-live="polite">{currentModel.label}</output>
                      <button
                        type="button"
                        aria-label={`Next model for ${portal.label}`}
                        onClick={() => cycleModel(portal.id, 1)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                className="object-study__reset"
                type="button"
                onClick={() => setSelectedModels(defaultModels)}
              >
                Reset original pairings
              </button>
            </div>
          )}
        </aside>
      ) : null}
    </main>
  );
}
