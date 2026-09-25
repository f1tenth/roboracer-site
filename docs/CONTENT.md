# Content audit — roboracer.ai

Date of audit: 2026-08-20. Source of truth: `.claude/skills/roboracer-content` (embedded skill, dated 2026-08-20), precedence Cedric > IROS 2026 Competitions Handbook > https://iros2026-race.roboracer.ai > skill file. Read-only pass over `public/data/*.json` and every string literal in `src/pages/**` and `src/components/**`. This file and `docs/content/*.proposed.json` are the only outputs; nothing in `src/` or `public/data/` was modified.

Legend: **KEEP** true and on-voice, leave alone. **CHANGE** true but weak/stale/off-voice/incomplete, rewrite. **REMOVE** false, obsolete, or duplicated dead content. **TODO** unknown, needs Cedric or Rahul, never guessed.

## Landing (`/`, `src/pages/Landing.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Hero H1 | "The Leading Platform for Autonomous Racing Education and Research" | CHANGE | Replace with FPV hero video (autoplay muted loop, scroll cue) per Cedric's Aug 20 landing structure; headline over video, e.g. "Autonomous racing, built and raced in the open." | skill "Landing page structure (Cedric, Aug 20)" |
| Hero subhead | "Open-source hardware, global competitions, and comprehensive learning resources powering the next generation of robotics innovators." | CHANGE | Shorter, concrete, address the reader as a builder; no "innovators" buzzword-adjacent phrasing | skill "Voice" |
| Hero CTA | "Join Our Community" → Slack | KEEP (copy); CHANGE (position — hero should not be the only CTA once next-race spotlight exists) | keep text | skill |
| Stat "90+" Universities | static | TODO | leave number, ask Rahul to reconfirm | skill "Scale statements: VERIFY with Rahul" |
| Stat "20+" Countries | static | TODO | leave number, ask Rahul to reconfirm | skill "Scale statements: VERIFY with Rahul" |
| Stat "60+" Publications | static | CHANGE | "1,000+ publications reference the platform" linking to the Scholar query | skill "Scale statements" |
| Pillar "educational-materials" body | "Over 90 universities, including ... UC San Diego, Clemson University" | CHANGE | UC San Diego is named here but has no partner logo/entry (`ucdsd.png` is unused) — fix copy or add the partner, not both silently | audit of `public/data/partners.json` vs `public/partners/ucdsd.png` |
| Pillar icons | emoji 📚🎓🏁🔧 | CHANGE | replace with icon components; project rule 5 bans emoji as icons | CLAUDE.md hard rule 5 |
| Pillar "community-events" body | "hosting over 24 events" | CHANGE | "30 competitions held" (becomes "31" after IROS 2026 concludes) | skill "Scale statements" |
| Community CTA body | "collaborate on cutting-edge robotics projects" | REMOVE | "cutting-edge" is an explicitly banned word | skill "Voice" |
| Footer-adjacent: no next-race spotlight | missing | CHANGE (new section) | add IROS 2026 spotlight, see "New sections" below | skill "Landing page structure" |
| Footer-adjacent: no highlights/chapters, sponsors, teams, research teaser sections | missing | CHANGE (new sections) | add per Cedric's Aug 20 scroll order | skill "Landing page structure" |
| Testimonials image `src` | relative path e.g. `testimonials/Rosa Zheng.jpeg` (no leading `/`) | CHANGE (engineering) | breaks if component is reused off `/`; flag to page builder, not a content fix | `src/components/FloatingTestimonials.tsx:66` |

