// Lazy chunk: everything that pulls three.js/R3F for the landing chapter
// lives here so the hero never waits for it (design system: ExplodedModel).
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html } from "@react-three/drei";
import { ACESFilmicToneMapping, MathUtils, Vector3, type Group, type Object3D } from "three";
import { ProductLighting, RacecarAssemblyParts } from "../RacecarAssembly";
import { RACECAR_CALLOUTS, RACECAR_PARTS } from "../racecarAssemblyData";
import { CHAPTER_MAX_EXPLOSION } from "./ExplodedModel";

// Product camera (docs/design/CAR_CHAPTER.md): a long lens pitched gently
// down. The 40 degree lens of v2 made the only tall vertical on the car, the
// LiDAR, lean by several degrees whenever it sat off-center, which read as a
// wrong sensor frame while the car turned. At 26 degrees the lean stays
// under 3 degrees at the 70% framing.
export const CHAPTER_FOV = 26;
const PITCH_DEG = 17;
const AZIMUTH_DEG = 45;
// Projected width of the car (meters) at its widest turntable pose, solved
// from the mesh vertices under this lens, perspective included (landing-v4,
// docs/design/CAR_CHAPTER.md section 2): assembled 0.53, at the chapter's
// hold pose 0.62 (wheels out 0.055 m each side, LiDAR up 0.07 m; v3's 0.74
// belonged to the old 0.175 m wheel offsets). The camera distance is solved
// so this span fills FILL of the canvas width at any aspect, so no yaw ever
// crops a wheel. At 1440x900 (canvas 621x648): rest 1.54 m, hold 1.78 m.
const SPAN = { rest: 0.53, exploded: 0.62 };
const FILL = 0.9; // v4 0.86, v5 0.92 then 0.90 (LiDAR raised: +-2% margin for the edge labels); the 8/4 split makes the canvas ~1.45x wider
// Canvases narrower than this aspect are phones (390: 0.72); desktop columns
// (1440: 0.96) and tablets (768: 1.09) are not. v3 used `< 1`, which put the
// desktop canvas on the phone fill and over-filled it (probe: 0.93 at the
// hold, wheels touching the edge).
const PHONE_ASPECT = 0.85;
// The point the camera studies: the car's center at rest, lifted as the
// LiDAR and the plate rise.
// exploded y 0.09 -> 0.10 (v5 round two): the LiDAR rises 0.16 at full
// explosion (was 0.14), so the hold pose looks a touch higher.
const TARGET = { rest: [0.03, 0.06, 0], exploded: [0.03, 0.1, 0] } as const;
// Turntable rate (rad/s): slow at rest, slower but never still at the hold
// pose (landing-v4: "the hold pose is this modest explosion, rotating slowly").
const SPIN = { rest: 0.3, hold: 0.16 };

// Dev-only capture hook (landing-v4 section 4): `?carYaw=<degrees>` freezes
// the turntable at that yaw so the LiDAR can be checked at 0/90/180/270.
// `import.meta.env.DEV` is a compile-time constant, so production bundles
// carry none of this.
const DEV_YAW: number | null = (() => {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("carYaw");
  if (raw === null || raw === "") return null;
  const yaw = Number(raw);
  return Number.isFinite(yaw) ? yaw : null;
})();

const VIEW_DIR = (() => {
  const p = MathUtils.degToRad(PITCH_DEG);
  const a = MathUtils.degToRad(AZIMUTH_DEG);
  return [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)] as const;
})();

