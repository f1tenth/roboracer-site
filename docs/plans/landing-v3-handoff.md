# Landing v3 hand-off (session 6, 2026-08-21)

For the next orchestrating session. Everything below is on `revamp/integration`
(`a094655`, pushed to origin). `main` is untouched; the standing rule is that Claude
merges finished work into `revamp/integration` and Cedric gives the final go for main.

## 1. What shipped

The landing page (`/`) was rebuilt to the landing-v3 contract
(`docs/plans/landing-v3.md`, including its "Drift check" and "Final motion numbers"
sections). Scroll order and content, all data-driven from `public/data/*.json`:

1. **Hero chapter** (`HeroChapter.tsx`, 320vh pin): IV 2026 FPV loop alone for the
   first 8% of the pin, then the h1 "Autonomous racing / built and raced / in the open"
   assembles in front of the video (line 1 in the cyan-to-magenta logo gradient, Cedric's
   exception), zoom 1 -> 1.30 (1.20 on phones), words thrown upward from p 0.82, video
   darkened to 0.12 at release. Nav (`NavBar.tsx`) is transparent over the hero and fills
   to paper over p 0.72-0.95 of the chapter; paper everywhere else. Reduced motion and
   weak devices get the poster and a static headline on paper.
2. **01 Highlights** (`HighlightReel.tsx`, `public/data/highlights.json`): 16 tiles,
   15 live (8 ICRA 2026 clips incl. the IV 2026 lap, 7 Felix Jahncke photos), 1 honest
   placeholder (IV 2026 podium; no photos exist in the Drive mirror).
3. **02 Next race**: 21/9 ICRA 2026 hall photo (`public/media/race/race-iros2026-hero-1920.webp`)
   above the unchanged IROS 2026 ledger (Sep 28-30, register by Sep 5).
4. **03 The car** (`ExplodedModel.tsx`, `ExplodedModelScene.tsx`, 140vh pin, ink):
   graphite product render, 72svh canvas, car at 0.78 of the canvas width (0.95 on
   portrait), outward explosion then hold, two captioned car close-ups beside it. LiDAR
   root cause: transforms were correct end to end; the 40-degree lens pitched ~20 degrees
   down made the sensor lean and flip its lean while rotating. Fixed with a 26-degree
   lens at 17-degree pitch and URDF ZYX Euler order for the wheels. Full evidence in
   `docs/design/CAR_CHAPTER.md`. `/assembly` shares the materials and light rig.
