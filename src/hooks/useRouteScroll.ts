import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { ScrollTrigger } from "../lib/motion";

/** The last scroll position of every history entry, by the entry's key. */
const positions = new Map<string, number>();

type NavigationApi = { currentEntry?: { key: string } | null };

/**
 * The current history entry's key: the Navigation API's, which every entry
 * has, including the ones the browser makes itself (the first load, a plain
 * #anchor link in the rulebook), or else React Router's, from the entry's
 * history state. Never written into the entry: a replaceState right after an
 * #anchor click cancelled the browser's jump to it.
 */
function entryKey(): string | undefined {
  const navigation = (window as { navigation?: NavigationApi }).navigation;
  return navigation?.currentEntry?.key ?? (window.history.state as { key?: string } | null)?.key;
}

function remember(y: number) {
  const key = entryKey();
  if (key) positions.set(key, y);
}

/**
 * Where a page opens (Cedric, 2026-09-25: a new page must start at its top,
 * never at the previous page's scroll). The browser's own restoration is off
 * (lib/motion), so this is the only thing placing the reader:
 *
 * - Any change of route, clicked or Back/Forward, opens at the top. A hash
 *   target (/#start, /rules#kill-switch) is then brought in by its page.
 * - Back/Forward inside one page (the landing's "Start here", an anchor in
 *   the rulebook) returns exactly where that entry was left, as the browser
 *   did before.
 *
 * Positions are written through ScrollTrigger's own scroll setter, never
 * window.scrollTo: ScrollTrigger caches the window's scroll, and a refresh
 * records that cache and puts it back. Reset behind its back, the cache kept
 * the previous page's offset, and the next refresh moved the new page there.
 */
export function useRouteScroll() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const shownPath = useRef(pathname);

  useEffect(() => {
    const onScroll = () => remember(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A new route: the top, then re-measure the ScrollTrigger starts, which
  // were cached against the page that just left, once it has painted.
  useLayoutEffect(() => {
    ScrollTrigger.getScrollFunc(window)(0);
    remember(0);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Back/Forward within the page on screen. `hash` and `key` are here as
  // triggers: the browser's own anchor entries all share React Router's
  // "default" key, so only the hash tells them apart.
  useLayoutEffect(() => {
    const samePage = shownPath.current === pathname;
    shownPath.current = pathname;
    if (!samePage || navigationType !== "POP") return;
    const key = entryKey();
    const y = key ? positions.get(key) : undefined;
    if (y !== undefined) ScrollTrigger.getScrollFunc(window)(y);
  }, [pathname, hash, key, navigationType]);
}
