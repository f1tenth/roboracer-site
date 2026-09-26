# News candidates from the RoboRacer Events Drive

Date: 2026-09-25. Branch `revamp/p3-news-drive`, taskmap node n283. Requested by Cedric
(2026-09-25): "The news section is missing a lot of content from the earlier days ... check the
RoboRacer Events drive as well that has info."

Outputs:

- `docs/news/candidates-drive.json`: 31 candidates in the brief's schema (`id, date, title, excerpt,
  kind, event, link, source_paths, image_candidates, facts, confidence, notes`), newest first. Nothing
  here is rendered; `public/data/news.json` is untouched.
- this file: coverage, the event table, contradictions, link checks, folders not opened, and the files
  nobody should publish.

## Method

- Source: the shared drive "RoboRacer Events" via rclone remote `rr:` (read-only). Full listing:
  12,160 entries. Documents, sheets, PDFs, decks and flyers (about 70 files) were copied to the
  session scratchpad and read as text (openpyxl for sheets, raw OOXML for docx/pptx, pdftotext for PDFs).
  Registration and contact sheets were read for counts only; emails and phone numbers were masked
  on extraction and appear nowhere in the outputs.
- The `2026 ICRA` folder is no longer listed at the Drive root, but the ID the content skill and the
  Claude Context doc give for it (`1LTFuOuW9374vg4iv-HSlxyll7o5qiKxk`) still opens. Its files are cited as
  `rr:[2026 ICRA, folder id 1LTFuOuW9374vg4iv-HSlxyll7o5qiKxk]/...`. Its `Registration`, `Feedback`,
  `Example Application`, `SIM Racing League Proposal` and `SIM Racing League Certificate Examples`
  subfolders list as empty to this account.
- Photo folders were listed with sizes and dates, never downloaded; at most three candidates per event
  were picked by folder name, filename, date and size. `Posters 2026` and `Old Banners .../Media to Use`
  were viewed from the existing local mirror (`_harvest/drive/`, read-only); EXIF dates were read there.
- Public links were checked with curl on 2026-09-25 (see "Link checks").
- Every fact in the JSON carries the file that states it. Where a fact comes from the repo rather than the
  Drive (for example `docs/content/teams.sheet.json`), the fact says so.

## What the Drive covers, by year

- **2015 to 2022**: no event files. Only the history line in the proposals' appendix ("[2015,2018]
  Embedded Systems Week; [2016,2018,2019] Cyber-Physical Systems Week; [2020] IFAC World Congress; ICRA
  2020 onward; IROS 2022-2024; 2024 ITSC; 2024 CDC"), "ICRA'22 Philadelphia (100+ participants and 20
  teams)" in the ICRA 2025 application, and two F1TENTH stand-up banners created 2022-04-27. Two photos
  of a car on an outdoor racetrack are dated 2019-04-21 by EXIF (event not recorded).
- **2023**: dated posters for the 11th (ICRA London), 12th (CPS-IoT San Antonio), IV 2023 Anchorage and
  14th (IROS Detroit); one IROS-week photo; participant claims on a poster and in a proposal.
- **2024**: the richest historical year. Posters for the Spring 2024 course race and the 15th, 17th to 23rd
  and the 3rd Korea Championship; the IROS 2024 proposal; the IV 2024 run-of-show; the full CDC 2024
  (22nd) timing and bracket workbook with a podium; the 2nd F1TENTH Sim Racing League deck with a podium.
- **2025**: the ICRA 2025 (24th) timing and bracket workbook with a podium (file misnamed "IV2025"), IV
  2025 (25th) landing pages and certificate, the rebrand to RoboRacer, the 2025-26 season poster, ICCAS
  2025 photos, CDC 2025 (25th) planning with no outcome, Techfest IIT Bombay (26th) flyers.
- **2026**: the status sheet for every 2026 race, ICRA 2026 (27th) flyer, orientation and ICRA's own
  status deck, IV 2026 (28th) timing sheet and orientations, IFAC 2026 (29th) photo archive whose folder
  names carry the whole bracket, VTC 2026 (30th) organizer row, IROS 2026 (31st) proposal, orientations,
  flyers, registration counts, and the ICRA 2027 (32nd) proposal.

news.json today has nothing between 2020 and ICRA 2026 except two AutoDRIVE items; 25 of the 31
candidates fill that gap. The best single source for the older races is `rr:/Posters 2026/`: despite
the folder name, it holds one dated poster per race from 2023 to 2025 (uploaded 2026-01-20, RoboRacer
branding applied retroactively). docs/media/INVENTORY.md had filed it as "design drafts, not photos".

## Events the Drive documents

Counts are what the files say; "Teams DB" is the repo export `docs/content/teams.sheet.json`, not the Drive.

| # | event | dates in the Drive | venue | teams / people | results in the Drive | Drive source |
|---|---|---|---|---|---|---|
| 11th | ICRA 2023 | May 29 - Jun 1, 2023 | ExCeL London | 24 teams, 130+ (proposal); 150+ from 37 universities, 25 countries (poster) | none | Posters 2026/28.png, 26.png; ICRA_2025 application |
| 12th | CPS-IoT Week 2023 | May 8-9, 2023 | San Antonio, TX | - | none; Xuesu Xiao primary organizer (bio) | Posters 2026/24.png |
| - | IV 2023 Championship | Jun 4-7, 2023 (qualification "Mon June 06", final "Tue June 07") | Anchorage, AK | logos of 8 universities | none | Posters 2026/25.png |
| 14th | IROS 2023 | Oct 1-5, 2023 | Detroit | - | Po-Jen Wang "won the F1TENTH Autonomous Grand Prix at IROS 2023" (bio, no team name) | Posters 2026/8.png; Media to Use/IMG_3196.JPG (EXIF 2023-10-04) |
| - | Spring 2024 course race | Apr 29, 2024, 12-3 PM | outside Skirkanich Hall, Philadelphia | Penn, CMU, Lehigh | none | Posters 2026/11.png |
| 15th | ICRA 2024 | May 13-17, 2024 | PACIFICO Yokohama | 19 teams, 135+ (proposal); 150+ from 37 universities (poster); 14 attended (Teams DB) | none | Posters 2026/12, 22, 23, 9, 27.png |
| 17th | CPS-IoT Week 2024 | May 14-16, 2024 | Hong Kong | - | none | Posters 2026/10.png |
| 18th | IV 2024 | Jun 2-5, 2024 | Jeju Shinhwa World | 21 attended (Teams DB); lots numbered up to 16 (run-of-show) | none; format: first to 8 laps, best of 3, best of 5 final | Posters 2026/13.png, 21.png; "ICRA 2025 ... Time Table & Check List.xlsx" (really IV 2024) |
| 19th | SM 2024 | Sep 16-18, 2024 | Ontario, Canada | - | none | Posters 2026/14.png |
| 20th | ITSC 2024 | Sep 24-27, 2024 | Edmonton | - | none | Posters 2026/15.png |
| 21st (proposal: 18th) | IROS 2024 | Oct 14-18, 2024 | Abu Dhabi | 6 attended (Teams DB) | none; Sim Racing League debut: 58 teams, 160+ registered | Posters 2026/16.png; IROS 2024 application PDF |
| 3rd Korea | ICCAS 2024 | Oct 29 - Nov 1, 2024 | Jeju Shinhwa World | - | none | Posters 2026/20.png |
| 23rd | BU 2024 | Nov 22, 2024 | Boston University (Learning to Trust Autonomy Workshop) | - | none | Posters 2026/18.png, 19.png |
| 22nd | CDC 2024 | Dec 16-19, 2024 (setup Dec 15, finals Dec 19) | Milan | 12 teams | 1 Scuderia Segfault, 2 HiPeRT UNIMORE Racing, 3 Unibo Motorsport, 4 ForzaETH; fastest lap 7.126 s | Racing Brackets F1Tenth @CDC24 - Timeline (1).xlsx; Posters 2026/17.png |
| sim 2nd | F1TENTH Sim Racing League, CDC 2024 | celebration Dec 19, 2024 | online | 15 teams, 50+ registered (as of the ICRA 2025 proposal) | 1 VAUL, 2 Baby Driver, 3 TURTLEBOT | Copy of F1TENTH Sim Racing League - Compressed (1).pptx |
| 24th | ICRA 2025 | May 19-23, 2025 (sheet: May 18-22) | Georgia World Congress Center, Atlanta | 18 timed, 17 in the bracket | 1 UniBo Motorsport, 2 UNICORN, 3 ForzaETH, 4 Scuderia Segfault (see contradictions) | Roboracer IV2025 - Timeline (1).xlsx; Posters 2026/7.png; ICRA2025_Orientation1.pptx |
| sim 3rd | Sim Racing League, ICRA 2025 | May 10-19, 2025 (planned) | online | - | Po-Jen Wang won (bio) | ICRA_2025 application; IROS 2026 proposal |
| 25th | IV 2025 | Jun 22-25, 2025 (conference); Jun 21-23 (call for teams) | Technical University of Cluj-Napoca | capacity 6-8 teams (call) | none | Example Roboracer Competition Landing Pages.docx; Roboracer Certificate 1st.docx; Posters 2026/Draft 1 (6).png |
| 4th Korea (per repo) | ICCAS 2025 | Nov 4-6, 2025 | Incheon | - | none | status sheet; IMG_1473.PNG; 21 photos |
| 25th | CDC 2025 | Dec 9-11 (flyer), Dec 9-12 (landing, status) | Windsor Convention Center, Rio de Janeiro | 9 registrations, 4 confirmed with video by mid-Nov | none; Teams DB says canceled | IEEE CDC Brazil 2025/ |
| 26th | Techfest IIT Bombay 2025 | Dec 22-24, 2025 | IIT Bombay campus, Mumbai | Techfest deck claims 20+ teams | none | IIT Bombay Dec 22-24/Race Flyer/; Posters 2026/Draft 1 (2)-(5).png |
| 27th | ICRA 2026 | Jun 1-5, 2026 | VIECON Vienna | 30 teams, 180+ (2027 draft); 200+ (2027 proposal); 29 attended, 8 no-shows (Teams DB) | none in the Drive (news.json has them) | 2026 ICRA (by id)/ |
| 28th | IV 2026 | Jun 22-23, 2026 (setup Jun 21) | Detroit Marriott at the Renaissance Center, Ontario Exhibit Hall | 15 timed; 17 team names in video submissions; 28 registration responses | time trials only: Thunderbolt UPenn 15.784 s | 2026 IEEE IV/Roboracer IV 2026 - Timeline.xlsx |
| 29th | IFAC 2026 | Aug 24-27, 2026 (final Aug 27) | Busan | 270 participants (2027 proposal); at least 53 team names in photo folders | 1 InTheEND, 2 DDRX, semis SMOC and 4D-REPUBLIC, quarters HY-Ru, Raptor, RCV-FORMULA, APEX | 2026 IFAC/Media - POST MEDIA!/ (folder names) |
| 30th | VTC 2026 Fall | Sep 6-9, 2026 | Boston | - | none | Roboracer Competition Status 2026.xlsx |
| 31st | IROS 2026 | Sep 27-30 (orientation 2), Sep 27 - Oct 1 (flyer) | David L. Lawrence Convention Center | 14 signed up (orientation 2); 15 form responses by Sep 23 | upcoming | 2026 IROS/ |
| 32nd | ICRA 2027 (proposed) | May 22-28, 2027 (proposed) | not stated | - | proposal only | 2026 IROS/RoboRacer ICRA 2027 Competition Proposal.docx |
| - | ITSC 2027 | empty row | - | - | - | status sheet |

Organizers named in the files (publish names only with Cedric's approval): IV 2025 call for teams
(Beerwerth, Jahncke, Perez, Muresan, Shehata, Al-Kaff, Betz, Alrifaee, Amine, Mangharam); ICRA 2025
orientation (Amine, Mangharam, Krovi, Betz); ICRA 2026 orientation (Grosu, Mangharam, Krovi, Betz,
Bartocci); IROS 2024 proposal (Mangharam, Betz, Krovi, Amine, Zheng, C. and T. Samak, Bonsignorio,
Zereik, Hassan); IROS 2026 proposal (Mangharam, Dolan, Wang, Xiao, Po-Jen Wang, Vanommeslaeghe); ICRA
2027 proposal adds Jun Won Choi (SNU). The status sheet lists other organizers only as email addresses.

## Candidate index

| date | id | kind | confidence | title |
|---|---|---|---|---|
| 2026-09-16 | `iros2026-orientation-2` | announcement | medium | What teams heard at the second IROS 2026 orientation |
| 2026-09-06 | `vtc2026-boston-30th` | announcement | medium | The 30th competition at VTC 2026 Fall in Boston |
| 2026-08-28 | `icra2027-proposal-3d-racing` | announcement | low | A 32nd competition proposed for ICRA 2027, with 3D racing |
| 2026-08-27 | `ifac2026-busan-knockout` | result | medium | From a round of 32 to the final: the full knockout of the 29th competition in Busan |
| 2026-06-23 | `iv2026-time-trials` | result | high | Thunderbolt sets the fastest lap of the 28th competition in Detroit |
| 2026-06-22 | `iv2026-offroad-demo` | milestone | low | The off-road RoboRacer race gets its first demo in Detroit |
| 2026-03 | `community-slack-2700` | milestone | low | The RoboRacer Slack passes 2,700 members |
| 2025-12-22 | `techfest2025-iit-bombay-26th` | announcement | medium | India's first RoboRacer competition, at Techfest IIT Bombay |
| 2025-12-16 | `icra2026-one-of-ten-competitions` | milestone | medium | RoboRacer is one of ten competitions at ICRA 2026 |
| 2025-12-09 | `cdc2025-rio-planned` | announcement | low | The 25th competition planned for CDC 2025 in Rio de Janeiro |
| 2025-11-04 | `iccas2025-korea-championship` | announcement | medium | The Korea championship races at ICCAS 2025 in Incheon |
| 2025-10 | `season-2025-26-six-stages` | announcement | medium | Six stages for the 2025-26 RoboRacer season |
| 2025-06-22 | `iv2025-cluj-25th` | announcement | high | RoboRacer becomes a regular event at IEEE IV, starting in Cluj-Napoca |
| 2025-05-22 | `icra2025-atlanta-results` | result | medium | Unibo Motorsport wins the 24th competition at ICRA 2025 in Atlanta |
| 2025-02 | `rebrand-f1tenth-roboracer` | milestone | medium | F1TENTH becomes RoboRacer |
| 2024-12-19 | `sim-racing-league-cdc2024-results` | result | high | VAUL wins the 2nd F1TENTH Sim Racing League at CDC 2024 |
| 2024-12-19 | `cdc2024-milan-results` | result | high | Scuderia Segfault wins the 22nd competition at CDC 2024 in Milan |
| 2024-11-22 | `bu2024-23rd` | announcement | high | The 23rd competition races at Boston University |
| 2024-10-29 | `korea2024-3rd-championship` | announcement | high | The 3rd Korea Championship at ICCAS 2024 on Jeju |
| 2024-10-14 | `iros2024-abu-dhabi-21st` | announcement | medium | The 21st competition at IROS 2024 in Abu Dhabi |
| 2024-10 | `sim-racing-league-launch-iros2024` | milestone | medium | The F1TENTH Sim Racing League debuts with 58 teams |
| 2024-09-24 | `itsc2024-edmonton-20th` | announcement | high | The 20th competition at ITSC 2024 in Edmonton |
| 2024-09-16 | `sm2024-19th` | announcement | high | The 19th competition at IEEE Smart Mobility 2024 in Ontario |
| 2024-06-02 | `iv2024-jeju-18th` | announcement | medium | The 18th competition at IEEE IV 2024 on Jeju |
| 2024-05-14 | `cpsweek2024-hong-kong-17th` | announcement | high | The 17th competition at CPS-IoT Week 2024 in Hong Kong |
| 2024-05-13 | `icra2024-yokohama-15th` | announcement | medium | The 15th competition at ICRA 2024 in Yokohama |
| 2024-04-29 | `course2024-spring-race` | announcement | medium | Penn, CMU and Lehigh race the Spring 2024 course race in Philadelphia |
| 2023-10-01 | `iros2023-detroit-14th` | announcement | medium | The 14th Grand Prix at IROS 2023 in Detroit |
| 2023-06-04 | `iv2023-anchorage` | announcement | medium | The RoboRacer IV 2023 Championship in Anchorage |
| 2023-05-29 | `icra2023-london-11th` | announcement | medium | The 11th Grand Prix at ICRA 2023 in London |
| 2023-05-08 | `cps2023-san-antonio-12th` | announcement | high | The 12th Grand Prix at CPS-IoT Week 2023 in San Antonio |

Recommended first batch (strongest, least risk): `cdc2024-milan-results`, `sim-racing-league-cdc2024-results`,
`iv2025-cluj-25th`, `iv2026-time-trials` (as an enrichment of the existing IV 2026 item), then the
dated-poster timeline items (`cps2023`, `icra2023`, `iros2023`, `course2024`, `icra2024`, `cpsweek2024`,
`iv2024`, `sm2024`, `itsc2024`, `iros2024`, `korea2024`, `bu2024`), which are safe on dates and venues
and need no results. `icra2025-atlanta-results` is high value but needs one answer from Cedric first.

Overlap with news.json: `ifac2026-busan-knockout` and `iv2026-time-trials` add detail to the existing
items `ifac2026-busan-largest-race` and `iv2026-detroit-thunderbolt-wins`; `iros2026-orientation-2`
sits next to `iros2026-registration-closes-sep-5`. Everything else is new.

## Contradictions (flag before publishing)

1. **CDC 2025 (Rio): held, virtual or canceled.** The Drive shows planning only (flyer 2025-11-14,
   orientations, 4 teams confirmed with video). `docs/content/teams.sheet.json` names it "CDC 2025
   (Canceled)"; `docs/media/RACE_PHOTOS.drive.md` says "virtual race"; `past_races.json` and
   `docs/EVENTS_VERIFICATION.md` treat it as held. The world map counts it. Cedric decides.
2. **ICRA 2025 results sheet is named "IV2025".** `Roboracer IV2025 - Timeline (1).xlsx` runs Sun May 18
   to Thu May 22, 2025 (the ICRA 2025 week; poster May 19-23; big checks printed in Atlanta on
   2025-05-19) and includes Georgia Tech's Yellow Jacket Racers. IV 2025 ran June 21-25 in Romania with a
   6-8 team cap. The Teams DB lists these same teams under both ICRA 2025 and IV 2025, so one label is
   wrong, possibly in the Teams DB too.
3. **Ordinals.** IV 2025 and CDC 2025 are both "25th". The IROS 2024 proposal calls IROS 2024 "the 18th"
   while the posters give 18th to IV 2024 and 21st to IROS 2024. The Techfest flyer fills the open 26th
   (EVENTS_VERIFICATION question 7). The 12th (CPS-IoT, May 2023) predates the 11th (ICRA, late May 2023).
4. **ICRA 2026 size.** Content skill: 180+ competitors, 35 registered teams (VERIFY). news.json: about
   200 people and 30 teams. ICRA 2027 draft: 30 teams, 180+. ICRA 2027 proposal: 200+. Teams DB: 29
   attended, 8 no-shows.
5. **IFAC 2026 size.** 270 participants (ICRA 2027 proposal) vs 274 racers and 56 teams (news.json,
   Foundation post); the photo archive shows at least 53 distinct team names.
6. **IV 2026.** Content skill gives Jun 22-25 (conference); the competition ran Jun 22-23. Team count: 15
   timed, 17 in video submissions and in Dhruv Jaiswal's post, 14 attended in the Teams DB. The content
   skill's TODO for the 3rd-place team name: WVU entered as "WVU Mountaineer". Orientation 2 announced
   cash awards of $600, $300 and $100; the content skill keeps prize amounts off the site.
7. **IROS 2026** (content skill vs Drive): award ceremony Wed 16:00-18:00 in Room 301 (skill, handbook)
   vs 6-9 PM at CMU (orientation 2 and the schedule sheet); registration closes Sep 5 (skill) vs "Aug
   11 - Sep 18" (orientation 2); public dates "September 28 to 30" (skill) vs flyer "Sep 27 - Oct 1";
   "TIER IV and AWF Trophies" (orientation 2) vs "no sponsor confirmed" (skill); $300 fee and $500
   subsidy stated in the deck vs "never a dollar amount" (skill); the proposal's two-car Master/Classic
   series vs the four-car plan.
8. **ICRA 2023 and 2024 participation.** Proposal: ICRA'23 130+ and 24 teams, ICRA'24 135+ and 19 teams.
   Posters: "150+ participants from 37 universities" on both, with the same 25-country list (a reused
   design). Teams DB: 14 attended at ICRA 2024.
9. **Early history.** The proposals' appendix gives "[2015,2018] Embedded Systems Week; [2016,2018,2019]
   Cyber-Physical Systems Week". The old site and EVENTS_VERIFICATION give ESWeek 2016 Pittsburgh, CPS
   Week 2018 Porto, ESWeek 2018 Torino, CPS-IoT Week 2019 Montreal. Keep the old-site dates.
10. **Scale numbers.** Universities: "over 80" (2024 and 2026 proposals), "over 89" (ICRA 2025 proposal),
    "90+" (content skill and site). Slack: 2,300+ (ICRA 2025 proposal) and 2,700+ (2026 proposals).
11. **UNICORN.** Teams DB: UNICORN is UNIST (Korea). Content skill: "Team Unicorn (University of Bonn)";
    news.json credits "UNICORN Racing" with ICRA 2026. Check before attaching an affiliation.
12. **Dates that vary by file.** ICCAS 2025 Nov 4-6 (Drive) vs Nov 4-7 (conference). CDC 2025 Dec 9-11
    (flyer), Dec 9-12 (landing text, status sheet), Dec 10-12 (race site). IV 2025 Jun 21-23 (call),
    Jun 22-25 (conference), Jun 22-23 (race site). IV 2023 poster pairs "Monday" with June 06 (a Tuesday).
13. **Sponsor tiers.** The 2026 sponsorship flyer sells Kilo, Giga, Tera and Diamond tiers ($5k to $20k);
    the content skill plans Title, Gold, Community.
14. **Drive layout.** The content skill and the Claude Context doc place `2026 ICRA` at the Drive root; it
    is not there today (reachable by ID only). docs/media/INVENTORY.md calls `Media to Use` photos
    "event/date unknown"; EXIF dates IMG_3196.JPG to 2023-10-04 (IROS 2023 week) and two others to
    2019-04-21.

## Link checks (2026-09-25)

Answering 200: iros2026-race, icra2026-race and iv2026-race.roboracer.ai; 2026ifac-roboracer.com
results; ieee-iv.org/2025/roboracer; techfest.org/competitions/RoboRacer; 2025.iccas.org;
autodrive-ecosystem.github.io/competitions; the ICRA 2025 YouTube reel; the web.archive.org captures
from past_races.json that were tried.

Not answering: icra2025-race, iv2025-race, cdc2025-race and vtc2026-race.roboracer.ai return a GitHub
Pages 404; itsc2024-race and bu2024-race.f1tenth.org return 404; cdc2024, iros2023, cps2023, iv2023,
icra2023, sm2024, cpsweek2024 and iv2024-race.f1tenth.org did not connect (IPv4 and IPv6). All were 200
on 2026-08-22 per EVENTS_VERIFICATION.md, so either the race-site repos lost Pages or custom domains,
or this was a local network fault. Candidates link to archive captures where one exists. Worth a
check before the news page ships, since `past_races.json` links these sites too.

## Image candidates and permissions

Every `image_candidates` entry is a Drive path with its byte size; nothing was downloaded or encoded.
Posters (RoboRacer's own designs) and the season poster are organizer media. The IFAC 2026 archive is
the Korean host's photographer set; the ICCAS 2025 filenames carry photographers' names (이우진, 배동성,
임태민); IMG_3196.JPG has no recorded author; the VAUL video is a team's own presentation. Record
credit and permission in docs/ASSET_MANIFEST.md before any of these reach `public/media/news/`, and
encode to WebP at 1200 px (roboracer-media skill).

## Folders and files not opened, and why

- `2026 IFAC/Media - POST MEDIA!` (11,204 JPG, 90.7 GB) and `2026 IFAC/Photo & Video/Roboracer.mp4`
  (1.05 GB): photo and video archive; listed and sampled by name only.
- `2025 ICCAS November/2025 RoboRacer ICCAS pics` (21 JPG): photos; listed only.
- `2026 ICRA` (by ID) `Media/Chinmay-Tanmay`, `Media/Felix Jahncke`, `Media/Teams Intro`: already
  inventoried in docs/media/INVENTORY.md and in use on the site.
- Orientation recordings (`*.mp4`, `*.m4a`, `chat.txt`, `recording.conf`; CDC 2025 `Orientation 1.mov`,
  749 MB) and every `Orientation Example`/`Example Orientations` video: video, and they carry
  participants' voices and chat.
- `Copy of F1TENTH Sim Racing League (1).pptx` (268 MB): the compressed copy of the same deck was read.
- `Copy of VAUL Presentation Virtual F1Tenth CDC Competiton (1).mp4`: video; listed as an image candidate.
- `T Shirt Design`, `T Shirt Examples`, `Example T Shirts`: vendor quotes and proofs, no event facts.
- `Logo` folders in every event: brand assets, already harvested.
- `Editable Certificates` 2nd to 5th, and the copies in other folders: the same template as the 1st
  (read once).
- Duplicate startup guides (`Startup Guide ... 2025-26.docx` in IROS, VTC, CDC, IIT folders, and
  `2026 IFAC/Copy of RoboRacer Competition Startup Guide Rev.03.docx`): templates; the canonical copy was read.
- `2026 IEEE IV/Tentative Map`: simulator map, no news value.
- `2026 IROS/_Cedric/` outreach drafts and candidate lists; `IROS 2026 RoboRacer Expenses.xlsx`;
  `Volunteer Schedule.xlsx`; `volunteers.xlsx`; `2026 IEEE IV/Travel Expenses.xlsx`;
  `2026 ICRA/Logistics/*`; `Sponsorship Agreement Template Roboracer.docx`; every
  `IROS2024-F1TENTH-Registration (Responses).xlsx` and `Copy of Registration Form (Answers) (1).xlsx`:
  personal, contact or budget data with no public news value.
- `Rosa Zheng:  IEEE VT Society Race/`: templates only (no event-specific file).
- `2026 ICRA` subfolders `Registration`, `Feedback`, `Example Application`, `SIM Racing League Proposal`,
  `SIM Racing League Certificate Examples`: list as empty to this account.
- `Teams and Competitor Contact List.xlsx`: exports as one empty sheet through rclone; not read further.

## Permission-sensitive files: never publish

Contacts and personal data:
- `rr:/Teams and Competitor Contact List.xlsx`
- `rr:/Roboracer Competition Status 2026.xlsx` (organizer emails; budget notes on CDC 2025 and IIT Bombay)
- every registration sheet: `2026 IROS/Registration/*`, `2026 IEEE IV/Registration/*` (registration,
  video and hardware-list responses), `IEEE CDC Brazil 2025/Registration/*`, all copies of
  `IROS2024-F1TENTH-Registration (Responses).xlsx` and `Copy of Registration Form (Answers) (1).xlsx`
- `2026 IROS/Volunteer Schedule.xlsx`, `2026 IROS/volunteers.xlsx`, `2026 ICRA/Logistics/*`
- `rr:/Travel/Rahul Travel 2026.xlsx` (personal travel)
- `Big Award Checks/Big Checks for Race.pdf` in six folders (an invoice with a name, home address and phone)
- `IIT Bombay Dec 22-24/Race Flyer/Roboracer India Competition.pdf` (a Techfest staff member's phone and email)
- `Sponsorship Flyer/2026 RoboRacer Sponsorship Flyer.pptx` and its copies (a personal phone number, tier prices)
- all orientation recordings and `chat.txt` files; `2026 ICRA/Media/Teams Intro` (student interviews)
- ICCAS 2025 photo filenames (photographers' names)

Budgets, contracts and internal plans:
- `2026 IROS/IROS 2026 RoboRacer Expenses.xlsx`, `2026 IEEE IV/Travel Expenses.xlsx`
- `2026 IROS/IROS 2026 - Master Todo.xlsx` (sponsor outreach, budget)
- `2026 IROS/_Cedric/*` (Claude Context: fee, discount-code and budget details; outreach drafts and candidates)
- `rr:/RoboRacer Competition BoM.docx` (prices)
- `IIT Bombay Dec 22-24/Sponsorship Agreement/Techfest X The Autoware Foundation proposal_compressed_14Nov2025.pdf`
- `Sponsorship Agreement Template Roboracer.docx` and `2025 RoboRacer Sponsorship Flyer.pptx` copies
- startup checklists with an `Example Expenses` sheet (IROS, CDC copies) and `RoboRacer Competition Startup Checklist ICRA 2026.xlsx`
- T-shirt vendor quotes and `Roll Up Banner Order ICRA2023 Draft 21May.pdf`
- `2026 ICRA/ICRA General Flyer/ICRA 2026 Status 20251216.pdf` (ICRA's internal deck, sponsor package prices)
- every competition proposal and application (organizer emails; `IROS24_3688_MS.pdf` is marked
  "CONFIDENTIAL. Limited circulation. For review only")
- `2026 IEEE IV/Race Guide and Checklists/Copy of Copy of ICRA 2025 Competition - Time Table & Check List.xlsx` (venue WiFi password)
