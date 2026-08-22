import type { ReactNode } from "react";

type MarqueeProps = {
  /** Loop duration in seconds (design system: 40-60s). */
  duration?: number;
  /** Loop duration from md up, when the track is wider there (the partner
   * ribbon at 1.5x keeps the same px/s with 82s over 55s). */
  durationMd?: number;
  label: string;
  className?: string;
  /** Flex gap between items (Tailwind class). */
  gap?: string;
  /** Items; when a function, it is called with `{ clone }` so interactive
   * children can set `tabIndex={-1}` on their clones. */
  children: ReactNode | ((opts: { clone: boolean }) => ReactNode);
};

/**
 * CSS-only marquee (.rr-marquee in index.css). The -50% keyframe is seamless
 * only if each track is internally periodic, so every track holds the items
 * twice. Clones and the second track are `aria-hidden`, and a render-prop
 * child can drop its clone links from the tab order, so interactive children
 * (the partner ribbon's logo links) are reachable exactly once by keyboard
 * while every copy stays live for the pointer (`inert` killed hover and
 * clicks for the last quarter of every loop). The animation pauses
 * on hover (index.css) and on focus-within (here) so a focused link holds
 * still (both rules live in index.css: the unlayered `.rr-marquee-track
 * { animation }` shorthand would beat a layered utility). `.rr-marquee-clone` disappears under prefers-reduced-motion, where
 * the first track wraps into a static grid and the second is hidden.
 */
export default function Marquee({ duration = 50, durationMd, label, className = "", gap = "gap-12 pr-12", children }: MarqueeProps) {
  const style = {
    "--rr-marquee-duration": `${duration}s`,
    "--rr-marquee-duration-md": `${durationMd ?? duration}s`,
  } as React.CSSProperties;
  const render = (clone: boolean) => (typeof children === "function" ? children({ clone }) : children);
  const track = (hidden: boolean) => (
    <div className={`rr-marquee-track items-center ${gap}`} aria-hidden={hidden || undefined}>
      {render(hidden)}
      <div className="rr-marquee-clone contents" aria-hidden="true">
        {render(true)}
      </div>
    </div>
  );
  return (
    <div
      className={`rr-marquee ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      {track(false)}
      {track(true)}
    </div>
  );
}
