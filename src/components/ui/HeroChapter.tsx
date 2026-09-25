import { Fragment, useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { DESKTOP_QUERY, EASE_IN_OUT_QUART, MOTION_OK_QUERY, gsap, useGSAP } from "../../lib/motion";
import { linkCanStream } from "../../lib/media";

export type HeroClip = {
  /** Desktop encode (served where DESKTOP_QUERY matches: 768px wide and
   * 544px tall; a landscape phone gets the 960); the key keeps the
   * media-skill name whatever the file's native width. */
  mp4_1920: string;
  mp4_960: string;
  /** Average bitrate of the desktop encode in Mbit/s. On a link that cannot
   * stream it (Save-Data, slower than 4g, downlink under 1.3x this) the 960
   * encode plays instead, so the cycle never freezes mid-clip. */
  mbps?: number;
};

export type HeroVideoSources = {
  /** Desktop encode (served where DESKTOP_QUERY matches). The committed file is the
   * source's native 1280 width; the key keeps the media-skill name. */
  mp4_1920: string;
  mp4_960: string;
  webm_1920?: string;
  /** Average bitrate of `mp4_1920` in Mbit/s (see HeroClip.mbps). */
  mbps?: number;
  poster: string;
  width: number;
  height: number;
  /** Landing v5: a clip sequence instead of one loop. Clips play in order
   * with a crossfade between them (two stacked video elements, the next
   * clip preloading while the current one plays); after the last, the cycle
   * restarts at `loopFrom` (default 0), so clips before it play once. */
  clips?: HeroClip[];
  loopFrom?: number;
};

type HeroChapterProps = {
  video: HeroVideoSources;
  /** Authored lines. Line 1 animates as ONE unit in the logo gradient; every
   * later line assembles word by word in white. */
  lines: string[];
  /** One sentence on what RoboRacer is, under the headline (landing v5 final
   * touches); it lands as the last word does and leaves with the block. */
  description?: string;
  /** h1 on the landing (the page's one h1); h2 on /styleguide. */
  as?: "h1" | "h2";
  className?: string;
  /** Called once when the opening clip has fully downloaded (or failed; at
   * once for the static poster layout), so the page can release media it
   * held back to give that clip the connection (docs/media/HERO_PERF.md).
   * Not on `canplaythrough`: Chrome fired it with 1.2 s of a 5 s clip
   * buffered at 5 Mbit/s, and the released images froze the clip. */
  onOpeningLoaded?: () => void;
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
 *                AND the block scales 1 -> 1.30 (1.12 below `desktop:`) over the
 *                same window, power1.inOut, so the scale is at its max exactly
 *                as the last unit lands
 *   p 0.42-1.00  hold: full text, no transforms, to the release of the pin
 *
 * Scroll-out q (0 = the pin releases, the chapter starts moving up; 1 = the
 * chapter's bottom reaches the viewport top, the hero is gone):
 *   q 0.22-0.62  fade: block opacity 1 -> 0, power2.inOut (a sigmoid), no y,
 *                no scale change, no stagger (the block fades as one), while
 *                the whole hero slides up under the Highlights strip. Cedric,
 *                2026-08-22, through four drafts: "way slower, get to 0 once
 *                we are basically off that page", "it should barely fade
 *                until it is barely gone", "it should start fading only after
 *                we start going down ... when it's all the way at the top",
 *                then "now a bit too late: start when we are about to hit the
 *                text itself, 2/3 of the video height". So nothing fades while
 *                pinned; the words ride up with the footage and start going
 *                as their top line reaches the viewport edge (q ~0.25, the
 *                text in the upper third), 0.5 at q 0.42, gone at 0.62 while
 *                half the block is still on screen.
 *   q 0.00-0.60  video brightness 0.38 -> 0.12 under the leaving words
 *   p 0.72-0.95  nav fill: NavBar reads `data-nav-fill` off the wrapper and
 *                ramps --nav-alpha 0 -> 1 over these p values (transparent
 *                through assembly, hold and the first half of the fade;
 *                paper by the time the Highlights strip slides over the hero). The static
 *                layout publishes its own ramp over the poster's scroll-out.
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
    /** Near-black ramp under the leaving words, in scroll-out progress q. */
    exitDimStart: 0,
    exitDimEnd: 0.6,
    exitBrightness: 0.12,
    blurPx: 0,
  },
  assemble: { start: 0.1, end: 0.42, unitDuration: 0.11, yPercent: 110 },
  /** Rides the assembly window so the scale peaks as the last unit lands. */
  zoom: { start: 0.1, end: 0.42, wide: 1.3, narrow: 1.12 },
  /** In scroll-out progress q (after the pin releases): the words hold
   * through the whole pin and fade while the hero slides up and away. */
  fade: { start: 0.22, end: 0.62, ease: "power2.inOut" },
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
 * docs/plans/landing-v4.md). Below `desktop:` (phones, mobile pass L-2) the
 * pin is 200vh: one screen of travel, so the headline is complete about 0.4
 * of a screen in and the schedule's quiet stretch (the hold before the nav
 * fill) is a quarter of a screen instead of a whole one. */
