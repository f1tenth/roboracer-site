import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export type HighlightItem =
  | {
      kind?: "video";
      src: string;
      poster: string;
      caption: string;
      credit?: string;
      width: number;
      height: number;
    }
  | {
      /** Explicitly reserved slot: rendered as an honest empty frame with a
       * mono label, never fake media (photos pending from Cedric). */
      kind: "slot";
      caption: string;
    };

type HighlightReelProps = {
  items: HighlightItem[];
};

/**
 * Highlights on paper: media at 6px radius inside hairline frames, mono
 * captions and credits, staggered two-column rhythm. Videos mount behind an
 * IntersectionObserver; reduced motion shows posters.
 */
export default function HighlightReel({ items }: HighlightReelProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.slice(0, 4).map((item, i) => (
        <li key={item.caption} className={i % 2 === 1 ? "sm:mt-12" : undefined}>
          <figure>
            {item.kind === "slot" ? (
              <div className="flex aspect-video w-full items-center justify-center rounded-media border border-dashed border-ink-950/20">
                <p className="font-mono text-small text-text-muted">photo slot reserved</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-media border border-ink-950/10">
                {reduced ? <PosterImg item={item} /> : <LazyLoopVideo item={item} />}
              </div>
            )}
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 font-mono text-small">
              <span className="text-text-strong">{item.caption}</span>
              {item.kind !== "slot" && item.credit && <span className="text-text-muted">{item.credit}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

type VideoItem = Extract<HighlightItem, { kind?: "video" }>;

function PosterImg({ item }: { item: VideoItem }) {
  return (
    <img
      src={item.poster}
      alt=""
      width={item.width}
      height={item.height}
      loading="lazy"
      decoding="async"
      className="aspect-video w-full object-cover"
    />
  );
}

function LazyLoopVideo({ item }: { item: VideoItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {inView ? (
        <video
          className="aspect-video w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={item.poster}
          width={item.width}
          height={item.height}
          aria-hidden="true"
        >
          <source src={item.src} type="video/mp4" />
        </video>
      ) : (
        <PosterImg item={item} />
      )}
    </div>
  );
}
