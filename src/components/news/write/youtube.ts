// Reading a YouTube address a writer pastes. Only the id leaves this file:
// the page builds every YouTube URL itself from an id that matches the
// pattern, so a pasted address can never smuggle another host or a script.

const ID = /^[A-Za-z0-9_-]{11}$/;

export type YouTubeRef = { videoId: string; portrait: boolean };

/** The video a YouTube link points at, or null for anything else. */
export function parseYouTube(input: string): YouTubeRef | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  let portrait = false;
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (parts[0] === "shorts") {
      id = parts[1] ?? null;
      portrait = true;
    } else if (parts[0] === "embed" || parts[0] === "live" || parts[0] === "v") id = parts[1] ?? null;
  }
  return id && ID.test(id) ? { videoId: id, portrait } : null;
}

/** The thumbnail shown before a click: the only thing loaded from YouTube.
 * A Short has its own upright one. A wide video always has the small
 * "hqdefault" (480 px, letterboxed) and usually, not always, the full-size
 * "maxresdefault": `hd` says whether this one does (see probeHd). */
export const youTubeThumb = (videoId: string, portrait: boolean, hd = false) =>
  `https://i.ytimg.com/vi/${videoId}/${portrait ? "oardefault" : hd ? "maxresdefault" : "hqdefault"}.jpg`;

/** Whether the full-size thumbnail exists. YouTube answers a missing one
 * with a 120 px grey placeholder, so the picture's own width is the test. */
export function probeHd(videoId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img.naturalWidth > 320);
    img.onerror = () => resolve(false);
    img.src = youTubeThumb(videoId, false, true);
  });
}
