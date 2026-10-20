import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { findCourse, logoAttrs, type CourseOffering, type CoursePlan, type CoursesFile } from "../lib/data";
import { useCourses } from "../hooks/useCourses";
import Button from "../components/ui/Button";
import LearnHeader, { type Crumb } from "../components/learn/LearnHeader";
import LearnLink from "../components/learn/LearnLink";
import BlockHeader from "../components/learn/BlockHeader";
import CourseOutline from "../components/learn/CourseOutline";
import FaqList from "../components/learn/FaqList";
import CoursesUnavailable from "../components/learn/CoursesUnavailable";
import CourseTabs, { type CourseTab } from "../components/learn/CourseTabs";
import { LINK, MONO_NOTE, TAP, isTodo, moduleRange, numberRange } from "../components/learn/learnStyles";

/** Micro-labels this page added with the tabs and the banner (U2,
 * 2026-10-20). Stage 3 moves them into courses.json `course`; until then they
 * live here and are listed in docs/qa/courses-page.md. The panels' own
 * headings stay the JSON's. */
const LABELS = {
  tablist: "Course sections",
  facts: "Course facts",
  tab_about: "About",
  tab_outline: "Outline",
  tab_staff: "Staff",
  tab_logistics: "Logistics",
  noun_module: ["module", "modules"],
  noun_person: ["person", "people"],
  noun_question: ["question", "questions"],
  copy_link: "Copy link",
  copied: "Link copied",
  copy_failed: "Could not copy. The link is in the address bar.",
} as const;

/**
 * The banner photo behind each course's header: site photos already on the
 * landing and /about (docs/ASSET_MANIFEST.md, "Course page banners"), under a
 * dark scrim. Keyed by course id; an id without one gets the platform photo.
 * Stage 3 can move these into courses.json with the labels.
 */
type Banner = { src: string; width: number; height: number; alt: string; position: string };
const BANNERS: Record<string, Banner> = {
  "4-weeks": {
    src: "/media/platform/platform-learn-1200.webp",
    width: 1200,
    height: 750,
    alt: "Two students assembling a RoboRacer car on the pit floor",
    position: "50% 35%",
  },
  "10-weeks": {
    src: "/media/highlights/highlight-icra2026-bridge-02-1200.webp",
    width: 1200,
    height: 800,
    alt: "A RoboRacer car in the air off the bridge on the ICRA 2026 track",
    position: "70% 45%",
  },
  "15-weeks": {
    src: "/media/highlights/highlight-icra2026-car-02-1200.webp",
    width: 1200,
    height: 800,
    alt: "A RoboRacer car at speed on the ICRA 2026 track",
    position: "60% 60%",
  },
  penn: {
    src: "/media/highlights/highlight-icra2026-pitwork-02-1200.webp",
    width: 1200,
    height: 800,
    alt: "The UPenn Autonomous Racing team at work on their cars at ICRA 2026",
    position: "50% 40%",
  },
};
const DEFAULT_BANNER = BANNERS["4-weeks"];

const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;

/** "Jan 20, 2027" from an ISO date, in UTC so the day never shifts. */
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const plural = (n: number, [one, many]: readonly [string, string]) => (n === 1 ? one : many);

/** What the page needs from the plan a course follows. */
function planFacts(courses: CoursesFile, plan: CoursePlan | undefined) {
  const modules = plan
    ? courses.outline.modules.filter((m) => plan.modules.includes(m.id))
    : courses.outline.modules;
  const ids = modules.map((m) => m.id);
  const labs = courses.outline.labs.filter((l) => (plan ? plan.labs.includes(l.id) : !l.optional));
  const races = courses.outline.races.filter((r) => ids.includes(r.module));
  return { modules, ids, labs, races };
}

