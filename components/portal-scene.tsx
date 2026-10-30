"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Group, MathUtils, Vector3 } from "three";

type PortalSceneProps = {
  src: string;
  rotation: [number, number, number];
  rotationPeriod: number;
  modelScale: number;
  cameraDistance?: number;
  active: boolean;
};

type ModelProps = PortalSceneProps & {
  reduceMotion: boolean;
};

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduceMotion;
}

function Model({
  src,
  rotation,
  rotationPeriod,
  modelScale,
  active,
  reduceMotion,
}: ModelProps) {
  const { scene } = useGLTF(src);
  const spin = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const baseScale = useRef(modelScale);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z) || 1;

    clone.traverse((child) => {
      child.frustumCulled = false;
    });

    return {
      object: clone,
      center,
      scale: 3.35 / largestDimension,
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (!spin.current || !shell.current) return;

    if (!reduceMotion) {
      const radiansPerSecond = (Math.PI * 2) / rotationPeriod;
      spin.current.rotation.y += delta * radiansPerSecond * (active ? 1.25 : 1);
      spin.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
    }

    const targetScale = modelScale * (active ? 1.045 : 1);
    baseScale.current = MathUtils.damp(baseScale.current, targetScale, 8, delta);
    shell.current.scale.setScalar(baseScale.current);
  });

  return (
    <group ref={spin} rotation={rotation}>
      <group ref={shell}>
        <group scale={normalized.scale}>
          <group position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]}>
            <primitive object={normalized.object} />
          </group>
        </group>
      </group>
    </group>
  );
}

export default function PortalScene({
  cameraDistance = 5.6,
  ...props
}: PortalSceneProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, cameraDistance], fov: 31, near: 0.01, far: 100 }}
      dpr={[1, 1.5]}
      frameloop={reduceMotion ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={3.2} />
      <hemisphereLight args={[0xffffff, 0x252822, 2.1]} />
      <directionalLight position={[4, 5, 6]} intensity={4.4} />
      <directionalLight position={[-4, 1, 3]} intensity={1.5} />
      <Suspense fallback={null}>
        <Model {...props} reduceMotion={reduceMotion} />
      </Suspense>
    </Canvas>
  );
}

// Preload only the four published pairings. Study alternatives load when selected.
useGLTF.preload("/models/home/camellia-sasanqua-shishigashira.glb");
useGLTF.preload("/models/home/vcr-hanseatic-vcr-200.glb");
useGLTF.preload("/models/home/cigarette-box.glb");
useGLTF.preload("/models/home/candidates/psx-nokia.glb");
