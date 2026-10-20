import { useRef, useState } from "react";
import type { CoursePlan, PickerLabels } from "../../lib/data";
import Button from "../ui/Button";
import { MONO_NOTE, fill, moduleRange, numberRange } from "./learnStyles";

/** "10-week course: Modules A to D, Labs 1 to 6, Races 1 and 2." for the
 * live region, from courses.json catalog.picker. */
function announce(labels: PickerLabels, f: PlanFacts): string {
  return (
    [
      fill(labels.announce, { title: f.plan.title, modules: moduleRange(f.plan.modules) }),
      f.labs.length ? fill(labels.announce_labs, { labs: numberRange(f.labs) }) : "",
      f.races.length
        ? fill(f.races.length === 1 ? labels.announce_race : labels.announce_races, { races: numberRange(f.races) })
        : "",
    ]
      .filter(Boolean)
      .join(", ") + "."
  );
}

/** What the summary and the cards say about one plan, worked out once by
 * PlanLadder from `plans` and `outline`. */
export type PlanFacts = {
  plan: CoursePlan;
  /** Lab numbers, from the plan's lab ids. */
  labs: number[];
  /** Race numbers: the races its modules end with. */
  races: number[];
  /** The final project's length when the plan runs every module it spans. */
  projectWeeks: number | null;
};

type PickerProps = {
  plans: CoursePlan[];
  /** courses.json catalog.picker */
  labels: PickerLabels;
  selected: string | null;
  onSelect: (id: string | null) => void;
};

/**
 * The catalog's plan picker: native radios drawn as a mono segmented control
 * (Tab reaches the group, the arrow keys move along it, as any radio group).
 * Nothing is checked until the reader picks, so the ladder first reads as the
 * three plans side by side. The picked segment fills violet with white text
 * (Cedric's colour brief, 2026-10-20: selected states in accent); the others
 * are an accent outline. "Show all three" keeps its place while hidden, so
 * the row never shifts.
 */
export default function PlanPicker({ plans, labels, selected, onSelect }: PickerProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    onSelect(null);
    // The button hides itself: hand focus back to the group, not the page.
    groupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
      <p id="plan-picker-label" className={MONO_NOTE}>
        {labels.label}
      </p>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby="plan-picker-label"
        className="flex w-full rounded-btn border border-rr-violet/40 bg-paper-50 sm:w-auto"
      >
        {plans.map((p, i) => {
          const on = selected === p.id;
          const edge = `${i === 0 ? "rounded-l-[0.1875rem]" : ""} ${i === plans.length - 1 ? "rounded-r-[0.1875rem]" : ""}`;
          return (
            <label key={p.id} className="relative flex-1 cursor-pointer border-l border-rr-violet/25 first:border-l-0 sm:flex-none">
              <input
                type="radio"
                name="plan-picker"
                value={p.id}
                checked={on}
                onChange={() => onSelect(p.id)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-10 items-center justify-center whitespace-nowrap px-5 font-mono text-small font-semibold tabular-nums transition-colors duration-[var(--duration-fast)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rr-violet motion-reduce:transition-none coarse:min-h-11 ${edge} ${
                  on ? "bg-rr-violet text-white" : "text-text-strong hover:bg-rr-violet/10 hover:text-rr-violet-deep"
                }`}
              >
                {fill(labels.option, { weeks: p.weeks })}
              </span>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        onClick={clear}
        className={`self-start font-mono text-small text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 sm:self-auto coarse:min-h-11 ${
          selected ? "" : "invisible"
        }`}
      >
        {labels.clear}
      </button>
    </div>
  );
}

type SummaryProps = {
  facts: PlanFacts[];
  labels: PickerLabels;
  selected: string | null;
  classTime: string;
};

/**
 * What the picked plan covers, under the ladder: modules, labs, races, the
 * final project where it runs, and the one solid CTA to the plan's page. All
 * four states (none picked and each plan) sit in one grid cell and only the
 * current one is visible, so the block is always as tall as its tallest
 * state: picking never moves anything below it. Class time is the same for
 * every plan (the syllabus), so it stays put under the swap.
 */
export function PlanSummary({ facts, labels, selected, classTime }: SummaryProps) {
  const current = facts.find((f) => f.plan.id === selected);
  // "All three plans shown" is news only after a pick, never on first paint.
  const [picked, setPicked] = useState(false);
  if (current && !picked) setPicked(true);
  return (
    <div className="rounded-card border border-rr-violet/20 bg-rr-violet/6 p-5 md:p-6">
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <p className={`max-w-[48ch] text-body text-text-body md:self-center ${current ? "invisible" : ""}`}>
          {labels.idle}
        </p>
        {facts.map((f) => (
          <div
            key={f.plan.id}
            className={`flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10 ${
              current === f ? "" : "invisible"
            }`}
          >
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-10 lg:gap-x-12">
              <div>
                <dt className={MONO_NOTE}>{labels.modules}</dt>
                <dd className="mt-1 font-mono text-body font-semibold sm:text-lead text-rr-violet-deep">{moduleRange(f.plan.modules)}</dd>
              </div>
              <div>
                <dt className={MONO_NOTE}>{labels.labs}</dt>
                <dd className="mt-1 font-mono text-body font-semibold sm:text-lead tabular-nums text-rr-violet-deep">{numberRange(f.labs)}</dd>
              </div>
              {f.races.length > 0 && (
                <div>
                  <dt className={MONO_NOTE}>{f.races.length === 1 ? labels.race : labels.races}</dt>
                  <dd className="mt-1 font-mono text-body font-semibold sm:text-lead tabular-nums text-rr-violet-deep">
                    {numberRange(f.races)}
                  </dd>
                </div>
              )}
              {f.projectWeeks !== null && (
                <div>
                  <dt className={MONO_NOTE}>{labels.project}</dt>
                  <dd className="mt-1 font-mono text-body font-semibold sm:text-lead text-rr-violet-deep">
                    {fill(labels.project_value, { weeks: f.projectWeeks })}
                  </dd>
                </div>
              )}
            </dl>
            <Button href={`/learn/courses/${f.plan.id}`} className="w-full sm:w-auto sm:self-start md:self-auto">
              {fill(labels.cta, { title: f.plan.title })}
            </Button>
          </div>
        ))}
      </div>
      <p className={`mt-5 border-t border-rr-violet/15 pt-4 ${MONO_NOTE}`}>
        <span className="block max-w-[72ch]">
          <span className="text-text-strong">{labels.class_time}</span>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">: </span>
          {classTime}
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {current ? announce(labels, current) : picked ? labels.cleared : ""}
      </p>
    </div>
  );
}
