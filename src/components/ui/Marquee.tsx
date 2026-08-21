import type { ReactNode } from "react";

type MarqueeProps = {
  /** Loop duration in seconds (design system: 40-60s). */
  duration?: number;
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * CSS-only logo marquee (.rr-marquee in index.css). The track is duplicated
 * for a seamless loop; the clone is aria-hidden and disappears under
 * prefers-reduced-motion, where the first track wraps into a static grid.
 */
export default function Marquee({ duration = 50, label, className = "", children }: MarqueeProps) {
  const style = { "--rr-marquee-duration": `${duration}s` } as React.CSSProperties;
  return (
    <div className={`rr-marquee ${className}`} role="group" aria-label={label} style={style}>
      <div className="rr-marquee-track items-center gap-12 pr-12">{children}</div>
      <div className="rr-marquee-track items-center gap-12 pr-12" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
