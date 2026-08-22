import { Fragment, useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE_IN_OUT_QUART, MOTION_OK_QUERY, gsap, useGSAP } from "../../lib/motion";

export type HeroVideoSources = {
  /** Desktop encode (served from 768px up). The committed file is the
   * source's native 1280 width; the key keeps the media-skill name. */
  mp4_1920: string;
  mp4_960: string;
  webm_1920?: string;
  poster: string;
  width: number;
  height: number;
};

type HeroChapterProps = {
  video: HeroVideoSources;
  /** Authored lines. Line 1 animates as ONE unit in the logo gradient; every
   * later line assembles word by word in white. */
  lines: string[];
  /** h1 on the landing (the page's one h1); h2 on /styleguide. */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Scroll schedule in pin progress p (0 = chapter top reaches the viewport
 * top, 1 = the HEIGHT wrapper releases). Landing v4 section 1 (Cedric's v3
 * review: zoom with the words, then fade in place instead of throwing them):
 *
 *   p 0.00-0.08  video only
 *   p 0.08-0.45  video brightness 1 -> 0.38, saturate 1 -> 0.75 (the scrim)
 *   p 0.10-0.42  headline assembles: 7 units (line 1, then 6 words), each
 *                yPercent 110 -> 0 + opacity 0 -> 1 over 0.11 of the pin,
 *                ease in-out quart, unit starts 0.035 apart, last lands at 0.42;
 *                AND the block scales 1 -> 1.30 (1.20 under 768px) over the
 *                same window, power1.inOut, so the scale is at its max exactly
 *                as the last unit lands
 *   p 0.42-0.62  hold: full text, no transforms
 *   p 0.62-1.00  fade: block opacity 1 -> 0, power2.inOut (a sigmoid: slow
 *                start, accelerating through the middle, easing out); no y,
 *                no scale change, no stagger (the block fades as one). Cedric,
 *                2026-08-22, on the drafts: "way slower, get to 0 once we are
 *                basically off that page", then "start a bit later so it
 *                doesn't disappear while we are still reading it ... slow
 *                start ... sigmoid": 0.96 at 0.70, 0.5 at 0.81, 0.13 at 0.90,
 *                0 as the pin lets go
 *   p 0.72-0.95  nav fill: NavBar reads `data-nav-fill` off the wrapper and
 *                ramps --nav-alpha 0 -> 1 over these p values (transparent
 *                through assembly, hold and the first half of the fade;
 *                paper by the time the Highlights strip slides over the hero). The static
 *                layout publishes its own ramp over the poster's scroll-out.
 *   p 0.84-1.00  video brightness -> 0.12 (under the tail of the fade)
 *   p 0.00-1.00  video push-in scale 1 -> 1.12, linear
 *
 * Blur decision (spec: `filter: blur(0 -> 10px)` on the video from p 0.12 to
 * 0.45 only if it costs under 4 ms a frame at 1440x900). Measured 2026-08-21
 * in headless Chrome at 1440x900 while scrolling the chapter with the loop
 * playing: under software GL (SwiftShader) the video pipeline alone runs
 * 130-180 ms a frame, so the blur delta is lost in noise (-11 ms mean, +25 ms
 * median, base-to-base drift -51 ms); no headless flag set reaches the GPU on
 * this machine. With no evidence that the blur stays under 4 ms, `blurPx`
 * stays 0: the brightness + saturate scrim alone carries readability (white
 * on brightness 0.38 of a pure-white frame is 6.2:1, AAA for display text)
 * and the darkened footage stays legible as footage behind the words. To
 * re-test on a GPU: set blurPx to 10 and record the Performance panel
 * through p 0.12-0.45.
 */
const SCHEDULE = {
  video: {
    pushIn: 1.12,
    dimStart: 0.08,
    dimEnd: 0.45,
    brightness: 0.38,
    saturate: 0.75,
    /** Near-black ramp under the tail of the fade. */
    exitDimStart: 0.84,
    exitBrightness: 0.12,
    blurPx: 0,
  },
  assemble: { start: 0.1, end: 0.42, unitDuration: 0.11, yPercent: 110 },
  /** Rides the assembly window so the scale peaks as the last unit lands. */
  zoom: { start: 0.1, end: 0.42, wide: 1.3, narrow: 1.2 },
  /** 0.42-0.62 is the hold: nothing is tweened there. The fade ends with
   * the pin, so the words are still faintly there as the chapter leaves. */
  fade: { start: 0.62, end: 1.0, ease: "power2.inOut" },
  /** Nav fill, published on the wrapper as data-nav-fill="from to" in the
   * wrapper's own scroll progress (start "top top", end "bottom bottom").
   * Pinned layout: pin progress. Static layout (reduced motion / weak
   * device: poster + paper headline): the bar is paper well before the ink
   * headline block reaches it. */
  nav: { fillStart: 0.72, fillEnd: 0.95 },
  navStatic: { fillStart: 0.1, fillEnd: 0.6 },
} as const;

/** Pin length. v3 shipped 320vh; kept in v4 (the fade now runs to the
 * release, so there is no dead scroll at the end; section 12 of
 * docs/plans/landing-v4.md). */
const HEIGHT_CLASS = "h-[320vh]";

const navFill = (r: { fillStart: number; fillEnd: number }) => `${r.fillStart} ${r.fillEnd}`;

const WIDE_QUERY = "(min-width: 768px)";

function videoFilter(brightness: number, saturate: number, blurPx: number): string {
  const base = `brightness(${brightness}) saturate(${saturate})`;
  return blurPx > 0 ? `${base} blur(${blurPx}px)` : base;
}

/** Weak device rule from landing-v3: under four logical cores, no pin. */
function isWeakDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  return typeof cores === "number" && cores > 0 && cores < 4;
}

