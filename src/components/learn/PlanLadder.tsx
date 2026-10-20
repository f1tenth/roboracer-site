import { useRef } from "react";
import { Link } from "react-router-dom";
import { lectureSelection, type CoursesFile, type CoursePlan } from "../../lib/data";
import { gsap, useGSAP, MOTION_OK_QUERY, EASE_OUT_EXPO, DURATION } from "../../lib/motion";
import Reveal from "../ui/Reveal";
import LearnLink from "./LearnLink";
import { CourseIcon } from "./Ledger";
import { PlanSummary, type PlanFacts } from "./PlanPicker";
import { INK_NOTE, LINK_INK, fill, moduleRange, numberRange } from "./learnStyles";

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

/** The runs of consecutive modules a plan covers, as [first, last] column
 * indexes (one run for every plan today: each starts at A). */
function coveredRuns(covered: boolean[]): [number, number][] {
  const runs: [number, number][] = [];
  covered.forEach((on, i) => {
    if (!on) return;
    const last = runs[runs.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else runs.push([i, i]);
  });
  return runs;
}

/** State changes fade in 180 ms (the system's Micro duration); instant under
 * reduced motion. */
const FADE =
  "transition-[opacity,background-color,border-color,color] duration-[var(--duration-fast)] motion-reduce:transition-none";

/** A hairline at each module column's left edge, drawn as a background so it
 * takes no width: the chart's grid. */
const GUIDE = "bg-[linear-gradient(90deg,rgb(245_245_250/0.08)_1px,transparent_1px)]";

/**
 * "Pick your length", the catalog's centrepiece on ink: the course's seven
 * modules across, the three plans as rows, each a bar in the logo gradient
 * over the modules it covers and a dashed hairline over the rest, so the
 * three read as one course cut at three lengths, each ending on a race. The
 * gradient (`bg-gradient-scale`, index.css) is laid over the whole span A to
 * G and every bar shows only the part it reaches: the 4-week bar stays at the
 * cyan end, the 10-week bar is the logo's own cyan into magenta, the 15-week
 * bar runs on into violet (Cedric, 2026-10-20: the more you learn, the
 * better). On ink because that gradient is the logo's ink colouring; its
 * cyan end is 1.9:1 on paper.
 *
 * A real table (the "included" state is text a screen reader reads by row
 * and column), built from lectureSelection() so it cannot disagree with
 * `plans`. The picker in the section header chooses one plan: its bar stays
 * at full strength and the others dim (their labels keep full contrast), the
 * modules it covers fill their badges with their part of the gradient, its
 * labs and races light up, and the summary under the table answers with what
 * the plan holds and the one solid button to its page. The bars draw from
 * left to right once the table is in view; under reduced motion they stand
 * drawn. The plans then follow as three photo cards whose top rule is the
 * plan's share of the same gradient; clicking one picks it too, and its "See
 * the ..." link still goes to the page.
 */
export default function PlanLadder({ courses, selected, onSelect }: PlanLadderProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const rows = lectureSelection(courses);
  const n = rows.length;
  const { plans } = courses;
  const racesByModule = new Map(courses.outline.races.map((r) => [r.module, r]));
  const facts = plans.map((p) => planFacts(courses, p));
  const picked = plans.find((p) => p.id === selected);
  const pickedFacts = facts.find((f) => f.plan.id === picked?.id);
  const pickedLabs = new Set(picked?.labs ?? []);
  const { picker, ladder } = courses.catalog;
  const weeks = (w: number) => fill(ladder.weeks, { weeks: w });

  // The bars draw from their first module to their last, row after row, once
  // (transform only; nothing under reduced motion, where they stand drawn).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from("[data-ladder-bar]", {
          scaleX: 0,
          duration: DURATION.slow,
          ease: EASE_OUT_EXPO,
          stagger: 0.15,
          clearProps: "transform",
          scrollTrigger: { trigger: tableRef.current, start: "top 75%", once: true },
        });
      });
    },
    { scope: tableRef },
  );

  return (
    <div>
      <table
        ref={tableRef}
        className="w-full table-fixed border-collapse [--ladder-gap:0.375rem] md:[--ladder-gap:1rem]"
      >
        <caption className="sr-only">Modules, labs and races in each plan</caption>
        <colgroup>
          <col className="w-[4.5rem] md:w-[8.5rem]" />
          {rows.map((r) => (
            <col key={r.module.id} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={`pb-5 text-left align-top font-normal ${INK_NOTE}`}>
              <span className="flex h-8 items-center md:h-12">Plan</span>
            </th>
            {rows.map((r, i) => {
              const covered = !!pickedFacts && r.plans.includes(pickedFacts.plan.id);
              // The module's own stretch of the scale.
              const slice = { backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${(i / (n - 1)) * 100}% 0` };
              return (
                <th key={r.module.id} scope="col" className={`pb-5 pr-1 text-left align-top font-normal md:pr-4 ${GUIDE}`}>
                  {/* The letter in a badge keyed by its colour on the scale;
                      a picked plan's modules fill with it, drawn always and
                      shown by opacity, so nothing moves. */}
                  <span
                    className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-btn border md:h-12 md:w-12 ${FADE} ${
                      covered ? "border-text-on-ink/60" : "border-text-on-ink/20"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-scale ${FADE} ${covered ? "opacity-45" : "opacity-0"}`}
                      style={slice}
                    />
                    <span className="relative font-mono text-small font-semibold text-text-on-ink md:text-lead">
                      {r.module.id}
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-scale" style={slice} />
                  </span>
                  {/* The name shows from lg, where it wraps in three lines at
                      most; narrower, the letter alone fits the column, and
                      the outline below names every module. */}
                  <span className="sr-only lg:not-sr-only lg:mt-3 lg:block lg:pr-2 lg:text-small lg:leading-snug lg:text-text-on-ink-muted">
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
            const covered = rows.map((r) => r.plans.includes(p.id));
            return (
              <tr key={p.id} className="border-t border-text-on-ink/10">
                <th scope="row" className="py-5 pr-2 text-left align-middle font-normal md:py-7">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`hidden h-1 w-1 shrink-0 bg-text-on-ink md:block ${FADE} ${lit ? "opacity-100" : "opacity-0"}`}
                    />
                    <Link
                      to={`/learn/courses/${p.id}`}
                      className={`font-mono text-small font-semibold whitespace-nowrap md:text-body ${LINK_INK}`}
                    >
                      {weeks(p.weeks)}
                    </Link>
                  </span>
                </th>
                {rows.map((r, i) => (
                  <td key={r.module.id} className={`px-0 py-5 align-middle md:py-7 ${GUIDE}`}>
                    <span className="relative block h-2.5 md:h-3.5">
                      {/* Each run is one bar across all seven columns,
                          clipped to the modules it covers, so it shows its
                          own stretch of the one gradient. */}
                      {i === 0 &&
                        coveredRuns(covered).map(([from, to]) => (
                          <span
                            key={from}
                            aria-hidden="true"
                            data-ladder-bar=""
                            className={`absolute inset-y-0 left-0 bg-gradient-scale ${FADE} ${dim ? "opacity-25" : "opacity-100"}`}
                            style={{
                              width: `calc(${n} * 100%)`,
                              clipPath: `inset(0 calc(${((n - 1 - to) / n) * 100}% + var(--ladder-gap)) 0 ${(from / n) * 100}% round 9999px)`,
                              transformOrigin: `${(from / n) * 100}% 50%`,
                            }}
                          />
                        ))}
                      {!covered[i] && (
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 top-1/2 border-t border-dashed border-text-on-ink/25 ${FADE} ${dim ? "opacity-40" : "opacity-100"}`}
                        />
                      )}
                    </span>
                    <span className="sr-only">{covered[i] ? "included" : "not included"}</span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="font-mono text-small">
          <tr className="border-t border-text-on-ink/10">
            <th scope="row" className={`pt-5 pb-2 text-left align-top font-normal ${INK_NOTE}`}>
              {picker.labs}
            </th>
            {rows.map((r) => (
              <td key={r.module.id} className={`pt-5 pb-2 pr-1 align-top tabular-nums ${GUIDE}`}>
                {r.labs.length ? (
                  <span className="flex flex-col pl-1 md:flex-row md:flex-wrap md:gap-x-2 md:pl-2">
                    {r.labs.map((l) => (
                      <span
                        key={l.id}
                        className={`${FADE} ${pickedLabs.has(l.id) ? "font-semibold text-text-on-ink" : "text-text-on-ink-muted"}`}
                      >
                        {l.number}
                      </span>
                    ))}
                  </span>
                ) : (
                  <>
                    <span aria-hidden="true" className="pl-1 text-text-on-ink-muted md:pl-2">
                      ·
                    </span>
                    <span className="sr-only">none</span>
                  </>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className={`pt-2 pb-1 text-left align-top font-normal ${INK_NOTE}`}>
              {picker.race}
            </th>
            {rows.map((r) => {
              const race = racesByModule.get(r.module.id);
              const on = !picked || picked.modules.includes(r.module.id);
              return (
                <td key={r.module.id} className={`pt-2 pb-1 pr-1 align-top tabular-nums ${GUIDE}`}>
                  {race && (
                    <span
                      className={`flex flex-col gap-0.5 pl-1 md:flex-row md:items-center md:gap-1.5 md:pl-2 ${FADE} ${
                        on ? "text-text-on-ink" : "text-text-on-ink-muted"
                      }`}
                    >
                      <CourseIcon id="races" color="" className="h-3.5 w-3.5" />
                      {race.number}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 md:mt-10">
        <PlanSummary facts={facts} labels={picker} selected={picked?.id ?? null} classTime={courses.meta.class_time.text} />
      </div>

      {/* The plans as picture cards on ink: the plan's share of the course
          as the top rule (its stretch of the ladder's gradient), a photo
          with the length on it, the blurb and the plan's facts. The title is
          a toggle button stretched over the whole card (its ::after), so a
          click anywhere picks the plan and a second click shows all three
          again; the page link sits above it. The picked card rings its photo
          in violet and says "Selected". */}
      <Reveal stagger className="mt-14 grid gap-12 md:gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-8">
        {facts.map(({ plan: p, labs, races }) => {
          const on = picked?.id === p.id;
          const share = p.modules.length / n;
          // courses.json `card_photo` (docs/ASSET_MANIFEST.md CC-02 to CC-04);
          // a plan without one shows the ink panel.
          const photo = p.card_photo;
          return (
            <article
              key={p.id}
              aria-labelledby={`plan-${p.id}`}
              className="relative flex flex-col rounded-media transition-[translate] duration-[var(--duration-fast)] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-8 has-[button:focus-visible]:outline-text-on-ink motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              <span aria-hidden="true" className="relative block h-1.5 overflow-hidden rounded-pill bg-text-on-ink/10">
                <span
                  className="absolute inset-y-0 left-0 rounded-pill bg-gradient-scale"
                  style={{ width: `${share * 100}%`, backgroundSize: `${100 / share}% 100%` }}
                />
              </span>
              <div className="mt-4 flex flex-1 flex-col gap-5 md:max-lg:flex-row md:max-lg:gap-8">
                {/* From 768 to 1023 the card lies on its side (photo left), as
                    three columns there wrapped the blurb into a ribbon. */}
                <div
                  className={`relative aspect-[16/9] overflow-hidden rounded-media bg-ink-800 ring-2 ${FADE} lg:aspect-[4/3] md:max-lg:aspect-auto md:max-lg:min-h-64 md:max-lg:w-[45%] md:max-lg:shrink-0 ${
                    on ? "ring-rr-violet" : "ring-transparent"
                  }`}
                >
                  {photo && (
                    <img
                      src={asset(photo.src)}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      style={photo.position ? { objectPosition: photo.position } : undefined}
                      className="h-full w-full object-cover md:max-lg:absolute md:max-lg:inset-0"
                    />
                  )}
                  {/* The scrim under the length, so white type reads on any frame. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/20 to-transparent"
                  />
                  <p
                    aria-hidden="true"
                    className="absolute bottom-4 left-5 font-display text-display-m font-semibold text-text-on-ink lg:bottom-5 lg:left-6"
                  >
                    {weeks(p.weeks)}
                  </p>
                  <span
                    className={`absolute top-4 right-4 rounded-pill bg-rr-violet px-3 py-1 font-mono text-small font-semibold text-white ${FADE} ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  >
                    {ladder.selected}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <h3 id={`plan-${p.id}`} className="font-display text-display-s font-semibold text-text-on-ink">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onSelect(on ? null : p.id)}
                      className="cursor-pointer text-left after:absolute after:inset-0 after:z-[1] after:rounded-media focus-visible:outline-none"
                    >
                      {p.title}
                    </button>
                  </h3>
                  <p className="max-w-[48ch] text-body text-text-on-ink-muted">{p.blurb}</p>
                  <ul aria-label={ladder.chips} className="flex flex-wrap gap-2">
                    {[
                      fill(ladder.modules, { modules: moduleRange(p.modules) }),
                      fill(ladder.labs, { labs: numberRange(labs) }),
                      races.length ? fill(races.length === 1 ? ladder.race : ladder.races, { races: numberRange(races) }) : "",
                    ]
                      .filter(Boolean)
                      .map((chip) => (
                        <li
                          key={chip}
                          className="rounded-pill border border-text-on-ink/20 px-3 py-1 font-mono text-small text-text-on-ink"
                        >
                          {chip}
                        </li>
                      ))}
                  </ul>
                  {p.effort_hours_per_week !== null && (
                    <p className={INK_NOTE}>{p.effort_hours_per_week} h a week</p>
                  )}
                  <p className="mt-auto pt-2 text-body font-semibold">
                    <LearnLink href={`/learn/courses/${p.id}`} on="ink" className="relative z-10">{`See the ${p.title}`}</LearnLink>
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </Reveal>
    </div>
  );
}
