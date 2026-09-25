import { useEffect, useState } from "react";
import {
  loadCommunity,
  loadPartners,
  loadPlatform,
  loadSpinoffs,
  loadVideos,
  type JoinYouTube,
  type Partner,
  type PlatformRow,
  type SiteVideo,
  type Spinoff,
} from "../lib/data";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";
import StatTicker from "../components/ui/StatTicker";
import CommunityJoin from "../components/ui/CommunityJoin";
import PlatformList from "../components/about/PlatformList";
import PeopleGroup from "../components/about/PeopleGroup";
import ContributorStrip from "../components/about/ContributorStrip";
import PartnerWall from "../components/about/PartnerWall";
import SpinoffGrid from "../components/about/SpinoffGrid";
import YouTubeFacade from "../components/ui/YouTubeFacade";
import NearViewport from "../components/about/NearViewport";
import {
  DEVELOPERS,
  FACULTY,
  PAST_CREW,
  loadContributors,
  type Contributor,
  type ContributorsFile,
} from "../components/about/people";

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
  className = "",
}: {
  photo: { src: string; width: number; height: number; alt: string; caption: string };
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
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      />
      <figcaption className="mt-2 font-mono text-small text-text-muted">{photo.caption}</figcaption>
    </figure>
  );
}

/**
 * /about - the long-form page: what RoboRacer is, what it makes, who runs it,
 * which institutions use it, and how to reach them. Paper base with the one
 * ink hero, the same section rhythm and primitives as the landing and /race.
 */
