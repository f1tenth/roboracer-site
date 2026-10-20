import { useCallback, useSyncExternalStore } from "react";

/** Where the course outline keeps its "done" ticks: a JSON array of lecture
 * and tutorial hrefs (their coursekit URLs), so a tick follows the lecture
 * across every plan and page that lists it. Bump the version if the shape
 * ever changes rather than migrating in place. */
export const PROGRESS_KEY = "rr.courses.done.v1";

type Snapshot = {
  done: ReadonlySet<string>;
  /** false when this browser refuses storage (private modes, blocked site
   * data, a sandboxed frame): ticks then live in memory until a reload, and
   * the page says so. */
  persistent: boolean;
};

const SERVER: Snapshot = { done: new Set(), persistent: false };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

/** The store, or null when touching it throws. Reading `window.localStorage`
 * alone can throw (a SecurityError with site data blocked), and some browsers
 * hand out a store whose writes throw, so a write is probed too. */
function store(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = `${PROGRESS_KEY}.probe`;
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Only strings survive: anything else in the key (hand edits, another
 * version) is ignored rather than trusted. */
function parse(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    return new Set(Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

function read(): Snapshot {
  const s = store();
  if (!s) return { done: new Set(), persistent: false };
  try {
    return { done: parse(s.getItem(PROGRESS_KEY)), persistent: true };
  } catch {
    return { done: new Set(), persistent: false };
  }
}

function getSnapshot(): Snapshot {
  if (!snapshot) snapshot = read();
  return snapshot;
}

function emit() {
  for (const l of listeners) l();
}

/** Keep the new set in memory always; write it through when storage works.
 * A write that throws (quota, storage revoked mid-session) flips the page to
 * the "will not be kept" note instead of losing the tick. */
function commit(done: Set<string>) {
  let persistent = getSnapshot().persistent;
  if (persistent) {
    try {
      if (done.size) window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...done].sort()));
      else window.localStorage.removeItem(PROGRESS_KEY);
    } catch {
      persistent = false;
    }
  }
  snapshot = { done, persistent };
  emit();
}

/** Another tab ticked or cleared: read the key again. */
function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== PROGRESS_KEY) return;
  snapshot = read();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * The reader's own "done" ticks on the course outline, kept in this browser
 * only (nothing is sent anywhere). One store for the whole page, so every
 * outline on it agrees, and it survives in-app navigation; it reloads from
 * localStorage on a new visit. Every read and write is guarded: with storage
 * blocked the ticks still work in memory and `persistent` is false.
 */
export function useLectureProgress() {
  const { done, persistent } = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);

  const setDone = useCallback((href: string, value: boolean) => {
    const current = getSnapshot().done;
    if (current.has(href) === value) return;
    const next = new Set(current);
    if (value) next.add(href);
    else next.delete(href);
    commit(next);
  }, []);

  /** Remove the given hrefs (the outline on screen), leaving ticks other
   * plans' pages own alone. */
  const clear = useCallback((hrefs: Iterable<string>) => {
    const next = new Set(getSnapshot().done);
    for (const h of hrefs) next.delete(h);
    commit(next);
  }, []);

  return { done, persistent, setDone, clear };
}
