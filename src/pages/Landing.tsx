import { useEffect, useState } from "react";
import {
  loadPartners,
  loadPublications,
  loadTeams,
  loadUpcomingEvents,
  tagLabelMap,
  visibleTeams,
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
import VideoHero from "../components/ui/VideoHero";
import HighlightReel from "../components/ui/HighlightReel";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import ExplodedModel from "../components/ui/ExplodedModel";
import SponsorCTA from "../components/ui/SponsorCTA";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";

const HERO_VIDEO = {
  mp4_1920: "/media/hero/hero-fpv-loop-1920.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1920,
  height: 1080,
};

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";

// Four pillars: old landing copy after the roboracer-content voice pass
// (short sentences, numbers over adjectives, no emoji icons).
const PILLARS = [
  {
    title: "Build",
    body: "An open-source vehicle system: hardware designs and software anyone can build and race.",
    href: "/build",
    linkText: "Build the car",
  },
  {
    title: "Learn",
    body: "Course materials on perception, localization, planning, and safe control, taught at 90+ universities.",
    href: "/learn",
    linkText: "Start the course",
  },
  {
    title: "Race",
    body: "An international competition series, 30 competitions held at the major robotics conferences.",
    href: "/race",
    linkText: "See the races",
  },
  {
    title: "Research",
    body: "A common platform for autonomy research, referenced by more than a thousand publications.",
    href: "/research",
    linkText: "Browse the research",
  },
] as const;

function PillarIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    Build: <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7Z" />,
    Learn: <path d="M12 4 2 9l10 5 10-5-10-5Zm-6 8v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4" />,
    Race: <path d="M5 21V4h11l-1.5 3.5L19 11H8" />,
    Research: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.5-4.5" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-rr-magenta">
      {paths[name]}
    </svg>
  );
}

function EntryCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-card border border-ink-700 bg-ink-800 p-8">
      <h3 className="font-display text-display-m font-semibold text-text-on-ink">{title}</h3>
      <p className="text-body text-text-on-ink-muted">{body}</p>
      <div className="mt-auto pt-4">
        <Button href={href} on="ink" variant="secondary">
          {cta}
        </Button>
      </div>
    </div>
  );
}

