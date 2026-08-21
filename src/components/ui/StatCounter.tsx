import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK_QUERY } from "../../lib/motion";

type StatCounterProps = {
  value: number;
  /** Rendered after the number: "+", "%", ... */
  suffix?: string;
  label: string;
  on?: "ink" | "paper";
};

/**
 * Counter pattern: counts up once in view, 1.2s ease-out. The final number
 * is in the markup from the first render, so no-JS and reduced-motion
 * visitors always see it; the animation only replays the climb.
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
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
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
    <div className="flex flex-col gap-2">
      <p
        className={`font-display text-display-m font-semibold tabular-nums ${ink ? "text-text-on-ink" : "text-text-strong"}`}
      >
        <span ref={numberRef}>{format(value)}</span>
        {suffix}
      </p>
      <p className={`eyebrow ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>{label}</p>
    </div>
  );
}
