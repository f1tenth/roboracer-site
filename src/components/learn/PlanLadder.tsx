import { Link } from "react-router-dom";
import { lectureSelection, type CoursesFile, type CoursePlan } from "../../lib/data";
import Reveal from "../ui/Reveal";
import LearnLink from "./LearnLink";
import PlanPicker, { PlanSummary, type PlanFacts } from "./PlanPicker";
import { LINK, MONO_NOTE, moduleRange, numberRange } from "./learnStyles";

/** Micro-labels and pictures this unit introduced. Stage 3 moves them into
 * courses.json (docs/learn/COURSES_INTERACTIVITY.md, section 3);
 * docs/qa/courses-catalog.md lists them. */
const LABELS = {
  selected: "Selected",
  weeks: (n: number) => `${n} weeks`,
  modules: (ids: string[]) => `Modules ${moduleRange(ids)}`,
  labs: (ns: number[]) => `Labs ${numberRange(ns)}`,
  races: (ns: number[]) => `${ns.length === 1 ? "Race" : "Races"} ${numberRange(ns)}`,
  chips: "At a glance",
};

/** A competition photo per plan, from public/media (docs/ASSET_MANIFEST.md,
 * "Courses catalog"). A plan id without one gets a violet panel instead. */
const PLAN_PHOTOS: Record<string, { src: string; width: number; height: number; alt: string }> = {
  "4-weeks": {
    src: "/media/platform/platform-learn-1200.webp",
    width: 1200,
    height: 750,
    alt: "Two students assembling a car on the pit floor",
  },
  "10-weeks": {
    src: "/media/highlights/highlight-icra2026-chase-02-poster.webp",
    width: 960,
    height: 540,
    alt: "Two cars nose to tail through a chicane of white boxes at ICRA 2026",
  },
  "15-weeks": {
    src: "/media/highlights/highlight-icra2026-overtake-01-poster.webp",
    width: 960,
    height: 540,
    alt: "Cars racing between the orange barriers at ICRA 2026",
  },
};

const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;

type PlanLadderProps = {
  courses: CoursesFile;
  /** plans[].id picked in the picker or a card; null shows all three. */
  selected: string | null;
  onSelect: (id: string | null) => void;
};

/** The plan's labs, races and final project, from `plans` and `outline`. */
function planFacts(courses: CoursesFile, plan: CoursePlan): PlanFacts {
  const { labs, races, final_project: project } = courses.outline;
  return {
    plan,
    labs: plan.labs
      .map((id) => labs.find((l) => l.id === id)?.number)
      .filter((n): n is number => typeof n === "number"),
    races: races.filter((r) => plan.modules.includes(r.module)).map((r) => r.number),
    projectWeeks: project.modules.every((id) => plan.modules.includes(id)) ? project.weeks : null,
  };
}

/** State changes fade in 180 ms (the system's Micro duration); instant under
 * reduced motion. */
const FADE =
  "transition-[opacity,background-color,color] duration-[var(--duration-fast)] motion-reduce:transition-none";

/**
 * The catalog's one explanatory visual, and the place to choose: the course's
 * seven modules across, the three plans as rows, each a solid ink bar over
 * the modules it covers and a dashed hairline over the rest, so the three
 * read as one course cut at three lengths, each ending on a race. A real
 * table (the "included" state is text a screen reader reads by row and
 * column), built from lectureSelection() so it cannot disagree with `plans`.
 *
 * The picker above it chooses one plan: its bar turns violet and the other
 * rows' bars dim (their labels keep full contrast), the modules it covers get
 * a violet letter and a 2px accent rule, and the summary under the table
 * answers with what the plan holds and the link to its page. The plans
 * themselves follow as three photo cards; clicking one picks it too, and its
 * "See the ..." link still goes to the page.
 */
