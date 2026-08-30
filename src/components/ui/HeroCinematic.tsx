import { Fragment, useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE_IN_OUT_QUART, MOTION_OK_QUERY, ScrollTrigger, gsap, useGSAP } from "../../lib/motion";
import { FrameCanvas, FrameLoader, frameAt, type FrameSet } from "../../lib/frameSequence";

export type HeroPoster = {
  /** Frame 1 of the desktop set (served from 768px up) and of the mobile set. */
  desktop: string;
  mobile: string;
  alt: string;
};

export type HeroBeats = readonly [number, number, number];

type HeroCinematicProps = {
  frames: { desktop: FrameSet; mobile: FrameSet };
  poster: HeroPoster;
  /** Authored lines. Line 1 animates as ONE unit in the logo gradient; every
   * later line assembles word by word in white. */
  lines: string[];
  /** One sentence on what RoboRacer is, under the headline. */
  description?: string;
  /** Pin progress at which each headline line starts to land: A when the lead
   * car fills its third of the frame, B at the overtake, C when both settle.
   * Read off the take's contact sheet. */
  beats?: HeroBeats;
  /** Cover-fit anchor (0..1) for the frames and the poster, so the cars stay
   * in frame on portrait phones. */
  focusX?: number;
  /** Mono tag bottom-left from p 0.05; null hides it (Cedric's call). */
  caption?: string | null;
  /** h1 on the landing (the page's one h1); h2 on /styleguide. */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Scroll schedule in pin progress p (0 = the chapter top reaches the viewport
 * top, 1 = the 400vh wrapper releases), docs/plans/hero-cinematic-v1.md
 * section 7:
 *
 *   p 0.00-0.05  frame 1 (the locked composition), the film has not started
 *   p 0.05-0.80  frames 1..N, linear in p (SCRUB_START..SCRUB_END), scrub 0.8
 *   beats        each headline line starts to land at its beat and stands
 *                0.10 later (yPercent 110 -> 0 + opacity, in-out quart; line
 *                1 as one unit, later lines word by word inside that window)
 *   pA-0.06..pC  block scale 1 -> 1.30 (1.12 narrow), power1.inOut
 *   pA-0.05..pC  footage brightness 1 -> 0.42, saturate 1 -> 0.8, so the
 *                first words land on footage that still reads as footage
 *   pC+0.02      description fades in, no movement
 *   p 0.80-1.00  hold on the last frame, full text, no transforms
 *   p 0.80-0.97  nav fill (data-nav-fill, read by NavBar)
 *
 * Scroll-out q (0 = the pin releases, 1 = the chapter's bottom reaches the
 * viewport top), copied from HeroChapter: the block fades as one over q
 * 0.22-0.62 (power2.inOut), the footage goes 0.42 -> 0.12 over q 0-0.6 while
 * the Highlights strip slides over the hero.
 */
const SCHEDULE = {
  scrubStart: 0.05,
  scrubEnd: 0.8,
  scrub: 0.8,
  beats: [0.3, 0.52, 0.7] as HeroBeats,
  /** Each line lands over this much of p; words inside a line stagger within it. */
  lineDuration: 0.1,
  wordDuration: 0.07,
  yPercent: 110,
  zoom: { lead: 0.06, wide: 1.3, narrow: 1.12 },
  dim: { lead: 0.05, brightness: 0.42, saturate: 0.8 },
  description: { delay: 0.02, duration: 0.08 },
  caption: { duration: 0.03 },
  fade: { start: 0.22, end: 0.62, ease: "power2.inOut" },
  exit: { start: 0, end: 0.6, brightness: 0.12 },
  nav: { fillStart: 0.8, fillEnd: 0.97 },
  navStatic: { fillStart: 0.1, fillEnd: 0.6 },
  /** Poster push-in while the frames load (seconds, scale). */
  posterPushIn: { seconds: 12, scale: 1.06 },
} as const;

/** Pin length: three viewport heights of film plus the hold. */
const HEIGHT_CLASS = "h-[400vh]";

const WIDE_QUERY = "(min-width: 768px)";

/** Idle glide: once the coarse frame set is in and the visitor is still at the
 * top GLIDE_DELAY_S later, the page glides once to GLIDE_TARGET_P (past beat
 * B) at 24 film frames a second or better; any input cancels it. */
const GLIDE_DELAY_S = 2;
const GLIDE_TARGET_P = 0.55;
const GLIDE_MIN_FPS = 24;

const DEFAULT_CAPTION = "rendered from ICRA 2026 photographs";

const navFill = (r: { fillStart: number; fillEnd: number }) => `${r.fillStart} ${r.fillEnd}`;

const layerFilter = (brightness: number, saturate: number) => `brightness(${brightness}) saturate(${saturate})`;

/** Smooth scroll to `top` over `ms` (power2.inOut) with a rAF tween; returns
 * the cancel function (copied from HeroChapter, which stays untouched). */
function glideTo(top: number, ms: number): () => void {
  const from = window.scrollY;
  const start = performance.now();
  let raf = 0;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(ev, cancel);
  };
  for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(ev, cancel, { passive: true });
  const step = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / ms);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    window.scrollTo(0, from + (top - from) * e);
    if (t < 1) raf = requestAnimationFrame(step);
    else cancel();
  };
  raf = requestAnimationFrame(step);
  return cancel;
}

