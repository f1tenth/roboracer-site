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
| No "who competes" / featured teams block | missing | CHANGE (new) | see `docs/content/teams.proposed.json` | skill "Featured teams section" |

## Research (`/research`, `src/pages/Research.tsx`)

| location | current text | verdict | proposed text | source |
|---|---|---|---|---|
| Entire page implementation | fetches `pub.bibtex` live from `f1tenth/roborace_publications` at runtime, renders a flat one-by-one list | REMOVE | replace with a page driven by `public/data/publications.json` (already migrated, 77 entries, schema in `data/publications.schema.json`) | skill "Research page requirements" |
| H1 "Publications" | as shown | CHANGE | header should carry the "1,000+ publications" Scholar message and CTA | skill |
| Tag filter chips | missing | CHANGE (new) | 10 tags already defined in `publications.json` (`tags` array) — build filter UI from them | `public/data/publications.json` |
| Featured grid | missing; `"featured": true` count in the data file is currently **0 of 77** | CHANGE/TODO | need Rahul/Billy to pick 10-25 featured papers; cannot be guessed | grep of `public/data/publications.json` |
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
5. Can you confirm which ~10-25 papers in `publications.json` should be marked `featured: true` for the Research page grid, or should I draft a first pass for your review?
6. For the featured-teams block: can you confirm the institution for "LAMARRacing" (1st place, ICRA 2026 Vienna time trials) and for the unlabeled teams "VAUL 2," "Brake Check Buddies," "tron racing," "UBM-Atlas," and "UBM-Tom" (see `docs/content/teams.proposed.json`)?
7. IV 2026 (Detroit) results page still says "Results will be posted after the competition" even though the event happened Jun 22-25. Can you get that page updated, or supply the solo-competition podium directly so it can be added to `teams.json`?
8. Should `/rules`, `/chat` get nav or footer entries, or stay reachable only by direct link/route?

## Questions for Rahul

1. Can you reconfirm the "90+ universities" and "20+ countries" stats on the landing page, or give updated numbers?
2. Team roster: can you confirm the current active-people list (Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, Ahmad Amine, Hongrui "Billy" Zheng) with roles and headshots for `team_developers.json`, and tell us who from the current alumni/developer lists should be removed or kept?
3. Do you have historical or prospective sponsor names we can list (even as "past sponsor, not currently renewed")? The site currently has zero sponsors listed anywhere.
4. Can you or Billy pick the 10-25 papers to feature on the new Research page (`publications.json` has 77 entries, 0 currently featured)?
5. Is `f1tenth-coursekit.readthedocs.io` (Learn) and the Spring 2024 ESE6150 site (Course) still the right destinations, or has the course material moved for the current semester?
6. Can you confirm whether West Virginia University's "3rd place at ICRA 2026" (mentioned in the content skill) corresponds to any specific team name on the ICRA 2026 results page (candidates seen: "UBM-Tom," "UBM-Atlas")? I don't want to guess the mapping.

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