export default function About() {
  const [platform, setPlatform] = useState<PlatformRow[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [youtube, setYoutube] = useState<JoinYouTube | null>(null);
  const [contributors, setContributors] = useState<ContributorsFile | null>(null);
  const [videos, setVideos] = useState<SiteVideo[]>([]);
  const [spinoffs, setSpinoffs] = useState<Spinoff[]>([]);

  useEffect(() => {
    let live = true;
    loadPlatform()
      .then((d) => live && setPlatform(d))
      .catch(() => undefined);
    loadCommunity()
      .then((c) => live && setYoutube(c?.join?.youtube ?? null))
      .catch(() => {});
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
      .catch(() => undefined);
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
          surface with the AA text roles. */}
      <Section variant="ink" width="bleed" className="pt-[5.5rem] md:pt-[6.5625rem]">
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
                RoboRacer, formerly F1TENTH, is an international community of researchers, engineers
                and students around a one-tenth-scale open-source autonomous race car. It started at
                the University of Pennsylvania in 2016 and now runs a competition series at the
                major robotics conferences.
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
                    duration={2.5}
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
                  the Scholar query &#8599;
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
        {youtube && (
          <div className="mx-auto mt-12 max-w-page px-6">
            <YouTubeFacade yt={youtube} />
          </div>
        )}
      </Section>

      {/* 01 What RoboRacer is */}
      <Section width="page" aria-labelledby="about-what" rule>
        <SectionHeader
          index="01"
          id="about-what"
          title="What RoboRacer is"
          subtitle="One open car design, used for teaching, research and racing"
        />
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-10">
          <Reveal className="flex flex-col gap-5 md:col-span-6">
            <p className="max-w-[62ch] text-lead text-text-body">
              RoboRacer started at the University of Pennsylvania in 2016 under the name F1TENTH.
              Rahul Mangharam leads it from Penn&apos;s xLAB. Madhur Behl, now at the University of
              Virginia,{" "}
              <a href={BEHL_SOURCE} target="_blank" rel="noopener noreferrer" className={LINK_ON_PAPER}>
                co-founded the platform and the competition series
              </a>
              .
            </p>
            <p className="max-w-[62ch] text-body text-text-body">
              The car is a one-tenth-scale autonomous race car. Its hardware design, its software
              stack and its simulator are open source, so a lab builds one rather than buys one.
            </p>
            <p className="max-w-[62ch] text-body text-text-body">
              The courses built around it teach the foundations of autonomy and the analytical
              skills to recognize and reason about situations with moral content in the design of
              autonomous systems.
            </p>
            <p className="max-w-[62ch] text-body text-text-body">
              More than 90 universities in over 20 countries use the platform, and more than a
              thousand publications reference it. There have been 30 competitions since 2016. The
              next one is at IROS 2026 in Pittsburgh, September 28 to 30.
            </p>
          </Reveal>
          <div className="md:col-span-6">
            <Figure photo={ICRA_GROUP_PHOTO} />
          </div>
        </div>
      </Section>

      {/* 02 The platform - from public/data/platform.json */}
      <Section width="page" edge aria-labelledby="about-platform" rule>
        <SectionHeader
          index="02"
          id="about-platform"
          title="The platform"
          subtitle="Build, Learn, Race, Research"
          lead="The four parts of RoboRacer. Each has its own page."
        />
        <PlatformList rows={platform} />
      </Section>

      {/* 03 People - four groups: faculty, developers, contributors, past crew */}
      <Section width="page" aria-labelledby="about-people" rule>
        <SectionHeader
          index="03"
          id="about-people"
          title="People"
          subtitle="Who runs RoboRacer"
          lead="Titles come from each person's own university page, or from the organizing committee of the race they run. Click a name to go there. A verify tag means we still need to confirm the role."
        />
        <div className="flex flex-col gap-16">
          <PeopleGroup
            id="about-faculty"
            title="Faculty and advisors"
            lead="Faculty who lead the platform and sit on the competitions' organizing committees."
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
              . The car, the simulator, the ROS stack and the course labs are all built in the open.
            </p>
            <div className="mt-8">
              <p className="font-mono text-small text-text-muted">
                active{activeSince ? ` · committed since ${activeSince}` : ""}
                {activeContributors.length ? ` · ${activeContributors.length}` : ""}
              </p>
              <ContributorStrip
                contributors={activeContributors}
                emptyLabel="contributors.json did not load"
              />
            </div>
            <div className="mt-10">
              <p className="font-mono text-small text-text-muted">
                earlier{pastContributors.length ? ` · ${pastContributors.length}` : ""}
              </p>
              <ContributorStrip contributors={pastContributors} emptyLabel="" />
            </div>
          </div>
          <PeopleGroup
            id="about-past-crew"
            title="Past crew"
            lead="Everyone from earlier team rosters, taken from the old F1TENTH about page. Their roles still need confirming, hence the verify tags."
            people={PAST_CREW}
            compact
          />
        </div>
      </Section>

      {/* 04 Our Partners - the static grouped wall, from partners.json */}
      <Section width="page" edge aria-labelledby="about-partners" rule>
        <SectionHeader
          index="04"
          id="about-partners"
          title="Our Partners"
          subtitle="The institutions that run the platform"
          lead="Universities, companies and organizations that teach and do research with RoboRacer. Alphabetical within each group."
          action={
            partners.length > 0 ? (
              <StatTicker value={partners.length} label="institutions" />
            ) : undefined
          }
        />
        <PartnerWall partners={partners} />
      </Section>

      {/* 05 Spinoffs - from public/data/spinoffs.json. Only `entries` render;
          the `candidates` there wait for Cedric. Every entry is still
          status "verify" (nothing on it is in the content skill yet), so
          each card carries the same verify tag as the people cards. */}
      {spinoffs.length > 0 && (
        <Section width="page" aria-labelledby="about-spinoffs" rule>
          <SectionHeader
            index="05"
            id="about-spinoffs"
            title="Spinoffs"
            subtitle="Teams and companies that grew out of the car"
            lead="A verify tag means we have not yet confirmed the story with the people who built it."
          />
          <SpinoffGrid spinoffs={spinoffs} />
        </Section>
      )}

      {/* 06 Videos - from public/data/videos.json. Click-to-load, never
          self-starting: six players in a grid would otherwise all start as the
          reader scrolls past. */}
      {videos.length > 0 && (
        <Section width="page" aria-labelledby="about-videos" rule>
          <SectionHeader
            index="06"
            id="about-videos"
            title="Videos"
            subtitle="Races, teams and the course"
            lead="A freshman's first year with the car, one-minute interviews with the ICRA 2026 teams, race highlights, the course lectures and the build guide."
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

      {/* 07 Join - the shared community block, same as the landing's. Gated
          on the reader coming near it: its marquee mounts four copies of an
          autoplaying 1.05 MB clip, which is 4.1 MB at first paint otherwise
          (see NearViewport). */}
      <NearViewport>
        <CommunityJoin index="07" showYouTube={false} />
      </NearViewport>
    </>
  );
}
