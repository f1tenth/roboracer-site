# News merge checkpoint (p3-news-merge, 2026-09-25)

Branch `revamp/p3-news-merge`, worktree `../roboracer-site-wt/p3-news-merge`, dev port 4188,
taskmap n285 (subtasks n318 select, n319 write, n320 images: done; n321 QA + MERGE.md: open).
Data, images, page code and QA captures are committed in `774c648`. What is left is at the end.

## State

- `public/data/news.json`: 75 items (22 existing + 53 new), `updated` 2026-09-25, sorted newest first.
  By year: 2016 2, 2018 4, 2019 4, 2020 6, 2021 2, 2022 4, 2023 8, 2024 15, 2025 12, 2026 18.
  Every new item has `status: "published"` and a `sources` string naming the candidate ids and URLs.
- The generator is `docs/news/tools/merge_news.py` (one-shot: it asserts that new ids are absent, so
  it fails if re-run on the merged file; run it against `git show 2850aa4:public/data/news.json` to
  rebuild). Link check: `docs/news/tools/linkcheck.py` (result `links-2026-09-25.json`). QA:
  `docs/news/tools/qa_news.py`, `qa_blocked.py`, `qa_blocked2.py` (report `docs/qa/p3-news-merge/report.json`).
- Raw downloads in `docs/news/_intake/` (git-ignored line added to `.gitignore`).
- `status: "verify"` renders like published (newsData.ts: "nothing renders it"), so single-source
  winners were HELD OUT of news.json, not added as verify.

## Selected items, in news.json order (new ones only)

Source file abbreviations: L = candidates-linkedin.json, D = candidates-drive.json, W = candidates-web.json.
"+" means merged into the same item.

