// The ESE 6150 class leaderboard (https://roboracer-class.github.io/leaderboard/),
// read live from its public JSON. The board is its own static site on GitHub
// Pages, rebuilt every five minutes; it sends `access-control-allow-origin: *`,
// so the browser can read it from roboracer.ai directly. Where it lives and
// which board to feature come from public/data/leaderboard.json, not from here.
// The shape relied on is written down in docs/LEADERBOARD.md.

export type LeaderboardConfig = {
  label: string;
  /** The board's own site; the data sits under `<url>data/`. */
  url: string;
  /** null = the current term; an archived term's label pins that term. */
  term: string | null;
  /** null = pick automatically; a board slug pins that board. */
  featured: string | null;
  /** The one extra column, a key of `metric.extras`, or null for none. */
  extra: string | null;
  limit: number;
};

type MetricInfo = { key: string; label: string; unit: string };

export type BoardMetric = MetricInfo & {
  direction: "lower" | "higher";
  extras?: MetricInfo[];
};

/** One entry of `labs` in index.json: a board, with its row count. */
export type BoardSummary = {
  slug: string;
  file: string;
  /** Boards of one lab share an assignment (lab 4 has a lap and an obstacle board). */
  assignment?: string;
  title: string;
  lab_title?: string;
  board_title?: string;
  /** false on team boards; absent or true means racing aliases. */
  anonymous?: boolean;
  available_from?: string;
  due?: string;
  generated_at?: string;
  rows: number;
  metric: BoardMetric;
};

export type BoardIndex = {
  schema?: string;
  generated_at?: string;
  labs: BoardSummary[];
};

export type BoardRow = {
  /** A racing alias ("Dawn Gecko 23") or a team ("Team 8"). */
  alias: string;
  rank: number;
  /** The ranked value, in `metric.unit` (seconds for a lap). */
  metric: number;
  extras?: Record<string, number | null | undefined>;
};

/** A board's own file: the same header fields, and the ranked rows. */
export type BoardFile = Omit<BoardSummary, "rows" | "file"> & { rows: BoardRow[] };

const TIMEOUT_MS = 8000;

export async function loadLeaderboardConfig(signal: AbortSignal): Promise<LeaderboardConfig> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/leaderboard.json`, { signal });
  if (!res.ok) throw new Error(`leaderboard.json: HTTP ${res.status}`);
  return (await res.json()) as LeaderboardConfig;
}

/** Where the board's JSON lives: `data/`, or `data/archive/<term>/` for a
 * pinned term, the same rule the board's own page applies to `?term=`. */
export function dataBase(cfg: LeaderboardConfig): string {
  const root = cfg.url.endsWith("/") ? cfg.url : `${cfg.url}/`;
  return cfg.term ? `${root}data/archive/${encodeURIComponent(cfg.term)}/` : `${root}data/`;
}

/**
 * A cross-origin read that gives up after eight seconds, so a slow or
 * unreachable board ends in the error state rather than an endless skeleton.
 * `no-cache` revalidates against the ETag: the board changes every few
 * minutes and GitHub Pages would otherwise let a browser keep a copy for ten.
 */
export async function fetchBoardJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal.addEventListener("abort", onAbort);
  try {
    const res = await fetch(url, { signal: timeout.signal, cache: "no-cache" });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

export function isBoardIndex(value: unknown): value is BoardIndex {
  return !!value && Array.isArray((value as BoardIndex).labs);
}

export function isBoardFile(value: unknown): value is BoardFile {
  const v = value as BoardFile;
  return !!v && Array.isArray(v.rows) && !!v.metric && typeof v.metric.key === "string";
}

const labOf = (b: BoardSummary) => b.assignment ?? b.slug;
const opened = (b: BoardSummary) => (b.available_from ? Date.parse(b.available_from) : 0);

/**
 * The board to feature: the one the config names, if it has ranked laps;
 * otherwise the most recently opened lab that has any, and within that lab
 * its first board in the index's order (the board's own page opens a lab on
 * its first board too). A lab that has opened but has no clean lap yet is
 * passed over, so the section never features an empty table while an older
 * lab has results.
 */
export function pickFeatured(
  index: BoardIndex,
  cfg: LeaderboardConfig,
  now: number,
): BoardSummary | undefined {
  const ranked = index.labs.filter(
    (b) => typeof b.rows === "number" && b.rows > 0 && opened(b) <= now,
  );
  const pinned = cfg.featured ? ranked.find((b) => b.slug === cfg.featured) : undefined;
  if (pinned) return pinned;
  let best: BoardSummary | undefined;
  for (const b of ranked) if (!best || opened(b) > opened(best)) best = b;
  return best;
}

/** The featured lab's boards that have ranked laps, in index order: what the
 * switcher offers. One board means no switcher. */
export function siblingBoards(index: BoardIndex, featured: BoardSummary): BoardSummary[] {
  return index.labs.filter((b) => labOf(b) === labOf(featured) && b.rows > 0);
}

export function topRows(board: BoardFile, limit: number): BoardRow[] {
  return board.rows
    .filter((r) => typeof r.metric === "number" && Number.isFinite(r.metric))
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.max(1, limit));
}

/**
 * A chip label short enough that a lab's two boards share one row on a phone
 * (the skeleton reserves one row; lab 4's "Fastest clean lap" and "Fastest
 * clean obstacle lap" wrapped to two at 390 and pushed the table down 46 px).
 * "Levine, fastest clean lap" -> "Levine"; "Fastest clean obstacle lap" ->
 * "Clean obstacle lap". Anything else is returned as it is.
 */
export function shortBoardLabel(title: string): string {
  const short = title.includes(",") ? title.split(",")[0].trim() : title.replace(/^fastest\s+/i, "");
  return short ? short.charAt(0).toUpperCase() + short.slice(1) : title;
}

/** Link to the full board, opened on the board shown here. */
export function boardHref(cfg: LeaderboardConfig, slug?: string): string {
  const url = new URL(cfg.url);
  if (cfg.term) url.searchParams.set("term", cfg.term);
  if (slug) url.searchParams.set("lab", slug);
  return url.toString();
}

export function formatValue(v: number | null | undefined, unit: string): string {
  return typeof v === "number" && Number.isFinite(v) ? `${v.toFixed(2)} ${unit}` : "--";
}

export function formatAgo(iso: string | undefined, now: number): string | undefined {
  if (!iso) return undefined;
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (!Number.isFinite(m)) return undefined;
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

export function formatDay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? undefined
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
