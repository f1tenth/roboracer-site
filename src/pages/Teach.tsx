import { Link, useLocation } from "react-router-dom";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { useCourses } from "../hooks/useCourses";
import type { CourseFeature, CoursesFile } from "../lib/data";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import CommunityJoin from "../components/ui/CommunityJoin";
import NearViewport from "../components/about/NearViewport";
import LearnLink, { Arrow, WithEmail } from "../components/learn/LearnLink";
import FaqList from "../components/learn/FaqList";
import PlanBuilder from "../components/learn/PlanBuilder";
import SectionRail from "../components/learn/SectionRail";
import CoursesUnavailable from "../components/learn/CoursesUnavailable";
import { BLOCK_TITLE, TAP, isExternal, isTodo, pad2, visibleFeatures } from "../components/learn/learnStyles";

const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;

/* Ink-stroke icons on 24px, drawn here (rule 8: none of the mock's). A
 * circle is two arcs so every icon is one path. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const ICONS = {
  mail: "M3 6h18v12H3zM3.5 6.5 12 13l8.5-6.5",
  key: `${circle(8, 12, 3.5)}M11.5 12H21M18 12v3M15 12v2`,
  sliders: `M4 7h10M18 7h2M4 17h4M12 17h8${circle(16, 7, 2)}${circle(10, 17, 2)}`,
  upload: "M12 16V5M7.5 9.5 12 5l4.5 4.5M4 15v4h16v-4",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  people: `${circle(9, 8, 3)}M3.5 19a5.5 5.5 0 0 1 11 0${circle(16.5, 9, 2.5)}M16 14a4.5 4.5 0 0 1 4.5 5`,
  unlock: "M7 11V8a5 5 0 0 1 9.6-2M5 11h14v9H5zM12 14.5v2",
  list: "M4 7l1.5 1.5L8 6M11 7h9M4 13l1.5 1.5L8 12M11 13h9M4.5 19h3M11 19h9",
  slides: "M3 4h18v12H3zM12 16v4M8 20h8M7 12l3-3 2 2 4-4",
  play: "M3 5h18v14H3zM10 9.5v5l4.5-2.5z",
  code: "M9 8l-4 4 4 4M15 8l4 4-4 4M13 6l-2 12",
  rubric: "M6 4h12v17H6zM9.5 4V3h5v1M9 12.5l2 2 4-4",
  dot: circle(12, 12, 4),
} as const;
type IconName = keyof typeof ICONS;

/** One icon per step of "How it works", in order (steps carry no icon field). */
const STEP_ICONS: IconName[] = ["mail", "key", "sliders", "upload", "flag", "people"];
const FEATURE_ICONS: Record<string, IconName> = {
  "free-to-reuse": "unlock",
  plans: "list",
  slides: "slides",
  videos: "play",
  labs: "code",
  rubrics: "rubric",
};