| date | news.json id | built from |
|---|---|---|
| 2026-09-24 | iros2026-sim-league-siga-siga-wins | L iros2026-sim-league-results |
| 2026-09-06 | vtc2026-boston-neobotics | L vtc2026-boston-recap + D vtc2026-boston-30th (winner held, see below) |
| 2025-12-07 | cdc-techfest-2025-sim-league-vaul-wins | W cdc2025-race-cancelled-fourth-sim-league + L cdc2025-virtual-vaul-wins |
| 2025-11-06 | iccas2025-unist-wins | W iccas2025-fourth-korea-championship-unist-wins + D iccas2025-korea-championship |
| 2025-10-13 | roboracer-rules-repository-2025 | W roboracer-rules-repo-2025 |
| 2025-10-06 | techfest2025-26th-announced | L techfest2025-26th-announced + D techfest2025-iit-bombay-26th + W techfest2025-iit-bombay-first-roboracer |
| 2025-10-03 | season-2025-26 | L season-2025-26-six-competitions + D season-2025-26-six-stages |
| 2025-06-23 | iv2025-cluj-forzaeth-wins | W iv2025-cluj-forzaeth-wins (+ D iv2025-cluj-25th, L iv2025-call-for-teams as sources) |
| 2025-05-22 | icra2025-atlanta-unibo-wins | W icra2025-atlanta-unibo-motorsport-wins + D icra2025-atlanta-results |
| 2025-05-13 | icra2025-sim-league-vaul-wins | W icra2025-third-sim-racing-league + L icra2025-sim-league-58-teams |
| 2025-04-09 | iv2025-regular-event | L iv2025-call-for-teams + W iv2025-regular-event-announced + D iv2025-cluj-25th |
| 2025-03-12 | tum-3d-lidar-kit-2025 | L tum-3d-lidar-kit-2025 |
| 2025-02-19 | icra2025-registration-opens | L icra2025-24th-registration-open + L f1tenth-is-now-roboracer |
| 2025-01-13 | dot-secretary-2025 | L dot-secretary-meets-roboracer-2025 |
| 2024-12-19 | cdc2024-milan-scuderia-segfault-wins | W cdc2024-milan-scuderia-segfault-wins + D cdc2024-milan-results + L cdc2024-22nd-announced + L cdc2024-team-fifth-fastest |
| 2024-12-08 | cdc2024-sim-league-vaul-wins | W cdc2024-second-sim-racing-league + D sim-racing-league-cdc2024-results + L cdc2024-sim-league-qualifiers |
| 2024-11-22 | bu2024-lehigh-wins | W bu2024-lehigh-mountain-hawks-win + D bu2024-23rd |
| 2024-11-13 | f1tenth-to-roboracer-announced | W migration-f1tenth-to-roboracer + D rebrand-f1tenth-roboracer |
| 2024-10-29 | korea2024-dong-a-wins | W korea2024-third-korea-championship + D korea2024-3rd-championship |
| 2024-10-17 | iros2024-abudhabi-dzik-ultimate-wins | W iros2024-abudhabi-dzik-ultimate-wins + L iros2024-scuderia-segfault-second + L iros2024-forzaeth-third + D iros2024-abu-dhabi-21st |
| 2024-10-06 | iros2024-sim-league-first | W iros2024-first-sim-racing-league + L iros2024-first-sim-league + D sim-racing-league-launch-iros2024 |
| 2024-09-18 | sm2024-niagara-vaul-wins | L sm2024-vaul-keeps-title + W sm2024-niagara-vaul-retains-title + D sm2024-19th |
| 2024-05-30 | iv2024-18th-announced | L iv2024-18th-announced + D iv2024-jeju-18th (no result exists) |
| 2024-05-16 | icra2024-yokohama-vaul-wins | W icra2024-yokohama-vaul-wins + L icra2024-15th-announced + L icra2024-19-teams + L icra2024-tier-iv-sponsor + L icra2024-lukasz-sztyber-trophy + D icra2024-yokohama-15th |
| 2024-05-16 | cpsweek2024-hongkong-fsm-speed-wins | W cpsweek2024-hongkong-fsm-speed-wins + D cpsweek2024-hong-kong-17th |
| 2024-04-29 | course2024-three-university-race | W course2024-penn-cmu-lehigh-friendly-race + L penn-cmu-lehigh-grand-prix-2024 + D course2024-spring-race |
| 2024-02-14 | power-board-2024 | L power-distribution-board-2024 + W ambimat-power-board-2024 |
| 2023-10-20 | tum-course-2023 | L tum-f1tenth-course-2023 |
| 2023-10-19 | korea2023-hmcar-wins | W korea2023-second-korea-championship-hmcar-wins |
| 2023-10-05 | iros2023-detroit-vaul-wins | W iros2023-detroit-vaul-wins + L iros2023-14th-grand-prix-livestream + D iros2023-detroit-14th |
| 2023-10-01 | iros2023-madgames-workshop | L iros2023-madgames-workshop + W iros2023-madgames-first-workshop |
| 2023-05-31 | icra2023-london-forzaeth-wins | L icra2023-forzaeth-wins + L icra2023-scuderia-segfault-silver + W icra2023-london-forzaeth-wins + D icra2023-london-11th |
| 2023-05-09 | cps2023-san-antonio-penn-wins | W cps2023-san-antonio-penn-wins + L cps2023-12th-winners + D cps2023-san-antonio-12th |
| 2022-12-13 | korea2022-first-korea-championship | W korea2022-first-korea-championship-ace2-wins |
| 2022-10-10 | getting-started-2022 | L getting-started-kit-2022 |
| 2022-08-21 | germany2022-forzaeth-wins | L germany2022-forzaeth-gold |
| 2022-05-25 | icra2022-philadelphia-scatterbrain-wins | W icra2022-philadelphia-scatterbrain-wins + L icra2022-scuderia-segfault-third + L icra2022-fpv-drone-view |
| 2021-10-01 | iros2021-prague-scuderia-segfault-wins | W iros2021-prague-scuderia-segfault-wins |
| 2021-05-31 | icra2021-racing-workshop | W icra2021-workshop-autonomous-racing + L icra2022-racing-workshop |
| 2020-10-27 | iros2020-virtual-hipert-wins | W iros2020-virtual-hipert-wins |
| 2020-09-29 | course-2020-recorded-online | W course-2020-recorded-course-online |
| 2020-07-16 | ifac2020-virtual-tufast-wins | W ifac2020-virtual-tufast-wins |
| 2020-05-08 | f1tenth-foundation-2020 | W f1tenth-foundation-named-2020 |
| 2019-10-14 | columbia2019-fifth-competition | W columbia2019-fifth-grand-prix |
| 2019-08-15 | nsf-community-platform-award-2019 | L nsf-community-platform-award-2019 + W press-wired-2019-nsf-fleet |
| 2019-04-16 | cpsiot2019-montreal-unc-wins | W cpsiot2019-montreal-unc-wins + W montreal2019-first-autonomous-overtake-video |
| 2019-03-01 | f110-simulator-open-source-2019 | L f110-simulator-open-source-2019 + W roscon2019-f110-simulator-talk |
| 2018-11-07 | daily-pennsylvanian-2018-dining-hall | W press-dp-2018-new-college-house-demo |
| 2018-10-01 | esweek2018-torino-calvin-wins | W esweek2018-torino-calvin-wins |
| 2018-05-14 | uva-today-2018-final-exam-race | W press-uva-2018-racing-for-an-a |
| 2018-04-11 | cpsweek2018-porto-ctu-wins | W cpsweek2018-porto-ctu-wins |
| 2016-10-02 | esweek2016-precise-racing-wins | W esweek2016-precise-racing-wins-first-race |
| 2016-03-11 | course-2016-first-lecture | W course-2016-open-source-course-launch + W build-2016-the-build-video-series |