export default function Landing() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
  }, []);

  const race = events.find((e) => e.spotlight);
  const publishedTeams = visibleTeams(teams);
  const featured = pubs?.items.filter((p) => p.featured && p.status === "published").slice(0, 3) ?? [];

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* 1 · Hero: the feeling of racing */}
      <VideoHero
        headline={
          <>
            Autonomous racing, built and raced <span className="text-gradient-brand">in the open</span>
          </>
        }
        lead="RoboRacer, formerly F1TENTH, is an international community of researchers, engineers, and students racing open-source autonomous cars at 1/10 scale."
        actions={
          <>
            {race && (
              <Button href={race.register_url ?? race.url} on="ink" target="_blank" rel="noopener noreferrer">
                Register for IROS 2026
              </Button>
            )}
            <Button href={SLACK_URL} on="ink" variant="secondary" target="_blank" rel="noopener noreferrer">
              Join the community
            </Button>
          </>
        }
        video={HERO_VIDEO}
        credit="Footage: RoboRacer at IV 2026, Detroit"
      />

      {/* 2 · Next race: come race at IROS 2026 */}
      {race && (
        <Section variant="ink" edge aria-labelledby="next-race">
          <h2 id="next-race" className="sr-only">
            Next race
          </h2>
          <NextRaceSpotlight
            title={race.title}
            datesHeadline={race.dates_headline ?? `${race.dates}, ${race.location}`}
            datesSecondary={race.dates_secondary}
            registerHref={race.register_url ?? race.url}
            registerNote={race.registration_deadline ? `Registration closes ${race.registration_deadline}` : undefined}
            rulesHref={race.rules_url}
            startsAt={race.starts_at ?? ""}
          />
        </Section>
      )}

      {/* 3 · Highlights: 30 competitions, one community */}
      <Section variant="ink" aria-labelledby="highlights">
        <SectionHeader
          on="ink"
          id="highlights"
          eyebrow="Highlights"
          title="30 competitions. One community."
          lead="From Pittsburgh to Busan, teams have raced 1/10-scale autonomous cars through 30 competitions since 2016. Podiums, overtakes, packed exhibition halls."
        />
        <HighlightReel
          items={[
            {
              src: HERO_VIDEO.mp4_960,
              poster: HERO_VIDEO.poster,
              caption: "Track-level lap, IV 2026 Detroit",
              credit: "RoboRacer organizers",
              width: 960,
              height: 540,
            },
            {
              src: HERO_VIDEO.mp4_960,
              poster: HERO_VIDEO.poster,
              // TODO(content): swap for an ICRA 2026 Vienna clip once Cedric adds real media
              caption: "ICRA 2026 Vienna - clip coming",
              width: 960,
              height: 540,
            },
          ]}
        />
      </Section>

      {/* 4 · The car: pinned assembly chapter */}
      <div className="bg-ink-950">
        <ExplodedModel />
      </div>

      {/* 5 · Four pillars: what RoboRacer is */}
      <Section variant="paper" aria-labelledby="pillars">
        <SectionHeader
          id="pillars"
          eyebrow="The platform"
          title="Build. Learn. Race. Research."
          lead="Four things working together: a car anyone can build, courses that teach autonomy, races that test it, and research that grows on top."
        />
        <Reveal stagger className="grid gap-6 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <article key={p.title} className="flex h-full flex-col gap-3 rounded-card bg-paper-50 p-6 shadow-card">
              <PillarIcon name={p.title} />
              <h3 className="font-display text-lg font-semibold text-text-strong">{p.title}</h3>
              <p className="text-small text-text-body">{p.body}</p>
              <a
                href={p.href}
                className="mt-auto pt-2 text-small font-semibold text-text-strong underline underline-offset-4 decoration-rr-magenta hover:decoration-2"
              >
                {p.linkText}
              </a>
            </article>
          ))}
        </Reveal>
      </Section>

      {/* 6 · Community scale */}
      <Section variant="ink" tight aria-labelledby="scale">
        <h2 id="scale" className="sr-only">
          Community scale
        </h2>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:divide-x md:divide-ink-700 [&>*]:md:px-8 [&>:first-child]:md:pl-0">
          <StatCounter value={90} suffix="+" label="Universities" on="ink" />
          <StatCounter value={20} suffix="+" label="Countries" on="ink" />
          <StatCounter value={1000} suffix="+" label="Publications" on="ink" />
          <StatCounter value={30} label="Competitions held" on="ink" />
        </div>
      </Section>

      {/* 7 · Partners: who uses the platform */}
      <Section variant="paper" tight width="bleed" aria-labelledby="partners">
        <div className="mx-auto max-w-content px-6">
          <SectionHeader
            id="partners"
            eyebrow="Partners"
            title="Used at 90+ universities"
            lead="Institutions that build, teach, and race with the platform."
          />
        </div>
        <Marquee label="Partner institutions" duration={55}>
          {partners.map((p) => (
            <img
              key={p.name}
              src={`${import.meta.env.BASE_URL}${p.image}`}
              alt={p.name}
              height={40}
              width="auto"
              loading="lazy"
              decoding="async"
              className="max-h-10 w-auto grayscale transition-[filter] duration-[var(--duration-fast)] hover:grayscale-0"
            />
          ))}
        </Marquee>
      </Section>

      {/* 8 · Sponsors (zero confirmed is the correct state) */}
      <Section variant="ink" edge aria-labelledby="sponsors">
        <h2 id="sponsors" className="sr-only">
          Sponsors
        </h2>
        <SponsorCTA on="ink" />
        {/* 9 · Featured teams, always below sponsors; renders only status=published */}
        {publishedTeams.length > 0 && (
          <div className="mt-24">
            <SectionHeader
              on="ink"
              eyebrow="Featured teams"
              title="Who competes"
              lead="Teams from the results pages of recent competitions."
            />
            <TeamGrid teams={teams} />
          </div>
        )}
      </Section>

      {/* 10 · Research teaser */}
      <Section variant="paper" aria-labelledby="research">
        <SectionHeader
          id="research"
          eyebrow="Research"
          title="1,000+ publications build on this platform"
          lead="A Google Scholar search for the platform returns more than a thousand results. These are a few of the papers we feature."
          action={
            <Button href={SCHOLAR_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
              See the Scholar query
            </Button>
          }
        />
        <Reveal stagger className="grid gap-6 md:grid-cols-3">
          {featured.map((p) => (
            <PublicationCard key={p.id} publication={p} tagLabels={pubs ? tagLabelMap(pubs.tags) : {}} />
          ))}
        </Reveal>
        <div className="mt-10">
          <Button href="/research" variant="ghost">
            Browse all curated publications
          </Button>
        </div>
      </Section>

      {/* 11 · Get started */}
      <Section variant="ink" aria-labelledby="get-started">
        <SectionHeader
          on="ink"
          id="get-started"
          eyebrow="Get started"
          title="Bring your car to the grid"
          lead="Build the car, take the course, and race with teams from 20+ countries."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <EntryCard
            title="Build"
            body="Hardware designs, bill of materials, and software to get a car driving."
            href="/build"
            cta="Start building"
          />
          <EntryCard
            title="Learn"
            body="The course materials that 90+ universities teach autonomy with."
            href="/learn"
            cta="Start learning"
          />
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button href={SLACK_URL} on="ink" target="_blank" rel="noopener noreferrer">
            Join the community on Slack
          </Button>
          <p className="text-small text-text-on-ink-muted">
            Questions? <a className="underline underline-offset-4 decoration-rr-magenta hover:decoration-2" href="mailto:contact@roboracer.ai">contact@roboracer.ai</a>
          </p>
        </div>
      </Section>
    </div>
  );
}
