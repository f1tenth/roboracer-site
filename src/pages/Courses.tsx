import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { loadCommunity, logoAttrs, type CoursesFile } from "../lib/data";
import { useCourses } from "../hooks/useCourses";
import { useScrollToHash } from "../hooks/useScrollToHash";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import CommunityJoin from "../components/ui/CommunityJoin";
import NearViewport from "../components/about/NearViewport";
import LearnHeader from "../components/learn/LearnHeader";
import Ledger, { CourseIcon } from "../components/learn/Ledger";
import LearnLink from "../components/learn/LearnLink";
import PlanLadder from "../components/learn/PlanLadder";
import CourseOutline from "../components/learn/CourseOutline";
import TopicFinder from "../components/learn/TopicFinder";
import CoursesUnavailable from "../components/learn/CoursesUnavailable";
import { LINK, MONO_NOTE, pad2, visibleFeatures } from "../components/learn/learnStyles";

/** Logo box height for a university offering, in px (the About wall's 80). */
const LOGO_H = 80;

/** Micro-labels this unit introduced. Stage 3 moves them into courses.json
 * (docs/learn/COURSES_INTERACTIVITY.md, section 3); docs/qa/courses-catalog.md
 * lists them. */
const LABELS = {
  stats: "The course and the community in numbers",
};

/** The plan picker's query parameter: /learn/courses?plan=10-weeks. */
const PLAN_PARAM = "plan";

/**
 * The picked plan, kept in the address (?plan=) so a link or a reload
 * restores it. Picking replaces the history entry rather than adding one:
 * Back leaves the page, as it did before the picker, and Back onto this page
 * restores the plan from the address. The pick also lives in local state,
 * because the router's own update is a transition and a controlled radio
 * must change in the same frame as the click.
 */