const HEIGHT_CLASS = "h-[200vh] desktop:h-[320vh]";

const navFill = (r: { fillStart: number; fillEnd: number }) => `${r.fillStart} ${r.fillEnd}`;

/** Crossfade between clips (seconds); the incoming clip starts this long
 * before the current one ends and fades in over it. */
const CROSSFADE_S = 0.9;
/** The next clip starts downloading once the current one is fully buffered,
 * or this many seconds before the current one ends, whichever comes first:
 * until then the playing clip has the whole connection (docs/media/HERO_PERF.md). */
const PRELOAD_LEAD_S = 3;
const CROSSFADE_CLASS = "transition-opacity duration-[900ms] ease-linear";

/** Auto-scroll (Cedric, landing v5 round two): when the clip cycle comes back
 * to the IV FPV clip (the last clip) and the visitor is still at the top,
 * AUTOSCROLL_DELAY_S (1 s) into that clip the page glides to pin progress
 * AUTOSCROLL_TARGET_P, where the headline stands assembled. Once per visit;
 * any wheel, touch, key or scrollbar drag cancels it. Not under reduced
 * motion (static layout, no pin). */
const AUTOSCROLL_DELAY_S = 1; // v5 round two: 3 s, then Cedric: "2 s earlier"
const AUTOSCROLL_TARGET_P = 0.46;
const AUTOSCROLL_DURATION_MS = 2600;

/** Smooth scroll to `top` over `ms` (power2.inOut) with a rAF tween; resolves
 * to false if the user took over. */
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
  // Phones: 8.5vw (33 px at 390). At 9.5vw the longest line reached the
  // viewport edge once the 1.2 zoom peaked (Cedric, v1.0: "too close to the
  // edges on mobile"); 8.5vw with the 1.12 narrow ceiling leaves the px-6
  // gutter clear on 390 and 430. Capped by the height (10svh, 39 px at
  // 844x390) so a landscape phone fits the three lines and the description
  // between the bar and the bottom edge. The two desktop sizes are split at
  // lg so neither depends on stylesheet order.
  "block text-center font-display text-[min(8.5vw,10svh)] font-semibold leading-[0.95] tracking-[-0.03em] desktop:max-lg:text-[7.4vw] desktop:lg:text-[clamp(2rem,8.5vw,8.5rem)]";

