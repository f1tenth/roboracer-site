import type { ReactNode } from "react";

type MarqueeProps = {
  /** Loop duration in seconds (design system: 40-60s). */
  duration?: number;
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * CSS-only logo marquee (.rr-marquee in index.css). The -50% keyframe is
 * seamless only if each track is internally periodic, so every track holds
 * the items twice (`display: contents` keeps the clones in the track's flex
 * flow; `.rr-marquee-clone` disappears under prefers-reduced-motion, where
 * the first track wraps into a static grid and the second track is hidden).
 */
export default function Marquee({ duration = 50, label, className = "", children }: MarqueeProps) {
  const style = { "--rr-marquee-duration": `${duration}s` } as React.CSSProperties;
  const track = (hidden: boolean) => (
    <div className="rr-marquee-track items-center gap-12 pr-12" aria-hidden={hidden || undefined}>
      {children}
      <div className="rr-marquee-clone contents" aria-hidden="true">
        {children}
      </div>
    </div>
  );
  return (
    <div className={`rr-marquee ${className}`} role="group" aria-label={label} style={style}>
      {track(false)}
      {track(true)}
    </div>
  );
}
