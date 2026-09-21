import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

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

/** Image (or muted loop) frame with mandatory dimensions (no layout shift),
 * lazy loading, and the media radius. Scroll-driven video belongs to
 * HeroChapter / HighlightReel; this is for a card or a figure. */
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
  const cls = `w-full object-cover ${radius === "media" ? "rounded-media" : ""} ${className}`;
  const style = aspect ? { aspectRatio: aspect } : undefined;

  if (video && !reduced) {
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
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cls}
      style={style}
    />
  );
}