/**
 * The landing's first 320vh (200vh on phones): the FPV loop under the transparent nav, the
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
export default function HeroChapter({ video, lines, description, as = "h1", className = "", onOpeningLoaded }: HeroChapterProps) {
  const reduced = usePrefersReducedMotion();
  const [weak] = useState(isWeakDevice);
  const isStatic = reduced || weak;
  const scope = useRef<HTMLElement>(null);
  // The footage layer (scale + filter tweens) holds one looping video, or two
  // stacked videos that crossfade through `video.clips`.
  const layerRef = useRef<HTMLDivElement>(null);
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  // The video elements the pause control acts on: the playing one, plus the
  // incoming one during a crossfade.
  const activeRef = useRef<HTMLVideoElement[]>([]);
  const clips = video.clips && video.clips.length > 0 ? video.clips : null;
  const loopFrom = Math.min(Math.max(0, video.loopFrom ?? 0), clips ? clips.length - 1 : 0);
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

  const onOpeningLoadedRef = useRef(onOpeningLoaded);
  useEffect(() => {
    onOpeningLoadedRef.current = onOpeningLoaded;
  }, [onOpeningLoaded]);
  useEffect(() => {
    let done = false;
    const a = vidA.current;
    const fire = () => {
      if (done) return;
      done = true;
      onOpeningLoadedRef.current?.();
    };
    if (isStatic || !a) {
      fire();
      return;
    }
    // `progress` fires while bytes arrive, `suspend` when the download
    // stops (the last bytes can land after the last `progress`).
    const handler = (e: Event) => {
      if (e.type === "error") return fire();
      const r = a.buffered;
      if (r.length > 0 && Number.isFinite(a.duration) && r.end(r.length - 1) >= a.duration - 0.25) fire();
    };
    const events = ["progress", "suspend", "error"] as const;
    for (const ev of events) a.addEventListener(ev, handler);
    return () => {
      for (const ev of events) a.removeEventListener(ev, handler);
    };
  }, [isStatic]);

  // Clip sequencer (landing v5): A plays clip i; B loads clip i+1 once A is
  // fully buffered or PRELOAD_LEAD_S from its end (until then A has the whole
  // connection, so the opening clip starts fast and does not freeze).
  // CROSSFADE_S before A ends, B starts and fades in over A (CSS opacity
  // transition, B lifted above A); if B cannot play yet, A holds (at worst on
  // its last frame) until B can. Once the fade is through, A stops and waits
  // to load the clip after that. `ended` is the safety net when a throttled
  // rAF misses the cue (hidden tab). Only the visible element(s) answer the
  // pause control (activeRef).
  useEffect(() => {
    const a = vidA.current;
    const b = vidB.current;
    if (isStatic || !clips || !a || !b) {
      activeRef.current = a ? [a] : [];
      return;
    }
    // The desktop zoom, the 1280/1920 encodes and the desktop type all key on
    // DESKTOP_QUERY (wide AND tall), never on width alone: a landscape phone
    // is 844 wide but 390 tall, and the width rule put the first headline
    // line under the nav and streamed it the desktop files (LANDING-03, -25).
    const wide = window.matchMedia(DESKTOP_QUERY).matches;
    // Chosen per clip at load time, so a link that slows down mid-cycle
    // drops to the 960 encodes for the clips after.
    const srcOf = (c: HeroClip) => (wide && (c.mbps === undefined || linkCanStream(c.mbps)) ? c.mp4_1920 : c.mp4_960);
    const after = (i: number) => (i + 1 < clips.length ? i + 1 : loopFrom);
    const els = [a, b] as const;
    let cur = 0;
    let clip = 0;
    let fading = false;
    let queued = false;
    let waiting = false;
    let disposed = false;
    let raf = 0;
    let timer = 0;
    let autoTimer = 0;
    let autoDone = false;
    let cancelGlide: (() => void) | null = null;
    const root = scope.current;
    const scheduleAutoScroll = () => {
      if (autoDone || !root) return;
      window.clearTimeout(autoTimer);
      autoTimer = window.setTimeout(() => {
        if (disposed || autoDone || window.scrollY > 8) return;
        autoDone = true;
        const target = root.getBoundingClientRect().top + window.scrollY + AUTOSCROLL_TARGET_P * (root.offsetHeight - window.innerHeight);
        cancelGlide = glideTo(target, AUTOSCROLL_DURATION_MS);
      }, AUTOSCROLL_DELAY_S * 1000);
    };
    const setClip = (el: HTMLVideoElement, i: number) => {
      el.preload = "auto";
      el.src = srcOf(clips[i]);
      el.load();
    };
    const queueNext = () => {
      if (queued) return;
      queued = true;
      setClip(els[1 - cur], after(clip));
    };
    const fullyBuffered = (v: HTMLVideoElement) => {
      const r = v.buffered;
      return r.length > 0 && r.end(r.length - 1) >= v.duration - 0.25;
    };
    const advance = () => {
      if (fading || waiting || disposed) return;
      const v = els[cur];
      const n = els[1 - cur];
      queueNext();
      if (n.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        waiting = true;
        n.addEventListener(
          "canplay",
          () => {
            waiting = false;
            advance();
          },
          { once: true },
        );
        return;
      }
      fading = true;
      const next = after(clip);
      n.style.zIndex = "1";
      v.style.zIndex = "0";
      activeRef.current = [v, n];
      void n.play().catch(() => {});
      n.style.opacity = "1";
      timer = window.setTimeout(() => {
        if (disposed) return;
        v.pause();
        v.style.opacity = "0";
        clip = next;
        cur = 1 - cur;
        activeRef.current = [n];
        queued = false;
        fading = false;
        if (clip === clips.length - 1) scheduleAutoScroll();
      }, CROSSFADE_S * 1000);
    };
    const tick = () => {
      if (disposed) return;
      const v = els[cur];
      const d = v.duration;
      if (!fading && Number.isFinite(d) && d > 0) {
        if (!queued && (fullyBuffered(v) || v.currentTime >= d - PRELOAD_LEAD_S)) queueNext();
        if (!v.paused && v.currentTime >= d - CROSSFADE_S) advance();
      }
      raf = requestAnimationFrame(tick);
    };
    const onEnded = () => advance();
    // A clip that fails to load (not deployed, network) must not freeze the
    // hero on its poster: fall back to the committed single loop on the
    // visible element and stop sequencing.
    const onError = (e: Event) => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      const el = e.currentTarget as HTMLVideoElement;
      const keep = el === els[cur] || fading ? els[cur] : el;
      const other = keep === a ? b : a;
      other.pause();
      other.removeAttribute("src");
      other.load();
      other.style.opacity = "0";
      keep.style.opacity = "1";
      keep.style.zIndex = "1";
      keep.loop = true;
      keep.src = wide && (video.mbps === undefined || linkCanStream(video.mbps)) ? video.mp4_1920 : video.mp4_960;
      keep.load();
      activeRef.current = [keep];
      void keep.play().catch(() => {});
    };
    a.addEventListener("ended", onEnded);
    b.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    b.addEventListener("error", onError);
    activeRef.current = [a];
    setClip(a, 0);
    void a.play().catch(() => {});
    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(autoTimer);
      cancelGlide?.();
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
      b.removeEventListener("error", onError);
    };
  }, [isStatic, clips, loopFrom, video.mp4_1920, video.mp4_960, video.mbps]);

  useGSAP(
    () => {
      if (isStatic) return;
      const root = scope.current;
      const vid = layerRef.current;
      if (!root || !vid) return;
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK_QUERY, wide: DESKTOP_QUERY }, (ctx) => {
        const { ok, wide } = ctx.conditions as { ok: boolean; wide: boolean };
        if (!ok) return;
        const block = root.querySelector<HTMLElement>(".rr-hero-block");
        const desc = root.querySelector<HTMLElement>(".rr-hero-desc");
        const units = Array.from(root.querySelectorAll<HTMLElement>(".rr-hero-unit"));
        if (!block || units.length === 0) return;

        const S = SCHEDULE;
        const zoom = wide ? S.zoom.wide : S.zoom.narrow;
        const animated = [vid, block, ...(desc ? [desc] : []), ...units];

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
        // headline lands. The near-black exit ramp lives on the scroll-out
        // timeline below, with the fade.
        tl.fromTo(vid, { scale: 1 }, { scale: S.video.pushIn, duration: 1 }, 0).fromTo(
          vid,
          { filter: videoFilter(1, 1, 0) },
          {
            filter: videoFilter(S.video.brightness, S.video.saturate, S.video.blurPx),
            duration: S.video.dimEnd - S.video.dimStart,
          },
          S.video.dimStart,
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

        // Description: fades in as the last word lands (no movement).
        if (desc) {
          tl.fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, S.assemble.end - 0.04);
        }

        // Zoom: rides the assembly window, so the block is at its largest the
        // instant the last word lands; nothing moves during the hold.
        tl.fromTo(
          block,
          { scale: 1 },
          { scale: zoom, duration: S.zoom.end - S.zoom.start, ease: "power1.inOut" },
          S.zoom.start,
        );

        // Scroll-out: after the pin releases the sticky hero rides up with the
        // chapter; this second scrubbed timeline runs from that release (the
        // chapter's bottom at the viewport bottom) to the chapter's bottom
        // reaching the viewport top. The words fade as one, in place (opacity
        // on the block; the units' own opacity tweens ended with the
        // assembly), and the footage goes near-black under them.
        // immediateRender off so the block is not forced to opacity 1 before
        // the assembly has run.
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
        // A full-length proxy tween pins the timeline's duration to 1 so its
        // progress is the scroll-out's q whatever the last tween's end.
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
            {
              opacity: 0,
              duration: S.fade.end - S.fade.start,
              ease: S.fade.ease,
              immediateRender: false,
            },
            S.fade.start,
          )
          .to(
            vid,
            {
              filter: videoFilter(S.video.exitBrightness, S.video.saturate, S.video.blurPx),
              duration: S.video.exitDimEnd - S.video.exitDimStart,
            },
            S.video.exitDimStart,
          );
      });
    },
    { scope, dependencies: [isStatic, sentence], revertOnUpdate: true },
  );

  const togglePlayback = () => {
    const els = activeRef.current;
    if (els.length === 0) return;
    if (paused) {
      for (const el of els) void el.play().catch(() => {});
      setPaused(false);
    } else {
      for (const el of els) el.pause();
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
      data-nav-fill={navFill(SCHEDULE.nav)}
    >
      <div className="group sticky top-0 h-svh overflow-hidden text-text-on-ink">
        <div ref={layerRef} className="absolute inset-0">
          {clips ? (
            <>
              <video
                ref={vidA}
                className={`absolute inset-0 h-full w-full object-cover ${CROSSFADE_CLASS}`}
                muted
                playsInline
                preload="auto"
                poster={video.poster}
                width={video.width}
                height={video.height}
                aria-hidden="true"
              />
              <video
                ref={vidB}
                className={`absolute inset-0 h-full w-full object-cover opacity-0 ${CROSSFADE_CLASS}`}
                muted
                playsInline
                preload="none"
                width={video.width}
                height={video.height}
                aria-hidden="true"
              />
            </>
          ) : (
            <video
              ref={vidA}
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
              {video.webm_1920 && <source src={video.webm_1920} type="video/webm" media={DESKTOP_QUERY} />}
              <source src={video.mp4_1920} type="video/mp4" media={DESKTOP_QUERY} />
              <source src={video.mp4_960} type="video/mp4" />
            </video>
          )}
        </div>

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
            through so hovering anywhere still reveals the pause control. On
            a short window (a landscape phone) it centres in the space under
            the bar, so no line ever sits behind the nav. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 desktop:px-10 [@media(max-height:33.99rem)]:pt-nav">
          {headline(true)}
          {/* The description's top margin clears the block's zoom overflow
              (scale 1.3 adds ~15% of its height below its layout box; 1.12
              about 6% below `desktop:`, so a short window takes 8svh). */}
          {description && (
            <p className="rr-hero-desc mt-[min(4rem,8svh)] max-w-[62ch] text-center text-lead text-text-on-ink/90 opacity-0 desktop:mt-24">
              {description}
            </p>
          )}
        </div>

        {/* Revealed by hover or focus with a mouse; always shown where there
            is no hover (touch), at 44px (WCAG 2.2.2, R-4). */}
        <button
          type="button"
          onClick={togglePlayback}
          aria-pressed={paused}
          aria-label={paused ? "Play footage" : "Pause footage"}
          className={`absolute right-6 bottom-6 z-10 flex h-10 w-10 items-center justify-center rounded-btn border border-text-on-ink/30 bg-ink-950/40 text-text-on-ink transition-opacity duration-[var(--duration-fast)] focus-visible:opacity-100 focus-visible:outline-text-on-ink coarse:h-11 coarse:w-11 ${
            paused ? "opacity-100" : "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
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
