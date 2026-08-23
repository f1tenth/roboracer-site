import { lazy, type ComponentType } from "react";

const key = (name: string) => `rr:chunk-reload:${name}`;

/** sessionStorage throws in some privacy modes; a recovery path must not be the
 *  thing that crashes. */
const flag = {
  get(name: string) {
    try {
      return sessionStorage.getItem(key(name)) === "1";
    } catch {
      return false;
    }
  },
  set(name: string) {
    try {
      sessionStorage.setItem(key(name), "1");
    } catch {
      /* ignore */
    }
  },
  clear(name: string) {
    try {
      sessionStorage.removeItem(key(name));
    } catch {
      /* ignore */
    }
  },
};

/**
 * A deployed SPA changes every asset hash on every build. A reader holding the
 * old index.html then requests a chunk that no longer exists, the dynamic
 * import rejects, and React surfaces it as a render error that takes the whole
 * route down. Same failure shape as a preview server started against a dist
 * that was rebuilt under it.
 *
 * Retry once for a transient network failure, then reload once for a stale
 * document, then give up and let RouteBoundary show the fallback. The retry is
 * cheap but not reliable on its own: the module registry can hand back the
 * same rejected promise without a second network request, which is why the
 * reload exists. The per-chunk sessionStorage flag is what makes "reload once"
 * true; without it a genuinely missing file reloads forever.
 */
// React's own lazy() constrains to ComponentType<any>; ComponentType<never>
// is narrower than that and the call below will not typecheck against it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  name: string,
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      flag.clear(name);
      return mod;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      try {
        const mod = await factory();
        flag.clear(name);
        return mod;
      } catch (err) {
        if (!flag.get(name)) {
          flag.set(name);
          window.location.reload();
          return new Promise<never>(() => {}); // the reload wins this race
        }
        throw err;
      }
    }
  });
}

/**
 * The browser's message for a missing chunk differs per engine, so the
 * boundary matches on shape rather than on one string. Exported here so the
 * detection lives next to the recovery it belongs to.
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported/i.test(
    message,
  );
}
