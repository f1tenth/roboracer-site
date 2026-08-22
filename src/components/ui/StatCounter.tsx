import { useImperativeHandle, useRef, type Ref } from "react";
import { gsap, useGSAP, MOTION_OK_QUERY } from "../../lib/motion";

export type StatCounterHandle = {
  /**
   * Progress mode only: the owner's schedule position for this tile, 0..1.
   * Eased (power2.out) and written straight to the DOM; no React render, so
   * a scroll-driven chapter can feed four tiles on every scrub tick.
   */
  setProgress: (progress: number) => void;
};

type StatCounterProps = {
  value: number;
  suffix?: string;
  label: string;
  on?: "paper" | "ink";
  /**
   * time (default): counts up once the tile is FULLY in view, 3.2 s,
   * power2.out, once. progress: the owner drives it through the handle
   * (landing-v3 map chapter); no ScrollTrigger of its own.
   */
  mode?: "time" | "progress";
  /** Time mode: seconds before the count starts (0.15 s stagger per tile). */
  delay?: number;
  ref?: Ref<StatCounterHandle>;
};

// Landing-v3 timing (section 6): 3.2 s, power2.out, wherever a counter runs.
const DURATION = 3.2;
const EASE = "power2.out";
const ease = gsap.parseEase(EASE);

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Data-strip stat: mono tabular value over a small mono label - a spec-sheet
 * row, not a hero-metric tile. The final number is in the markup from the
 * first render (reduced motion and no-JS read it as is); motion only ever
 * rewrites the text node.
 */
export default function StatCounter({
  value,
  suffix = "",
  label,
  on = "paper",
  mode = "time",
  delay = 0,
  ref,
}: StatCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const lastText = useRef<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress: number) {
        const el = numberRef.current;
        if (!el) return;
        // Reduced motion keeps the final number no matter what the owner sends.
        if (!window.matchMedia(MOTION_OK_QUERY).matches) return;
        const p = Math.min(Math.max(progress, 0), 1);
        const text = format(value * ease(p));
        if (text === lastText.current) return;
        lastText.current = text;
        el.textContent = text;
      },
    }),
    [value],
  );

  useGSAP(
    () => {
      if (mode !== "time") return;
      const el = numberRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const proxy = { n: 0 };
        gsap.to(proxy, {
          n: value,
          duration: DURATION,
          delay,
          ease: EASE,
          scrollTrigger: {
            trigger: el,
            start: "bottom bottom",
            once: true,
            // Zero the tile as soon as the row is in view so a staggered tile
            // does not show its final number, then 0, then count.
            onEnter: () => {
              el.textContent = format(0);
            },
          },
          onUpdate: () => {
            el.textContent = format(proxy.n);
          },
          onComplete: () => {
            el.textContent = format(value);
          },
        });
      });
    },
    { dependencies: [value, mode, delay], revertOnUpdate: true },
  );

  const ink = on === "ink";
  return (
    <div className="flex flex-col gap-1.5">
      <p
        className={`font-mono text-display-m font-semibold tabular-nums ${ink ? "text-text-on-ink" : "text-text-strong"}`}
      >
        <span ref={numberRef}>{format(value)}</span>
        {suffix}
      </p>
      <p className={`font-mono text-small ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>{label}</p>
    </div>
  );
}
