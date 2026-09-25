import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaHold } from "../../lib/media";

type MediaFrameProps = {
  /** The image, or the poster when `video` is set. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS aspect-ratio override, e.g. "16 / 9"; defaults to width/height. */
  aspect?: string;
  /** Above-the-fold media loads eagerly; everything else is lazy. */
  priority?: boolean;
  /** An mp4: the frame becomes a muted, looping, inline video with `src` as
   * its poster; under prefers-reduced-motion the poster image renders instead. */
  video?: string;
  /** "none" for media flush inside a card that carries its own radius. */
  radius?: "media" | "none";
  className?: string;
};

/** How far outside the viewport a video frame starts loading its clip. */
const NEAR_MARGIN = "50% 0px";

/** Image (or muted loop) frame with mandatory dimensions (no layout shift),
 * lazy loading, and the media radius. Scroll-driven video belongs to
 * HeroChapter / HighlightReel; this is for a card or a figure.
 *
 * A video frame shows its poster until it comes within half a viewport of the
 * screen, then swaps in the <video> (same box, same poster, so nothing moves).
 * Before, every autoplaying frame on the landing downloaded at page load and
 * competed with the hero clip for the first seconds of bandwidth (the join
 * card's clip four times over, once per marquee copy; docs/media/HERO_PERF.md).
 * `priority` frames skip the wait and are never held. */
export default function MediaFrame({
  src,
  alt,
  width,
  height,
  aspect,
  priority = false,
  video,
  radius = "media",
  className = "",
}: MediaFrameProps) {
  const reduced = usePrefersReducedMotion();
  // While the page holds media (MediaHoldContext) nothing loads; the box
  // keeps its size.
  const hold = useMediaHold() && !priority;
  const [near, setNear] = useState(false);
  const posterRef = useRef<HTMLImageElement>(null);
  const cls = `w-full object-cover ${radius === "media" ? "rounded-media" : ""} ${className}`;
  const style = aspect ? { aspectRatio: aspect } : undefined;
  const gated = Boolean(video) && !reduced && !priority && !near;
  const live = video && !reduced && !gated && !hold;

  useEffect(() => {
    if (!gated || hold) return;
    const el = posterRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: NEAR_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gated, hold]);

  if (live) {
    return (
      <video
        className={cls}
        style={style}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={src}
        width={width}
        height={height}
        aria-label={alt}
      >
        <source src={video} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      ref={posterRef}
      src={hold ? undefined : src}
      alt={alt}
      width={width}
      height={height}
      // A video's poster stands in for the frame and loads like the poster
      // attribute did (a lazy image inside a marquee never loads).
      loading={priority || gated ? "eager" : "lazy"}
      fetchPriority={gated ? "low" : undefined}
      decoding="async"
      className={cls}
      style={style}
    />
  );
}