/** An ink-stroke icon on a violet-tinted square. */
function IconTile({ name }: { name: IconName }) {
  return (
    <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn bg-rr-violet/12 text-ink-950">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" focusable="false" className="h-6 w-6">
        <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Where each feature tile leads, from the course site's own addresses in
 * `meta` (no link, no lift, for a feature without one). */
function featureHref(f: CourseFeature, c: CoursesFile, search: string): string | null {
  const m = c.meta;
  const map: Record<string, string> = {
    "free-to-reuse": m.license.url,
    plans: `/learn/teach${search}#teach-lectures`,
    slides: m.downloads_url,
    videos: m.downloads_url,
    labs: m.labs_url,
    rubrics: m.grading_url,
  };
  return map[f.id] ?? null;
}

/** A feature tile's title link, stretched over the whole tile; the tile
 * draws the focus ring and the underline turns violet on its hover. */
const TILE_LINK =
  "text-text-strong underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-rr-violet after:absolute after:inset-0 focus-visible:outline-none";

/** The section's numbered rows as a small accent badge ("01"). */
const NUMBER_BADGE =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-btn bg-rr-violet/12 px-1.5 font-mono text-small font-semibold tabular-nums text-rr-violet-deep";

/**
 * /learn/teach: the instructors page, first ported from Dhyey Shah's LMS mock
 * and since 2026-10-20 dressed to stand out (Cedric: the course pages read
 * too quiet). A photo header on ink with the title in the logo gradient, the
 * course's figures and the hero actions; a section rail from lg; How it works
 * as six icon steps and the two portals; what comes with it as icon tiles
 * that open the course site; the guide; the plan builder (start from a plan,
 * tick modules, copy, share or email the result: the honest half of the
 * mock's planner, COURSES_INTERACTIVITY.md); recording tips and the docs; the
 * instructor questions; the shared Join block. The mock's admin section and
 * sign-in are gone (COURSES_CONTENT.md); the hero's feature chips respect each
 * feature's status like the tiles do.
 */
export default function Teach() {
  useScrollToHash();
  const { search } = useLocation();
  const courses = useCourses();
  if (!courses) return <CoursesUnavailable failed={courses === null} />;

  const { teach, meta } = courses;
  const visible = visibleFeatures(courses.features, meta.lms_url);
  const pills = teach.hero.pills
    .map((id) => visible.find((f) => f.id === id))
    .filter((f) => f !== undefined);
  const features = visible.filter((f) => f.pages.includes("teach"));
  const figures = courses.stats.filter((s) => s.group === "course");
  // courses.json teach.hero.photo (docs/ASSET_MANIFEST.md U3-01).
  const photo = teach.hero.photo;

  // The rail and the section eyebrows share one numbering.
  const rail = [
    { id: "teach-how", label: teach.how_it_works.kicker ?? teach.how_it_works.title },
    ...(features.length ? [{ id: "teach-features", label: teach.features.kicker ?? teach.features.title }] : []),
    { id: "teach-steps", label: teach.steps.kicker ?? teach.steps.title },
    { id: "teach-lectures", label: teach.lecture_selection.kicker ?? teach.lecture_selection.title },
    { id: "teach-recording", label: teach.recording.kicker ?? teach.recording.title },
    { id: "teach-faq", label: teach.faq_heading },
  ].map((r, i) => ({ ...r, index: pad2(i + 1) }));
  const indexOf = (id: string) => rail.find((r) => r.id === id)?.index;

  return (
    <div className="pt-nav lg:[--rail-h:2.75rem]">
      {/* The photo header, on ink: the picture fills the right of the band
          (the top strip on a phone) and fades into ink under the copy, so no
          line of text sits on the bare photo. */}
      <section aria-labelledby="teach-title" className="relative isolate overflow-hidden bg-ink-950 text-text-on-ink">
        <div className="relative h-56 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[62%]">
          {photo && (
            <img
              src={asset(photo.src)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              decoding="async"
              fetchPriority="high"
              style={photo.position ? { objectPosition: photo.position } : undefined}
              className="h-full w-full object-cover"
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-ink-950/10 lg:hidden" />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-ink-950)_0%,rgb(7_7_13/0.82)_22%,rgb(7_7_13/0.25)_60%,rgb(7_7_13/0.1)_100%)] lg:block"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink-950 to-transparent lg:block" />
        </div>
        <div className="relative mx-auto flex max-w-page flex-col px-6 pb-12 max-lg:-mt-12 lg:min-h-[38rem] lg:pt-20 lg:pb-14">
          <div className="lg:max-w-[50%]">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2">
              <span aria-hidden="true" className="h-1 w-1 shrink-0 bg-rr-magenta-bright" />
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small text-text-on-ink-muted">
                <li>
                  <Link
                    to="/learn"
                    className={`text-text-on-ink underline decoration-text-on-ink/30 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 focus-visible:outline-text-on-ink ${TAP}`}
                  >
                    Learn
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{teach.hero.eyebrow}</span>
                </li>
              </ol>
            </nav>
            <h1 id="teach-title" className="font-display text-display-xl font-semibold">
              <span className="text-gradient-logo -my-[0.15em] inline-block py-[0.15em]">{teach.hero.title}</span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-lead text-text-on-ink">{teach.hero.lead}</p>
            {pills.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {pills.map((f) => (
                  <li
                    key={f.id}
                    className="inline-flex items-center gap-2 rounded-pill border border-text-on-ink/20 bg-ink-950/60 px-3 py-1 font-mono text-small text-text-on-ink"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-rr-magenta-bright" />
                    {f.short}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={teach.hero.primary.href} on="ink">
                {teach.hero.primary.label}
              </Button>
              <Button href={teach.hero.plans_link.href} variant="ghost" on="ink" className="px-0!">
                {teach.hero.plans_link.label}
              </Button>
            </div>
          </div>
          {figures.length > 0 && (
            <div className="mt-12 border-t border-text-on-ink/15 pt-6 lg:mt-auto lg:pt-8">
              <p className="font-mono text-small text-text-on-ink-muted">The course</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
                {figures.map((s) => (
                  <div key={s.id} className="flex flex-col">
                    <dt className="font-mono text-small text-text-on-ink-muted">{s.label}</dt>
                    <dd className="mt-auto pt-1 font-mono text-display-m font-semibold tabular-nums text-rr-magenta-bright">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      <SectionRail items={rail} label={teach.rail_label} />

      {/* How it works: six icon steps on one violet rule (vertical on a
          phone), then the two places the work happens as tinted cards. */}
      {/* Every teach section takes the tight rhythm: a reference page read
          with the rail, where the full padding added 240 px of blank per
          section at 1440 (stage 3 review, the page-length question). */}
      <Section width="page" tight aria-labelledby="teach-how">
        <SectionHeader
          index={indexOf("teach-how")}
          eyebrow={teach.how_it_works.kicker}
          id="teach-how"
          title={teach.how_it_works.title}
          lead={teach.how_it_works.lead}
        />
        <Reveal as="ol" stagger className="relative grid gap-y-8 md:grid-cols-3 md:gap-y-12 lg:grid-cols-6">
          {teach.how_it_works.steps.map((s, i) => (
            <li
              key={s.n}
              className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 md:block md:pr-6"
            >
              {/* The rule joining the icons: through the tile's middle from md,
                  down the left edge on a phone. Not after the last step. */}
              {i < teach.how_it_works.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-12 bottom-[-2rem] left-6 w-px bg-rr-violet/30 md:top-6 md:right-0 md:bottom-auto md:left-12 md:h-px md:w-auto ${
                    i % 3 === 2 ? "md:max-lg:hidden" : ""
                  }`}
                />
              )}
              <span className="relative">
                <IconTile name={STEP_ICONS[i] ?? "dot"} />
              </span>
              <div className="md:mt-5">
                <p className="font-mono text-small font-semibold tabular-nums text-rr-violet-deep">{pad2(s.n)}</p>
                <h3 className="mt-1 font-display text-lead font-semibold text-text-strong">{s.title}</h3>
                <p className="mt-2 max-w-[36ch] text-small text-text-body">{s.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6 desktop:mt-20">
          {teach.how_it_works.portals.map((p) => (
            <div key={p.id} className="rounded-card border border-rr-violet/20 bg-[color-mix(in_srgb,var(--color-rr-violet)_6%,var(--color-paper-50))] p-6 md:p-8">
              <p className="inline-flex rounded-pill bg-rr-violet/15 px-2.5 py-0.5 font-mono text-small font-semibold text-rr-violet-deep">
                {p.tag}
              </p>
              <h3 className={`mt-4 ${BLOCK_TITLE}`}>{p.title}</h3>
              <p className="mt-3 max-w-[56ch] text-body text-text-body">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {features.length > 0 && (
        <Section width="page" tight edge rule aria-labelledby="teach-features">
          <SectionHeader
            index={indexOf("teach-features")}
            eyebrow={teach.features.kicker}
            id="teach-features"
            title={teach.features.title}
            lead={teach.features.lead}
          />
          {/* Icon tiles; each that has a page on the course site opens it
              (the whole tile is the link, so it lifts like a card). On a
              phone the icon sits beside the title, which saves a row per
              tile (six of them stacked). */}
          <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {features.map((f) => {
              const href = featureHref(f, courses, search);
              const web = href !== null && isExternal(href);
              return (
                <li
                  key={f.id}
                  className={`group relative grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-card border border-ink-950/10 bg-paper-50 p-5 shadow-card sm:flex sm:flex-col sm:items-stretch sm:gap-4 sm:p-6 ${
                    href
                      ? "transition-[translate,box-shadow,border-color] duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:border-rr-violet/40 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-rr-violet"
                      : ""
                  }`}
                >
                  <IconTile name={FEATURE_ICONS[f.id] ?? "dot"} />
                  <h3 className="font-display text-lead font-semibold text-text-strong">
                    {href ? (
                      web ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={TILE_LINK}
                        >
                          {f.title}
                          <Arrow out />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link to={href} className={TILE_LINK}>
                          {f.title}
                          <Arrow out={false} />
                        </Link>
                      )
                    ) : (
                      f.title
                    )}
                  </h3>
                  <p className="col-span-2 text-body text-text-body">{f.body}</p>
                </li>
              );
            })}
          </Reveal>
        </Section>
      )}

      {/* The guide: every step open, one ruled block each (what it is,
          the checklist, the tip and the Open edX docs), no tabs. */}
      <Section width="page" tight rule aria-labelledby="teach-steps">
        <SectionHeader
          index={indexOf("teach-steps")}
          eyebrow={teach.steps.kicker}
          id="teach-steps"
          title={teach.steps.title}
          lead={teach.steps.lead}
        />
        <ol className="border-t border-ink-950/10">
          {teach.steps.items.map((it) => (
            <li
              key={it.n}
              className="grid gap-4 border-b border-ink-950/10 py-6 md:grid-cols-12 md:gap-6 md:gap-x-10 md:py-8 desktop:py-10"
            >
              <div className="md:col-span-4">
                <p className={NUMBER_BADGE}>{pad2(it.n)}</p>
                <h3 className={`mt-3 ${BLOCK_TITLE}`}>{it.title}</h3>
                <p className="mt-2 max-w-[40ch] text-body text-text-body">{it.lead}</p>
              </div>
              <ul className="flex flex-col gap-2.5 md:col-span-5">
                {it.checklist.map((c) => (
                  <li key={c} className="flex gap-3 text-body text-text-strong">
                    <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-rr-violet" />
                    <span>
                      <WithEmail text={c} email={meta.contact} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4 md:col-span-3">
                {!isTodo(it.tip) && (
                  <p className="rounded-card bg-rr-magenta/10 p-4 text-small text-text-body">
                    <span className="block font-mono font-semibold text-rr-magenta-deep">Tip</span>
                    {it.tip}
                  </p>
                )}
                {it.links.length > 0 && (
                  <ul className="flex flex-col gap-2 text-small font-semibold">
                    {it.links.map((l) => (
                      <li key={l.href}>
                        <LearnLink href={l.href}>{l.label}</LearnLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section width="page" tight edge rule aria-labelledby="teach-lectures">
        <SectionHeader
          index={indexOf("teach-lectures")}
          eyebrow={teach.lecture_selection.kicker}
          id="teach-lectures"
          title={teach.lecture_selection.title}
          lead={teach.lecture_selection.lead}
          action={
            <Button href={teach.hero.secondary.href} variant="ghost" className="px-0!" target="_blank" rel="noopener noreferrer">
              {teach.hero.secondary.label}
            </Button>
          }
        />
        <PlanBuilder courses={courses} />
      </Section>

      <Section width="page" tight rule aria-labelledby="teach-recording">
        <SectionHeader
          index={indexOf("teach-recording")}
          eyebrow={teach.recording.kicker}
          id="teach-recording"
          title={teach.recording.title}
          lead={teach.recording.lead}
        />
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-10">
          <Reveal as="ol" stagger className="flex flex-col md:col-span-5">
            {teach.recording.tips.map((t, i) => (
              <li
                key={t.id}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-t border-ink-950/10 py-5 last:border-b"
              >
                <span className={`${NUMBER_BADGE} self-start`}>{pad2(i + 1)}</span>
                <p className="text-body text-text-body">
                  <span className="font-semibold text-text-strong">{t.title}.</span> {t.body}
                </p>
              </li>
            ))}
          </Reveal>
          <div className="md:col-span-7">
            <h3 id="teach-resources" className="font-display text-lead font-semibold text-text-strong">
              {teach.resources.title}
            </h3>
            <ul aria-labelledby="teach-resources" className="mt-4 border-t border-ink-950/10">
              {teach.resources.items.map((r) => (
                <li
                  key={r.id}
                  className="grid gap-x-6 gap-y-1 border-b border-ink-950/10 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                >
                  <span className="text-body font-semibold">
                    <LearnLink href={r.href}>{r.title}</LearnLink>
                  </span>
                  <span className="text-small text-text-body sm:pt-[0.15em]">{r.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section width="page" tight rule aria-labelledby="teach-faq">
        <SectionHeader
          index={indexOf("teach-faq")}
          id="teach-faq"
          title={teach.faq_heading}
          action={
            <Button href={teach.contact.href} variant="secondary">
              {teach.contact.label}
            </Button>
          }
        />
        <div className="max-w-[60rem]">
          <FaqList items={teach.faq} email={meta.contact} />
        </div>
      </Section>

      <NearViewport>
        <CommunityJoin index={pad2(rail.length + 1)} />
      </NearViewport>
    </div>
  );
}
