import { useEffect, useState } from "react";
import {
  loadCommunity,
  loadPartners,
  loadSpinoffs,
  loadVideos,
  type JoinYouTube,
  type Partner,
  type SiteVideo,
  type Spinoff,
} from "../lib/data";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";
import StatTicker from "../components/ui/StatTicker";
import CommunityJoin from "../components/ui/CommunityJoin";
import StartHere from "../components/ui/StartHere";
import PeopleGroup from "../components/about/PeopleGroup";
import ContributorStrip from "../components/about/ContributorStrip";
import PartnerWall from "../components/about/PartnerWall";
import SpinoffGrid from "../components/about/SpinoffGrid";
import PhoneFold from "../components/about/PhoneFold";
import YouTubeFacade, { YouTubeFacadeSkeleton } from "../components/ui/YouTubeFacade";
import NearViewport from "../components/about/NearViewport";
import { countWord } from "../lib/countWord";
import {
  DEVELOPERS,
  FACULTY,
  PAST_CREW,
  loadContributors,
  type Contributor,
  type ContributorsFile,
} from "../components/about/people";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { ABOUT_START_ID } from "../lib/wayfinding";

const GITHUB_URL = "https://github.com/f1tenth";
const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";
const BEHL_SOURCE = "https://engineering.virginia.edu/faculty/madhur-behl";

// One wide group shot rather than two stacked portraits: the pair sat in a
// narrow column beside a short text column and left the section mostly white
// (Cedric, 2026-08-23). Source in docs/ASSET_MANIFEST.md; site-owner media.
const ICRA_GROUP_PHOTO = {
  src: "/about/about-icra-group-1600.webp",
  width: 1600,
  height: 900,
  alt: "Everyone at ICRA 2026 in a group photo inside the orange-barrier track, arms raised",
  caption: "group pic ICRA 2026",
};


const LINK_ON_PAPER =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";
const LINK_ON_INK =
  "text-text-on-ink underline decoration-text-on-ink/30 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/** The hero ledger. Every number is from the roboracer-content skill; the
 * publications line links to the Scholar query it comes from. */
/** The counted rows run as big ticking numbers; "founded" is a sentence, so it
 * stays a plain row underneath rather than pretending to be a metric. */
const LEDGER_STATS: { label: string; value: number; suffix?: string; href?: string }[] = [
  { label: "universities", value: 90, suffix: "+" },
  { label: "countries", value: 20, suffix: "+" },
  { label: "competitions held", value: 30 },
  { label: "publications", value: 1000, suffix: "+", href: SCHOLAR_URL },
];

function Figure({
  photo,
  aspect,
  className = "",
}: {
  photo: { src: string; width: number; height: number; alt: string; caption: string };
  /** Crop to this shape (CSS aspect-ratio) instead of the file's own. */
  aspect?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <img
        src={`${import.meta.env.BASE_URL}${photo.src.replace(/^\//, "")}`}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className="w-full rounded-media border border-ink-950/10 object-cover"
        style={{ aspectRatio: aspect ?? `${photo.width} / ${photo.height}`, objectPosition: "50% 70%" }}
      />
      <figcaption className="mt-2 font-mono text-small text-text-muted">{photo.caption}</figcaption>
    </figure>
  );
}

/**
 * /about - the long-form page: where to start (what RoboRacer is and the ways
 * in), who runs it, which institutions use it, and how to reach them. Paper
 * base with the one ink hero, the same section rhythm and primitives as the
 * landing and /race.
 */
