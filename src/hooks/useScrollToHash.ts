import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { REDUCED_MOTION_QUERY, ScrollTrigger } from "../lib/motion";

/** Glide speed for an in-page jump: roughly one viewport of travel per
 * 450 ms, capped so a jump over the whole pinned hero stays short. */
const GLIDE_MS_PER_VIEWPORT = 450;
const GLIDE_MAX_MS = 1400;
/** How long a jump is defended against ScrollTrigger refreshes. */
const HOLD_MS = 4000;

const INPUT_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/** Top of `el` in page coordinates. */
const topOf = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

/**
 * A ScrollTrigger refresh scrolls to 0 to measure and then restores the
 * position it recorded when the page's matchMedia contexts were created. On a
 * freshly mounted landing that record is 0, so a refresh that lands just after
 * the jump (the landing refreshes as each data file arrives, and again when
 * the webfonts are in) put the reader back at the top of the hero. For a few
 * seconds after a jump, every refresh re-applies it, unless the reader has
 * scrolled on their own by then.
 */
function holdAt(el: HTMLElement): () => void {
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    window.clearTimeout(timer);
    ScrollTrigger.removeEventListener("refresh", reapply);
    for (const ev of INPUT_EVENTS) window.removeEventListener(ev, release);
  };
  const reapply = () => {
    const top = topOf(el);
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo(0, top);
  };
  const timer = window.setTimeout(release, HOLD_MS);
  ScrollTrigger.addEventListener("refresh", reapply);
  for (const ev of INPUT_EVENTS) window.addEventListener(ev, release, { passive: true });
  return release;
}

/**
 * Window scroll tween, the same technique as the hero's auto-scroll: plain
 * window.scrollTo per frame, which Lenis picks up as native scroll, so the
 * one scroll pipeline (Lenis -> ScrollTrigger) stays in charge. Any wheel,
 * touch, key or pointer input hands control back to the reader.
 */
function glideTo(top: number): () => void {
  const from = window.scrollY;
  const distance = top - from;
  const ms = Math.min(GLIDE_MAX_MS, Math.max(300, (Math.abs(distance) / window.innerHeight) * GLIDE_MS_PER_VIEWPORT));
  const start = performance.now();
  let raf = 0;
  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    for (const ev of INPUT_EVENTS) window.removeEventListener(ev, stop);
  };
  for (const ev of INPUT_EVENTS) window.addEventListener(ev, stop, { passive: true });
  const step = (now: number) => {
    if (done) return;
    const t = Math.min(1, (now - start) / ms);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    window.scrollTo(0, from + distance * e);
    if (t < 1) raf = requestAnimationFrame(step);
    else stop();
  };
  raf = requestAnimationFrame(step);
  return stop;
}

/**
 * Scroll to the element named by the URL hash. React Router changes the hash
 * without scrolling, so a `/#start` link needs this on the page that owns the
 * target. Arriving from another route (or on load) jumps straight there; a
 * link on the same page glides, or jumps under reduced motion. Focus moves to
 * the target afterwards, as a native in-page anchor does, so the next Tab
 * starts from there.
 */
export function useScrollToHash() {
  const { hash, key } = useLocation();
  // The navigation that mounted the page. Keyed rather than a boolean so
  // StrictMode's second effect run still counts as the arrival.
  const arrivalKey = useRef(key);

  useEffect(() => {
    const firstVisit = key === arrivalKey.current;
    if (!hash) return;
    // A malformed fragment (/#%) is ignored, never thrown: decodeURIComponent
    // raises URIError on it, which took the whole page down.
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    let raf = 0;
    let tries = 0;
    let stopGlide: (() => void) | undefined;
    let release: (() => void) | undefined;

    const go = () => {
      const el = document.getElementById(id);
      // Wait for the target to exist and, if it (or something in it) is
      // aria-busy while its data loads, for that to clear: scrolling first
      // and letting the content arrive under the reader would shift
      // everything below it. About three seconds, then go anyway.
      const busy = el && (el.getAttribute("aria-busy") === "true" || el.querySelector('[aria-busy="true"]'));
      if (!el || busy) {
        if (tries++ < 180) {
          raf = requestAnimationFrame(go);
          return;
        }
        if (!el) return;
      }
      const top = topOf(el);
      const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      if (firstVisit || reduce) {
        window.scrollTo(0, top);
        release = holdAt(el);
      } else {
        stopGlide = glideTo(top);
      }
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    raf = requestAnimationFrame(go);
    return () => {
      cancelAnimationFrame(raf);
      stopGlide?.();
      release?.();
    };
  }, [hash, key]);
}
