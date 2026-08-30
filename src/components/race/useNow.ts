import { useEffect, useState } from "react";

/**
 * `Date.now()` re-read on an interval, so a season row crosses from upcoming
 * to live to concluded on its own while a tab is left open.
 *
 * This is not motion: nothing moves and nothing fades, a label changes when a
 * race starts. There is deliberately no reduced-motion branch, because there
 * is nothing to reduce.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
