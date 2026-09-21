# QA: /race — pages v2

Date: 2026-08-23. Branch `revamp/pages-v1`. Stream 1 (race). Captures in
`docs/qa/race/` (git-ignored, they live in the working tree — see
`docs/qa/requests-race.md` §0 for which worktree).

Build under test: dev server on 4187 serving this stream's worktree.
`npm run build` was **not** run: four builders share one tree this session and
would race on `dist/`. Typecheck (`npx tsc --noEmit -p tsconfig.app.json`) and
lint (`npx eslint`) are green; the director runs the full build.

## Verdict: **PASS**, with one architectural item unchanged from v1 (JS off)

The v1 report is kept below. This round covers pages-v2 §5.1, §5.2 and §5.3
only; the hero, the countdown, the thirteen repaired links, the four-section
structure and the `unverified` team tags were left alone as §5.4 asks.

## What changed

### §5.1 One picture per race

`RaceTimeline` now renders a tile for **every** row: the same 16:9 box, the
same hairline border, `loading="lazy"` and explicit `width`/`height` on every
image, so the row height is fixed before the bytes arrive.

- **7 of 37 rows have a real photograph**; 30 render the designed placeholder.
- Photos: `cpsweek2018`, `esweek2018`, `cpsiot2019`, `columbia2019`,
  `iccas2025`, `icra2026`, `iv2026` — every source A1/A2 had delivered to
  `_harvest/pick/race/` by the end of this session.
- Encode: EXIF straightened first (the Drive mirror has rotated files), centre
  cover-cropped to 16:9, then
  `scripts/media.sh photo <in> -o public/media/race/<id>.webp --width 800 --budget 150k`.
  All seven are 800x450, **41-90 KB**, largest 90,182 B — well under the 150 KB
  budget and nowhere near the 1.5 MB git rule.
- Placeholder: `public/logo-square.svg` at 42% of the tile height, centred, 25%
  opacity, on `paper-100` inside the same border. Judged on screen at 1440, 768
  and 390: with 30 of 37 rows placeheld the column still reads as a composed
  timeline rather than a wall of broken frames.
- Credits are **not** on the tile. The seven manifest rows are staged in
  `docs/qa/requests-race.md` §3 rather than written into
  `docs/ASSET_MANIFEST.md`, because three harvest agents write that file
  concurrently and this builder is in a separate worktree.

**Open**: A1's `docs/media/RACE_PHOTOS.drive.md` (2024+) landed at 19:11 and
supplied credits for `iccas2025`, `icra2026` (Photo: Felix Jahncke) and
`iv2026`. A2's `RACE_PHOTOS.web.md` (2023 and earlier) never landed, so the
four older photos still carry `TODO(content)` for the photographer. Fill those
before production.

A1's one new pick, `icra2025`, was **deliberately not used**: it is a frame of
a third party's YouTube reel (@madeautonomous) with a burned-in watermark and
permission `not-asked`. CLAUDE.md rule 8 says community media needs recorded
permission first, and an `unverified` tag is for an unverified fact, not for
using someone else's footage. ICRA 2025 keeps its placeholder; the one command
to wire it once permission lands is in `docs/qa/requests-race.md` §3.

A1 also recorded `none found` for thirteen 2024-2025 events — every race site
reuses one shared template hero (a studio car photo), so those rows are
placeholders by fact, not by omission.

### §5.2 IFAC 2026 is live

`starts_at` and `ends_at` are on all three entries in
`upcoming_events.json`. `src/components/race/eventState.ts` computes
`upcoming | live | concluded` from those instants alone;
`SeasonChain.tsx` contains **no state literal** — it looks the label up from
the computed state (`STATE_TAG[state]`). `useNow.ts` re-reads the clock every
30 s so a row crosses on its own in an open tab.

Instants are **venue-local**: a race in Busan is live on Busan's calendar.
`2026-08-24T00:00 KST` is `2026-08-23T11:00 EDT`, so the chain reads Live from
late morning Eastern on the 23rd, and flips to concluded at `2026-08-27T11:00
EDT`, which is midnight in Busan. Where no hour-level schedule is published the
instants are the venue-local day bounds of the published dates; IROS keeps its
sourced 09:30 start and gets the 18:00 end of the award ceremony. Every
instant carries a `schedule_note` naming its source.

**Clock test** (`docs/qa/race/clock-test.json`): `Date` frozen in an init
script before app code runs, the real page rendered seven times, nothing
edited between runs.

