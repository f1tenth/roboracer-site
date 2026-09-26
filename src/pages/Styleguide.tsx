import { useEffect, useMemo, useState } from "react";
import {
  loadHighlights,
  loadPartners,
  loadPublications,
  logoAttrs,
  loadTeams,
  loadUpcomingEvents,
  tagLabelMap,
  type Highlight,
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
import StatTicker from "../components/ui/StatTicker";
import MediaFrame from "../components/ui/MediaFrame";
import EventCard from "../components/ui/EventCard";
import LogoCloud from "../components/ui/LogoCloud";
import TagFilter from "../components/ui/TagFilter";
import PinnedChapter from "../components/ui/PinnedChapter";
import HeroChapter, { type HeroVideoSources } from "../components/ui/HeroChapter";
import HighlightReel from "../components/ui/HighlightReel";
import TeamGrid from "../components/ui/TeamGrid";
import PublicationCard from "../components/ui/PublicationCard";
import SponsorCTA from "../components/ui/SponsorCTA";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import ExplodedModel from "../components/ui/ExplodedModel";
import StartHere from "../components/ui/StartHere";

const HERO_VIDEO: HeroVideoSources = {
  mp4_1920: "/media/hero/hero-fpv-loop-1280.mp4",
  mp4_960: "/media/hero/hero-fpv-loop-960.mp4",
  poster: "/media/hero/hero-fpv-poster.webp",
  width: 1280,
  height: 720,
};

// Landing v3 copy (no comma): line 1 is one gradient unit, the rest is word by word.
const HERO_LINES = ["Autonomous racing", "built and raced", "in the open"];

/** Mono spec chip naming each primitive for review with Ayagoz. */
function Spec({ name, on = "paper" }: { name: string; on?: "ink" | "paper" }) {
  return (
    <p
      className={`mb-6 w-fit border px-2.5 py-1 font-mono text-eyebrow tracking-normal ${
        on === "ink" ? "border-text-on-ink/20 text-text-on-ink-muted" : "border-ink-950/15 text-text-muted"
      }`}
    >
      {name}
    </p>
  );
}

/**
 * /styleguide: every primitive under the sharpen direction (2026-08-21) -
 * paper default, hairline accents, mono data, 4px radii. Reviewed on
 * localhost by Cedric and Ayagoz.
 */
export default function Styleguide() {
  useLenis();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingEvents().then(setEvents).catch(() => setEvents([]));
    loadPartners().then(setPartners).catch(() => setPartners([]));
    loadTeams().then(setTeams).catch(() => setTeams([]));
    loadHighlights().then(setHighlights).catch(() => setHighlights([]));
    loadPublications().then(setPubs).catch(() => setPubs(null));
  }, []);

  const race = events.find((e) => e.spotlight);
  const upcoming = events.filter((e) => !e.spotlight).slice(0, 2);
  const tagOptions = useMemo(() => (pubs ? pubs.tags.map(({ id, label }) => ({ id, label })) : []), [pubs]);
  const tagLabels = useMemo(() => (pubs ? tagLabelMap(pubs.tags) : {}), [pubs]);
  const shownPubs = useMemo(() => {
    if (!pubs) return [];
    const pool = pubs.items.filter((p) => p.status === "published" && p.featured);
    return pool.filter((p) => (tag ? p.tags.includes(tag) : true)).slice(0, 6);
  }, [pubs, tag]);

  return (
    // No top padding: the hero runs under the transparent nav exactly as on
    // the landing (NavBar treats /styleguide as a hero route).
    <div>
      <h1 className="sr-only">Styleguide</h1>

      {/* HeroChapter - the landing's first 320vh (h1 there, h2 here): video
          under the nav, the headline assembling in front of it with line 1
          in the logo gradient, an obvious zoom, then the words thrown upward */}
      <HeroChapter as="h2" video={HERO_VIDEO} lines={HERO_LINES} />
      <div className="bg-paper-50">
        <div className="mx-auto max-w-content px-6 pt-16">
          <Spec name="HeroChapter · 320vh sticky, scrub 0.6 · video only to p 0.08, assemble 0.10-0.42, zoom 0.42-0.82, thrown exit 0.82-1.0 · nav alpha 0 -> 1 over p 0.72-0.95" />
        </div>
      </div>

      {/* NextRaceSpotlight - paper hairline panel */}
      <Section guides>
        <Spec name="NextRaceSpotlight · paper, 7/5, mono data lines" />
        {race ? (
          <NextRaceSpotlight
            title={race.title}
            datesHeadline={race.dates_headline ?? `${race.dates}, ${race.location}`}
            datesSecondary={race.dates_secondary}
            registerHref={race.register_url ?? race.url}
            registerNote={race.registration_deadline}
            rulesHref={race.rules_url}
            startsAt={race.starts_at ?? ""}
          />
        ) : (
          <p className="font-mono text-small text-text-muted">upcoming_events.json has no spotlight entry</p>
        )}
      </Section>

      {/* SectionHeader anatomy */}
      <Section edge rule>
        <Spec name="SectionHeader · numbered mono eyebrow + 4px index marker" />
        <SectionHeader
          index="01"
          eyebrow="Section name"
          title="Display M title, tighter"
          lead="Lead text, max 60ch. Numbers over adjectives; dates as September 28 to 30, 2026."
          action={<Button variant="secondary">Action</Button>}
        />
      </Section>

      {/* StartHere - the ways in from public/data/paths.json, as the
          landing's 00 has them: a grid of tiles under the header from
          desktop:, thumb rows on phones. The one place the five appear on the
          site (/about links to it). No section id here: the landing's #start
          stays the nav's one target. */}
      <div className="bg-paper-50">
        <div className="mx-auto max-w-content px-6 pt-16">
          <Spec name="StartHere · landing 00 · tablets: header full width, then 2+2+1 tiles with clips; laptops: two columns, the header in the first cell, the five as landscape tiles, one link per tile" />
        </div>
      </div>
      <StartHere
        index="00"
        headingId="sg-start"
        lead="RoboRacer is a self-driving race car at one-tenth scale that 90+ universities use for teaching, research and racing."
      />

      {/* ExplodedModel - ink chapter */}
      <div className="bg-ink-950">
        <div className="mx-auto max-w-content px-6 pt-16">
          <Spec name="ExplodedModel · ink chapter, 140vh pin, outward-and-hold, ceiling 0.5" on="ink" />
        </div>
        <ExplodedModel />
      </div>

      {/* PinnedChapter - generic, type-and-rules states */}
      <div className="bg-ink-900">
        <div className="mx-auto max-w-content px-6 pt-16">
          <Spec name="PinnedChapter · 3 states, scrub 0.8" on="ink" />
        </div>
        <div className="mx-auto max-w-content px-6">
          <PinnedChapter
            eyebrow="Four pillars"
            title="Build. Learn. Race. Research."
            states={[
              {
                caption: "Build",
                body: "An open-source 1/10-scale vehicle system.",
                node: <ChapterLine text="Build the car from the open-source vehicle system" />,
              },
              {
                caption: "Race",
                body: "An international competition series.",
                node: <ChapterLine text="Race it at the major robotics conferences" />,
              },
              {
                caption: "Research",
                body: "A platform referenced by 1,000+ publications.",
                node: <ChapterLine text="Publish on the platform behind 1,000+ papers" />,
              },
            ]}
          />
        </div>
      </div>

      {/* StatTicker - paper data strip */}
      <Section tight aria-labelledby="sg-stats">
        <Spec name="StatTicker · mono data strip" />
        <h2 id="sg-stats" className="sr-only">
          Community scale
        </h2>
        <div className="grid grid-cols-2 gap-8 border-y border-ink-950/10 py-8 md:grid-cols-4">
          <StatTicker value={90} suffix="+" label="universities" />
          <StatTicker value={20} suffix="+" label="countries" />
          <StatTicker value={1000} suffix="+" label="publications" />
          <StatTicker value={30} label="competitions held" />
        </div>
      </Section>

      {/* HighlightReel - two-row counter-scrolling strip from highlights.json.
          Plain paper-50 surface so the paper-100 placeholder frames read as
          tiles, not background. */}
      <Section rule width="bleed">
        <div className="mx-auto max-w-content px-6">
          <Spec name="HighlightReel · two-row counter-scroll, 52s/60s, pause on hover/focus" />
        </div>
        {highlights.length > 0 ? (
          <HighlightReel items={highlights} />
        ) : (
          <p className="mx-auto max-w-content px-6 font-mono text-small text-text-muted">
            highlights.json failed to load
          </p>
        )}
      </Section>

      {/* SponsorCTA + TeamGrid - paper */}
      <Section rule>
        <Spec name="SponsorCTA · hairline panel, the viewport's one solid CTA" />
        <SponsorCTA />
        <div className="mt-20">
          <Spec name="TeamGrid · hairline cells, mono tags" />
          <TeamGrid teams={teams} />
        </div>
      </Section>

      {/* Marquee + LogoCloud */}
      <Section tight width="bleed" aria-labelledby="sg-partners">
        <div className="mx-auto max-w-content px-6">
          <Spec name="Marquee · grayscale, pause on hover / LogoCloud static" />
          <h2 id="sg-partners" className="sr-only">
            Partners
          </h2>
        </div>
        <Marquee label="Partner institutions" duration={55}>
          {partners.slice(0, 18).map((p) => (
            <img
              key={p.name}
              src={`${import.meta.env.BASE_URL}${(p.image_hover ?? p.image).replace(/^\//, "")}`}
              alt={p.name}
              {...logoAttrs(p, 36)}
              /* Marquee children are never lazy (HANDOFF section 4). */
              loading="eager"
              fetchPriority="low"
              decoding="async"
              className="max-h-9 w-auto max-w-32 object-contain grayscale transition-[filter] duration-[var(--duration-fast)] hover:grayscale-0"
            />
          ))}
        </Marquee>
        <div className="mx-auto mt-14 max-w-content px-6">
          <LogoCloud partners={partners.slice(0, 12)} logoHeight={36} />
        </div>
      </Section>

      {/* EventCard */}
      <Section edge rule>
        <Spec name="EventCard · hairline, mono status + meta" />
        <Reveal stagger className="grid gap-6 md:grid-cols-3">
          {upcoming.map((e) => (
            <EventCard key={e.title} title={e.title} dates={e.dates} location={e.location} href={e.url} variant="upcoming" />
          ))}
          <EventCard
            title="28th RoboRacer Autonomous Racing Competition at IV 2026"
            dates="June 22-25, 2026"
            location="Detroit, MI, USA"
            href="https://iv2026-race.roboracer.ai/"
            variant="past"
          />
        </Reveal>
      </Section>

      {/* PublicationCard + TagFilter */}
      <Section aria-labelledby="sg-research" rule>
        <Spec name="PublicationCard + TagFilter" />
        <SectionHeader
          index="09"
          eyebrow="Research"
          id="sg-research"
          title="Featured publications"
          action={
            pubs && (
              <Button href={pubs.scholar_query_url} variant="secondary" target="_blank" rel="noopener noreferrer">
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

      {/* Specimen */}
      <Section edge rule aria-labelledby="sg-specimen">
        <Spec name="Type / color / Button / MediaFrame" />
        <h2 id="sg-specimen" className="font-display text-display-m font-semibold text-text-strong">
          Specimen
        </h2>
        <div className="mt-10 flex flex-col gap-6">
          <p className="font-display text-display-xl font-semibold text-text-strong">Display XL</p>
          <p className="font-display text-display-l font-semibold text-text-strong">Display L</p>
          <p className="font-display text-display-m font-semibold text-text-strong">Display M</p>
          <p className="max-w-[60ch] text-lead">Lead. Confident, concrete, international, engineering-minded.</p>
          <p className="max-w-[68ch] text-body">Body. Short sentences. Numbers over adjectives.</p>
          <p className="font-mono text-small text-text-muted">mono · 14.590s · Sep 28-30, 2026 · data and captions</p>
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
              <div className={`h-14 rounded-media border border-ink-950/10 ${cls}`} />
              <p className="mt-2 font-mono text-eyebrow tracking-normal text-text-muted">{name}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button>Primary (one per viewport)</Button>
          <Button variant="secondary">Secondary hairline</Button>
          <Button variant="ghost">Ghost underline</Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
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

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <MediaFrame
            src={HERO_VIDEO.poster}
            alt="Poster frame from the IV 2026 hero loop"
            width={1280}
            height={720}
            aspect="16 / 9"
          />
          <div className="flex min-h-40 items-center justify-center rounded-media border border-ink-950/10 p-8 text-center">
            <p className="max-w-md font-mono text-small text-text-muted">
              gradient is reserved for the logo and the hero's first line · no other gradient text, no gradient buttons
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function ChapterLine({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[50svh] items-center border-t border-text-on-ink/15 pt-8">
      <p className="max-w-xl font-display text-display-l font-semibold text-text-on-ink">{text}</p>
    </div>
  );
}
