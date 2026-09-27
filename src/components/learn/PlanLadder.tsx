import { Link } from "react-router-dom";
import { lectureSelection, type CoursesFile, type CoursePlan } from "../../lib/data";
import Reveal from "../ui/Reveal";
import LearnLink from "./LearnLink";
import { LINK, MONO_NOTE, moduleRange, numberRange } from "./learnStyles";

type PlanLadderProps = { courses: CoursesFile };

/** Lab numbers of a plan, from its lab ids. */
function planLabs(courses: CoursesFile, plan: CoursePlan): number[] {
  return plan.labs
    .map((id) => courses.outline.labs.find((l) => l.id === id)?.number)
    .filter((n): n is number => typeof n === "number");
}

/** Races a plan reaches: the ones its modules end with. */
function planRaces(courses: CoursesFile, plan: CoursePlan) {
  return courses.outline.races.filter((r) => plan.modules.includes(r.module));
}

/**
 * The catalog's one explanatory visual: the course's seven modules across,
 * the three plans as rows. Each plan is a solid ink bar over the modules it
 * covers and a dashed hairline over the rest, so the three read as one
 * course cut at three lengths, each ending on a race. A real table (the
 * numbers and the "included" state are text a screen reader reads by row and
 * column), built from lectureSelection() so it cannot disagree with `plans`.
 * Under it the plans themselves as a ruled spec sheet, each linking to its
 * course page.
 */
export default function PlanLadder({ courses }: PlanLadderProps) {
  const rows = lectureSelection(courses);
  const { plans } = courses;
  const racesByModule = new Map(courses.outline.races.map((r) => [r.module, r]));

  return (
    <div className="flex flex-col gap-12 desktop:gap-16">
      <Reveal>
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">Modules, labs and races in each plan</caption>
          <colgroup>
            <col className="w-[4.75rem] md:w-[8.5rem]" />
            {rows.map((r) => (
              <col key={r.module.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={`pb-4 pt-[0.35em] text-left align-top font-normal ${MONO_NOTE}`}>
                Plan
              </th>
              {rows.map((r) => (
                <th key={r.module.id} scope="col" className="pb-4 pr-2 text-left align-top font-normal md:pr-4">
                  <span className="block font-mono text-display-s font-semibold text-text-strong">{r.module.id}</span>
                  {/* The name shows from lg, where it wraps in three lines at
                      most; narrower, the letter alone fits the column (at 768
                      "Introduction" ran into B), and the outline below names
                      every module. */}
                  <span className="sr-only lg:not-sr-only lg:mt-2 lg:block lg:text-small lg:leading-snug lg:text-text-body">
                    {r.module.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-ink-950/10">
                <th scope="row" className="py-5 pr-3 text-left align-middle font-normal md:py-6">
                  <Link
                    to={`/learn/courses/${p.id}`}
                    className={`font-mono text-small font-semibold whitespace-nowrap md:text-body ${LINK}`}
                  >
                    {p.weeks} weeks
                  </Link>
                </th>
                {rows.map((r, i) => {
                  const on = r.plans.includes(p.id);
                  const first = on && !rows[i - 1]?.plans.includes(p.id);
                  const last = on && !rows[i + 1]?.plans.includes(p.id);
                  return (
                    <td key={r.module.id} className="px-0 py-5 align-middle md:py-6">
                      {on ? (
                        <span
                          aria-hidden="true"
                          className={`block h-2.5 bg-ink-950 md:h-3 ${first ? "rounded-l-full" : ""} ${last ? "mr-2 rounded-r-full md:mr-4" : ""}`}
                        />
                      ) : (
                        <span aria-hidden="true" className="block border-t border-dashed border-ink-950/30" />
                      )}
                      <span className="sr-only">{on ? "included" : "not included"}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot className="font-mono text-small text-text-body">
            <tr className="border-t border-ink-950/10">
              <th scope="row" className={`pt-4 pb-2 text-left align-top font-normal ${MONO_NOTE}`}>
                Labs
              </th>
              {rows.map((r) => (
                <td key={r.module.id} className="pt-4 pb-2 pr-2 align-top tabular-nums">
                  {r.labs.length ? (
                    <span className="flex flex-col md:flex-row md:gap-2">
                      {r.labs.map((l) => (
                        <span key={l.id}>{l.number}</span>
                      ))}
                    </span>
                  ) : (
                    <>
                      <span aria-hidden="true" className="text-text-muted">·</span>
                      <span className="sr-only">none</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className={`py-2 text-left align-top font-normal ${MONO_NOTE}`}>
                Race
              </th>
              {rows.map((r) => {
                const race = racesByModule.get(r.module.id);
                return (
                  <td key={r.module.id} className="py-2 pr-2 align-top tabular-nums">
                    {race ? race.number : ""}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </Reveal>

      <Reveal
        stagger
        className="grid border-t border-ink-950/10 md:grid-cols-3 md:divide-x md:divide-ink-950/10"
      >
        {plans.map((p) => {
          const labs = planLabs(courses, p);
          const races = planRaces(courses, p);
          return (
            <article
              key={p.id}
              aria-labelledby={`plan-${p.id}`}
              className="flex flex-col gap-4 border-b border-ink-950/10 py-8 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <h3 id={`plan-${p.id}`} className="font-display text-display-s font-semibold text-text-strong lg:text-display-m">
                {p.title}
              </h3>
              <p className="max-w-[48ch] text-body text-text-body">{p.blurb}</p>
              <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-small">
                <dt className="text-text-muted">Modules</dt>
                <dd className="text-text-strong">{moduleRange(p.modules)}</dd>
                <dt className="text-text-muted">Labs</dt>
                <dd className="text-text-strong">{numberRange(labs)}</dd>
                {races.length > 0 && (
                  <>
                    <dt className="text-text-muted">Races</dt>
                    <dd className="text-text-strong">{numberRange(races.map((r) => r.number))}</dd>
                  </>
                )}
                {p.effort_hours_per_week !== null && (
                  <>
                    <dt className="text-text-muted">Effort</dt>
                    <dd className="text-text-strong">{p.effort_hours_per_week} h a week</dd>
                  </>
                )}
              </dl>
              <p className="mt-auto pt-2 text-body font-semibold">
                <LearnLink href={`/learn/courses/${p.id}`}>{`See the ${p.title}`}</LearnLink>
              </p>
            </article>
          );
        })}
      </Reveal>
    </div>
  );
}