| faked clock | IFAC 2026 | VTC 2026 Fall | IROS 2026 |
|---|---|---|---|
| 2026-08-23 09:00 EDT (before day 1 in Busan) | `next` | — | — |
| 2026-08-23 18:40 EDT (07:40 Aug 24 in Busan) | **Live** + watch | `next` | — |
| 2026-08-25 12:00 EDT | **Live** + watch | `next` | — |
| 2026-08-27 10:00 EDT (still running in Busan) | **Live** + watch | `next` | — |
| 2026-08-28 12:00 EDT | `concluded` | `next` | — |
| 2026-09-07 12:00 EDT | `concluded` | **Live** + watch | `next` |
| 2026-10-01 12:00 EDT | `concluded` | `concluded` | `concluded` |

Live state is the word **Live**, a 6 px solid `rr-magenta` dot and a magenta
hairline chip. It does not blink and it does not animate in any motion
preference, so there is no reduced-motion variant that can be wrong.

**Stream link.** No stream exists. `https://2026ifac-roboracer.com/` (HTTP 200)
carries exactly one YouTube link, an embed of `tnn4isfdUCE`, which
oEmbed resolves to "2025 4th F1tenth Korea Championship (ICCAS, Incheon) -
Sketch Video" by Unicorn Racing — not a stream. The channel's streams tab is
JS-only and empty to a fetch. So `stream_url` is the race site root and the row
carries the mono `stream link to be confirmed` tag beside it. The `watch` link
falls back to the event's own `url` when no `stream_url` is on file, so it can
never lead nowhere; swap `stream_url` and set `stream_status: "confirmed"` when
a real stream goes up.

### §5.3 Copy

All three banned phrases are gone from the files this stream owns; `grep` over
`src/pages/Race.tsx` and `src/components/race/` returns nothing for "on the
grid", "lining up", "Four steps", "sorted out on Slack".

| where | was | now |
|---|---|---|
| §01 subtitle | "Four steps between reading this and lining up on the grid" | "How to enter" |
| §01 lead | "Registration and the qualification video are the two hard deadlines; everything else can be sorted out on Slack." | "All the information for each competition is on that competition's own site. In short:" |
| §04 subtitle | "Teams on the grid in 2026" | "Teams racing in 2026" |
| step 04 body | "The competition channel on the RoboRacer teams Slack is where schedules, track details and answers are posted." | "Schedules, track details and answers are posted in the competition channel." + "Feel free to reach out on **Slack**." with Slack the link |
| §02 lead | "Three competitions are still to run this year. Each has its own site..." | "Each competition has its own site, its own registration and its own organizing committee." |

The §02 count was deleted rather than rewritten: it is wrong from Aug 28, and
the chain already shows each race's state.

**Two unsourced numbers in the hero were corrected** (facts outrank §5.4's
"keep the hero"):

- "on six continents" → **four**. The 37 held events in `events_map.json` span
  Asia, Europe, North America and South America. No African or Oceanian host.