/** Weak device rule from landing-v3: under four logical cores, no pin. */
function isWeakDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  return typeof cores === "number" && cores > 0 && cores < 4;
}

const DISPLAY_TYPE =
  "block text-center font-display text-[8.5vw] font-semibold leading-[0.95] tracking-[-0.03em] md:text-[7.4vw] lg:text-[clamp(2rem,8.5vw,8.5rem)]";

declare global {
  interface Window {
    /** Dev-only handle for the QA script (frame timing, painted vs skipped). */
    __heroCine?: { loader: FrameLoader; drawer: FrameCanvas; proxy: { f: number }; set: FrameSet };
  }
}

/**
 * The landing's first 400vh as a scroll-scrubbed film: the poster (frame 1)
 * under the transparent nav, the frames drawn on a canvas as the wheel moves,
 * the headline landing on three beats of the footage while it zooms, a hold
 * on the last frame, then the same fade-in-place scroll-out as HeroChapter
 * before the paper Highlights strip slides over. CSS sticky does the pinning;
 * one scrubbed GSAP timeline does everything else. Nothing plays on its own,
 * so there is no pause control.
 *
 * Loading: the poster is the LCP element; the frame set streams after the
 * window `load` event (every 6th frame first), the canvas fades in over the
 * poster when the coarse pass is complete, and the drawer always paints the
 * nearest loaded frame, so nothing in the scroll path waits on the network.
 *
 * Reduced motion, weak devices (hardwareConcurrency < 4): no pin, no canvas,
 * no frames fetched; the poster at 100svh, then the static headline on paper.
 *
 * Accessibility: one heading (`as`) carrying the full sentence in aria-label;
 * the animated spans and the canvas are aria-hidden; the poster carries alt.
 */
