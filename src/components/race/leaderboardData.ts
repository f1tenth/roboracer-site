// The ESE 6150 class leaderboard (https://roboracer-class.github.io/leaderboard/),
// read live from its public JSON. The board is its own static site on GitHub
// Pages, rebuilt every five minutes; it sends `access-control-allow-origin: *`,
// so the browser can read it from roboracer.ai directly. Where it lives and
// which board to feature come from public/data/leaderboard.json, not from here.
// The shape relied on is written down in docs/LEADERBOARD.md.

import { fetchJson } from "../../lib/data";

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
  /** The board's own replay player beside the table, or null for none. */
  replay: ReplayConfig | null;
};

/** The board's player racing a board's top cars (`?compare=top5`). */
export type ReplayConfig = {
  /** Its heading, e.g. "Top 5, follow the gap". */
  label: string;
  /** One line under the heading. */
  note: string;
  compare: "top3" | "top5";
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
  /** The grader recorded the run, so the board's player can replay it. */
  replay?: boolean;
};

/** A board's own file: the same header fields, and the ranked rows. */
export type BoardFile = Omit<BoardSummary, "rows" | "file"> & { rows: BoardRow[] };

/**
 * public/data/leaderboard.json as shipped, bundled: when the file fails to
 * load or does not validate, the section still reads the board and, at worst,
 * still links to it.
 */
export const FALLBACK_CONFIG: LeaderboardConfig = {
  label: "ESE 6150 leaderboard",
  url: "https://roboracer-class.github.io/leaderboard/",
  term: null,
  // Cedric, 2026-09-25: the section stays on lab 4, follow the gap.
  featured: "lab-4-follow-the-gap-lap",
  extra: "top_mps",
  limit: 5,
  replay: {
    label: "Top 5, follow the gap",
    note: "The best clean laps in the grading simulator, replayed.",
    compare: "top5",
  },
};

/** The config file, validated; the bundled copy on any failure (HTTP error,
 * the eight-second timeout, a malformed field). Never throws but on abort. */
export async function loadLeaderboardConfig(signal: AbortSignal): Promise<LeaderboardConfig> {
  try {
    const raw = await fetchJson<unknown>(`${import.meta.env.BASE_URL}data/leaderboard.json`, { signal });
    return readConfig(raw) ?? FALLBACK_CONFIG;
  } catch (err) {
    if (signal.aborted) throw err;
    return FALLBACK_CONFIG;
  }
}

/** Where the board's JSON lives: `data/`, or `data/archive/<term>/` for a
 * pinned term, the same rule the board's own page applies to `?term=`. */
export function dataBase(cfg: LeaderboardConfig): string {
  const root = cfg.url.endsWith("/") ? cfg.url : `${cfg.url}/`;
  return cfg.term ? `${root}data/archive/${encodeURIComponent(cfg.term)}/` : `${root}data/`;
}

/**
 * A cross-origin read of the board, with the site's eight-second read
 * timeout (lib/data fetchJson), so a slow or unreachable file ends in a
 * fallback rather than an endless skeleton. `no-cache`
 * revalidates against the ETag: the board changes every few minutes and
 * GitHub Pages would otherwise let a browser keep a copy for ten.
 */
export function fetchBoardJson<T>(url: string, signal: AbortSignal): Promise<T> {
  return fetchJson<T>(url, { signal, cache: "no-cache" });
}

// Validation. The board is someone else's site: every field the section
// reads is checked before it reaches state, and a malformed one is dropped
// (an entry, a row, the extras) rather than thrown at render time. An
// object-valued `extras` used to reach `.find()` and take /race down.

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const strOrNull = (v: unknown): string | null | undefined =>
  v === undefined || v === null ? null : isStr(v) ? v : undefined;