- "Thirty competitions since 2016" → computed, not typed:
  `max(number)` over the non-upcoming map events = **28** (IV 2026's ordinal),
  so the sentence cannot go stale. It becomes 29 when the map is rebuilt after
  IFAC.

## Checks, this round

| # | Check | Result |
|---|---|---|
| 1 | `npx tsc --noEmit -p tsconfig.app.json` | clean |
| 2 | `npx eslint src/pages/Race.tsx src/components/race/` | clean |
| 3 | Desktop 1440x900 | `race-desktop-1440.png`, 10,221 px, no horizontal overflow |
| 4 | Tablet 768x1024 | `race-tablet-768.png`, 12,022 px |
| 5 | Mobile 390x844 | `race-mobile-390.png`, 12,835 px |
| 6 | Landscape 844x390 | `race-landscape-844.png` + three single frames. Nothing pinned, so the short-viewport trap does not apply |
| 7 | Reduced motion | `race-desktop-1440-rm.png`, `race-mobile-390-rm.png`. Heights identical to the motion runs (10,221 / 12,835): same content, nothing hidden. The live chip has no animation to reduce |
| 8 | Console | **0 errors, 0 warnings, 0 failed requests** across all 7 runs |
| 9 | axe-core 4.10.2 | **0 violations** at 1440, 768 and 390, scanned after a full scroll (`axe-1440.json`, `axe-768.json`, `axe-390.json`). Zero serious, zero critical |
| 10 | Headings | exactly one `h1` ("Come race with us") at every viewport |
| 11 | Document title | `Race - RoboRacer` |
| 12 | Images | 47 in `main`: **0 missing width/height, 0 not lazy, 0 without an alt attribute** (`links.json`) |
| 13 | Links | 46 external, **all 46 resolve**. The Slack invite 403s only to a bot user-agent; through a real browser it is HTTP 200 and redirects to `robo-racer.slack.com/join/...` |
| 14 | Layout shift | see below |
| 15 | Media budget | 7 new WebP, 41-90 KB each. Nothing this stream added is over 1.5 MB |

### Layout shift, found and fixed

The first run measured **CLS 0.246 at 390** — poor. Cause: the hero's
next-race panel only exists once `upcoming_events.json` resolves (t≈490 ms), so
the whole page below jumped down; the performance entry showed section
`race-enter` moving from y=751 out of view. The panel's slot now reserves
`min-h-[640px]` **while the data is in flight only**, deliberately a little
under its real height at every width rendered (609 px at 1440, 622 at 430,
718 at 390, 762 at 360, 845 at 768) so it shrinks the jump without leaving a
gap once the panel is in.

| viewport | before | after |
|---|---|---|
| 1440x900 | 0.0143 | 0.0143 |
| 768x1024 | not measured | 0.0193 |
| 390x844 | **0.2462** | **0.0046** |
| 844x390 | not measured | 0.0103 |

All four are now inside the "good" band. The residual is the nav CTA settling
and is pre-existing.

## Not fixed here

1. **JavaScript disabled still renders an empty page** — unchanged from v1 and
   confirmed again (`race-desktop-1440-nojs.png`: 900 px tall, no `h1`, title
   falls back to `RoboRacer`). `index.html` has no `<noscript>`. This is the
   whole SPA, and both fixes (a prerender step, or a `<noscript>` block) live in
   files this stream does not own. Written up in `docs/qa/requests-race.md` §2.
2. **`UpcomingEvent` does not yet know about `ends_at`, `venue`, `stream_url`,
   `stream_status`** — read through a local intersection type in
   `eventState.ts` so `src/lib/data.ts` (the director's) was not touched.
   Request in `docs/qa/requests-race.md` §1.
3. **30 of 37 timeline rows are still placeholders**, and the seven that are
   not have no recorded credit yet. Blocked on A1/A2's tables, which did not
   land. `race-encode.py` in the session scratchpad re-runs over any new
   `_harvest/pick/race/` file; add the id and alt to
   `src/components/race/racePhotos.ts` and the tile appears.
4. **`teams.json` is still `status: verify` throughout** — unchanged from v1,
   still rendering with the mono `unverified` tag by instruction.

## Screenshots

`docs/qa/race/`: `race-desktop-1440.png`, `race-tablet-768.png`,
`race-mobile-390.png`, `race-landscape-844.png`, `race-desktop-1440-rm.png`,
`race-mobile-390-rm.png`, `race-desktop-1440-nojs.png`,
`hero-single-1440.png`, `landscape-844-{hero,race-season,race-history}.png`,
per-section crops `crop-{desktop-1440,mobile-390}-*.png`, and the machine
evidence `clock-test.json`, `axe-{1440,768,390}.json`, `links.json`,
`console-*.json`.

---

# QA: /race — pages v1

Date: 2026-08-23. Branch `revamp/pages-v1`. Build under test: production
(`npm run build` then `vite preview` on 4185), commit at time of run: the Race
rebuild. Captures in `docs/qa/race/` (git-ignored; they live in the working
tree).

## Verdict: **PASS**

Nothing blocking. Two known limits are architectural and are called out under
"Not fixed here".

## Checks

| # | Check | Result |
|---|---|---|
| 1 | `npm run lint` | clean, no warnings |
| 2 | `npm run build` | green in 6.4 s. `Race` chunk 10.24 kB (gzip 3.49). Largest three: `RacecarAssembly` 1,014 kB, `index` 497 kB, `Landing` 123 kB — all pre-existing, none loaded by /race |
| 3 | Desktop 1440x900 | `docs/qa/race/desktop.png`, page height 7,909 px, no horizontal overflow |
| 4 | Tablet 768x1024 | `docs/qa/race/tablet.png`, 9,605 px, no overflow |
| 5 | Mobile 390x844 | `docs/qa/race/mobile.png`, 11,579 px, no overflow |
| 6 | Landscape 844x390 | `docs/qa/race/landscape.png`, no overflow. Nothing on this page is pinned, so the short-viewport trap does not apply |
| 7 | Reduced motion | `*-rm.png` at all three sizes. Heights identical to the motion runs (7,909 / 9,605 / 11,579): same content, nothing hidden, no empty section. The countdown renders once and does not tick |
| 8 | Console | **0 errors, 0 warnings** at all six runs |
| 9 | Network | **0 failed requests** at all six runs |
| 10 | axe-core | **0 violations**, 0 serious, 0 critical (`docs/qa/race/axe.json`) |
| 11 | Headings | one `h1` ("Come race with us"); four `h2` (Enter, This season, Every race so far, Who competes) plus the spotlight's `h2`. No level skipped |
| 12 | Landmarks | 1 `main`, 1 `nav`, 1 `footer` |
| 13 | Document title | `Race - RoboRacer` |
| 14 | Images | every `<img>` has `width`, `height` and `alt`; none missing |
| 15 | Video | the hero clip has a poster; it is the only video on the page |
| 16 | Links | 46 external hrefs, **45 answer 200**. The one exception is the Slack invite, which returns 403 to a `curl` HEAD because Slack blocks non-browser requests — confirmed valid by Cedric on 2026-08-20. No dead anchor, no empty href, no relative `*.html` |
| 17 | Assets on this page | hero clip 836 KB, poster 108 KB, ten team photos each under 120 KB. Nothing over 1.5 MB |
| 18 | Content markers | no `lorem`, no `placeholder`, no `TODO(content)` reaches the rendered page. The six `TODO(content)` institutions in `teams.json` render as the mono "institution tbc" tag by design |

## The eleven broken links, resolved

Every past-race URL now lives in `data/events_map.source.json` as `url` +
`url_status` (`live` / `archive` / `none`), was checked by hand on 2026-08-23,
and is regenerated into `public/data/events_map.json` by
`scripts/build-world-map.mjs`.

| Was | Now | Status |
|---|---|---|
| `pittsburgh2016.html`, `porto2018.html`, `torino2018.html`, `montreal2019.html`, `columbia2019.html`, `ifac2020.html`, `iros2020.html` — relative paths that resolved against `/race` into the SPA 404 | `https://f1tenth.github.io/<file>` — the old f1tenth.org site, still served from the org's GitHub Pages | live, 200 |
| `""` (empty href, "Spring 2024 course race") — reloaded the page | unlinked text with a mono `no page` tag | none |
| `germany-race2022.f1tenth.org` — 404 | Wayback capture 2022-10-02 | archive |
| `icra2024-race.f1tenth.org` — NXDOMAIN | Wayback capture 2025-09-08 | archive |
| `iros2024-race.f1tenth.org` — NXDOMAIN | Wayback capture 2024-11-07 | archive |

Two more the audit had not caught, found by the link sweep:

| Was | Now | Status |
|---|---|---|
| `korea-race24f1tenth.org` — NXDOMAIN (the domain is also missing a dot) | Wayback capture 2024-07-20 | archive |
| `www.iros2021.org` — **the domain was resold and now serves a proton-therapy conference** | Wayback capture 2022-08-17 | archive |

Every archived link renders with a visible mono `archived page` tag, so a
reader knows before clicking that they are getting a snapshot.

## Not fixed here

1. **JavaScript disabled renders an empty page** (`desktop-nojs.png`). This is
   the whole SPA, not this route: there is no server rendering and no
   pre-render step. `CLAUDE.md` rule 6 asks for content to survive *animations*
   being disabled, which it does (see check 7). Pre-rendering is a
   site-architecture decision for Cedric, not a page fix.
2. **Three tracked files are over the 1.5 MB rule** — `public/about/image-2.JPG`
   (1.68 MB), `public/crew/billy.png` (2.99 MB), `public/crew/Roshan_Benefo.jpeg`
   (2.24 MB). All three are About-page assets and are on About's rebuild list;
   none is referenced by /race. The large hero clips are not in git.
3. **`teams.json` is still `status: verify` throughout.** Rendering them was
   the instruction; every card carries a mono `unverified` tag and six carry
   `institution tbc`. Cedric is sourcing these with Rahul.

## Screenshots

`docs/qa/race/` — `desktop.png`, `tablet.png`, `mobile.png`, `landscape.png`,
`desktop-rm.png`, `tablet-rm.png`, `mobile-rm.png`, `desktop-nojs.png`,
plus `console.json` and `axe.json`.
