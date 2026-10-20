import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { CoursesFile, OutlineModule } from "../../lib/data";
import {
  LABELS,
  countPhrase,
  fill,
  mailtoUrl,
  modulesSearch,
  moduleList,
  normalizeModules,
  parseModules,
  planCounts,
  planCountsLine,
  planStatus,
  planSummary,
  planText,
  shareUrl,
  toggleModule,
} from "../../lib/planBuilder";
import Button from "../ui/Button";
import { LINK, MONO_NOTE, listWords, numberRange } from "./learnStyles";

/** Where a shared link lands: the builder's section heading (Teach.tsx). */
const LANDING_HASH = "teach-lectures";

/** Clipboard, then the select-and-copy fallback for browsers without it.
 * Focus goes back to the button that asked. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Not allowed or not there: fall through.
  }
  const back = document.activeElement as HTMLElement | null;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  } finally {
    back?.focus({ preventScroll: true });
  }
}

/** The mono line under a module's name: what ticking it adds. */
function moduleMeta(courses: CoursesFile, m: OutlineModule): string {
  const s = planSummary(courses, [m.id]);
  const n = (one: string, many: string, count: number) => fill(count === 1 ? one : many, { n: count });
  const parts = [n(LABELS.lectureOne, LABELS.lectureMany, s.lectures.length)];
  if (s.tutorials.length) parts.push(n(LABELS.tutorialOne, LABELS.tutorialMany, s.tutorials.length));
  if (s.optional.length) parts.push(`${s.optional.length} ${LABELS.detailOptional.toLowerCase()}`);
  if (s.labs.length) {
    const list = numberRange(s.labs.map((l) => l.number));
    parts.push(fill(s.labs.length === 1 ? LABELS.labOne : LABELS.labMany, { list }));
  }
  for (const r of s.races) parts.push(r.title);
  return parts.join(" · ");
}

/**
 * The teach page's plan builder, the honest half of the LMS mock's planner:
 * start from one of the three plans, tick modules A to G on or off, and the
 * sheet beside them counts what the selection holds (lectures, tutorials,
 * recordings, labs by number, races) and says whether it is one of the
 * plans. Nothing is invented: a custom selection has no weeks or hours.
 * The selection lives in the URL (`?modules=A,B,D`, replaced, never pushed),
 * so Share link restores it and nothing is stored. Copy plan puts the whole
 * plan with its course-site links on the clipboard; Email it to us opens the
 * reader's own mail app with the plan in the body.
 */
