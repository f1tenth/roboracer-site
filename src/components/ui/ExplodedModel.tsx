import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, MOTION_OK_QUERY, ScrollTrigger } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const ExplodedModelScene = lazy(() => import("./ExplodedModelScene"));

// Chapter-scoped explosion ceiling (Cedric, 2026-08-21): half the viewer's
// offsets so parts stay close; /assembly keeps its full 0-1 range.
export const CHAPTER_MAX_EXPLOSION = 0.5;
// Outward-and-hold (landing-v2 spec): explosion reaches the ceiling at 65% of
// the pin, then HOLDS exploded to the end. No reassembly.
const EXPLODED_AT = 0.65;
// The studio photo hands off to the 3D model over the first 15% of the pin.
const PHOTO_FADE_END = 0.15;

// Studio photography (Cedric is producing it; files do not exist yet - the
// layers hide themselves onError until the assets land):
// - full shot overlays the canvas at rest and crossfades out as the pin starts
// - transparent cutout serves the reduced-motion / weak-device static layout
const CAR_STUDIO_PHOTO = "/media/hero/car-studio.webp";
const CAR_STUDIO_CUTOUT = "/media/hero/car-studio-cutout.webp";

// Captions come from the URDF-mirrored part table (racecarAssemblyData.ts);
// no invented specs. TODO(content): final chapter copy from Cedric.
const STATES = [
  {
    caption: "Race-ready",
    body: "One car, assembled. Every transform on screen mirrors the open-source URDF.",
  },
  {
    caption: "What is inside",
    body: "Seven parts: the chassis, an accent shell, a top-mounted LiDAR, and four wheels. The rear pair is driven.",
  },
  {
    caption: "Build your own",
    body: "The whole assembly is open source. Pull it apart frame by frame in the interactive viewer.",
  },
] as const;

type PhotoStatus = "loading" | "ok" | "failed";

/**
 * Landing chapter: the car rests assembled (studio photo over the 3D canvas
 * when available, slow spin underneath), then its parts fly OUTWARD as you
 * scroll the pin and HOLD exploded to the end - the spin eases out as the
 * explosion rises. The pin starts only once the section is fully in view.
 * Reuses the /assembly scene graph; /assembly stays the full viewer.
 * Reduced motion: static layout preferring the studio cutout, else one
 * assembled 3D frame, with the captions stacked. Weak devices and no-JS keep
 * the readable caption list.
 */
export default function ExplodedModel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);
  const explosionRef = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>("loading");
  const weakDevice =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) < 4;
  const staticLayout = reduced || weakDevice;

  // The static and pinned layouts load different files; forget the previous
  // load result when the layout switches (e.g. reduced-motion toggled live).
  useEffect(() => setPhotoStatus("loading"), [staticLayout]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || weakDevice) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [weakDevice]);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const captions = gsap.utils.toArray<HTMLElement>("[data-em-caption]", wrap);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              // 0 -> ceiling over the first 65% of the pin, then hold.
              explosionRef.current =
                CHAPTER_MAX_EXPLOSION * Math.min(self.progress / EXPLODED_AT, 1);
              // Studio photo hands off to the model over the first 15%.
              const photoOpacity = Math.max(0, 1 - self.progress / PHOTO_FADE_END);
              for (const el of [photoLayerRef.current, creditRef.current]) {
                if (!el) continue;
                el.style.opacity = String(photoOpacity);
                el.style.visibility = photoOpacity <= 0.001 ? "hidden" : "visible";
              }
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
    <ol className={stacked ? "flex flex-col gap-6" : "flex flex-col gap-8"}>
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
      className="mt-8 inline-block py-1 text-small font-semibold text-text-on-ink underline underline-offset-4 decoration-text-on-ink/30 hover:decoration-rr-violet hover:decoration-2"
    >
      Explore the car in the interactive viewer
    </Link>
  );

  const header = (
    <header>
      <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
        <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
        <span>03</span>
        <span aria-hidden="true">/</span>
        <span>The car</span>
      </p>
      <h2 className="font-display text-display-l font-semibold text-text-on-ink">
        One tenth the size, the full problem
      </h2>
    </header>
  );

  const credit = (
    <p ref={creditRef} className="mt-3 font-mono text-eyebrow tracking-normal text-text-on-ink-muted">
      Studio photo · RoboRacer
    </p>
  );

  if (staticLayout) {
    return (
      <div className="mx-auto max-w-content px-6">
        {header}
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_20rem]">
          <div>
            <div className="relative min-h-[40svh]">
              {photoStatus === "failed" && !weakDevice && (
                <Suspense fallback={null}>
                  <ExplodedModelScene explosionRef={explosionRef} staticPose />
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
            {photoStatus === "ok" && credit}
          </div>
          <div>
            {captionList(true)}
            {explore}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ minHeight: "140vh" }}>
      <div className="sticky top-0 flex min-h-svh flex-col justify-center py-12">
        <div className="mx-auto w-full max-w-content px-6">
          {header}
          <div className="mt-6 grid items-center gap-10 md:grid-cols-[1fr_20rem]">
            <div>
              <div className="relative h-[55svh]">
                {inView && (
                  <Suspense fallback={null}>
                    <ExplodedModelScene explosionRef={explosionRef} />
                  </Suspense>
                )}
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
              {photoStatus === "ok" && credit}
            </div>
            <div>
              {captionList(false)}
              {explore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