/** Camera distance that fits `span` meters into FILL of the canvas width. */
function chapterDistance(aspect: number, progress: number) {
  const span = MathUtils.lerp(SPAN.rest, SPAN.exploded, progress);
  // Clamped both ways: a very wide, short canvas (landscape phone) would
  // otherwise pull the camera in until the car cropped top and bottom.
  const halfTan = Math.tan(MathUtils.degToRad(CHAPTER_FOV / 2)) * Math.min(Math.max(aspect, 0.45), 2);
  // Phone canvases have height to spare: let the car use most of the width
  // there (critique: ~45% on 390 with the desktop fill). 0.90, not v3's
  // 0.95: at 0.95 the widest yaw put a tire on the canvas edge (b-car-390).
  const fill = aspect < PHONE_ASPECT ? 0.9 : FILL;
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
    if (import.meta.env.DEV && typeof window !== "undefined") {
      // Dev-only probe for the capture harness (compiled out of production).
      (window as Window & { __rrCar?: unknown }).__rrCar = {
        distance: d,
        explosion: explosionRef.current,
        progress,
        aspect,
        fov: (camera as { fov?: number }).fov,
      };
    }
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
  /** Render the five part callouts inside the canvas (md and up). */
  callouts?: boolean;
  /** How many callouts (in RACECAR_CALLOUTS order) are open; the chapter
   * raises it one by one with the explosion. */
  calloutsShown?: number;
  /** Element the labels render into (same box as the canvas, without R3F's
   * overflow: hidden) so edge labels are not clipped. */
  labelPortal?: RefObject<HTMLElement | null>;
  /** Called once the part geometry has resolved (the chapter's loading
   * label goes away). */
  onReady?: () => void;
};

/** Mounts only after the Suspense boundary around the parts resolves. */
function SceneReady({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

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
    if (DEV_YAW !== null) {
      spin.current.rotation.y = MathUtils.degToRad(DEV_YAW);
      return;
    }
    const progress = Math.min(1, explosionRef.current / CHAPTER_MAX_EXPLOSION);
    spin.current.rotation.y += delta * MathUtils.lerp(SPIN.rest, SPIN.hold, progress);
  });
  return <group ref={spin}>{children}</group>;
}

type CarCalloutsProps = {
  /** Labels 0..shown-1 are visible. */
  shown: number;
  portal?: RefObject<HTMLElement | null>;
  /** False under reduced motion: no transitions, the labels are simply shown. */
  animate: boolean;
};

/**
 * Seven part labels on hairline leaders (landing-v4 section 4), anchored to
 * points on the 3D parts: drei `Html`, projected every frame, no occlusion,
 * no pointer events. Each anchor follows its part's group, so it rides the
 * explosion and the turntable. A label flips to the left of its leader when
 * its anchor sits in the right part of the frame, so the text always runs
 * toward the canvas center and never clips. When neither side holds it on one
 * line (a long label near the middle of the 768 px canvas) it wraps inside the
 * roomier side: it used to run 35 px out of the canvas and touch the step
 * copy in the next column (QA polish-2 item 8).
 */
/** Room a label keeps from the canvas edge, px. */
const LABEL_EDGE = 12;

