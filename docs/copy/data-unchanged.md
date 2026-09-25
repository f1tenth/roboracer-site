# Data files reviewed with no changes

| File | What is visible | Strings reviewed | Why nothing changed |
|---|---|---|---|
| `public/data/teams.json` | TeamGrid (landing, race) shows each team's first `highlights[].result` and `event` | 19 result strings, 19 event labels | Short results in the ledger style ("1st, Master Cup", "2nd place, drivers Milan Manoj and Manasi Shrekhar"). "Master Cup", "Classic Cup" and "Time Trials" are the bracket names on the ICRA 2026 results page. Names and institutions are out of scope, `TODO(content)` markers and `status: verify` untouched |
| `public/data/testimonies.json` | Nothing: `loadTestimonials` is never called, no page renders this file | 8 quotes, 2 roles | These are people's own words. A quote is never rewritten, even where it uses words the brief bans ("unparalleled", "seamlessly", "delve"). If the file comes back, it comes back as quotes |
| `public/data/partners.json` | Partner wall and ribbons | 0 | No description field; the records are names, sites, logos and a category key. Group headings live in `PartnerWall.tsx`, outside this pass |
| `public/data/past_races.json` | Nothing: `loadPastRaces` is never called | 34 names | Names only (`name`, `url`) |
| `public/data/events_map.json` | World map and race timeline: event labels, cities, countries | 40 labels, 40 cities | Names and places. `source`, `url_note` and the countries' `why` are working notes, not rendered |

Count: 162 strings reviewed across the five files, 0 changed.

## Phase 2 (2026-09-24)

| File | What is visible | Strings reviewed | Why nothing changed |
|---|---|---|---|
| `public/data/paths.json` | The four "Start here" rows under the landing hero (`ui/EntryPaths`): `label` and `line` | 8 visible (4 labels, 4 lines), plus 62 in `tracks` | Written on 2026-09-24 in the brief's voice: verb-first labels ("Build a car", "Learn autonomy", "Race with us", "Sponsor a race") and one short line each, every one a fact ("Reach students at 90+ universities. Write to contact@roboracer.ai."). `tracks` (step titles, bodies, link labels, plan outcomes) render nowhere yet; they read as plain as the rows and name real modules and labs, so they were left for the Build and Learn rebuild. `todo`, `note`, `source` and `status` fields untouched |
| `public/data/leaderboard.json` | `label`, shown as the "source" row beside the /race leaderboard | 1 | "ESE 6150 leaderboard" is the board's name. `notes` is a config comment, not rendered |

Count, phase 2: 71 strings reviewed across the two files (9 visible), 0 changed.