export default function PlanLadder({ courses, selected, onSelect }: PlanLadderProps) {
  const rows = lectureSelection(courses);
  const { plans } = courses;
  const racesByModule = new Map(courses.outline.races.map((r) => [r.module, r]));
  const facts = plans.map((p) => planFacts(courses, p));
  const picked = plans.find((p) => p.id === selected);

  return (
    <div className="flex flex-col gap-10 desktop:gap-12">
      <PlanPicker plans={plans} selected={selected} onSelect={onSelect} />

      <Reveal className="flex flex-col gap-8">
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
              <th scope="col" className={`pb-4 text-left align-top font-normal ${MONO_NOTE}`}>
                {/* Keeps the label on the letters' line under the rule. */}
                <span aria-hidden="true" className="mb-3 block h-0.5" />
                <span className="block pt-[0.35em]">Plan</span>
              </th>
              {rows.map((r) => {
                const covered = !!picked && r.plans.includes(picked.id);
                return (
                  <th key={r.module.id} scope="col" className="pb-4 pr-2 text-left align-top font-normal md:pr-4">
                    {/* The picked plan's modules: a 2px accent rule, drawn
                        always and shown by opacity, so nothing moves. */}
                    <span
                      aria-hidden="true"
                      className={`mb-3 block h-0.5 bg-rr-violet ${FADE} ${covered ? "opacity-100" : "opacity-0"}`}
                    />
                    <span
                      className={`block font-mono text-display-s font-semibold ${FADE} ${covered ? "text-rr-violet" : "text-text-strong"}`}
                    >
                      {r.module.id}
                    </span>
                    {/* The name shows from lg, where it wraps in three lines at
                        most; narrower, the letter alone fits the column (at 768
                        "Introduction" ran into B), and the outline below names
                        every module. */}
                    <span className="sr-only lg:not-sr-only lg:mt-2 lg:block lg:text-small lg:leading-snug lg:text-text-body">
                      {r.module.title}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const dim = !!picked && picked.id !== p.id;
              const lit = picked?.id === p.id;
              return (
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
                            className={`block h-2.5 md:h-3 ${first ? "rounded-l-full" : ""} ${last ? "mr-2 rounded-r-full md:mr-4" : ""} ${FADE} ${lit ? "bg-rr-violet" : "bg-ink-950"} ${dim ? "opacity-15" : "opacity-100"}`}
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className={`block border-t border-dashed border-ink-950/30 ${FADE} ${dim ? "opacity-40" : "opacity-100"}`}
                          />
                        )}
                        <span className="sr-only">{on ? "included" : "not included"}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
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

        <PlanSummary facts={facts} selected={picked?.id ?? null} classTime={courses.meta.class_time.text} />
      </Reveal>

      {/* The plans as cards: a photo with the length on it, the blurb, the
          plan's facts as accent chips. The title is a toggle button stretched
          over the whole card (its ::after), so a click anywhere picks the
          plan and a second click shows all three again; the page link sits
          above it. The focus ring is drawn on the card (outside its clipped
          edge), so it never merges with the picked card's violet border. Every card carries the 3px accent top rule; the picked one
          adds a violet border and a "Selected" badge. */}
      <Reveal stagger className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {facts.map(({ plan: p, labs, races }) => {
          const on = picked?.id === p.id;
          const photo = PLAN_PHOTOS[p.id];
          return (
            <article
              key={p.id}
              aria-labelledby={`plan-${p.id}`}
              className={`relative flex flex-col overflow-hidden rounded-card border-2 md:max-lg:flex-row bg-paper-50 shadow-card transition-[box-shadow,translate,border-color] duration-[var(--duration-fast)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-[3px] before:bg-rr-violet hover:shadow-card-hover has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-4 has-[button:focus-visible]:outline-rr-violet motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none ${
                on ? "border-rr-violet" : "border-transparent"
              }`}
            >
              {/* From 768 to 1023 the card lies on its side (photo left), as
                  three columns there wrapped the blurb into a ribbon. */}
              <div className="relative aspect-[16/9] overflow-hidden bg-rr-violet md:max-lg:aspect-auto md:max-lg:min-h-60 md:max-lg:w-2/5 md:max-lg:shrink-0">
                {photo && (
                  <img
                    src={asset(photo.src)}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover md:max-lg:absolute md:max-lg:inset-0"
                  />
                )}
                {/* The scrim under the length, so white type reads on any frame. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/25 to-transparent"
                />
                <p
                  aria-hidden="true"
                  className="absolute bottom-4 left-5 font-display text-display-m font-semibold text-text-on-ink lg:bottom-5 lg:left-6"
                >
                  {LABELS.weeks(p.weeks)}
                </p>
                <span
                  className={`absolute top-4 right-4 rounded-pill bg-rr-violet px-3 py-1 font-mono text-small font-semibold text-white ${FADE} ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  {LABELS.selected}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 lg:p-7">
                <h3 id={`plan-${p.id}`} className="font-display text-display-s font-semibold text-text-strong">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onSelect(on ? null : p.id)}
                    className="cursor-pointer text-left after:absolute after:inset-0 after:z-[1] after:rounded-card focus-visible:outline-none"
                  >
                    {p.title}
                  </button>
                </h3>
                <p className="max-w-[48ch] text-body text-text-body">{p.blurb}</p>
                <ul aria-label={LABELS.chips} className="flex flex-wrap gap-2">
                  {[LABELS.weeks(p.weeks), LABELS.modules(p.modules), LABELS.labs(labs), races.length ? LABELS.races(races) : ""]
                    .filter(Boolean)
                    .map((chip) => (
                      <li
                        key={chip}
                        className="rounded-pill bg-rr-violet/10 px-3 py-1 font-mono text-small font-semibold text-rr-violet-deep"
                      >
                        {chip}
                      </li>
                    ))}
                </ul>
                {p.effort_hours_per_week !== null && (
                  <p className={MONO_NOTE}>{p.effort_hours_per_week} h a week</p>
                )}
                <p className="mt-auto pt-2 text-body font-semibold">
                  <LearnLink href={`/learn/courses/${p.id}`} className="relative z-10">{`See the ${p.title}`}</LearnLink>
                </p>
              </div>
            </article>
          );
        })}
      </Reveal>
    </div>
  );
}