function CarCallouts({ shown, animate, portal }: CarCalloutsProps) {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const anchors = useRef<(Group | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const labelWidths = useRef<number[]>([]);
  /** Max width applied to each label's text, 0 for none (one line). */
  const labelWraps = useRef<number[]>([]);
  const partObjects = useRef(new Map<string, Object3D>());
  const world = useMemo(() => new Vector3(), []);
  const ndc = useMemo(() => new Vector3(), []);
  const partById = useMemo(() => new Map(RACECAR_PARTS.map((part) => [part.id, part])), []);

  useFrame(() => {
    let moved = false;
    RACECAR_CALLOUTS.forEach((callout, i) => {
      const anchor = anchors.current[i];
      const part = partById.get(callout.part);
      if (!anchor || !part) return;
      let object = partObjects.current.get(callout.part);
      if (!object || !object.parent) {
        object = scene.getObjectByName(callout.part) ?? undefined;
        if (!object) return;
        partObjects.current.set(callout.part, object);
      }
      // The anchor is given in the car frame at rest; the part group's origin
      // is `part.position` in that frame, so subtract it to get mesh-local.
      world.set(
        callout.anchor[0] - part.position[0],
        callout.anchor[1] - part.position[1],
        callout.anchor[2] - part.position[2],
      );
      object.updateWorldMatrix(true, false);
      object.localToWorld(world);
      if (anchor.position.distanceToSquared(world) > 1e-10) {
        anchor.position.copy(world);
        anchor.updateMatrixWorld();
        moved = true;
      }
      const label = labels.current[i];
      const text = label?.querySelector<HTMLElement>("[data-callout-text]");
      if (label && text) {
        // Run the text toward the canvas center whenever it would not fit on
        // the anchor's right; the one-line width is measured once per element.
        let width = labelWidths.current[i] ?? 0;
        if (!width) {
          width = text.offsetWidth;
          labelWidths.current[i] = width;
        }
        ndc.copy(world).project(camera);
        const screenX = ((ndc.x + 1) / 2) * size.width;
        const roomRight = size.width - screenX - LABEL_EDGE;
        const roomLeft = screenX - LABEL_EDGE;
        const fitsRight = width <= roomRight;
        const fitsLeft = width <= roomLeft;
        label.dataset.flip = !fitsRight && (fitsLeft || roomLeft > roomRight) ? "true" : "false";
        const wrap = fitsRight || fitsLeft ? 0 : Math.max(0, Math.floor(Math.max(roomLeft, roomRight)));
        if ((labelWraps.current[i] ?? 0) !== wrap) {
          labelWraps.current[i] = wrap;
          // max-content under a cap: the label box has no width of its own
          // (the anchor is 0x0), so a plain max-width would collapse the
          // text to its longest word.
          text.style.width = wrap ? "max-content" : "";
          text.style.maxWidth = wrap ? `${wrap}px` : "";
          text.style.whiteSpace = wrap ? "normal" : "";
        }
      }
    });
    // Demand-mode canvases (reduced motion) need one more frame for the
    // labels to settle on their anchors.
    if (moved) invalidate();
  });

  return (
    <>
      {RACECAR_CALLOUTS.map((callout, i) => (
        <group
          key={callout.id}
          ref={(el) => {
            anchors.current[i] = el;
          }}
        >
          <Html
            zIndexRange={[10, 0]}
            pointerEvents="none"
            wrapperClass="pointer-events-none"
            portal={portal as React.RefObject<HTMLElement> | undefined}
          >
            <div
              ref={(el) => {
                labels.current[i] = el;
              }}
              data-flip="false"
              className={`group relative h-0 w-0 ${animate ? "transition-opacity duration-[var(--duration-base)]" : ""} ${
                i < shown ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-on-ink/80"
              />
              <span
                aria-hidden="true"
                className={`absolute left-0 w-px bg-text-on-ink/35 ${
                  callout.side === "above" ? "bottom-0" : "top-0"
                }`}
                style={{ height: callout.reach }}
              />
              <span
                data-callout-text=""
                className={`absolute left-0 flex items-center gap-2 whitespace-nowrap font-mono text-eyebrow uppercase text-text-on-ink/80 group-data-[flip=true]:left-auto group-data-[flip=true]:right-0 group-data-[flip=true]:flex-row-reverse group-data-[flip=true]:text-right ${
                  // Center the text line on the leader's far end.
                  callout.side === "above" ? "translate-y-1/2" : "-translate-y-1/2"
                }`}
                style={callout.side === "above" ? { bottom: callout.reach } : { top: callout.reach }}
              >
                <span aria-hidden="true" className="h-px w-3 shrink-0 bg-text-on-ink/35" />
                {callout.label}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

export default function ExplodedModelScene({
  explosionRef,
  staticPose = false,
  active = true,
  callouts = false,
  calloutsShown = 0,
  labelPortal,
  onReady,
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
        {callouts && <CarCallouts shown={calloutsShown} animate={!staticPose} portal={labelPortal} />}
        <SceneReady onReady={onReady} />
        <ContactShadows position={[0, -0.003, 0]} opacity={0.55} scale={2.4} blur={2.4} far={1.2} resolution={512} />
      </Suspense>
    </Canvas>
  );
}
