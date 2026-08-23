import type { MapEvent } from "../../lib/data";

type RaceTimelineProps = {
  events: MapEvent[];
};

/** Anything that is not a plain race says so, in mono, next to the name. */
const KIND_TAG: Record<string, string> = {
  madgames: "mad games",
  workshop: "workshop",
  course: "course race",
};

function yearsDescending(events: MapEvent[]): [number, MapEvent[]][] {
  const byYear = new Map<number, MapEvent[]>();
  for (const e of events) {
    const list = byYear.get(e.year);
    if (list) list.push(e);
    else byYear.set(e.year, [e]);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => [year, list.sort((a, b) => (b.number ?? 0) - (a.number ?? 0))]);
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-sm border border-ink-950/15 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
      {children}
    </span>
  );
}

/**
 * Every competition the series has held, newest first, grouped by year: the
 * ordinal in mono where the race has one, the name, the city, and a link to
 * the event's own page.
 *
 * Link rule (pages v1): no anchor on this page leads nowhere. `url_status`
 * comes from `events_map.json` and was checked by hand — `live` links
 * straight out, `archive` links to a Wayback capture and says so, and `none`
 * renders as plain text with a tag rather than a dead anchor. The eleven
 * broken links the audit found were relative `*.html` paths that resolved
 * against /race into the SPA's 404, one empty href, and three dead domains.
 */
export default function RaceTimeline({ events }: RaceTimelineProps) {
  const groups = yearsDescending(events);
  return (
    <ol className="flex flex-col">
      {groups.map(([year, list]) => (
        <li key={year} className="grid gap-x-8 gap-y-4 border-t border-ink-950/10 py-8 md:grid-cols-12">
          <h3 className="font-mono text-small text-text-muted md:col-span-2">{year}</h3>
          <ul className="flex flex-col gap-5 md:col-span-10">
            {list.map((e) => {
              const meta = [e.city, e.country].filter(Boolean).join(", ");
              const tags = [
                KIND_TAG[e.kind],
                e.status === "virtual" ? "online" : undefined,
                e.url_status === "archive" ? "archived page" : undefined,
                e.url_status === "none" ? "no page" : undefined,
              ].filter(Boolean) as string[];
              return (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="w-10 shrink-0 font-mono text-small tabular-nums text-text-muted">
                    {e.number ? String(e.number).padStart(2, "0") : "--"}
                  </span>
                  <span className="min-w-0 grow">
                    {e.url ? (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-lead font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                      >
                        {e.label}
                      </a>
                    ) : (
                      <span className="font-display text-lead font-semibold text-text-strong">{e.label}</span>
                    )}
                    <span className="ml-3 font-mono text-small text-text-muted">{meta}</span>
                  </span>
                  {tags.length > 0 && (
                    <span className="flex flex-wrap items-center gap-2">
                      {tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
