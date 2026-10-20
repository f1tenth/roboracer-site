import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { lectureSelection, type CoursePlan, type CoursesFile } from "../../lib/data";
import LearnLink from "./LearnLink";
import { MONO_NOTE, TAP, moduleRange } from "./learnStyles";

/** Micro-labels this unit introduced. Stage 3 moves them into courses.json
 * (docs/learn/COURSES_INTERACTIVITY.md, section 3); docs/qa/courses-catalog.md
 * lists them. */
const LABELS = {
  label: "Find a topic",
  placeholder: "Try RRT, particle filter, MPC or YOLO",
  hint: "Searches every module, lecture, tutorial, lab and race in the course.",
  count: (n: number, q: string) => `${n} ${n === 1 ? "match" : "matches"} for “${q}”`,
  shown: (n: number) => `, the first ${n} shown`,
  more: (n: number) => `${n} more. Add a word to narrow it down.`,
  none: (q: string) => `Nothing in the course matches “${q}”.`,
  suggest: "Try a module:",
  results: "Matching topics",
  inPlans: "In",
  module: (id: string) => `Module ${id}`,
  project: "Project",
};

/** Characters before the finder answers: one letter matches half the course. */
const MIN_CHARS = 2;
/** Rows shown; the rest is a count. */
const MAX_SHOWN = 8;
/** The count is announced once typing pauses, not on every key. */
const ANNOUNCE_MS = 700;

type Entry = {
  key: string;
  /** Mono column: "Lecture 11", "Lab 6", "Module D", "Race 2", "Project". */
  kind: string;
  /** The module letter in the accent badge ("E to G" for the final project). */
  badge: string;
  title: string;
  href: string;
  /** The line under the title: the module, or a module's own summary. */
  context: string;
  contextIsProse: boolean;
  plans: CoursePlan[];
  /** Words of the kind and title: a hit here ranks first. */
  primary: string[];
  /** Words of the module name, summary or body: a hit here ranks last. */
  secondary: string[];
  /** Title words, for acronyms built from their initials. */
  titleWords: string[];
  /** The kind and title without spaces ("ros2" finds "ROS 2"), and where
   * each of its words starts in that string. */
  compact: string;
  wordStarts: Set<number>;
};

/** Lower case, no accents, every run of anything but a letter or digit one space. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const words = (s: string) => norm(s).split(" ").filter(Boolean);

/**
 * One entry per thing the course has, in course order (a module, its
 * lectures and tutorials, its labs, its race; the final project last), each
 * with the plans that include it: a module's and its lectures' from
 * lectureSelection(), a lab's from the plans that assign it, the final
 * project's from the plans that run every module it spans.
 */
function buildIndex(c: CoursesFile): Entry[] {
  const entries: Entry[] = [];
  const add = (
    e: Omit<Entry, "key" | "primary" | "secondary" | "titleWords" | "compact" | "wordStarts" | "contextIsProse"> & {
      extra: string;
      contextIsProse?: boolean;
    },
  ) => {
    const { extra, contextIsProse = false, ...rest } = e;
    const primary = words(`${e.kind} ${e.title}`);
    const wordStarts = new Set<number>();
    primary.reduce((at, w) => (wordStarts.add(at), at + w.length), 0);
    entries.push({
      ...rest,
      contextIsProse,
      key: `${e.kind}|${e.href}`,
      primary,
      secondary: words(extra),
      titleWords: words(e.title),
      compact: primary.join(""),
      wordStarts,
    });
  };
  for (const row of lectureSelection(c)) {
    const m = row.module;
    const plans = c.plans.filter((p) => row.plans.includes(p.id));
    const moduleLine = `${LABELS.module(m.id)} · ${m.title}`;
    add({
      kind: LABELS.module(m.id),
      badge: m.id,
      title: m.title,
      href: m.href,
      context: m.summary,
      contextIsProse: true,
      plans,
      extra: m.summary,
    });
    for (const it of m.items) {
      add({ kind: it.label, badge: m.id, title: it.title, href: it.href, context: moduleLine, plans, extra: moduleLine });
    }
    for (const l of c.outline.labs.filter((x) => x.module === m.id)) {
      add({
        kind: l.label,
        badge: m.id,
        title: l.title,
        href: l.href,
        context: moduleLine,
        plans: c.plans.filter((p) => p.labs.includes(l.id)),
        extra: moduleLine,
      });
    }
    for (const r of c.outline.races.filter((x) => x.module === m.id)) {
      add({
        kind: r.title,
        badge: m.id,
        title: r.body.replace(/\.$/, ""),
        href: r.href,
        context: moduleLine,
        plans,
        extra: moduleLine,
      });
    }
  }
  const fp = c.outline.final_project;
  add({
    kind: LABELS.project,
    badge: moduleRange(fp.modules).replace(" to ", "–"),
    title: fp.title,
    href: fp.href,
    context: fp.body,
    contextIsProse: true,
    plans: c.plans.filter((p) => fp.modules.every((id) => p.modules.includes(id))),
    extra: fp.body,
  });
  return entries;
}

