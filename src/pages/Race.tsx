import { useEffect, useState } from "react";
import {
  loadEventsMap,
  loadTeams,
  loadUpcomingEvents,
  type MapEvent,
  type Team,
  type UpcomingEvent,
} from "../lib/data";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import MediaFrame from "../components/ui/MediaFrame";
import NextRaceSpotlight from "../components/ui/NextRaceSpotlight";
import TeamGrid from "../components/ui/TeamGrid";
import Reveal from "../components/ui/Reveal";
import RaceTimeline from "../components/race/RaceTimeline";
import SeasonChain from "../components/race/SeasonChain";

// Same clip and the same credit as the landing's next-race section
// (docs/ASSET_MANIFEST.md V4-11); the frame links to RoboRacer's own post,
// the footage credit stays Ezio Bartocci's.
const HERO = {
  video: "/media/race/race-iros2026-hero-1272.mp4",
  poster: "/media/race/race-iros2026-hero-poster.webp",
  width: 1272,
  height: 720,
  alt: "Ezio Bartocci's video from ICRA 2026 in Vienna: the race track seen from above and from the bridge",
  caption: "the hall \u00b7 ICRA 2026, Vienna",
  creditLabel: "our post on LinkedIn \u2197",
  creditHref: "https://www.linkedin.com/posts/great-work-by-all-involved-ugcPost-7471631589169516544-ZPa-/",
};

/**
 * How a team enters. The steps and their dates come from the rulebook
 * (public/rules.md) and the content skill; the deadlines below are read from
 * upcoming_events.json so a change to the JSON moves them here too.
 */
const ENTRY_STEPS = [
  {
    n: "01",
    title: "Read the rules",
    body: "Vehicle specification, track, time trial, and the head-to-head format. IROS 2026 adds multi-agent racing with up to four cars on track.",
  },
  {
    n: "02",
    title: "Register your team",
    body: "One form per team. Teams may have any number of members, but at most ten are at the race space during the event.",
  },
  {
    n: "03",
    title: "Send the qualification video",
    body: "One minute of your car driving a track autonomously, with no human intervention.",
  },
  {
    n: "04",
    title: "Talk to the organizers",
    body: "The competition channel on the RoboRacer teams Slack is where schedules, track details and answers are posted.",
  },
] as const;

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";

/**
 * /race - the page that turns a reader into a competitor.
 *
 * The next race opens the page instead of sitting as the third of three equal
 * cards, and the countdown runs to the registration deadline, which is the
 * date that actually costs a team its entry. Everything below it answers the
 * next question in order: how do I enter, what else is running this year, has
 * this been going long, and who would I be racing.
 */
