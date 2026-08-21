type MediaFrameProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS aspect-ratio override, e.g. "16 / 9"; defaults to width/height. */
  aspect?: string;
  /** Above-the-fold media loads eagerly; everything else is lazy. */
  priority?: boolean;
  className?: string;
};

/** Image frame with mandatory dimensions (no layout shift), lazy loading,
 * and the media radius. Video belongs to VideoHero / HighlightReel. */
export default function MediaFrame({
  src,
  alt,
  width,
  height,
  aspect,
  priority = false,
  className = "",
}: MediaFrameProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`w-full rounded-media object-cover ${className}`}
      style={aspect ? { aspectRatio: aspect } : undefined}
    />
  );
}
