import { useEffect, useState } from "react";
import {
  loadHighlights,
  loadPartners,
  loadPublications,
  loadTeams,
  loadUpcomingEvents,
  tagLabelMap,
  type Highlight,
  type Partner,
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
import StatCounter from "../components/ui/StatCounter";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";
import VideoHero from "../components/ui/VideoHero";
import HeadlineReveal from "../components/ui/HeadlineReveal";
import HighlightReel from "../components/ui/HighlightReel";

const HERO_VIDEO = {
  mp4_1920: "/media/hero/hero-fpv-loop-1280.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1280,
  height: 720,
};

const HEADLINE_LINES = ["Autonomous racing,", "built and raced", "in the open"];

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";

// Four pillars as hairline rows (content-skill voice; numbers live in the
// data strip, not repeated here).
const PILLARS = [
  {
    n: "01",
    title: "Build",
    body: "An open-source vehicle system: hardware designs and software anyone can build and race.",
    href: "/build",
    linkText: "Build the car",
  },
  {
    n: "02",
    title: "Learn",
    body: "Course materials on perception, localization, planning, and safe control.",
    href: "/learn",
    linkText: "Start the course",
  },
  {
    n: "03",
    title: "Race",
    body: "An international competition series at the major robotics conferences.",
    href: "/race",
    linkText: "See the races",
  },
  {
    n: "04",
    title: "Research",
    body: "A common, citable platform for autonomy research.",
    href: "/research",
    linkText: "Browse the research",
  },
] as const;

/**
 * Landing v2 composition (final order, plan rev 2): hero video, headline,
 * highlights, next race, the car, platform, scale data line, partners, teams,
 * research, get started. Section 5 (car) is a local stub until revamp/v2-car
 * merges; everything else is wired.
 */
export default function Landing() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
    loadHighlights().then(setHighlights).catch(() => setHighlights([]));
  }, []);

  // The data-driven sections (next race, teams, research) mount after their
  // fetches resolve and shift everything below them; recompute the cached
  // ScrollTrigger starts or the stat counters fire hundreds of px early.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [events, partners, teams, pubs, highlights]);

  const race = events.find((e) => e.spotlight);
  const featured = pubs?.items.filter((p) => p.featured && p.status === "published").slice(0, 3) ?? [];

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* 1 · Hero (ink): video and nothing else */}
      <VideoHero video={HERO_VIDEO} />

      {/* 2 · Headline (paper): the page h1, pinned per-word reveal */}
      <HeadlineReveal lines={HEADLINE_LINES} />

      {/* 3 · 01 Highlights (paper, full-bleed): the two-row strip lands at integration */}
      <Section edge rule width="bleed" aria-labelledby="highlights">
        <div className="mx-auto max-w-content px-6">
          <SectionHeader
            index="01"
            eyebrow="Highlights"
            id="highlights"
            title="30 competitions. One community."
            lead="From Pittsburgh to Busan, teams have raced 1/10-scale autonomous cars since 2016. Podiums, overtakes, packed exhibition halls."
          />
        </div>
        <HighlightReel items={highlights} />
      </Section>

      {/* 4 · 02 Next race (paper) */}
      {race && (
        <Section aria-labelledby="next-race" guides>
          <SectionHeader index="02" eyebrow="Next race" id="next-race" title="IROS 2026" />
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

      {/* 5 · The car (ink chapter): B's ExplodedModel carries its own "03 / The car" header */}
      <section className="flex min-h-svh items-center justify-center bg-ink-950">
        <p className="font-mono text-small text-text-on-ink-muted">TODO(wire): ExplodedModel chapter from revamp/v2-car</p>
      </section>

      {/* 6 · 04 Platform (paper): hairline rows, 5/7 split */}
      <Section aria-labelledby="pillars">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeader
              index="04"
              eyebrow="Platform"
              id="pillars"
              title="Build. Learn. Race. Research."
              lead="Four things working together: a car anyone can build, courses that teach autonomy, races that test it, and research that grows on top."
            />
          </div>
          <ul className="md:col-span-7">
            {PILLARS.map((p) => (
              <li key={p.title} className="border-t border-ink-950/10 py-6 last:border-b">
                <div className="grid gap-2 sm:grid-cols-12 sm:items-baseline">
                  <span className="font-mono text-small text-text-muted sm:col-span-1">{p.n}</span>
                  <h3 className="font-display text-lg font-semibold text-text-strong sm:col-span-3">{p.title}</h3>
                  <p className="text-small text-text-body sm:col-span-5">{p.body}</p>
                  <a
                    href={p.href}
                    className="inline-block py-1 text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2 sm:col-span-3 sm:justify-self-end"
                  >
                    {p.linkText}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 7 · Scale (paper): a data line, not a section - no header, no marker */}
      <Section tight rule aria-labelledby="scale" className="pb-0">
        <h2 id="scale" className="sr-only">
          Community scale
        </h2>
        <div className="grid grid-cols-2 gap-8 border-y border-ink-950/10 py-8 md:grid-cols-4">
          <StatCounter value={90} suffix="+" label="universities" />
          <StatCounter value={20} suffix="+" label="countries" />
          <StatCounter value={1000} suffix="+" label="publications" />
          <StatCounter value={30} label="competitions held" />
        </div>
        <p className="mt-3 text-right font-mono text-small text-text-muted">across the partner institutions below</p>
      </Section>

      {/* 8 · Partners (paper): marquee with a demoted mono label; reads as one
          unit with the data line above */}
      <Section tight width="bleed" aria-labelledby="partners" className="pt-6">
        <div className="mx-auto max-w-content px-6">
          <h2 id="partners" className="mb-6 font-mono text-eyebrow font-normal tracking-normal text-text-muted">
            partner institutions
          </h2>
        </div>
        <Marquee label="Partner institutions" duration={55}>
          {partners.map((p) => (
            <img
              key={p.name}
              src={`${import.meta.env.BASE_URL}${p.image}`}
              alt={p.name}
              height={36}
              width="auto"
              loading="lazy"
              decoding="async"
              className="max-h-9 w-auto max-w-32 object-contain grayscale transition-[filter] duration-[var(--duration-fast)] hover:grayscale-0"
            />
          ))}
        </Marquee>
      </Section>

      {/* SponsorCTA removed from landing 2026-08-21 (Cedric): zero-sponsor state lives on /about and /race for now */}

      {/* 9 · 05 Teams (paper) */}
      <Section edge rule aria-labelledby="teams">
        <SectionHeader
          index="05"
          eyebrow="Teams"
          id="teams"
          title="Who competes"
          lead="Seeded from the results pages of recent competitions; entries are tagged until verified."
        />
        <TeamGrid teams={teams} />
      </Section>

      {/* 10 · 06 Research (paper, 5/7) */}
      <Section rule aria-labelledby="research">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeader
              index="06"
              eyebrow="Research"
              id="research"
              title="1,000+ publications build on this platform"
              lead="A Google Scholar search for the platform returns more than a thousand results. A few of the papers we feature:"
            />
            <div className="flex flex-wrap gap-4">
              <Button href={SCHOLAR_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
                See the Scholar query
              </Button>
              <Button href="/research" variant="ghost">
                All curated publications
              </Button>
            </div>
          </div>
          <Reveal stagger className="flex flex-col gap-4 md:col-span-7">
            {featured.map((p) => (
              <PublicationCard key={p.id} publication={p} tagLabels={pubs ? tagLabelMap(pubs.tags) : {}} />
            ))}
          </Reveal>
        </div>
      </Section>

      {/* 11 · 07 Get started (paper) */}
      <Section edge rule aria-labelledby="get-started">
        <SectionHeader
          index="07"
          eyebrow="Get started"
          id="get-started"
          title="Bring your car to the grid"
          lead="Build the car, take the course, and race."
        />
        <ul>
          {(
            [
              ["Build", "Hardware designs, bill of materials, and software to get a car driving.", "/build", "Start building"],
              ["Learn", "The course materials universities teach autonomy with.", "/learn", "Start learning"],
            ] as const
          ).map(([title, body, href, cta]) => (
            <li key={title} className="border-t border-ink-950/10 py-6 last:border-b">
              <div className="grid gap-2 sm:grid-cols-12 sm:items-baseline">
                <h3 className="font-display text-lg font-semibold text-text-strong sm:col-span-3">{title}</h3>
                <p className="text-small text-text-body sm:col-span-6">{body}</p>
                <a
                  href={href}
                  className="inline-block py-1 text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2 sm:col-span-3 sm:justify-self-end"
                >
                  {cta}
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Button href={SLACK_URL} target="_blank" rel="noopener noreferrer">
            Join the community on Slack
          </Button>
          <p className="font-mono text-small text-text-muted">
            <a
              className="text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2"
              href="mailto:contact@roboracer.ai"
            >
              contact@roboracer.ai
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}
