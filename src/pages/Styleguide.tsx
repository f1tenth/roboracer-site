import { useEffect, useMemo, useState } from "react";
import {
  loadPartners,
  loadPublications,
  loadTeams,
  loadUpcomingEvents,
  tagLabelMap,
  type Partner,
  type PublicationsFile,
  type Team,
  type UpcomingEvent,
} from "../lib/data";
import { useLenis } from "../lib/motion";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import Marquee from "../components/ui/Marquee";
import StatCounter from "../components/ui/StatCounter";
import MediaFrame from "../components/ui/MediaFrame";
import EventCard from "../components/ui/EventCard";
import LogoCloud from "../components/ui/LogoCloud";
import TagFilter from "../components/ui/TagFilter";
import PinnedChapter from "../components/ui/PinnedChapter";
import VideoHero from "../components/ui/VideoHero";
import HighlightReel from "../components/ui/HighlightReel";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";
import SponsorCTA from "../components/ui/SponsorCTA";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import ExplodedModel from "../components/ui/ExplodedModel";

const HERO_VIDEO = {
  mp4_1920: "/media/hero/hero-fpv-loop-1920.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1920,
  height: 1080,
};

/** Small mono chip naming each primitive for review with Ayagoz. */
function Spec({ name, on = "paper" }: { name: string; on?: "ink" | "paper" }) {
  return (
    <p
      className={`mb-6 w-fit rounded-pill border px-3 py-1 font-mono text-eyebrow ${
        on === "ink" ? "border-ink-700 text-rr-cyan" : "border-paper-200 text-text-muted"
      }`}
    >
      {name}
    </p>
  );
}

/**
 * /styleguide: every design-system primitive with real data, in both ink and
 * paper variants, reviewed on localhost by Cedric and Ayagoz before any page
 * is built with them (docs/PLAN.md Phase 2 gate).
 */
