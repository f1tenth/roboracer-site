# News merge: what went in, what stayed out, what Cedric must settle

Branch `revamp/p3-news-merge` (2026-09-25). Cedric's note: "The news section is missing a lot of
content from the earlier days." Three candidate files were merged into `public/data/news.json`:
`candidates-web.json` (W), `candidates-linkedin.json` (L) and `candidates-drive.json` (D), all in
`docs/news/`. The generator is `docs/news/tools/merge_news.py` (one-shot; rebuild from
`git show 2850aa4:public/data/news.json`). Every new item carries `status: "published"` and a
`sources` string naming the candidate ids and URLs it was built from. A separate audit of the facts
in news.json is `docs/news/AUDIT.md`.

## Totals

news.json went from 22 items (2020 to 2026) to **75 items (2016 to 2026)**: 53 new, 22 kept.

| year | total | new | kept |
|---|---|---|---|
| 2026 | 18 | 2 | 16 |
| 2025 | 12 | 12 | 0 |
| 2024 | 15 | 13 | 2 |
| 2023 | 8 | 6 | 2 |
| 2022 | 4 | 4 | 0 |
| 2021 | 2 | 2 | 0 |
| 2020 | 6 | 4 | 2 |
| 2019 | 4 | 4 | 0 |
| 2018 | 4 | 4 | 0 |
| 2017 | 0 | 0 | 0 |
| 2016 | 2 | 2 | 0 |

