# Data files reviewed with no changes

| File | What is visible | Strings reviewed | Why nothing changed |
|---|---|---|---|
| `public/data/teams.json` | TeamGrid (landing, race) shows each team's first `highlights[].result` and `event` | 19 result strings, 19 event labels | Short results in the ledger style ("1st, Master Cup", "2nd place, drivers Milan Manoj and Manasi Shrekhar"). "Master Cup", "Classic Cup" and "Time Trials" are the bracket names on the ICRA 2026 results page. Names and institutions are out of scope, `TODO(content)` markers and `status: verify` untouched |
| `public/data/testimonies.json` | Nothing: `loadTestimonials` is never called, no page renders this file | 8 quotes, 2 roles | These are people's own words. A quote is never rewritten, even where it uses words the brief bans ("unparalleled", "seamlessly", "delve"). If the file comes back, it comes back as quotes |
| `public/data/partners.json` | Partner wall and ribbons | 0 | No description field; the records are names, sites, logos and a category key. Group headings live in `PartnerWall.tsx`, outside this pass |
| `public/data/past_races.json` | Nothing: `loadPastRaces` is never called | 34 names | Names only (`name`, `url`) |
| `public/data/events_map.json` | World map and race timeline: event labels, cities, countries | 40 labels, 40 cities | Names and places. `source`, `url_note` and the countries' `why` are working notes, not rendered |

Count: 162 strings reviewed across the five files, 0 changed.
