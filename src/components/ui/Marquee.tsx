import type { ReactNode } from "react";

type MarqueeProps = {
  /** Loop duration in seconds (design system: 40-60s). */
  duration?: number;
  label: string;
  className?: string;
  /** Flex gap between items (Tailwind class). */
  gap?: string;
  children: ReactNode;
};

/**
 * CSS-only marquee (.rr-marquee in index.css). The -50% keyframe is seamless
 * only if each track is internally periodic, so every track holds the items
 * twice. Clones and the second track are `inert` (out of the tab order and
 * the accessibility tree) so interactive children - the partner ribbon's
 * logo links - are reachable exactly once by keyboard. The animation pauses
 * on hover (index.css) and on focus-within (here) so a focused link holds
 * still. `.rr-marquee-clone` disappears under prefers-reduced-motion, where
 * the first track wraps into a static grid and the second is hidden.
 */
export default function Marquee({ duration = 50, label, className = "", gap = "gap-12 pr-12", children }: MarqueeProps) {
  const style = { "--rr-marquee-duration": `${duration}s` } as React.CSSProperties;
  const track = (hidden: boolean) => (
    <div className={`rr-marquee-track items-center ${gap}`} aria-hidden={hidden || undefined} inert={hidden || undefined}>
      {children}
      <div className="rr-marquee-clone contents" aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
  return (
    <div
      className={`rr-marquee [&:focus-within_.rr-marquee-track]:[animation-play-state:paused] ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      {track(false)}
      {track(true)}
    </div>
  );
}
