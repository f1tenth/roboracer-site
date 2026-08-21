import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, MOTION_OK_QUERY } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const ExplodedModelScene = lazy(() => import("./ExplodedModelScene"));

// Chapter-scoped explosion ceiling (Cedric, 2026-08-21): half the viewer's
// offsets so parts start closer; /assembly keeps its full 0-1 range.
export const CHAPTER_MAX_EXPLOSION = 0.5;
// The car must be fully assembled by 70% of the pin so the closing rotation
// has scroll room to read.
const ASSEMBLED_AT = 0.7;

// Captions come from the URDF-mirrored part table (racecarAssemblyData.ts);
// no invented specs. TODO(content): final chapter copy from Cedric.
const STATES = [
  {
    caption: "Seven parts",
    body: "Chassis, accent shell, LiDAR, and four wheels - the assembly mirrors the open-source URDF exactly.",
  },
  {
    caption: "Sense and drive",
    body: "A top-mounted laser scanner reads the track; the driven rear wheels put the power down.",
  },
  {
    caption: "Race-ready",
    body: "One tenth the size, the full autonomy problem. Build it, then race it.",
  },
] as const;

/**
 * Landing chapter: the car's parts fly inward and assemble as you scroll
 * (implode, explosion 1 -> 0), then the assembled car slowly rotates.
 * Reuses the /assembly scene graph; /assembly stays the full viewer.
 * Reduced motion: static assembled render with the captions stacked.
 * Weak devices and no-JS keep the readable caption list.
 */
export default function ExplodedModel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef(CHAPTER_MAX_EXPLOSION);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const weakDevice =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) < 4;

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
            scrub: 0.6,
            onUpdate: (self) => {
              const assembly = Math.min(self.progress / ASSEMBLED_AT, 1);
              explosionRef.current = CHAPTER_MAX_EXPLOSION * (1 - assembly);
            },
          },
        });
        captions.forEach((cap, i) => {
          tl.to(cap, { opacity: 1, duration: 0.3 }, i);
          if (i > 0) tl.to(captions[i - 1], { opacity: 0.62, duration: 0.3 }, i);
        });
      });
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
      className="mt-8 inline-block text-small font-semibold text-text-on-ink underline underline-offset-4 decoration-rr-magenta hover:decoration-2"
    >
      Explore the car in the interactive viewer
    </Link>
  );

  const header = (
    <header>
      <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
        <span aria-hidden="true" className="h-1 w-1 bg-rr-magenta" />
        <span>03</span>
        <span aria-hidden="true">/</span>
        <span>The car</span>
      </p>
      <h2 className="font-display text-display-l font-semibold text-text-on-ink">
        One tenth the size, the full problem
      </h2>
    </header>
  );

  if (reduced || weakDevice) {
    return (
      <div className="mx-auto max-w-content px-6">
        {header}
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_20rem]">
          <div className="min-h-[40svh]">
            {!weakDevice && (
              <Suspense fallback={null}>
                <ExplodedModelScene explosionRef={explosionRef} staticPose />
              </Suspense>
            )}
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
    <div ref={wrapRef} style={{ minHeight: "120vh" }}>
      <div className="sticky top-0 flex min-h-svh flex-col justify-center py-12">
        <div className="mx-auto w-full max-w-content px-6">
          {header}
          <div className="mt-6 grid items-center gap-10 md:grid-cols-[1fr_20rem]">
            <div className="h-[55svh]">
              {inView && (
                <Suspense fallback={null}>
                  <ExplodedModelScene explosionRef={explosionRef} />
                </Suspense>
              )}
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
