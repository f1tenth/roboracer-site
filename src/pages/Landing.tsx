import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import HeroCinematic, { type HeroBeats } from "../components/ui/HeroCinematic";
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

// Hero cinematic v1 (docs/plans/hero-cinematic-v1.md, overnight trial
// 2026-08-30): the same headline over a scroll-scrubbed film of two cars on
// the ICRA 2026 track, generated with Higgsfield from the organizers' photos
// (docs/hero-lab/REPORT.md). The frame sets come from
// public/media/hero-cine/manifest.json (scripts/frames.sh) and are referenced
// through mediaUrl so the R2 move is a config change; the two posters are
// committed. `/?hero=classic` renders HeroChapter as before.
const HERO_CINE = {
  frames: {
    // 720p take: the desktop set is the source's 1280 width (never upscaled).
    desktop: { base: mediaUrl("/media/hero-cine/d/"), count: 121, width: 1280, height: 720 },
    mobile: { base: mediaUrl("/media/hero-cine/m/"), count: 80, width: 960, height: 540 },
  },
  poster: {
    desktop: "/media/hero-cine/poster-1280.webp",
    mobile: "/media/hero-cine/poster-960.webp",
    alt: "Two RoboRacer one-tenth-scale cars side by side on the ICRA 2026 track in Vienna, rendered from the organizers' photographs",
  },
  // Beats in pin progress, read off docs/hero-lab/takes/take-C-sheet.jpg:
  // A at frame 45 (the lead car fills its third), B at frame 80 (half a
  // length ahead, the overtake), C at frame 104 (both cars settled).
  beats: [0.33, 0.55, 0.7] as HeroBeats,
  // Cover-fit anchor for portrait phones: a 9:16 crop keeps about a quarter
  // of the frame's width, so it follows the lead car (its tower sits at a
  // third of the width) rather than the gap between the cars.
  focusX: 0.35,
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
 * Landing v3 composition (docs/plans/landing-v3.md): hero chapter, highlights,
 * next race, the car, platform panel, community map, data line + partner
 * ribbon, teams, research, join.
 */
export default function Landing() {
  useLenis();
  // `/?hero=classic` keeps the clip-cycle hero reachable next to the film.
  const heroVariant = new URLSearchParams(useLocation().search).get("hero");
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
      {/* 1 · Hero + headline chapter (ink, pinned) - newbie. The footage
          runs under the transparent nav: no page top padding on this route.
          The film (400vh) by default; the clip cycle (320vh) at ?hero=classic. */}
      {heroVariant === "classic" ? (
        <HeroChapter video={HERO_VIDEO} lines={HEADLINE_LINES} description={HERO_DESCRIPTION} />
      ) : (
        <HeroCinematic
          frames={HERO_CINE.frames}
          poster={HERO_CINE.poster}
          lines={HEADLINE_LINES}
          description={HERO_DESCRIPTION}
          beats={HERO_CINE.beats}
          focusX={HERO_CINE.focusX}
        />
      )}

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

      {/* 7 · Data line + partner ribbon (paper) - sponsor, faculty. No title:
          the numbers above are the voice; the line ties them to the logos.
          No top padding and the map's own 1,800 px bleed, so the line sits
          right under the chapter's counters (Cedric, 2026-08-22: the ribbon
          read as detached from the geography). */}
      <Section tight width="bleed" aria-labelledby="partners" className="pt-0! pb-10">
        <div className="mx-auto max-w-page px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-950/10 pb-4">
            <h2 id="partners" className="font-mono text-small font-normal tracking-normal text-text-muted">
              across the partner institutions below
            </h2>
            <p className="font-mono text-eyebrow tracking-normal text-text-muted">{partners.length} institutions · alphabetical</p>
          </div>
        </div>
        <div className="mt-8">
          {/* 1.5x from md (Cedric, landing v5 section 6.5): 120 px logos, wider
              gaps, 82 s loop (same px/s as 55 s at 1x). Each link stacks the
              tinted rest file (scripts/partner-tint.py, section 7) and the
              colour file, crossfaded on hover and focus; `image` is the
              fallback where the tint script has not run. Under md: as v4. */}
          <Marquee label="Partner institutions" duration={55} durationMd={82} gap="gap-16 pr-16 md:gap-24 md:pr-24">
            {({ clone }) =>
              partners.map((p) => (
              <a
                key={p.name}
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={clone ? -1 : undefined}
                className="group flex h-[84px] w-auto shrink-0 flex-col items-center justify-start md:h-[168px]"
              >
                <span className="relative flex h-14 items-center md:h-[120px]">
                  <img
                    src={p.image_rest ?? p.image}
                    alt={p.name}
                    height={80}
                    width="auto"
                    /* Marquee children are never lazy (CommunityJoin note). */
                    loading="eager"
                    fetchPriority="low"
                    decoding="async"
                    className="max-h-14 w-auto max-w-44 object-contain md:max-h-[120px] md:max-w-[336px]"
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
                      className="absolute inset-0 m-auto max-h-14 w-auto max-w-44 object-contain opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100 md:max-h-[120px] md:max-w-[336px]"
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
        </div>
      </Section>

      {/* 6 · 05 Next race (paper, 1800 wide) - competitor. After the map
          (Cedric, landing v5 round two: "say when the next race is once we've
          described it"): the section title, then Ezio's race-day video on
          the left and the registration panel on the right (headline "IROS
          2026, Pittsburgh", the dates under it, the ledger and the CTAs). */}
      {race && (
        <Section width="bleed" aria-labelledby="next-race">
          <div className="mx-auto max-w-page px-6">
            <SectionHeader index="05" id="next-race" title="Next race" subtitle="Come to our next race" />
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

      {/* 8 · 06 Teams (paper) - competitor */}
      <Section edge rule width="page" aria-labelledby="teams">
        <SectionHeader
          index="06"
          id="teams"
          title="Teams"
          subtitle="Who competes"
          lead="Physical AI, raced: RL policies, MPPI and MPC controllers, multi-agent overtaking strategies, all on the same car. Seeded from the results pages of recent competitions; entries are tagged until verified."
        />
        <TeamGrid teams={teams} />
      </Section>

      {/* 9 · 07 Research (paper): eight featured papers in a rotating
          carousel, one figure and its abstract at a time (landing v5 section
          5; ui/ResearchCarousel) - learner, faculty. Never hidden: with no
          featured_order items it renders the header and an empty stage. */}
      <Section rule width="bleed" aria-labelledby="research">
        <div className="mx-auto max-w-page px-6">
          <SectionHeader
            index="07"
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

      {/* 10 · 08 Join (paper) - everyone: live Slack numbers, the Korea photo,
          four channels, two community cards (landing v4 section 8). */}
      <CommunityJoin />
    </div>
  );
}
