import { useEffect, useId, useRef, useState } from "react";
import PauseToggle from "../ui/PauseToggle";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type LoopTileProps = {
  /** The still: shown until the loop is near the screen, and the only frame
   * under reduced motion. It is also the loop's first frame. */
  poster: { src: string; width: number; height: number; alt: string };
  /** The loop, WebM first, MP4 as the fallback. */
  video: { webm: string; mp4: string };
  className?: string;
};

/** How far below the screen the loop starts loading. */
const NEAR = "40% 0px";

/**
 * A muted, looping clip in a tile, like a GIF but a fraction of the weight.
 * The still holds the box until the tile comes within reach of the screen,
 * then the <video> takes its place (same size, same first frame, so nothing
 * moves). A Pause button sits in the corner (WCAG 2.2.2: motion longer than
 * 5 seconds can be stopped). Reduced motion keeps the still.
 */
export default function LoopTile({ poster, video, className = "" }: LoopTileProps) {
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [paused, setPaused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const id = useId();

  useEffect(() => {
    const el = boxRef.current;
    if (reduced || near || !el) return;
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
      { rootMargin: NEAR },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, near]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const live = near && !reduced;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      {live ? (
        <video
          ref={videoRef}
          id={id}
          className="block h-auto w-full"
          width={poster.width}
          height={poster.height}
          poster={poster.src}
          aria-label={poster.alt}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      )}
      {live && (
        <PauseToggle
          always
          paused={paused}
          onToggle={toggle}
          controls={id}
          className="absolute bottom-3 right-3 border-text-on-ink/30! bg-ink-950/70 text-text-on-ink! hover:border-text-on-ink/60!"
        />
      )}
    </div>
  );
}
