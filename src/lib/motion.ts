// Shared motion setup for the RoboRacer design system.
// Register plugins exactly once here; every animated component imports gsap
// from this module instead of "gsap" so registration is guaranteed.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

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
 * Lenis smooth scroll, desktop pointers only, never under reduced motion.
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
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [enabled]);
}

export { gsap, ScrollTrigger, useGSAP };
