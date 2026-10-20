import { createContext, useContext } from "react";

// Where the site's large media lives (landing v5: the hero clip cycle).
// Files under 1.5 MB ship with the site from public/; the hero clips are on
// Cloudflare R2 (bucket roboracer-media, docs/media/HOSTING.md). With
// MEDIA_BASE empty every path resolves to the local file, which is how the
// clips play on localhost before an upload.
export const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE ?? "";

/** "/media/hero/x.mp4" -> "<MEDIA_BASE>/media/hero/x.mp4" (or the local path). */
export function mediaUrl(path: string): string {
  if (!MEDIA_BASE) return path;
  return `${MEDIA_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** One encode of a hero clip; a clip carries a ladder of these. */
export type HeroSource = {
  src: string;
  /** Encode width in px; the ladder sorts by it. */
  width: number;
  /** Average bitrate of the file in Mbit/s (ffprobe). */
  mbps: number;
  /** File size in bytes, for the throughput measurement (mbps x duration
   * when absent). */
  bytes?: number;
  /** Frames per second, informational (the 60 fps rungs cost more bits). */
  fps?: number;
};

/** The Network Information API (Chromium only; Safari and Firefox have none). */
type NetInfo = { saveData?: boolean; effectiveType?: string; downlink?: number; type?: string };

const netInfo = (): NetInfo | undefined =>
  typeof navigator === "undefined" ? undefined : (navigator as Navigator & { connection?: NetInfo }).connection;

/** Chromium rounds `downlink` and caps it at 10 Mbit/s, so 10 means "fast". */
const DOWNLINK_CAP_MBPS = 10;
/** What Chrome's capped downlink (10, "ten or more") is taken as: enough for
 * the 1920 rungs (up to 9 Mbit/s with the headroom), not for the 2560 one,
 * which only a measured download unlocks. Chrome with no history for the
 * network reports a low default instead (1.65 Mbit/s in a fresh profile,
 * docs/media/HERO_PERF.md) and starts low. */
const CAPPED_DOWNLINK_MBPS = 12;
/** What a browser with no Network Information API (Safari, Firefox) is
 * taken as before the first measured download: the 1280 rungs and the
 * lighter race cuts, not the 60 fps rungs (a 1920p60 opening on a 5 Mbit/s
 * link stuttered for 14 s in QA, docs/qa/hero-4k.md). The opening clip's
 * download then sets the real figure. */
const NO_API_MBPS = 9;
/** A clip streams without stalling when the link has this much room over its
 * average bitrate (the next clip preloads while the current one plays). */
const STREAM_HEADROOM = 1.3;
/** A download shorter than this says more about latency than throughput:
 * it only raises the estimate, as a lower bound over this time. One smaller
 * than this is all TCP ramp-up and is dropped. */
const MIN_SAMPLE_MS = 400;
const MIN_SAMPLE_BYTES = 200_000;
/** The most a single sample can claim, Mbit/s (a cached file reads as a
 * thousand). */
const MAX_SAMPLE_MBPS = 60;
/** Weight of the newest download in the running estimate. */
const EWMA = 0.5;
/** After a stall at a rung, the estimate drops to this share of its bitrate. */
const STALL_FACTOR = 0.6;
/** A phone (either orientation) gets at most this width: the hero's cover
 * crop shows a third of the frame in portrait, and mobile data is dear. */
const PHONE_MAX_WIDTH = 1280;
/** A screen needs an encode at least this share of its cover width before
 * the next rung up is worth the bytes (footage in motion, 1.12 push-in). */
const DISPLAY_FIT = 0.9;

type LinkState = {
  /** Measured throughput, Mbit/s (EWMA over the clips downloaded so far). */
  est: number | null;
  /** The lowest bitrate that stalled this session: no rung at or above it
   * plays again, whatever a later measurement says. */
  ceiling: number | null;
  /** Files already measured this session: a second download of one comes
   * from the cache and says nothing about the link. */
  seen: string[];
};
const SEEN_MAX = 40;

const LINK_KEY = "rr-link";
let link: LinkState | null = null;

/** In memory, and in sessionStorage so a route change keeps what the tab
 * has learnt (this page only if storage is blocked). */
function state(): LinkState {
  if (link) return link;
  link = { est: null, ceiling: null, seen: [] };
  try {
    const raw = sessionStorage.getItem(LINK_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<LinkState>;
      if (typeof p.est === "number" && p.est > 0) link.est = p.est;
      if (typeof p.ceiling === "number" && p.ceiling > 0) link.ceiling = p.ceiling;
      if (Array.isArray(p.seen)) link.seen = p.seen.filter((k): k is string => typeof k === "string").slice(-SEEN_MAX);
    }
  } catch {
    // Storage blocked or unreadable: start fresh.
  }
  return link;
}

function save(): void {
  try {
    sessionStorage.setItem(LINK_KEY, JSON.stringify(state()));
  } catch {
    // Storage blocked: the state lives as long as this page.
  }
}

/**
 * A download burst (HeroChapter: a clip's first stretch, from `loadstart` to
 * the browser pausing the fetch or the whole file) updates the link
 * estimate, so the clips picked after it step up to a rung the link can
 * carry, or down. Each file counts once per session (`key`): the cycle
 * plays the same files again from the cache, which read as a 50 Mbit/s link
 * in QA. Small samples are dropped; a fast one (under MIN_SAMPLE_MS) counts
 * as a lower bound over that time and only ever raises the estimate, capped
 * at MAX_SAMPLE_MBPS. A cached file in a new tab can still unlock a rung the
 * link cannot carry; the stall watch then steps it down, for the session.
 */
export function recordTransfer(bytes: number, ms: number, key?: string): void {
  if (!(bytes >= MIN_SAMPLE_BYTES) || !(ms > 0)) return;
  const s = state();
  if (key) {
    if (s.seen.includes(key)) return;
    s.seen = [...s.seen, key].slice(-SEEN_MAX);
  }
  if (ms < MIN_SAMPLE_MS) {
    const floor = Math.min(MAX_SAMPLE_MBPS, (bytes * 8) / MIN_SAMPLE_MS / 1000);
    if (s.est === null || floor > s.est) {
      s.est = floor;
      save();
    }
    return;
  }
  const mbps = Math.min(MAX_SAMPLE_MBPS, (bytes * 8) / ms / 1000);
  s.est = s.est === null ? mbps : s.est + EWMA * (mbps - s.est);
  save();
}

/**
 * An observed stall at a rung of `mbps` (HeroChapter: a clip `waiting` for
 * over 1.5 s, or a finished clip holding its last frame that long for the
 * next one): the link cannot carry it, whatever the browser estimated or
 * failed to report. That rung and every higher one are out for the rest of
 * the tab's session, and the estimate drops below it so the next pick fits.
 */
export function markStall(mbps: number): void {
  const s = state();
  s.ceiling = s.ceiling === null ? mbps : Math.min(s.ceiling, mbps);
  const drop = mbps * STALL_FACTOR;
  s.est = s.est === null ? drop : Math.min(s.est, drop);
  save();
}

/** True once a stall has been recorded on this tab (see markStall). */
export function linkStalled(): boolean {
  return state().ceiling !== null;
}

/**
 * The link's throughput in Mbit/s: measured downloads first, else the
 * browser's downlink (10, the cap, reads as "10 or more"), else null (no
 * Network Information API: Safari, Firefox).
 */
export function linkEstimate(): number | null {
  const s = state();
  if (s.est !== null) return s.est;
  const d = netInfo()?.downlink;
  if (typeof d === "number" && d > 0) return d >= DOWNLINK_CAP_MBPS ? CAPPED_DOWNLINK_MBPS : d;
  return null;
}

export type PickContext = {
  /** Physical pixels the footage covers: the viewport's cover width for a
   * 16:9 frame times the device pixel ratio. */
  coverWidth: number;
  /** DESKTOP_QUERY (wide and tall); a phone in either orientation is not. */
  wide: boolean;
};

/**
 * The rung of `sources` to play now. Caps, in order: Save-Data, a cellular
 * link or anything slower than "4g" gets the lowest rung; a phone at most
 * 1280 wide; the first rung that covers the screen, nothing above it. Within
 * the cap, the highest rung whose bitrate fits the link estimate with
 * headroom (a browser with no estimate counts as 9 Mbit/s), never a rung at
 * or above a bitrate that stalled this session. Measured 2026-09-24
 * (docs/media/HERO_PERF.md): at 5 Mbit/s the 1920 race clips (5.7 to 7.3
 * Mbit/s) froze the hero for 17 s of its first 55, so the fit is strict.
 */
export function pickSource(sources: HeroSource[], ctx: PickContext): HeroSource {
  const ladder = [...sources].sort((a, b) => a.width - b.width);
  const lowest = ladder[0];
  const c = netInfo();
  if (c?.saveData || c?.type === "cellular") return lowest;
  if (c?.effectiveType && c.effectiveType !== "4g") return lowest;
  let maxWidth = ctx.wide ? Infinity : PHONE_MAX_WIDTH;
  const fit = ladder.find((s) => s.width >= ctx.coverWidth * DISPLAY_FIT);
  if (fit) maxWidth = Math.min(maxWidth, fit.width);
  const { ceiling } = state();
  const budget = (linkEstimate() ?? NO_API_MBPS) / STREAM_HEADROOM;
  let pick = lowest;
  for (const r of ladder) {
    if (r.width > maxWidth) break;
    if (ceiling !== null && r.mbps >= ceiling) break;
    if (r.mbps <= budget) pick = r;
  }
  return pick;
}

/** Whether `source` is the lowest rung of `sources` (nothing to step down to). */
export function isLowest(sources: HeroSource[], source: HeroSource): boolean {
  return sources.every((s) => s.width >= source.width);
}

/**
 * True while the page wants the connection for something more urgent (the
 * landing's opening hero clip). Components that load off-screen media
 * eagerly (marquee images, a carousel's current figure, a video frame's
 * poster) render their boxes without a `src` until it turns false. Default
 * false: pages that never provide it hold nothing.
 */
export const MediaHoldContext = createContext(false);

export function useMediaHold(): boolean {
  return useContext(MediaHoldContext);
}