No 2017 item: a 2017 race was announced (Behl's 2016 recap, the May 2017 homepage) but nothing shows
it ran, and every later count makes Porto 2018 the second competition.

One kept item changed: `iv2026-detroit-thunderbolt-wins` gained one sentence ("Thunderbolt also set
the fastest time-trial lap, 15.784 s.", D iv2026-time-trials) and a `sources` string. No other kept
item was edited. One kept item, `unc-the-fast-and-the-autonomous` (2020), is still `status: "verify"`
from before this merge; the page renders it like any other.

"Card" is what the archive shows: **photo** (a site-hosted image), **embed** (a "Show the LinkedIn
post" button, click to load), **text** (neither).

## Items added, by year

"+" means the sources were merged into one item.

### 2026 (2 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2026-09-24 | `iros2026-sim-league-siga-siga-wins` | Siga Siga Racing wins the sixth Sim Racing League, for IROS 2026 | embed | L iros2026-sim-league-results |
| 2026-09-06 | `vtc2026-boston-neobotics` | Neobotics and RoboRacer run the 30th competition, in Boston | embed | L vtc2026-boston-recap + D vtc2026-boston-30th (no winner named, see held) |

### 2025 (12 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2025-12-07 | `cdc-techfest-2025-sim-league-vaul-wins` | VAUL wins the fourth Sim Racing League | text | W cdc2025-race-cancelled-fourth-sim-league + L cdc2025-virtual-vaul-wins |
| 2025-11-06 | `iccas2025-unist-wins` | A UNIST team wins the fourth Korea Championship, at ICCAS 2025 | photo | W iccas2025-fourth-korea-championship-unist-wins + D iccas2025-korea-championship |
| 2025-10-13 | `roboracer-rules-repository-2025` | The race rules get one public, versioned home | text | W roboracer-rules-repo-2025 |
| 2025-10-06 | `techfest2025-26th-announced` | The 26th competition goes to Techfest at IIT Bombay | embed | L techfest2025-26th-announced + D techfest2025-iit-bombay-26th + W techfest2025-iit-bombay-first-roboracer |
| 2025-10-03 | `season-2025-26` | Six races on three continents for 2025-26 | embed | L season-2025-26-six-competitions + D season-2025-26-six-stages |
| 2025-06-23 | `iv2025-cluj-forzaeth-wins` | ForzaETH wins the 25th competition, at IEEE IV 2025 in Cluj-Napoca | text | W iv2025-cluj-forzaeth-wins (+ D iv2025-cluj-25th, L iv2025-call-for-teams as sources) |
| 2025-05-22 | `icra2025-atlanta-unibo-wins` | Unibo Motorsport wins the 24th competition, at ICRA 2025 in Atlanta | photo | W icra2025-atlanta-unibo-motorsport-wins + D icra2025-atlanta-results |
| 2025-05-13 | `icra2025-sim-league-vaul-wins` | VAUL wins the third Sim Racing League | text | W icra2025-third-sim-racing-league + L icra2025-sim-league-58-teams |
| 2025-04-09 | `iv2025-regular-event` | IEEE IV makes RoboRacer a regular event, starting in Cluj-Napoca | embed | L iv2025-call-for-teams + W iv2025-regular-event-announced + D iv2025-cluj-25th |
| 2025-03-12 | `tum-3d-lidar-kit-2025` | TUM releases a 3D lidar kit for the car | embed | L tum-3d-lidar-kit-2025 |
| 2025-02-19 | `icra2025-registration-opens` | Registration opens for the 24th competition, at ICRA 2025 in Atlanta | embed | L icra2025-24th-registration-open + L f1tenth-is-now-roboracer |
| 2025-01-13 | `dot-secretary-2025` | The US Transportation Secretary meets the cars | embed | L dot-secretary-meets-roboracer-2025 |

### 2024 (13 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2024-12-19 | `cdc2024-milan-scuderia-segfault-wins` | Scuderia Segfault wins the 22nd competition, at CDC 2024 in Milan | text | W cdc2024-milan-scuderia-segfault-wins + D cdc2024-milan-results + L cdc2024-22nd-announced + L cdc2024-team-fifth-fastest |
| 2024-12-08 | `cdc2024-sim-league-vaul-wins` | VAUL wins the second Sim Racing League | text | W cdc2024-second-sim-racing-league + D sim-racing-league-cdc2024-results + L cdc2024-sim-league-qualifiers |
| 2024-11-22 | `bu2024-lehigh-wins` | Lehigh's Mountain Hawks win the 23rd competition, at Boston University | text | W bu2024-lehigh-mountain-hawks-win + D bu2024-23rd |
| 2024-11-13 | `f1tenth-to-roboracer-announced` | F1TENTH announces its move to RoboRacer | text | W migration-f1tenth-to-roboracer + D rebrand-f1tenth-roboracer |
| 2024-10-29 | `korea2024-dong-a-wins` | Dong-A University wins the third Korea Championship | text | W korea2024-third-korea-championship + D korea2024-3rd-championship |
| 2024-10-17 | `iros2024-abudhabi-dzik-ultimate-wins` | Dzik Ultimate wins the 21st competition, at IROS 2024 in Abu Dhabi | text | W iros2024-abudhabi-dzik-ultimate-wins + L iros2024-scuderia-segfault-second + L iros2024-forzaeth-third + D iros2024-abu-dhabi-21st |
| 2024-10-06 | `iros2024-sim-league-first` | TURTLEBOT wins the first Sim Racing League | text | W iros2024-first-sim-racing-league + L iros2024-first-sim-league + D sim-racing-league-launch-iros2024 |
| 2024-09-18 | `sm2024-niagara-vaul-wins` | VAUL wins again at IEEE Smart Mobility 2024 in Niagara Falls | embed | L sm2024-vaul-keeps-title + W sm2024-niagara-vaul-retains-title + D sm2024-19th |
| 2024-05-30 | `iv2024-18th-announced` | The 18th competition heads to IEEE IV 2024 on Jeju | embed | L iv2024-18th-announced + D iv2024-jeju-18th (no result exists) |
| 2024-05-16 | `icra2024-yokohama-vaul-wins` | VAUL wins the 15th competition, at ICRA 2024 in Yokohama | text | W icra2024-yokohama-vaul-wins + L icra2024-15th-announced + L icra2024-19-teams + L icra2024-tier-iv-sponsor + L icra2024-lukasz-sztyber-trophy + D icra2024-yokohama-15th |
| 2024-05-16 | `cpsweek2024-hongkong-fsm-speed-wins` | CityU's FSM Speed wins the 17th competition, in Hong Kong | text | W cpsweek2024-hongkong-fsm-speed-wins + D cpsweek2024-hong-kong-17th |
| 2024-04-29 | `course2024-three-university-race` | Penn teams take first and second in a three-university race | text | W course2024-penn-cmu-lehigh-friendly-race + L penn-cmu-lehigh-grand-prix-2024 + D course2024-spring-race |
| 2024-02-14 | `power-board-2024` | A new power board for the car, ordered together | embed | L power-distribution-board-2024 + W ambimat-power-board-2024 |

### 2023 (6 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2023-10-20 | `tum-course-2023` | TUM starts a hands-on course with the car | embed | L tum-f1tenth-course-2023 |
| 2023-10-19 | `korea2023-hmcar-wins` | HMcar wins the second Korea Championship, at ICCAS 2023 | text | W korea2023-second-korea-championship-hmcar-wins |
| 2023-10-05 | `iros2023-detroit-vaul-wins` | Université Laval's VAUL wins the 14th competition, in Detroit | photo | W iros2023-detroit-vaul-wins + L iros2023-14th-grand-prix-livestream + D iros2023-detroit-14th |
| 2023-10-01 | `iros2023-madgames-workshop` | A first MAD-Games workshop on multi-agent racing, at IROS 2023 | embed | L iros2023-madgames-workshop + W iros2023-madgames-first-workshop |
| 2023-05-31 | `icra2023-london-forzaeth-wins` | ForzaETH wins at ICRA 2023 in London | embed | L icra2023-forzaeth-wins + L icra2023-scuderia-segfault-silver + W icra2023-london-forzaeth-wins + D icra2023-london-11th |
| 2023-05-09 | `cps2023-san-antonio-penn-wins` | Penn wins at CPS-IoT Week 2023 in San Antonio | text | W cps2023-san-antonio-penn-wins + L cps2023-12th-winners + D cps2023-san-antonio-12th |

### 2022 (4 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2022-12-13 | `korea2022-first-korea-championship` | Gyeongsang National University takes first and second at the first Korea Championship | text | W korea2022-first-korea-championship-ace2-wins |
| 2022-10-10 | `getting-started-2022` | Where to start: a tutorial, the lectures, the labs and a simulator | embed | L getting-started-kit-2022 |
| 2022-08-21 | `germany2022-forzaeth-wins` | ForzaETH wins the Grand Prix Germany at the Lausitzring | embed | L germany2022-forzaeth-gold |
| 2022-05-25 | `icra2022-philadelphia-scatterbrain-wins` | Penn's ScatterBrain wins the tenth competition, in Philadelphia | text | W icra2022-philadelphia-scatterbrain-wins + L icra2022-scuderia-segfault-third + L icra2022-fpv-drone-view |

### 2021 (2 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2021-10-01 | `iros2021-prague-scuderia-segfault-wins` | Scuderia Segfault wins the ninth competition, in Prague | text | W iros2021-prague-scuderia-segfault-wins |
| 2021-05-31 | `icra2021-racing-workshop` | A first workshop on autonomous racing, at ICRA 2021 | text | W icra2021-workshop-autonomous-racing + L icra2022-racing-workshop |

### 2020 (4 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2020-10-27 | `iros2020-virtual-hipert-wins` | HiPeRT Modena wins the eighth competition, online for IROS 2020 | text | W iros2020-virtual-hipert-wins |
| 2020-09-29 | `course-2020-recorded-online` | The full course, recorded and free online | text | W course-2020-recorded-course-online |
| 2020-07-16 | `ifac2020-virtual-tufast-wins` | TU Wien's TUfast TUfurious wins the seventh competition, run online | text | W ifac2020-virtual-tufast-wins |
| 2020-05-08 | `f1tenth-foundation-2020` | The project takes a new name: the F1TENTH Foundation | text | W f1tenth-foundation-named-2020 |

### 2019 (4 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2019-10-14 | `columbia2019-fifth-competition` | SeoulTech and Modena share the fastest lap at Columbia | photo | W columbia2019-fifth-grand-prix |
| 2019-08-15 | `nsf-community-platform-award-2019` | NSF funds the car as a shared platform for research and teaching | text | L nsf-community-platform-award-2019 + W press-wired-2019-nsf-fleet |
| 2019-04-16 | `cpsiot2019-montreal-unc-wins` | UNC Chapel Hill wins the fourth competition, in Montreal | photo | W cpsiot2019-montreal-unc-wins + W montreal2019-first-autonomous-overtake-video |
| 2019-03-01 | `f110-simulator-open-source-2019` | The racing simulator goes open source | embed | L f110-simulator-open-source-2019 + W roscon2019-f110-simulator-talk |

### 2018 (4 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2018-11-07 | `daily-pennsylvanian-2018-dining-hall` | Self-driving cars race through a Penn dining hall | text | W press-dp-2018-new-college-house-demo |
| 2018-10-01 | `esweek2018-torino-calvin-wins` | Team CALVIN from Warsaw wins the third competition, in Torino | photo | W esweek2018-torino-calvin-wins |
| 2018-05-14 | `uva-today-2018-final-exam-race` | At the University of Virginia, the final exam is a race | text | W press-uva-2018-racing-for-an-a |
| 2018-04-11 | `cpsweek2018-porto-ctu-wins` | Czech Technical University wins the second competition, in Porto | photo | W cpsweek2018-porto-ctu-wins |

### 2016 (2 new)

| date | id | title | card | built from |
|---|---|---|---|---|
| 2016-10-02 | `esweek2016-precise-racing-wins` | Penn's PRECISE Racing wins the first competition, in Pittsburgh | text | W esweek2016-precise-racing-wins-first-race |
| 2016-03-11 | `course-2016-first-lecture` | It started as a course, in March 2016 | text | W course-2016-open-source-course-launch + W build-2016-the-build-video-series |

### Link rules used

- `link` is the page that carries the story. `archive` is set only when the link itself is a Wayback
  capture (a dead race site), so a live old-site page is never replaced by its capture.
- An item carries `embed` only when its `link` is that LinkedIn post (18 items, the lead included).
- `status: "verify"` renders like published (newsData.ts: nothing renders it), so single-source
  winners were held out of news.json rather than added as verify.

## Held out, and why

| candidate | reason |
|---|---|
| VTC 2026 winner, Firebird (George Mason) (L vtc2026-firebird-wins) | Only a competitor's post (Connor McGovern, https://www.linkedin.com/posts/connor-mcgovern-215153431_just-wrapped-up-a-great-weekend-at-ieee-vtc-activity-7503610769708756992-xdIy); vtc2026-race.roboracer.ai answers 404. The VTC item names no winner. |
| IROS 2026 sponsors post (L iros2026-autoware-tier-iv-sponsors) | Content skill: never list a sponsor without Cedric's written confirmation. Same reason TIER IV is not named on the ICRA 2024 item (L icra2024-tier-iv-sponsor). |
| IROS 2026 orientation 2 (D iros2026-orientation-2) | Contradicts the content skill on ceremony time and place, registration close, dates, sponsors and fee amounts (contradiction 21). |
| ICRA 2027 3D-racing proposal (D icra2027-proposal-3d-racing) | A proposal, not news. |
| IV 2026 off-road demo (D iv2026-offroad-demo) | Scheduled; nothing shows it ran. |
| Slack 2,700 members (D community-slack-2700) | A marketing figure from a proposal (2,300+ in an older one). |
| ICRA 2026 one of ten competitions (D icra2026-one-of-ten-competitions) | From ICRA's internal status deck, marked sensitive by the Drive report. |
| CDC 2025 Rio planned (D cdc2025-rio-planned) | Status disputed (contradiction 5). The news item is the 4th Sim Racing League only. |
| Techfest 2025 podium | Search snippets only; the item is the announcement. |
| IV 2023 result (W iv2023-anchorage-eight-teams) | Only Suzlab's third place is sourced; no winner. |
| ESWeek 2022 Shanghai (W esweek2022-shanghai-in-person-race) | The results were two Challonge widgets with no capture; no winner. |
| ITSC 2024 (the 20th in events_map.json) | May not have run (contradiction 16). |
| IV 2024 result | Only the announcement exists (kept as `iv2024-18th-announced`). |
| ICRA 2024 runner-up | No source states the final; the item names no runner-up. |
| D ifac2026-busan-knockout (quarter-finalists) and the L enrichments for kept items (Cedric's own IV post, the ICRA 2026 kickoff, Mingguang Zhou's IFAC post, the IV 2026 call) | Not applied: kept items were left as they were apart from the one IV 2026 sentence. |
| Left out for length (lower priority) | L venture-cafe-talk-writeup-2019, learn-to-drive-tutorial-2022, penn-course-race-semester-2022, uva-course-first-autonomous-laps-2023, penn-students-race-video-2024, icra2025-ucf-ninth-of-25, neobotics-foundation-founded-2025, season-2026-four-competitions, roboracer-research-germany-2026; W openedx-2021-course-platform-and-build-series, esweek2021-learn-to-drive-and-race-lecture, eth-pbl-f1tenth-explainer-2022, press-assembly-2023-penn-program, season2024-eight-competitions. |

## Contradictions Cedric must settle

One line each; sources in brackets. Where a fact is contested, the items say nothing about it.

1. **2023 ordinals.** CPS-IoT San Antonio is "12th" and ICRA London "11th" on the race sites (cps2023-race, icra2023-race), Penn Engineering (2023-06-16), TUM (2023-03-30), TU Wien (2023-06-02) and the Drive posters; events_map.json (Cedric, 2026-08-23) swaps them by date. Both items carry no ordinal.
2. **UNICORN's university.** Content skill Teams section, Teams DB, ICRA 2025 participants page and TU Wien (2025) say UNIST; the skill's older seed line says "Team Unicorn (University of Bonn)" (Bonn's team is LAMARRacing). The ICRA 2025 item follows UNIST.
3. **Founding year.** Content skill and the archived about page: 2016 (course trailer: March 2016). Penn Engineering 2019: pilot course 2015; Madhur Behl 2023 LinkedIn: "since its inception in 2015"; Indy Autonomous Challenge: "since 2015"; newsletters 2024-05-16 "six years", 2024-11-13 "5 years". No item states a founding year; the 2016 course item dates the first lecture only.
4. **Team and participant counts** (all kept out of items): Porto 7 (old page, CTU) vs 8 (Behl); Torino 8 vs 9 (Behl); ICRA 2022 20 in the bracket vs 38 (TU Wien) vs 38 and 40 listed; ICRA 2023 41 registered (TU Wien) / 22 (Nagoya) / 24 and 130+ (proposal) / 150+ from 37 universities (poster); ICRA 2024 19 and 100+ / 18 in time trials (ForzaETH) / over 20 (TU Wien) / 14 attended (Teams DB) / 135+ / 150+; ICRA 2025 25 (TU Wien) / 26 listed / 19 registrants table / 20 (newsletter 2025-05-12) / 18 timed / 17 in the bracket (Drive sheet); Korea 2024 169 (press) vs 160 (video) people; 2nd sim league 51 and 170+ / 37 / 15; 3rd sim league 24 vs 25 countries; IFAC 2026 274 racers and 56 teams (Foundation post) vs 270 (ICRA 2027 proposal) vs 55 (Mingguang Zhou's post) vs 53 team names (photo archive); ICRA 2026 180+ and 35 (content skill, VERIFY) vs about 200 and 30 (news.json) vs 36 (ForzaETH) vs 29 attended (Teams DB); IV 2026 15 timed / 17 video submissions / 14 attended / 28.
5. **CDC 2025 Rio: held, virtual or cancelled.** CDC conference page: "will not be held" (cdc2025.ieeecss.org/events/competitions); Teams DB: "CDC 2025 (Canceled)"; events_map.json: virtual with a TODO; docs/media/RACE_PHOTOS.drive.md: "virtual race"; past_races.json and docs/EVENTS_VERIFICATION.md: "CDC 2025 Race" as held.
6. **IROS 2024 winner's team name.** Organizers' newsletter (2024-10-21) names Dzik Ultimate, TU Wien and ForzaETH confirm their own places, so the item is published; the Teams DB calls the team "Dzik One".
7. **IROS 2023 winner.** Race-site bracket (Challonge w6qar708, Wayback) and Université Laval's recap video: VAUL; Po-Jen Wang's bio in the IROS 2026 proposal: he "won" (autoware.org, per search snippets, lists him second with Autoware). The item follows the bracket.
8. **ICRA 2025 sim league winner.** AutoDRIVE's results table: VAUL; Po-Jen Wang's bio (ICRA 2025 application, IROS 2026 proposal): he won. The item follows AutoDRIVE.
9. **2nd sim league celebration.** December 16 (AutoDRIVE) vs December 19 (Drive deck); left out.
10. **IROS 2024 ordinal.** IROS 2024 proposal: "18th"; posters and events_map.json: 21st (18th is IV 2024). The item says 21st.
11. **Dates that differ by source.** First race Oct 1-2, 2016 at Wean Hall (Behl) vs Oct 2-7 (race.html, events_map.json, the conference week); IFAC 2020 July 15-16 (race page) vs August (Clemson video); Korea 2024 Oct 29-31 / 28-30 / 29-Nov 1 (card shows Oct 2024); IV 2024 June 3-5 vs 2-5; IV 2025 June 21-23 (call) / 22-23 (race site) / 22-25 (conference); ICCAS 2025 Nov 4-6 (Drive) vs 4-7 (conference); CDC 2025 Dec 9-11 / 9-12 / 10-12.
12. **Two "25th" competitions.** IV 2025 and the CDC 2025 race site both say 25th; AutoDRIVE gives 25 to CDC 2025 and 26 to Techfest; events_map.json gives 25 to IV 2025 (the one that ran).
13. **SM 2024 third place spelling.** "The Roaring Phenix" (Pomerleau) vs "The Roaring Phoenix" (newsletter); the item names the school only.
14. **CPS 2023 winner's name.** Rahul's LinkedIn post "Zheming Zhang" vs Penn Engineering "Jimmy Zhang".
15. **ICRA 2022 third place.** The bracket had no third-place match; TU Wien claims third for Scuderia Segfault (the other semi-finalist was Forza PBL).
16. **ITSC 2024 (the 20th).** No result anywhere; the race repo stops 2024-07-09; the banner of 2024-09-30 lists eight 2024 races without it; the October 2024 newsletters skip it. No item.
17. **Rename date.** Newsletter announced the move on 2024-11-13 (f1tenth.org redirects from 2024-11-09); Rahul wrote "F1Tenth is now RoboRacer.AI" on 2025-02-19; the startup guide says "rebranded in 2025"; the logo set dates to Jan-Feb 2025. The item is dated to the announcement.
18. **Top speed.** 50 mph (2019 LinkedIn article) vs 40 mph (2024 Penn video). Not used.
19. **Sponsors.** TIER IV (ICRA 2024, its own post) and Autoware Foundation plus TIER IV (IROS 2026, the Foundation's post and orientation 2's "TIER IV and AWF Trophies") vs the content skill's "no sponsor confirmed". Not named.
20. **Korea 2024 winner's team name** 확불 is not romanized; the Teams DB has no English name. The item names Dong-A University only.
21. **IROS 2026 (content skill vs Drive).** Ceremony Wed 16:00-18:00 in Room 301 (skill, handbook) vs 6-9 PM at CMU (orientation 2, schedule sheet); registration closes Sep 5 (skill) vs "Aug 11 - Sep 18" (orientation 2); public dates Sep 28-30 (skill) vs flyer Sep 27 - Oct 1; fee and subsidy amounts in the deck vs "never a dollar amount" (skill). Nothing from orientation 2 went in.
22. **"RoboRacer" on pre-2025 pages** is often a later edit (old site rewritten 2025-01-25, IV 2024 race site 2025-10-31). Pre-2025 items use no brand or F1TENTH, as sources from the time do.

## Images and their permission status

Rows NEWS-03 to NEWS-10 in `docs/ASSET_MANIFEST.md`. Encoded with Pillow WebP q82, native size or
downscaled, never upscaled; every one has width, height and alt in news.json.

| item | file | size | source | credit | permission |
|---|---|---|---|---|---|
| `cpsweek2018-porto-ctu-wins` | `public/media/news/news-porto2018-track-1080.webp` | 1080x720, 93 KB | old f1tenth.org gallery, `f1tenth.github.io/gallery/porto2018/porto2.jpg` | F1TENTH archive (photographer not recorded) | F1TENTH/RoboRacer own archive |
| `cpsiot2019-montreal-unc-wins` | `public/media/news/news-montreal2019-car-1080.webp` | 1080x810, 185 KB | `f1tenth.github.io/gallery/montreal2019/montreal3.jpg` | F1TENTH archive | own archive |
| `columbia2019-fifth-competition` | `public/media/news/news-columbia2019-cars-1080.webp` | 1080x810, 169 KB | `f1tenth.github.io/gallery/columbia2019/columbia1.jpg` | F1TENTH archive | own archive |
| `iros2023-detroit-vaul-wins` | `public/media/news/news-iros2023-race-1080.webp` | 1080x608, 123 KB | Drive `Old Banners, Flyers, Shirts, Stickers/Media to Use/IMG_3196.JPG` (EXIF 2023-10-04, IROS week) | RoboRacer organizers (photographer not recorded) | organisation-owned |
| `iv2024-18th-announced` (embed poster) | `public/media/news/news-iv2024-post-800.webp` | 800x418, 46 KB | the Foundation's LinkedIn post image | The Roboracer Foundation | own post |
| `icra2025-registration-opens` (embed poster) | `public/media/news/news-icra2025-post-1080.webp` | 1080x1529, 155 KB | the Foundation's LinkedIn post image | The Roboracer Foundation | own post |
| `season-2025-26` (embed poster) | `public/media/news/news-season2025-post-800.webp` | 800x418, 53 KB | the Foundation's LinkedIn post image (also Drive `IMG_1473.PNG`) | The Roboracer Foundation | own post |
| `techfest2025-26th-announced` (embed poster) | `public/media/news/news-techfest2025-post-1080.webp` | 1080x1529, 153 KB | the Foundation's LinkedIn post image | The Roboracer Foundation | own post |
| `esweek2018-torino-calvin-wins` | reused `public/media/race/esweek2018.webp` | | old-site `torino1.png` (the only Torino image) | F1TENTH archive | own archive (existing row) |
| `icra2025-atlanta-unibo-wins` | reused `public/media/race/icra2025.webp` | | added by Cedric, commit 58c6a8c | RoboRacer organizers | existing row |
| `iccas2025-unist-wins` | reused `public/media/race/iccas2025.webp` | | RACE-T-05, via Cedric | RoboRacer organizers | existing row; the same frame is in the Drive under a photographer's name (personal data per the Drive report) |

Third-party posts (everyone but the Foundation) have no image and no poster: their media is never
re-hosted. Skipped on purpose: IFAC host photos, ICCAS 2025 Drive photos (names in file names),
newsletter photos, every press or team photo.

## Open questions, with the default applied

1. 2023 ordinals (contradiction 1): which race was the 11th? Default: neither item carries an ordinal.
2. UNICORN (contradiction 2): fix the content skill's Bonn seed line? Default: UNIST everywhere.
3. Founding year (contradiction 3): Default: keep 2016; no item states it.
4. CDC 2025 (contradiction 5): held, virtual or cancelled? Default: the only CDC 2025 item is the sim league; the race is not called held.
5. VTC 2026 winner: publish Firebird (George Mason) once an organizer confirms? Default: no winner named.
6. IROS 2026 and ICRA 2024 sponsor posts: confirm sponsors in writing? Default: not named.
7. Newsletter photos for the 2024 races: may they be used? Default: no; those items stay text cards.
8. 2026 opens with four text cards and its photo posts sit behind the year's fold (items stay newest first within a year). Default: keep newest first.
9. The lead's LinkedIn embed still loads as the reader nears it (as Cedric approved); only the archive cards are click to load. Default: keep.
10. Ledger "Races" counts 34 tagged events (Korea, Germany, course races included) while /race says 30 competitions. Default: keep "Races".
11. The pre-merge item `unc-the-fast-and-the-autonomous` is still `status: "verify"` and renders like published. Default: leave to the fact audit (docs/news/AUDIT.md).
12. Lower-priority candidates left out for length (table above). Default: leave out.
