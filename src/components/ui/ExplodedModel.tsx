import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, DESKTOP_QUERY, MOTION_OK_QUERY, ScrollTrigger } from "../../lib/motion";
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
// Skipped on weak devices, which never mount the scene.
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
// (v4: 140vh, hold point 0.65), so the finished explosion stays on screen for
// a further ~54vh of scroll (Cedric, landing v5: "once the explosion is done
// it should force us to scroll a little more").
const EXPLODED_AT = 0.55;
const PIN_HEIGHT = "220vh";
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

// Studio photography (Cedric is producing it; files do not exist yet - the
// layers hide themselves onError until the assets land):
// - full shot overlays the canvas at rest and crossfades out as the pin starts
// - transparent cutout serves the reduced-motion / weak-device static layout
const CAR_STUDIO_PHOTO = "/media/hero/car-studio.webp";
const CAR_STUDIO_CUTOUT = "/media/hero/car-studio-cutout.webp";

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
    body: "One car, assembled. Chassis, plate, LiDAR and wheels sit where the open-source URDF puts them.",
  },
  {
    caption: "What is inside",
    body: "Eleven parts: the chassis, the accent plate, the LiDAR, the Jetson Orin, the power board, the VESC, the steering servo, and four wheels.",
  },
  {
    caption: "Build your own",
    body: "The whole assembly is open source. Pull it apart frame by frame in the interactive viewer.",
  },
] as const;

type PhotoStatus = "loading" | "ok" | "failed";

// Tailwind `md`: at and above it the callouts live inside the canvas; below
// it they are a list under the canvas (landing-v4 section 4).
const MD_QUERY = DESKTOP_QUERY;

function subscribeMd(onChange: () => void) {
  const mql = window.matchMedia(MD_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getMdSnapshot() {
  return window.matchMedia(MD_QUERY).matches;
}

function useMdUp(): boolean {
  return useSyncExternalStore(subscribeMd, getMdSnapshot, () => true);
}

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

/** The five part callouts as a plain list (below `md`, and for anyone who
 * cannot see the canvas). Same copy as the 3D labels. */
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
 * container, canvas 72svh on desktop so the car owns the viewport; two
 * photo slots under the captions. Mobile:
 * canvas first at 56svh with the callout list under it, captions below,
 * photos revealed as the pin ends.
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
  const mdUp = useMdUp();
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(false);
  const [calloutsShown, setCalloutsShown] = useState(0);
  // "Loading CAD model…" sits in the canvas cell until the scene's parts have
  // resolved (Cedric, v5 round two: show that the model is loading).
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const calloutsShownRef = useRef(0);
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>("loading");
  const weakDevice =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) < 4;
  const staticLayout = reduced || weakDevice;

  // The static and pinned layouts load different files; forget the previous
  // load result when the layout switches (e.g. reduced-motion toggled live).
  useEffect(() => setPhotoStatus("loading"), [staticLayout]);

  const holdMedia = useMediaHold();
  useEffect(() => {
    if (!holdMedia && !weakDevice) warmScene();
  }, [holdMedia, weakDevice]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || weakDevice) return;
    // Mount the scene 1200px ahead (v4: 600); render only while on screen.
    const mount = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          mount.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    const visible = new IntersectionObserver((entries) => {
      setActive(entries.some((e) => e.isIntersecting));
    });
    mount.observe(el);
    visible.observe(el);
    return () => {
      mount.disconnect();
      visible.disconnect();
    };
  }, [weakDevice]);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const captions = gsap.utils.toArray<HTMLElement>("[data-em-caption]", wrap);
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
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              // 0 -> ceiling over the first 55% of the pin, then hold.
              explosionRef.current =
                CHAPTER_MAX_EXPLOSION * Math.min(self.progress / EXPLODED_AT, 1);
              // Studio photo hands off to the model over the first 15%.
              const photoOpacity = Math.max(0, 1 - self.progress / PHOTO_FADE_END);
              for (const el of [photoLayerRef.current, creditRef.current]) {
                if (!el) continue;
                el.style.opacity = String(photoOpacity);
                el.style.visibility = photoOpacity <= 0.001 ? "hidden" : "visible";
              }
              syncCallouts(self.progress);
            },
          },
        });
        captions.forEach((cap, i) => {
          tl.to(cap, { opacity: 1, duration: 0.3 }, i);
          if (i > 0) tl.to(captions[i - 1], { opacity: 0.62, duration: 0.3 }, i);
        });
      });
      // Webfonts (Manrope/JetBrains Mono) finish after GSAP's load-time
      // refresh and can shift everything above this chapter, leaving the
      // trigger's cached start hundreds of px early (measured 216px on the
      // styleguide). Re-measure once the fonts settle; refresh() is global
      // and safe even if this component is gone by then.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    },
    { scope: wrapRef },
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

  const explore = (
    <Link
      to="/assembly"
      className="inline-block self-start py-1 text-small font-semibold text-text-on-ink underline underline-offset-4 decoration-text-on-ink/30 hover:decoration-rr-violet hover:decoration-2"
    >
      Explore the car in the interactive viewer
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
        <div className="mt-10 grid gap-10 md:grid-cols-[8fr_4fr]">
          <div>
            <div className="relative h-[40svh] md:h-[56svh]">
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
              {photoStatus !== "failed" && (
                // Nominal dimensions until the asset ships (TODO(content)).
                <img
                  src={CAR_STUDIO_CUTOUT}
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
    <div ref={wrapRef} style={{ minHeight: PIN_HEIGHT }}>
      {/* The fixed nav (68px mobile / 85px desktop) is opaque over this ink
          chapter, so the pinned content starts below it. Desktop pins the
          whole block; on mobile the block is taller than the viewport, so
          only the canvas cell pins (sticky inside the flex column) and the
          captions and photos scroll beneath it. */}
      <div className="pb-6 pt-[calc(4.25rem+1rem)] desktop:sticky desktop:top-0 desktop:flex desktop:min-h-svh desktop:flex-col desktop:justify-center desktop:pt-[calc(5.3125rem+1rem)]">
        {/* Wide container (1800, as the platform and partner blocks) and an
            8/4 split: the camera fits the car to the canvas width, so the
            wider cell is what makes the car big (Cedric, landing v5: "the
            car model should take way more space ... that section doesn't
            take up enough width"). */}
        <div className="mx-auto w-full max-w-page px-6">
          {header}
          <div className="mt-6 flex flex-col gap-8 desktop:grid desktop:grid-cols-[8fr_4fr] desktop:items-center desktop:gap-10">
            <div className="sticky top-[4.25rem] z-10 bg-ink-950 desktop:static desktop:bg-transparent">
              <div ref={labelBoxRef} className="relative h-[56svh] desktop:h-[60svh] lg:h-[72svh]">
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
                  {sceneReady ? "" : "Loading CAD model…"}
                </p>
                {photoStatus !== "failed" && (
                  <div ref={photoLayerRef} className="pointer-events-none absolute inset-0">
                    {/* Nominal dimensions until the asset ships (TODO(content)). */}
                    <img
                      src={CAR_STUDIO_PHOTO}
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
              {captionList(false)}
              {explore}
              <PhotoRow photos={photos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
