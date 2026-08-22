// Lazy chunk: everything that pulls three.js/R3F for the landing chapter
// lives here so the hero never waits for it (design system: ExplodedModel).
import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, MathUtils, type Group } from "three";
import { ProductLighting, RacecarAssemblyParts } from "../RacecarAssembly";
import { CHAPTER_MAX_EXPLOSION } from "./ExplodedModel";

// Product camera (docs/design/CAR_CHAPTER.md): a long lens pitched gently
// down. The 40 degree lens of v2 made the only tall vertical on the car, the
// LiDAR, lean by several degrees whenever it sat off-center, which read as a
// wrong sensor frame while the car turned. At 26 degrees the lean stays
// under 3 degrees at the 70% framing.
export const CHAPTER_FOV = 26;
const PITCH_DEG = 17;
const AZIMUTH_DEG = 45;
// Projected width of the car along the view (meters) at its widest turntable
// pose (the diagonal): assembled 0.53 (0.45 m long, 0.30 m wide), at the
// chapter's explosion ceiling 0.78 (wheels out 0.175 m each side). The
// camera distance is solved so this span fills FILL of the canvas width at
// any aspect; measured 2026-08-21 at 1440x900: 0.70 at rest, 0.69 at the
// ceiling, nothing crops.
const SPAN = { rest: 0.49, exploded: 0.74 };
const FILL = 0.78;
// The point the camera studies: the car's center at rest, lifted as the
// LiDAR and wheels rise.
const TARGET = { rest: [0.03, 0.06, 0], exploded: [0.03, 0.1, 0] } as const;

const VIEW_DIR = (() => {
  const p = MathUtils.degToRad(PITCH_DEG);
  const a = MathUtils.degToRad(AZIMUTH_DEG);
  return [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)] as const;
})();

/** Camera distance that fits `span` meters into FILL of the canvas width. */
function chapterDistance(aspect: number, progress: number) {
  const span = MathUtils.lerp(SPAN.rest, SPAN.exploded, progress);
  const halfTan = Math.tan(MathUtils.degToRad(CHAPTER_FOV / 2)) * Math.max(aspect, 0.45);
  // Portrait canvases (phones) have height to spare: let the car use almost
  // the full width there (critique: ~45% on 390 with the desktop fill).
  const fill = aspect < 1 ? 0.95 : FILL;
  return span / fill / (2 * halfTan);
}

/** Frames the car by canvas aspect and dollies with the explosion: a tight
 * product shot at rest, pulling back as the parts fly so the exploded span
 * never crops. */
function ChapterCamera({ explosionRef }: { explosionRef: RefObject<number> }) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.viewport.aspect);
  const invalidate = useThree((s) => s.invalidate);

  const place = () => {
    const progress = Math.min(1, (explosionRef.current ?? 0) / CHAPTER_MAX_EXPLOSION);
    const d = chapterDistance(aspect, progress);
    const tx = MathUtils.lerp(TARGET.rest[0], TARGET.exploded[0], progress);
    const ty = MathUtils.lerp(TARGET.rest[1], TARGET.exploded[1], progress);
    const tz = MathUtils.lerp(TARGET.rest[2], TARGET.exploded[2], progress);
    camera.position.set(VIEW_DIR[0] * d + tx, VIEW_DIR[1] * d + ty, VIEW_DIR[2] * d + tz);
    camera.lookAt(tx, ty, tz);
  };

  useEffect(() => {
    place();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-place on aspect change only
  }, [camera, aspect, invalidate]);

  useFrame(place);
  return null;
}

type ExplodedModelSceneProps = {
  /** Scroll-driven explosion amount, 0 assembled -> ceiling exploded. */
  explosionRef: RefObject<number>;
  /** Render one assembled frame and stop (reduced motion). */
  staticPose?: boolean;
  /** False while the chapter is off-screen: the render loop pauses. */
  active?: boolean;
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

export default function ExplodedModelScene({
  explosionRef,
  staticPose = false,
  active = true,
}: ExplodedModelSceneProps) {
  const zeroRef = useRef(0);
  const frameloop = staticPose ? "demand" : active ? "always" : "never";
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      camera={{ fov: CHAPTER_FOV, near: 0.05, far: 40, position: [1.6, 0.6, 1.6] }}
      dpr={[1, 1.5]}
      frameloop={frameloop}
      shadows="soft"
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      onCreated={({ camera }) => camera.lookAt(TARGET.rest[0], TARGET.rest[1], TARGET.rest[2])}
      aria-hidden="true"
    >
      <ChapterCamera explosionRef={staticPose ? zeroRef : explosionRef} />
      {/* Product lighting shared with /assembly: studio IBL, a 35 degree key
          with a soft shadow, a white rim from behind-left. Alpha canvas over
          ink-950, no fog, no colored lights. */}
      <ProductLighting shadowMapSize={smallScreen ? 1024 : 2048} />
      <Suspense fallback={null}>
        {staticPose ? (
          <RacecarAssemblyParts explosion={0} explosionRef={zeroRef} interactive={false} />
        ) : (
          <SpinGroup explosionRef={explosionRef}>
            {/* Mount pose matches the chapter's rest state: assembled. */}
            <RacecarAssemblyParts explosion={0} explosionRef={explosionRef} interactive={false} />
          </SpinGroup>
        )}
        <ContactShadows position={[0, -0.003, 0]} opacity={0.55} scale={2.4} blur={2.4} far={1.2} resolution={512} />
      </Suspense>
    </Canvas>
  );
}
