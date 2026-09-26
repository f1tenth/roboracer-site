import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, useDesktop, DESKTOP_QUERY, MOTION_OK_QUERY, ScrollTrigger } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaHold } from "../../lib/media";
import { RACECAR_CALLOUTS } from "../racecarAssemblyData";

const loadScene = () => import("./ExplodedModelScene");
const ExplodedModelScene = lazy(loadScene);

// Warm the chapter before anyone scrolls to it (Cedric, landing v5: "the CAD
// takes a while to load when we first bring up the page"): once the landing
// stops holding media for the hero's opening clip (MediaHoldContext) and the
// page is idle (or 2.5 s after that at the latest), fetch the three.js chunk,
// which in turn preloads the eleven part files and the studio environment
// map (RacecarAssembly.tsx module scope). An idle main thread alone came too
// early: at 5 Mbit/s the chunk starved the opening clip (docs/media/HERO_PERF.md).
// Skipped on weak devices, which never mount the scene, and below `desktop:`
// (phones): there the 2 MB of three.js, parts and HDR load only as the reader
// nears the chapter (the mount observer below), never at the top of the page.
function warmScene() {
  const run = () => void loadScene().catch(() => {});
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 2500 });
  else window.setTimeout(run, 2500);
}

// Chapter-scoped explosion ceiling (Cedric, 2026-08-21): half the viewer's
// offsets so parts stay close; /assembly keeps its full 0-1 range. The
// offsets themselves were cut in landing-v4 (racecarAssemblyData.ts).
export const CHAPTER_MAX_EXPLOSION = 0.5;
// Outward-and-hold (landing-v2 spec): explosion reaches the ceiling at 55% of
// the pin, then HOLDS exploded to the end. No reassembly. The pin is 220vh
// (v4: 140vh, hold point 0.65; the `desktop:min-h-[220vh]` class below), so
// the finished explosion stays on screen for a further ~54vh of scroll
// (Cedric, landing v5: "once the explosion is done it should force us to
// scroll a little more"). Below `desktop:` nothing pins: the same schedule
// runs as the canvas passes through the window (COMPACT_START/END).
const EXPLODED_AT = 0.55;
/** Compact pass-through scrub: from the canvas top at 80% of the window to
 * its bottom at 20% (docs/mobile/PLAN.md R-1). */
const COMPACT_START = "top 80%";
const COMPACT_END = "bottom 20%";
// The studio photo hands off to the 3D model over the first 15% of the pin.
const PHOTO_FADE_END = 0.15;
// Callouts open one by one as the car explodes: the k-th of N is shown once
// the pin passes k/N of the explosion window, the first within the first
// scroll step (Cedric, landing v5: "the tags should open progressively the
// second we start scrolling, not once the explosion is done"). They stay up
// for the rest of the chapter; scrubbing back closes them in reverse.
const CALLOUT_COUNT = RACECAR_CALLOUTS.length;
const calloutsShownAt = (progress: number) =>
  progress <= 0.005 ? 0 : Math.min(CALLOUT_COUNT, Math.ceil((progress / EXPLODED_AT) * CALLOUT_COUNT));

// Studio photography (Cedric is producing it):
// - full shot overlays the canvas at rest and crossfades out as the pin starts
// - transparent cutout serves the reduced-motion / weak-device static layout
// Neither file exists yet, so both are null: the chapter goes straight to its
// fallback (the 3D render) without requesting a file that 404s on every
// landing load (final QA). Set the path once the file is in public/media/hero/.
const CAR_STUDIO_PHOTO: string | null = null;
const CAR_STUDIO_CUTOUT: string | null = null;

export type CarPhoto = {
  src: string;
  alt: string;
  /** Mono caption under the frame. */
  caption: string;
  /** "Photo: <name>" when known (media skill credit convention). */
  credit?: string;
  /** Frame ratio; the slot is 4/3 unless the image is portrait (landing v5
   * section 6.3: both slots may differ, the column width stays). */
  aspect?: "4/3" | "3/4" | "1/1";
  /** CSS object-position when the subject is off-centre in the frame. */
  position?: string;
};