/* Ink-stroke glyphs (16 px grid, 1.5 stroke, currentColor), never emoji. */
const GLYPHS = {
  book: "M2.5 3h4A1.5 1.5 0 0 1 8 4.5V13a1 1 0 0 0-1-1H2.5zM13.5 3h-4A1.5 1.5 0 0 0 8 4.5V13a1 1 0 0 1 1-1h4.5z",
  layers: "M8 2.5 14 5.5 8 8.5 2 5.5zM2 8.5l6 3 6-3M2 11.5l6 3 6-3",
  person: "M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8zM2.75 14c.75-2.75 2.8-4.25 5.25-4.25S12.5 11.25 13.25 14",
  chat: "M2.5 3h11v7.5H7.5l-3 2.5v-2.5h-2z",
  hash: "M6.5 2.5 5 13.5M11 2.5l-1.5 11M2.5 6h11M2 10h11",
  building: "M2 6 8 2.5 14 6M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12",
  route: "M3.5 13.5V8a3.5 3.5 0 0 1 3.5-3.5h6M10.5 2l2.5 2.5L10.5 7",
  calendar: "M3.5 3.5h9a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM2.5 7h11M5.5 2v3M10.5 2v3",
  clock: "M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM8 5v3l2 1.5",
  flask: "M6 2h4M6.5 2v4.25L3.1 12.6a1 1 0 0 0 .9 1.4h8a1 1 0 0 0 .9-1.4L9.5 6.25V2M4.6 10h6.8",
  flag: "M3.5 14V2.5M3.5 3h8.5l-1.75 3L12 9H3.5",
  doc: "M4 2h5l3 3v9H4zM9 2v3h3M6 8.5h4M6 11h4",
  check: "M3 8.5 6.5 12 13 4.5",
} as const;

