import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { PlatformRow } from "../../lib/data";

type PlatformListProps = {
  rows: PlatformRow[];
};

/** Intrinsic size of every platform clip, still and poster (16/10). */
const MEDIA_W = 1200;
const MEDIA_H = 750;
/** HTMLMediaElement.HAVE_FUTURE_DATA */
const HAVE_FUTURE_DATA = 3;

/**
 * One row's media, with the landing's behaviour (PlatformPanel.MediaLayer):
 * a muted, looping, inline video with its poster underneath it. `muted` and
 * `playsInline` are what let a browser autoplay at all, and `playsInline` is
 * what stops iOS taking the clip fullscreen.
 *
 * Three things keep it honest on a long reading page:
 *  - the video only mounts after the first paint, so the poster is what the
 *    reader sees while the page settles;
 *  - it only mounts, loads and plays once the row is within 200px of the
 *    viewport, and pauses again when it leaves - four clips are 2.6 MB, and a
 *    reader who stops at People never pays for them;
 *  - under prefers-reduced-motion no video is created at all: the poster is
 *    the media (CLAUDE.md rule 6).
 * A video that errors falls back to its poster; a poster that errors falls
 * back to a labelled neutral surface, never a broken frame.
 */
function RowMedia({ row }: { row: PlatformRow }) {
  const { media } = row;
  const holderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || reduced) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    // Two observers: a wide one decides when the clip may load, a tight one
    // decides whether it is playing.
    const load = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          load.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    const play = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.15 },
    );
    load.observe(el);
    play.observe(el);
    return () => {
      load.disconnect();
      play.disconnect();
    };
  }, [reduced]);

  const isVideo = media.type === "video" && mounted && near && !reduced && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (!inView) {
      v.pause();
      return;
    }
    const start = () => {
      const p = v.play();
      if (p) {
        p.catch((err: unknown) => {
          // AbortError is the normal "paused before it started" case.
          if (import.meta.env.DEV && !(err instanceof DOMException && err.name === "AbortError")) {
            console.warn(`[PlatformList] ${row.id}: play() rejected`, err);
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
  }, [isVideo, inView, row.id]);

  const frame = "h-full w-full object-cover";
  const poster = media.type === "video" ? media.poster : media.src;

  return (
    <div
      ref={holderRef}
      className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-100"
      style={{ aspectRatio: `${MEDIA_W} / ${MEDIA_H}` }}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          className={frame}
          src={media.src}
          poster={poster}
          width={MEDIA_W}
          height={MEDIA_H}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${row.title}: ${media.caption}`}
          onError={(e) => {
            if (import.meta.env.DEV) {
              console.error(`[PlatformList] ${row.id}: video error`, e.currentTarget.error?.code);
            }
            setVideoFailed(true);
          }}
        />
      ) : imgFailed ? (
        <div className="flex h-full w-full items-end p-4">
          <span className="font-mono text-small text-text-muted">{row.title} media pending</span>
        </div>
      ) : (
        <img
          src={poster}
          alt={`${row.title}: ${media.caption}`}
          width={MEDIA_W}
          height={MEDIA_H}
          loading="lazy"
          decoding="async"
          className={frame}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

/**
 * The four pillars from public/data/platform.json as hairline rows: the
 * numbered mono index and the clip on the left, the sentence and the way in on
 * the right. The landing turns the same data into a pinned dial; About lays it
 * out flat, but the media plays the same way it does there (Cedric,
 * 2026-08-23).
 */
export default function PlatformList({ rows }: PlatformListProps) {
  if (rows.length === 0) return null;
  return (
    <Reveal stagger as="ol" className="flex flex-col">
      {rows.map((row) => (
        <li
          key={row.id}
          className="grid gap-6 border-t border-ink-950/10 py-8 md:grid-cols-12 md:gap-10 md:py-10"
        >
          <figure className="md:col-span-4">
            <RowMedia row={row} />
            <figcaption className="mt-2 font-mono text-small text-text-muted">
              {row.media.caption}
            </figcaption>
          </figure>
          <div className="md:col-span-8">
            <p className="flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              {row.n}
            </p>
            <h3 className="mt-3 font-display text-display-m font-semibold text-text-strong">
              {row.title}
            </h3>
            <p className="mt-3 max-w-[60ch] text-lead text-text-body">{row.body}</p>
            <p className="mt-5">
              {/* 2.75rem to tap on a touch screen; the negative margin keeps
                  the line where it was (ABOUT-07). */}
              <Link
                to={row.href}
                className="text-body font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 coarse:inline-block coarse:-my-3 coarse:py-3"
              >
                {row.linkText}
              </Link>
            </p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}
