import type { MapEvent } from "../../lib/data";
import { PHOTO_HEIGHT, PHOTO_WIDTH, racePhoto } from "./racePhotos";

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
 * One tile per race, always the same 16:9 box with the same hairline border,
 * so a year of photographs and a year without them read as the same timeline.
 *
 * Where no photo is on file the box holds the RoboRacer mark on paper: a tile
 * that was designed to be empty, not a frame that failed to load.
 */
function PhotoTile({ event }: { event: MapEvent }) {
  const photo = racePhoto(event.id);
  return (
    <div className="w-32 shrink-0 overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 sm:w-48 md:w-64 lg:w-72">
      <div className="relative" style={{ aspectRatio: `${PHOTO_WIDTH} / ${PHOTO_HEIGHT}` }}>
        {photo ? (
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src="/logo-square.svg"
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="absolute left-1/2 top-1/2 h-[42%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-25"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Every competition the series has held, newest first, grouped by year: the
 * ordinal in mono where the race has one, a photograph of the race, the name,
 * the city, and a link to the event's own page.
 *
 * Link rule (pages v1): no anchor on this page leads nowhere. `url_status`
 * comes from `events_map.json` and was checked by hand — `live` links
 * straight out, `archive` links to a Wayback capture and says so, and `none`
 * renders as plain text with a tag rather than a dead anchor. The eleven
 * broken links the audit found were relative `*.html` paths that resolved
 * against /race into the SPA's 404, one empty href, and three dead domains.
 */
/** Years from this one on stay open; everything earlier folds away. */
const OPEN_FROM_YEAR = 2025;

function YearRow({ year, list }: { year: number; list: MapEvent[] }) {
  return (
    <li className="grid gap-x-8 gap-y-4 border-t border-ink-950/10 py-8 md:grid-cols-12">
          <h3 className="font-mono text-small text-text-muted md:col-span-2">{year}</h3>
          <ul className="flex flex-col gap-6 md:col-span-10">
            {list.map((e) => {
              const meta = [e.city, e.country].filter(Boolean).join(", ");
              const tags = [
                KIND_TAG[e.kind],
                e.status === "virtual" ? "online" : undefined,
                e.url_status === "archive" ? "archived page" : undefined,
                e.url_status === "none" ? "no page" : undefined,
              ].filter(Boolean) as string[];
              return (
                <li key={e.id} className="flex items-start gap-4 sm:gap-5">
                  <PhotoTile event={e} />
                  <div className="flex min-w-0 grow flex-wrap items-baseline gap-x-4 gap-y-1">
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
                  </div>
                </li>
              );
            })}
      </ul>
    </li>
  );
}

/**
 * Ten years of racing is a long column, and the section after it - who
 * competes - was being pushed off the bottom of the page (Cedric,
 * 2026-08-23). Recent years stay open; everything from 2024 back folds into
 * one disclosure.
 *
 * A native <details> rather than React state: it opens with JavaScript
 * disabled, it is keyboard-operable and screen-reader-announced for free, and
 * browser find-in-page can reach the closed content.
 */
export default function RaceTimeline({ events }: RaceTimelineProps) {
  const groups = yearsDescending(events);
  const recent = groups.filter(([year]) => year >= OPEN_FROM_YEAR);
  const earlier = groups.filter(([year]) => year < OPEN_FROM_YEAR);
  const earlierCount = earlier.reduce((n, [, list]) => n + list.length, 0);
  const firstYear = earlier.length ? earlier[earlier.length - 1][0] : undefined;
  const lastYear = earlier.length ? earlier[0][0] : undefined;

  return (
    <>
      <ol className="flex flex-col">
        {recent.map(([year, list]) => (
          <YearRow key={year} year={year} list={list} />
        ))}
      </ol>
      {earlier.length > 0 && (
        <details className="group border-t border-ink-950/10">
          {/* "events", not "races": four of these are mad games, a workshop and
              a course race, and the rows carry those tags. */}
          <summary className="flex cursor-pointer list-none items-center gap-3 py-7 font-display text-lead font-semibold text-text-strong transition-colors hover:text-rr-violet">
            <span
              aria-hidden="true"
              className="inline-block text-display-m leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90"
            >
              &#8250;
            </span>
            <span className="group-open:hidden">
              Show {earlierCount} earlier events, {firstYear} to {lastYear}
            </span>
            <span className="hidden group-open:inline">
              Hide the {firstYear} to {lastYear} events
            </span>
          </summary>
          <ol className="flex flex-col">
            {earlier.map(([year, list]) => (
              <YearRow key={year} year={year} list={list} />
            ))}
          </ol>
        </details>
      )}
    </>
  );
}