Existing item changed: `iv2026-detroit-thunderbolt-wins` gained one sentence ("Thunderbolt also set
the fastest time-trial lap, 15.784 s.", D iv2026-time-trials) and a `sources` string. No other
existing item was edited. D ifac2026-busan-knockout (quarter-finalists) and the L enrichments
(Cedric's own IV post, the ICRA 2026 kickoff, Mingguang Zhou's IFAC post, the IV 2026 call) were
not applied.

Link rules used: `link` is the page that carries the story; `archive` is set only when it equals a
Wayback link (dead race sites), so a live old-site page is never replaced by its capture. An item
carries `embed` only when its `link` is that LinkedIn post (17 items).

## Held out of news.json, and why

- VTC 2026 winner Firebird (George Mason): only a competitor's post (L vtc2026-firebird-wins, Connor
  McGovern); vtc2026-race.roboracer.ai answers 404. The VTC item names no winner.
- IROS 2026 sponsors post (L iros2026-autoware-tier-iv-sponsors): content skill, never list a sponsor
  without Cedric's written confirmation. Same reason TIER IV is not named on the ICRA 2024 item.
- IROS 2026 orientation 2 (D iros2026-orientation-2): contradicts the content skill (ceremony time and
  place, registration close, dates, sponsors, fee amounts).
- ICRA 2027 3D-racing proposal (D icra2027-proposal-3d-racing): proposal only.
- IV 2026 off-road demo (D iv2026-offroad-demo): scheduled, not shown to have run.
- Slack 2,700 members (D community-slack-2700): proposal marketing figure.
- ICRA 2026 one of ten competitions (D icra2026-one-of-ten-competitions): from ICRA's internal deck,
  listed as sensitive by the drive report.
- CDC 2025 Rio planned (D cdc2025-rio-planned): status disputed (see contradictions).
- Techfest 2025 podium: search snippets only; the item is the announcement.
- Competitions with no sourced winner: IV 2023 (Suzlab third only, W iv2023-anchorage-eight-teams),
  ESWeek 2022 (W esweek2022-shanghai-in-person-race), ITSC 2024 (may not have run), IV 2024 (only the
  announcement is in), ICRA 2024 runner-up.
- Lower priority, left out for length: L venture-cafe-talk-writeup-2019, learn-to-drive-tutorial-2022,
  penn-course-race-semester-2022, uva-course-first-autonomous-laps-2023, penn-students-race-video-2024,
  icra2025-ucf-ninth-of-25, neobotics-foundation-founded-2025, season-2026-four-competitions,
  roboracer-research-germany-2026; W openedx-2021-course-platform-and-build-series,
  esweek2021-learn-to-drive-and-race-lecture, eth-pbl-f1tenth-explainer-2022,
  press-assembly-2023-penn-program, season2024-eight-competitions.

## Images (all done; manifest rows NEWS-03 to NEWS-10 in docs/ASSET_MANIFEST.md)

