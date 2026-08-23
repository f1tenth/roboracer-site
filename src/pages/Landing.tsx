import { useEffect, useState, useMemo } from "react";
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
import Marquee from "../components/ui/Marquee";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import TeamGrid from "../components/ui/TeamGrid";
import HighlightReel from "../components/ui/HighlightReel";
import PlatformPanel from "../components/ui/PlatformPanel";
import ExplodedModel, { type CarPhoto } from "../components/ui/ExplodedModel";
import HeroChapter, { type HeroVideoSources } from "../components/ui/HeroChapter";
import WorldMapChapter from "../components/ui/WorldMapChapter";
import ResearchCarousel from "../components/ui/ResearchCarousel";
import { featuredForLanding } from "../lib/publications";
import CommunityJoin from "../components/ui/CommunityJoin";
import MediaFrame from "../components/ui/MediaFrame";
import { mediaUrl } from "../lib/media";
const HERO_VIDEO: HeroVideoSources = {
  mp4_1920: "/media/hero/hero-fpv-loop-1280.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  // Landing v5 (Cedric, 2026-08-22): a clip cycle with crossfades. The IV
  // FPV clip opens once (its first 5 s), then three cuts from the Robotics
  // Club race highlights video (2:29-2:40, 1:04-1:17, 1:21-1:27), then the
  // IV clip from 6 s to its end; the cycle restarts at the first race cut.
  // The clip files live on Cloudflare R2 (infra/media-worker); mediaUrl
  // resolves to the local public/ copy while VITE_MEDIA_BASE is unset.
  clips: [
    { mp4_1920: mediaUrl("/media/hero/hero-iv-start-1280.mp4"), mp4_960: mediaUrl("/media/hero/hero-iv-start-960.mp4") },
    { mp4_1920: mediaUrl("/media/hero/hero-race-01-1920.mp4"), mp4_960: mediaUrl("/media/hero/hero-race-01-960.mp4") },
    { mp4_1920: mediaUrl("/media/hero/hero-race-02-1920.mp4"), mp4_960: mediaUrl("/media/hero/hero-race-02-960.mp4") },
    { mp4_1920: mediaUrl("/media/hero/hero-race-03-1920.mp4"), mp4_960: mediaUrl("/media/hero/hero-race-03-960.mp4") },
    { mp4_1920: mediaUrl("/media/hero/hero-iv-rest-1280.mp4"), mp4_960: mediaUrl("/media/hero/hero-iv-rest-960.mp4") },
  ],
  loopFrom: 1,
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1280,
  height: 720,
};

// Landing-v3 copy: no comma, three authored lines.
const HEADLINE_LINES = ["Autonomous racing", "built and raced", "in the open"];
// Cedric, 2026-08-22: one sentence on what RoboRacer is, under the headline
// (the old hero's "Open-source hardware, global competitions, and
// comprehensive learning resources powering the next generation of robotics
// innovators", improved).
const HERO_DESCRIPTION =
  "RoboRacer is the open-source platform for learning robotics on a real one-tenth-scale car: perception, planning and control, a worldwide community that shares its work, and an international competition series at the largest robotics conferences, growing every year.";

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";

// Landing v4 section 3: Ezio Bartocci's ICRA 2026 race-day video (LinkedIn;
// organizer media, Cedric owns asking Ezio; docs/ASSET_MANIFEST.md V4-11) in
// its own 1272x720 frame: the contract's 21/9 band cut the bottom strip of his
// composite off (Cedric, 2026-08-22: "short on the bottom"), so the encode is
// the full native frame, not 1600 wide (no upscaling, CLAUDE.md rule 3). The
// poster carries the frame under reduced motion.
const RACE_HERO = {
  video: "/media/race/race-iros2026-hero-1272.mp4",
  poster: "/media/race/race-iros2026-hero-poster.webp",
  width: 1272,
  height: 720,
  alt: "Ezio Bartocci's video from ICRA 2026 in Vienna: the race track seen from above and from the bridge",
  caption: "the hall · ICRA 2026, Vienna",
  credit: "Video: Ezio Bartocci",
  // Cedric, 2026-08-22: the frame links to RoboRacer's own LinkedIn post, not
  // Ezio's (the footage credit stays his).
  creditLabel: "our post on LinkedIn ↗",
  creditHref: "https://www.linkedin.com/posts/great-work-by-all-involved-ugcPost-7471631589169516544-ZPa-/",
};

// Car close-ups beside the 3D model (media curator, docs/media/SELECTION.md).
const CAR_PHOTOS: readonly CarPhoto[] = [
  { src: "/media/car/car-photo-01-1200.webp", alt: "Two RoboRacer cars on the start line at ICRA 2026, the ForzaETH car in front", caption: "start line · ICRA 2026" },
  // Photo 2 is an AI-generated image supplied by Cedric (landing v5 A9): no credit line.
  // The car sits in the right 45% of the 16/9 frame: the 4/3 crop anchors right.
  { src: "/media/car/car-photo-02-1200.webp", alt: "Portrait view of a RoboRacer car at ICRA 2026", caption: "portrait view · ICRA 2026", position: "100% 50%" },
];

