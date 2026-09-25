import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import Button from "../ui/Button";
import { useNow } from "./useNow";
import {
  FALLBACK_CONFIG,
  boardHref,
  dataBase,
  fetchBoardJson,
  formatAgo,
  formatDay,
  formatValue,
  loadLeaderboardConfig,
  pickFeatured,
  readBoardFile,
  readBoardIndex,
  shortBoardLabel,
  siblingBoards,
  topRows,
  type BoardFile,
  type BoardSummary,
  type LeaderboardConfig,
} from "./leaderboardData";

type Phase = "loading" | "ready" | "empty" | "error";

const DEFAULT_LIMIT = 5;

/** A tab that comes back after this long re-reads the board (the board
 * rebuilds every five minutes). */
const REFRESH_AFTER_MS = 60_000;

// Chips are 2.75rem tall on touch screens only (coarse:), the same size as
// TagFilter's, so the two chip rows stay one component and the mouse layout
// never moves (RACE-02).
const CHIP_BASE =
  "rounded-pill px-4 py-2 text-small font-semibold transition-colors duration-[var(--duration-fast)] coarse:min-h-11";
const CHIP_IDLE = "border border-paper-200 text-text-body hover:border-text-muted";
const CHIP_ON = "border border-ink-950 bg-ink-950 text-text-on-ink";

const pad = (n: number) => String(n).padStart(2, "0");

/** A grey bar the height of a line of text, for the loading state. It sits
 * inside the same cell as the real value, so the row keeps its height. */
function Bar({ w }: { w: string }) {
  return <span aria-hidden="true" className={`inline-block h-[0.7em] ${w} rounded-sm bg-paper-200 align-middle`} />;
}

function BoardLink({ href }: { href?: string }) {
  return (
    <div className="mt-8 min-h-[3.1rem]">
      {href && (
        <Button href={href} variant="secondary" target="_blank" rel="noopener noreferrer">
          See the full leaderboard <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </Button>
      )}
    </div>
  );
}

/** The one-line state (error or empty) with the way out to the full board. */
function Notice({ text, href }: { text: string; href?: string }) {
  return (
    <div className="max-w-2xl border-t border-ink-950/10 pt-5">
      <p className="text-body text-text-body">{text}</p>
      <BoardLink href={href} />
    </div>
  );
}

const ERROR_TEXT = "The lap times did not load here.";

/** Anything the validation missed and throws at render shows the error line
 * and the link to the board, not a /race without its last section. */
class LeaderboardBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Leaderboard failed to render", error);
  }

  render() {
    return this.state.failed ? <Notice text={ERROR_TEXT} href={boardHref(FALLBACK_CONFIG)} /> : this.props.children;
  }
}

export default function Leaderboard() {
  return (
    <LeaderboardBoundary>
      <LeaderboardBlock />
    </LeaderboardBoundary>
  );
}

/**
 * The top of the ESE 6150 class leaderboard, read live from the board's own
 * public JSON (see ./leaderboardData and docs/LEADERBOARD.md).
 *
 * It features one board: the most recently opened lab with a ranked lap. When
 * that lab has more than one board with laps (lab 4 ranks a plain lap and an
 * obstacle lap) a two-chip switch picks between them; boards of other labs
 * stay on the board's own site, behind the link.
 *
 * Every state keeps the way out: while loading, the table's frame is drawn
 * with the same rows and cell sizes, so nothing below moves when the laps
 * arrive; when the board cannot be reached, or has no lap yet, one line says
 * so and the link to the full board stays. Nothing here animates.
 *
 * Every field is validated before it reaches state (./leaderboardData), the
 * config falls back to a bundled copy, and a tab that comes back after a
 * minute re-reads the board, keeping the last good laps only if that read
 * fails: a board that answers with no ranked lab is empty now. A board
 * switch made while that read runs stands: the read only refreshes the cache.
 */