function Glyph({ name, className = "h-4 w-4" }: { name: keyof typeof GLYPHS; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <path d={GLYPHS[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The glyph on a violet-tinted tile, ink stroke (the "At a glance" rows). */
function Tile({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-btn bg-rr-violet/10 text-ink-900">
      <Glyph name={name} className="h-3.5 w-3.5" />
    </span>
  );
}

/** One row of the "At a glance" card. */
function Row({ icon, term, children }: { icon: keyof typeof GLYPHS; term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1.75rem_6.5rem_minmax(0,1fr)] items-center gap-x-3 border-t border-rr-violet/10 py-1">
      <Tile name={icon} />
      <dt className={MONO_NOTE}>{term}</dt>
      <dd className="text-small font-semibold text-text-strong">{children}</dd>
    </div>
  );
}

function NotFound({ courses }: { courses: CoursesFile }) {
  const nf = courses.course.not_found;
  return (
    <div className="pt-nav">
      <LearnHeader
        id="course-title"
        crumbs={[
          { label: "Learn", href: "/learn" },
          { label: courses.catalog.hero.eyebrow, href: "/learn/courses" },
        ]}
        title={nf.title}
        lead={nf.body}
        actions={
          <Button href={nf.back.href} variant="secondary">
            {nf.back.label}
          </Button>
        }
      />
    </div>
  );
}

/** A hidden field, selected and copied: the fallback where the async
 * Clipboard API is missing (an http:// preview) or refuses. */
function selectAndCopy(text: string): boolean {
  // The field takes focus to be selected; the keyboard gets it back after.
  const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  field.remove();
  before?.focus({ preventScroll: true });
  return ok;
}

/** Copy link for the "At a glance" card: the page's address as it stands
 * (with the open tab's hash, without any query), said once in a status line
 * that a screen reader announces. The line keeps its height, so nothing moves
 * when it fills or clears. */
function CopyLink({ children }: { children?: ReactNode }) {
  const [status, setStatus] = useState<"" | "copied" | "failed">("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const { origin, pathname, hash } = window.location;
    const url = `${origin}${pathname}${hash}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = selectAndCopy(url);
    }
    // Cleared first so a second copy is announced again.
    setStatus("");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setStatus(ok ? "copied" : "failed");
      timer.current = window.setTimeout(() => setStatus(""), 4000);
    }, 50);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-btn border border-rr-violet/40 bg-paper-50 px-4 py-2 text-small font-semibold text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-rr-violet hover:bg-rr-violet/5 motion-reduce:transition-none"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" className="h-3.5 w-3.5 shrink-0 text-rr-violet">
          <path
            d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L10.5 8M9 11.5l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L5.5 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {LABELS.copy_link}
      </button>
      {children}
      <p role="status" className="basis-full min-h-[1.5em] font-mono text-small text-rr-magenta-deep">
        {status === "copied" ? LABELS.copied : status === "failed" ? LABELS.copy_failed : ""}
      </p>
    </>
  );
}

/**
 * /learn/courses/:id: one plan (4, 10 or 15 weeks) or one university that
 * teaches the course. A photo banner says what it is (the title in the logo
 * gradient over a dark scrim); under it the course is four tabs (About,
 * Outline, Staff, Logistics: CourseTabs, one panel at a time, so the page is
 * about one screen tall at 1440) beside a sticky, violet-tinted "At a glance"
 * card from lg, which carries the page's one solid button and follows the tabs
 * below lg. No enroll button and no accounts: the material is open on the
 * course site and every lecture links there. Null dates and effort render
 * nothing (COURSES_CONTENT.md).
 */
export default function Course() {
  const { id = "" } = useParams();
  const courses = useCourses();
  const course = courses ? findCourse(courses, id) : undefined;

  // TITLES in Layout is exact-path, so this page names itself.
  const title = course?.title ?? courses?.course.not_found.title;
  useEffect(() => {
    if (title) document.title = `${title} - RoboRacer`;
  }, [title]);

  if (!courses) return <CoursesUnavailable failed={courses === null} />;
  if (!course) return <NotFound courses={courses} />;

  const offering: CourseOffering | undefined = course.kind === "offering" ? course : undefined;
  const plan: CoursePlan | undefined =
    course.kind === "plan" ? course : courses.plans.find((p) => p.id === course.plan);
  const { modules, ids, labs, races } = planFacts(courses, plan);
  const copy = courses.course;
  const { meta } = courses;
  const first = modules[0];
  const learn = courses.learn.filter((l) => ids.includes(l.module));
  const staff = offering ? courses.staff.filter((s) => offering.staff.includes(s.id)) : courses.staff;
  // The modules this plan leaves out are named in one line with links to the
  // plans that have them, rather than listed as dimmed folds: a dimmed fold
  // still opens and reads as part of the plan, and dimmed text falls under AA.
  const leftOut = courses.outline.modules.filter((m) => !ids.includes(m.id));
  const longer = courses.plans.filter((p) => p.id !== plan?.id && leftOut.some((m) => p.modules.includes(m.id)));
  const dated = course.starts && course.ends;
  const banner = BANNERS[course.id] ?? DEFAULT_BANNER;

  const crumbs: Crumb[] = [
    { label: "Learn", href: "/learn" },
    { label: courses.catalog.hero.eyebrow, href: "/learn/courses" },
    { label: offering ? offering.institution : "Plans" },
  ];

  // Only what the data holds: no date while the dates are null, no effort
  // while the hours are. The first chip (the course number, or the length)
  // is the violet one.
  const chips = [
    offering?.code,
    plan ? `${plan.weeks} weeks` : null,
    ids.length ? `Modules ${moduleRange(ids)}` : null,
    labs.length ? `${labs.length} labs` : null,
    races.length ? (races.length === 1 ? races[0].title : `${races.length} races`) : null,
    dated ? `${formatDate(course.starts!)} to ${formatDate(course.ends!)}` : null,
    course.effort_hours_per_week !== null ? `${course.effort_hours_per_week} h a week` : null,
  ].filter((p): p is string => !!p);

  const start = first && (
    <Button href={first.href} target="_blank" rel="noopener noreferrer">
      {`Start with Module ${first.id}`}
    </Button>
  );

  // The panels. Each opens with its JSON heading as the page's h2 (the tab
  // names the panel, the heading keeps the outline for a screen reader's
  // heading list). No block numbers: the tab bar is the page's index now.
  const tabs: CourseTab[] = [
    {
      id: "about",
      label: LABELS.tab_about,
      icon: <Glyph name="book" />,
      panel: (
        <div className="flex flex-col gap-10">
          <section aria-labelledby="course-about">
            <BlockHeader id="course-about" title={copy.about_heading} />
            <div className="flex max-w-[62ch] flex-col gap-3">
              {copy.about.map((p) => (
                <p key={p} className="text-lead text-text-body">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {learn.length > 0 && (
            <section aria-labelledby="course-learn">
              <BlockHeader id="course-learn" title={copy.learn_heading} />
              <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {learn.map((l) => (
                  <li key={l.text} className="flex items-start gap-3 text-body text-text-strong">
                    <span aria-hidden="true" className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-rr-violet/15 text-rr-violet-deep">
                      <Glyph name="check" className="h-3.5 w-3.5" />
                    </span>
                    <span>{l.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="course-prereq">
            <BlockHeader id="course-prereq" title={copy.prerequisites_heading} />
            <p className="max-w-[62ch] text-body text-text-body">{courses.prerequisites.lead}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-rr-violet/20 bg-rr-violet/[0.05] px-5 py-4">
                <p className="font-mono text-small font-semibold text-rr-magenta-deep">You need</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {courses.prerequisites.items.map((i) => (
                    <li key={i} className="text-body text-text-strong">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border border-ink-950/10 bg-paper-100 px-5 py-4">
                <p className={`${MONO_NOTE} font-semibold`}>Not covered</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {courses.prerequisites.not_covered.map((i) => (
                    <li key={i} className="text-body text-text-body">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      ),
    },
    {
      id: "outline",
      label: LABELS.tab_outline,
      icon: <Glyph name="layers" />,
      count: { value: modules.length, noun: plural(modules.length, LABELS.noun_module) },
      panel: (
        <>
          <BlockHeader id="course-outline" title={copy.outline_heading} />
          <CourseOutline outline={courses.outline} modules={modules} />
          {leftOut.length > 0 && (
            <p className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-small">
              <span className={MONO_NOTE}>
                Not in this plan: Modules {moduleRange(leftOut.map((m) => m.id))}
              </span>
              {/* Straight to the longer plan's outline: the reader came
                  from this one. */}
              {longer.map((p) => (
                <span key={p.id} className="font-semibold">
                  <LearnLink href={`/learn/courses/${p.id}#outline`}>{`See the ${p.title}`}</LearnLink>
                </span>
              ))}
            </p>
          )}
        </>
      ),
    },
  ];
  if (staff.length > 0) {
    tabs.push({
      id: "staff",
      label: LABELS.tab_staff,
      icon: <Glyph name="person" />,
      count: { value: staff.length, noun: plural(staff.length, LABELS.noun_person) },
      panel: (
        <>
          <BlockHeader id="course-staff" title={copy.staff_heading} />
          <ul className="flex flex-col gap-5">
            {staff.map((s) => {
              const initials = s.name
                .split(/\s+/)
                .map((w) => w[0])
                .slice(0, 2)
                .join("");
              return (
                <li
                  key={s.id}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-5 gap-y-4 rounded-card border border-ink-950/10 bg-paper-50 p-5 shadow-card transition-[transform,box-shadow,border-color] duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:border-rr-violet/40 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3"
                >
                  {s.photo?.src ? (
                    <img
                      src={asset(s.photo.src)}
                      alt={s.photo.alt}
                      width={s.photo.width}
                      height={s.photo.height}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full rounded-media object-cover ring-2 ring-rr-violet/30 ring-offset-2 ring-offset-paper-50 sm:row-span-2"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex aspect-square w-full items-center justify-center rounded-media bg-rr-violet/15 font-display text-display-s font-semibold text-rr-magenta-deep sm:row-span-2"
                    >
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display text-lead font-semibold text-text-strong">
                      <LearnLink href={s.link}>{s.name}</LearnLink>
                    </h3>
                    <p className="mt-1 text-small text-text-body">
                      {s.role}, {s.affiliation}
                    </p>
                    <p className="mt-2">
                      <span className="inline-block rounded-btn bg-rr-violet/10 px-2.5 py-0.5 font-mono text-small text-rr-magenta-deep">
                        {s.project_role}
                      </span>
                    </p>
                  </div>
                  {/* Under the name beside the photo from sm; the full
                      width under both on a phone, not a narrow column. */}
                  <p className="col-span-2 max-w-[62ch] text-body text-text-body sm:col-span-1 sm:col-start-2">
                    {s.bio}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ),
    });
  }
  if (courses.faq.length > 0) {
    tabs.push({
      id: "logistics",
      label: LABELS.tab_logistics,
      icon: <Glyph name="chat" />,
      count: { value: courses.faq.length, noun: plural(courses.faq.length, LABELS.noun_question) },
      panel: (
        <>
          <BlockHeader id="course-faq" title={copy.faq_heading} />
          <FaqList items={courses.faq} email={meta.contact} cards />
        </>
      ),
    });
  }

  return (
    <div className="pt-nav">
      {/* The banner: a site photo under a dark scrim (strongest behind the
          text), the one h1 in the logo gradient, the blurb and the facts as
          chips. Edge to edge on a phone, a rounded band in the page
          container from sm. */}
      <section aria-labelledby="course-title" className="mx-auto max-w-page px-0 pt-0 sm:px-6 sm:pt-6 lg:pt-8">
        <div className="relative isolate overflow-hidden bg-ink-950 text-text-on-ink sm:rounded-media">
          <img
            src={asset(banner.src)}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            decoding="async"
            fetchPriority="high"
            style={{ objectPosition: banner.position }}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/95 via-ink-950/90 to-ink-950/75 lg:bg-linear-to-r lg:from-ink-950/95 lg:from-30% lg:via-ink-950/75 lg:via-55% lg:to-ink-950/10"
          />
          <div className="grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-12 lg:items-center lg:px-12 lg:py-11">
            <div className="lg:col-span-8">
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 bg-rr-magenta-bright" />
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small text-text-on-ink-muted">
                  {crumbs.map((c, i) => (
                    <li key={c.label} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden="true">/</span>}
                      {c.href ? (
                        <Link
                          to={c.href}
                          className={`text-text-on-ink underline decoration-white/30 underline-offset-4 hover:decoration-rr-magenta-bright hover:decoration-2 focus-visible:outline-text-on-ink ${TAP}`}
                        >
                          {c.label}
                        </Link>
                      ) : (
                        <span>{c.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              <h1 id="course-title" className="max-w-[18ch] font-display text-display-xl font-semibold">
                {/* Ink context only (index.css): the cyan stop needs the scrim. */}
                <span className="text-gradient-logo -my-[0.15em] inline-block py-[0.15em]">{course.title}</span>
              </h1>
              <p className="mt-4 max-w-[60ch] text-lead text-text-on-ink/90">{course.blurb}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={LABELS.facts}>
                {chips.map((c, i) => (
                  <li
                    key={c}
                    className={`rounded-pill px-3 py-1 font-mono text-small ring-1 ring-inset ${
                      i === 0 ? "bg-rr-violet/40 text-white ring-rr-violet" : "bg-white/10 text-text-on-ink ring-white/20"
                    }`}
                  >
                    {c}
                  </li>
                ))}
              </ul>
              {/* From lg the solid button lives in the "At a glance" card,
                  which stays in view; here it is the phone's and tablet's. */}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 lg:hidden">
                {start}
                <Button href={copy.ask.href} variant="ghost" on="ink" className="px-0!" target="_blank" rel="noopener noreferrer">
                  {copy.ask.label}
                </Button>
              </div>
            </div>
            {offering && (
              <div className="hidden lg:col-span-3 lg:col-start-9 lg:flex">
                <span className="inline-flex rounded-media bg-white px-6 py-5 shadow-card">
                  <img
                    src={asset(offering.logo.src)}
                    alt={offering.logo.alt}
                    {...logoAttrs(offering.logo, 56)}
                    decoding="async"
                    className="block h-14 w-auto"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page px-6 pt-8 pb-16 lg:pt-10 lg:pb-20">
        {/* The 7/5 split from lg: the tabs on the left, the card beside
            them. At 768 it left the course a 340px column, so below lg the
            card follows the tabs instead. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="min-w-0 lg:col-span-7">
            <CourseTabs tabs={tabs} label={LABELS.tablist} />
          </div>

          {/* At a glance: the facts a reader scans for, an ink glyph on a
              violet tile per row, in a card that stays in view beside the
              tabs from desktop. Null dates and effort have no row at all. */}
          <aside aria-labelledby="course-glance" className="max-w-xl lg:col-span-5 lg:max-w-none xl:col-span-4 xl:col-start-9">
            {/* Sticky only where the card fits under the bar (about 34rem
                tall at most on Penn): a short landscape window scrolls it. */}
            <div className="rounded-card border border-rr-violet/20 bg-rr-violet/[0.05] p-5 sm:p-6 lg:top-[calc(var(--spacing-nav)+2rem)] lg:[@media(min-height:40rem)]:sticky">
              <h2 id="course-glance" className="font-display text-lead font-semibold text-text-strong">
                {copy.glance_heading}
              </h2>
              <dl className="mt-3 border-b border-rr-violet/10">
                {offering?.code && (
                  <Row icon="hash" term="Course number">
                    {offering.code}
                  </Row>
                )}
                {offering && (
                  <Row icon="building" term="University">
                    <a href={offering.website} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {offering.institution}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </Row>
                )}
                {offering && plan && (
                  <Row icon="route" term="Follows">
                    <LearnLink href={`/learn/courses/${plan.id}`}>{`the ${plan.title}`}</LearnLink>
                  </Row>
                )}
                {plan && (
                  <Row icon="calendar" term="Length">
                    {plan.weeks} weeks
                  </Row>
                )}
                {dated && (
                  <Row icon="calendar" term="Dates">
                    {formatDate(course.starts!)} to {formatDate(course.ends!)}
                  </Row>
                )}
                {course.effort_hours_per_week !== null && (
                  <Row icon="clock" term="Effort">
                    {course.effort_hours_per_week} hours a week
                  </Row>
                )}
                <Row icon="layers" term="Modules">
                  {moduleRange(ids)}
                </Row>
                <Row icon="flask" term="Labs">
                  {numberRange(labs.map((l) => l.number))}
                </Row>
                {races.length > 0 && (
                  <Row icon="flag" term="Races">
                    {numberRange(races.map((r) => r.number))}
                  </Row>
                )}
                {/* The coursekit's class time. Not an offering's: Penn's own
                    sessions differ (effort_note), so it shows on plans only. */}
                {!offering && !isTodo(meta.class_time.text) && (
                  <Row icon="clock" term="Class time">
                    {meta.class_time.text}
                  </Row>
                )}
                <Row icon="doc" term="License">
                  <a href={meta.license.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {meta.license.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Row>
              </dl>
              {start && <p className="mt-5 [&>a]:w-full">{start}</p>}
              <ul className="mt-4 flex flex-col gap-2 text-small font-semibold">
                <li>
                  <LearnLink href={copy.open_material.href}>{copy.open_material.label}</LearnLink>
                </li>
                <li>
                  <LearnLink href={copy.ask.href}>{copy.ask.label}</LearnLink>
                </li>
                {offering?.links.map((l) => (
                  <li key={l.href}>
                    <LearnLink href={l.href}>{l.label}</LearnLink>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <CopyLink>
                  <LearnLink href={copy.not_found.back.href} className="text-small font-semibold">
                    {copy.not_found.back.label}
                  </LearnLink>
                </CopyLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
