import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, DESKTOP_QUERY, ScrollTrigger } from "../../lib/motion";
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
const PIN_QUERY = `(prefers-reduced-motion: no-preference) and ${DESKTOP_QUERY}`;
/** Motion is fine but there is no pin: phones and landscape phones. The dial
 * turns with the section's own scroll instead. */
const ROLL_QUERY = "(prefers-reduced-motion: no-preference) and (max-width: 47.99rem), (prefers-reduced-motion: no-preference) and (max-height: 33.99rem)";

/** The pillar dial (Cedric, v1.0: "only one of Build / Learn ... next to the
 * media, and it scrolls like the seconds on an alarm clock, same as the
 * competition wheel on the map"). Row i sits STEP px from the active one,
 * shrinking and cooling with distance; only the active row carries its body
 * and link, in a fixed block under the dial, so nothing overlaps and the
 * whitespace of the old 2x2 grid is gone. */
const DIAL_SCALE = [1, 0.66, 0.52, 0.44];
/** Offsets compress outward (the far rows are small, so they need less room
 * than a full step) and cap at 2.2 steps, which keeps the dial box short:
 * 4.4 steps of travel plus one row, instead of the whitespace of a linear
 * stack. */
const DIAL_OFFSET = [0, 1, 1.65, 2.2];
const dialTone = (d: number) => (d === 0 ? "text-text-strong" : d === 1 ? "text-text-body" : "text-text-muted");

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Which row a 0-1 progress lights: equal bands, one per row. */
function activeRowAt(progress: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

const HAVE_FUTURE_DATA = 3;

type LayerState = "active" | "next" | "idle";

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
 * Tile surfaces (md and up). Selection is colour only: the active tile takes
 * a faint violet fill and a violet hairline, the others stay flat paper
 * behind ink hairlines. Violet is the site's one interactive accent
 * (index.css: solid Button fill, hover underline, focus ring); magenta and
 * cyan are logo-only. 8 percent keeps text-muted above AA on the fill
 * (4.8:1 on paper-50), 30 percent makes the rule readable without turning it
 * into a frame. No scale, shadow, glow or translate: the fill "lights up"
 * and nothing moves.
 */
// Cedric, 2026-08-22, third pass: no box outline; the selected tile sits on
// a light, very transparent violet cloud (a radial tint that fades to
// nothing by 72 percent of the tile), and only the tint's opacity animates.
// The violet cloud sits behind the lit title only, sized from the title's own
// box (Cedric, v1.0: "centred with the title, not extended all the way to the
// right, and a tinge less opaque").
const CLOUD =
  "pointer-events-none absolute -inset-x-[0.9em] -inset-y-[0.5em] hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_center,var(--cloud)_0%,transparent_70%)] transition-opacity duration-[var(--duration-base)] desktop:block";
const CLOUD_VARS = { "--cloud": "color-mix(in oklab, var(--color-rr-violet) 7%, transparent)" } as CSSProperties;

/** Colour-only transition shared by the tile and the text inside it. */
const FADE_COLORS = "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)]";
const ROW_LINK =
  "mt-4 inline-block w-fit py-1 text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/**
 * Platform panel (landing-v4 section 5): one media frame beside the four
 * pillar tiles. On desktop the panel pins for 300vh (sticky viewport over a
 * 300vh wrapper, the PinnedChapter pattern) and scroll progress alone drives
 * it: four equal bands, a 0.04 crossfade at each boundary, the active tile
 * lit. Hover and focus never change the active tile; the tile links keep
 * working and keyboard users reach every tile by scrolling. The active layer
 * plays, the next layer preloads, inactive layers pause.
 * The tiles sit in a 2x2 grid beside the frame (Build, Learn, Race, Research
 * in reading order; one column between md and lg where the 5/12 column is
 * too narrow for two) and stretch to the pinned height, so the chapter fills
 * tall viewports with tiles instead of a band of air below a list.
 * Under md: posters inline per tile, hairline rows, no pin, no video.
 * Reduced motion: the four posters as a static 2x2 grid beside the tiles, all
 * tiles at full emphasis, no pin, no crossfade, no video.
 */
export default function PlatformPanel({ rows, header }: PlatformPanelProps) {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const count = rows.length;

  // Pin choreography: progress over the wrapper is the only input. The
  // opacities are written straight to the layers (opacity only) and the
  // active index is React state for the tile emphasis and the caption.
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
      // No pin (phone, landscape phone): the dial turns as the section
      // passes through the viewport.
      mm.add(ROLL_QUERY, () => {
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
          start: "top 75%",
          end: "bottom 25%",
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
        return () => setActive(0);
      });
    },
    { scope: wrapRef, dependencies: [count], revertOnUpdate: true },
  );

  // Mount the clips once the panel approaches the viewport. Keyed on the row
  // count: the first render has no rows (the JSON is still loading), so an
  // observer created then would have nothing to watch.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || count === 0) return;
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
  }, [count]);

  if (count === 0) return null;

  const current = rows[active] ?? rows[0];
  const next = Math.min(count - 1, active + 1);
  const mount = mounted;

  return (
    <div ref={wrapRef} data-platform-pin className={reduced ? undefined : "desktop:motion-safe:min-h-[300vh]"}>
      <div
        className={
          reduced
            ? undefined
            : "desktop:motion-safe:sticky desktop:motion-safe:top-0 desktop:motion-safe:flex desktop:motion-safe:flex-col desktop:motion-safe:min-h-svh desktop:motion-safe:pt-[calc(5.3125rem+2.5rem)] desktop:motion-safe:pb-10 desktop:motion-safe:[@media(max-height:940px)]:pt-[calc(5.3125rem+1.5rem)] desktop:motion-safe:[@media(max-height:940px)]:pb-6 desktop:motion-safe:[@media(max-height:820px)]:pt-[calc(5.3125rem+0.5rem)] desktop:motion-safe:[@media(max-height:820px)]:pb-4"
        }
      >
        {/* Toward the edges (Cedric): the panel runs on the same 1,800 px bleed
            as the map; the Section itself is `bleed`. */}
        <div className="mx-auto grid w-full max-w-page gap-10 px-6 [--dial-row:3.5rem] [--dial-step:2.9rem] desktop:my-auto desktop:grid-cols-12 desktop:gap-x-12 desktop:gap-y-8 desktop:[@media(max-height:820px)]:gap-y-5 desktop:[--dial-row:min(5.5rem,8svh)] desktop:[--dial-step:min(4.75rem,6.4svh)]">
          {/* One header element for every layout: row 1 of the left column on
              desktop (the tiles span both rows), the top of the stack under md. */}
          {header && <div className="desktop:col-span-12">{header}</div>}
          {/* Desktop: the media frame under the header. Under md the list has
              no frame; each tile carries its own poster instead. The split is
              7/5 from lg; between md and lg it is 6/6 so two tiles fit side
              by side (a one-column stack of four tiles outgrows a tablet). */}
          <div className="desktop:col-span-7 desktop:self-start">
            <figure>
              {reduced ? (
                <div className="grid grid-cols-2 gap-3">
                  {rows.map((row) => (
                    <StaticPoster key={row.id} row={row} />
                  ))}
                </div>
              ) : (
                <div
                  className="relative aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 desktop:aspect-auto desktop:h-[42svh]"
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
              </figcaption>
            </figure>
          </div>

          {/* The pillar dial: the active pillar reads full size beside the
              media, its neighbours roll above and below it, and its body and
              link sit in a fixed block underneath. Reduced motion gets the
              plain list instead. */}
          <div className="desktop:col-span-5 desktop:self-center">
            {reduced ? (
              <ul className="flex flex-col">
                {rows.map((row) => (
                  <li key={row.id} data-row={row.id} className="border-t border-ink-950/10 py-6 last:border-b">
                    <span className="font-mono text-small text-text-muted">{row.n}</span>
                    <h3 className="mt-2 font-display text-display-m font-semibold text-text-strong">{row.title}</h3>
                    <p className="mt-2 max-w-[46ch] text-body text-text-body">{row.body}</p>
                    <Link to={row.href} className={ROW_LINK}>
                      {row.linkText}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div
                  className="relative"
                  style={{ height: "calc(4.4 * var(--dial-step) + var(--dial-row))" }}
                  role="list"
                  aria-label="Build, Learn, Race, Research"
                >
                  {rows.map((row, i) => {
                    const d = Math.abs(i - active);
                    const lit = i === active;
                    return (
                      <div
                        key={row.id}
                        data-row={row.id}
                        data-active={lit ? "true" : undefined}
                        role="listitem"
                        className="absolute inset-x-0 top-1/2 origin-left transition-[transform,color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]"
                        style={{
                          transform: `translateY(calc(-50% + ${(i < active ? -1 : 1) * DIAL_OFFSET[Math.min(d, 3)]} * var(--dial-step))) scale(${DIAL_SCALE[Math.min(d, 3)]})`,
                          ...CLOUD_VARS,
                        }}
                      >
                        <p className={`relative font-mono text-small ${FADE_COLORS} text-text-muted`}>{row.n}</p>
                        <h3 className={`font-display text-display-l font-semibold ${FADE_COLORS} ${dialTone(d)}`}>
                          <span className="relative inline-block">
                            <span aria-hidden="true" className={`${CLOUD} ${lit ? "opacity-100" : "opacity-0"}`} />
                            <span className="relative">{row.title}</span>
                          </span>
                        </h3>
                      </div>
                    );
                  })}
                </div>
                {/* One body and link at a time, in a block that never resizes. */}
                <div className="mt-6 min-h-[8.5rem] border-t border-ink-950/10 pt-5 [@media(max-height:820px)]:mt-4 [@media(max-height:820px)]:min-h-[7rem] [@media(max-height:820px)]:pt-4">
                  <p className={`max-w-[46ch] text-body text-text-body ${FADE_COLORS}`}>{current.body}</p>
                  <Link to={current.href} className={ROW_LINK}>
                    {current.linkText}
                  </Link>
                </div>
              </>
            )}
          </div>
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