function LeaderboardBlock() {
  const [cfg, setCfg] = useState<LeaderboardConfig | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, BoardFile | "error">>({});
  const life = useRef<AbortController | null>(null);
  // The board the reader is on, for a refresh that runs in the effect below.
  const selectedRef = useRef<string | null>(null);
  // When each cached board file arrived, so a refresh can keep the files
  // fetched while it ran and drop the older ones (fetched again when chosen).
  const fetchedAt = useRef<Record<string, number>>({});
  const now = useNow(60_000);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const ctrl = new AbortController();
    life.current = ctrl;
    const { signal } = ctrl;
    let config: LeaderboardConfig | null = null;
    let loadedAt = 0;
    let busy = false;
    // The first read ends in the error state on failure; a refresh that
    // fails keeps the last good board instead.
    const read = async (first: boolean) => {
      if (busy) return;
      busy = true;
      // The board on screen as the read starts. A switch made while it runs
      // wins over what the read would restore (a refresh used to put the old
      // board back and replace the cache, dropping the chosen board's file).
      const asked = selectedRef.current;
      const started = Date.now();
      try {
        if (!config) {
          config = await loadLeaderboardConfig(signal);
          if (signal.aborted) return;
          setCfg(config);
        }
        const index = readBoardIndex(await fetchBoardJson<unknown>(`${dataBase(config)}index.json`, signal));
        if (signal.aborted) return;
        if (!index) throw new Error("index.json: unexpected shape");
        const featured = pickFeatured(index, config, Date.now());
        if (!featured) {
          // A valid answer with no ranked lab (a new term, a board reset):
          // last read's laps are not on the board any more, so they go.
          fetchedAt.current = {};
          setBoards([]);
          setSelected(null);
          setFiles({});
          setPhase("empty");
          loadedAt = Date.now();
          return;
        }
        const siblings = siblingBoards(index, featured);
        // A refresh stays on the board the reader switched to, while it has laps.
        const shown = (!first && siblings.find((b) => b.slug === asked)) || featured;
        const file = readBoardFile(await fetchBoardJson<unknown>(`${dataBase(config)}${shown.file}`, signal));
        if (signal.aborted) return;
        if (!file) throw new Error(`${shown.file}: unexpected shape`);
        fetchedAt.current[shown.slug] = Date.now();
        const current = selectedRef.current;
        const moved = !first && current !== asked && siblings.some((b) => b.slug === current);
        // Merged into the cache: the board on screen and any file fetched
        // while this read ran stay; older files of the lab are dropped, so a
        // later switch fetches them fresh.
        const keep = new Set(
          siblings
            .filter((b) => b.slug === current || (fetchedAt.current[b.slug] ?? 0) >= started)
            .map((b) => b.slug),
        );
        setBoards(siblings);
        if (!moved) setSelected(shown.slug);
        setFiles((prev) => {
          const next: Record<string, BoardFile | "error"> = {};
          for (const slug of keep) if (prev[slug]) next[slug] = prev[slug];
          next[shown.slug] = file;
          return next;
        });
        setPhase(topRows(file, config.limit).length > 0 ? "ready" : "empty");
        loadedAt = Date.now();
      } catch {
        if (first && !signal.aborted) setPhase("error");
      } finally {
        busy = false;
      }
    };
    void read(true);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - loadedAt > REFRESH_AFTER_MS) void read(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ctrl.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const choose = (slug: string) => {
    // The ref too, at once: a refresh finishing before the next render must
    // see the switch.
    selectedRef.current = slug;
    setSelected(slug);
    const summary = boards.find((b) => b.slug === slug);
    const signal = life.current?.signal;
    if (!cfg || !summary || !signal || files[slug]) return;
    fetchBoardJson<unknown>(`${dataBase(cfg)}${summary.file}`, signal)
      .then((f) => {
        fetchedAt.current[slug] = Date.now();
        setFiles((prev) => ({ ...prev, [slug]: readBoardFile(f) ?? "error" }));
      })
      .catch(() => {
        if (!signal.aborted) setFiles((prev) => ({ ...prev, [slug]: "error" }));
      });
  };

  const limit = cfg?.limit ?? DEFAULT_LIMIT;
  const href = cfg ? boardHref(cfg, selected ?? undefined) : undefined;
  const summary = boards.find((b) => b.slug === selected);
  const loaded = selected ? files[selected] : undefined;
  const board = loaded && loaded !== "error" ? loaded : undefined;
  const switchFailed = loaded === "error";

  const link = <BoardLink href={href} />;

  if (phase === "error" || phase === "empty") {
    return (
      <Notice
        text={phase === "error" ? ERROR_TEXT : "No clean laps on the board yet this term."}
        href={boardHref(cfg ?? FALLBACK_CONFIG, selected ?? undefined)}
      />
    );
  }

  // Loading, or ready. A switch to a board not fetched yet draws the same
  // skeleton rows in place of the old board's times.
  const anonymous = board ? board.anonymous !== false : summary?.anonymous !== false;
  const metric = board?.metric ?? summary?.metric;
  const extra = cfg?.extra ? metric?.extras?.find((e) => e.key === cfg.extra) : undefined;
  const rows = board ? topRows(board, limit) : [];
  const skeleton = !board;
  const labTitle = board?.lab_title ?? summary?.lab_title ?? board?.title ?? summary?.title;
  const boardTitle = board?.board_title ?? summary?.board_title;
  const total = board?.rows.length ?? summary?.rows;
  const noun = anonymous ? (total === 1 ? "driver" : "drivers") : total === 1 ? "team" : "teams";
  const dueAt = board?.due ?? summary?.due;
  const closed = dueAt ? Date.parse(dueAt) < now : false;
  const updated = formatAgo(board?.generated_at, now);

  return (
    <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12" aria-busy={skeleton && !switchFailed}>
      <div className="lg:col-span-8">
        <div className="border-t border-ink-950/10 pt-5">
          <h3 className="font-display text-display-s font-semibold text-text-strong">
            {labTitle ?? <Bar w="w-64" />}
          </h3>
          {/* The board line and the switch share one minimum height (a chip's),
              so the skeleton, a one-board lab and a two-board lab line up. */}
          {boards.length > 1 ? (
            <div role="group" aria-label="Board" className="mt-3 flex min-h-10 flex-wrap items-center gap-2 coarse:min-h-11">
              {boards.map((b) => (
                <button
                  key={b.slug}
                  type="button"
                  aria-pressed={b.slug === selected}
                  onClick={() => choose(b.slug)}
                  className={`${CHIP_BASE} ${b.slug === selected ? CHIP_ON : CHIP_IDLE}`}
                >
                  {/* Phones get the short label, so the switch stays one row. */}
                  <span className="sm:hidden">{shortBoardLabel(b.board_title ?? b.title)}</span>
                  <span className="hidden sm:inline">{b.board_title ?? b.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 flex min-h-10 items-center font-mono text-small text-text-muted coarse:min-h-11">
              {boardTitle ?? <Bar w="w-40" />}
            </p>
          )}
        </div>

        {switchFailed ? (
          <p className="mt-6 text-body text-text-body">This board did not load here.</p>
        ) : (
          <table className="mt-6 w-full border-collapse">
            <caption className="sr-only">
              {skeleton
                ? "Loading lap times"
                : `${labTitle}, ${boardTitle ?? ""}: the top ${rows.length} of ${total} ${noun}`}
            </caption>
            <thead>
              <tr className="border-b border-ink-950/10 font-mono text-small text-text-muted">
                <th scope="col" className="w-14 pb-3 pr-4 text-left font-normal">
                  <span aria-hidden="true">#</span>
                  <span className="sr-only">Rank</span>
                </th>
                <th scope="col" className="w-full pb-3 pr-4 text-left font-normal">
                  {skeleton ? "" : anonymous ? "Driver" : "Team"}
                </th>
                <th scope="col" className="whitespace-nowrap pb-3 pl-4 text-right font-normal">
                  {skeleton ? "" : (metric?.label ?? "Lap time")}
                </th>
                {(extra || skeleton) && (
                  <th scope="col" className="hidden whitespace-nowrap pb-3 pl-8 text-right font-normal sm:table-cell">
                    {skeleton ? "" : (extra?.label ?? "")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {skeleton
                ? Array.from({ length: limit }, (_, i) => (
                    <tr key={i} className="border-b border-ink-950/10">
                      <td className="py-4 pr-4 font-mono text-small tabular-nums text-text-muted">{pad(i + 1)}</td>
                      <td className="py-4 pr-4 font-display text-lead font-semibold">
                        <Bar w="w-36" />
                      </td>
                      <td className="py-4 pl-4 text-right font-mono text-lead">
                        <Bar w="w-16" />
                      </td>
                      <td className="hidden py-4 pl-8 text-right font-mono text-small sm:table-cell">
                        <Bar w="w-14" />
                      </td>
                    </tr>
                  ))
                : rows.map((r) => (
                    <tr key={r.alias} className="border-b border-ink-950/10">
                      <td className="py-4 pr-4 font-mono text-small tabular-nums text-text-muted">{pad(r.rank)}</td>
                      {/* A long team name wraps inside its column instead of
                          widening the table past a phone's width, where the
                          page's overflow clip would cut the lap times off
                          (RACE-03). */}
                      <th
                        scope="row"
                        className="py-4 pr-4 text-left font-display text-lead font-semibold text-text-strong [overflow-wrap:anywhere]"
                      >
                        {r.alias}
                      </th>
                      <td className="whitespace-nowrap py-4 pl-4 text-right font-mono text-lead tabular-nums text-text-strong">
                        {formatValue(r.metric, metric?.unit ?? "")}
                      </td>
                      {extra && (
                        <td className="hidden whitespace-nowrap py-4 pl-8 text-right font-mono text-small tabular-nums text-text-muted sm:table-cell">
                          {formatValue(r.extras?.[extra.key], extra.unit)}
                        </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="lg:col-span-4">
        <dl className="flex flex-col gap-2 border-t border-ink-950/10 pt-5 font-mono text-small text-text-muted">
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>ranked</dt>
            <dd className="tabular-nums text-text-strong">
              {typeof total === "number" ? `${total} ${noun}` : <Bar w="w-20" />}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>{closed ? "lab closed" : "lab closes"}</dt>
            <dd className="tabular-nums text-text-strong">{formatDay(dueAt) ?? <Bar w="w-16" />}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>updated</dt>
            <dd className="tabular-nums text-text-strong">{updated ?? <Bar w="w-20" />}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>source</dt>
            <dd className="text-text-strong">{cfg?.label ?? <Bar w="w-32" />}</dd>
          </div>
        </dl>
        {link}
      </div>
    </div>
  );
}
