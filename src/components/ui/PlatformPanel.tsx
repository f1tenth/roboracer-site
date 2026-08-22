import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, ScrollTrigger } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { PlatformRow } from "../../lib/data";

type PlatformPanelProps = {
  rows: PlatformRow[];
  /** The section header (eyebrow, title, lead). It renders inside the pinned
   * composition, above the media frame, so the chapter never shows a blank
   * band between a header outside the pin and the content centred inside it
   * (Cedric, 2026-08-22: "big white gap"). Under md it sits above the list. */
  header?: ReactNode;
};

// Intrinsic media dimensions (16/10 frame; the encodes are 960 wide clips and
// 1200 wide stills, both letterboxed by object-cover).
const MEDIA_W = 1200;
const MEDIA_H = 750;

/**
 * Desktop pin length: the wrapper is 300vh tall (the `md:motion-safe:min-h-[300vh]`
 * class below) and the sticky viewport is 100vh, so the panel travels 200vh
 * of scroll. Progress 0-1 over that travel is the only input to the panel.
 */
/** Width of each opacity crossfade in pin progress, centred on a boundary. */
const FADE = 0.04;
/**
 * The pin runs only where the sticky layout applies: Tailwind's `md` (48rem)
 * and motion-safe. Under md the rows carry inline posters; under reduced
 * motion the posters stack in a static grid.
 */
const PIN_QUERY = "(prefers-reduced-motion: no-preference) and (min-width: 48rem)";

const HAVE_FUTURE_DATA = 3;

type LayerState = "active" | "next" | "idle";