## About (`/about`, `src/pages/About.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Intro paragraph | "RoboRacer is an international community... founded at the University of Pennsylvania in 2016... Our mission is to foster interest, excitement, and critical thinking..." | KEEP core facts; CHANGE to add "formerly F1TENTH" | must mention "formerly F1TENTH" once on this page per skill | skill "Identity" |
| "Learn:" list item | "...emphasize the analytical skills to recognize and reason about situations with moral content in the design of autonomous." (sentence is cut off / broken) | CHANGE | rewrite as a complete sentence about courses and teaching materials | `src/pages/About.tsx:137` |
| "Read the Competition Rules" CTA | present | KEEP | — | — |
| "Meet the Team" → Developers (8 people) | Billy Zheng, Johannes Betz, Madhur Behl, Venkat Krovi, Mike Coraluzzi, Rahul Mangharam, Marko Bertogna, Paolo Burgio | CHANGE/TODO | stale; skill names Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, Ahmad Amine, Hongrui "Billy" Zheng as active people to add, pending Rahul's confirmation of roles and headshots | skill "Partners, sponsors, team" |
| "Meet the Team" → Alumni (12 people) | list in `team_alumni.json` | CHANGE/TODO | stale roster, no confirmed edits without Rahul | skill |
| "Our Partners" grid | 20 of ~70 logo files in `public/partners/` | CHANGE | add the 46 unused, verifiable-by-filename logos as `status: verify` entries (see `docs/content/partners.proposed.json`); present alphabetically as a marquee, not tiered | skill "Partners, sponsors, team" |
| Sponsors section | missing entirely | CHANGE (new) | add Sponsors section with Title/Gold/Community tiers + "Become a sponsor" CTA to `contact@roboracer.ai` (no confirmed sponsors to list yet) | skill "Partners, sponsors, team" |
| Featured teams section | missing | CHANGE (new) | add "who competes" grid, see `docs/content/teams.proposed.json` | skill "Featured teams section" |

