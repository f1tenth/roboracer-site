import type { UpcomingEvent } from "../../lib/data";

/** The season chain's view of an event. The end instant, venue and stream
 * fields now live on the shared type; this alias keeps the call sites reading
 * as season rows rather than generic upcoming events. */
export type SeasonEvent = UpcomingEvent;

export type EventState = "upcoming" | "live" | "concluded";

/**
 * The tag each state shows. Nothing on this page writes the word "Live"
 * against a named event: the label is looked up from a state that was
 * computed from the instants in the JSON, so IFAC 2026 starts reading Live on
 * its own first race day and stops on its own the day it ends, with no commit
 * in between.
 */
export const STATE_TAG: Record<EventState, string | null> = {
  upcoming: null,
  live: "Live",
  concluded: "concluded",
};

/** The soonest event that has not started yet. */
export const NEXT_TAG = "next";

/** Shown beside the watch link while `stream_status` is not `confirmed`. */
export const STREAM_UNCONFIRMED_TAG = "stream link to be confirmed";

function instant(iso: string | undefined): number {
  if (!iso) return Number.NaN;
  return Date.parse(iso);
}

/**
 * upcoming -> live -> concluded, from the instants alone.
 *
 * The instants are venue-local (a race in Busan is live on Busan's calendar),
 * so a reader anywhere sees the same answer to "is it running right now".
 * An event with no usable start instant stays `upcoming`: the calm failure is
 * the one that never claims a race is live.
 */
export function eventState(e: SeasonEvent, now: number): EventState {
  const start = instant(e.starts_at);
  const end = instant(e.ends_at);
  if (!Number.isNaN(end) && now > end) return "concluded";
  if (!Number.isNaN(start) && now >= start) return "live";
  return "upcoming";
}

export type SeasonRow = {
  event: SeasonEvent;
  state: EventState;
  /** True on the soonest event that has not started; at most one row. */
  isNext: boolean;
  /** Non-null only while the event is live and a link exists to point at. */
  watch: { href: string; unconfirmed: boolean } | null;
};

/**
 * The season in calendar order with each row's state resolved once, so the
 * component below is markup only.
 *
 * `watch` never returns a dead link: it falls back to the event's own site
 * when no stream URL is on file, and flags that the stream itself is still
 * unconfirmed.
 */
export function seasonRows(events: SeasonEvent[], now: number): SeasonRow[] {
  const ordered = [...events].sort((a, b) => {
    const sa = instant(a.starts_at);
    const sb = instant(b.starts_at);
    if (Number.isNaN(sa) || Number.isNaN(sb)) return 0;
    return sa - sb;
  });

  const nextIndex = ordered.findIndex((e) => eventState(e, now) === "upcoming");

  return ordered.map((event, i) => {
    const state = eventState(event, now);
    const href = event.stream_url ?? event.url;
    return {
      event,
      state,
      isNext: i === nextIndex,
      watch: state === "live" && href ? { href, unconfirmed: event.stream_status !== "confirmed" } : null,
    };
  });
}
