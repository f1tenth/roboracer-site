import { useScrollToHash } from "../hooks/useScrollToHash";
import { useCourses } from "../hooks/useCourses";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import CommunityJoin from "../components/ui/CommunityJoin";
import NearViewport from "../components/about/NearViewport";
import LearnHeader from "../components/learn/LearnHeader";
import Ledger from "../components/learn/Ledger";
import LearnLink, { WithEmail } from "../components/learn/LearnLink";
import FeatureList from "../components/learn/FeatureList";
import FaqList from "../components/learn/FaqList";
import LectureSelection from "../components/learn/LectureSelection";
import CoursesUnavailable from "../components/learn/CoursesUnavailable";
import { BLOCK_TITLE, MONO_NOTE, isTodo, pad2, visibleFeatures } from "../components/learn/learnStyles";

/**
 * /learn/teach: the instructors page from Dhyey Shah's LMS mock, rebuilt on
 * the paper base. How it works (six steps on one ruled line), what comes with
 * the course (the catalog's feature list), the five-step guide, which modules
 * each plan takes, recording tips and the docs, the instructor questions,
 * then the shared Join block. The mock's planner, admin section and sign-in
 * are gone (COURSES_CONTENT.md); the hero's feature pills respect each
 * feature's status like the list does.
 */
export default function Teach() {
  useScrollToHash();
  const courses = useCourses();
  if (!courses) return <CoursesUnavailable failed={courses === null} />;

  const { teach, meta } = courses;
  const visible = visibleFeatures(courses.features, meta.lms_url);
  const pills = teach.hero.pills
    .map((id) => visible.find((f) => f.id === id))
    .filter((f) => f !== undefined);
  const hasFeatures = visible.some((f) => f.pages.includes("teach"));
  let n = 0;
  const next = () => pad2(++n);

  return (
    <div className="pt-nav">
      <LearnHeader
        id="teach-title"
        crumbs={[{ label: "Learn", href: "/learn" }, { label: teach.hero.eyebrow, current: true }]}
        title={teach.hero.title}
        lead={teach.hero.lead}
        meta={
          pills.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-small text-text-body">
              {pills.map((f, i) => (
                <li key={f.id} className="whitespace-nowrap">
                  {i > 0 && (
                    <span aria-hidden="true" className="mr-3 text-text-muted">
                      ·
                    </span>
                  )}
                  {f.short}
                </li>
              ))}
            </ul>
          )
        }
        actions={
          <>
            <Button href={teach.hero.primary.href}>{teach.hero.primary.label}</Button>
            <Button href={teach.hero.plans_link.href} variant="ghost" className="px-0!">
              {teach.hero.plans_link.label}
            </Button>
          </>
        }
        // What an instructor starts from, the catalog's course figures.
        aside={<Ledger label="The course" stats={courses.stats.filter((s) => s.group === "course")} />}
      />

      {/* 01 How it works: six steps on one ruled line, each with its mono
          number on the rule; on a phone the rule turns vertical. Under them
          the two places the work happens. */}
      <Section width="page" rule aria-labelledby="teach-how">
        <SectionHeader
          index={next()}
          eyebrow={teach.how_it_works.kicker}
          id="teach-how"
          title={teach.how_it_works.title}
          lead={teach.how_it_works.lead}
        />
        <Reveal as="ol" stagger className="grid gap-y-8 md:grid-cols-3 md:gap-y-12 lg:grid-cols-6">
          {teach.how_it_works.steps.map((s) => (
            <li
              key={s.n}
              className="relative border-l border-ink-950/20 pl-6 md:border-t md:border-l-0 md:pt-6 md:pr-6 md:pl-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[0.1875rem] h-1.5 w-1.5 bg-ink-950 md:top-[-0.1875rem] md:left-0"
              />
              <p className="font-mono text-small tabular-nums text-text-muted">{pad2(s.n)}</p>
              <h3 className="mt-2 font-display text-lead font-semibold text-text-strong">{s.title}</h3>
              <p className="mt-2 max-w-[36ch] text-small text-text-body">{s.body}</p>
            </li>
          ))}
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-x-10 desktop:mt-20">
          {teach.how_it_works.portals.map((p) => (
            <div key={p.id} className="border-t border-ink-950/10 pt-5">
              <p className={MONO_NOTE}>{p.tag}</p>
              <h3 className={`mt-2 ${BLOCK_TITLE}`}>{p.title}</h3>
              <p className="mt-3 max-w-[56ch] text-body text-text-body">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {hasFeatures && (
        <Section width="page" edge rule aria-labelledby="teach-features">
          <SectionHeader
            index={next()}
            eyebrow={teach.features.kicker}
            id="teach-features"
            title={teach.features.title}
            lead={teach.features.lead}
          />
          <FeatureList features={courses.features} page="teach" lmsUrl={meta.lms_url} />
        </Section>
      )}

      {/* 03 The guide: every step open, one ruled block each (what it is,
          the checklist, the tip and the Open edX docs), no tabs. */}
      <Section width="page" rule aria-labelledby="teach-steps">
        <SectionHeader
          index={next()}
          eyebrow={teach.steps.kicker}
          id="teach-steps"
          title={teach.steps.title}
          lead={teach.steps.lead}
        />
        <ol className="border-t border-ink-950/10">
          {teach.steps.items.map((it) => (
            <li
              key={it.n}
              className="grid gap-6 border-b border-ink-950/10 py-8 md:grid-cols-12 md:gap-x-10 desktop:py-10"
            >
              <div className="md:col-span-4">
                <p className="font-mono text-small tabular-nums text-text-muted">{pad2(it.n)}</p>
                <h3 className={`mt-2 ${BLOCK_TITLE}`}>{it.title}</h3>
                <p className="mt-2 max-w-[40ch] text-body text-text-body">{it.lead}</p>
              </div>
              <ul className="flex flex-col gap-2.5 md:col-span-5">
                {it.checklist.map((c) => (
                  <li key={c} className="flex gap-3 text-body text-text-strong">
                    <span aria-hidden="true" className="mt-[0.8em] h-px w-3 shrink-0 bg-ink-950" />
                    <span>
                      <WithEmail text={c} email={meta.contact} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4 md:col-span-3">
                {!isTodo(it.tip) && (
                  <p className="text-small text-text-body">
                    <span className={`block ${MONO_NOTE}`}>Tip</span>
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

      <Section width="page" edge rule aria-labelledby="teach-lectures">
        <SectionHeader
          index={next()}
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
        <LectureSelection courses={courses} />
      </Section>

      <Section width="page" rule aria-labelledby="teach-recording">
        <SectionHeader
          index={next()}
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
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-ink-950/10 py-5 last:border-b"
              >
                <span className="pt-[0.2em] font-mono text-small tabular-nums text-text-muted">{pad2(i + 1)}</span>
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

      <Section width="page" rule aria-labelledby="teach-faq">
        <SectionHeader
          index={next()}
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
        <CommunityJoin index={next()} />
      </NearViewport>
    </div>
  );
}