export default function About() {
  // /about#about-start is the nav's "Start here" on this page, and
  // /about#about-spinoffs is linked from docs; the route reset
  // (useRouteScroll) would otherwise leave the reader at the top.
  useScrollToHash();
  const [partners, setPartners] = useState<Partner[]>([]);
  // undefined while community.json loads (the hero holds the facade's box),
  // null when it names no video.
  const [youtube, setYoutube] = useState<JoinYouTube | null | undefined>(undefined);
  const [contributors, setContributors] = useState<ContributorsFile | null>(null);
  const [videos, setVideos] = useState<SiteVideo[]>([]);
  // null while spinoffs.json loads: the section keeps its grid's height.
  const [spinoffs, setSpinoffs] = useState<Spinoff[] | null>(null);

  useEffect(() => {
    let live = true;
    loadCommunity()
      .then((c) => live && setYoutube(c?.join?.youtube ?? null))
      .catch(() => live && setYoutube(null));
    loadPartners()
      .then((d) => live && setPartners(d))
      .catch(() => undefined);
    loadContributors()
      .then((d) => live && setContributors(d))
      .catch(() => undefined);
    loadVideos()
      .then((d) => live && setVideos(d))
      .catch(() => undefined);
    loadSpinoffs()
      .then((d) => live && setSpinoffs(d.entries))
      .catch(() => live && setSpinoffs([]));
    return () => {
      live = false;
    };
  }, []);

  const all: Contributor[] = contributors?.contributors ?? [];
  const activeContributors = all.filter((c) => c.active);
  const pastContributors = all.filter((c) => !c.active);
  const activeSince = contributors
    ? new Date(contributors.active_since).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <>
      {/* Hero (ink): the thesis and the ledger. The old page opened on an
          undefined bg-brand-radial panel whose text sat straight on the page
          background and only became legible on hover; this is a real ink
          surface with the AA text roles. It starts a rem under the bar at
          every size, the bar's height being the nav token (4.5rem, 3.5rem on a
          short landscape window, 5.3125rem from lg), like the /race hero. */}
      <Section
        variant="ink"
        width="bleed"
        className="pt-[calc(var(--spacing-nav)+1rem)] lg:pt-[calc(var(--spacing-nav)+1.25rem)]"
      >
        <div className="mx-auto max-w-page px-6">
          <div className="grid gap-10 md:grid-cols-12 md:gap-x-10">
            <div className="md:col-span-7">
              <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
                <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
                <span>About</span>
              </p>
              <h1 className="font-display text-display-l font-semibold text-text-on-ink">
                Open-source autonomous racing since 2016
              </h1>
              <p className="mt-6 max-w-[60ch] text-lead text-text-on-ink-muted">
                RoboRacer, formerly F1TENTH, is an autonomous race car at one-tenth scale, and the
                community that builds and races it.
              </p>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              {/* Cedric, 2026-08-23: these were a small mono list and read as
                  fine print. They are the scale of the project, so they run as
                  big ticking numbers like the research masthead. */}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-text-on-ink/15 pt-8">
                {LEDGER_STATS.map((row, i) => (
                  <StatTicker
                    key={row.label}
                    as="dl"
                    on="ink"
                    size="l"
                    tone="accent"
                    delay={i * 0.12}
                    value={row.value}
                    suffix={row.suffix}
                    label={row.label}
                  />
                ))}
              </dl>
              <p className="mt-8 border-t border-text-on-ink/15 pt-6 font-mono text-small text-text-on-ink-muted">
                founded 2016, University of Pennsylvania ·{" "}
                <a href={SCHOLAR_URL} target="_blank" rel="noopener noreferrer" className={LINK_ON_INK}>
                  the Google Scholar search&nbsp;&#8599;
                </a>
              </p>
            </div>
          </div>
        </div>
        {/* The race reel used to sit at the very bottom of the page, under
            everything. It belongs here: the fastest way to answer "what is a
            RoboRacer competition" is to show one, and the hero had a column of
            dead space under the text (Cedric, 2026-08-23). CommunityJoin's own
            copy is switched off below so the page never plays it twice. */}
        {youtube !== null && (
          <div className="mx-auto mt-12 max-w-page px-6">
            {/* On a landscape phone the full-width 16:9 frame was taller than
                the window; there the width follows the window's height so the
                whole frame fits under the bar, centred (ABOUT-05). A portrait
                phone never reaches the cap. */}
            <div className="mx-auto compact:max-w-[min(100%,calc((100svh-6rem)*16/9))]">
              {youtube ? <YouTubeFacade yt={youtube} /> : <YouTubeFacadeSkeleton />}
            </div>
          </div>
        )}
      </Section>

      {/* 01 Start here - the landing's section, fuller (ui/StartHere,
          public/data/paths.json): the story and the scale beside the ICRA
          group photo, then the five ways in, each with its clip, one sentence
          for everyone and one more for whoever reads on. Merges the old "What
          RoboRacer is" and "The platform" (Cedric, 2026-09-25). Newbie,
          student, faculty (indirectly), competitor, sponsor. */}
      <StartHere
        density="full"
        index="01"
        id={ABOUT_START_ID}
        headingId="about-start-title"
        subtitle="One open car for teaching, research and racing"
        intro={
          // The copy leads (7 of 12) and the photo, cropped to 2:1 (the
          // hall's roof goes, the group stays), takes 5 with the text
          // centred beside it: two short paragraphs no longer sit at the top
          // of a 6-column, 16:9 photo (QA p3-integration, item 7).
          <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-x-10">
            <Reveal className="flex flex-col gap-5 md:col-span-7">
              <p className="max-w-[62ch] text-lead text-text-body">
                RoboRacer started at the University of Pennsylvania in 2016.
                Rahul Mangharam leads it from Penn&apos;s xLAB. Madhur Behl, now at the University of
                Virginia,{" "}
                <a href={BEHL_SOURCE} target="_blank" rel="noopener noreferrer" className={LINK_ON_PAPER}>
                  co-founded the platform and the competition series
                </a>
                .
              </p>
              <p className="max-w-[62ch] text-body text-text-body">
                More than 90 universities in over 20 countries use the platform, and more than a
                thousand publications reference it. There have been 30 competitions since 2016.
              </p>
            </Reveal>
            <div className="md:col-span-5">
              <Figure photo={ICRA_GROUP_PHOTO} aspect="2 / 1" />
            </div>
          </div>
        }
      />

      {/* 02 People - four groups: faculty, developers, contributors, past crew */}
      <Section width="page" aria-labelledby="about-people" rule>
        <SectionHeader
          index="02"
          id="about-people"
          title="People"
          subtitle="Who runs RoboRacer"
          lead="Each name links to the page its title comes from."
        />
        <div className="flex flex-col gap-16">
          <PeopleGroup
            id="about-faculty"
            title="Faculty and advisors"
            lead="They lead the platform and sit on the organizing committees of the races."
            people={FACULTY}
          />
          <PeopleGroup
            id="about-developers"
            title="Developers"
            lead="The people building the platform and organizing the 2026 season, across Penn, CMU, Clemson, TUM and West Virginia."
            people={DEVELOPERS}
          />
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-950/10 pb-3">
              <h3
                id="about-contributors"
                className="font-display text-lead font-semibold text-text-strong"
              >
                Contributors
              </h3>
              <p className="font-mono text-eyebrow tracking-normal tabular-nums text-text-muted">
                {all.length || ""}
              </p>
            </div>
            <p className="mt-4 max-w-[68ch] text-body text-text-body">
              Everyone with a public commit in the{" "}
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LINK_ON_PAPER}>
                f1tenth GitHub organization
              </a>
              , where the car, the simulator, the ROS stack and the labs are built.
            </p>
            <div className="mt-8">
              <p className="font-mono text-small text-text-muted">
                active{activeSince ? ` · committed since ${activeSince}` : ""}
                {activeContributors.length ? ` · ${activeContributors.length}` : ""}
              </p>
              <ContributorStrip
                contributors={activeContributors}
                emptyLabel="The contributor list didn't load."
              />
            </div>
            {/* On a phone the earlier contributors fold behind their own
                label, like the Past crew (ABOUT-02): 35 chips were about
                1,100 px at 390. */}
            <div className="mt-10 max-sm:hidden">
              <p className="font-mono text-small text-text-muted">
                earlier{pastContributors.length ? ` · ${pastContributors.length}` : ""}
              </p>
              <ContributorStrip contributors={pastContributors} emptyLabel="" />
            </div>
            {pastContributors.length > 0 && (
              <PhoneFold className="mt-4" label={`earlier · ${pastContributors.length}`}>
                <ContributorStrip contributors={pastContributors} emptyLabel="" reveal={false} />
              </PhoneFold>
            )}
          </div>
          <PeopleGroup
            id="about-past-crew"
            title="Past crew"
            lead="Earlier team members, from the old F1TENTH about page."
            people={PAST_CREW}
            compact
            fold={12}
          />
        </div>
      </Section>

      {/* 03 Our Partners - the static grouped wall, from partners.json */}
      <Section width="page" edge aria-labelledby="about-partners" rule>
        <SectionHeader
          index="03"
          id="about-partners"
          title="Our partners"
          subtitle="Institutions that use the car"
          lead="They teach and do research with it. Alphabetical in each group."
          action={
            partners.length > 0 ? (
              <StatTicker value={partners.length} label="institutions" />
            ) : undefined
          }
        />
        <PartnerWall partners={partners} />
      </Section>

      {/* 04 Spinoffs - from public/data/spinoffs.json. Only `entries` render;
          the `candidates` there wait for Cedric. Each entry is a feature
          built from the company's own site at his request (2026-09-25):
          its car, its mark, and a framed window onto its homepage. */}
      {(spinoffs === null || spinoffs.length > 0) && (
        <Section width="page" aria-labelledby="about-spinoffs" rule>
          <SectionHeader
            index="04"
            id="about-spinoffs"
            title="Spinoffs"
            subtitle="Companies that grew out of the car"
            lead={
              <>
                {/* "Two so far": the count follows spinoffs.json as Cedric
                    accepts candidates, and is the one word that waits for it. */}
                <span className={spinoffs ? undefined : "invisible"}>
                  {spinoffs ? countWord(spinoffs.length) : "Two"}
                </span>{" "}
                so far.
              </>
            }
          />
          {spinoffs ? (
            <SpinoffGrid spinoffs={spinoffs} />
          ) : (
            // The grid's measured height for the two features that render
            // today (stacked on compact, one row from desktop; 2026-09-25),
            // so a reader arriving at #about-spinoffs does not watch Videos
            // jump. compact: is emitted after the breakpoints, so it wins.
            <div
              aria-busy="true"
              className="min-h-[52.75rem] rounded-card border border-ink-950/10 lg:min-h-[47rem] xl:min-h-[51.25rem] 2xl:min-h-[53rem] compact:min-h-[95.5rem]"
            />
          )}
        </Section>
      )}

      {/* 05 Videos - from public/data/videos.json. Click-to-load, never
          self-starting: six players in a grid would otherwise all start as the
          reader scrolls past. */}
      {videos.length > 0 && (
        <Section width="page" aria-labelledby="about-videos" rule>
          <SectionHeader
            index="05"
            id="about-videos"
            title="Videos"
            subtitle="Races, teams and the course"
            lead="Start with a freshman's first year with the car."
          />
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <li key={v.id}>
                <YouTubeFacade yt={v} heading={v.heading} autoStart={false} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 06 Join - the shared community block, same as the landing's. Gated
          on the reader coming near it: its marquee mounts four copies of an
          autoplaying 1.05 MB clip, which is 4.1 MB at first paint otherwise
          (see NearViewport). */}
      <NearViewport>
        <CommunityJoin index="06" showYouTube={false} />
      </NearViewport>
    </>
  );
}