export default function RacePage() {
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [mapEvents, setMapEvents] = useState<MapEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let live = true;
    loadUpcomingEvents()
      .then((d) => live && setUpcoming(d))
      .catch(() => undefined);
    loadEventsMap()
      .then((d) => live && setMapEvents(d.events))
      .catch(() => undefined);
    loadTeams()
      .then((d) => live && setTeams(d))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const race = upcoming.find((e) => e.spotlight) ?? upcoming[upcoming.length - 1];
  const past = mapEvents.filter((e) => e.status !== "upcoming");
  const city = race?.location.split(",")[0].trim();

  return (
    <>
      {/* Hero: the next race, not a page title over an empty band. */}
      <Section variant="ink" width="bleed" className="pt-[88px] md:pt-[105px]">
        <div className="mx-auto max-w-page px-6">
          <div className="max-w-3xl">
            <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
              <span>Race</span>
            </p>
            <h1 className="font-display text-display-l font-semibold text-text-on-ink">
              Come race with us
            </h1>
            <p className="mt-4 max-w-[60ch] text-lead text-text-on-ink-muted">
              Thirty competitions since 2016, on six continents. Every one of them is open to any
              team that can build a car and drive it autonomously - undergraduates, research labs
              and companies race the same track under the same rules.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-stretch md:gap-10">
            <figure className="md:col-span-7">
              <div
                className="overflow-hidden rounded-media border border-text-on-ink/10 bg-ink-800"
                style={{ aspectRatio: `${HERO.width} / ${HERO.height}` }}
              >
                <MediaFrame
                  src={HERO.poster}
                  video={HERO.video}
                  alt={HERO.alt}
                  width={HERO.width}
                  height={HERO.height}
                  priority
                  radius="none"
                  className="h-full"
                />
              </div>
              <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small">
                <span className="text-text-on-ink">{HERO.caption}</span>
                <a
                  href={HERO.creditHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-on-ink-muted underline decoration-text-on-ink/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                >
                  {HERO.creditLabel}
                </a>
              </figcaption>
            </figure>
            <div className="md:col-span-5">
              {race && (
                <NextRaceSpotlight
                  on="ink"
                  headingAs="h2"
                  title={race.title}
                  headline={`${race.short_name ?? race.title}${city ? `, ${city}` : ""}`}
                  datesHeadline={race.dates_headline ?? race.dates}
                  datesSecondary={race.dates_secondary}
                  registerHref={race.register_url ?? race.url}
                  registerNote={race.registration_deadline}
                  deadlineAt={race.registration_deadline_at}
                  rulesHref="/rules"
                  rulesInternal
                  startsAt={race.starts_at ?? ""}
                />
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section width="page" aria-labelledby="race-enter" rule>
        <SectionHeader
          index="01"
          id="race-enter"
          title="Enter"
          subtitle="Four steps between reading this and lining up on the grid"
          lead="Registration and the qualification video are the two hard deadlines; everything else can be sorted out on Slack."
          action={
            <div className="flex flex-wrap gap-4">
              <Button href={race?.register_url ?? "#"} variant="primary" target="_blank" rel="noopener noreferrer">
                Register your team
              </Button>
              <Button href="/rules" variant="secondary">
                Read the rules
              </Button>
            </div>
          }
        />
        <Reveal stagger>
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {ENTRY_STEPS.map((step) => (
              <li key={step.n} className="border-t border-ink-950/10 pt-5">
                <p className="font-mono text-small text-text-muted">{step.n}</p>
                <h3 className="mt-3 font-display text-lead font-semibold text-text-strong">
                  {step.title}
                </h3>
                <p className="mt-2 text-body text-text-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <dl className="mt-12 flex flex-col gap-2 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted sm:max-w-[46ch]">
          {race?.registration_deadline && (
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>registration closes</dt>
              <dd className="tabular-nums text-text-strong">{race.registration_deadline}</dd>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>qualification video due</dt>
            <dd className="tabular-nums text-text-strong">September 12, 2026</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>questions</dt>
            <dd>
              <a
                href={SLACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
              >
                RoboRacer teams Slack
              </a>
            </dd>
          </div>
        </dl>
      </Section>

      <Section width="page" edge aria-labelledby="race-season" rule>
        <SectionHeader
          index="02"
          id="race-season"
          title="This season"
          subtitle="The rest of 2026"
          lead="Three competitions are still to run this year. Each has its own site, its own registration and its own organizing committee."
        />
        <SeasonChain events={upcoming} map={mapEvents} />
      </Section>

      <Section width="page" aria-labelledby="race-history" rule>
        <SectionHeader
          index="03"
          id="race-history"
          title="Every race so far"
          subtitle="From Pittsburgh 2016 to Pittsburgh 2026"
          lead="Every competition the series has held, with a link to the event's own page. Where a race site has gone offline the link goes to an archived copy and says so."
        />
        <RaceTimeline events={past} />
      </Section>

      <Section width="page" edge aria-labelledby="race-teams" rule>
        <SectionHeader
          index="04"
          id="race-teams"
          title="Who competes"
          subtitle="Teams on the grid in 2026"
          lead="Undergraduate teams, research labs and company teams, racing the same specification. Entries still being sourced carry an unverified tag."
        />
        <TeamGrid teams={teams} />
      </Section>
    </>
  );
}