function subscribePin(onChange: () => void) {
  const mql = window.matchMedia(PIN_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
const getPin = () => window.matchMedia(PIN_QUERY).matches;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Active row for a 0-1 pin progress: equal bands, the boundary is the
 * midpoint of the crossfade. */
function activeRowAt(progress: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

/** Opacity of layer i at a 0-1 progress: 1 inside its band, linear ramps of
 * width FADE centred on the boundaries it shares with its neighbours. */
function layerOpacityAt(i: number, progress: number, count: number): number {
  const half = FADE / 2;
  let o = 1;
  if (i > 0) o = Math.min(o, clamp01((progress - (i / count - half)) / FADE));
  if (i < count - 1) o = Math.min(o, clamp01(((i + 1) / count + half - progress) / FADE));
  return o;
}

/**
 * Platform panel (landing-v4 section 5): one media frame beside the four
 * hairline pillar rows. On desktop the panel pins for 300vh (sticky viewport
 * over a 300vh wrapper, the PinnedChapter pattern) and scroll progress alone
 * drives it: four equal bands, a 0.04 crossfade at each boundary, the active
 * row emphasised. Hover and focus never change the active row; the row links
 * keep working and keyboard users reach every row by scrolling. The active
 * layer plays, the next layer preloads, inactive layers pause.
 * Under md: posters inline per row, no pin, no video.
 * Reduced motion: the four posters as a static 2x2 grid beside the rows, all
 * rows at full emphasis, no pin, no crossfade, no video.
 */
export default function PlatformPanel({ rows, header }: PlatformPanelProps) {
  const reduced = usePrefersReducedMotion();
  const pinned = useSyncExternalStore(subscribePin, getPin, () => false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const count = rows.length;

  // Pin choreography: progress over the wrapper is the only input. The
  // opacities are written straight to the layers (opacity only) and the
  // active index is React state for the row emphasis and the caption.
  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap || count < 2) return;
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-platform-layer]", wrap);
        if (layers.length < 2) return;
        const apply = (progress: number) => {
          layers.forEach((layer, i) => {
            layer.style.opacity = String(layerOpacityAt(i, progress, layers.length));
          });
          setActive(activeRowAt(progress, layers.length));
        };
        ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
        return () => {
          layers.forEach((layer, i) => {
            layer.style.opacity = i === 0 ? "1" : "0";
          });
          setActive(0);
        };
      });
    },
    { scope: wrapRef, dependencies: [count], revertOnUpdate: true },
  );

  // Mount the clips once the panel approaches the viewport. Keyed on the row
  // count: the first render has no rows (the JSON is still loading), so an
  // observer created then would have nothing to watch.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || count === 0 || !pinned) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [count, pinned]);

  if (count === 0) return null;

  const current = rows[active] ?? rows[0];
  const next = Math.min(count - 1, active + 1);
  const mount = pinned && mounted;
  // The active marker exists only where progress drives it (desktop, motion
  // OK); under md and under reduced motion every row is the same.
  const marked = pinned && !reduced;

  return (
    <div ref={wrapRef} data-platform-pin className={reduced ? undefined : "md:motion-safe:min-h-[300vh]"}>
      <div
        className={
          reduced
            ? undefined
            : "md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:flex md:motion-safe:flex-col md:motion-safe:min-h-svh md:motion-safe:pt-[calc(85px+2.5rem)] md:motion-safe:pb-10 md:motion-safe:[@media(max-height:940px)]:pt-[85px] md:motion-safe:[@media(max-height:940px)]:pb-4"
        }
      >
        <div className="grid w-full gap-10 md:flex-1 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-12">
          {/* One header element for every layout: row 1 of the left column on
              desktop (the list spans both rows), the top of the stack under md. */}
          {header && <div className="md:col-span-7 md:self-start">{header}</div>}
          {/* Desktop: the media frame under the header. Under md the list has
              no frame; each row carries its own poster instead. */}
          <div className="hidden md:col-span-7 md:block md:self-center">
            <figure>
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
                    <div
                      key={row.id}
                      data-platform-layer
                      className="absolute inset-0"
                      style={{ opacity: i === 0 ? 1 : 0 }}
                    >
                      <MediaLayer
                        row={row}
                        state={i === active ? "active" : i === next ? "next" : "idle"}
                        mount={mount}
                      />
                    </div>
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

          {/* The list stretches to the pinned height and each row takes an equal
              share, so the chapter fills tall viewports instead of leaving a
              band below the rows (Cedric, 2026-08-22). */}
          <ul className="md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:flex md:flex-col">
            {rows.map((row, i) => {
              const isActive = i === active;
              return (
                <li
                  key={row.id}
                  data-row={row.id}
                  data-active={marked && isActive ? "true" : undefined}
                  className="border-t border-ink-950/10 py-8 last:border-b md:flex md:flex-1 md:flex-col md:justify-center md:py-5 md:[@media(max-height:820px)]:py-3"
                >
                  <div className="mb-5 md:hidden">
                    <RowPoster row={row} />
                  </div>
                  {/* Active row = strong ink; inactive rows drop to text-muted,
                      the AA floor, instead of opacity (axe color-contrast). */}
                  <div className="grid gap-3 sm:grid-cols-12 sm:gap-x-4">
                    <span className="font-mono text-small text-text-muted sm:col-span-2">{row.n}</span>
                    <div className="sm:col-span-10">
                      <h3
                        className={`font-display text-display-m font-semibold transition-colors duration-[var(--duration-base)] ${
                          isActive || reduced ? "text-text-strong" : "text-text-strong md:text-text-muted"
                        }`}
                      >
                        {row.title}
                      </h3>
                      <p
                        className={`mt-2 max-w-[40ch] text-body transition-colors duration-[var(--duration-base)] ${
                          isActive || reduced ? "text-text-body" : "text-text-body md:text-text-muted"
                        }`}
                      >
                        {row.body}
                      </p>
                      <Link
                        to={row.href}
                        className="mt-4 inline-block py-1 text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2 md:[@media(max-height:820px)]:mt-2"
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
      </div>
    </div>
  );
}

/**
 * One layer of the desktop frame. Videos mount only once `mount` is true;
 * the active layer plays (after `canplay` when it has no future data yet),
 * the next layer preloads in full, idle layers pause. A video that errors
 * falls back to its poster; a poster that errors becomes an honest neutral
 * frame.
 */
function MediaLayer({ row, state, mount }: { row: PlatformRow; state: LayerState; mount: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const { media } = row;
  const isVideo = media.type === "video" && mount && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (state !== "active") {
      v.pause();
      return;
    }
    const start = () => {
      const p = v.play();
      if (p) {
        p.catch((err: unknown) => {
          // AbortError is the normal "paused before it started" case.
          if (import.meta.env.DEV && !(err instanceof DOMException && err.name === "AbortError")) {
            console.warn(`[PlatformPanel] ${row.id}: play() rejected`, err);
          }
        });
      }
    };
    if (v.readyState >= HAVE_FUTURE_DATA) {
      start();
      return;
    }
    v.addEventListener("canplay", start, { once: true });
    return () => v.removeEventListener("canplay", start);
  }, [state, isVideo, row.id]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={media.src}
        poster={media.poster}
        width={MEDIA_W}
        height={MEDIA_H}
        muted
        loop
        playsInline
        preload={state === "idle" ? "metadata" : "auto"}
        onError={(e) => {
          const err = e.currentTarget.error;
          if (import.meta.env.DEV) {
            console.error(`[PlatformPanel] ${row.id}: video error`, err?.code, err?.message, media.src);
          }
          setVideoFailed(true);
        }}
      />
    );
  }

  if (imgFailed) {
    // Honest neutral frame: the file has not landed yet (media curator).
    return (
      <div className="flex h-full w-full items-end bg-paper-100 p-4">
        <span className="font-mono text-small text-text-muted">{row.title} media pending</span>
      </div>
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
      className="h-full w-full object-cover"
      onError={() => setImgFailed(true)}
    />
  );
}

/** Mobile: the row's poster inline (no clip playback on phones, no sticky). */
function RowPoster({ row }: { row: PlatformRow }) {
  const [failed, setFailed] = useState(false);
  const src = row.media.type === "video" ? row.media.poster : row.media.src;
  return (
    <figure>
      <div className="aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
        {!failed && (
          <img
            src={src}
            alt=""
            width={MEDIA_W}
            height={MEDIA_H}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
        <span className="text-text-strong">{row.media.caption}</span>
        {row.media.credit && <span className="text-text-muted">{row.media.credit}</span>}
      </figcaption>
    </figure>
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
