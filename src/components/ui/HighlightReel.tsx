import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export type HighlightItem = {
  /** MP4 loop; poster is mandatory (media skill). */
  src: string;
  poster: string;
  caption: string;
  credit?: string;
  width: number;
  height: number;
};

type HighlightReelProps = {
  items: HighlightItem[];
};

/**
 * 2-4 short muted loops in a staggered two-column masonry with captions.
 * Reduced motion: posters only. Placeholder media is allowed here only
 * until Cedric swaps real clips in (template per docs/PLAN.md).
 */
export default function HighlightReel({ items }: HighlightReelProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.slice(0, 4).map((item, i) => (
        <li key={item.caption} className={i % 2 === 1 ? "sm:mt-12" : undefined}>
          <figure>
            <div className="overflow-hidden rounded-media border border-ink-700 bg-ink-800">
              {reduced ? (
                <img
                  src={item.poster}
                  alt=""
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-cover"
                />
              ) : (
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
              )}
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-small font-semibold text-text-on-ink">{item.caption}</span>
              {item.credit && <span className="text-eyebrow text-text-on-ink-muted">{item.credit}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
