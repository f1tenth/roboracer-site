# /about copy pass, phase 2

Files: `src/pages/About.tsx` and `src/components/about/*` (PartnerWall,
PlatformList, PeopleGroup, PersonCard, ContributorStrip, SpinoffGrid,
VerifyTag). The platform rows are `public/data/platform.json` and the spinoff
cards are `public/data/spinoffs.json`; each has its own table. People's names
and titles in `people.json` are facts from their sources and were not touched.
Rules are numbered as in `docs/copy/BRIEF.md`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| hero lead | RoboRacer, formerly F1TENTH, is an international community of researchers, engineers and students around a one-tenth-scale open-source autonomous race car. It started at the University of Pennsylvania in 2016 and now runs a competition series at the major robotics conferences. | RoboRacer, formerly F1TENTH, is an autonomous race car at one-tenth scale, and the community that builds and races it. | 1 (41 words), 2 (three nouns for rhythm), 4 (noun pile). Penn and 2016 sit in the ledger line beside it and in section 01; open source is in the h1; the competitions are in the counters and in section 01 |
| hero ledger link | the Scholar query ↗ | the Google Scholar search ↗ | 2 ("query"); matches /research and the landing |
| 01 subtitle | One open car design, used for teaching, research and racing | One open car for teaching, research and racing | 1, 4 (filler: "design, used for") |
| 01 paragraph 1 | RoboRacer started at the University of Pennsylvania in 2016 under the name F1TENTH. Rahul Mangharam leads it … | RoboRacer started at the University of Pennsylvania in 2016. Rahul Mangharam leads it … | 7 (the hero already says "formerly F1TENTH"; the name change once per page). The Behl sentence and its source link are unchanged |
| 01 paragraph 2 | The car is a one-tenth-scale autonomous race car. Its hardware design, its software stack and its simulator are open source, so a lab builds one rather than buys one. | The car's hardware, software and simulator are open source, so a lab builds its own instead of buying one. | 2 (the "its X, its Y and its Z" rhythm), 5 (the first sentence repeats the hero lead) |
| 01 paragraph 3 | The courses built around it teach the foundations of autonomy and the analytical skills to recognize and reason about situations with moral content in the design of autonomous systems. | The course built around it teaches perception, localization, planning and control. It also covers moral decision making in autonomous systems. | 1 (30 words), 3 ("foundations of autonomy" becomes the course's own module list, from paths.json; "moral decision making" is the name of the Module F topic) |
| 03 People lead | Titles come from each person's own university page, or from the organizing committee of the race they run. Click a name to go there. A verify tag means we still need to confirm the role. | Each name links to the page its title comes from. A verify tag means we haven't confirmed the role yet. | 1 (36 words, three sentences), 5. Keeps both facts: where titles come from, what the tag means |
| 03 Faculty lead | Faculty who lead the platform and sit on the competitions' organizing committees. | They lead the platform and sit on the organizing committees of the races. | 5 (repeats the "Faculty and advisors" heading) |
| 03 Contributors, empty/error line | contributors.json did not load | The contributor list didn't load. | 2 (a file name is not something a reader knows) |
| 03 Past crew lead | Everyone from earlier team rosters, taken from the old F1TENTH about page. Their roles still need confirming, hence the verify tags. | Earlier team members, from the old F1TENTH about page. Their roles aren't confirmed yet. | 2 ("hence"), 5 (the tags are visible on every card) |
| 04 title | Our Partners | Our partners | 6 (sentence case) |
| 04 subtitle | The institutions that run the platform | Institutions that use the car | fact: partners use the platform, they don't run it (content skill: "Partners are institutions that use the platform, not sponsors") |
| 04 lead | Universities, companies and organizations that teach and do research with RoboRacer. Alphabetical within each group. | They teach and do research with it. Alphabetical in each group. | 5 (the three group headings below are Universities, Industry, Organizations) |
| 06 Videos lead | A freshman's first year with the car, one-minute interviews with the ICRA 2026 teams, race highlights, the course lectures and the build guide. | Start with a freshman's first year with the car. | 2 (five-item list), 5 (every video below has its own heading saying this) |

Layout note: the hero lead drops from four lines to two at desktop. It sits in
the left column (7 of 12) beside the counters (5 of 12), which were already
taller than the h1 and lead, so the gap under the lead grows by about two
lines before the YouTube reel starts. The reel spans both columns, so the hole
is only in the left column. If Cedric wants that column filled, the fix is a
layout one (align the columns to the bottom), not more words.

Left alone on purpose:

- h1 "Open-source autonomous racing since 2016", the eyebrow, the ledger labels
  and "founded 2016, University of Pennsylvania".
- 01 paragraph 1 after the first sentence (Mangharam, xLAB, Behl and the
  source link) and paragraph 4 (90+ universities, 20+ countries, a thousand
  publications, 30 competitions, IROS 2026 dates): plain, every clause a fact.
- 02 "The platform" / "Build, Learn, Race, Research" / "The four parts of
  RoboRacer. Each has its own page.": short and it tells the reader something.
- 03 "People", "Who runs RoboRacer", "Developers" and its lead (names the five
  institutions), "Contributors" and its paragraph, "active · committed since
  …", "earlier · …".
- 05 Spinoffs: title, subtitle and "{Three} so far. A verify tag means the
  people involved have not confirmed our wording yet." The lead reviewed that
  line on 2026-09-24 (75b3e5b).
- 06 "Videos" / "Races, teams and the course".
- The group photo caption "group pic ICRA 2026": informal, but it came with
  Cedric's "honest caption" commit (c22450d), so it's his wording.
- Components: the partner group headings ("Universities", "Industry",
  "Organizations", "Other", "Also using the platform"), "media pending",
  "verify", "since", "origin".

Count: 56 strings reviewed (46 in About.tsx, 10 in the about components),
14 changed (all in About.tsx), 42 left.
