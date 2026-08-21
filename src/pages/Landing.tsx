import { useEffect, useState } from "react";
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
import VideoHero from "../components/ui/VideoHero";
import HighlightReel from "../components/ui/HighlightReel";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import ExplodedModel from "../components/ui/ExplodedModel";
import SponsorCTA from "../components/ui/SponsorCTA";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";

const HERO_VIDEO = {
  mp4_1920: "/media/hero/hero-fpv-loop-1280.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1280,
  height: 720,
};

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
  const featured = pubs?.items.filter((p) => p.featured && p.status === "published").slice(0, 3) ?? [];

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* Hero (ink): the feeling of racing. One solid CTA. */}
      <VideoHero
        headline="Autonomous racing, built and raced in the open"
        lead="RoboRacer, formerly F1TENTH, is an international community of researchers, engineers, and students racing open-source autonomous cars at 1/10 scale."
        actions={
          <>
            {race && (
              <Button href={race.register_url ?? race.url} on="ink" target="_blank" rel="noopener noreferrer">
                Register for IROS 2026
              </Button>
            )}
            <Button href={SLACK_URL} on="ink" variant="ghost" target="_blank" rel="noopener noreferrer">
              Join the community
            </Button>
          </>
        }
        video={HERO_VIDEO}
        credit="footage: RoboRacer at IV 2026, Detroit"
      />

      {/* 01 · Next race (paper) */}
      {race && (
        <Section aria-labelledby="next-race" guides>
          <SectionHeader index="01" eyebrow="Next race" id="next-race" title="IROS 2026, Pittsburgh" />
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

      {/* 02 · Highlights (paper): real footage + honest slots until photos land */}
      <Section edge rule aria-labelledby="highlights">
        <SectionHeader
          index="02"
          eyebrow="Highlights"
          id="highlights"
          title="30 competitions. One community."
          lead="From Pittsburgh to Busan, teams have raced 1/10-scale autonomous cars since 2016. Podiums, overtakes, packed exhibition halls."
        />
        <HighlightReel
          items={[
            {
              src: HERO_VIDEO.mp4_960,
              poster: HERO_VIDEO.poster,
              caption: "track-level lap · IV 2026, Detroit",
              credit: "RoboRacer organizers",
              width: 960,
              height: 540,
            },
            {
              kind: "slot",
              // TODO(content): ICRA 2026 Vienna group photo from Cedric, full-bleed treatment
              caption: "ICRA 2026, Vienna · group photo",
            },
          ]}
        />
      </Section>

      {/* 03 · The car (ink chapter - one of the three ink surfaces) */}
      <div className="bg-ink-950">
        <ExplodedModel />
      </div>

      {/* 04 · Platform (paper): hairline rows, 5/7 split */}
      <Section aria-labelledby="pillars" guides>
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
                    className="text-small font-semibold text-text-strong underline underline-offset-4 decoration-rr-magenta hover:decoration-2 sm:col-span-3 sm:justify-self-end"
                  >
                    {p.linkText}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 05 · Scale (paper data strip) */}
      <Section tight rule aria-labelledby="scale">
        <h2 id="scale" className="sr-only">
          Community scale
        </h2>
        <div className="grid grid-cols-2 gap-8 border-y border-ink-950/10 py-8 md:grid-cols-4">
          <StatCounter value={90} suffix="+" label="universities" />
          <StatCounter value={20} suffix="+" label="countries" />
          <StatCounter value={1000} suffix="+" label="publications" />
          <StatCounter value={30} label="competitions held" />
        </div>
      </Section>

      {/* 06 · Partners (paper) */}
      <Section tight width="bleed" aria-labelledby="partners">
        <div className="mx-auto max-w-content px-6">
          <SectionHeader
            index="06"
            eyebrow="Partners"
            id="partners"
            title="Partner institutions"
            lead="The universities and organizations that build, teach, and race with the platform."
          />
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

      {/* 07 · Sponsors + 08 · Teams (paper) */}
      <Section edge rule aria-labelledby="sponsors">
        <SectionHeader index="07" eyebrow="Sponsorship" id="sponsors" title="Sponsors" />
        <SponsorCTA />
        <div className="mt-24">
          <SectionHeader
            index="08"
            eyebrow="Teams"
            title="Who competes"
            lead="Seeded from the results pages of recent competitions; entries are tagged until verified."
          />
          <TeamGrid teams={teams} />
        </div>
      </Section>

      {/* 09 · Research (paper, 5/7) */}
      <Section rule aria-labelledby="research" guides>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeader
              index="09"
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

      {/* 10 · Get started (paper) */}
      <Section edge rule aria-labelledby="get-started">
        <SectionHeader
          index="10"
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
                  className="text-small font-semibold text-text-strong underline underline-offset-4 decoration-rr-magenta hover:decoration-2 sm:col-span-3 sm:justify-self-end"
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
              className="underline underline-offset-4 decoration-rr-magenta hover:decoration-2"
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