| item | file | source | credit / permission |
|---|---|---|---|
| cpsweek2018-porto-ctu-wins | news-porto2018-track-1080.webp (1080x720, 93 KB) | https://f1tenth.github.io/gallery/porto2018/porto2.jpg | F1TENTH archive; F1TENTH/RoboRacer own archive |
| cpsiot2019-montreal-unc-wins | news-montreal2019-car-1080.webp (1080x810, 185 KB) | https://f1tenth.github.io/gallery/montreal2019/montreal3.jpg | F1TENTH archive; own archive |
| columbia2019-fifth-competition | news-columbia2019-cars-1080.webp (1080x810, 169 KB) | https://f1tenth.github.io/gallery/columbia2019/columbia1.jpg | F1TENTH archive; own archive |
| iros2023-detroit-vaul-wins | news-iros2023-race-1080.webp (1080x608, 123 KB) | rr:"Old Banners, Flyers, Shirts, Stickers/Media to Use/IMG_3196.JPG" (EXIF 2023-10-04) | RoboRacer organizers, photographer not recorded; organisation-owned |
| iv2024-18th-announced (embed poster) | news-iv2024-post-800.webp | the Foundation's own post image | The Roboracer Foundation; own post |
| icra2025-registration-opens (poster) | news-icra2025-post-1080.webp | the Foundation's own post image | own post |
| season-2025-26 (poster) | news-season2025-post-800.webp | the Foundation's own post image | own post |
| techfest2025-26th-announced (poster) | news-techfest2025-post-1080.webp | the Foundation's own post image | own post |
| esweek2018-torino-calvin-wins | reused public/media/race/esweek2018.webp | old-site torino1.png (only Torino image) | F1TENTH archive |
| icra2025-atlanta-unibo-wins | reused public/media/race/icra2025.webp | added by Cedric, commit 58c6a8c | RoboRacer organizers, photographer not recorded |
| iccas2025-unist-wins | reused public/media/race/iccas2025.webp | RACE-T-05, via Cedric | RoboRacer organizers; the same frame is in the Drive under a photographer's name (personal data per the drive report) |

No other image is planned. Third-party posts (everyone but the Foundation) have no image.
Skipped on purpose: IFAC host photos, ICCAS 2025 Drive photos (names in file names), newsletter
photos (ask Cedric), every press or team photo.

## Page work (done, committed)

- `newsData.ts`: `NewsEmbed.poster` optional; `sources` typed; `eventLabel` reads ESWeek, CPS Week,
  CPS-IoT Week, Columbia, Germany, Korea, Techfest, Course race.
- `LinkedInEmbed.tsx`: renders without a poster (title and "Open the post on LinkedIn" on paper, top
  aligned); `load="near"` (the lead, unchanged) or `"now"`.
- `NewsCard.tsx`: `PostToggle`, a "Show the LinkedIn post" button (aria-expanded) that mounts the
  frame in the card. Nothing loads from linkedin.com for cards before a click (verified: embed
  requests 1 before, the lead's; 2 after one click).
- `News.tsx`: `YearGroup` with the /research fold: four per year at every size, the rest in a
  native `<details>` ("Show 13 more from 2026"); on a phone (`!useDesktop()`) years after the two
  newest are closed ("Show 15 from 2024"); a chip filter shows every match unfolded. Chips only for
  competitions with two or more items (8 plus All). Ledger label "Competitions" became "Races" (34
  tagged events include unnumbered Korea, Germany and course races; /race says 30 competitions).

## QA done (report.json)

Heights: 1536x730 10,438 px; 1366x650 9,778; 1920x1080 13,034; 768x1024 13,729; 390x844 9,219;
844x390 6,903. One h1 at every size; no console errors; axe (1536 and 390) zero serious or critical;
every image has alt and width/height; reduced motion at 390: all cards opaque. LinkedIn blocked:
the no-poster placeholder and the Techfest poster both show (captures `*-embed-blocked-*.png`).
Link check (113 URLs): every new `link`, `archive` and embed src answers 2xx. Not 2xx: the two
existing items' links (endeavors.unc.edu refuses, its archive works; medium.com 403 to scripts
only) and LinkedIn profile `author_url`s (429 to curl). Screens are git-ignored PNGs in
docs/qa/p3-news-merge/ (plus `*-full-small.jpg` walks, untracked on purpose).

## Contradictions for Cedric (to copy into MERGE.md)

1. 2023 ordinals: race sites, Penn Engineering, TUM, TU Wien and the Drive posters call CPS-IoT San
   Antonio the 12th and ICRA London the 11th; events_map.json (Cedric, 2026-08-23) the reverse. Both
   items carry no ordinal.
2. UNICORN: content skill Teams section and Teams DB say UNIST; the skill's older seed line says
   University of Bonn. Followed UNIST (ICRA 2025 item).
