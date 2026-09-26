import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReplayConfig } from "./leaderboardData";

/**
 * How the board's page lays its player out in a window of a given size, and
 * the poster captured from it. The board has no embed mode: `?compare=top5`
 * opens the player as a modal <dialog> centred over the board, so the frame
 * is given a window the player fits in without scrolling (`frame`), and only
 * the dialog's box (`crop`, centred in it) shows through the clip. All of it
 * is in the board's own CSS px, measured on 2026-09-25 with five cars
 * (docs/LEADERBOARD.md, "The replay"): at 1040 wide the dialog is its full
 * 980 x 675 (the canvas takes 58% of the window's height); at 440 it is the
 * phone layout, 402 x 647 (readout and standings in strips, controls in
 * three rows).
 */
type Fit = {
  frameW: number;
  frameH: number;
  cropW: number;
  cropH: number;
  poster: { src: string; width: number; height: number };
  /** Where the track sits in the crop, from its top (the play disc goes
   * over the cars, not over the readout). */
  trackY: string;
};

const WIDE: Fit = {
  frameW: 1040,
  frameH: 720,
  cropW: 980,
  cropH: 675,
  poster: { src: "media/race/race-leaderboard-replay-wide.webp", width: 1960, height: 1350 },
  trackY: "43%",
};

const NARROW: Fit = {
  frameW: 440,
  frameH: 720,
  cropW: 402,
  cropH: 647,
  poster: { src: "media/race/race-leaderboard-replay-narrow.webp", width: 804, height: 1294 },
  trackY: "28%",
};

/** Below this width (CSS px) the wide player would shrink under two thirds
 * and its type under 9 px: the phone layout instead, never enlarged. */
const WIDE_FROM = 640;

/** The board's dialog radius (its `--radius`), so the clip never shows the
 * dimmed board in a corner. */
const DIALOG_RADIUS = 6;

const LINK =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 coarse:-my-3 coarse:inline-block coarse:py-3";

/** The frame's `load` comes a moment before the player opens over the board
 * (the board reads its data first); the poster stays up that long. */
const REVEAL_AFTER_MS = 900;

/**
 * The class board's own replay player, racing the top cars of the board shown
 * in the table (docs/LEADERBOARD.md, "The replay").
 *
 * It is heavy (a canvas redrawn every frame, five recordings) and animated,
 * so it loads only on a click: until then a poster captured from it holds
 * the exact box the player will fill, so nothing moves when it arrives. Under
 * reduced motion the board's player opens paused by itself. The link under it
 * opens the same view on the board's site, in every state.
 */
export default function LeaderboardReplay({ replay, href }: { replay: ReplayConfig; href: string }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(false);
  const [fromKeyboard, setFromKeyboard] = useState(false);
  // Bumped by "Restart the replay": a fresh frame, the player open again.
  const [run, setRun] = useState(0);
  const revealTimer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A keyboard press on the poster hands the keyboard to the player (the
  // poster button is gone); a mouse click leaves focus where it was.
  useEffect(() => {
    if (on && fromKeyboard) frameRef.current?.focus({ preventScroll: true });
  }, [on, fromKeyboard]);

  // A board switch reloads the player on the new board: the poster covers the
  // frame again until it is up (and a reveal still pending for the last
  // board is dropped).
  useEffect(() => {
    window.clearTimeout(revealTimer.current);
    setShown(false);
  }, [href]);

  useEffect(() => () => window.clearTimeout(revealTimer.current), []);

  const onFrameLoad = () => {
    window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => setShown(true), REVEAL_AFTER_MS);
  };

  // The player's Close (or Escape) leaves the board's own page in the frame,
  // which the clip does not fit; a restart opens the player again.
  const restart = () => {
    window.clearTimeout(revealTimer.current);
    setShown(false);
    setRun((n) => n + 1);
  };

  const fit = width !== null && width >= WIDE_FROM ? WIDE : NARROW;
  const scale = width === null ? 1 : Math.min(1, width / fit.cropW);
  const boxW = fit.cropW * scale;
  const boxH = fit.cropH * scale;
  const poster = `${import.meta.env.BASE_URL}${fit.poster.src}`;

  return (
    <div>
      <div className="border-t border-ink-950/10 pt-5">
        <h3 className="font-display text-display-s font-semibold text-text-strong">{replay.label}</h3>
        <p className="mt-3 flex min-h-10 items-center text-small text-text-muted coarse:min-h-11">{replay.note}</p>
      </div>

      <div ref={measureRef} className="mt-6 w-full">
        {width !== null && (
          <div
            className="relative overflow-hidden bg-paper-100"
            style={{
              width: boxW,
              height: boxH,
              borderRadius: `max(var(--radius-media), ${DIALOG_RADIUS * scale}px)`,
            }}
          >
            {on && (
              <iframe
                // A new frame per board, not a new src: changing an iframe's
                // src adds an entry to the page's history (Back would step
                // through the frame first).
                key={`${href}#${run}`}
                ref={frameRef}
                src={href}
                title={`${replay.label}: replay player of the class leaderboard`}
                loading="lazy"
                // The player needs its scripts, and its own origin for the
                // board's data and history; links it shows open in a new tab.
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                allow="fullscreen; clipboard-write"
                referrerPolicy="strict-origin-when-cross-origin"
                // No scrollbar in the frame's window, so the dialog is the
                // same size on every platform, and a wheel over it scrolls
                // this page.
                scrolling="no"
                onLoad={onFrameLoad}
                className="absolute left-0 top-0 max-w-none origin-top-left border-0"
                style={{
                  width: fit.frameW,
                  height: fit.frameH,
                  transform: `translate(${(-(fit.frameW - fit.cropW) / 2) * scale}px, ${(-(fit.frameH - fit.cropH) / 2) * scale}px) scale(${scale})`,
                }}
              />
            )}
            {!shown &&
              (on ? (
                <div aria-hidden="true" className="absolute inset-0">
                  <img
                    src={poster}
                    alt=""
                    width={fit.poster.width}
                    height={fit.poster.height}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
                    style={{ top: fit.trackY }}
                  >
                    <span className="rounded-pill border border-ink-950/10 bg-paper-50/90 px-4 py-2 text-small font-semibold text-text-strong">
                      Loading the replay…
                    </span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    // detail 0: Enter or Space, not a pointer.
                    setFromKeyboard(e.detail === 0);
                    setOn(true);
                  }}
                  aria-label={`Play the replay: ${replay.label}`}
                  className="group/play absolute inset-0 block h-full w-full cursor-pointer focus-visible:-outline-offset-4"
                >
                  <img
                    src={poster}
                    alt=""
                    width={fit.poster.width}
                    height={fit.poster.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ top: fit.trackY }}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-pill border border-ink-950/10 bg-paper-50/90 text-ink-950 shadow-card transition-colors duration-[var(--duration-fast)] group-hover/play:bg-paper-50 group-focus-visible/play:bg-paper-50">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M5.5 3.2v11.6L15 9 5.5 3.2Z" />
                      </svg>
                    </span>
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-small">
        <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
          Open the replay <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {on && (
          <button type="button" onClick={restart} className={`cursor-pointer ${LINK}`}>
            Restart the replay
          </button>
        )}
      </p>
    </div>
  );
}
