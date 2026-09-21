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
