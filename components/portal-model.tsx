"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import type { PortalSceneProps } from "./portal-scene";

const PortalScene = dynamic(() => import("./portal-scene"), { ssr: false });

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function PortalModel({
  poster,
  ...props
}: PortalSceneProps & { poster?: string }) {
  const [enhance, setEnhance] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Let the HTML previews paint before starting the 3D bundle and WebGL.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setEnhance(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <span className="portal__model" data-ready={ready} aria-hidden="true">
      {poster ? (
        <img
          className="portal__poster"
          src={poster}
          alt=""
          width={1024}
          height={512}
          loading="eager"
          draggable={false}
        />
      ) : null}
      {enhance ? (
        <SceneBoundary>
          <PortalScene {...props} onReady={() => setReady(true)} />
        </SceneBoundary>
      ) : null}
    </span>
  );
}
