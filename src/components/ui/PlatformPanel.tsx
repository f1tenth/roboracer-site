import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { PlatformRow } from "../../lib/data";

type PlatformPanelProps = {
  rows: PlatformRow[];
};

// Intrinsic media dimensions (16/10 frame; the encodes are 960 wide clips and
// 1200 wide stills, both letterboxed by object-cover).
const MEDIA_W = 1200;
const MEDIA_H = 750;

/**
 * Platform panel (neobotics pattern, landing-v3 section 5): one large sticky
 * media frame beside the four hairline pillar rows. Hovering or focusing a row
 * swaps the media; while no pointer is over the list, the row nearest the
 * middle of the viewport drives it (this is the only mechanism on touch).
 * All four media stack in the frame and crossfade (opacity only); videos play
 * only while active. A media file that fails to load turns its layer into an
 * honest neutral frame instead of a broken icon.
 * Reduced motion: the four posters as a static 2x2 grid above the rows.
 */
export default function PlatformPanel({ rows }: PlatformPanelProps) {
  const reduced = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(0);
  const [inView, setInView] = useState(false);
  const active = hovered ?? scrolled;

  // Scroll-driven activation: the row whose center is closest to the
  // viewport's middle third wins (rows are tall enough that exactly one
  // straddles the middle on both desktop and mobile).
  useEffect(() => {
    const list = listRef.current;
    if (!list || reduced) return;
    const items = Array.from(list.querySelectorAll<HTMLLIElement>("li[data-row]"));
    if (!items.length) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestDist = Infinity;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setScrolled(best);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced, rows.length]);

  // Mount the clips only once the panel approaches the viewport.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(list);
    return () => io.disconnect();
  }, []);

  if (rows.length === 0) return null;

  const current = rows[active] ?? rows[0];

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      {/* Media column: sticky below the nav on every viewport so the frame
          stays on screen while the rows scroll past it. */}
      <div className="md:col-span-7">
        <figure className="sticky top-[84px] md:top-[104px]">
          {reduced ? (
            <div className="grid grid-cols-2 gap-3">
              {rows.map((row) => (
                <StaticPoster key={row.id} row={row} />
              ))}
            </div>
          ) : (
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100"
              aria-hidden="true"
            >
              {rows.map((row, i) => (
                <MediaLayer key={row.id} row={row} active={i === active} mount={inView} />
              ))}
            </div>
          )}
          <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
            <span className="text-text-strong">
              {reduced ? "Build, Learn, Race, Research" : current.media.caption}
            </span>
            {!reduced && current.media.credit && (
              <span className="text-text-muted">{current.media.credit}</span>
            )}
          </figcaption>
        </figure>
      </div>

      <ul
        ref={listRef}
        className="md:col-span-5"
        onMouseLeave={() => setHovered(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(null);
        }}
      >
        {rows.map((row, i) => {
          const isActive = i === active;
          return (
            <li
              key={row.id}
              data-row={row.id}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              className="border-t border-ink-950/10 py-8 last:border-b md:py-10"
            >
              {/* Active row = strong ink; inactive rows drop to text-muted, the
                  AA floor, instead of opacity (axe color-contrast). */}
              <div className="grid gap-3 sm:grid-cols-12 sm:gap-x-4">
                <span className="font-mono text-small text-text-muted sm:col-span-2">{row.n}</span>
                <div className="sm:col-span-10">
                  <h3
                    className={`font-display text-display-m font-semibold transition-colors duration-[var(--duration-base)] ${
                      isActive || reduced ? "text-text-strong" : "text-text-muted"
                    }`}
                  >
                    {row.title}
                  </h3>
                  <p
                    className={`mt-2 max-w-[40ch] text-body transition-colors duration-[var(--duration-base)] ${
                      isActive || reduced ? "text-text-body" : "text-text-muted"
                    }`}
                  >
                    {row.body}
                  </p>
                  <Link
                    to={row.href}
                    className="mt-4 inline-block py-1 text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2"
                  >
                    {row.linkText}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MediaLayer({ row, active, mount }: { row: PlatformRow; active: boolean; mount: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const { media } = row;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      const p = v.play();
      if (p) p.catch(() => undefined);
    } else {
      v.pause();
    }
  }, [active, mount]);

  const cls = `absolute inset-0 h-full w-full transition-opacity duration-[var(--duration-base)] [transition-timing-function:var(--ease-out-expo)] ${
    active ? "opacity-100" : "opacity-0"
  }`;

  if (failed) {
    // Honest neutral frame: the file has not landed yet (media curator).
    return (
      <div className={`${cls} flex items-end bg-paper-100 p-4`}>
        <span className="font-mono text-small text-text-muted">{row.title} media pending</span>
      </div>
    );
  }

  if (media.type === "video" && mount) {
    return (
      <video
        ref={videoRef}
        className={`${cls} object-cover`}
        src={media.src}
        poster={media.poster}
        width={MEDIA_W}
        height={MEDIA_H}
        muted
        loop
        playsInline
        preload={active ? "auto" : "metadata"}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      src={media.type === "video" ? media.poster : media.src}
      alt=""
      width={MEDIA_W}
      height={MEDIA_H}
      loading="lazy"
      decoding="async"
      className={`${cls} object-cover`}
      onError={() => setFailed(true)}
    />
  );
}

function StaticPoster({ row }: { row: PlatformRow }) {
  const [failed, setFailed] = useState(false);
  const src = row.media.type === "video" ? row.media.poster : row.media.src;
  return (
    <figure>
      <div className="aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
        {!failed && (
          <img
            src={src}
            alt={`${row.title}: ${row.media.caption}`}
            width={MEDIA_W}
            height={MEDIA_H}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption className="mt-1 font-mono text-eyebrow tracking-normal text-text-muted">{row.media.caption}</figcaption>
    </figure>
  );
}