3. Founding year: Penn Engineering 2019 (pilot course 2015), Madhur Behl 2023 ("since its inception in
   2015"), Indy Autonomous Challenge ("since 2015"), newsletters ("5 years", "six years"); content
   skill 2016. No item states a founding year; the 2016 course item dates the first lecture only.
4. Team counts kept out: Porto 7 vs 8; Torino 8 vs 9; ICRA 2022 20 bracket / 38 (TU Wien) / 38+40
   listed; ICRA 2023 41 / 22 / 24 and 130+ / 150+ from 37; ICRA 2024 19 and 100+ / 18 / over 20 / 14 /
   135+ / 150+; ICRA 2025 25 / 26 / 19 / 20 / 18 timed / 17 bracket; Korea 2024 169 vs 160 people;
   2nd sim league 51 and 170+ / 37 / 15; 3rd sim league 24 vs 25 countries; IFAC 2026 274 and 56 vs
   270 vs 55 vs 53 names; ICRA 2026 180+ and 35 (VERIFY) vs about 200 and 30 vs 36 vs 29; IV 2026
   15 / 17 / 14 / 28.
5. CDC 2025: CDC conference page "will not be held"; Teams DB "Canceled"; events_map.json "virtual"
   with a TODO; RACE_PHOTOS "virtual race"; past_races.json lists "CDC 2025 Race". The news item is
   the 4th Sim Racing League only.
6. IROS 2024 winner: the brief expected it to rest on one competitor post; the organizers' newsletter
   (2024-10-21) names Dzik Ultimate, TU Wien and ForzaETH confirm their own places, so it is
   published. Teams DB calls the team "Dzik One".
7. IROS 2023 winner: race-site bracket VAUL; Po-Jen Wang's bio (IROS 2026 proposal) says he won.
8. ICRA 2025 sim league: AutoDRIVE table VAUL; Po-Jen Wang's bio says he won.
9. 2nd sim league celebration December 16 (AutoDRIVE) vs December 19 (deck); left out.
10. IROS 2024 ordinal: proposal "18th", posters and events_map 21st.
11. Dates: Pittsburgh race Oct 1-2 vs conference week Oct 2-7; IFAC 2020 July 15-16 vs August
    (Clemson video); Korea 2024 Oct 29-31 / 28-30 / 29-Nov 1 (card shows Oct 2024); IV 2024 June 3-5
    vs 2-5; IV 2025 June 21-23 / 22-23 / 22-25; ICCAS 2025 Nov 4-6 vs 4-7.
12. IV 2025 and CDC 2025 race sites both say "25th"; events_map gives 25 to IV 2025.
13. SM 2024 third place spelled "The Roaring Phenix" (Pomerleau) and "The Roaring Phoenix"
    (newsletter); the item names the school only.
14. CPS 2023 winners: Rahul's post "Zheming Zhang", Penn Engineering "Jimmy Zhang".
15. ICRA 2022 third place: the bracket had no third-place match; TU Wien claims third.
16. ITSC 2024 (20th) may not have run: no result anywhere, a banner dropped it.
17. Rename: newsletter announced the move on 2024-11-13, Rahul wrote "F1Tenth is now RoboRacer.AI"
    on 2025-02-19, the startup guide says "rebranded in 2025", the logo set dates to Jan-Feb 2025.
18. Top speed 50 mph (2019) vs 40 mph (2024): not used.
19. TIER IV (ICRA 2024) and Autoware Foundation plus TIER IV (IROS 2026) sponsor posts: not named.
20. Korea 2024 winner's name 확불 is not romanized; the Teams DB has no English name for it.

## What is left

1. Write `docs/news/MERGE.md` (brief step 6): added by year (the table above grouped by year), held
   and why, the contradictions above one line each, images with permission status (table above).
2. Write the QA note `docs/qa/p3-news-merge.md` from "QA done" above; glance at the 1366, 768 and
   844x390 captures (only 1536 and 390 were looked at closely).
3. Run `npm run build` (lint and `tsc -b` passed; the Vite build was not run yet).
4. Commit, then report to the lead. Open questions to raise: pictures within a year stay
   chronological, so 2026 opens with four text cards and its photo posts sit behind the fold (default:
   keep "newest first"); the lead's embed still auto-loads near the viewport as Cedric approved, only
   cards are click-to-load (default: keep); newsletter photos for 2024 races need Cedric's OK.