function usePlanParam(): [string | null, (id: string | null) => void] {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get(PLAN_PARAM);
  const [plan, setPlan] = useState(fromUrl);
  // The address changed under the page (Back, Forward, a link): follow it.
  useEffect(() => setPlan(fromUrl), [fromUrl]);
  const select = useCallback(
    (id: string | null) => {
      setPlan(id);
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set(PLAN_PARAM, id);
          else next.delete(PLAN_PARAM);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );
  return [plan, select];
}

/** The title's last two words on their own line in the logo gradient (one
 * display phrase per viewport, Cedric's colour brief of 2026-10-20), cloned
 * per line so a phrase that wraps on a phone keeps the whole gradient on each
 * line. */
function GradientTail({ text }: { text: string }) {
  const words = text.split(" ");
  const tail = words.slice(-2).join(" ");
  const head = words.slice(0, -2).join(" ");
  return (
    <>
      {head && (
        <>
          {head}
          <br />
        </>
      )}
      <span className="text-gradient-logo box-decoration-clone">{tail}</span>
    </>
  );
}

function Offerings({ courses }: { courses: CoursesFile }) {
  // Only offerings a source confirms (COURSES_CONTENT.md): Penn today. With
  // one, a feature row rather than a one-card grid; the list takes a second
  // row the day there is one.
  const published = courses.offerings.filter((o) => o.status === "published");
  return (
    <ul className="divide-y divide-ink-950/10 border-y border-ink-950/10">
      {published.map((o) => {
        const plan = courses.plans.find((p) => p.id === o.plan);
        const meta = [o.code, plan ? `follows the ${plan.title}` : null].filter(Boolean).join(" · ");
        return (
          <li key={o.id} className="grid gap-6 py-8 md:grid-cols-12 md:items-center md:gap-x-10 desktop:py-10">
            <a
              href={o.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center opacity-85 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100 md:col-span-3 md:h-20"
            >
              <img
                src={`${import.meta.env.BASE_URL}${o.logo.src.replace(/^\//, "")}`}
                alt={o.logo.alt}
                {...logoAttrs(o.logo, LOGO_H)}
                loading="lazy"
                decoding="async"
                className="max-h-full w-auto max-w-full object-contain"
              />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <div className="md:col-span-9 lg:col-span-6">
              <h3 className="font-display text-display-s font-semibold text-text-strong">
                <Link to={`/learn/courses/${o.id}`} className={LINK}>
                  {o.institution}
                </Link>
              </h3>
              {meta && <p className={`mt-2 ${MONO_NOTE}`}>{meta}</p>}
              <p className="mt-3 max-w-[56ch] text-body text-text-body">{o.blurb}</p>
              {o.links.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-small font-semibold">
                  {o.links.map((l) => (
                    <li key={l.href}>
                      <LearnLink href={l.href}>{l.label}</LearnLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Its own column from lg; under the copy before, where the
                narrow column broke "See the Penn / course". */}
            <p className="text-body font-semibold md:col-span-9 md:col-start-4 lg:col-span-3 lg:col-start-auto lg:text-right">
              <LearnLink href={`/learn/courses/${o.id}`}>{`See the ${o.short_name} course`}</LearnLink>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * /learn/courses: the course catalog, ported from Dhyey Shah's LMS mock and
 * rebuilt in the site's own language (paper base, numbered sections, hairline
 * rules, the /research page top). Everything renders from
 * public/data/courses.json under the rules in docs/learn/COURSES_CONTENT.md:
 * published offerings only, available features only while there is no course
 * platform, no null date or effort, no TODO(content) string.
 */
export default function Courses() {
  useScrollToHash();
  const courses = useCourses();
  const [plan, selectPlan] = usePlanParam();
  // The members figure mirrors community.json (COURSES_CONTENT.md): the
  // file's own copy shows until that loads, and if it never does.
  const [members, setMembers] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    loadCommunity()
      .then((c) => live && setMembers(c.members_display))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  if (!courses) return <CoursesUnavailable failed={courses === null} />;

  const { catalog, meta, teach } = courses;
  const stats = courses.stats.map((s) => (s.id === "members" && members ? { ...s, value: members } : s));
  const hasOfferings = courses.offerings.some((o) => o.status === "published");
  const catalogFeatures = visibleFeatures(courses.features, meta.lms_url).filter((f) => f.pages.includes("catalog"));
  const hasFeatures = catalogFeatures.length > 0;
  const selectedPlan = courses.plans.some((p) => p.id === plan) ? plan : null;
  // Sections number themselves, so a section the data leaves out (no
  // published offering yet) does not leave a gap in 01, 02, 03.
  let n = 0;
  const next = () => pad2(++n);

  return (
    <div className="pt-nav">
      {/* The page top as a photo band (Cedric's colour brief, 2026-10-20):
          the headline's last words in the logo gradient, and the figures as
          stat tiles riding the band's bottom edge. */}
      <LearnHeader
        id="courses-title"
        crumbs={[{ label: "Learn", href: "/learn" }, { label: catalog.hero.eyebrow, current: true }]}
        title={<GradientTail text={catalog.hero.title} />}
        lead={catalog.hero.lead}
        media={catalog.hero.photo}
        actions={
          <>
            <Button href={catalog.hero.primary.href} on="ink">
              {catalog.hero.primary.label}
            </Button>
            <Button href={catalog.hero.secondary.href} variant="ghost" on="ink" className="px-0!">
              {catalog.hero.secondary.label}
            </Button>
          </>
        }
        overlap={
          <Ledger
            variant="tiles"
            label={LABELS.stats}
            stats={[...stats.filter((s) => s.group === "course"), ...stats.filter((s) => s.group === "community")]}
          />
        }
      />

      {/* 01 The three plans: the ladder explains them, the sheet under it
          links each to its page. #courses is the header's "Pick a course". */}
      {/* The tight top: the stat tiles already end the band with their
          own overlap, and the full section padding under them read as an
          empty screen at 1440 (stage 3 review). */}
      <Section width="page" rule className="pt-section-tight!" aria-labelledby="courses">
        <SectionHeader
          index={next()}
          eyebrow={catalog.courses_heading.kicker}
          id="courses"
          title={catalog.courses_heading.title}
          lead={catalog.courses_heading.lead}
        />
        <PlanLadder courses={courses} selected={selectedPlan} onSelect={selectPlan} />
      </Section>

      {hasOfferings && (
        <Section width="page" rule aria-labelledby="offerings">
          <SectionHeader
            index={next()}
            eyebrow={catalog.offerings_heading.kicker}
            id="offerings"
            title={catalog.offerings_heading.title}
            lead={catalog.offerings_heading.lead}
          />
          <Reveal>
            <Offerings courses={courses} />
          </Reveal>
        </Section>
      )}

      <Section width="page" rule aria-labelledby="outline">
        <SectionHeader
          index={next()}
          eyebrow={catalog.outline_heading.kicker}
          id="outline"
          title={catalog.outline_heading.title}
          lead={catalog.outline_heading.lead}
        />
        <TopicFinder courses={courses} />
        <CourseOutline outline={courses.outline} modules={courses.outline.modules} showLinks />
      </Section>

      {hasFeatures && (
        <Section width="page" edge rule aria-labelledby="platform">
          <SectionHeader
            index={next()}
            eyebrow={catalog.features_heading.kicker}
            id="platform"
            title={catalog.features_heading.title}
            lead={catalog.features_heading.lead}
          />
          {/* What the course site gives, as icon tiles: an ink-stroke glyph
              on a violet-tinted square, the name, one sentence. */}
          <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {catalogFeatures.map((f) => (
              <li
                key={f.id}
                className="flex flex-col gap-4 rounded-card border border-ink-950/10 bg-paper-50 p-6 shadow-card"
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-card bg-rr-violet/12"
                >
                  <CourseIcon id={f.id} className="h-6 w-6" />
                </span>
                <h3 className="font-display text-lead font-semibold text-text-strong">{f.title}</h3>
                <p className="text-body text-text-body">{f.body}</p>
              </li>
            ))}
          </Reveal>
          <p className={`mt-8 ${MONO_NOTE}`}>
            <a
              href={meta.license.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-text-muted`}
            >
              {meta.license.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {" · "}
            {meta.license.summary}
          </p>
        </Section>
      )}

      {/* Teach it: the instructors page and the address. The mailto is an
          outline button: CommunityJoin's Slack card below carries the solid
          one, and at 1440 the two share a screen. */}
      <Section width="page" rule aria-labelledby="teach-it">
        <div className="grid gap-6 md:grid-cols-12 md:items-end desktop:gap-10">
          <div className="md:col-span-7">
            <SectionHeader
              index={next()}
              eyebrow={teach.hero.eyebrow}
              id="teach-it"
              className="max-md:mb-2"
              title={teach.contact.title}
              lead={teach.contact.lead}
            />
          </div>
          <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
              <Button href={catalog.hero.secondary.href} variant="ghost" className="px-0!">
                {catalog.hero.secondary.label}
              </Button>
              <Button href={teach.contact.href} variant="secondary">
                {teach.contact.label}
              </Button>
            </div>
            <p className={MONO_NOTE}>{meta.contact}</p>
          </div>
        </div>
      </Section>

      <NearViewport>
        <CommunityJoin index={next()} />
      </NearViewport>
    </div>
  );
}