// Reserved files from the media curator (landing-v3 drift section). Each
// slot hides itself onError until its file lands, never a broken image.
// Default captions; Landing passes the curated captions and credits through
// integration (pass them through the `photos` prop).
const DEFAULT_PHOTOS: readonly CarPhoto[] = [
  {
    src: "/media/car/car-photo-01-1200.webp",
    alt: "The RoboRacer car, close-up",
    caption: "RoboRacer car, photo 01",
  },
  {
    src: "/media/car/car-photo-02-1200.webp",
    alt: "The RoboRacer car, close-up",
    caption: "RoboRacer car, photo 02",
  },
];

// Captions come from the URDF-mirrored part table (racecarAssemblyData.ts);
// no invented specs. TODO(content): final chapter copy from Cedric.
const STATES = [
  {
    caption: "Race-ready",
    body: "Every part sits where the open-source design puts it.",
  },
  {
    caption: "What is inside",
    body: "Eleven parts: chassis, platform deck, LiDAR, Jetson Orin, power board, VESC, steering servo and four wheels.",
  },
  {
    caption: "Build your own",
    body: "The hardware, software and simulator are open source. Take it apart in the 3D viewer.",
  },
] as const;

type PhotoStatus = "loading" | "ok" | "failed";

/** Two 4/3 photo slots beside the canvas; a slot whose file is missing
 * removes itself (onError) so the row never shows a broken image. */
const PHOTO_ASPECT = { "4/3": "aspect-[4/3]", "3/4": "aspect-[3/4]", "1/1": "aspect-square" } as const;

