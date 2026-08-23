import type { MapEvent, UpcomingEvent } from "../../lib/data";

type SeasonChainProps = {
  /** In calendar order; the spotlight race is included and marked. */
  events: UpcomingEvent[];
  /** events_map, for the ordinal and the held/upcoming state. */
  map: MapEvent[];
};

/** "31st RoboRacer ... (IROS 2026)" -> "IROS 2026" without inventing a name. */
function shortName(e: UpcomingEvent): string {
  return e.short_name ?? e.title;
}

function ordinalFor(e: UpcomingEvent, map: MapEvent[]): number | undefined {
  const city = e.location.split(",")[0].trim().toLowerCase();
  const hit = map.find((m) => m.city.toLowerCase() === city && m.status === "upcoming");
  return hit?.number;
}

/**
 * The rest of the 2026 season as a chain rather than a card grid: one row per
 * race, the ordinal in mono, the name, dates and city, and the race's own
 * site. The spotlight race carries a "next" tag so the chain and the hero
 * agree about which one is next.
 */
export default function SeasonChain({ events, map }: SeasonChainProps) {
  if (events.length === 0) return null;
  return (
    <ol className="flex flex-col">
      {events.map((e) => {
        const n = ordinalFor(e, map);
        return (
          <li
            key={e.url}
            className="grid gap-x-8 gap-y-2 border-t border-ink-950/10 py-6 md:grid-cols-12 md:items-baseline"
          >
            <span className="font-mono text-small tabular-nums text-text-muted md:col-span-1">
              {n ? String(n).padStart(2, "0") : "--"}
            </span>
            <div className="min-w-0 md:col-span-5">
              <h3>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-lead font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                >
                  {shortName(e)}
                </a>
                {e.spotlight && (
                  <span className="ml-3 rounded-sm border border-ink-950/15 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
                    next
                  </span>
                )}
              </h3>
              {/* The official long form stays on the page, but small: the
                  short name is what a reader scans the chain by. */}
              {e.short_name && <p className="mt-1 max-w-[46ch] text-small text-text-muted">{e.title}</p>}
            </div>
            <p className="font-mono text-small text-text-muted md:col-span-3">{e.dates}</p>
            <p className="font-mono text-small text-text-muted md:col-span-3">{e.location}</p>
          </li>
        );
      })}
    </ol>
  );
}
