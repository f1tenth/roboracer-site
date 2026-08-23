import { useEffect, useState } from "react";
import Button from "./Button";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type NextRaceSpotlightProps = {
  title: string;
  /** Big line on top, e.g. "IROS 2026, Pittsburgh" (landing v5 round two);
   * the dates then sit right under it. Without it the dates are the headline. */
  headline?: string;
  datesHeadline: string;
  datesSecondary?: string;
  registerHref: string;
  registerNote?: string;
  /** The registration deadline as an instant. On the race page this is the
   * urgent number, so it counts down live above the race's own start. */
  deadlineAt?: string;
  rulesHref?: string;
  /** Race page: the rules live on this site, so the button stays internal. */
  rulesInternal?: boolean;
  startsAt: string;
  on?: "paper" | "ink";
  /** The panel sits under an h2 on the landing and directly under the page's
   * h1 in the race hero, so the heading level follows its container. */
  headingAs?: "h2" | "h3";
};

type Remaining = { days: number; hours: number; minutes: number };

function remainingUntil(iso: string): Remaining | null {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const m = Math.floor(ms / 60000);
  return { days: Math.floor(m / 1440), hours: Math.floor((m % 1440) / 60), minutes: m % 60 };
}

/**
 * The next-race call to teams as a hairline panel, one column (landing v5
 * round two, Cedric: headline "IROS 2026, Pittsburgh", the dates under it,
 * then starts-in / registration-closes right below, then the buttons): the
 * headline in tight display type, the dates as the lead, logistics as mono
 * data lines with a single-line countdown (no big digit blocks) and the
 * section's one solid CTA. The official long title closes the panel in
 * small type. Reduced motion: the countdown renders once, without ticking.
 */
export default function NextRaceSpotlight({
  title,
  headline,
  datesHeadline,
  datesSecondary,
  registerHref,
  registerNote,
  deadlineAt,
  rulesHref,
  rulesInternal = false,
  startsAt,
  on = "paper",
  headingAs: Heading = "h3",
}: NextRaceSpotlightProps) {
  const ink = on === "ink";
  const reduced = usePrefersReducedMotion();
  const [remaining, setRemaining] = useState<Remaining | null>(() => remainingUntil(startsAt));
  const [toDeadline, setToDeadline] = useState<Remaining | null>(() =>
    deadlineAt ? remainingUntil(deadlineAt) : null,
  );

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setRemaining(remainingUntil(startsAt));
      setToDeadline(deadlineAt ? remainingUntil(deadlineAt) : null);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [startsAt, deadlineAt, reduced]);

  // Once the deadline is behind us the row says so rather than counting
  // negative or vanishing without explanation.
  const deadlinePassed = Boolean(deadlineAt) && toDeadline === null;

  const strong = ink ? "text-text-on-ink" : "text-text-strong";
  const muted = ink ? "text-text-on-ink-muted" : "text-text-muted";
  return (
    <article
      className={`flex h-full flex-col gap-8 rounded-card border p-8 md:p-10 ${ink ? "border-text-on-ink/15" : "border-ink-950/10 bg-paper-50"}`}
    >
      <div>
        {headline ? (
          <>
            <Heading className={`font-display text-display-l font-semibold ${strong}`}>{headline}</Heading>
            <p className={`mt-3 font-display text-display-s font-semibold ${strong}`}>{datesHeadline}</p>
          </>
        ) : (
          <Heading className={`font-display text-display-l font-semibold ${strong}`}>{datesHeadline}</Heading>
        )}
        {datesSecondary && <p className={`mt-3 text-lead ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}>{datesSecondary}</p>}
      </div>
      <dl className={`flex max-w-[44ch] flex-col gap-2 border-t pt-6 font-mono text-small ${muted} ${ink ? "border-text-on-ink/15" : "border-ink-950/10"}`}>
        {remaining && (
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
            <dt>starts in</dt>
            <dd className={`tabular-nums ${strong}`}>
              {remaining.days}d {String(remaining.hours).padStart(2, "0")}h{" "}
              {String(remaining.minutes).padStart(2, "0")}m
            </dd>
          </div>
        )}
        {registerNote && (
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
            <dt>registration closes</dt>
            <dd className={`tabular-nums ${strong}`}>{registerNote}</dd>
          </div>
        )}
        {deadlineAt && (
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
            <dt>{deadlinePassed ? "registration" : "closes in"}</dt>
            <dd className={`tabular-nums ${strong}`}>
              {deadlinePassed
                ? "closed"
                : `${toDeadline?.days}d ${String(toDeadline?.hours ?? 0).padStart(2, "0")}h ${String(
                    toDeadline?.minutes ?? 0,
                  ).padStart(2, "0")}m`}
            </dd>
          </div>
        )}
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
          <dt>format</dt>
          <dd className={strong}>multi-agent, up to 4 cars</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-4">
        <Button href={registerHref} on={on} variant="primary" target="_blank" rel="noopener noreferrer">
          Register your team
        </Button>
        {rulesHref &&
          (rulesInternal ? (
            <Button href={rulesHref} on={on} variant="secondary">
              Read the rules
            </Button>
          ) : (
            <Button href={rulesHref} on={on} variant="secondary" target="_blank" rel="noopener noreferrer">
              Rules
            </Button>
          ))}
      </div>
      <p className={`mt-auto max-w-[55ch] text-small ${muted}`}>{title}</p>
    </article>
  );
}
