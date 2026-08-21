import { useEffect, useState } from "react";
import Button from "./Button";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type NextRaceSpotlightProps = {
  /** e.g. "31st RoboRacer Autonomous Racing Competition at IROS 2026" */
  title: string;
  /** Public-copy headline, e.g. "September 28 to 30, 2026, Pittsburgh" */
  datesHeadline: string;
  /** Secondary line, e.g. "Check-in and practice September 27" */
  datesSecondary?: string;
  registerHref: string;
  registerNote?: string;
  rulesHref?: string;
  /** ISO start of the competition, drives the countdown. */
  startsAt: string;
};

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntil(iso: string): Remaining | null {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * The next-race call to teams: dates and city lead, register CTA, countdown
 * in mono digits. Reduced motion shows a static days count (no ticking).
 */
export default function NextRaceSpotlight({
  title,
  datesHeadline,
  datesSecondary,
  registerHref,
  registerNote,
  rulesHref,
  startsAt,
}: NextRaceSpotlightProps) {
  const reduced = usePrefersReducedMotion();
  const [remaining, setRemaining] = useState<Remaining | null>(() => remainingUntil(startsAt));

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setRemaining(remainingUntil(startsAt)), 1000);
    return () => window.clearInterval(id);
  }, [startsAt, reduced]);

  return (
    <article className="rounded-card border border-ink-700 bg-ink-800 p-8 md:p-12">
      <p className="eyebrow mb-4 text-rr-magenta">Next race</p>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h3 className="font-display text-display-l font-semibold text-text-on-ink">
            {datesHeadline}
          </h3>
          {datesSecondary && (
            <p className="mt-2 text-lead text-text-on-ink-muted">{datesSecondary}</p>
          )}
          <p className="mt-4 text-body text-text-on-ink-muted">{title}</p>
        </div>
        {remaining && (
          <div aria-label="Time until the competition starts" className="flex gap-6">
            {(
              [
                ["days", remaining.days],
                ["hrs", remaining.hours],
                ["min", remaining.minutes],
                ...(reduced ? [] : [["sec", remaining.seconds] as [string, number]]),
              ] as [string, number][]
            ).map(([unit, n]) => (
              <div key={unit} className="text-center">
                <p className="font-mono text-display-m font-semibold tabular-nums text-text-on-ink">
                  {String(n).padStart(2, "0")}
                </p>
                <p className="eyebrow mt-1 text-text-on-ink-muted">{unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button href={registerHref} on="ink" variant="primary" target="_blank" rel="noreferrer">
          Register your team
        </Button>
        {rulesHref && (
          <Button href={rulesHref} on="ink" variant="secondary" target="_blank" rel="noreferrer">
            Rules and resources
          </Button>
        )}
        {registerNote && <p className="text-small text-text-on-ink-muted">{registerNote}</p>}
      </div>
    </article>
  );
}