export default function PlanBuilder({ courses }: { courses: CoursesFile }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { plans, outline } = courses;

  // No ?modules: start from the full course, the plan that holds every module.
  const fullPlan = plans.reduce<(typeof plans)[number] | undefined>(
    (best, p) => (!best || p.modules.length > best.modules.length ? p : best),
    undefined,
  );
  const ids = parseModules(courses, params.get("modules")) ?? normalizeModules(courses, fullPlan?.modules ?? []);
  const key = ids.join(",");
  const s = planSummary(courses, ids);
  const counts = planCounts(courses, s);
  const status = planStatus(s);
  const empty = ids.length === 0;

  const link = shareUrl(window.location.origin, pathname, ids, LANDING_HASH);
  const shown = shareUrl(window.location.host, pathname, ids);

  // A replace, so Back leaves the page instead of undoing ticks. No hash: a
  // landing hash would make useScrollToHash glide back to the heading.
  const select = (next: string[]) =>
    navigate({ pathname, search: modulesSearch(normalizeModules(courses, next)) }, { replace: true, preventScrollReset: true });

  // Feedback belongs to the selection it was given for: tick something else
  // and it goes, with no effect to clear it.
  const [feedback, setFeedback] = useState<{ text: string; key: string } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const say = (text: string) => {
    window.clearTimeout(timer.current);
    setFeedback({ text, key });
    timer.current = window.setTimeout(() => setFeedback(null), 6000);
  };
  const copy = async (text: string, done: string) => say((await copyText(text)) ? done : LABELS.copyFailed);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
      <div className="lg:col-span-7">
        <fieldset>
          <legend className={MONO_NOTE}>{LABELS.startLegend}</legend>
          {/* Native radios as a mono segmented control: arrow keys move
              between them. Checked = the plan the selection equals, so a
              custom selection checks none and any plan is one click away. */}
          <div className="mt-3 flex w-full gap-1 rounded-btn border border-ink-950/20 bg-paper-50 p-1 sm:inline-flex sm:w-auto">
            {plans.map((p) => (
              <label
                key={p.id}
                className="relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-[2px] px-4 font-mono text-small font-semibold whitespace-nowrap text-text-body transition-colors duration-[var(--duration-fast)] hover:text-text-strong has-checked:bg-ink-950 has-checked:text-text-on-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-rr-violet motion-reduce:transition-none sm:min-h-10 sm:flex-none sm:px-5"
              >
                <input
                  type="radio"
                  name="plan-start"
                  value={p.id}
                  checked={s.match?.id === p.id}
                  onChange={() => select(p.modules)}
                  className="sr-only"
                />
                {fill(LABELS.weeksOption, { n: p.weeks })}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className={MONO_NOTE}>{LABELS.modulesLegend}</legend>
          <ul className="mt-3 border-t border-ink-950/10">
            {outline.modules.map((m) => {
              const on = ids.includes(m.id);
              const titleId = `plan-module-${m.id}`;
              const metaId = `${titleId}-meta`;
              return (
                <li key={m.id} className="border-b border-ink-950/10">
                  <label className="group -mx-3 flex cursor-pointer items-start gap-4 rounded-btn px-3 py-4 transition-colors duration-[var(--duration-fast)] hover:bg-paper-50 motion-reduce:transition-none md:gap-5">
                    <span className="relative mt-[0.3rem] flex h-5 w-5 shrink-0">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => select(toggleModule(courses, ids, m.id))}
                        aria-labelledby={titleId}
                        aria-describedby={metaId}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-[3px] border border-ink-950/45 bg-paper-50 transition-colors duration-[var(--duration-fast)] checked:border-ink-950 checked:bg-ink-950 group-hover:border-ink-950 motion-reduce:transition-none forced-colors:appearance-auto"
                      />
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                        className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-text-on-ink opacity-0 peer-checked:opacity-100 forced-colors:hidden"
                      >
                        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`w-7 shrink-0 font-mono text-display-s leading-tight font-semibold md:w-9 ${on ? "text-text-strong" : "text-text-muted"}`}
                    >
                      {m.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        id={titleId}
                        className={`block font-display text-lead leading-snug font-semibold ${on ? "text-text-strong" : "text-text-body"}`}
                      >
                        <span className="sr-only">{fill(LABELS.moduleSr, { id: m.id })}</span>
                        {m.title}
                      </span>
                      <span id={metaId} className={`mt-1 block ${MONO_NOTE}`}>
                        {moduleMeta(courses, m)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {/* Below lg the sheet comes after the list: a status bar keeps the
            live count in view while ticking. Visual only (the sheet's own
            live line speaks), two lines reserved so it never changes size. */}
        <p
          aria-hidden="true"
          className="sticky bottom-0 z-10 -mx-6 mt-6 flex min-h-[4.25rem] items-center border-t border-ink-950/15 bg-paper-100 px-6 py-3 font-mono text-small text-text-strong lg:hidden"
        >
          <span>
            <span className="font-semibold">{status}</span>
            {!empty && <span className="text-text-body"> · {planCountsLine(courses, s)}</span>}
          </span>
        </p>
      </div>

      <section
        aria-labelledby="plan-sheet-title"
        className="self-start rounded-card bg-paper-50 p-6 shadow-card md:p-8 lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)] lg:col-span-5"
      >
        <h3 id="plan-sheet-title" className={MONO_NOTE}>
          {LABELS.summaryHeading}
        </h3>
        <div aria-live="polite" aria-atomic="true">
          <p className="mt-2 font-display text-display-s font-semibold text-text-strong">{status}</p>
          <p className="sr-only">{empty ? LABELS.emptyNote : `${planCountsLine(courses, s)}.`}</p>
        </div>
        {/* One line tall whatever the state, so the sheet never jumps. */}
        <p className="mt-2 min-h-[1.5rem] text-small text-text-body">
          {empty ? (
            LABELS.emptyNote
          ) : s.match ? (
            <Link to={`/learn/courses/${s.match.id}`} className={`font-semibold ${LINK}`}>
              {fill(LABELS.seePlan, { plan: s.match.title })}
            </Link>
          ) : (
            LABELS.customNote
          )}
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-x-4 gap-y-5 border-t border-ink-950/10 pt-5">
          {counts.map((n) => (
            <div key={n.id} className="flex flex-col">
              <dt className={MONO_NOTE}>{n.label}</dt>
              <dd className="mt-auto pt-1 font-mono text-display-m font-semibold tabular-nums text-text-strong">
                {n.value}
                <span className="sr-only"> {countPhrase(n).replace(/^\d+ /, "")}</span>
              </dd>
            </div>
          ))}
        </dl>

        <dl className="mt-6 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-ink-950/10 pt-5 font-mono text-small">
          <dt className="text-text-muted">{LABELS.detailModules}</dt>
          <dd className="text-text-strong">{empty ? LABELS.none : moduleList(courses, ids)}</dd>
          <dt className="text-text-muted">{LABELS.detailLabs}</dt>
          <dd className="text-text-strong">{numberRange(s.labs.map((l) => l.number)) || LABELS.none}</dd>
          <dt className="text-text-muted">{LABELS.detailRaces}</dt>
          <dd className="text-text-strong">{numberRange(s.races.map((r) => r.number)) || LABELS.none}</dd>
          <dt className="text-text-muted">{LABELS.detailOptional}</dt>
          <dd className="text-text-strong">
            {s.optional.length ? listWords(s.optional.map((i) => `${i.label.replace(/\s*\(optional\)$/i, "")}, ${i.title}`)) : LABELS.none}
          </dd>
          <dt className="text-text-muted">{LABELS.detailProject}</dt>
          <dd className="text-text-strong">
            {s.project ? fill(LABELS.projectIncluded, { modules: moduleList(courses, outline.final_project.modules) }) : LABELS.none}
          </dd>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          {empty ? (
            <Button disabled className="cursor-not-allowed opacity-50">
              {LABELS.email}
            </Button>
          ) : (
            <Button href={mailtoUrl(courses, s, link)}>{LABELS.email}</Button>
          )}
          <Button
            variant="secondary"
            disabled={empty}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => copy(planText(courses, s, link), LABELS.copied)}
          >
            {LABELS.copy}
          </Button>
          <Button
            variant="secondary"
            disabled={empty}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => copy(link, LABELS.linkCopied)}
          >
            {LABELS.share}
          </Button>
        </div>
        <p aria-live="polite" className="mt-3 min-h-[1.5rem] font-mono text-small text-text-strong">
          {feedback?.key === key ? feedback.text : ""}
        </p>
        <p className="mt-1 font-mono text-small break-all text-text-body">
          <span className="text-text-muted">{LABELS.shareLabel}: </span>
          {shown}
        </p>
        <p className="mt-4 border-t border-ink-950/10 pt-4 text-small text-text-body">{LABELS.stored}</p>
      </section>
    </div>
  );
}
