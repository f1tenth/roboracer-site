import { useEffect, useState } from "react";
import Button from "./Button";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type NextRaceSpotlightProps = {
  title: string;
  datesHeadline: string;
  datesSecondary?: string;
  registerHref: string;
  registerNote?: string;
  rulesHref?: string;
  startsAt: string;
  on?: "paper" | "ink";
};

type Remaining = { days: number; hours: number; minutes: number };

function remainingUntil(iso: string): Remaining | null {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const m = Math.floor(ms / 60000);
  return { days: Math.floor(m / 1440), hours: Math.floor((m % 1440) / 60), minutes: m % 60 };
}

/**
 * The next-race call to teams as a hairline panel, 7/5 split: dates lead in
 * tight display type; logistics on the right as mono data lines with a
 * single-line countdown (no big digit blocks) and the section's one solid
 * CTA. Reduced motion: the countdown renders once, without ticking.
 */
export default function NextRaceSpotlight({
  title,
  datesHeadline,
  datesSecondary,
  registerHref,
  registerNote,
  rulesHref,
  startsAt,
  on = "paper",
}: NextRaceSpotlightProps) {
  const ink = on === "ink";
  const reduced = usePrefersReducedMotion();
  const [remaining, setRemaining] = useState<Remaining | null>(() => remainingUntil(startsAt));

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setRemaining(remainingUntil(startsAt)), 30_000);
    return () => window.clearInterval(id);
  }, [startsAt, reduced]);

  const strong = ink ? "text-text-on-ink" : "text-text-strong";
  const muted = ink ? "text-text-on-ink-muted" : "text-text-muted";
  return (
    <article
      className={`grid gap-8 rounded-card border p-8 md:grid-cols-12 md:p-10 ${ink ? "border-text-on-ink/15" : "border-ink-950/10 bg-paper-50"}`}
    >
      <div className="md:col-span-7">
        <h3 className={`font-display text-display-l font-semibold ${strong}`}>{datesHeadline}</h3>
        {datesSecondary && <p className={`mt-3 text-lead ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}>{datesSecondary}</p>}
        <p className={`mt-5 max-w-[55ch] text-small ${muted}`}>{title}</p>
      </div>
      <div className={`flex flex-col justify-between gap-6 border-ink-950/10 md:col-span-5 md:border-l md:pl-8 ${ink ? "md:border-text-on-ink/15" : ""}`}>
        <dl className={`flex flex-col gap-2 font-mono text-small ${muted}`}>
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
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
            <dt>format</dt>
            <dd className={strong}>multi-agent, 4 cars</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={registerHref} on={on} variant="primary" target="_blank" rel="noopener noreferrer">
            Register your team
          </Button>
          {rulesHref && (
            <Button href={rulesHref} on={on} variant="secondary" target="_blank" rel="noopener noreferrer">
              Rules
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
