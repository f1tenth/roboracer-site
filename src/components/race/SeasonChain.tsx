import type { MapEvent } from "../../lib/data";
import {
  NEXT_TAG,
  STATE_TAG,
  STREAM_UNCONFIRMED_TAG,
  seasonRows,
  type SeasonEvent,
} from "./eventState";
import { useNow } from "./useNow";

type SeasonChainProps = {
  /** In calendar order; the spotlight race is included and marked. */
  events: SeasonEvent[];
  /** events_map, for the ordinal in the left column. */
  map: MapEvent[];
};

/** "31st RoboRacer ... (IROS 2026)" -> "IROS 2026" without inventing a name. */
function shortName(e: SeasonEvent): string {
  return e.short_name ?? e.title;
}

/**
 * The series ordinal, matched on city and year rather than on the map's
 * held/upcoming flag, so the number survives the map rebuild that moves a
 * finished race into the held set.
 */
function ordinalFor(e: SeasonEvent, map: MapEvent[]): number | undefined {
  const city = e.location.split(",")[0].trim().toLowerCase();
  const year = new Date(e.starts_at ?? "").getFullYear();
  const byCity = map.filter((m) => m.city.toLowerCase() === city);
  const hit = Number.isNaN(year)
    ? byCity.find((m) => m.status === "upcoming")
    : byCity.find((m) => m.year === year);
  return hit?.number;
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-sm border border-ink-950/15 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
      {children}
    </span>
  );
}

/**
 * The live tag: the word, a small solid dot, and nothing else. It does not
 * blink and it does not animate in any motion preference, so there is no
 * reduced-motion variant to get wrong.
 */
function LiveTag({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-rr-magenta/45 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-rr-magenta-deep">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rr-magenta" />
      {children}
    </span>
  );
}

/**
 * The 2026 season as a chain rather than a card grid: one row per race, the
 * series ordinal in mono, the name, dates and city, and the race's own site.
 *
 * Every row's state is computed from the `starts_at` / `ends_at` instants in
 * upcoming_events.json (see ./eventState), never written against a named
 * event, so a race starts reading Live on its first day and stops on its own
 * the day after it ends without anyone touching the repo. While a race is
 * live the row also carries a watch link, which falls back to the race's own
 * site with a "to be confirmed" tag rather than ever pointing nowhere.
 */
export default function SeasonChain({ events, map }: SeasonChainProps) {
  const now = useNow();
  if (events.length === 0) return null;
  const rows = seasonRows(events, now);

  return (
    <ol className="flex flex-col">
      {rows.map(({ event: e, state, isNext, watch }) => {
        const n = ordinalFor(e, map);
        const stateTag = STATE_TAG[state];
        return (
          <li
            key={e.url}
            className="grid gap-x-8 gap-y-2 border-t border-ink-950/10 py-6 md:grid-cols-12 md:items-baseline"
          >
            <span className="font-mono text-small tabular-nums text-text-muted md:col-span-1">
              {n ? String(n).padStart(2, "0") : "--"}
            </span>
            <div className="min-w-0 md:col-span-5">
              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-lead font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                >
                  {shortName(e)}
                </a>
                {state === "live" && stateTag ? (
                  <LiveTag>{stateTag}</LiveTag>
                ) : (
                  stateTag && <Tag>{stateTag}</Tag>
                )}
                {isNext && <Tag>{NEXT_TAG}</Tag>}
              </h3>
              {/* The official long form stays on the page, but small: the
                  short name is what a reader scans the chain by. */}
              {e.short_name && <p className="mt-1 max-w-[46ch] text-small text-text-muted">{e.title}</p>}
              {watch && (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-small">
                  <a
                    href={watch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                  >
                    watch &#8599;
                  </a>
                  {watch.unconfirmed && <Tag>{STREAM_UNCONFIRMED_TAG}</Tag>}
                </p>
              )}
            </div>
            <p className="font-mono text-small text-text-muted md:col-span-3">{e.dates}</p>
            <p className="font-mono text-small text-text-muted md:col-span-3">{e.location}</p>
          </li>
        );
      })}
    </ol>
  );
}
