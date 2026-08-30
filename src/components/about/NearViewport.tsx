import { useEffect, useRef, useState, type ReactNode } from "react";

type NearViewportProps = {
  /** Reserved height while the block is still a placeholder. */
  minHeight?: string;
  /** How far ahead of the viewport the block mounts. */
  rootMargin?: string;
  children: ReactNode;
};

/**
 * Mounts its children only once the reader is close to them.
 *
 * About needs this for the shared <CommunityJoin> block. That block's
 * "from the community" marquee holds a real autoplaying <video>, and Marquee
 * renders each child four times (two tracks, each holding its items twice for
 * a seamless loop), so mounting it eagerly downloads
 * media/join/join-openrobotics-post-960.mp4 four times: 4.1 MB before the
 * reader has scrolled at all. The landing does not pay this because its own
 * chapters gate themselves; About's sections are plain, so the gate lives
 * here. Filed for the shared component in docs/qa/requests-about.md.
 *
 * The swap happens 800px below the viewport and only ever grows the page
 * downwards, so nothing the reader is looking at moves.
 */
export default function NearViewport({
  minHeight = "60svh",
  rootMargin = "800px 0px",
  children,
}: NearViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
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
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  if (near) return <>{children}</>;
  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
}
