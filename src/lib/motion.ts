// Shared motion setup for the RoboRacer design system.
// Register plugins exactly once here; every animated component imports gsap
// from this module instead of "gsap" so registration is guaranteed.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { useEffect, useSyncExternalStore } from "react";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

// The site, not the browser, decides where a page opens on Back and Forward
// (hooks/useRouteScroll). With "auto", Chrome re-applied the old entry's pixel
// offset at the first layout after the route rendered, i.e. after the reset to
// the top, and the landing's pins then carried it further down (Cedric,
// 2026-09-25). Set through ScrollTrigger: it writes back the value it read at
// startup on every refresh, so a plain `history.scrollRestoration` would not stick.
ScrollTrigger.clearScrollMemory("manual");

// Exact CSS beziers from the @theme tokens (--ease-out-expo, --ease-in-out-quart).
export const EASE_OUT_EXPO = CustomEase.create("rrOutExpo", "0.16, 1, 0.3, 1");
export const EASE_IN_OUT_QUART = CustomEase.create("rrInOutQuart", "0.76, 0, 0.24, 1");

// Seconds, mirroring --duration-* tokens. 1.2s is the per-element cap.
export const DURATION = { fast: 0.18, base: 0.42, slow: 0.9 } as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Matches the `desktop:` CSS variant (src/index.css): the pinned chapters
 * need vertical room, so a landscape phone keeps the mobile layout. */
export const DESKTOP_QUERY = "(min-width: 48rem) and (min-height: 34rem)";
export const MOTION_OK_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Live `matchMedia(query).matches`. `true` before hydration (there is no
 * SSR; the value is read on the first client render).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

/** True where the `desktop:` variant applies (wide and tall enough to pin).
 * Below it (`compact:`: phones in either orientation, short windows) the
 * landing chapters render unpinned (docs/mobile/PLAN.md R-1). */
export function useDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}

/**
 * Scroll lock, held by the open mobile menu. `overflow: hidden` on the root
 * stops the reader's scrolling but not the page's own: a running Lenis
 * animation carried on under the menu and the landing hero's auto-scroll
 * glide still fired, so closing the menu could land somewhere else. While
 * the lock is held, Lenis stops (useLenis) and the glide stands down
 * (HeroChapter). A count, so two holders never release each other.
 */
let scrollLocks = 0;
const scrollLockListeners = new Set<(locked: boolean) => void>();

export function isScrollLocked(): boolean {
  return scrollLocks > 0;
}

/** Take the lock; call the returned function once to release it. */
export function lockScroll(): () => void {
  scrollLocks += 1;
  if (scrollLocks === 1) for (const fn of scrollLockListeners) fn(true);
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    scrollLocks -= 1;
    if (scrollLocks === 0) for (const fn of scrollLockListeners) fn(false);
  };
}

/** Called with true when the lock is first taken, false when it is freed. */
export function onScrollLock(fn: (locked: boolean) => void): () => void {
  scrollLockListeners.add(fn);
  return () => {
    scrollLockListeners.delete(fn);
  };
}

/**
 * Lenis smooth scroll, desktop pointers only, never under reduced motion.
 * Stopped (its animation cancelled) while the scroll lock is held.
 * Opt-in per page (the styleguide calls it); not mounted globally until the
 * landing page ships.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const lenis = new Lenis();
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    if (isScrollLocked()) lenis.stop();
    const offLock = onScrollLock((locked) => (locked ? lenis.stop() : lenis.start()));
    return () => {
      offLock();
      gsap.ticker.remove(update);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [enabled]);
}

export { gsap, ScrollTrigger, useGSAP };
