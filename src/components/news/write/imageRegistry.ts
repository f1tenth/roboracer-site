// The pictures of the draft being written, by id, with an object URL each so
// the page can show them. A module-level store rather than React state: the
// editor's plugins (which pair narrow figures by their proportions) and its
// node views both read it, and neither lives inside the page's render.
// There is one writer page and one draft at a time, so one store.

import type { DraftImage } from "./types";

type Entry = { image: DraftImage; url: string };

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();
let version = 0;

function changed() {
  version += 1;
  listeners.forEach((fn) => fn());
}

export function subscribeImages(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** A number that changes whenever the set of pictures does (for
 * useSyncExternalStore). */
export const imagesVersion = () => version;

export function registerImage(image: DraftImage): void {
  const old = entries.get(image.id);
  if (old) URL.revokeObjectURL(old.url);
  entries.set(image.id, { image, url: URL.createObjectURL(image.blob) });
  changed();
}

export function forgetAllImages(): void {
  entries.forEach((entry) => URL.revokeObjectURL(entry.url));
  entries.clear();
  changed();
}

export const imageUrl = (id: string): string | undefined => entries.get(id)?.url;
export const imageById = (id: string): DraftImage | undefined => entries.get(id)?.image;
export const imageSize = (id: string): { width: number; height: number } | undefined => {
  const image = entries.get(id)?.image;
  return image ? { width: image.width, height: image.height } : undefined;
};
export const allImages = (): Map<string, DraftImage> =>
  new Map([...entries].map(([id, entry]) => [id, entry.image]));