/**
 * Landing composition: hero chapter, highlights, the car, platform panel,
 * community map, partner ribbons, next race, teams, research, join.
 */
const MARQUEE_REF_ITEMS = 20;

export default function Landing() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [platform, setPlatform] = useState<PlatformRow[]>([]);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
    loadHighlights().then(setHighlights).catch(() => setHighlights([]));
    loadPlatform().then(setPlatform).catch(() => setPlatform([]));
  }, []);

  // The 55s / 82s loop was tuned when one row held all 20 partners. Scaling the
  // duration by row length holds px/s constant as the roster grows.
  // Even indices to the top ribbon, odd to the bottom. Alternating rather than
  // splitting the sorted list in half, so each row gets a mix of wide and
  // narrow logos and no institution is ever in both rows at once.
  const partnerRows = useMemo(
    () => [partners.filter((_, i) => i % 2 === 0), partners.filter((_, i) => i % 2 === 1)],
    [partners],
  );

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
  // Landing v5 section 6.7: the carousel reads `featured_order` only
  // (`featured` stays for /research).
  const featured = pubs ? featuredForLanding(pubs.items) : [];

  return (
    <div>
      {/* 1 · Hero + headline chapter (ink, pinned 320vh) - newbie. The video
          runs under the transparent nav: no page top padding on this route. */}
      <HeroChapter video={HERO_VIDEO} lines={HEADLINE_LINES} description={HERO_DESCRIPTION} />

      {/* 2 · 01 Highlights (paper, full-bleed) - newbie, press */}
      <Section edge rule width="bleed" aria-labelledby="highlights" className="pt-section-tight!">
        <div className="mx-auto max-w-page px-6">
          <SectionHeader
            index="01"
            id="highlights"
            title="Highlights"
            lead="30+ competitions since 2016. Podiums, overtakes, packed exhibition halls."
          />
        </div>
        <HighlightReel items={highlights} />
      </Section>

      {/* 3 · 02 The car (ink chapter) - builder, newbie. Carries its own
          header; revamp/v3-car brings the bigger canvas, product render,
          LiDAR fix and photo slots. */}
      <div className="bg-ink-950">
        <ExplodedModel photos={CAR_PHOTOS} />
      </div>

      {/* 4 · 03 Platform (paper): pinned 300vh chapter, scroll walks the four
          rows with the media crossfading beside them - learner, faculty */}
      <Section rule width="bleed" aria-labelledby="pillars">
        <PlatformPanel
          rows={platform}
          header={
            <SectionHeader
              index="03"
              id="pillars"
              title="Platform"
              subtitle="Build. Learn. Race. Research."
              lead="A car anyone can build, courses that teach autonomy, races that test it, and research that grows on top."
            />
          }
        />
      </Section>

      {/* 5 · 04 Community map (ink, pinned 260vh) - sponsor, press. Owns its
          header, the four counters (progress-bound) and its data. */}
      <WorldMapChapter />

      {/* 6 · 05 Our Partners (paper) - sponsor, faculty. Keeps the map's own
          1,800 px bleed and pt-0, so the ribbon still sits right under the
          chapter's counters (Cedric, 2026-08-22: it read as detached from the
          geography). The header goes inside that tight rhythm, not in a fresh
          block of whitespace above it. */}
      <Section tight width="bleed" aria-labelledby="partners" className="pt-0! pb-10">
        <div className="mx-auto max-w-page border-b border-ink-950/10 px-6 pb-6">
          <SectionHeader
            index="05"
            id="partners"
            title="Our Partners"
            className="mb-0"
            action={
              <p className="font-mono text-eyebrow tracking-normal text-text-muted">
                {partners.length} institutions · alphabetical
              </p>
            }
          />
        </div>
        {/* Two ribbons travelling opposite ways. Even indices go up top, odd
            below, rather than first-half/second-half: alternating keeps a mix
            of wide and narrow logos in each row, and no institution appears in
            both at once. Under reduced motion each row wraps into its own
            static grid, so all 20 still render exactly once. */}
        <div className="mt-8 flex flex-col gap-2 md:gap-6">
          {partnerRows.map((row, rowIndex) => (
            <Marquee
              key={rowIndex}
              label={rowIndex === 0 ? "Partner institutions, first row" : "Partner institutions, second row"}
              duration={Math.round(55 * (row.length / MARQUEE_REF_ITEMS))}
              durationMd={Math.round(82 * (row.length / MARQUEE_REF_ITEMS))}
              direction={rowIndex === 0 ? "normal" : "reverse"}
              gap="gap-16 pr-16 md:gap-24 md:pr-24"
            >
              {({ clone }) =>
                row.map((p) => (
                  <a
                    key={p.name}
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={clone ? -1 : undefined}
                    className="group flex h-[60px] w-auto shrink-0 flex-col items-center justify-start md:h-[104px]"
                  >
                    <span className="relative flex h-[34px] items-center md:h-[72px]">
                      <img
                        src={p.image_rest ?? p.image}
                        alt={p.name}
                        height={72}
                        width="auto"
                        /* Marquee children are never lazy (CommunityJoin note). */
                        loading="eager"
                        fetchPriority="low"
                        decoding="async"
                        className="max-h-[34px] w-auto max-w-28 object-contain md:max-h-[72px] md:max-w-[202px]"
                      />
                      {p.image_hover && (
                        <img
                          src={p.image_hover}
                          alt=""
                          aria-hidden="true"
                          height={80}
                          width="auto"
                          loading="eager"
                          fetchPriority="low"
                          decoding="async"
                          className="absolute inset-0 m-auto max-h-[34px] w-auto max-w-28 object-contain opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100 md:max-h-[72px] md:max-w-[202px]"
                        />
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 whitespace-nowrap border border-ink-950/15 bg-paper-50 px-2 py-0.5 font-mono text-eyebrow tracking-normal text-text-strong opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {p.name} ↗
                    </span>
                  </a>
                ))
              }
            </Marquee>
          ))}
        </div>
      </Section>

      {/* 7 · 06 Next race (paper, 1800 wide) - competitor. After the map
          (Cedric, landing v5 round two: "say when the next race is once we've
          described it"): the section title, then Ezio's race-day video on
          the left and the registration panel on the right (headline "IROS
          2026, Pittsburgh", the dates under it, the ledger and the CTAs). */}
      {race && (
        <Section width="bleed" aria-labelledby="next-race">
          <div className="mx-auto max-w-page px-6">
            <SectionHeader index="06" id="next-race" title="Next race" subtitle="Come to our next race" />
            <div className="grid gap-8 md:grid-cols-12 md:items-stretch md:gap-10">
              <figure className="md:col-span-7">
                <div
                  className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-100"
                  style={{ aspectRatio: `${RACE_HERO.width} / ${RACE_HERO.height}` }}
                >
                  <MediaFrame
                    src={RACE_HERO.poster}
                    video={RACE_HERO.video}
                    alt={RACE_HERO.alt}
                    width={RACE_HERO.width}
                    height={RACE_HERO.height}
                    radius="none"
                    className="h-full"
                  />
                </div>
                <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
                  <span className="text-text-strong">{RACE_HERO.caption}</span>
                  <a
                    href={RACE_HERO.creditHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2"
                  >
                    {RACE_HERO.creditLabel}
                  </a>
                </figcaption>
              </figure>
              <div className="md:col-span-5">
                <NextRaceSpotlight
                  title={race.title}
                  headline={`${race.short_name ?? race.title}, ${race.location.split(",")[0].trim()}`}
                  datesHeadline={race.dates}
                  datesSecondary={race.dates_secondary}
                  registerHref={race.register_url ?? race.url}
                  registerNote={race.registration_deadline}
                  rulesHref={race.rules_url}
                  startsAt={race.starts_at ?? ""}
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* SponsorCTA removed from landing 2026-08-21 (Cedric): zero-sponsor state lives on /about and /race for now */}

      {/* 8 · 07 Teams (paper) - competitor */}
      <Section edge rule width="page" aria-labelledby="teams">
        <SectionHeader
          index="07"
          id="teams"
          title="Teams"
          subtitle="Who competes"
          lead="Physical AI, raced: RL policies, MPPI and MPC controllers, multi-agent overtaking strategies, all on the same car. Seeded from the results pages of recent competitions; entries are tagged until verified."
        />
        <TeamGrid teams={teams} />
      </Section>

      {/* 9 · 08 Research (paper): eight featured papers in a rotating
          carousel, one figure and its abstract at a time (landing v5 section
          5; ui/ResearchCarousel) - learner, faculty. Never hidden: with no
          featured_order items it renders the header and an empty stage. */}
      <Section rule width="bleed" aria-labelledby="research">
        <div className="mx-auto max-w-page px-6">
          <SectionHeader
            index="08"
            id="research"
            title="Research"
            subtitle="1,000+ publications build on this platform"
            lead="This is physical AI at one-tenth scale: the teams you see racing run reinforcement learning policies, MPPI and model predictive controllers on real cars, and multi-agent strategy decides the overtakes. A Google Scholar search for the platform returns more than a thousand results; eight of the papers we feature:"
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
        </div>
        {/* Full viewport width: the coverflow centres the current paper and
            lets the neighbours peek at the edges (Cedric, v5 round two). */}
        <ResearchCarousel items={featured} tagLabels={pubs ? tagLabelMap(pubs.tags) : {}} />
      </Section>

      {/* 10 · 09 Join (paper) - everyone: live Slack numbers, the Korea photo,
          four channels, two community cards (landing v4 section 8). */}
      <CommunityJoin />
    </div>
  );
}