5. **04 Platform** (`PlatformPanel.tsx`, `public/data/platform.json`): sticky 16/10
   media frame (7 cols) beside four hairline rows (5 cols); hover/focus/scroll swaps the
   media: Build (pit-work photo), Learn (RViz scan), Race (ICRA clip), Research
   (Cedric's MPPI overtaking clip, 1.29 MB). Under `md` each row carries its poster inline.
6. **05 Community map** (`WorldMapChapter.tsx`, 260vh pin, ink; data
   `data/events_map.source.json` -> `scripts/build-world-map.mjs` -> `public/data/events_map.json`
   + `public/media/map/world-land.svg`): 40 events (33 held race pins) popping
   chronologically, a counter ticking to 30 and holding (content skill says "30
   competitions held"), then "31st / coming up - Pittsburgh" with the only violet element;
   24 country discs; four StatCounters bound to scroll progress. Unverified pins render
   hollow with "tbc".
7. **Data line + partner ribbon** (`Marquee.tsx`, Landing): 112 px logo boxes (84 on
   phones), grayscale-to-color plus a mono "Name ↗" pill on hover/focus, every logo a
   link, clones aria-hidden with tabIndex -1, pause on hover and focus-within.
8. **06 Teams** (`TeamGrid.tsx`, `public/data/teams.json`): 10 cells; three carry
   organizer photos (ForzaETH, VAUL 2, UBM-Atlas) via the new `photo` field.
9. **07 Research** (`PublicationCard.tsx` with a 16/10 figure slot and "Figure: X et al."
   credit): three featured 2025-2026 papers. `/research` was rebuilt on
   `public/data/publications.json` (133 papers, 66 accepted this session, 18 rejected,
   92 left as candidates in `data/publications.candidates.json`; six featured with
   thumbnails under `public/media/research/`). The live BibTeX fetch and the
   `@retorquere/bibtex-parser` dependency were removed.
10. **08 Join** (`CommunityJoin.tsx`, `public/data/community.json`): "Join 3,000+ people
    building and racing", members / time zones / continents with "updated <date>",
    ICRA 2026 crowd photo, Slack (primary) / GitHub / contact. `scripts/slack_stats.py` +
    `.github/workflows/community-stats.yml` refresh the file once a Slack bot token exists.

Shared changes: `StatCounter` (time mode 3.2 s, starts only when fully in view, `delay`
stagger; progress mode via an imperative handle), `SectionHeader` (`size="s"` demoted
header, action slot wraps), `Section` unchanged, `src/lib/data.ts` (types and loaders for
events map, community, platform, thumbnails, team photos), `.gitignore` (curated clip
folders re-included; `.impeccable/live/` and the `_harvest` path ignored).

## 2. Quality gates (all green at a094655)

- `npm run lint`, `npm run build` (Landing chunk 93 kB gzip 42 kB incl. the inlined map
  SVG; RacecarAssembly 1 MB lazy, pre-existing warning).
- `/qa-page landing`: PASS. `docs/qa/landing.md`; stitched captures at 1440/768/390
  plus reduced motion and no-JS in `docs/qa/landing/`; 0 console errors, 0 failed
  requests, axe 0 violations at 1440 and 390 (before and after the critique fixes).
- `@qa-reviewer`: SHIP, no blockers. `docs/qa/landing-review.md` (98 review captures).
- `/impeccable critique`: 22/32 (heuristics 7 and 10 n/a). All P1/P2 items fixed the
  same day except the legacy footer. Snapshot in `.impeccable/critique/`.
- `scripts/media.sh report public/media`: 0 files over 1.5 MB besides the approved hero
  encodes. Per-section builder captures in `docs/qa/landing-v3/` (PNGs are gitignored,
  they live in the checkout only).
- Review server for Cedric: `npm run dev` on the integration checkout
  (http://127.0.0.1:5173/).

## 3. Open items for Cedric (facts and files; nothing here is invented)

Facts to confirm (everything unconfirmed renders with an honest tag today):
- Map: ICRA 2021 workshop (Xi'an is only the nominal host; held online) and the Spring
  2024 course race (Philadelphia assumed) stay hollow "tbc" pins; Belgium and Japan are
  hollow country discs. Three pins were added from the private race-site repos (ESWeek
  2022 Shanghai, ICRA 2025 Atlanta, IV 2025 Cluj-Napoca). Official numbering says 28
  competitions held before IFAC while the content skill says "30 held": the counter
  follows the skill; decide which. Did the IROS 2021 Prague in-person race run?
- Teams: all 10 entries are `status: verify` and render "unverified". Institution unknown
  for 404 Racers, LAMARRacing, VAUL 2, UBM-Tom, UBM-Atlas (the UBM-Atlas placard in the
  photos reads "University of Bologna"). Thunderbolt vs UPenn Autonomous Racing aliasing.
- Held back on purpose: `public/media/team/team-upenn-autonomous-racing-800.webp` is a
  frame from the team's intro video with identifiable faces; not wired until Cedric OKs.
- Partner data: Guizhou University URL 404s on every path tried.
- Research: the 2024 "Unifying F1TENTH Autonomous Racing" survey (Evans et al., 23
  citations) is a candidate worth accepting; five theses are candidates too.

Files to provide (sizes per the media skill):
- `public/media/hero/car-studio.webp` (~1920x1280 WebP, <= 350 KB) and
  `car-studio-cutout.webp` (transparent, <= 300 KB): the studio car shot; the chapter
  already has the crossfade slot and hides itself until the file exists.
- IV 2026 Detroit podium photos -> `_harvest/highlights/` (JPG >= 1600 px); the
  `iv2026-podium` tile stays a placeholder until then.
- A real build clip for the Platform panel if one exists (5-8 s, >= 960 wide);
  `buildCar.gif` turned out to be a render with a terminal overlay, so a photo fills the
  slot for now.

Decisions: the legacy footer (Phase 3.5) is the last interchangeable zone on the page;
the nav's black "Join Community" pill sits on the video-only hero (chrome, by design,
flagged by the critique); whether `community-stats.yml` may commit to the default branch
on its weekly run.

## 4. Tooling and lessons recorded in memory (~/.claude/projects/.../memory)

- Playwright captures on this page: CDP `Page.captureScreenshot`, never `page.screenshot`
  on live WebGL, never `full_page` on vh-pinned sections; stitched viewport walks. Scripts
  from this session (walk.py, axe_run.py, qa_capture.py) live in the session scratchpad
  and are easy to recreate from the memory note.
- axe: no package installed; inject axe-core 4.10.2 from jsdelivr at test time.
- Unlayered CSS in `src/index.css` beats Tailwind utilities (the marquee focus pause had
  to live there next to the `animation` shorthand).
- Never `inert` on marquee clones (kills pointer events for the visible clones).
- Never `git add -A` in a worktree carrying the `_harvest` symlink: it committed the
  symlink once and the merge deleted the ignored 8 GB mirror in the main checkout. Fixed
  (a094655) and the mirror fully re-synced (`scripts/drive-sync.sh all`,
  `scripts/harvest-org-repos.sh`, sources copied back).
- Parallel builders share one scratchpad (prefix scratch files per builder);
  `/impeccable critique` writes `.impeccable/live/server.json` into the repo (now ignored).
- `gh` is authenticated on this machine now (the older memory note says it is not).

## 5. Suggested next tasks (in the order the meeting plan implies)

1. Cedric's localhost review of `/` and `/research`; fold his verdict into
   `docs/plans/landing-v4.md` if anything structural changes.
2. Footer rebuild on the v3 system (Phase 3.5): compact, hairline top rule, social links
   once handles are verified; removes the last interchangeable zone.
3. Race page (`/race`): the IROS 2026 spotlight + rules/registration, the 2026 event
   chain, past races as a year-grouped timeline, "who competes" reusing TeamGrid, the
   hall photo set from `docs/media/SELECTION.md`.
4. About page on paper: story, platform, people (roster needs roles and photos from
   Rahul), partners, sponsors (zero-sponsor state), how to join.
5. History/map page: the WorldMapChapter data already carries 40 events; an interactive
   full-page version with year grouping is mostly a layout task.
6. Content tasks: flip verified flags as Cedric confirms; accept the 2024 survey; run
   `/discover-papers` weekly; wire `community-stats.yml` once a Slack bot token exists.
7. Housekeeping: delete the dead legacy CSS in `src/index.css` (`.dotted-bg`,
   `.border-animated`, element `h1-h4` rules) once no page depends on it; remove the
   `v2-*` worktrees.