/** Does a run of consecutive title words spell the acronym ("model
 * predictive control" spells MPC, "follow the gap" FTG)? Built from the data,
 * never from a hand-written alias list. */
function spells(titleWords: string[], acronym: string): boolean {
  const n = acronym.length;
  for (let i = 0; i + n <= titleWords.length; i++) {
    if (titleWords.slice(i, i + n).every((w, j) => w[0] === acronym[j])) return true;
  }
  return false;
}

/** The query run together starts at a word of the entry ("ros2" in "ROS 2",
 * "followthegap"), never inside one ("race" inside "RoboRacer"). */
function runsTogether(e: Entry, compactQ: string): boolean {
  for (let at = e.compact.indexOf(compactQ); at >= 0; at = e.compact.indexOf(compactQ, at + 1)) {
    if (e.wordStarts.has(at)) return true;
  }
  return false;
}

/**
 * Every query word must start a word of the entry. Ranked: all of them in
 * the kind or title (whole words first), then an acronym of the title, then
 * the query run together ("ros2"), then hits that need the module name,
 * summary or body. Ties keep course order.
 */
function search(index: Entry[], query: string): { hits: Entry[]; tokens: string[] } | null {
  const q = norm(query);
  const compactQ = q.replace(/ /g, "");
  if (compactQ.length < MIN_CHARS) return null;
  const tokens = q.split(" ");
  const acronym = tokens.length === 1 && /^[a-z]{2,6}$/.test(q) ? q : null;
  const starts = (t: string, ws: string[]) => ws.some((w) => w.startsWith(t));
  const score = (e: Entry) => {
    if (tokens.every((t) => starts(t, e.primary))) return tokens.every((t) => e.primary.includes(t)) ? 5 : 4;
    if (acronym && spells(e.titleWords, acronym)) return 3;
    if (compactQ.length >= 4 && runsTogether(e, compactQ)) return 2;
    if (tokens.every((t) => starts(t, e.primary) || starts(t, e.secondary))) return 1;
    return 0;
  };
  const hits = index
    .map((e, i) => ({ e, i, s: score(e) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.e);
  return { hits, tokens };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The query's words where they start a word of the text, tinted magenta, so
 * a row shows why it matched. An acronym hit tints nothing. */
function Marked({ text, tokens }: { text: string; tokens: string[] }) {
  const sorted = [...tokens].sort((a, b) => b.length - a.length).map(escapeRe);
  const re = new RegExp(`(^|[^A-Za-z0-9])(${sorted.join("|")})`, "gi");
  const out: ReactNode[] = [];
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const start = m.index + m[1].length;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <mark key={start} className="rounded-[0.125rem] bg-rr-magenta/15 text-inherit">
        {m[2]}
      </mark>,
    );
    last = start + m[2].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

/**
 * "Find a topic", at the top of the catalog's outline: type RRT, particle
 * filter or model predictive and get the lecture, tutorial or lab, its
 * module, and the plans that include it, each a link (the title to its page
 * on the course site, a plan to its course page). At most eight rows and a
 * count of the rest. A miss lists the seven modules as buttons that fill the
 * query. Nothing is stored and nothing leaves the page.
 */
export default function TopicFinder({ courses }: { courses: CoursesFile }) {
  const index = useMemo(() => buildIndex(courses), [courses]);
  const modules = courses.outline.modules;
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const found = useMemo(() => search(index, query), [index, query]);
  const results = found?.hits ?? null;
  const tokens = found?.tokens ?? [];
  const trimmed = query.trim();
  const shown = results?.slice(0, MAX_SHOWN) ?? [];
  const status = !results
    ? ""
    : results.length === 0
      ? LABELS.none(trimmed)
      : LABELS.count(results.length, trimmed) + (results.length > MAX_SHOWN ? LABELS.shown(MAX_SHOWN) : "");

  // The visible line changes with every key; the live region only once the
  // reader pauses, so a screen reader is not read every keystroke's count.
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setAnnounced(status), ANNOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const fill = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  return (
    <div className="mb-10 desktop:mb-12">
      <form
        role="search"
        aria-label={LABELS.label}
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-x-10 gap-y-3 md:grid-cols-12 md:items-end"
      >
        <div className="md:col-span-7 lg:col-span-5">
          <label htmlFor="topic-finder" className="eyebrow mb-2 block text-text-muted">
            {LABELS.label}
          </label>
          <div className="relative">
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
              focusable="false"
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-text-muted"
            >
              <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              id="topic-finder"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={LABELS.placeholder}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-describedby="topic-finder-status"
              aria-controls="topic-finder-results"
              className="w-full rounded-btn border border-ink-950/20 bg-paper-50 py-3 pr-4 pl-11 text-body text-text-strong placeholder:text-text-muted hover:border-ink-950/50 coarse:min-h-11"
            />
          </div>
        </div>
        {/* One line, always there: what the finder searches, then the count
            once there is a query, so typing never moves the page. */}
        <p id="topic-finder-status" aria-hidden="true" className={`md:col-span-5 md:pb-3 lg:col-span-7 ${MONO_NOTE}`}>
          {status || LABELS.hint}
        </p>
      </form>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announced}
      </p>

      <div id="topic-finder-results">
        {shown.length > 0 && (
          <>
            <ul aria-label={LABELS.results} className="mt-6 border-y border-ink-950/10">
              {shown.map((e) => (
                <li
                  key={e.key}
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-ink-950/10 py-4 first:border-t-0 sm:grid-cols-[2.75rem_8.5rem_minmax(0,1fr)] lg:grid-cols-[2.75rem_8.5rem_minmax(0,1fr)_auto] lg:items-baseline"
                >
                  {/* The module letter, filled accent; the text says the
                      module, so the badge is not read twice. */}
                  <span
                    aria-hidden="true"
                    className="row-span-3 flex h-8 min-w-8 items-center justify-center self-start justify-self-start rounded-card bg-rr-violet px-1.5 font-mono text-small font-semibold whitespace-nowrap text-white sm:row-span-2 lg:row-span-1"
                  >
                    {e.badge}
                  </span>
                  <span className={`${MONO_NOTE} sm:pt-[0.15em]`}>{e.kind}</span>
                  <span className="col-start-2 min-w-0 sm:col-start-3">
                    <span className="block text-body">
                      <LearnLink href={e.href}>
                        <Marked text={e.title} tokens={tokens} />
                      </LearnLink>
                    </span>
                    <span
                      className={`mt-1 block max-w-[62ch] ${e.contextIsProse ? "text-small text-text-body" : MONO_NOTE}`}
                    >
                      <Marked text={e.context} tokens={tokens} />
                    </span>
                  </span>
                  {e.plans.length > 0 && (
                    <span className="col-start-2 mt-2 flex flex-wrap items-center gap-1.5 sm:col-start-3 lg:col-start-auto lg:mt-0 lg:justify-end">
                      <span className={`mr-1 ${MONO_NOTE}`}>{LABELS.inPlans}</span>
                      {e.plans.map((p, i) => (
                        <Fragment key={p.id}>
                          {i > 0 && <span className="sr-only">{i === e.plans.length - 1 ? " and " : ", "}</span>}
                          <Link
                            to={`/learn/courses/${p.id}`}
                            className={`rounded-pill border border-rr-violet/30 bg-rr-violet/8 px-2.5 py-0.5 font-mono text-small font-semibold whitespace-nowrap text-rr-violet-deep transition-colors duration-[var(--duration-fast)] hover:border-rr-violet hover:bg-rr-violet/15 motion-reduce:transition-none ${TAP}`}
                          >
                            {p.weeks} weeks
                          </Link>
                        </Fragment>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {results && results.length > MAX_SHOWN && (
              <p className={`mt-3 ${MONO_NOTE}`}>{LABELS.more(results.length - MAX_SHOWN)}</p>
            )}
          </>
        )}
        {results && results.length === 0 && (
          <div className="mt-6 rounded-card border border-rr-magenta/25 bg-rr-magenta/6 p-5 md:p-6">
            <p className="text-body text-text-body">{LABELS.none(trimmed)}</p>
            <p className={`mt-4 ${MONO_NOTE}`}>{LABELS.suggest}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {modules.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => fill(m.title)}
                    className="flex items-center gap-2 rounded-pill border border-rr-violet/30 bg-paper-50 py-1.5 pr-4 pl-1.5 text-left text-small font-semibold text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-rr-violet hover:bg-rr-violet/8 motion-reduce:transition-none coarse:min-h-11"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-rr-violet font-mono text-small text-white"
                    >
                      {m.id}
                    </span>
                    <span className="sr-only">{LABELS.module(m.id)}: </span>
                    {m.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
