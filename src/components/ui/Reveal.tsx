import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, EASE_OUT_EXPO, MOTION_OK_QUERY } from "../../lib/motion";

type RevealProps = {
  as?: ElementType;
  className?: string;
  /** Animate direct children with a 60ms stagger instead of the wrapper. */
  stagger?: boolean;
  delay?: number;
  children: ReactNode;
};

/**
 * The design-system Reveal pattern: y 24px -> 0, opacity 0 -> 1, 0.6s,
 * ease-out-expo, once. Content is visible without JS and under reduced
 * motion (gsap.from only hides it when the animation actually runs).
 */
export default function Reveal({
  as: Tag = "div",
  className,
  stagger = false,
  delay = 0,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from(stagger ? Array.from(el.children) : el, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: EASE_OUT_EXPO,
          stagger: stagger ? 0.06 : 0,
          delay,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return createElement(Tag, { ref, className }, children);
}
