import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { useNow } from "./useNow";
import {
  boardHref,
  dataBase,
  fetchBoardJson,
  formatAgo,
  formatDay,
  formatValue,
  isBoardFile,
  isBoardIndex,
  loadLeaderboardConfig,
  pickFeatured,
  shortBoardLabel,
  siblingBoards,
  topRows,
  type BoardFile,
  type BoardSummary,
  type LeaderboardConfig,
} from "./leaderboardData";

type Phase = "loading" | "ready" | "empty" | "error";

const DEFAULT_LIMIT = 5;

const CHIP_BASE =
  "rounded-pill px-4 py-2 text-small font-semibold transition-colors duration-[var(--duration-fast)]";
const CHIP_IDLE = "border border-paper-200 text-text-body hover:border-text-muted";
const CHIP_ON = "border border-ink-950 bg-ink-950 text-text-on-ink";

const pad = (n: number) => String(n).padStart(2, "0");

/** A grey bar the height of a line of text, for the loading state. It sits
 * inside the same cell as the real value, so the row keeps its height. */
function Bar({ w }: { w: string }) {
  return <span aria-hidden="true" className={`inline-block h-[0.7em] ${w} rounded-sm bg-paper-200 align-middle`} />;
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
 */
export default function Leaderboard() {
  const [cfg, setCfg] = useState<LeaderboardConfig | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, BoardFile | "error">>({});
  const life = useRef<AbortController | null>(null);
  const now = useNow(60_000);

  useEffect(() => {
    const ctrl = new AbortController();
    life.current = ctrl;
    const fail = () => {
      if (!ctrl.signal.aborted) setPhase("error");
    };
    (async () => {
      const config = await loadLeaderboardConfig(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setCfg(config);
      const index = await fetchBoardJson<unknown>(`${dataBase(config)}index.json`, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (!isBoardIndex(index)) throw new Error("index.json: unexpected shape");
      const featured = pickFeatured(index, config, Date.now());
      if (!featured) {
        setPhase("empty");
        return;
      }
      const file = await fetchBoardJson<unknown>(`${dataBase(config)}${featured.file}`, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (!isBoardFile(file)) throw new Error(`${featured.file}: unexpected shape`);
      setBoards(siblingBoards(index, featured));
      setSelected(featured.slug);
      setFiles({ [featured.slug]: file });
      setPhase(topRows(file, config.limit ?? DEFAULT_LIMIT).length > 0 ? "ready" : "empty");
    })().catch(fail);
    return () => ctrl.abort();
  }, []);

  const choose = (slug: string) => {
    setSelected(slug);
    const summary = boards.find((b) => b.slug === slug);
    const signal = life.current?.signal;
    if (!cfg || !summary || !signal || files[slug]) return;
    fetchBoardJson<unknown>(`${dataBase(cfg)}${summary.file}`, signal)
      .then((f) => setFiles((prev) => ({ ...prev, [slug]: isBoardFile(f) ? f : "error" })))
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

  const link = (
    <div className="mt-8 min-h-[3.1rem]">
      {href && (
        <Button href={href} variant="secondary" target="_blank" rel="noopener noreferrer">
          See the full leaderboard <span aria-hidden="true">↗</span>
        </Button>
      )}
    </div>
  );

  if (phase === "error" || phase === "empty") {
    return (
      <div className="max-w-2xl border-t border-ink-950/10 pt-5">
        <p className="text-body text-text-body">
          {phase === "error" ? "The lap times did not load here." : "No clean laps on the board yet this term."}
        </p>
        {link}
      </div>
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
            <div role="group" aria-label="Board" className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
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
            <p className="mt-3 flex min-h-10 items-center font-mono text-small text-text-muted">
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
                      <th
                        scope="row"
                        className="py-4 pr-4 text-left font-display text-lead font-semibold text-text-strong"
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
