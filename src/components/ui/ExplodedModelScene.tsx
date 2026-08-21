// Lazy chunk: everything that pulls three.js/R3F for the landing chapter
// lives here so the hero never waits for it (design system: ExplodedModel).
import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, type Group } from "three";
import { RacecarAssemblyParts, StudioLighting } from "../RacecarAssembly";
import { CHAPTER_MAX_EXPLOSION } from "./ExplodedModel";

// Three-quarter view direction (normalized) and the point the camera studies.
const VIEW_DIR = [0.666, 0.336, 0.666] as const;
const TARGET = [0, 0.04, 0] as const;

/** Frames the car by canvas aspect and dollies with the explosion: a tight
 * product-scale studio shot at rest, pulling back as the parts fly so the
 * exploded span never crops (impeccable review, 2026-08-21). */
function ChapterCamera({ explosionRef }: { explosionRef: RefObject<number> }) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.viewport.aspect);
  const invalidate = useThree((s) => s.invalidate);
  const wide = aspect > 1.2;
  const rest = wide ? 0.72 : 0.98;
  const exploded = wide ? 1.12 : 1.34;

  useEffect(() => {
    const progress = Math.min(1, (explosionRef.current ?? 0) / CHAPTER_MAX_EXPLOSION);
    const d = rest + (exploded - rest) * progress;
    camera.position.set(
      VIEW_DIR[0] * d + TARGET[0],
      VIEW_DIR[1] * d + TARGET[1],
      VIEW_DIR[2] * d + TARGET[2],
    );
    camera.lookAt(TARGET[0], TARGET[1], TARGET[2]);
    invalidate();
  }, [camera, rest, exploded, explosionRef, invalidate]);

  useFrame(() => {
    const progress = Math.min(1, (explosionRef.current ?? 0) / CHAPTER_MAX_EXPLOSION);
    const d = rest + (exploded - rest) * progress;
    camera.position.set(
      VIEW_DIR[0] * d + TARGET[0],
      VIEW_DIR[1] * d + TARGET[1],
      VIEW_DIR[2] * d + TARGET[2],
    );
    camera.lookAt(TARGET[0], TARGET[1], TARGET[2]);
  });
  return null;
}

type ExplodedModelSceneProps = {
  /** Scroll-driven explosion amount, 0 assembled -> ceiling exploded. */
  explosionRef: RefObject<number>;
  /** Render one assembled frame and stop (reduced motion). */
  staticPose?: boolean;
};

function SpinGroup({
  explosionRef,
  children,
}: {
  explosionRef: RefObject<number>;
  children: React.ReactNode;
}) {
  const spin = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!spin.current) return;
    // Slow rotation at rest; it eases out as the parts fly apart
    // (spin factor = 1 - explosion / ceiling).
    const spinFactor = 1 - explosionRef.current / CHAPTER_MAX_EXPLOSION;
    spin.current.rotation.y += delta * 0.3 * Math.max(0, spinFactor);
  });
  return <group ref={spin}>{children}</group>;
}

export default function ExplodedModelScene({ explosionRef, staticPose = false }: ExplodedModelSceneProps) {
  const zeroRef = useRef(0);
  return (
    <Canvas
      camera={{ fov: 40, near: 0.01, far: 30, position: [0.95, 0.52, 0.95] }}
      dpr={[1, 1.5]}
      frameloop={staticPose ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
      onCreated={({ camera }) => camera.lookAt(0, 0.04, 0)}
      aria-hidden="true"
    >
      <ChapterCamera explosionRef={staticPose ? zeroRef : explosionRef} />
      {/* Neutral studio light only - alpha canvas over ink-950, no colored
          rims, no fog (product-render direction, 2026-08-21). Dimmer than
          /assembly so the aluminum does not blow out against ink. */}
      <StudioLighting intensity={0.6} />
      <directionalLight color="#ffffff" intensity={1.1} position={[1.4, 1.9, 1.0]} />
      <Suspense fallback={null}>
        {staticPose ? (
          <RacecarAssemblyParts explosion={0} explosionRef={zeroRef} interactive={false} />
        ) : (
          <SpinGroup explosionRef={explosionRef}>
            {/* Mount pose matches the chapter's rest state: assembled. */}
            <RacecarAssemblyParts explosion={0} explosionRef={explosionRef} interactive={false} />
          </SpinGroup>
        )}
        <ContactShadows position={[0, -0.003, 0]} opacity={0.4} scale={2.2} blur={2.5} far={1.2} resolution={512} />
      </Suspense>
    </Canvas>
  );
}
