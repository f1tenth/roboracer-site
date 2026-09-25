import { createContext, useContext } from "react";

// Where the site's large media lives (landing v5: the hero clip cycle).
// Files under 1.5 MB ship with the site from public/; the hero clips are on
// Cloudflare R2 behind the roboracer-media worker (infra/media-worker). With
// MEDIA_BASE empty every path resolves to the local file, which is how the
// clips play on localhost before an upload.
export const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE ?? "";

/** "/media/hero/x.mp4" -> "<MEDIA_BASE>/media/hero/x.mp4" (or the local path). */
export function mediaUrl(path: string): string {
  if (!MEDIA_BASE) return path;
  return `${MEDIA_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** The Network Information API (Chromium only; Safari and Firefox have none). */
type NetInfo = { saveData?: boolean; effectiveType?: string; downlink?: number };

/** Chromium rounds `downlink` and caps it at 10 Mbit/s, so 10 means "fast". */
const DOWNLINK_CAP_MBPS = 10;
/** A clip streams without stalling when the link has this much room over its
 * average bitrate (the next clip preloads while the current one plays). */
const STREAM_HEADROOM = 1.3;

/**
 * Can this connection stream a clip of `mbps` average bitrate while the next
 * one preloads? False on Save-Data, on anything slower than "4g", and when the
 * browser's downlink estimate is under the clip's bitrate plus headroom.
 * Measured 2026-09-24 (docs/media/HERO_PERF.md): at 5 Mbit/s the 1920 race
 * clips (5.7 to 7.3 Mbit/s) froze the hero for 17 s of its first 55. With no
 * signal (Safari, Firefox) the answer is yes and the width rule decides.
 */
export function linkCanStream(mbps: number): boolean {
  if (typeof navigator === "undefined") return true;
  const c = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (!c) return true;
  if (c.saveData) return false;
  if (c.effectiveType && c.effectiveType !== "4g") return false;
  const d = c.downlink;
  if (typeof d !== "number" || !(d > 0)) return true;
  return d >= DOWNLINK_CAP_MBPS || d >= mbps * STREAM_HEADROOM;
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