function isHttpUrl(v: unknown): v is string {
  if (!isStr(v)) return false;
  try {
    const { protocol } = new URL(v);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** leaderboard.json, or null when a field has the wrong type. */
export function readConfig(v: unknown): LeaderboardConfig | null {
  if (!isObj(v) || !isStr(v.label) || !isHttpUrl(v.url)) return null;
  const term = strOrNull(v.term);
  const featured = strOrNull(v.featured);
  const extra = strOrNull(v.extra);
  if (term === undefined || featured === undefined || extra === undefined) return null;
  const limit = isNum(v.limit) && v.limit >= 1 ? Math.min(Math.floor(v.limit), 20) : FALLBACK_CONFIG.limit;
  return { label: v.label, url: v.url, term, featured, extra, limit, replay: readReplay(v.replay) };
}

/** The replay block; absent, null or malformed means no replay (the table
 * stands on its own). */
function readReplay(v: unknown): ReplayConfig | null {
  if (!isObj(v) || !isStr(v.label) || !isStr(v.note)) return null;
  const compare = v.compare === "top3" ? "top3" : v.compare === "top5" || v.compare === undefined ? "top5" : null;
  return compare ? { label: v.label, note: v.note, compare } : null;
}

function readInfo(v: unknown): MetricInfo | null {
  return isObj(v) && isStr(v.key) && isStr(v.label) && isStr(v.unit)
    ? { key: v.key, label: v.label, unit: v.unit }
    : null;
}

function readMetric(v: unknown): BoardMetric | null {
  const info = readInfo(v);
  if (!info || !isObj(v) || (v.direction !== "lower" && v.direction !== "higher")) return null;
  const extras = Array.isArray(v.extras)
    ? v.extras.map(readInfo).filter((e): e is MetricInfo => e !== null)
    : undefined;
  return { ...info, direction: v.direction, extras };
}

const OPTIONAL_STRINGS = ["assignment", "lab_title", "board_title", "available_from", "due", "generated_at"] as const;

/** The header a board summary and a board file share. */
function readHeader(v: Json): Omit<BoardSummary, "rows" | "file"> | null {
  const metric = readMetric(v.metric);
  if (!isStr(v.slug) || !isStr(v.title) || !metric) return null;
  const out: Omit<BoardSummary, "rows" | "file"> = { slug: v.slug, title: v.title, metric };
  for (const key of OPTIONAL_STRINGS) {
    const value = v[key];
    if (isStr(value)) out[key] = value;
  }
  if (typeof v.anonymous === "boolean") out.anonymous = v.anonymous;
  return out;
}

/** A relative `*.json` path under data/, nothing that could leave it. */
const BOARD_FILE = /^[A-Za-z0-9][A-Za-z0-9._/-]*\.json$/;

function readSummary(v: unknown): BoardSummary | null {
  if (!isObj(v) || !isStr(v.file) || !BOARD_FILE.test(v.file) || v.file.includes("..")) return null;
  if (!isNum(v.rows) || v.rows < 0) return null;
  const header = readHeader(v);
  return header ? { ...header, file: v.file, rows: v.rows } : null;
}

/** index.json with every malformed board dropped, or null if it has no list. */
export function readBoardIndex(v: unknown): BoardIndex | null {
  if (!isObj(v) || !Array.isArray(v.labs)) return null;
  return {
    schema: isStr(v.schema) ? v.schema : undefined,
    generated_at: isStr(v.generated_at) ? v.generated_at : undefined,
    labs: v.labs.map(readSummary).filter((b): b is BoardSummary => b !== null),
  };
}

function readRow(v: unknown): BoardRow | null {
  if (!isObj(v) || !isStr(v.alias) || !isNum(v.rank) || !isNum(v.metric)) return null;
  const extras: Record<string, number | null> = {};
  if (isObj(v.extras)) {
    for (const [key, value] of Object.entries(v.extras)) if (isNum(value)) extras[key] = value;
  }
  return { alias: v.alias, rank: v.rank, metric: v.metric, extras, replay: isStr(v.replay) && v.replay.length > 0 };
}

/** A board's file with its malformed rows dropped, or null if its header is. */
export function readBoardFile(v: unknown): BoardFile | null {
  if (!isObj(v) || !Array.isArray(v.rows)) return null;
  const header = readHeader(v);
  if (!header) return null;
  return { ...header, rows: v.rows.map(readRow).filter((r): r is BoardRow => r !== null) };
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

/**
 * The board's page with its player open on a board's top cars:
 * `?lab=<slug>&compare=top5` (the board's own deep link, what its Copy link
 * shares). The player opens by itself once the board has rendered, as a
 * dialog over the board; see docs/LEADERBOARD.md, "The replay".
 */
export function replayHref(cfg: LeaderboardConfig, slug: string | undefined, compare: ReplayConfig["compare"]): string {
  const url = new URL(boardHref(cfg, slug));
  url.searchParams.set("compare", compare);
  return url.toString();
}

/** The player races a board's ranked rows that have a recording; a
 * comparison needs two. False when the board has fewer. */
export function canReplay(board: BoardFile): boolean {
  return board.rows.filter((r) => r.replay).length >= 2;
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
