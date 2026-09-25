import { useEffect, useState } from "react";
import {
  loadEventsMap,
  loadTeams,
  loadUpcomingEvents,
  type MapEvent,
  type Team,
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
import Leaderboard from "../components/race/Leaderboard";
import type { SeasonEvent } from "../components/race/eventState";

// Same clip and the same credit as the landing's next-race section
// (docs/ASSET_MANIFEST.md V4-11); the frame links to RoboRacer's own post,
// the footage credit stays Ezio Bartocci's.
const HERO = {
  video: "/media/race/race-iros2026-hero-1272.mp4",
  poster: "/media/race/race-iros2026-hero-poster.webp",
  width: 1272,
  height: 720,
  alt: "Ezio Bartocci's video from ICRA 2026 in Vienna: the race track seen from above and from the bridge",
  caption: "the hall · ICRA 2026, Vienna",
  creditLabel: "our post on LinkedIn ↗",
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
    body: "Car spec, track, time trials and head-to-head races. IROS 2026 adds races with up to four cars on track.",
    slack: false,
  },
  {
    n: "02",
    title: "Register your team",
    body: "One form per team. Any team size, but no more than ten people in the race area during the event.",
    slack: false,
  },
  {
    n: "03",
    title: "Send the qualification video",
    body: "One minute of your car driving a track autonomously, with no human intervention.",
    slack: false,
  },
  {
    n: "04",
    title: "Talk to the organizers",
    body: "Schedules, track details and answers are posted in the competition channel.",
    slack: true,
  },
] as const;

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";

const LINK_ON_PAPER =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/**
 * Slack is never named without a way to reach it in the same breath, so the
 * invite is always the word itself.
 */
function SlackLine() {
  return (
    <p className="mt-2 text-body text-text-body">
      Ask us on{" "}
      <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className={LINK_ON_PAPER}>
        Slack
      </a>
      .
    </p>
  );
}

/**
 * /race - the page that turns a reader into a competitor.
 *
 * The next race opens the page instead of sitting as the third of three equal
 * cards, and the countdown runs to the registration deadline, which is the
 * date that actually costs a team its entry. Everything below it answers the
 * next question in order: how do I enter, what else is running this year, has
 * this been going long, who would I be racing, and who is fastest in class
 * right now.
 */
export default function RacePage() {
  const [upcoming, setUpcoming] = useState<SeasonEvent[]>([]);
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

  // The series ordinal of the last competition already run, read off the map
  // rather than typed into the copy, so the sentence cannot go stale on its
  // own. Four continents: Asia, Europe, North and South America, from the
  // host countries in events_map.json.
  const held = past.reduce((max, e) => Math.max(max, e.number ?? 0), 0);

  return (
    <>
      {/* Hero: the next race, not a page title over an empty band. */}
      <Section variant="ink" width="bleed" className="pt-[5.5rem] md:pt-[6.5625rem]">
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
              {held > 0 ? `${held} competitions` : "Competitions"} since 2016, on four continents.
              Any team with a car that drives itself can enter.
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
            {/* The spotlight is the tallest thing in the hero and it only
                exists once upcoming_events.json has landed. Without a
                reserved slot the whole page below jumps down the moment the
                fetch resolves (CLS 0.25 at 390). The reserve is deliberately
                a little under the panel's real height at every width we
                render, so it shrinks the jump without leaving a gap once the
                panel is in. */}
            <div className={`md:col-span-5${race ? "" : " min-h-[40rem]"}`}>
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
          subtitle="How to enter"
          lead="Each competition's own site has the details. In short:"
        />
        {/* The four steps, the buttons and the deadlines are all short, so they
            share the left half and the bridge shot takes the right rather than
            running full width and pushing the season out of view (Cedric,
            2026-08-23). */}
        <div className="grid items-start gap-x-10 gap-y-10 md:grid-cols-12">
        <div className="md:col-span-7">
        <Reveal stagger>
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {ENTRY_STEPS.map((step) => (
              <li key={step.n} className="border-t border-ink-950/10 pt-5">
                <p className="font-mono text-small text-text-muted">{step.n}</p>
                <h3 className="mt-3 font-display text-lead font-semibold text-text-strong">
                  {step.title}
                </h3>
                <p className="mt-2 text-body text-text-body">{step.body}</p>
                {step.slack && <SlackLine />}
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={race?.register_url ?? "#"} variant="primary" target="_blank" rel="noopener noreferrer">
            Register your team
          </Button>
          <Button href="/rules" variant="secondary">
            Read the rules
          </Button>
        </div>
        <dl className="mt-10 flex flex-col gap-2 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted">
          {race?.registration_deadline && (
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>registration closes</dt>
              <dd className="tabular-nums text-text-strong">{race.registration_deadline}</dd>
            </div>
          )}
          {race?.qualification_video_due && (
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>qualification video due</dt>
              <dd className="tabular-nums text-text-strong">{race.qualification_video_due}</dd>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt>questions</dt>
            <dd>
              <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className={LINK_ON_PAPER}>
                RoboRacer teams Slack
              </a>
            </dd>
          </div>
        </dl>
        </div>
        <MediaFrame
          src="/media/race/over-the-bridge-1200.webp"
          alt="A RoboRacer car crossing the raised wooden bridge section of the track, the race hall behind it"
          width={1200}
          height={750}
          aspect="16 / 10"
          className="md:col-span-5"
        />
        </div>
      </Section>

      <Section width="page" edge aria-labelledby="race-season" rule>
        <SectionHeader
          index="02"
          id="race-season"
          title="This season"
          subtitle="The rest of 2026"
          lead="Each race has its own site, registration and organizers."
        />
        <SeasonChain events={upcoming} map={mapEvents} />
      </Section>

      <Section width="page" aria-labelledby="race-history" rule>
        <SectionHeader
          index="03"
          id="race-history"
          title="Every race so far"
          subtitle="From Pittsburgh 2016 to Pittsburgh 2026"
          lead="Each one links to its site, or to an archived copy if the site is gone."
        />
        <RaceTimeline events={past} />
      </Section>

      <Section width="page" edge aria-labelledby="race-teams" rule>
        <SectionHeader
          index="04"
          id="race-teams"
          title="Who competes"
          subtitle="Teams racing in 2026"
          lead="Students, labs and companies race the same car spec. An unverified tag means we're still checking the details."
        />
        <TeamGrid teams={teams} />
      </Section>

      {/* The class leaderboard closes the page: after who races in the
          series, where the fastest laps are being set this week. It is a
          side door (simulator laps from one course, not a competition), so
          it sits below everything a team needs to enter. */}
      <Section id="leaderboard" width="page" aria-labelledby="race-leaderboard" rule>
        <SectionHeader
          index="05"
          id="race-leaderboard"
          title="Leaderboard"
          subtitle="The fastest laps in class at Penn"
          lead="Students in ESE 6150 race each lab in the grading simulator. These are their best clean laps."
        />
        <Leaderboard />
      </Section>
    </>
  );
}