## Race (`/race`, `src/pages/Race.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Upcoming events list | 4 entries incl. "28th ... IV 2026 ... June 22-25, 2026" | REMOVE (IV 2026 entry) | IV 2026 (Jun 22-25) is in the past relative to today (Aug 20, 2026); move to `past_races.json` | skill "IV 2026 is past"; `upcoming_events.json` |
| "31st ... IROS 2026 ... September 27-30, 2026" | as shown | CHANGE | conflict: live race site (https://iros2026-race.roboracer.ai) states "September 27 - October 1, 2026" (setup through dismantle); skill's recommended public copy is "September 28 to 30, 2026" (competition days only). Site content takes precedence over the skill file per the stated precedence order, but the skill is more specific about which days are "the competition." **Flagged for Cedric**, see Questions | live fetch of iros2026-race.roboracer.ai + skill "Next race" |
| No next-race spotlight / registration deadline / CTA on this page | missing | CHANGE (new) | add "Register by Sep 5, 2026" CTA, link to https://forms.gle/nhDytwxKEy4EpUHa6, per skill tone "this is a call to teams" | skill "Next race" |
| No mention of format (multi-agent, up to 4 vehicles) | missing | CHANGE | add, flagged "final rules to be updated soon" | skill "Next race: Format" |
| No mention of organizing committee | missing | TODO | only publish names with Cedric's approval of the list | skill "Next race: People" |
| Past events list | 30 plain name/link entries, no results, no year grouping | CHANGE | present as a timeline grouped by year per skill; add "27th ICRA 2026" numbering prefix for consistency with the numbered chain | skill "Event chain 2026" |
| Past events: ICRA 2026 entry | "ICRA 2026 Race" | KEEP link | is the 27th event per the numbering chain (confirmed live: page title read "27th Roboracer Autonomous Racing Competition at ICRA 2026") | live fetch icra2026-race.roboracer.ai |
| No "who competes" / featured teams block | missing | CHANGE (new) | see `docs/content/teams.proposed.json`, refreshed 2026-08-21 with a fresh fetch of ICRA 2026 Vienna results plus IV 2026 podium facts supplied directly by Cedric (iv2026-race.roboracer.ai/results.html is still unpopulated); IFAC 2026 (Busan, Aug 24-27) has not happened yet, so its teams are TBD; CDC 2025 / ICCAS 2025 / Techfest IIT-Bombay 2025 results pages yielded no usable team data (see file's `gaps` array) | skill "Featured teams section"; ICRA 2026 Vienna results page fetched 2026-08-21; Cedric, 2026-08-20/21 |

## Research (`/research`, `src/pages/Research.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Entire page implementation | fetches `pub.bibtex` live from `f1tenth/roborace_publications` at runtime, renders a flat one-by-one list | REMOVE | replace with a page driven by `public/data/publications.json` (67 entries, not 77 as an earlier pass miscounted — the file also has 10 `tags` entries with their own `id` field, which inflated a naive grep count to 77; schema in `data/publications.schema.json`) | skill "Research page requirements" |
| H1 "Publications" | as shown | CHANGE | header should carry the "1,000+ publications" Scholar message and CTA | skill |
| Tag filter chips | missing | CHANGE (new) | 10 tags already defined in `publications.json` (`tags` array) — build filter UI from them | `public/data/publications.json` |
| Featured grid | missing; `"featured": true` count in the data file is currently **0 of 67** | CHANGE, draft ready for review | drafted a 16-paper shortlist (2023+, ranked by citation count via OpenAlex title match, then venue priority RA-L>ICRA>IROS>CoRL>CDC) plus the 2020 O'Kelly et al. platform paper pinned separately as "the original paper" — see `docs/content/featured-papers.md`; Rahul/Billy still need to approve before anyone sets `"featured": true` in the actual data file | `docs/content/featured-papers.md`, OpenAlex Works API fetch 2026-08-21 |
| "All curated" list grouped by year with search | missing | CHANGE (new) | build from `publications.json` | skill |
| "Submit your paper" CTA | missing | CHANGE (new) | mailto `contact@roboracer.ai` subject "RoboRacer publication" | skill |
| Google Scholar embed | not attempted | KEEP (do not attempt) | Scholar blocks framing; use a styled CTA link instead | skill |

## News (`/news`, `src/pages/News.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Newest item | "F1Tenth Korea Delegation Visited UPenn CoE", Feb 15, 2024 | TODO | feed is 2.5 years stale as of today (Aug 20, 2026); cannot add new items without a source — ask Cedric/Rahul for recent press/LinkedIn items to seed (see skill "Media and PR context": ~16 LinkedIn posts from ICRA/IV 2026 pending author permission) | `public/data/news.json`; skill "Media and PR context" |
| All 7 items | as listed | KEEP (as history) | keep as archived items once newer news is added; do not remove factual history | `public/data/news.json` |
| "F1Tenth" branding inside item titles/descriptions | e.g. "F1Tenth Korea Delegation..." | KEEP | historical items predate the rename, leave verbatim; do not rewrite quoted third-party titles | skill "Identity" |

## Rules (`/rules`, `src/pages/Rules.tsx` + `public/rules.md`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Page shell | fetches and renders `public/rules.md` | KEEP (mechanism) | — | — |
| `rules.md` content | not in scope of this audit (not `public/data/*.json`, not a `.tsx` string literal) | TODO | Cedric should confirm `rules.md` reflects IROS 2026 rules ("final rules to be updated soon" per live site, multi-agent up to 4 vehicles, bare exhibition-hall floor) before the race page links to it as current | skill "Next race: Format" |

## Build / Learn / Course (`/build`, `/learn`, `/course`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| `/build` iframe | `https://f1tenth.readthedocs.io/en/main/` | KEEP | stays an iframe in v1 per hard rule 9 | CLAUDE.md |
| `/learn` iframe | `https://f1tenth-coursekit.readthedocs.io/en/latest/` | KEEP | — | CLAUDE.md |
| `/course` iframe | `https://ahmadamine998.github.io/ESE6150-Website/`, title "6150 Spring 2024 Course Website" | TODO | semester-specific site is 2+ years old; ask Cedric/Rahul whether a current-semester course site should replace it | `src/pages/Course.tsx` |

## Chat (`/chat`, `src/pages/Chat.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Page body | loads the RoboRacer chat widget script, but the visible `<iframe>` still points at `BUILD_IFRAME_SRC` (`f1tenth.readthedocs.io`), not a chat surface | TODO | functional/engineering issue, not a copy fact; flag to Cedric — the last commit message ("fix: point chat page at RoboRacer widget") suggests the iframe swap may be incomplete | `src/pages/Chat.tsx` |

## Footer / Nav (global, `src/components/NavBar.tsx`, `src/components/Footer.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Nav links | About, Build, Learn, Race, Course, Research, News | KEEP | matches hard rule 9 required routes (Rules and Chat reachable only via footer/direct link — consider adding, minor) | CLAUDE.md |
| Nav "Simulator" CTA | → `https://autodrive-ecosystem.github.io/` | TODO | skill explicitly flags "VERIFY whether to keep" | skill "Identity" |
| Nav "Join Community" | → Slack invite | TODO | fetch redirected normally (302) to `robo-racer.slack.com/join/...` but that page returned 403 to automated fetch; could not confirm validity programmatically — Cedric should test manually | skill "Identity: VERIFY it is still valid" |
| Nav | no direct IROS 2026 CTA | CHANGE | skill requires the IROS 2026 race site to be "featured on the roboracer.ai homepage and race page" — nav or homepage spotlight should link to https://iros2026-race.roboracer.ai | skill "Next race" |
| Footer tagline | "Advancing autonomous racing through innovation, education, and competition." | CHANGE | generic; rewrite in the voice (short sentences, no adjectives-as-filler) | skill "Voice" |
| Footer email | `contact@roboracer.ai` | KEEP | matches skill | skill "Identity" |
| Footer copyright | "© 2026 RoboRacer Foundation. All rights reserved." | TODO | "RoboRacer Foundation" as a legal entity name is not confirmed anywhere in the skill; ask Cedric/Rahul before publishing an entity name | skill (silent on this) |
| Footer "Creative Commons License" | bare text, no link to which CC license or what it covers | CHANGE | either link the specific license or remove the claim | `src/components/Footer.tsx:97` |
| Footer social links | none present (no LinkedIn, Instagram, YouTube, GitHub, Slack icons) | CHANGE | skill: "the site should carry social links in the footer (LinkedIn company page, Instagram VERIFY handle, YouTube VERIFY, GitHub https://github.com/f1tenth, Slack)" | skill "Media and PR context" |
| Footer "Resources" → Simulator link | `https://autodrive-ecosystem.github.io/` | TODO | same VERIFY as nav | skill |

## `public/data/*.json` files

| file | verdict | notes |
|---|---|---|
| `upcoming_events.json` | CHANGE | remove IV 2026 (past); confirm IROS 2026 date framing with Cedric; see proposed file |
| `past_races.json` | CHANGE | add IV 2026; reformat as a year-grouped timeline in the page layer; see proposed file |
| `partners.json` | CHANGE | 20 of ~67 logo files in `public/partners/` are used; add the other 46 (`public/partners/binghamtonUni.png` is a duplicate asset of `binghamton.png`, not a new partner — flagged separately, not added) as `status: verify` entries; see proposed file |
| `team_developers.json` | TODO | stale (8 people); do not edit without Rahul's confirmed roster/roles/photos |
| `team_alumni.json` | TODO | stale (12 people); same |
| `news.json` | TODO | stale (newest item Feb 2024); needs new sourced items from Cedric/Rahul |
| `testimonies.json` | KEEP (content) / CHANGE (engineering: relative image paths) | 8 testimonials, all image files exist; 13 additional headshots sit in `public/testimonials/` with no matching JSON entry (Alexander Apostolu, Atanasko Boris Mitrev, Burak Mert Gonultas, Erik Contreras, Filippo Muzzini, Hyunjong Choi, Jean-Michel Fortin, Luca Tognoni, Manav Gagvani, Micah Nye, Navaneeth Malingan, Raja Rajan Krishna Kumar, RolandBautista, William Fecteau, Won-bin Lee, Yadu Sunil) — likely candidates for new testimonial entries, but no quotes can be invented; TODO for Cedric to source quotes |
| `publications.json` | CHANGE | 77 entries migrated, 0 marked `featured: true`; needs Rahul/Billy to select 10-25 featured papers; `scholar_query_url` and per-tag `scholar_query` fields already correct |

### `public/crew/` vs team JSON files

76 files in `public/crew/`. 17 unique files are referenced by `team_developers.json` + `team_alumni.json` combined (`avatar.svg` used 4x as a placeholder and excluded from this count). **59 crew photos have no entry in either team JSON file.** Many are plausibly duplicate/alternate photos of already-listed people (e.g. `rahul.jpg` alongside `mangharam.jpeg`; `paolo.png` alongside `Paolo_Burgio.jpg`; `marko.png` alongside `marko.jpg`; `houssam.jpg` alongside `houssam.png`; `zang.jpeg`/`ZiruiZang.jpg`; `trikannad.jpeg`/`triknnad.jpeg` looks like a typo pair). Notably **Wesley Yee has a real photo at `crew/wesley_yee.jpeg` but `team_alumni.json` points him at the generic `crew/avatar.svg` placeholder** — an easy fix once Rahul confirms he should still be listed. Full unused list is long; do not guess names/roles for the rest — ask Rahul for a current roster before adding any of these.

## Counts

- **KEEP:** 17
- **CHANGE:** 42
- **REMOVE:** 3
- **TODO:** 17

(Total classified items: 79, counted at row granularity above; several rows carry a dual verdict, e.g. "CHANGE/TODO," counted once under the primary verdict and noted in the secondary.)

## Questions for Cedric

1. IROS 2026 dates: the live race site shows "September 27 - October 1, 2026" as the overall window (setup through dismantle), but the content skill's recommended public-facing copy is "September 28 to 30, 2026" (competition days only). Which framing should the homepage spotlight and race page use?
2. Should the nav/footer "Simulator" CTA keep pointing at `https://autodrive-ecosystem.github.io/`, or should it point somewhere else (e.g. AutoDRIVE has its own site distinct from ours)?
3. Is the Slack invite link (`https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-...`) still valid? I could not confirm programmatically (destination returned 403 to an automated fetch); please test manually and send a fresh invite link if it's expired.
4. Is "RoboRacer Foundation" the correct legal/entity name for the footer copyright line, or should it just say "RoboRacer" / a different name?
5. A first-pass featured-papers shortlist is drafted at `docs/content/featured-papers.md` (16 papers, 2023+, ranked by citation count via OpenAlex + the 2020 O'Kelly et al. paper pinned as "the original paper"). Can you and/or Billy review it and confirm before we set `featured: true` in `publications.json`? Three 2023-2024 papers could not be matched to a citation count at all (`zou-2023-constrained`, `tanmay-vilas-samak-2024-ea`, `moualhi-2024-experimental`) — flagged, not guessed.
6. For the featured-teams block (`docs/content/teams.proposed.json`, refreshed 2026-08-21): can you confirm the institution for "LAMARRacing" (1st, ICRA 2026 Vienna time trials), "VAUL 2" (1st, Classic Cup), "UBM-Tom" and "UBM-Atlas" (3rd/2nd, Master Cup — possibly the same lab, possibly linked to West Virginia University, unconfirmed either way), and the institution behind IV 2026's 2nd-place "404 Racers" (drivers Milan Manoj and Manasi Shrekhar)? Also: is "Thunderbolt" (IV 2026 1st, UPenn, Cedric Hollande) the same team as "UPenn Autonomous Racing" (ICRA 2026 2nd in Time Trials), just under a different per-event alias, or two distinct UPenn squads?
7. IV 2026 (Detroit) results page (`iv2026-race.roboracer.ai/results.html`) still says "Results will be posted after the competition" as of 2026-08-21, two months after the event. You supplied the podium directly (1st Thunderbolt/UPenn/Cedric Hollande, 2nd 404 Racers/Milan Manoj and Manasi Shrekhar, 3rd West Virginia University, exact team name TBD) and it's used in `teams.proposed.json` sourced to you, but there's still no public URL to cite — can you get the results page updated, or confirm West Virginia University's exact competition team-name alias?
8. Should `/rules`, `/chat` get nav or footer entries, or stay reachable only by direct link/route?

### Spinoffs on /about (added 2026-09-24, branch `revamp/p2-spinoffs`)

Data: `public/data/spinoffs.json`. `entries` render on /about as section 05
"Spinoffs" (after Our Partners, before Videos); `candidates` do not render until
you move them into `entries`. Nothing about spinoffs is in the content skill, so
every entry is `status: "verify"` and shows the mono verify tag (no source
link on the card, as on the team cards). Each record carries its `source` and
an `evidence` list of the first-party pages it was drafted from; the sentences
are ours, not theirs. Neobotics and Quanser also carry `named_by: "Cedric,
2026-09-24"`: you named both as spinoffs.

**Facts to confirm**

1. **Neobotics** (named by you, 2026-09-24). Public pages give: Massachusetts nonprofit, incorporated
   Feb 26, 2025; builds the NeoRacer; the NeoRacer paper says it is built to
   F1TENTH/RoboRacer race rules; Neobotics co-organized the 30th competition at
   VTC 2026 in Boston (Koneshka Bandyopadhyay is on the organizer list in
   `f1tenth/vtc2026-race`). Nothing public says it *grew out of* RoboRacer. Its
   founders and advisors are Boston University people, and BU hosted the BU
   F1TENTH Grand Prix on Nov 22, 2024 (organizers included Renato Mancuso, now
   a Neobotics advisor, and Rahul). Did the founders come out of that race or
   the BU F1TENTH club? If yes, the origin line can say so; today it only says
   what is sourced.
2. **Quanser** (named by you, 2026-09-24). What is the connection: a shared
   hardware lineage, a course, a race partnership? No public source says
   (searched quanser.com, the f1tenth GitHub org and the web; Quanser's site
   gives 35+ years of history, so it predates F1TENTH). Until you say, the card
   shows what Quanser is plus a verify tag and no origin line.
3. **LAMARRacing.** Sourced to the Lamarr Institute news post (Jun 8, 2026:
   Best Performance Overall at ICRA 2026, fastest in the time trials, fourth in
   the one-on-one races) and the team's arXiv paper 2603.07126 (all authors at
   the University of Bonn, tested on a self-built RoboRacer car). OK to frame
   a team as a spinoff? Side finding: that paper settles the open institution
   question for LAMARRacing in `teams.json` (University of Bonn; not edited on
   this branch).
4. **Founding years.** Only Neobotics has one (2025). LAMARRacing and Quanser's
   QCar have none on a public page, so `since` is null.

**Candidates: keep or drop?** (each sourced, none rendered yet)

5. **ForzaETH Race Stack** (product): ETH Zurich's open-source head-to-head
   race stack, written by the ForzaETH team for RoboRacer races and released in
   2024. Sources: arXiv 2403.11784 and github.com/ForzaETH/race_stack.
6. **RoboRacer Sim Racing League** (initiative): the online digital-twin league
   on Clemson's AutoDRIVE, first run at IROS 2024, since at CDC, ICRA and IROS.
   Source: autodrive-ecosystem.github.io/competitions. It is co-run with
   RoboRacer, so it may belong on /race rather than here.
7. **Cavalier Autonomous Racing** (team): UVA's Indy Autonomous Challenge team,
   founded by F1TENTH co-founder Madhur Behl; most first members had worked on
   F1TENTH for five years. Sources: madhurbehl.com and the IAC team profile.
   The clearest "grew out of F1TENTH" story in the public record.

**Logo permissions to request**

8. No spinoff has a logo with a provenance row in `docs/ASSET_MANIFEST.md`, so
   every card is a wordmark. The Neobotics icon is already in
   `public/partners/neobotics.webp` (partner wall, commit 13513e9) with no
   manifest row; add the row and confirm it may be reused here. Quanser,
   LAMARRacing (or the Lamarr Institute), and any candidate you keep would each
   need a logo file plus written permission before `logo` is set.

### From the polish-2 QA fixes (added 2026-09-25, branch `revamp/p2-qafix`)

**Race sites that went dark.** On 2026-09-24/25 these competition sites answer
404 or fail TLS (`curl -sIL` with a browser user agent). Every one has its repo
in the f1tenth GitHub org set to **private** with Pages still enabled
(`gh api orgs/f1tenth/repos`), and private-repo Pages stopped serving. /race now
links each one to a Wayback capture (`archive` field in
`data/events_map.source.json`, `public/data/events_map.json` and
`public/data/past_races.json`, tagged "archived page"). Make a repo public again
and its row can go back to `url_status: "live"`.

| Site | Repo (private) | Wayback capture linked |
|---|---|---|
| vtc2026-race.roboracer.ai | `f1tenth/vtc2026-race` | 2026-07-23 (before the race: no results) |
| cdc2025-race.roboracer.ai | `f1tenth/cdc2025_race` | 2026-03-05 |
| iv2025-race.roboracer.ai | `f1tenth/iv2025_race` | 2026-01-21 |
| icra2025-race.roboracer.ai | `f1tenth/icra2025_race` | 2026-03-13 |
| cdc2024-race.f1tenth.org | `f1tenth/cdc2024_race` | 2025-07-14 |
| bu2024-race.f1tenth.org | `f1tenth/bu2024_race` | 2025-06-23 |
| itsc2024-race.f1tenth.org | `f1tenth/itsc2024_race` | 2025-06-23 |
| sm2024-race.f1tenth.org | `f1tenth/sm2024_race` | 2025-08-23 |
| iv2024-race.f1tenth.org | `f1tenth/iv2024_race` | 2026-03-09 |
| cpsweek2024-race.f1tenth.org | `f1tenth/cpsweek2024-race_website` | 2024-12-19 |
| icra2024-madgames.f1tenth.org | `f1tenth/icra2024_madgames_website` | 2025-08-29 |
| iros2023-race.f1tenth.org | `f1tenth/iros2023-race_website` | 2025-08-23 |
| iros2023-madgames.f1tenth.org | `f1tenth/iros2023_madgames_website` | 2025-07-13 |
| icra2023-race.f1tenth.org | `f1tenth/icra2023-race_website` | 2025-10-04 |
| iv2023-race.f1tenth.org | `f1tenth/iv2023_race` | 2025-03-06 |
| cps2023-race.f1tenth.org | `f1tenth/cps2023-race_website` | 2025-02-27 |
| esweek2022-race.f1tenth.org | `f1tenth/esweek2022-race` | 2025-03-08 |
| icra2022-race.f1tenth.org | `f1tenth/icra2022-race_website` | 2025-08-24 |
| korea-race.f1tenth.org | `f1tenth/korea-race` | 2025-12-06 |

Already on captures before this round (domains dead or resold): iros2021.org,
germany-race2022, icra2024-race, iros2024-race, korea-race24. Also private with
Pages on, not linked from the site: `icra2025_madgames_website`,
`iros2020_website`, `iros2021_website`, `icra2022_website`, `icra2023_website`,
`f1tenth_eval_network`, and `f1tenth.github.io` (which still serves today; the
2016 to 2020 race pages on /race depend on it). Public and serving: icra2026,
iv2026, iros2026. korea-race23.f1tenth.org still serves.

1. Make the race-site repos public again (and `f1tenth.github.io` before it
   stops too), or keep the captures?

**IROS 2026 registration deadline: four dates in play.** Nothing was changed;
since every one of them is past, the spotlight (landing and /race) and the
/race Enter block now read "registration closed" and lead to the race site.

| Where | Registration closes | Video due |
|---|---|---|
| Content skill (Cedric, 2026-08-21) | Sep 5, 2026 | Sep 12, 2026 |
| `news.json`, item of Aug 23 ("Register your team by September 5") | Sep 5 | |
| `upcoming_events.json` (`registration_deadline`, `_at`, `qualification_video_due`; set in 58c6a8c, while its `registration_deadline_note` still says "display the Sep 5 date plainly") | Sep 9 | Sep 9 |
| iros2026-race.roboracer.ai/timeline.html, read 2026-09-25 | ~~Sep 12~~ Sep 18 (struck and replaced on the page) | Sep 18, with the hardware list |

2. Which date is the record? The handbook and the live site outrank the skill,
   so Sep 18 looks right for the JSON; the Aug 23 news item stays as published.

**Fact conflicts settled on the page, one question left.**

- LAMARRacing's spinoff origin now reads "At ICRA 2026 in Vienna it was fastest
  in the time trials and fourth overall.", the wording of the results page
  (1st Time Trial, 4th Master Cup) and of /news. The Lamarr Institute post does
  literally say the team won "Best Performance Overall" (the award for the
  fastest time trial); it was dropped only because "fourth overall" beside
  "Best Performance Overall" read as a contradiction. Say if you want it back.
- "Cédric Hollande" in the author and credit of your ICRA 2026 post (news and
  the community strip) is now "Cedric Hollande", as everywhere else. The
  LinkedIn URLs are unchanged.
- /race's lead drops "on four continents" (not in the content skill).

**Spinoffs: Quanser is off the page until its origin is known.** An entry
whose `origin` is missing or still `TODO(content)` no longer renders (the
JSON keeps it), so /about shows "Two so far": Neobotics and LAMARRacing.
Quanser returns as soon as its origin line says how it connects to RoboRacer
(see Spinoffs question 2 above).

3. 404 Racers' team card still says "institution tbc": the content skill's IV
   2026 podium names the drivers but no institution. Your IV 2026 result post on
   /news ("404 Racers, also from UPenn") and Milan Manoj's post both say
   University of Pennsylvania. Confirm, and teams.json can carry it with you as
   the source.

## Questions for Rahul

1. Can you reconfirm the "90+ universities" and "20+ countries" stats on the landing page, or give updated numbers?
2. Team roster: can you confirm the current active-people list (Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, Ahmad Amine, Hongrui "Billy" Zheng) with roles and headshots for `team_developers.json`, and tell us who from the current alumni/developer lists should be removed or kept?
3. Do you have historical or prospective sponsor names we can list (even as "past sponsor, not currently renewed")? The site currently has zero sponsors listed anywhere.
4. Can you or Billy review the draft 16-paper featured shortlist at `docs/content/featured-papers.md` (`publications.json` has 67 entries, 0 currently marked `featured: true`)? It's ranked by citation count (OpenAlex) and venue priority; three papers had no confident citation match and are flagged, not guessed.
5. Is `f1tenth-coursekit.readthedocs.io` (Learn) and the Spring 2024 ESE6150 site (Course) still the right destinations, or has the course material moved for the current semester?
6. West Virginia University's 3rd place has been corrected (per Cedric, 2026-08-20) to IV 2026 (Detroit), not ICRA 2026 — the exact competition team-name alias WVU raced under is still unconfirmed (see Cedric's questions). Separately: do you know whether ICRA 2026 Vienna's "UBM-Tom" and "UBM-Atlas" (3rd and 2nd in Master Cup) are a different institution entirely, or does "UBM" stand for something you recognize? I don't want to guess the mapping.

## New sections — proposed copy

### Next-race spotlight (Landing + Race)

> **31st RoboRacer Autonomous Racing Competition — IROS 2026**
> September 28 to 30, 2026. Pittsburgh, Pennsylvania.
>
> Bring your car. Four vehicles on track, qualification time trials into a knockout bracket. Register your team by September 5, 2026.
>
> [Register your team](https://forms.gle/nhDytwxKEy4EpUHa6) · [Read the rules](/rules)
>
> New this year: multi-agent racing with up to four cars on track at once. Final rules are still being finalized and will post before registration closes.

*(Dates pending Cedric's answer to Question 1 above; swap to "September 27 to October 1" if that is the framing he wants.)*

### Highlights chapter (Landing)

> **30 competitions. One community.**
> From Pittsburgh to Busan, teams have raced 1/10-scale autonomous cars through 30 competitions since 2016. Podiums, overtakes, packed exhibition halls. This is what the next generation of autonomous systems engineers built.

*(Media placeholder per Cedric: real clips to follow; do not ship stock imagery in place of real race footage.)*

### Sponsor tiers (Landing + About)

> **Sponsors**
> RoboRacer runs on the support of the organizations that back the platform, the courses, and the races.
>
> **Title** · **Gold** · **Community**
>
> No sponsors are confirmed yet for IROS 2026. [Become a sponsor](mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship) or request the sponsorship overview.

*(Structure only — do not publish a sponsor logo or name without written confirmation, per skill.)*

### About story opening

> **RoboRacer, formerly F1TENTH, started at the University of Pennsylvania in 2016.**
> A 1/10-scale car is small enough to build on a desk and fast enough to demand real engineering: perception, planning, control, all running on hardware a student team can own end to end. That constraint is the whole point. It is why the platform scaled past one lab into a worldwide community of researchers, students, and engineers who build, teach, and race with it.
>
> The platform is four things working together: an open-source vehicle system anyone can build, courses that teach the foundations of autonomy, a competition series that puts the theory on a track, and a body of research that keeps growing because the platform is free to build on.

