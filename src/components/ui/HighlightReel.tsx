import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { Highlight } from "../../lib/data";

type HighlightReelProps = {
  items: Highlight[];
};

// Shared tile geometry: row height clamp per the landing-v2 spec; width
// follows each tile's declared aspect.
const ROW_H = "h-[clamp(160px,22vh,260px)]";
const ASPECT: Record<Highlight["aspect"], string> = {
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
};
// Intrinsic dimensions for media elements (CLS: the box is fixed by CSS, but
// width/height stay set per the media conventions).
const DIMS: Record<Highlight["aspect"], { w: number; h: number }> = {
  "16/9": { w: 1600, h: 900 },
  "3/2": { w: 1500, h: 1000 },
};

/**
 * Two-row counter-scrolling media strip (landing highlights chapter). Row 1
 * translates left, row 2 right, 52s/60s loops via the shared .rr-marquee
 * keyframes; hover or focus within pauses both rows. The -50% keyframe needs
 * each track to be internally periodic, so every track renders its items
 * twice (clones aria-hidden), plus a second aria-hidden track for ultra-wide
 * viewports. "live" tiles render real media with a mono caption below;
 * "placeholder" tiles are honest neutral frames with the caption inside.
 * Reduced motion: no translation - a static wrapped grid of the first 6.
 */
export default function HighlightReel({ items }: HighlightReelProps) {
  const reduced = usePrefersReducedMotion();
  // JSON is untyped at runtime: drop entries whose status/aspect we cannot
  // render instead of crashing mid-strip.
  const valid = items.filter(
    (i) => (i.status === "live" || i.status === "placeholder") && i.aspect in ASPECT,
  );

  if (valid.length === 0) return null;

  if (reduced) {
    return (
      <div className="flex flex-wrap justify-center gap-6 px-6">
        {valid.slice(0, 6).map((item) => (
          <Tile key={item.id} item={item} reduced />
        ))}
      </div>
    );
  }

  const mid = Math.ceil(valid.length / 2);
  return (
    <div className="flex flex-col gap-6 [&:focus-within_.rr-marquee-track]:[animation-play-state:paused]">
      <Row items={valid.slice(0, mid)} duration={52} />
      <Row items={valid.slice(mid)} duration={60} reverse />
    </div>
  );
}

type RowProps = {
  items: Highlight[];
  /** Loop duration in seconds (spec: 50-60s; rows differ so they desync). */
  duration: number;
  reverse?: boolean;
};

function Row({ items, duration, reverse = false }: RowProps) {
  const rowStyle = {
    "--rr-marquee-duration": `${duration}s`,
  } as CSSProperties;
  const trackStyle = reverse ? { animationDirection: "reverse" as const } : undefined;
  const copy = (hidden: boolean, key: string) => (
    <div className="flex shrink-0 items-start gap-6 pr-6" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <Tile key={`${key}-${item.id}`} item={item} reduced={false} />
      ))}
    </div>
  );
  return (
    <div className="rr-marquee" style={rowStyle}>
      <div className="rr-marquee-track items-start" style={trackStyle}>
        {copy(false, "a")}
        {copy(true, "b")}
      </div>
      <div className="rr-marquee-track items-start" style={trackStyle} aria-hidden="true">
        {copy(true, "c")}
        {copy(true, "d")}
      </div>
    </div>
  );
}

function Tile({ item, reduced }: { item: Highlight; reduced: boolean }) {
  if (item.status === "placeholder") {
    // Same figure/caption skeleton as live tiles so both row edges stay
    // flush (impeccable review 2026-08-21): honest empty frame, mono
    // caption below.
    return (
      <figure className="shrink-0">
        <div
          className={`${ROW_H} ${ASPECT[item.aspect]} rounded-media border border-ink-950/10 bg-paper-100`}
        />
        <figcaption className="mt-2 font-mono text-small text-text-muted">{item.caption}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="shrink-0">
      <div
        className={`${ROW_H} ${ASPECT[item.aspect]} overflow-hidden rounded-media border border-ink-950/10`}
      >
        {item.type === "video" && !reduced ? <LazyLoopVideo item={item} /> : <TileImage item={item} />}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
        <span className="text-text-strong">{item.caption}</span>
        {item.credit && <span className="text-text-muted">{item.credit}</span>}
      </figcaption>
    </figure>
  );
}

function TileImage({ item }: { item: Highlight }) {
  const dims = DIMS[item.aspect];
  // Reduced-motion videos fall back to their poster frame.
  const src = item.type === "video" ? item.poster : item.src;
  return (
    <img
      src={src}
      alt=""
      width={dims.w}
      height={dims.h}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  );
}

function LazyLoopVideo({ item }: { item: Highlight }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const dims = DIMS[item.aspect];

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
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {inView ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={item.poster}
          width={dims.w}
          height={dims.h}
          aria-hidden="true"
        >
          <source src={item.src} type="video/mp4" />
        </video>
      ) : (
        <TileImage item={item} />
      )}
    </div>
  );
}