export default function HeroCinematic({
  frames,
  poster,
  lines,
  description,
  beats = SCHEDULE.beats,
  focusX = 0.5,
  caption = DEFAULT_CAPTION,
  as = "h1",
  className = "",
}: HeroCinematicProps) {
  const reduced = usePrefersReducedMotion();
  const [weak] = useState(isWeakDevice);
  const isStatic = reduced || weak;
  const scope = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headingId = useId();
  const Tag = as;
  const sentence = lines.join(" ");
  const beatsKey = beats.join(",");
  // Idle cue: "idle" until the 10 s timer fires; any scroll before that
  // cancels it forever; the first scroll after it shows hides it for good.
  const [cue, setCue] = useState<"idle" | "visible" | "hidden">("idle");

  useEffect(() => {
    if (isStatic) return;
    const timer = window.setTimeout(() => {
      setCue((s) => (s === "idle" ? "visible" : s));
    }, 10_000);
    const onScroll = () => {
      window.clearTimeout(timer);
      setCue("hidden");
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isStatic]);

  // The chapter's height is fixed (400vh), but the sticky box and the canvas
  // mount after the route chunk: recompute the trigger starts once.
  useEffect(() => {
    if (isStatic) return;
    ScrollTrigger.refresh();
  }, [isStatic]);

  useGSAP(
    () => {
      if (isStatic) return;
      const root = scope.current;
      const layer = layerRef.current;
      const canvasEl = canvasRef.current;
      if (!root || !layer || !canvasEl) return;
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK_QUERY, wide: WIDE_QUERY }, (ctx) => {
        const { ok, wide } = ctx.conditions as { ok: boolean; wide: boolean };
        if (!ok) return;
        const block = root.querySelector<HTMLElement>(".rr-hero-block");
        const desc = root.querySelector<HTMLElement>(".rr-hero-desc");
        const cap = root.querySelector<HTMLElement>(".rr-hero-caption");
        const lineEls = Array.from(root.querySelectorAll<HTMLElement>(".rr-hero-line"));
        const units = Array.from(root.querySelectorAll<HTMLElement>(".rr-hero-unit"));
        if (!block || units.length === 0) return;

        const S = SCHEDULE;
        const set = wide ? frames.desktop : frames.mobile;
        const zoom = wide ? S.zoom.wide : S.zoom.narrow;
        const [pA, , pC] = beats;
        const animated = [layer, block, ...(desc ? [desc] : []), ...units];

        // Frame engine: the drawer paints the nearest loaded frame; the loader
        // starts after `load` so the poster (LCP) and the page's own assets
        // come first.
        const proxy = { f: 0 };
        const drawer = new FrameCanvas(canvasEl);
        drawer.focusX = focusX;
        const paint = () => drawer.draw(loader.nearest(proxy.f));
        let glideTimer = 0;
        let glideDone = false;
        let cancelGlide: (() => void) | null = null;
        const scheduleGlide = () => {
          if (glideDone) return;
          window.clearTimeout(glideTimer);
          glideTimer = window.setTimeout(() => {
            if (glideDone || window.scrollY > 8) return;
            glideDone = true;
            const covered = frameAt(GLIDE_TARGET_P, S.scrubStart, S.scrubEnd, set.count) - frameAt(0, S.scrubStart, S.scrubEnd, set.count);
            const ms = Math.max(1500, (covered / GLIDE_MIN_FPS) * 1000);
            const target = root.getBoundingClientRect().top + window.scrollY + GLIDE_TARGET_P * (root.offsetHeight - window.innerHeight);
            cancelGlide = glideTo(target, ms);
          }, GLIDE_DELAY_S * 1000);
        };
        const loader = new FrameLoader(set, {
          stride: 6,
          concurrency: 6,
          // Repaint when a frame near the cursor arrives (the coarse pass may
          // have drawn a neighbour first).
          onFrame: (i) => {
            if (Math.abs(i - proxy.f) < 3) paint();
          },
          onPhase: (ph) => {
            if (ph !== "fine") return;
            // Coarse pass complete: the canvas takes over from the poster.
            paint();
            canvasEl.style.opacity = "1";
            canvasEl.dataset.ready = "true";
            scheduleGlide();
          },
        });
        if (import.meta.env.DEV) window.__heroCine = { loader, drawer, proxy, set };
        const ro = new ResizeObserver(() => drawer.resize());
        ro.observe(canvasEl);
        const kick = () => void loader.start();
        if (document.readyState === "complete") kick();
        else window.addEventListener("load", kick, { once: true });

        // Poster push-in while the frames load: time-based, on the whole
        // footage layer so the canvas inherits it and there is no jump when
        // it fades in over the poster.
        const pushIn = gsap.fromTo(
          layer,
          { scale: 1 },
          { scale: S.posterPushIn.scale, duration: S.posterPushIn.seconds, ease: "none" },
        );

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: S.scrub,
            invalidateOnRefresh: true,
            // will-change only while the chapter is actually pinned.
            onToggle: (self) => {
              gsap.set(animated, { willChange: self.isActive ? "transform" : "auto" });
            },
            onRefresh: paint,
          },
        });

        // A full-length proxy tween pins the timeline's duration to 1 so the
        // schedule numbers are pin progress whatever the last tween's end.
        tl.to({ t: 0 }, { t: 1, duration: 1 }, 0);

        // The film: the proxy frame index runs 0..N-1 over the scrub window;
        // every update paints the nearest loaded frame (never a fetch).
        tl.to(
          proxy,
          { f: set.count - 1, duration: S.scrubEnd - S.scrubStart, onUpdate: paint },
          S.scrubStart,
        );

        // Footage dims and desaturates from just before the first words to
        // the last beat. The near-black exit ramp lives on the scroll-out
        // timeline below.
        tl.fromTo(
          layer,
          { filter: layerFilter(1, 1) },
          { filter: layerFilter(S.dim.brightness, S.dim.saturate), duration: pC - (pA - S.dim.lead) },
          pA - S.dim.lead,
        );

        // Headline: each line lands on its beat. Line 1 is one unit; later
        // lines stagger their words so the last one stands lineDuration after
        // the beat.
        lineEls.forEach((lineEl, li) => {
          const lineUnits = Array.from(lineEl.querySelectorAll<HTMLElement>(".rr-hero-unit"));
          const beat = beats[Math.min(li, beats.length - 1)];
          const n = lineUnits.length;
          const dur = n > 1 ? S.wordDuration : S.lineDuration;
          const stagger = n > 1 ? (S.lineDuration - S.wordDuration) / (n - 1) : 0;
          lineUnits.forEach((el, i) => {
            tl.fromTo(
              el,
              { yPercent: S.yPercent, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: dur, ease: EASE_IN_OUT_QUART },
              beat + i * stagger,
            );
          });
        });

        // Description: fades in after the last line has landed (no movement).
        if (desc) {
          tl.fromTo(
            desc,
            { opacity: 0 },
            { opacity: 1, duration: S.description.duration, ease: "none" },
            pC + S.description.delay,
          );
        }

        // Caption: visible from the moment the film starts.
        if (cap) {
          tl.fromTo(cap, { opacity: 0 }, { opacity: 1, duration: S.caption.duration, ease: "none" }, S.scrubStart);
        }

        // Zoom: from just before the first beat to the last, so the block is
        // at its largest as the last line lands; nothing moves during the hold.
        tl.fromTo(
          block,
          { scale: 1 },
          { scale: zoom, duration: pC - (pA - S.zoom.lead), ease: "power1.inOut" },
          pA - S.zoom.lead,
        );

        // Scroll-out: copied from HeroChapter. The words fade as one, in
        // place, while the footage goes near-black under them and the hero
        // rides up under the Highlights strip.
        const out = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "bottom bottom",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        out
          .to({ t: 0 }, { t: 1, duration: 1 }, 0)
          .fromTo(
            desc ?? block,
            { opacity: 1 },
            { opacity: 0, duration: S.fade.end - S.fade.start, ease: S.fade.ease, immediateRender: false },
            S.fade.start,
          )
          .fromTo(
            block,
            { opacity: 1 },
            { opacity: 0, duration: S.fade.end - S.fade.start, ease: S.fade.ease, immediateRender: false },
            S.fade.start,
          )
          .to(
            layer,
            { filter: layerFilter(S.exit.brightness, S.dim.saturate), duration: S.exit.end - S.exit.start },
            S.exit.start,
          );

        return () => {
          window.clearTimeout(glideTimer);
          cancelGlide?.();
          window.removeEventListener("load", kick);
          loader.abort();
          ro.disconnect();
          drawer.destroy();
          pushIn.kill();
          canvasEl.style.opacity = "0";
          delete canvasEl.dataset.ready;
          if (import.meta.env.DEV && window.__heroCine?.loader === loader) delete window.__heroCine;
        };
      });
    },
    { scope, dependencies: [isStatic, sentence, frames.desktop.base, frames.mobile.base, beatsKey, focusX], revertOnUpdate: true },
  );

  const headline = (onInk: boolean) => (
    <Tag id={headingId} aria-label={sentence} className="block">
      {/* Display type lives on the span, not the heading element, so the
          legacy h1/h2 rules in index.css never interfere. */}
      <span
        aria-hidden="true"
        className={`rr-hero-block ${DISPLAY_TYPE} ${onInk ? "text-text-on-ink" : "text-text-strong"}`}
      >
        {lines.map((line, li) => (
          <span key={line} className="rr-hero-line block whitespace-nowrap">
            {li === 0 && onInk ? (
              // One unit, so background-clip: text is never split across
              // per-word compositing layers. Vertical padding keeps the
              // gradient box over ascenders and descenders; the negative
              // margin gives the space back to the line box.
              <span className="rr-hero-unit text-gradient-logo -my-[0.15em] inline-block py-[0.15em]">{line}</span>
            ) : onInk ? (
              line.split(" ").map((word, wi) => (
                <Fragment key={`${word}-${wi}`}>
                  {wi > 0 && " "}
                  <span className="rr-hero-unit inline-block">{word}</span>
                </Fragment>
              ))
            ) : (
              line
            )}
          </span>
        ))}
      </span>
    </Tag>
  );

  const posterImg = (priority: boolean) => (
    <picture>
      <source media={WIDE_QUERY} srcSet={poster.desktop} type="image/webp" />
      <img
        src={poster.mobile}
        alt={poster.alt}
        width={frames.mobile.width}
        height={frames.mobile.height}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: `${(focusX * 100).toFixed(1)}% 50%` }}
      />
    </picture>
  );

  if (isStatic) {
    // Reduced motion or a weak device: the poster, then the headline on paper
    // (line 1 in ink here: the logo gradient's cyan stop is 1.9:1 on paper).
    return (
      <section
        aria-labelledby={headingId}
        className={className}
        data-hero-chapter=""
        data-hero-cine="static"
        data-nav-fill={navFill(SCHEDULE.navStatic)}
      >
        <div className="relative h-svh overflow-hidden bg-ink-950">{posterImg(true)}</div>
        <div className="bg-paper-50 py-section">
          <div className="mx-auto w-full max-w-wide px-6">
            {headline(false)}
            {description && <p className="mx-auto mt-6 max-w-[62ch] text-center text-lead text-text-body">{description}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={scope}
      aria-labelledby={headingId}
      className={`relative ${HEIGHT_CLASS} bg-ink-950 ${className}`}
      data-hero-chapter=""
      data-hero-cine="film"
      data-nav-fill={navFill(SCHEDULE.nav)}
    >
      <div className="sticky top-0 h-svh overflow-hidden text-text-on-ink">
        {/* The footage layer carries the push-in and the filter tweens: the
            poster (frame 1, the LCP element) under the canvas, which fades in
            once the coarse frame pass is complete. */}
        <div ref={layerRef} className="absolute inset-0">
          {posterImg(true)}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200 ease-linear"
          />
        </div>

        {/* Faint edge darkening only, as HeroChapter: the top band keeps the
            transparent nav's white links readable over bright frames before
            the footage dims, the bottom band serves the cue and the caption. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink-950/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-ink-950/50 to-transparent"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 md:px-10">
          {headline(true)}
          {/* The description's top margin clears the block's zoom overflow
              (scale 1.3 adds ~15% of its height below its layout box). */}
          {description && (
            <p className="rr-hero-desc mt-16 max-w-[62ch] text-center text-lead text-text-on-ink/90 opacity-0 md:mt-24">
              {description}
            </p>
          )}
        </div>

        {caption && (
          <p
            aria-hidden="true"
            className="rr-hero-caption pointer-events-none absolute bottom-7 left-6 z-10 font-mono text-eyebrow tracking-[0.18em] text-text-on-ink/70 opacity-0 md:left-10"
          >
            {caption}
          </p>
        )}

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 transition-opacity duration-[var(--duration-base)] ${
            cue === "visible" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-eyebrow tracking-[0.18em] text-text-on-ink/90">scroll</span>
          <svg
            className={cue === "visible" ? "rr-scroll-cue" : undefined}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M8 2.5v10.5m0 0 4.25-4.25M8 13 3.75 8.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