function PhotoRow({ photos }: { photos: readonly CarPhoto[] }) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const live = photos.filter((photo) => !failed.has(photo.src));
  if (live.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-4">
      {live.map((photo) => (
        <li key={photo.src}>
          <figure>
            <img
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className={`${PHOTO_ASPECT[photo.aspect ?? "4/3"]} w-full rounded-media object-cover`}
              style={photo.position ? { objectPosition: photo.position } : undefined}
              onError={() =>
                setFailed((current) => {
                  const next = new Set(current);
                  next.add(photo.src);
                  return next;
                })
              }
            />
            {/* `credit` stays in the data and the manifest; not rendered
                (Cedric, landing v5 round two: no "Photo: ..." anywhere). */}
            <figcaption className="mt-2 font-mono text-eyebrow tracking-normal text-text-on-ink-muted">
              {photo.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/** The part callouts as a plain list (below `desktop:`, where the canvas is
 * too small for labels on leaders). Same copy as the 3D labels. */
function CalloutList() {
  return (
    <ul className="mt-4 flex flex-col gap-1.5 pb-4 desktop:hidden" aria-label="Main parts of the car">
      {RACECAR_CALLOUTS.map((callout) => (
        <li
          key={callout.id}
          className="flex items-center gap-3 font-mono text-eyebrow uppercase text-text-on-ink/80"
        >
          <span aria-hidden="true" className="h-px w-3 shrink-0 bg-text-on-ink/35" />
          {callout.label}
        </li>
      ))}
    </ul>
  );
}

type ExplodedModelProps = {
  /** Photo slots beside the canvas; defaults to the curator's reserved files. */
  photos?: readonly CarPhoto[];
};

/**
 * Landing chapter: the car rests assembled (studio photo over the 3D canvas
 * when available, slow spin underneath), then its parts fly OUTWARD as you
 * scroll the pin and HOLD exploded to the end, still turning slowly. Once the
 * explosion settles, seven part callouts fade in on hairline leaders and stay
 * up while the chapter scrolls past. The pin starts only once the section is
 * fully in view. Reuses the /assembly scene graph; /assembly stays the full
 * viewer.
 * Layout (landing-v3, widened in v5): header above, 8/4 grid in the 1800
 * container, canvas 60svh on desktop; two
 * photo slots under the captions. Below `desktop:` (mobile pass, R-1) nothing
 * pins: canvas at 56svh with the callout list under it, then the captions,
 * the viewer link and the photos, all in normal flow; the parts fly out as
 * the canvas passes through the window. A landscape phone puts the captions
 * beside a 75svh canvas.
 * Reduced motion: static layout preferring the studio cutout, else one
 * assembled 3D frame with the callouts simply visible, captions stacked.
 * Weak devices and no-JS keep the readable caption and callout lists.
 */
export default function ExplodedModel({ photos = DEFAULT_PHOTOS }: ExplodedModelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);
  // The callout labels portal here (the canvas cell, not R3F's overflow-hidden
  // container) so a label at the top or bottom edge is not clipped now that
  // the car fills the cell (landing v5: LiDAR label clipped at yaws 90-180).
  const labelBoxRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef(0);
  const reduced = usePrefersReducedMotion();
  const mdUp = useDesktop();
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(false);
  const [calloutsShown, setCalloutsShown] = useState(0);
  // "Loading the 3D model…" sits in the canvas cell until the scene's parts have
  // resolved (Cedric, v5 round two: show that the model is loading).
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const calloutsShownRef = useRef(0);
  const weakDevice =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) < 4;
  const staticLayout = reduced || weakDevice;
  // No file for this layout counts as a failed load: the fallback, at once.
  const studioSrc = staticLayout ? CAR_STUDIO_CUTOUT : CAR_STUDIO_PHOTO;
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>(studioSrc ? "loading" : "failed");

  // The static and pinned layouts load different files; forget the previous
  // load result when the layout switches (e.g. reduced-motion toggled live).
  useEffect(() => setPhotoStatus(studioSrc ? "loading" : "failed"), [studioSrc]);

  const holdMedia = useMediaHold();
  useEffect(() => {
    if (!holdMedia && !weakDevice && mdUp) warmScene();
  }, [holdMedia, weakDevice, mdUp]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || weakDevice) return;
    // Mount the scene 1200px ahead on desktop (v4: 600), 600px ahead on
    // phones (design system: the chunk lazy-loads behind this observer);
    // render only while on screen: the whole pinned chapter on desktop, the
    // canvas itself on phones, where the captions and photos follow it.
    const mount = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          mount.disconnect();
        }
      },
      { rootMargin: mdUp ? "1200px 0px" : "600px 0px" },
    );
    const visible = new IntersectionObserver((entries) => {
      setActive(entries.some((e) => e.isIntersecting));
    });
    mount.observe(el);
    visible.observe(mdUp ? el : (labelBoxRef.current ?? el));
    return () => {
      mount.disconnect();
      visible.disconnect();
    };
  }, [weakDevice, mdUp]);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK_QUERY, desktop: DESKTOP_QUERY }, (ctx) => {
        const { ok, desktop } = ctx.conditions as { ok: boolean; desktop: boolean };
        if (!ok) return;
        const canvasBox = labelBoxRef.current;
        if (!desktop && !canvasBox) return;
        const captions = desktop ? gsap.utils.toArray<HTMLElement>("[data-em-caption]", wrap) : [];
        // Callouts open progressively with the explosion (calloutsShownAt)
        // and STAY for the rest of the chapter, leaving the screen with it
        // (Cedric, landing v4 review: "the descriptive titles do not stay
        // when you scroll past"). React state changes at most CALLOUT_COUNT
        // times per direction.
        const syncCallouts = (progress: number) => {
          const n = calloutsShownAt(progress);
          if (n === calloutsShownRef.current) return;
          calloutsShownRef.current = n;
          setCalloutsShown(n);
        };
        // Everything this trigger writes by hand (not through the timeline,
        // which the context reverts on its own), set from one progress
        // value. Called on creation, refresh and update: a breakpoint change
        // (resize, rotation) builds a new trigger, and one that starts below
        // the window used to inherit the old one's exploded car, hidden
        // photo and open callouts until the first scroll.
        const syncProgress = (progress: number) => {
          // 0 -> ceiling over the first 55% of the pin, then hold.
          explosionRef.current = CHAPTER_MAX_EXPLOSION * Math.min(progress / EXPLODED_AT, 1);
          // Studio photo hands off to the model over the first 15%.
          const photoOpacity = Math.max(0, 1 - progress / PHOTO_FADE_END);
          for (const el of [photoLayerRef.current, creditRef.current]) {
            if (!el) continue;
            el.style.opacity = String(photoOpacity);
            el.style.visibility = photoOpacity <= 0.001 ? "hidden" : "visible";
          }
          syncCallouts(progress);
        };
        // Desktop: the pin. Compact: a pass-through over the canvas box.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: desktop ? wrap : canvasBox,
            start: desktop ? "top top" : COMPACT_START,
            end: desktop ? "bottom bottom" : COMPACT_END,
            scrub: 0.7,
            onUpdate: (self) => syncProgress(self.progress),
            onRefresh: (self) => syncProgress(self.progress),
          },
        });
        captions.forEach((cap, i) => {
          tl.to(cap, { opacity: 1, duration: 0.3 }, i);
          if (i > 0) tl.to(captions[i - 1], { opacity: 0.62, duration: 0.3 }, i);
        });
        syncProgress(tl.scrollTrigger?.progress ?? 0);
        // Hand the state back at rest (assembled, photo shown, no callouts)
        // for whatever comes next: another breakpoint's trigger, the static
        // layout, or nothing.
        return () => {
          explosionRef.current = 0;
          for (const el of [photoLayerRef.current, creditRef.current]) {
            if (!el) continue;
            el.style.removeProperty("opacity");
            el.style.removeProperty("visibility");
          }
          calloutsShownRef.current = 0;
          setCalloutsShown(0);
        };
      });
      // Webfonts (Manrope/JetBrains Mono) finish after GSAP's load-time
      // refresh and can shift everything above this chapter, leaving the
      // trigger's cached start hundreds of px early (measured 216px on the
      // styleguide). Re-measure once the fonts settle; refresh() is global
      // and safe even if this component is gone by then.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    },
    // Re-run after React has swapped the caption markup for the new layout.
    { scope: wrapRef, dependencies: [mdUp], revertOnUpdate: true },
  );

  const captionList = (stacked: boolean) => (
    <ol className={stacked ? "flex flex-col gap-6" : "flex flex-col gap-6 lg:gap-8"}>
      {STATES.map((s, i) => (
        <li
          key={s.caption}
          data-em-caption={stacked ? undefined : true}
          className="border-t border-text-on-ink/15 pt-4"
          style={stacked ? undefined : { opacity: i === 0 ? 1 : 0.62 }}
        >
          <p className="font-mono text-eyebrow tracking-normal text-text-on-ink">
            {String(i + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 font-display font-semibold text-text-on-ink">{s.caption}</p>
          <p className="mt-1 text-small text-text-on-ink">{s.body}</p>
        </li>
      ))}
    </ol>
  );

  // Touch: a 44px hit area (py-3), the negative margin keeps the rhythm.
  const explore = (
    <Link
      to="/assembly"
      className="inline-block self-start py-1 coarse:-my-2 coarse:py-3 text-small font-semibold text-text-on-ink underline underline-offset-4 decoration-text-on-ink/30 hover:decoration-rr-violet hover:decoration-2"
    >
      Open the 3D viewer
    </Link>
  );

  const header = (
    <header>
      <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
        <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
        <span>02</span>
      </p>
      <h2 className="font-display text-display-m font-semibold text-text-on-ink">The car</h2>
      <p className="mt-3 max-w-[40ch] text-lead text-text-on-ink-muted">One tenth the size, the full problem</p>
    </header>
  );

  const credit = (
    <p ref={creditRef} className="mt-3 font-mono text-eyebrow tracking-normal text-text-on-ink-muted">
      Studio photo · RoboRacer
    </p>
  );

  if (staticLayout) {
    return (
      <div className="mx-auto max-w-page px-6">
        {header}
        <div className="mt-10 grid gap-10 compact:sm:grid-cols-[7fr_5fr] desktop:grid-cols-[8fr_4fr]">
          <div>
            <div className="relative h-[40svh] compact:sm:h-[75svh] desktop:h-[56svh]">
              {photoStatus === "failed" && !weakDevice && (
                <Suspense fallback={null}>
                  <ExplodedModelScene
                    explosionRef={explosionRef}
                    staticPose
                    callouts={mdUp}
                    calloutsShown={CALLOUT_COUNT}
                  />
                </Suspense>
              )}
              {studioSrc && photoStatus !== "failed" && (
                // Nominal dimensions until the asset ships (TODO(content)).
                <img
                  src={studioSrc}
                  alt="The assembled RoboRacer car, studio photo"
                  width={1920}
                  height={1280}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain"
                  onLoad={() => setPhotoStatus("ok")}
                  onError={() => setPhotoStatus("failed")}
                />
              )}
            </div>
            <CalloutList />
            {photoStatus === "ok" && credit}
          </div>
          <div className="flex flex-col gap-8">
            {captionList(true)}
            {explore}
            <PhotoRow photos={photos} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} data-car-chapter="" className="desktop:min-h-[220vh]">
      {/* Desktop pins the whole block under the fixed nav (opaque over this
          ink chapter), so the pinned content starts below the bar. Below
          `desktop:` nothing pins (mobile pass, R-1): the chapter is an
          ordinary section and every part of it scrolls into view in turn. */}
      <div className="py-section desktop:sticky desktop:top-0 desktop:flex desktop:min-h-svh desktop:flex-col desktop:justify-center desktop:pt-[calc(var(--spacing-nav)+1rem)] desktop:pb-6">
        {/* Wide container (1800, as the platform and partner blocks) and an
            8/4 split: the camera fits the car to the canvas width, so the
            wider cell is what makes the car big (Cedric, landing v5: "the
            car model should take way more space ... that section doesn't
            take up enough width"). */}
        <div className="mx-auto w-full max-w-page px-6">
          {header}
          {/* A landscape phone (compact, sm and up) sets the captions beside
              the canvas, so both are on screen together. */}
          <div className="mt-6 flex flex-col gap-8 compact:sm:grid compact:sm:grid-cols-[7fr_5fr] compact:sm:items-start desktop:grid desktop:grid-cols-[8fr_4fr] desktop:items-center desktop:gap-10">
            <div>
              {/* Desktop is 60svh at every width: the old `lg:h-[72svh]`
                  never won over `desktop:h-[60svh]` (the custom variant sorts
                  later), so 60svh is what desktop has always shown. */}
              <div ref={labelBoxRef} className="relative h-[56svh] compact:sm:h-[75svh] desktop:h-[60svh]">
                {inView && (
                  <Suspense fallback={null}>
                    <ExplodedModelScene
                      explosionRef={explosionRef}
                      active={active}
                      callouts={mdUp}
                      calloutsShown={calloutsShown}
                      labelPortal={labelBoxRef}
                      onReady={onSceneReady}
                    />
                  </Suspense>
                )}
                <p
                  role="status"
                  aria-live="polite"
                  className={`pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-small text-text-on-ink-muted transition-opacity duration-[var(--duration-base)] ${
                    sceneReady ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {sceneReady ? "" : "Loading the 3D model…"}
                </p>
                {studioSrc && photoStatus !== "failed" && (
                  <div ref={photoLayerRef} className="pointer-events-none absolute inset-0">
                    {/* Nominal dimensions until the asset ships (TODO(content)). */}
                    <img
                      src={studioSrc}
                      alt="The assembled RoboRacer car, studio photo"
                      width={1920}
                      height={1280}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onLoad={() => setPhotoStatus("ok")}
                      onError={() => setPhotoStatus("failed")}
                    />
                  </div>
                )}
              </div>
              <CalloutList />
              {photoStatus === "ok" && credit}
            </div>
            <div className="flex flex-col gap-6 lg:gap-8">
              {/* Desktop: the captions light one by one with the pin.
                  Compact: all three at full strength, in reading order. */}
              {captionList(!mdUp)}
              {explore}
              <PhotoRow photos={photos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
