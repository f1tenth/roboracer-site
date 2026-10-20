import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { CoursesFile, OutlineModule } from "../../lib/data";
import { DURATION, REDUCED_MOTION_QUERY } from "../../lib/motion";
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
import { SIZE } from "../ui/buttonStyles";
import { LINK, listWords, numberRange } from "./learnStyles";

/** Where a shared link lands: the builder's section heading (Teach.tsx). */
const LANDING_HASH = "teach-lectures";

/** Copy plan and Share link: accent outlines beside the one solid button. */
const OUTLINE_BTN = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn border border-rr-violet/50 font-sans font-semibold text-rr-violet-deep transition-colors duration-[var(--duration-fast)] hover:border-rr-violet hover:bg-rr-violet/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent motion-reduce:transition-none ${SIZE.md}`;

/** A lab or race as a small tinted chip: violet for labs, magenta for races
 * (the design system's AA text variant on the magenta tint). */
const CHIP = "inline-flex items-center rounded-pill px-2 py-px font-mono text-small font-semibold tabular-nums";
const LAB_CHIP = `${CHIP} bg-rr-violet/12 text-rr-violet-deep`;
const RACE_CHIP = `${CHIP} bg-rr-magenta/15 text-rr-magenta-deep`;

/** Ink-stroke icons, 16px, in the text's colour. */
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const ICON_MAIL = "M2 4h12v8H2zM2.5 4.5 8 9l5.5-4.5";
const ICON_COPY = "M5.5 5.5h7v7h-7zM10.5 5.5v-2h-7v7h2";
const ICON_LINK = "M7 9a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 9 3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75";
const ICON_CHECK = "M3.5 8.5l3 3 6-7";

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

/** A count that runs to its new value when the selection changes (420 ms,
 * ease-out); under reduced motion it changes at once. The final number is
 * also in the markup for screen readers, so the tween is never read. */
function useTweened(value: number): number {
  const [shown, setShown] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const ms = reduce ? 0 : DURATION.base * 1000;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      const v = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      current.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

function Counter({ value, label, phrase }: { value: number; label: string; phrase: string }) {
  const shown = useTweened(value);
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-small text-text-body">{label}</dt>
      <dd className="mt-auto pt-1 font-mono text-display-m font-semibold tabular-nums text-rr-violet-deep">
        <span aria-hidden="true">{shown}</span>
        <span className="sr-only">{phrase}</span>
      </dd>
    </div>
  );
}

/** The chips under a module's name: what ticking it adds. */
function ModuleMeta({ courses, m, id }: { courses: CoursesFile; m: OutlineModule; id: string }) {
  const s = planSummary(courses, [m.id]);
  const n = (one: string, many: string, count: number) => fill(count === 1 ? one : many, { n: count });
  const words = [n(LABELS.lectureOne, LABELS.lectureMany, s.lectures.length)];
  if (s.tutorials.length) words.push(n(LABELS.tutorialOne, LABELS.tutorialMany, s.tutorials.length));
  if (s.optional.length) words.push(`${s.optional.length} ${LABELS.detailOptional.toLowerCase()}`);
  return (
    <span id={id} className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="font-mono text-small text-text-body">{words.join(" · ")}</span>
      {s.labs.length > 0 && (
        <span className={LAB_CHIP}>
          {fill(s.labs.length === 1 ? LABELS.labOne : LABELS.labMany, { list: numberRange(s.labs.map((l) => l.number)) })}
        </span>
      )}
      {s.races.map((r) => (
        <span key={r.id} className={RACE_CHIP}>
          {r.title}
        </span>
      ))}
    </span>
  );
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="pt-0.5 font-mono text-small text-text-body">{term}</dt>
      <dd className="flex min-w-0 flex-wrap gap-1.5 font-mono text-small text-text-strong">{children}</dd>
    </>
  );
}

/**
 * The teach page's plan builder, the honest half of the LMS mock's planner:
 * start from one of the three plans, tick modules A to G on or off, and the
 * card beside them counts what the selection holds (lectures, tutorials,
 * recordings, labs by number, races) and says whether it is one of the
 * plans. Nothing is invented: a custom selection has no weeks or hours.
 * The selection lives in the URL (`?modules=A,B,D`, replaced, never pushed),
 * so Share link restores it and nothing is stored. Copy plan puts the whole
 * plan with its course-site links on the clipboard; Email it to us opens the
 * reader's own mail app with the plan in the body.
 *
 * Colour (Cedric, 2026-10-20: the courses pages must stand out): selected
 * states in violet (tile tint and border, the letter badge filled), labs as
 * violet chips, races as magenta chips, the summary a violet-tinted card; the
 * only solid violet fill that acts is Email it to us.
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
  const fromUrl = params.get("modules");
  // The router applies a navigation as a transition, so a controlled box
  // would show its old state for a few frames after the click (stage 3 saw
  // about 75 ms). The pick also lives in local state, keyed to the address it
  // was made on: it shows in the click's own frame and gives way to the
  // address as soon as that changes (the catalog's picker does the same).
  const [picked, setPicked] = useState<{ from: string | null; ids: string[] } | null>(null);
  const ids =
    picked && picked.from === fromUrl
      ? picked.ids
      : (parseModules(courses, fromUrl) ?? normalizeModules(courses, fullPlan?.modules ?? []));
  const key = ids.join(",");
  const s = planSummary(courses, ids);
  const counts = planCounts(courses, s);
  const status = planStatus(s);
  const empty = ids.length === 0;

  const link = shareUrl(window.location.origin, pathname, ids, LANDING_HASH);
  const shown = shareUrl(window.location.host, pathname, ids);

  // A replace, so Back leaves the page instead of undoing ticks. No hash: a
  // landing hash would make useScrollToHash glide back to the heading.
  const select = (next: string[]) => {
    const sel = normalizeModules(courses, next);
    setPicked({ from: fromUrl, ids: sel });
    navigate({ pathname, search: modulesSearch(sel) }, { replace: true, preventScrollReset: true });
  };

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

  const chip = empty
    ? "bg-ink-950/[0.06] text-text-body"
    : s.match
      ? "bg-rr-violet/15 text-rr-violet-deep"
      : "bg-rr-magenta/15 text-rr-magenta-deep";

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
      <div className="lg:col-span-7">
        <fieldset>
          <legend className="font-mono text-small text-text-body">{LABELS.startLegend}</legend>
          {/* Native radios as a segmented control: arrow keys move between
              them. Checked = the plan the selection equals, so a custom
              selection checks none and every plan is one click away. */}
          <div className="mt-3 flex w-full gap-1 rounded-btn border border-rr-violet/30 bg-paper-50 p-1 sm:inline-flex sm:w-auto">
            {plans.map((p) => (
              <label
                key={p.id}
                className="group relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[2px] px-4 font-mono text-small font-semibold whitespace-nowrap text-text-body transition-colors duration-[var(--duration-fast)] hover:bg-rr-violet/[0.07] hover:text-rr-violet-deep has-checked:bg-rr-violet/15 has-checked:text-rr-violet-deep has-checked:shadow-[inset_0_0_0_1px_var(--color-rr-violet)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-rr-violet motion-reduce:transition-none sm:min-h-10 sm:flex-none sm:px-5"
              >
                <input
                  type="radio"
                  name="plan-start"
                  value={p.id}
                  checked={s.match?.id === p.id}
                  onChange={() => select(p.modules)}
                  className="sr-only"
                />
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-rr-violet opacity-0 group-has-checked:opacity-100" />
                {fill(LABELS.weeksOption, { n: p.weeks })}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="font-mono text-small text-text-body">{LABELS.modulesLegend}</legend>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {outline.modules.map((m) => {
              const on = ids.includes(m.id);
              const titleId = `plan-module-${m.id}`;
              return (
                <li key={m.id} className="sm:last:odd:col-span-2">
                  <label
                    className={`relative flex h-full cursor-pointer items-start gap-4 rounded-card border p-4 pr-12 shadow-card transition-[translate,box-shadow,background-color,border-color] duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-5 md:pr-14 ${
                      on ? "border-rr-violet/60 bg-[color-mix(in_srgb,var(--color-rr-violet)_7%,var(--color-paper-50))]" : "border-ink-950/10 bg-paper-50 hover:border-rr-violet/40"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-btn font-mono text-lead font-semibold transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
                        on ? "bg-rr-violet text-white" : "bg-rr-violet/10 text-rr-violet-deep"
                      }`}
                    >
                      {m.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span id={titleId} className="block font-display text-body leading-snug font-semibold text-text-strong md:text-lead md:leading-snug">
                        <span className="sr-only">{fill(LABELS.moduleSr, { id: m.id })}</span>
                        {m.title}
                      </span>
                      <ModuleMeta courses={courses} m={m} id={`${titleId}-meta`} />
                    </span>
                    <span className="absolute top-4 right-4 flex h-5 w-5 md:top-5 md:right-5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => select(toggleModule(courses, ids, m.id))}
                        aria-labelledby={titleId}
                        aria-describedby={`${titleId}-meta`}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-[3px] border border-ink-950/35 bg-paper-50 transition-colors duration-[var(--duration-fast)] checked:border-rr-violet checked:bg-rr-violet motion-reduce:transition-none forced-colors:appearance-auto"
                      />
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                        className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 forced-colors:hidden"
                      >
                        <path d={ICON_CHECK} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {/* Below lg the card comes after the tiles: a status bar keeps the
            live count in view while ticking. Visual only (the card's own
            live line speaks); always two lines, so it never changes size. */}
        <p
          aria-hidden="true"
          className="sticky bottom-0 z-10 -mx-6 mt-6 flex items-center gap-3 border-t-2 border-rr-violet/40 bg-paper-50 px-6 py-3 font-mono text-small text-text-strong lg:hidden"
        >
          <span className={`shrink-0 rounded-pill px-2.5 py-0.5 font-semibold ${chip}`}>
            {s.match ? fill(LABELS.weeksOption, { n: s.match.weeks }) : empty ? LABELS.emptyShort : LABELS.customShort}
          </span>
          <span className="text-text-body">
            <span className="block">{counts.slice(0, 2).map(countPhrase).join(" · ")}</span>
            <span className="block">{counts.filter((n) => n.id === "labs" || n.id === "races").map(countPhrase).join(" · ")}</span>
          </span>
        </p>
      </div>

      <section
        aria-labelledby="plan-sheet-title"
        className="self-start rounded-card border border-rr-violet/20 bg-[color-mix(in_srgb,var(--color-rr-violet)_6%,var(--color-paper-50))] p-6 shadow-card md:p-8 lg:sticky lg:top-[calc(var(--spacing-nav)+var(--rail-h,0px)+1.5rem)] lg:col-span-5"
      >
        <h3 id="plan-sheet-title" className="flex items-center gap-2 font-mono text-small font-semibold text-rr-violet-deep">
          <span aria-hidden="true" className="h-1 w-1 bg-rr-violet" />
          {LABELS.summaryHeading}
        </h3>
        <div aria-live="polite" aria-atomic="true" className="mt-4">
          <p
            className={`inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 font-display text-body font-semibold transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none md:text-lead ${chip}`}
          >
            {s.match && <Icon d={ICON_CHECK} />}
            {status}
          </p>
          <p className="sr-only">{empty ? LABELS.emptyNote : `${planCountsLine(courses, s)}.`}</p>
        </div>
        {/* Reserved line, whatever the state, so the card never jumps. */}
        <p className="mt-3 min-h-[1.5rem] text-small text-text-body">
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

        <dl className="mt-6 grid grid-cols-3 gap-x-4 gap-y-5 border-t border-rr-violet/20 pt-5">
          {counts.map((n) => (
            <Counter key={n.id} value={n.value} label={n.label} phrase={countPhrase(n)} />
          ))}
        </dl>

        <dl className="mt-6 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-t border-rr-violet/20 pt-5 md:grid-cols-[7.5rem_minmax(0,1fr)]">
          <Detail term={LABELS.detailModules}>
            {empty
              ? LABELS.none
              : s.modules.map((m) => (
                  <span key={m.id} className={`${CHIP} bg-rr-violet text-white`}>
                    {m.id}
                  </span>
                ))}
          </Detail>
          {/* Up to ten chips: two rows held from lg, where the card is narrow,
              so it keeps its height whatever is ticked. */}
          <Detail term={LABELS.detailLabs}>
            <span className="flex min-h-[1.5rem] flex-wrap content-start gap-1.5 lg:min-h-[3.25rem]">
              {s.labs.length
                ? s.labs.map((l) => (
                    <span key={l.id} className={LAB_CHIP}>
                      {l.number}
                    </span>
                  ))
                : LABELS.none}
            </span>
          </Detail>
          <Detail term={LABELS.detailRaces}>
            {s.races.length
              ? s.races.map((r) => (
                  <span key={r.id} className={RACE_CHIP}>
                    {r.title}
                  </span>
                ))
              : LABELS.none}
          </Detail>
          <Detail term={LABELS.detailOptional}>
            {s.optional.length ? listWords(s.optional.map((i) => `${i.label.replace(/\s*\(optional\)$/i, "")}, ${i.title}`)) : LABELS.none}
          </Detail>
          <Detail term={LABELS.detailProject}>
            {s.project ? fill(LABELS.projectIncluded, { modules: moduleList(courses, outline.final_project.modules) }) : LABELS.none}
          </Detail>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          {empty ? (
            <Button disabled className="cursor-not-allowed opacity-50">
              <Icon d={ICON_MAIL} />
              {LABELS.email}
            </Button>
          ) : (
            <Button href={mailtoUrl(courses, s, link)}>
              <Icon d={ICON_MAIL} />
              {LABELS.email}
            </Button>
          )}
          <button type="button" disabled={empty} className={OUTLINE_BTN} onClick={() => copy(planText(courses, s, link), LABELS.copied)}>
            <Icon d={ICON_COPY} />
            {LABELS.copy}
          </button>
          <button type="button" disabled={empty} className={OUTLINE_BTN} onClick={() => copy(link, LABELS.linkCopied)}>
            <Icon d={ICON_LINK} />
            {LABELS.share}
          </button>
        </div>
        <p aria-live="polite" className="mt-3 min-h-[1.5rem] font-mono text-small font-semibold text-rr-violet-deep">
          {feedback?.key === key ? feedback.text : ""}
        </p>
        <p className="mt-1 font-mono text-small break-all text-text-body">
          <span>{LABELS.shareLabel}: </span>
          <span className="text-text-strong">{shown}</span>
        </p>
        <p className="mt-4 border-t border-rr-violet/20 pt-4 text-small text-text-body">{LABELS.stored}</p>
      </section>
    </div>
  );
}