export default function Styleguide() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
  }, []);

  const iros = events.find((e) => e.title.includes("IROS 2026"));
  const upcoming = events.filter((e) => !e.title.includes("IV 2026")).slice(0, 2);

  const tagOptions = useMemo(
    () => (pubs ? pubs.tags.map(({ id, label }) => ({ id, label })) : []),
    [pubs],
  );
  const tagLabels = useMemo(() => (pubs ? tagLabelMap(pubs.tags) : {}), [pubs]);
  const shownPubs = useMemo(() => {
    if (!pubs) return [];
    const pool = pubs.items.filter((p) => p.status === "published");
    const featured = pool.filter((p) => p.featured);
    const base = featured.length > 0 ? featured : pool.filter((p) => p.year >= 2023);
    return base.filter((p) => (tag ? p.tags.includes(tag) : true)).slice(0, 6);
  }, [pubs, tag]);

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* ---- VideoHero (ink, bleed) ---- */}
      <VideoHero
        headline={
          <>
            Autonomous racing at <span className="text-gradient-brand">1/10 scale</span>
          </>
        }
        lead="RoboRacer, formerly F1TENTH, is an international community of researchers, engineers, and students racing open-source autonomous cars."
        actions={
          <>
            <Button href="https://iros2026-race.roboracer.ai/registration.html" on="ink" target="_blank" rel="noreferrer">
              Register for IROS 2026
            </Button>
            <Button href="/about" on="ink" variant="secondary">
              What is RoboRacer
            </Button>
          </>
        }
        video={HERO_VIDEO}
        credit="Footage: RoboRacer at IV 2026, Detroit"
      />

      {/* ---- NextRaceSpotlight (ink) ---- */}
      <Section variant="ink" edge>
        <Spec name="NextRaceSpotlight - ink" on="ink" />
        <NextRaceSpotlight
          title={iros?.title ?? "31st RoboRacer Autonomous Racing Competition at IROS 2026"}
          datesHeadline="September 28 to 30, 2026, Pittsburgh"
          datesSecondary="Check-in and practice September 27"
          registerHref="https://iros2026-race.roboracer.ai/registration.html"
          registerNote="Registration closes September 5, 2026"
          rulesHref="https://iros2026-race.roboracer.ai/"
          startsAt="2026-09-28T09:30:00-04:00"
        />
      </Section>

      {/* ---- ExplodedModel chapter (ink, pinned scrub) ---- */}
      <div className="bg-ink-950">
        <div className="mx-auto max-w-content px-6 pt-16">
          <Spec name="ExplodedModel - pinned scrub, reuses /assembly scene" on="ink" />
        </div>
        <ExplodedModel />
      </div>

      {/* ---- PinnedChapter (ink, generic states) ---- */}
      <Section variant="ink" width="content" className="!py-0">
        <Spec name="PinnedChapter - 3 states, scrub 0.8" on="ink" />
      </Section>
      <div className="bg-ink-900">
        <div className="mx-auto max-w-content px-6">
          <PinnedChapter
            eyebrow="Four pillars"
            title="Build. Learn. Race. Research."
            states={[
              {
                caption: "Build",
                body: "An open-source 1/10-scale vehicle system.",
                node: <PillarPanel text="Build the car from the open-source vehicle system" />,
              },
              {
                caption: "Race",
                body: "An international competition series at the major robotics conferences.",
                node: <PillarPanel text="Race it against teams from 90+ universities" />,
              },
              {
                caption: "Research",
                body: "A platform referenced by 1,000+ publications.",
                node: <PillarPanel text="Publish on the platform behind 1,000+ papers" />,
              },
            ]}
          />
        </div>
      </div>

      {/* ---- StatCounter (ink band) ---- */}
      <Section variant="ink" tight aria-labelledby="sg-stats">
        <Spec name="StatCounter - ink" on="ink" />
        <h2 id="sg-stats" className="sr-only">
          Community scale
        </h2>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:divide-x md:divide-ink-700 [&>*]:md:px-8 [&>:first-child]:md:pl-0">
          <StatCounter value={90} suffix="+" label="Universities" on="ink" />
          <StatCounter value={20} suffix="+" label="Countries" on="ink" />
          <StatCounter value={1000} suffix="+" label="Publications" on="ink" />
          <StatCounter value={30} label="Competitions held" on="ink" />
        </div>
      </Section>

      {/* ---- HighlightReel (ink; placeholder clip pending real media) ---- */}
      <Section variant="ink">
        <Spec name="HighlightReel - placeholder media, Cedric swaps clips" on="ink" />
        <SectionHeader on="ink" eyebrow="Highlights" title="Moments from the grid" />
        <HighlightReel
          items={[
            {
              src: HERO_VIDEO.mp4_960,
              poster: HERO_VIDEO.poster,
              caption: "FPV lap, IV 2026 Detroit",
              credit: "RoboRacer organizers",
              width: 960,
              height: 540,
            },
            {
              src: HERO_VIDEO.mp4_960,
              poster: HERO_VIDEO.poster,
              caption: "TODO(content): ICRA 2026 clip",
              width: 960,
              height: 540,
            },
          ]}
        />
      </Section>

      {/* ---- SponsorCTA (ink), TeamGrid below sponsors (rule) ---- */}
      <Section variant="ink" edge>
        <Spec name="SponsorCTA - ink" on="ink" />
        <SponsorCTA on="ink" />
        <div className="mt-24">
          <Spec name="TeamGrid - dev preview: status=verify entries shown" on="ink" />
          <SectionHeader
            on="ink"
            eyebrow="Featured teams"
            title="Who competes"
            lead="Seeded from the ICRA 2026 Vienna results page. Every entry is unverified until Cedric confirms it; unverified teams never render outside this styleguide."
          />
          <TeamGrid teams={teams} showUnverified />
        </div>
      </Section>

      {/* ---- Marquee + LogoCloud (paper) ---- */}
      <Section variant="paper" tight width="bleed" aria-labelledby="sg-partners">
        <div className="mx-auto max-w-content px-6">
          <Spec name="Marquee - partners, pause on hover" />
          <h2 id="sg-partners" className="sr-only">
            Partners
          </h2>
        </div>
        <Marquee label="Partner institutions" duration={55}>
          {partners.slice(0, 18).map((p) => (
            <img
              key={p.name}
              src={`${import.meta.env.BASE_URL}${p.image}`}
              alt={p.name}
              height={40}
              width="auto"
              loading="lazy"
              decoding="async"
              className="max-h-10 w-auto"
            />
          ))}
        </Marquee>
        <div className="mx-auto mt-16 max-w-content px-6">
          <Spec name="LogoCloud - static grid" />
          <LogoCloud partners={partners.slice(0, 12)} logoHeight={40} />
        </div>
      </Section>

      {/* ---- EventCard (paper grid) ---- */}
      <Section variant="paper" edge>
        <Spec name="EventCard - upcoming/past, paper" />
        <SectionHeader
          eyebrow="Race calendar"
          title="Upcoming and past"
          action={
            <Button href="/race" variant="secondary">
              Full calendar
            </Button>
          }
        />
        <Reveal stagger className="grid gap-6 md:grid-cols-3">
          {upcoming.map((e) => (
            <EventCard
              key={e.title}
              title={e.title}
              dates={e.dates}
              location={e.location}
              href={e.url}
              variant="upcoming"
              on="paper"
            />
          ))}
          <EventCard
            title="28th RoboRacer Autonomous Racing Competition at IV 2026"
            dates="June 22-25, 2026"
            location="Detroit, MI, USA"
            href="https://iv2026-race.roboracer.ai/"
            variant="past"
            on="paper"
          />
        </Reveal>
      </Section>

      {/* ---- PublicationCard + TagFilter (paper) ---- */}
      <Section variant="paper" aria-labelledby="sg-research">
        <Spec name="PublicationCard + TagFilter - paper only" />
        <SectionHeader
          id="sg-research"
          eyebrow="Research"
          title="Built on by 1,000+ publications"
          lead="A curated selection; the full list lives on Google Scholar."
          action={
            pubs && (
              <Button href={pubs.scholar_query_url} variant="secondary" target="_blank" rel="noreferrer">
                Google Scholar
              </Button>
            )
          }
        />
        <TagFilter tags={tagOptions} selected={tag} onChange={setTag} label="Filter publications by topic" />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shownPubs.map((p) => (
            <PublicationCard key={p.id} publication={p} tagLabels={tagLabels} />
          ))}
        </div>
      </Section>

      {/* ---- Specimen: type, color, buttons, media ---- */}
      <Section variant="paper" edge aria-labelledby="sg-specimen">
        <Spec name="Type scale / colors / Button / Reveal / MediaFrame" />
        <h2 id="sg-specimen" className="font-display text-display-m font-semibold text-text-strong">
          Specimen
        </h2>
        <div className="mt-10 flex flex-col gap-6">
          <p className="font-display text-display-xl font-semibold text-text-strong">Display XL</p>
          <p className="font-display text-display-l font-semibold text-text-strong">Display L</p>
          <p className="font-display text-display-m font-semibold text-text-strong">
            Display M with a <span className="text-gradient-brand">gradient span</span>
          </p>
          <p className="max-w-[60ch] text-lead">
            Lead. Confident, concrete, international, engineering-minded. Short sentences. Numbers
            over adjectives.
          </p>
          <p className="max-w-[68ch] text-body">
            Body. Dates as September 28 to 30, 2026 in prose and Sep 28-30, 2026 in cards.
          </p>
          <p className="text-small text-text-muted">Small, muted metadata. AA floor on paper.</p>
          <p className="eyebrow text-text-muted">Eyebrow, tracked 0.14em</p>
          <p className="font-mono text-small">mono 14.590s - lap times and telemetry</p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {(
            [
              ["ink-950", "bg-ink-950"],
              ["ink-900", "bg-ink-900"],
              ["ink-800", "bg-ink-800"],
              ["ink-700", "bg-ink-700"],
              ["paper-100", "bg-paper-100"],
              ["paper-200", "bg-paper-200"],
              ["rr-magenta", "bg-rr-magenta"],
              ["rr-cyan", "bg-rr-cyan"],
            ] as const
          ).map(([name, cls]) => (
            <div key={name}>
              <div className={`h-14 rounded-media border border-paper-200 ${cls}`} />
              <p className="mt-2 font-mono text-eyebrow text-text-muted">{name}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button>Primary on paper</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-card bg-ink-900 p-6">
          <Button on="ink">Primary on ink</Button>
          <Button on="ink" variant="secondary">
            Secondary
          </Button>
          <Button on="ink" variant="ghost">
            Ghost
          </Button>
        </div>

        <Reveal stagger className="mt-12 grid gap-6 md:grid-cols-2">
          <MediaFrame
            src={HERO_VIDEO.poster}
            alt="Poster frame from the IV 2026 FPV hero loop"
            width={1920}
            height={1080}
            aspect="16 / 9"
          />
          <div className="rounded-card border-animated">
            <div className="flex h-full min-h-40 items-center justify-center rounded-[10px] bg-ink-950 p-8 text-center">
              <p className="font-display font-semibold text-text-on-ink">
                Animated gradient border - the signature, at most once per page
              </p>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}

function PillarPanel({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[50svh] items-center justify-center rounded-card border border-ink-700 bg-ink-800 p-10 text-center">
      <p className="max-w-md font-display text-display-m font-semibold text-text-on-ink">{text}</p>
    </div>
  );
}
