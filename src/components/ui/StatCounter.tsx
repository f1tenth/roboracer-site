import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK_QUERY } from "../../lib/motion";

type StatCounterProps = {
  value: number;
  suffix?: string;
  label: string;
  on?: "paper" | "ink";
};

/**
 * Data-strip stat: mono tabular value over a small mono label - a spec-sheet
 * row, not a hero-metric tile. Counts up once the element is FULLY in view
 * (start "bottom bottom"), 1.8s; the final number is in the markup from
 * first render.
 */
export default function StatCounter({ value, suffix = "", label, on = "paper" }: StatCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const format = (n: number) => Math.round(n).toLocaleString("en-US");

  useGSAP(() => {
    const el = numberRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK_QUERY, () => {
      const proxy = { n: 0 };
      gsap.to(proxy, {
        n: value,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "bottom bottom", once: true },
        onUpdate: () => {
          el.textContent = format(proxy.n);
        },
        onComplete: () => {
          el.textContent = format(value);
        },
      });
    });
  }, [value]);

  const ink = on === "ink";
  return (
    <div className="flex flex-col gap-1.5">
      <p className={`font-mono text-display-m font-semibold tabular-nums ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
        <span ref={numberRef}>{format(value)}</span>
        {suffix}
      </p>
      <p className={`font-mono text-small ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>{label}</p>
    </div>
  );
}
