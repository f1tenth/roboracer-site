import { useEffect, useState } from "react";
import {
  loadHighlights,
  loadPartners,
  loadPlatform,
  loadPublications,
  loadTeams,
  loadUpcomingEvents,
  tagLabelMap,
  type Highlight,
  type Partner,
  type PlatformRow,
  type PublicationsFile,
  type Team,
  type UpcomingEvent,
} from "../lib/data";
import { ScrollTrigger, useLenis } from "../lib/motion";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import Marquee from "../components/ui/Marquee";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";
import HighlightReel from "../components/ui/HighlightReel";
import PlatformPanel from "../components/ui/PlatformPanel";
import ExplodedModel from "../components/ui/ExplodedModel";
import WorldMapChapter from "../components/ui/WorldMapChapter";
import CommunityJoin from "../components/ui/CommunityJoin";
// TODO(wire): replaced by HeroChapter (revamp/v3-hero-nav) at integration.
import VideoHero from "../components/ui/VideoHero";
import HeadlineReveal from "../components/ui/HeadlineReveal";

const HERO_VIDEO = {
  mp4_1920: "/media/hero/hero-fpv-loop-1280.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1280,
  height: 720,
};

// Landing-v3 copy: no comma, three authored lines.
const HEADLINE_LINES = ["Autonomous racing", "built and raced", "in the open"];

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";

// Reserved by the media curator (landing-v3 section 3): the best wide hall
// shot of a past competition. Hidden until the file lands (onError).
const RACE_HERO = {
  src: "/media/race/race-iros2026-hero-1920.webp",
  caption: "the hall · ICRA 2026, Vienna",
  credit: "Photo: Felix Jahncke",
};

/**
 * Landing v3 composition (docs/plans/landing-v3.md): hero chapter, highlights,
 * next race, the car, platform panel, community map, data line + partner
 * ribbon, teams, research, join. Sections marked TODO(wire) are stubs until
 * the parallel branches (A hero-nav, B car, C map-community, E papers) merge.
 */
