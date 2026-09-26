# /race copy pass, phase 2

Files: `src/pages/Race.tsx` and `src/components/race/*` (Leaderboard and its
loading, error and empty lines, leaderboardData, RaceTimeline, SeasonChain,
eventState, racePhotos). The spotlight panel is `ui/NextRaceSpotlight`, counted
in `docs/copy/landing.md`. Event names, dates, places and team results come
from the JSON and were not touched. Rules are numbered as in
`docs/copy/BRIEF.md`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| hero lead | {30} competitions since 2016, on four continents. Every one of them is open to any team that can build a car and drive it autonomously - undergraduates, research labs and companies race the same track under the same rules. | {30} competitions since 2016, on four continents. Any team with a car that drives itself can enter. | 1 (37 words), 2 (a hyphen standing in for an em dash, three nouns for rhythm). The who-races list is section 04's lead, so it is not lost |
| 01 step "Read the rules" | Vehicle specification, track, time trial, and the head-to-head format. IROS 2026 adds multi-agent racing with up to four cars on track. | Car spec, track, time trials and head-to-head races. IROS 2026 adds races with up to four cars on track. | 2 ("multi-agent" is our word, "up to four cars on track" says it), 4 |
| 01 step "Register your team" | One form per team. Teams may have any number of members, but at most ten are at the race space during the event. | One form per team. Any team size, but no more than ten people in the race area during the event. | 2 ("may have any number of members", "race space"). The ten stays. "Race space" is the handbook's term; if the lead wants it verbatim, put it back |
| 01 step 4, Slack line | Feel free to reach out on Slack. | Ask us on Slack. | 2 ("feel free to reach out" is filler; phase 1 cut the same line on /news) |
| 01 lead | All the information for each competition is on that competition's own site. In short: | Each competition's own site has the details. In short: | 1, 4 |
| 02 lead | Each competition has its own site, its own registration and its own organizing committee. | Each race has its own site, registration and organizers. | 2 (the "its own, its own, its own" rhythm) |
| 03 lead | Every competition so far, with a link to its site. If a site has gone offline, the link goes to an archived copy. | Each one links to its site, or to an archived copy if the site is gone. | 5 (repeats the title "Every race so far") |
| 04 lead | Undergraduate teams, research labs and companies, all racing the same car spec. An unverified tag means we are still confirming the details. | Students, labs and companies race the same car spec. An unverified tag means we're still checking the details. | 1 (23 words), 4 (verb early). Same tag sentence as the landing's Teams lead |

Layout note: the hero lead goes from three lines to two. It sits alone above
the video and the spotlight in a `max-w-3xl` block, so nothing lines up with
its bottom edge. The step bodies lose at most a line; the steps are a two-column
grid with `gap-y-10`, so a shorter card never leaves a gap beside a longer one
that wasn't there before.

Left alone on purpose:

- h1 "Come race with us", the eyebrow, the step titles ("Read the rules",
  "Register your team", "Send the qualification video", "Talk to the
  organizers"), both buttons and the deadline ledger ("registration closes",
  "qualification video due", "questions", "RoboRacer teams Slack").
- Step 3 body "One minute of your car driving a track autonomously, with no
  human intervention." It's the qualification rule, and it's already plain.
- Step 4 body "Schedules, track details and answers are posted in the
  competition channel."
- 02 "This season" / "The rest of 2026", 04 "Who competes" / "Teams racing in
  2026".
- 03 subtitle "From Pittsburgh 2016 to Pittsburgh 2026". The brief bans "from X
  to Y" as decoration; this one is the literal span of the list, first race to
  next race, and the same city twice is the point.
- 05 Leaderboard: "The fastest laps in class at Penn" and "Students in ESE 6150
  race each lab in the grading simulator. These are their best clean laps."
  (17 words, two facts). The component's lines: "See the full leaderboard ↗",
  "The lap times did not load here.", "No clean laps on the board yet this
  term.", "This board did not load here.", "Loading lap times", the table heads
  ("Rank", "Driver" / "Team", "Lap time"), the side ledger ("ranked", "lab
  closes" / "lab closed", "updated", "source") and the "just now" / "12 min
  ago" times. All short and plain; the error lines say what failed and the
  button under them is the way out.
- Timeline and season tags ("mad games", "workshop", "course race", "online",
  "archived page", "no page", "Live", "concluded", "next", "stream link to be
  confirmed", "watch ↗", "Show {n} earlier events, {from} to {to}").
- The eight race photo alt texts and the hero clip's alt, caption and credit
  link.

Count: 78 strings reviewed (37 in Race.tsx, 41 in the race components: Leaderboard
and leaderboardData 20, RaceTimeline 8, racePhotos 8, eventState 4, SeasonChain
1), 8 changed (all in Race.tsx), 70 left.