const DISPLAY_TYPE =
  // Phones: 9.5vw (37 px at 390) so the headline is a headline, not a caption;
  // line 1 = 315 px at rest, 378 px at the 1.2 ceiling, no clipping.
  "block text-center font-display text-[9.5vw] font-semibold leading-[0.95] tracking-[-0.03em] md:text-[clamp(2rem,8.5vw,8.5rem)]";

/**
 * The landing's first 320vh: the FPV loop under the transparent nav, the
 * headline assembling in front of it while it zooms, a hold, then the whole
 * block fading in place before the paper Highlights strip slides over the
 * darkened hero. CSS sticky does the pinning (works without JS); one scrubbed
 * GSAP timeline does everything else. Ships the WCAG 2.2.2 pause control
 * (hover/focus reveal, always tabbable) and the one-shot idle scroll cue.
 *
 * Reduced motion, weak devices (hardwareConcurrency < 4): no pin, the poster
 * at 100svh, then the static headline on paper, fully readable.
 *
 * Accessibility: one heading (`as`) carrying the full sentence in aria-label;
 * the animated word spans are aria-hidden.
 */
export default function HeroChapter({ video, lines, as = "h1", className = "" }: HeroChapterProps) {
  const reduced = usePrefersReducedMotion();
  const [weak] = useState(isWeakDevice);
  const isStatic = reduced || weak;
  const scope = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingId = useId();
  const Tag = as;
  const sentence = lines.join(" ");
  const [paused, setPaused] = useState(false);
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

  useGSAP(
    () => {
      if (isStatic) return;
      const root = scope.current;
      const vid = videoRef.current;
      if (!root || !vid) return;
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK_QUERY, wide: WIDE_QUERY }, (ctx) => {
        const { ok, wide } = ctx.conditions as { ok: boolean; wide: boolean };
        if (!ok) return;
        const block = root.querySelector<HTMLElement>(".rr-hero-block");
        const units = Array.from(root.querySelectorAll<HTMLElement>(".rr-hero-unit"));
        if (!block || units.length === 0) return;

        const S = SCHEDULE;
        const zoom = wide ? S.zoom.wide : S.zoom.narrow;
        const animated = [vid, block, ...units];

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            // will-change only while the chapter is actually pinned.
            onToggle: (self) => {
              gsap.set(animated, { willChange: self.isActive ? "transform" : "auto" });
            },
          },
        });

        // Video: slow push-in over the whole pin; dim and desaturate before the
        // headline lands; near-black while the words leave.
        tl.fromTo(vid, { scale: 1 }, { scale: S.video.pushIn, duration: 1 }, 0)
          .fromTo(
            vid,
            { filter: videoFilter(1, 1, 0) },
            {
              filter: videoFilter(S.video.brightness, S.video.saturate, S.video.blurPx),
              duration: S.video.dimEnd - S.video.dimStart,
            },
            S.video.dimStart,
          )
          .to(
            vid,
            {
              filter: videoFilter(S.video.exitBrightness, S.video.saturate, S.video.blurPx),
              duration: 1 - S.video.exitDimStart,
            },
            S.video.exitDimStart,
          );

        // Assembly: line 1 as one unit, then word by word; the last unit lands
        // exactly at assemble.end.
        const n = units.length;
        const stagger = n > 1 ? (S.assemble.end - S.assemble.unitDuration - S.assemble.start) / (n - 1) : 0;
        units.forEach((el, i) => {
          tl.fromTo(
            el,
            { yPercent: S.assemble.yPercent, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: S.assemble.unitDuration, ease: EASE_IN_OUT_QUART },
            S.assemble.start + i * stagger,
          );
        });

        // Zoom: rides the assembly window, so the block is at its largest the
        // instant the last word lands; nothing moves during the hold.
        tl.fromTo(
          block,
          { scale: 1 },
          { scale: zoom, duration: S.zoom.end - S.zoom.start, ease: "power1.inOut" },
          S.zoom.start,
        );

        // Fade: the whole block, as one, in place. Opacity lives on the block
        // (the units' own opacity tweens ended with the assembly), no y, no
        // scale change, no stagger. immediateRender off so the block is not
        // forced to opacity 1 before the assembly has run.
        tl.fromTo(
          block,
          { opacity: 1 },
          {
            opacity: 0,
            duration: S.fade.end - S.fade.start,
            ease: S.fade.ease,
            immediateRender: false,
          },
          S.fade.start,
        );
      });
    },
    { scope, dependencies: [isStatic, sentence], revertOnUpdate: true },
  );

  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  const headline = (onInk: boolean) => (
    <Tag id={headingId} aria-label={sentence} className="block">
      {/* Display type lives on the span, not the heading element, so the
          legacy h1/h2 rules in index.css never interfere. */}
      <span
        aria-hidden="true"
        className={`rr-hero-block ${DISPLAY_TYPE} ${onInk ? "text-text-on-ink" : "text-text-strong"}`}
      >
        {lines.map((line, li) => (
          <span key={line} className="block whitespace-nowrap">
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

  if (isStatic) {
    // Reduced motion or a weak device: the poster, then the headline on paper
    // (line 1 in ink here: the logo gradient's cyan stop is 1.9:1 on paper).
    return (
      <section
        aria-labelledby={headingId}
        className={className}
        data-hero-chapter=""
        data-nav-fill={navFill(SCHEDULE.navStatic)}
      >
        <div className="relative h-svh overflow-hidden bg-ink-950">
          <img
            src={video.poster}
            alt=""
            width={video.width}
            height={video.height}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="bg-paper-50 py-section">
          <div className="mx-auto w-full max-w-wide px-6">{headline(false)}</div>
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
      data-nav-fill={navFill(SCHEDULE.nav)}
    >
      <div className="group sticky top-0 h-svh overflow-hidden text-text-on-ink">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-hidden="true"
        >
          {video.webm_1920 && (
            <source src={video.webm_1920} type="video/webm" media={WIDE_QUERY} />
          )}
          <source src={video.mp4_1920} type="video/mp4" media={WIDE_QUERY} />
          <source src={video.mp4_960} type="video/mp4" />
        </video>

        {/* Faint edge darkening only: the top band keeps the transparent
            nav's white links readable over bright frames before the video
            dims (p < 0.08), the bottom band serves the cue and the pause
            control. The scrim that makes the headline readable is the
            video filter. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink-950/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-ink-950/50 to-transparent"
        />

        {/* The headline sits in front of the video and lets pointer events
            through so hovering anywhere still reveals the pause control. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          {headline(true)}
        </div>

        <button
          type="button"
          onClick={togglePlayback}
          aria-pressed={paused}
          aria-label={paused ? "Play footage" : "Pause footage"}
          className={`absolute right-6 bottom-6 z-10 flex h-10 w-10 items-center justify-center rounded-btn border border-text-on-ink/30 bg-ink-950/40 text-text-on-ink transition-opacity duration-[var(--duration-fast)] focus-visible:opacity-100 focus-visible:outline-text-on-ink ${
            paused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4.5 2.5v9l7-4.5-7-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4.75 2.5v9M9.25 2.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>

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