export default function Landing() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [platform, setPlatform] = useState<PlatformRow[]>([]);
  const [raceHeroOk, setRaceHeroOk] = useState(true);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
    loadHighlights().then(setHighlights).catch(() => setHighlights([]));
    loadPlatform().then(setPlatform).catch(() => setPlatform([]));
  }, []);

  // Data-driven sections mount after their fetches resolve and shift
  // everything below them; recompute the cached ScrollTrigger starts.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [events, partners, teams, pubs, highlights, platform]);

  // Webfonts finish after GSAP's own load-time refresh and change layout
  // heights, leaving stale trigger starts.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) ScrollTrigger.refresh();
    });
    return () => {
      live = false;
    };
  }, []);

  const race = events.find((e) => e.spotlight);
  const featured = pubs?.items.filter((p) => p.featured && p.status === "published").slice(0, 3) ?? [];

  return (
    <div>
      {/* 1 · Hero + headline chapter (ink) - newbie. TODO(wire): HeroChapter
          from revamp/v3-hero-nav replaces these two; the page no longer
          carries the nav offset (the video runs under the transparent nav). */}
      <div className="pt-[68px] md:pt-[85px]">
        <VideoHero video={HERO_VIDEO} />
      </div>
      <HeadlineReveal lines={HEADLINE_LINES} />

      {/* 2 · 01 Highlights (paper, full-bleed) - newbie, press */}
      <Section edge rule width="bleed" aria-labelledby="highlights">
        <div className="mx-auto max-w-content px-6">
          <h2 id="highlights" className="sr-only">
            Highlights
          </h2>
          <p aria-hidden="true" className="mb-3 flex items-center gap-2 font-mono text-small text-text-muted">
            <span className="h-1 w-1 bg-ink-950" />
            <span>01</span>
            <span>/</span>
            <span>Highlights</span>
          </p>
          <p className="mb-10 font-mono text-small text-text-muted">
            30 competitions since 2016. Podiums, overtakes, packed exhibition halls.
          </p>
        </div>
        <HighlightReel items={highlights} />
      </Section>

      {/* 3 · 02 Next race (paper) - competitor: one big hall photo, then the ledger */}
      {race && (
        <Section aria-labelledby="next-race" guides>
          <SectionHeader index="02" eyebrow="Next race" id="next-race" title="IROS 2026" size="s" />
          {raceHeroOk && (
            <figure className="mb-10">
              <div className="aspect-[21/9] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
                <img
                  src={RACE_HERO.src}
                  alt="Exhibition hall during a RoboRacer competition, teams and track in view"
                  width={1920}
                  height={823}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={() => setRaceHeroOk(false)}
                />
              </div>
              <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
                <span className="text-text-strong">{RACE_HERO.caption}</span>
                <span className="text-text-muted">{RACE_HERO.credit}</span>
              </figcaption>
            </figure>
          )}
          <NextRaceSpotlight
            title={race.title}
            datesHeadline={race.dates_headline ?? `${race.dates}, ${race.location}`}
            datesSecondary={race.dates_secondary}
            registerHref={race.register_url ?? race.url}
            registerNote={race.registration_deadline}
            rulesHref={race.rules_url}
            startsAt={race.starts_at ?? ""}
          />
        </Section>
      )}

      {/* 4 · 03 The car (ink chapter) - builder, newbie. Carries its own
          header; revamp/v3-car brings the bigger canvas, product render,
          LiDAR fix and photo slots. */}
      <div className="bg-ink-950">
        <ExplodedModel />
      </div>

      {/* 5 · 04 Platform (paper): sticky media panel beside the four rows -
          learner, faculty */}
      <Section rule aria-labelledby="pillars">
        <SectionHeader
          index="04"
          eyebrow="Platform"
          id="pillars"
          title="Build. Learn. Race. Research."
          lead="A car anyone can build, courses that teach autonomy, races that test it, and research that grows on top."
          size="s"
        />
        <PlatformPanel rows={platform} />
      </Section>

      {/* 6 · 05 Community map (ink, pinned 260vh) - sponsor, press. Owns its
          header, the four counters (progress-bound) and its data. */}
      <WorldMapChapter />

      {/* 7 · Data line + partner ribbon (paper) - sponsor, faculty. No title:
          the numbers above are the voice; the line ties them to the logos. */}
      <Section tight width="bleed" aria-labelledby="partners" className="pb-10">
        <div className="mx-auto max-w-content px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-950/10 pb-4">
            <h2 id="partners" className="font-mono text-small font-normal tracking-normal text-text-muted">
              across the partner institutions below
            </h2>
            <p className="font-mono text-eyebrow tracking-normal text-text-muted">{partners.length} institutions · alphabetical</p>
          </div>
        </div>
        <div className="mt-8">
          <Marquee label="Partner institutions" duration={55} gap="gap-16 pr-16">
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-[84px] w-auto shrink-0 flex-col items-center justify-start md:h-28"
              >
                <span className="flex h-14 items-center md:h-20">
                  <img
                    src={p.image}
                    alt={p.name}
                    height={80}
                    width="auto"
                    loading="lazy"
                    decoding="async"
                    className="max-h-14 w-auto max-w-44 object-contain grayscale transition-[filter] duration-[var(--duration-fast)] group-hover:grayscale-0 group-focus-visible:grayscale-0 md:max-h-20 md:max-w-56"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 whitespace-nowrap border border-ink-950/15 bg-paper-50 px-2 py-0.5 font-mono text-eyebrow tracking-normal text-text-strong opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {p.name} ↗
                </span>
              </a>
            ))}
          </Marquee>
        </div>
      </Section>

      {/* SponsorCTA removed from landing 2026-08-21 (Cedric): zero-sponsor state lives on /about and /race for now */}

      {/* 8 · 06 Teams (paper) - competitor */}
      <Section edge rule aria-labelledby="teams">
        <SectionHeader
          index="06"
          eyebrow="Teams"
          id="teams"
          title="Who competes"
          lead="Seeded from the results pages of recent competitions; entries are tagged until verified."
          size="s"
        />
        <TeamGrid teams={teams} />
      </Section>

      {/* 9 · 07 Research (paper): three featured papers with thumbnails -
          learner, faculty. PublicationCard's media slot lands with
          revamp/v3-papers. */}
      <Section rule aria-labelledby="research">
        <SectionHeader
          index="07"
          eyebrow="Research"
          id="research"
          title="1,000+ publications build on this platform"
          lead="A Google Scholar search for the platform returns more than a thousand results. A few of the papers we feature:"
          action={
            <div className="flex flex-wrap items-center gap-4">
              <Button href={SCHOLAR_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
                See the Scholar query
              </Button>
              <Button href="/research" variant="ghost" className="px-0!">
                All curated publications
              </Button>
            </div>
          }
        />
        <Reveal stagger className="grid gap-6 md:grid-cols-3">
          {featured.map((p) => (
            <PublicationCard key={p.id} publication={p} tagLabels={pubs ? tagLabelMap(pubs.tags) : {}} />
          ))}
        </Reveal>
      </Section>

      {/* 10 · 08 Join (paper) - everyone: live Slack numbers, crowd photo,
          the three ways in. */}
      <CommunityJoin />
    </div>
  );
}
