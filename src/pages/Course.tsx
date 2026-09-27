import { useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { findCourse, type CourseOffering, type CoursePlan, type CoursesFile } from "../lib/data";
import { useCourses } from "../hooks/useCourses";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import LearnHeader, { type Crumb } from "../components/learn/LearnHeader";
import LearnLink, { CheckMark } from "../components/learn/LearnLink";
import BlockHeader from "../components/learn/BlockHeader";
import CourseOutline from "../components/learn/CourseOutline";
import FaqList from "../components/learn/FaqList";
import CoursesUnavailable from "../components/learn/CoursesUnavailable";
import { LINK, MONO_NOTE, isTodo, moduleRange, numberRange, pad2 } from "../components/learn/learnStyles";

/** "Jan 20, 2027" from an ISO date, in UTC so the day never shifts. */
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

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

/** One row of the "At a glance" panel. */
function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 border-t border-ink-950/10 py-3">
      <dt className={MONO_NOTE}>{term}</dt>
      <dd className="text-small text-text-strong">{children}</dd>
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

/**
 * /learn/courses/:id: one plan (4, 10 or 15 weeks) or one university that
 * teaches the course. The header says what it is and where to start; the
 * body is a 7/5 split, the course on the left (about, what you'll learn,
 * prerequisites, the plan's outline, staff, logistics) and a sticky "At a
 * glance" panel on the right. No enroll button, no progress, no tabs: the
 * material is open on the course site and every lecture links there. Null
 * dates and effort render nothing (COURSES_CONTENT.md).
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

  let n = 0;
  const next = () => pad2(++n);

  const crumbs: Crumb[] = [
    { label: "Learn", href: "/learn" },
    { label: courses.catalog.hero.eyebrow, href: "/learn/courses" },
    { label: offering ? offering.institution : "Plans" },
  ];

  // Only what the data holds: no date while the dates are null, no effort
  // while the hours are.
  const metaParts = [
    offering?.code,
    plan ? `${plan.weeks} weeks` : null,
    ids.length ? `Modules ${moduleRange(ids)}` : null,
    labs.length ? `${labs.length} labs` : null,
    races.length ? (races.length === 1 ? races[0].title : `${races.length} races`) : null,
    dated ? `${formatDate(course.starts!)} to ${formatDate(course.ends!)}` : null,
    course.effort_hours_per_week !== null ? `${course.effort_hours_per_week} h a week` : null,
  ].filter((p): p is string => !!p);
  const metaLine = (
    // Each item keeps its separator in front of it and never breaks inside,
    // so a wrapped line starts with "· 2 races" and none ends on a dot.
    <p className={`flex flex-wrap gap-x-2 ${MONO_NOTE}`}>
      {metaParts.map((p, i) => (
        <span key={p} className={`whitespace-nowrap ${i === 0 && offering?.code ? "text-text-strong" : ""}`}>
          {i > 0 && <span aria-hidden="true" className="mr-2 text-text-muted">·</span>}
          {p}
        </span>
      ))}
    </p>
  );

  return (
    <div className="pt-nav">
      <LearnHeader
        id="course-title"
        crumbs={crumbs}
        title={course.title}
        lead={course.blurb}
        meta={metaLine}
        actions={
          <>
            {first && <Button href={first.href} target="_blank" rel="noopener noreferrer">{`Start with Module ${first.id}`}</Button>}
            <Button href={copy.ask.href} variant="ghost" className="px-0!" target="_blank" rel="noopener noreferrer">
              {copy.ask.label}
            </Button>
          </>
        }
      />

      <Section width="page" rule>
        {/* The 7/5 split from lg. At 768 it left the course a 340px column
            (What you'll learn in two squeezed columns, the bio a ribbon), so
            below lg the panel follows the course instead. */}
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-x-10">
          <div className="flex min-w-0 flex-col gap-16 lg:col-span-7 desktop:gap-20">
            <section aria-labelledby="course-about">
              <BlockHeader id="course-about" index={next()} title={copy.about_heading} />
              <Reveal className="flex max-w-[62ch] flex-col gap-4">
                {copy.about.map((p) => (
                  <p key={p} className="text-lead text-text-body">
                    {p}
                  </p>
                ))}
              </Reveal>
            </section>

            {learn.length > 0 && (
              <section aria-labelledby="course-learn">
                <BlockHeader id="course-learn" index={next()} title={copy.learn_heading} />
                <ul className="grid gap-x-8 border-t border-ink-950/10 sm:grid-cols-2">
                  {learn.map((l) => (
                    <li key={l.text} className="flex gap-3 border-b border-ink-950/10 py-3 text-body text-text-strong">
                      <CheckMark />
                      <span>{l.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="course-prereq">
              <BlockHeader id="course-prereq" index={next()} title={copy.prerequisites_heading} />
              <p className="max-w-[62ch] text-body text-text-body">{courses.prerequisites.lead}</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <p className={MONO_NOTE}>You need</p>
                  <ul className="mt-2 border-t border-ink-950/10">
                    {courses.prerequisites.items.map((i) => (
                      <li key={i} className="border-b border-ink-950/10 py-2.5 text-body text-text-strong">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={MONO_NOTE}>Not covered</p>
                  <ul className="mt-2 border-t border-ink-950/10">
                    {courses.prerequisites.not_covered.map((i) => (
                      <li key={i} className="border-b border-ink-950/10 py-2.5 text-body text-text-body">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="course-outline">
              <BlockHeader id="course-outline" index={next()} title={copy.outline_heading} />
              <CourseOutline outline={courses.outline} modules={modules} />
              {leftOut.length > 0 && (
                <p className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-small">
                  <span className={MONO_NOTE}>
                    Not in this plan: Modules {moduleRange(leftOut.map((m) => m.id))}
                  </span>
                  {longer.map((p) => (
                    <span key={p.id} className="font-semibold">
                      <LearnLink href={`/learn/courses/${p.id}`}>{`See the ${p.title}`}</LearnLink>
                    </span>
                  ))}
                </p>
              )}
            </section>

            {staff.length > 0 && (
              <section aria-labelledby="course-staff">
                <BlockHeader id="course-staff" index={next()} title={copy.staff_heading} />
                <ul className="flex flex-col gap-8">
                  {staff.map((s) => (
                    <li
                      key={s.id}
                      className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-5 gap-y-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-3"
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}${s.photo.src.replace(/^\//, "")}`}
                        alt={s.photo.alt}
                        width={s.photo.width}
                        height={s.photo.height}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full rounded-media border border-ink-950/10 object-cover sm:row-span-2"
                      />
                      <div className="min-w-0">
                        <h3 className="font-display text-lead font-semibold text-text-strong">
                          <LearnLink href={s.link}>{s.name}</LearnLink>
                        </h3>
                        <p className="mt-1 text-small text-text-body">
                          {s.role}, {s.affiliation}
                        </p>
                        <p className={`mt-1 ${MONO_NOTE}`}>{s.project_role}</p>
                      </div>
                      {/* Under the name beside the photo from sm; the full
                          width under both on a phone, not a narrow column. */}
                      <p className="col-span-2 max-w-[62ch] text-body text-text-body sm:col-span-1 sm:col-start-2">
                        {s.bio}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="course-faq">
              <BlockHeader id="course-faq" index={next()} title={copy.faq_heading} />
              <FaqList items={courses.faq} email={meta.contact} />
            </section>
          </div>

          {/* At a glance: the facts a reader scans for, in one column that
              stays in view beside the long left column from desktop. Null
              dates and effort have no row at all. */}
          <aside aria-labelledby="course-glance" className="max-w-xl lg:col-span-4 lg:col-start-9 lg:max-w-none">
            {/* Sticky only where the panel fits under the bar (about 34rem
                tall at most on Penn): a short landscape window scrolls it. */}
            <div className="lg:top-[calc(var(--spacing-nav)+2rem)] lg:[@media(min-height:40rem)]:sticky">
              <h2 id="course-glance" className="font-display text-lead font-semibold text-text-strong">
                {copy.glance_heading}
              </h2>
              <dl className="mt-4 border-b border-ink-950/10">
                {offering?.code && <Row term="Course number">{offering.code}</Row>}
                {offering && (
                  <Row term="University">
                    <a href={offering.website} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {offering.institution}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </Row>
                )}
                {offering && plan && (
                  <Row term="Follows">
                    <LearnLink href={`/learn/courses/${plan.id}`}>{`the ${plan.title}`}</LearnLink>
                  </Row>
                )}
                {plan && <Row term="Length">{plan.weeks} weeks</Row>}
                {dated && (
                  <Row term="Dates">
                    {formatDate(course.starts!)} to {formatDate(course.ends!)}
                  </Row>
                )}
                {course.effort_hours_per_week !== null && (
                  <Row term="Effort">{course.effort_hours_per_week} hours a week</Row>
                )}
                <Row term="Modules">{moduleRange(ids)}</Row>
                <Row term="Labs">{numberRange(labs.map((l) => l.number))}</Row>
                {races.length > 0 && <Row term="Races">{numberRange(races.map((r) => r.number))}</Row>}
                {/* The coursekit's class time. Not an offering's: Penn's own
                    sessions differ (effort_note), so it shows on plans only. */}
                {!offering && !isTodo(meta.class_time.text) && <Row term="Class time">{meta.class_time.text}</Row>}
                <Row term="License">
                  <a href={meta.license.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {meta.license.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Row>
              </dl>
              <ul className="mt-6 flex flex-col gap-3 text-body font-semibold">
                <li>
                  <LearnLink href={copy.open_material.href}>{copy.open_material.label}</LearnLink>
                </li>
                {offering?.links.map((l) => (
                  <li key={l.href}>
                    <LearnLink href={l.href}>{l.label}</LearnLink>
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                <Button href={copy.not_found.back.href} variant="secondary" size="sm">
                  {copy.not_found.back.label}
                </Button>
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
