# Final QA: revamp/polish-2 at 8bb7118

Independent QA, 2026-09-25. Worktree `roboracer-site-wt/p2-leaderboard`, detached at
`8bb7118 Merge revamp/p2-round3`. Production build (`npm run build`, so `.env.production`
applies and the hero clips come from R2 `pub-...r2.dev`), served with
`npx vite preview --port 4199`, stopped afterwards with `fuser -k 4199/tcp`.
Playwright Python (`~/.venvs/ml`), Chromium with `--use-gl=angle --use-angle=swiftshader
--enable-unsafe-swiftshader`, CDP captures, stitched walks (`scrollTo` + `mouse.wheel(0,1)` + ~1 s
settle). Phone sizes (390x844, 360x740, 844x390) in touch contexts with a mobile UA.
Captures: `docs/qa/polish-2-final/` (PNG, 256-colour, git-ignored by `docs/qa/**/*.png`). Written
step by step; the verdict and fix list were added on top at the end.

Read first: `docs/qa/polish-2-review.md`, `docs/qa/polish-2-fixes.md`, `docs/mobile/AUDIT.md`,
`docs/mobile/VERIFY.md`, `docs/qa/polish-2-round3.md`.

## Verdict per page

| Page | Verdict | Why, in one line |
|---|---|---|
| `/` | **FIX FIRST** | Requests `/media/hero/car-studio.webp`, which 404s on GitHub Pages: a console error on every load at every size (hidden locally by the preview's SPA fallback). Car callouts "POWER BOARD · PCB" and "NVIDIA JETSON ORIN · COMPUTE" print on top of each other at 1536/1366/768 |
| `/about` | **SHIP** | Axe 0, CLS 0.001 to 0.008 (the 0.22 is gone), keyboard and reduced motion clean; one `http://` partner link; people facts are Cedric's (below) |
| `/race` | **SHIP** | All 51 links resolve (24 Wayback captures), axe 0, CLS under 0.0014, registration reads "closed" with "See the race site"; two dates await Cedric (qualification video, VTC) |
| `/research` | **SHIP** | Axe 0, CLS 0.0002, filters and live counts work by keyboard; two narrating leads |
| `/news` | **FIX FIRST** | "The fast and the autonomous ↗" (endeavors.unc.edu) refuses connections two days running; a Wayback capture exists. CLS now 0.0002 (was 0.48) |
| `/assembly` | **SHIP** | Axe 0, all 8 rows and 7 guide links by keyboard, all anchors exist, reduced motion static |
| `/rules` | **FIX FIRST** | Cold-load CLS **0.467 at 1536, 0.486 at 1366**, 0.064 at 844x390: the footer paints at y=250 while `rules.md` loads, then jumps off the screen |
| `/build`, `/learn` | **SHIP** | One window, no overflow, axe 0; only the docs frame's own postMessage warning |

Axe (axe-core 4.12.1, all rules, after the full walk): **0 violations of any impact** on all 9 routes
at 1536x730 and 390x844, and on the reduced-motion runs of `/`, `/about`, `/assembly`. Horizontal
overflow: **none** on 54 walks (9 routes x 6 sizes). Console errors from site code: **none locally**;
see fix 1 for the deployed host.

## Fix list, by severity

### High

1. **`/`, every size, deployed site: missing image logs a console error.** Element: the car
   chapter's studio photo (`ExplodedModel.tsx:59`, `CAR_STUDIO_PHOTO = "/media/hero/car-studio.webp"`;
   HANDOFF section 2 item 5 says the file was never produced). Observation: `vite preview` answers
   with `index.html` (200, `text/html`), so no local run shows it; GitHub Pages and the Cloudflare
   preview answer 404, and Chromium logs `Failed to load resource: the server responded with a status
   of 404 (Not Found)` on every landing load. Repro: `curl -sI https://roboracer.ai/media/hero/car-studio.webp`
   -> `HTTP/2 404`; or route that URL to a 404 in Playwright and read the console. Fix: do not render
   the photo slot until the file exists, or produce the file. No other masked 404 on any route.
2. **`/rules`: layout shift on first load, CLS 0.4668 (1536x730), 0.4864 (1366x650), 0.0641
   (844x390).** Element: `Rules.tsx` renders the source line and "Loading the rules." with no reserved
   height; the footer paints at y=250 (1536), then the rulebook pushes it off
   (`footer.bg-ink-950 y250->0 h322->0`, 0.4397). Repro: fresh 1536x730 window, open `/rules`. Fix:
   reserve at least a window of height for the loading state (for example `min-h-[100svh]` on the
   rulebook container). `/rules` was outside the previous review and the mobile pass.

### Medium

3. **`/`: car callouts collide.** In the "Race-ready" state "POWER BOARD · PCB" and "NVIDIA JETSON
   ORIN · COMPUTE" overprint each other at 1536, 1366 and 768; at 768 in the exploded state "VESC ·
   MOTOR CONTROLLER" sits directly on "TRAXXAS SLASH 4X4 · 1/10 CHASSIS". Visible on every desktop
   visit; also in the 2026-09-24 capture. Repro: scroll to "02 The car" at 1536x730, first state.
   Evidence `walk-home-1536x730.png` frame 6, `walk-home-1366x650.png` frame 6,
   `walk-home-768x1024.png` frames 6-7.
4. **`/news`: dead link.** "The fast and the autonomous ↗" (2020, UNC Research) ->
   `https://endeavors.unc.edu/the-fast-and-the-autonomous/`: `ERR_CONNECTION_REFUSED` in curl and
   Chromium (also on 2026-09-24). Fix: set the item's archive to
   `http://web.archive.org/web/20260515201552/https://endeavors.unc.edu/the-fast-and-the-autonomous/`.
5. **`/` hero: the clip that stalls keeps stalling.** 1536x730, 5 Mbit/s / 40 ms, a browser that does
   not report a slower `navigator.connection` (Safari, Firefox): the stall flag is set during
   `hero-race-01-1920.mp4`'s first wait, later clips load as 960, but that clip plays its 1920 file to
   the end: 18 waits, about 13.6 s frozen while an 11.1 s clip plays. Fix: on the stall, reload the
   current clip as its 960 at `currentTime`, or cut to the next clip once its 960 is ready. Repro:
   step 6, supplementary run. (First frame 2.1 s, 0 requests in 30 s at the footer: both fixed.)
6. **Facts that disagree with the content skill (Cedric):** qualification video "September 9, 2026"
   on `/race` (skill Sep 12, live race site Sep 18); VTC 2026 Fall "September 6, 2026" (skill Sep 6-9;
   the JSON's own note cites Sep 6-9); ICRA 2026 "about 200 people and 30 teams" (skill 180+ / 35,
   VERIFY); UPenn at ICRA 2026 "5th head to head" (skill "5th overall"); Yon Vanommeslaeghe "Postdoc"
   (skill "Visiting Researcher"); Ayagoz Smagulova shown with no role (recorded as TODO(content) in
   `docs/qa/about.md`; the skill says never publish a person without a role); "6 continents" is an
   estimate in `community.json`; `registration_deadline` Sep 9 while its note says "display the Sep 5
   date plainly" and `/news` says Sep 5.

### Low

7. The footer (every route that has one) at desktop still uses the legacy container (`mx-auto max-w-7xl px-6
   lg:px-16 xl:px-24 2xl:px-32`): its content starts at x=358 at 1536 while every section starts at
   x=67. Repro: `/race` at 1536, compare the footer wordmark with any h2.
8. `/` Platform dial at 1536 (Learn and Research states): the mono indices "01" to "03" print over the neighbouring pillar
   words (`PlatformPanel.tsx` row `<p>{row.n}</p>` above a scaled h3). Pre-existing.
9. `/about` partner logo KATECH links `http://www.katech.re.kr/`; use https.
10. Join ledger: "6 continents" drops alone to a second row at 360, 768 and 844x390.
11. `/research` is 32,694 px at 1366 and 37,082 px at 768: the folds from the mobile pass apply
    below `md` only.
12. The landing hero's second crossfade `<video>` has no `poster` attribute (never visible blank).
13. Copy: the open rows in step 8 (fragment "Team, 1st place ICRA 2026", "· verify" in the Join
    caption, "The Roboracer Foundation" vs "RoboRacer Foundation", "UNICORN_Racing" vs "UNICORN
    Racing", "September 28-30, 2026", footer "All rights reserved" beside "Creative Commons
    License", /news "Researcher - xLAB", narrating leads on /about, /race, /research).
14. Weight, for the record: the landing moves 29.7 MB in its first 7 s at 1536 on a fast link
    (22.8 MB hero video: the playing clip and the next one), 10.8 MB at 390; `/race` loads its
    1.67 MB hero clip at every width.

## Summary for Cedric

1. Six pages can ship (about, race, research, assembly, build, learn); landing, news and rules need small fixes first.
2. Landing: the never-made `car-studio.webp` 404s on GitHub Pages (a console error on every visit), and two car labels print on top of each other.
3. Rules jumps on first load (CLS 0.47 at 1536): the footer shows, then the rulebook pushes it away.
4. News has one dead link (UNC Endeavors); a Wayback copy exists. All 51 race links now resolve.
5. Axe is clean everywhere; the old CLS on news and about is gone; a few dates and names still need your call.

## Step 1: lint and build

- `npm run lint`: pass, 0 warnings, 0 errors (2.3 s).
- `npm run build` (`tsc -b && vite build && spa-fallback`): pass, built in 5.1 s. One warning,
  unchanged in kind: `(!) Some chunks are larger than 500 kB after minification`
  (`RacecarAssembly-*.js`, lazy, 1,004.58 kB / 277.69 kB gzip).
- Bundle against the previous review (`cd25d85`) and deployed main (`e82e747`), bytes:

| Chunk | main | cd25d85 | 8bb7118 | delta vs cd25d85 |
|---|---|---|---|---|
| `index-*.js` (shared) | 385,434 | 385,865 | 388,254 (135.11 kB gzip) | +2.4 KB |
| `index-*.css` | 69,815 | 75,587 | 90,578 (18.49 kB gzip) | +15.0 KB (mobile pass variants) |
| `Landing-*.js` | 110,004 | 113,671 | 117,616 | +3.9 KB |
| `About-*.js` | 37,714 | 39,856 | 43,258 | +3.4 KB |
| `Race-*.js` | 15,983 | 24,728 | 29,403 | +4.7 KB (leaderboard hardening) |
| `Assembly-*.js` | 8,608 | 8,038 | 8,932 | +0.9 KB |
| `RacecarAssembly-*.js` (lazy) | 1,014,035 | 1,004,582 | 1,004,582 | 0 |
| all `dist/assets/` | 1,836,533 | 1,808,481 | 1,855,699 | +47 KB |

  New split chunks: `HeroChapter` 24.1 KB, `CommunityJoin` 17.0 KB, `ExplodedModelScene` 12.4 KB.
  Against `docs/AUDIT.md` (one 1,229 kB chunk on every route): three.js stays out of the shared chunk.

## Step 2: walks at 1536x730 and 390x844 (console, overflow, axe)

Every route walked top to bottom (one viewport per step, 1 s settle), then axe
(`axe-playwright-python`, axe-core 4.12.1, all rules) on the fully walked page. Overflow is checked
three ways at every step: `scrollWidth` vs the window, every text node's rects against its nearest
clipping ancestor, and every box crossing the window edge that no ancestor clips (html/body use
`overflow-x: clip`, so `scrollWidth` alone would hide a real overflow).

| Route | 1536: height / frames | 390: height / frames | scrollWidth 1536 / 390 | crossing boxes, clipped text | console errors | page errors | same-origin 4xx/5xx | axe violations 1536 / 390 |
|---|---|---|---|---|---|---|---|---|
| `/` | 15,856 / 22 | 15,539 / 19 | 1536 / 390 | none real | 0 | 0 | 0 | 0 / 0 |
| `/about` | 15,595 / 22 | 20,539 / 25 | 1536 / 390 | none real | 0 | 0 | 0 | 0 / 0 |
| `/race` | 7,624 / 11 | 10,236 / 13 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |
| `/research` | 34,944 / 48 | 9,712 / 12 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |
| `/news` | 7,887 / 11 | 13,455 / 16 | 1536 / 390 | none | 0 | 1 (LinkedIn frame) | 0 | 0 / 0 |
| `/assembly` | 730 / 1 | 844 / 1 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |
| `/rules` | 14,937 / 21 | 31,576 / 38 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |
| `/build` | 730 / 1 | 844 / 1 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |
| `/learn` | 730 / 1 | 844 / 1 | 1536 / 390 | none | 0 | 0 | 0 | 0 / 0 |

- "None real": the scan's hits on `/` and `/about` are all moving-strip items (Highlights, partner
  ribbon, "From the community" cards) partly outside their strip, the phone carousel's next card
  (`w-[86vw] snap-start`), and the research carousel's intended `line-clamp-3` title/abstract and
  the ellipsised topic line ("1 / 11 · RA-L 2026 · control and MPC · safety and ..."). No text is
  cut by a box it belongs to.
- **Axe: 0 violations of any impact on all 18 loads.**
- One `h1` per route, no skipped heading levels, `main` + `nav` everywhere, `footer` everywhere except
  the three workspace routes (`/assembly`, `/build`, `/learn`, by design). No `<img>` without `alt`
  or without `width`/`height`. Every `target="_blank"` has `rel="noopener noreferrer"`. No em dash
  (U+2014) in any rendered text node.
- `<video>` without a poster: one, the landing hero's second crossfade layer
  (`hero-race-01-1920.mp4` at 1536, `-960` at 390). It is under the first layer until the
  crossfade, so nothing blank shows; noted, not a defect.
- Console warnings (all third-party or headless): `No available adapters.` (YouTube player's WebGPU
  probe), `Failed to execute 'postMessage' ... ('https://www.youtube-nocookie.com')` (landing, about),
  the same for `https://www.linkedin.com` (news) and for the readthedocs frame (`/build`, `/learn`).
  Page error on /news at 390 only, from inside LinkedIn's frame: `Failed to execute
  'getInstalledRelatedApps' on 'Navigator': getInstalledRelatedApps() is only supported in top-level
  browsing contexts.` (known, `docs/mobile/VERIFY.md`).
- Failed requests: aborted media ranges (`platform-race-960.mp4`, `platform-research-mppi-960.mp4`,
  normal when a clip is swapped), YouTube `api/stats/qoe`, LinkedIn `static.licdn.com` /
  `media.licdn.com` assets. No mixed content.
- The landing's YouTube reel still reads "This video is unavailable" in headless Chromium (Join
  section, last frame of `walk-home-1536x730.png`); known, oEmbed answers 200; check once in a real
  browser.
- Evidence: `walk-<route>-1536x730.png`, `walk-<route>-390x844.png` (stitched, one frame per
  viewport; the fixed nav repeats in every frame by method).

Seen in the walks (details in the fix list at the end):
- Landing, 03 Platform dial at 1536: the mono indices "02", "03" print over the neighbouring
  pillar words ("02" across the foot of "Build", "03" across the top of "Race"; in the Research
  state "01" to "03" across all three). Present in the previous review's capture too
  (`docs/qa/polish-2/landing-1536x730-full.png`), so not new, but visible.
- The footer's content column at 1536 starts at x=358 while every section above starts at x=66
  (the shared `max-w-page` edge); the footer reads as a narrower, centred block.
- `/research` at 1536 is 34,944 px (48 screens): the phone folds from the mobile pass (4 featured,
  years before 2025 in a `<details>`) are phone-only, so desktop lists all 137 papers open.

## Step 3: keyboard and reduced motion

### Keyboard (1536x730 unless noted; every stop checked for a visible ring, in view, and not covered, via `elementFromPoint`)

| Target | Result |
|---|---|
| Desktop nav (`/`) | 11 stops in order: wordmark, About, Build, Learn, Race, Rules, Research, News, Simulator, Join the Slack, Start here. 2px outline on each, none covered. |
| "Start here" from `/` | Enter lands on `/#start`, the section at top 0, focus on `#start`; the next four Tabs are Build a car (`/build`), Learn autonomy (`/learn`), Race with us (`/race`), Sponsor a race (`mailto:...?subject=RoboRacer%20sponsorship`), each with a violet 2px ring, in view (`kbd-path1-1536.png`). |
| "Start here" from `/race` | Same: `/#start`, top 0, focus on the section, next Tab = "Build a car". |
| /race board chips and link | Chip 1 "Fastest clean lap" (`aria-pressed=true`) after 36 Tabs; chip 2 is the next stop; Enter flips it to `aria-pressed=true`; the next stop is "See the full leaderboard ↗ (opens in a new tab)" with `?lab=lab-4-follow-the-gap-obstacles` (follows the chip). Rings visible (`kbd-race-chip1-1536.png`, `kbd-race-board-link-1536.png`). |
| /about spinoff links | "Neobotics ↗ (opens in a new tab)" then "LAMARRacing ↗ (opens in a new tab)", consecutive stops, ring visible (`kbd-about-spinoff-1536.png`). The Quanser card is not rendered (as designed). |
| /assembly part rows | Row 01 is Tab stop 13 (after the nav and "Open the build guide"). For each of the 8 rows: Enter sets `aria-pressed=true`, the next Tab is that row's "Build guide: ..." link (7 rows; Wheels has none, its next stop is row 03), in view and uncovered; Escape clears `aria-pressed` and keeps focus on the row; ArrowDown moves to the next row. Guide hrefs: `lower_level_chassis.html`, `all_together.html#attaching-the-ppm-cable`, `upper_level_chassis.html` (+ `#mounting-the-vesc`, `#mounting-the-nvidia-jetson-nx`, `#mounting-the-powerboard`, `#mounting-the-lidar`). |
| /research filters | "All" (`aria-pressed=true`) at Tab 13, then "Reinforcement learning"; Enter sets it pressed and the live regions change from "17 featured" / "137 of 137 papers" to "4 featured · Reinforcement learning" / "33 of 137 papers · Reinforcement learning". |
| /news lead links | Headline link (Tab 12), "Read the post on LinkedIn ↗", "See the full results ↗" (`2026ifac-roboracer.com/en/results.html`), rings visible (`kbd-news-lead-1536.png`). The next Tab enters LinkedIn's frame (third-party focus, the frame itself shows no ring). |
| Phone menu, 390x844 (`/race`) | Wordmark, Start here, Open menu; Enter opens (focus stays on "Close menu", `aria-expanded=true`); 16 Tabs loop About ... Join the Slack, wordmark, Start here, Close menu, About ...; Shift+Tab loops back the same way; focus never leaves the nav; a 600 px wheel does not move the page; Escape closes, focus returns to "Open menu" (`aria-expanded=false`), panel unmounted (`kbd-menu-open-390x844.png`). |
| Phone menu, 360x740 | Same, with "Start here" as the menu's first link (moved out of the bar under 390). |
| Phone menu, 844x390 | Same loop, scroll lock and Escape; all links reachable. |

Hidden research-carousel cards (opacity 0) are `aria-hidden` and not Tab stops, with motion on and
under reduced motion: the Tab order is "Read the paper" of the visible card, then "Go to paper 1..11".

### Reduced motion (`prefers-reduced-motion: reduce`, full walk, then axe)

| Route | Height 1536 / 390 (motion on) | Text at opacity 0 in `main` | `<video>` elements | Running animations | axe |
|---|---|---|---|---|---|
| `/` | 12,144 (15,856) / 16,623 (15,539) | 0 real (72 nodes = the 10 `aria-hidden` stacked carousel cards at 1536) | 0 | 0 | 0 / 0 |
| `/about` | 15,608 / 20,526 | 0 | 0 | 0 | 0 / 0 |
| `/assembly` | 730 / 844 | 0 | 0 | 0 | 0 / 0 |

Static and complete: hero poster, then the headline on paper; car chapter as the static render with
captions; platform as posters with the four pillars listed; map in its final state (90+, 20+, 1,000+,
30+); partners as one grid; community as a swiped row; no YouTube iframe mounts. No console output.
Evidence `walk-home-1536x730-reduced.png`, `walk-home-390x844-reduced.png`, and the same for
`about` and `assembly`.

## Step 4: layout shift on cold load

Method: a fresh context per load (no cache), a `layout-shift` PerformanceObserver injected before
any script, the sum of all shifts without recent input read at 7 s (8.5 s when delayed), no
scrolling. "Delayed": every `**/data/*.json` request held 1.2 s by a route. First viewport captured
at 0.5 s and 3 s: `cls-<route>-<size>-<mode>-t0.5s.png` / `-t3s.png`.

| Route | 1536 cold | 1536 delayed | 390 cold | 390 delayed |
|---|---|---|---|---|
| `/` | 0.0001 | 0.0001 | 0 | 0 |
| `/about` | 0.0025 | 0.0025 | 0.0028 | 0.0028 |
| `/race` | 0.0006 | 0.0004 | 0 | 0.0013 |
| `/research` | 0.0001 | 0.0002 | 0 | 0 |
| `/news` | 0.0002 | 0.0001 | 0 | 0 |
| `/assembly` | 0.0003 | 0.0003 | 0 | 0 |
| **`/rules`** | **0.4668** | **0.4668** | 0 | 0 |
| `/build` | 0.0001 | 0.0001 | 0 | 0 |
| `/learn` | 0.0001 | 0.0001 | 0 | 0 |

- The previous review's /news (0.48 / 0.49) and /about (0.22 / 0.04) shifts are gone, and the
  delayed-JSON runs match the fixes document (`docs/qa/polish-2-fixes.md` batch 1, items 2 and 3).
  What is left on /about is the hero ledger's counters changing width (`#text y126->126`), 0.0003
  per tick.
- **New: `/rules` at 1536, CLS 0.4668 on every cold load**, JSON delay irrelevant. Source entries:
  `footer.bg-ink-950 y250->0 h322->0` (0.4397 at ~0.5 s) and `div.rules-body y158->142` (0.0270).
  `Rules.tsx` renders the source line and "Loading the rules." with no reserved height while
  `rules.md` is fetched, so the footer paints at y=250 in the first viewport, then the rulebook
  pushes it off the screen. At 390 the footer starts below the fold, hence 0. Repro: open
  `/rules` in a fresh 1536x730 window; the footer flashes, then the page jumps.
  `/rules` was not measured by the previous review or the mobile pass.

First-load weight (cold, 7 s at the top, no scrolling; CDP `encodedDataLength`):

| Route | 1536 | 390 | Largest assets |
|---|---|---|---|
| `/` | 29.7 MB, 243 requests | 10.8 MB, 137 | 1536: `hero-race-02-1920.mp4` 11.95 MB, `hero-race-01-1920.mp4` 9.08 MB, `hero-iv-start-v2-1280.mp4` 1.75 MB (22.8 MB of hero video: the playing clip plus the next one preloading), HDR 0.34 MB, 3D chunk; 390: the 960 encodes (7.05 MB) |
| `/about` | 1.9 MB, 37 | 1.7 MB, 33 | `index-*.js` 0.52 MB, `about-icra-group-1600.webp` 0.35 MB |
| `/race` | 3.2 MB, 26 | 3.2 MB, 26 | `race-iros2026-hero-1272.mp4` 1.67 MB at every width (RACE-06, deferred) |
| `/research` | 3.2 MB, 32 | 2.1 MB, 25 | `research-zang-2026-sit-1200.webp` 0.42 MB, `publications.json` 0.26 MB |
| `/news` | 7.5 MB, 59 | 1.3 MB, 19 | LinkedIn's frame (`static.licdn.com` 0.94 MB) at 1536 |
| `/assembly` | 3.2 MB, 24 | 3.2 MB, 24 | `RacecarAssembly-*.js` 1.28 MB, `studio_small_03_512.hdr` 0.41 MB |
| `/rules` | 0.9 MB, 12 | 0.9 MB, 12 | shared JS |
| `/build`, `/learn` | 4.4 / 3.0 MB | 4.5 / 3.0 MB | the readthedocs frame (`f1tenth_NX.png` 1.7 MB) |

No layout shift is visible between the 0.5 s and 3 s captures on any route except `/rules` at 1536,
where the shift happens before 0.5 s (both captures show the rulebook).

## Step 5: external links on /about, /race, /assembly, /news

287 unique external hrefs collected from the rendered DOM (1536 and 390, after the full walk),
checked with `curl -L` (Chrome UA, HEAD then GET), Wayback captures one at a time; the failures
re-checked by navigating to them in Chromium.

| Page | hrefs | 200 | Not 200 |
|---|---|---|---|
| `/race` | 51 | **51** (24 Wayback captures included) | none |
| `/assembly` | 4 | **4** (Simulator, Slack, build guide index, `all_together`; the 7 per-part guide links render on selection: `lower_level_chassis`, `upper_level_chassis`, `all_together` answer 200 and all five anchors exist today) | none |
| `/news` | 36 | 26 | 8 LinkedIn 429 (bot wall), 1 `medium.com` 403 to curl (200 in Chromium), **1 unreachable** |
| `/about` | 233 | 170 | 50 LinkedIn 429 + 9 LinkedIn 999 (bot wall; 200 in Chromium, or the sign-up wall), 3 x 403 to curl (`engineering.virginia.edu`, `columbia.edu` 200 in Chromium; `ffg.at` Cloudflare challenge), 1 `http://` link |

Failures, after the browser re-check:
1. **/news, "The fast and the autonomous ↗"** (`https://endeavors.unc.edu/the-fast-and-the-autonomous/`,
   2020 archive card): `ERR_CONNECTION_REFUSED` from curl and from Chromium (208.113.129.221:443),
   same as on 2026-09-24. `www.unc.edu` answers 200 from here, so the Endeavors host itself refuses.
   A Wayback capture exists: `http://web.archive.org/web/20260515201552/https://endeavors.unc.edu/the-fast-and-the-autonomous/`
   (availability API, status 200). Fix: add it as the item's `archive`, like the race timeline.
2. **/about partner logo KATECH** links `http://www.katech.re.kr/` (plain http; it redirects to
   https, whose certificate chain curl cannot verify, `rc=60`; Chromium loads it, 200). Use the
   https URL.
3. `https://www.ffg.at/` (partner logo, /about): Cloudflare "Just a moment..." 403 to both; it is
   a bot challenge, a person gets through. Not a defect.

All 24 Wayback captures on /race answer 200 (fetched one by one with a 2 s gap; the Korea 2024 one
is the real 2024 domain `korea-race24f1tenth.org`, title "The 3rd F1Tenth Korea Championship").
Every `target="_blank"` link carries `rel="noopener noreferrer"` (all 9 routes, step 2).
Raw results: scratchpad `links-about_race_assembly_news.json` (not in git).

## Step 6: hero at 1536x730 under 5 Mbit/s, 40 ms RTT (CDP throttling)

`Network.emulateNetworkConditions` (625,000 B/s down and up, latency 40 ms), fresh context, video
events recorded from the first script, clips served from R2 (production build).
Note: CDP throttling does not change `navigator.connection` here (downlink read 10 and 9.5), so
`linkCanStream()` keeps the desktop encodes: this run is what a Safari or Firefox visitor (no
Network Information API) on a 5 Mbit/s link gets. A Chrome visitor on a real 5 Mbit/s link reports
a lower downlink and gets the 960 race encodes from the start.

| | Run 1 | Run 2 |
|---|---|---|
| Poster `hero-fpv-poster.webp` (37 KB) loaded | 0.31 s | 0.31 s |
| LCP | 0.94 s | 0.83 s |
| First clip requested | `hero-iv-start-v2-1280.mp4` at 0.85 s | same, 0.82 s |
| **First video frame** (`loadeddata` / `playing`) | **2.08 s** | **2.15 s** |
| Stalls in the first second of playback | 2 (0.53 s + 0.16 s) | 2 (0.52 s + 0.10 s) |
| Next clip requested | `hero-race-01-1920.mp4` at 4.81 s | 4.78 s |
| Scrolled to the footer at | 8.1 s (clip 0 paused at 2.72 s) | 7.9 s (paused at 2.53 s) |
| **Hero requests during 30 s at the footer** | **0** | **0** |
| Hero videos at the footer | both paused, `currentTime` frozen for 30 s | same |

The round-3 fix holds: nothing downloads while the reader is at the footer.

Supplementary run, same throttle, reader stays at the top for 40 s (`hero-throttled-top-40s.png`):
requests `hero-iv-start-v2-1280` (0.8 s), `hero-race-01-1920` (4.8 s), then `hero-race-02-960`
(25.7 s) and `hero-race-03-960` (34.7 s). The stall flag (`sessionStorage rr-link-stalled=1`) is set
during `race-01-1920`'s first 1.7 s wait, so every later clip is the 960 encode, as designed. But
**the clip that stalled keeps playing the 1920 file to its end: 18 `waiting` events on
`hero-race-01-1920.mp4` between 8.4 s and 31.7 s, about 13.6 s frozen while an 11.1 s clip plays**
(plus 1.9 s on clip 0). What the visitor sees in the first 33 s at the top is roughly half frozen frames.
`docs/media/HERO_PERF.md` measured "17 s of its first 55" frozen before the fixes; the fixes moved
the damage into one clip instead of removing it.

Also found here: the landing requests `/media/hero/car-studio.webp`, which does not exist
(HANDOFF section 2 item 5). `vite preview` answers it with the SPA fallback (200, text/html), so no
local run shows an error, but GitHub Pages and the Cloudflare preview answer **404**
(`curl -sI https://roboracer.ai/media/hero/car-studio.webp` -> `HTTP/2 404`). With the 404
simulated, Chromium logs on every desktop landing load:
`Failed to load resource: the server responded with a status of 404 (Not Found)` for
`/media/hero/car-studio.webp`. That is a console error on the deployed site.

## Step 7: walks at 1366x650, 768x1024, 360x740, 844x390

Same method as step 2 (no axe at these sizes, per the brief). 768x1024 is a touch tablet context,
360x740 and 844x390 are touch phones with a mobile UA. Added: a detector for same-origin
image/media/fetch/script requests answered with `text/html`, i.e. files that `vite preview` masks
with the SPA fallback but a static host answers 404.

| Route | 1366x650 | 768x1024 | 360x740 | 844x390 |
|---|---|---|---|---|
| `/` | 14,426 px / 23 frames | 20,204 / 20 | 15,295 / 21 | 10,994 / 29 |
| `/about` | 14,617 / 23 | 18,208 / 18 | 20,889 / 29 | 15,291 / 40 |
| `/race` | 7,147 / 11 | 8,891 / 9 | 10,498 / 15 | 7,916 / 21 |
| `/research` | 32,694 / 51 | 37,082 / 37 | 10,319 / 14 | 7,600 / 20 |
| `/news` | 7,399 / 12 | 8,811 / 9 | 13,792 / 19 | 8,262 / 22 |
| `/assembly`, `/build`, `/learn` | one window | one window | one window | one window |
| `/rules` | 14,105 / 22 | 21,895 / 22 | 33,903 / 46 | 21,820 / 56 |

- **Horizontal overflow: none** at any size on any route (`scrollWidth` = window width; no box
  crossing the edge that nothing clips). **Clipped text: none** beyond the moving strips and the
  intended carousel clamps.
- Console errors from site code: none. Third-party: LinkedIn's frame logs
  `requestStorageAccess: Permission denied.` (1366) and the `getInstalledRelatedApps` page error
  (768, 360, 844x390). Same-origin 4xx/5xx: none.
- **Masked 404 on every landing load at every size: `/media/hero/car-studio.webp`** (served as
  `text/html` by the preview's SPA fallback; 404 on GitHub Pages, see step 6). No other masked file
  on any route.
- `/rules` CLS on a cold load at the other sizes: **1366x650 0.4864** (footer again, `y234->0`),
  **844x390 0.0641** (`div.rules-body y165->144`), 768x1024 0, 360x740 0. `/about`: 0.0030 / 0.0008 /
  0.0036 / 0.0081; `/news`: 0.0002 / 0 / 0 / 0.

Seen in the walks:
- **Car chapter callouts collide in the "Race-ready" state at 1536, 1366 and 768**: "POWER BOARD ·
  PCB" and "NVIDIA JETSON ORIN · COMPUTE" print on top of each other (1536: both at y~270 of the
  chapter frame; 1366 the same; 768 overlapping by ~100 px). At 768 in the exploded state "VESC ·
  MOTOR CONTROLLER" sits directly on "TRAXXAS SLASH 4X4 · 1/10 CHASSIS" and reads as one label.
  Present in the previous review's 1536 capture as well, not flagged there. Evidence:
  `walk-home-1536x730.png` frame 6, `walk-home-1366x650.png` frame 6, `walk-home-768x1024.png`
  frames 6-7. (Fix b11478b handled label vs step copy, not label vs label.)
- Join ledger at 360, 768 and 844x390: "3,000+ members · 25 time zones" on one row and
  "6 continents" alone on the next (at 390 and desktop all three fit on one row).
- `/research` at 768x1024 is 37,082 px and at 1366 32,694 px: the phone folds stop at `sm`/`md`.
- 844x390 and 360: menu, hero headline, car chapter, map and teams read as the mobile pass
  describes (`docs/mobile/VERIFY.md`); nothing regressed.

## Step 8: copy against docs/copy/BRIEF.md

Every route's rendered text dumped at 1536 after a full walk (headings, paragraphs, list items,
captions, buttons, links, alt text) and read once. `/rules` body is the rulebook copied byte for
byte from `f1tenth/roboracer_rules` (out of scope); `/build` and `/learn` carry only "Build the
car" / "Learn" (sr-only h1) and "Open the docs ↗". No banned word outside quoted paper abstracts
except "journey" (below); no em dash anywhere; no exclamation mark.

Still breaking a rule. "Kept" = left on purpose in `docs/copy/*.md` (Cedric's wording or a
recorded decision); listed so the decision is visible, not as new defects.

| Page | Text | Rule | Status |
|---|---|---|---|
| `/` | "RoboRacer is an open-source race car at one-tenth scale. Program it to drive itself, then race it at the largest robotics conferences." (22 words) | 1 | Cedric's line (comment in `Landing.tsx`) |
| `/` | "Next race" / "Come to our next race" | 6 | kept (`docs/copy/landing.md`) |
| `/` | map key "hosted a race, deeper with more" | 8 | kept |
| `/`, `/about`, `/news` | community card meta "Team, 1st place ICRA 2026" | 8, a fragment | open |
| `/`, `/about` | Join photo caption "4th F1TENTH Korea Championship · Incheon, Nov 2025 · verify" | 8, a status word in public copy | open (data `community.json`) |
| `/`, `/about` | Open Robotics card "Open Robotics on how far the community has come." | 7 | its `excerpt_note` is `TODO(content): one sentence in Cedric's words; this draft is ours` |
| `/`, `/about`, `/news` | "The Roboracer Foundation" (card name, bylines) vs "RoboRacer Foundation" (footer, /news result line) | 7, name spelling | open |
| `/`, `/race` vs `/news`, `/about` | team "UNICORN_Racing" (team cards) vs "UNICORN Racing" (community card, news) | 7, one name per team | open |
| `/`, `/race` card | "September 28-30, 2026" (landing spotlight, /race "This season" card) | voice: "September 28 to 30, 2026" in prose, "Sep 28-30, 2026" in cards; the content skill's FINAL spotlight line is "September 28 to 30, 2026, Pittsburgh" | open |
| footer, every route | "© 2026 RoboRacer Foundation. All rights reserved." beside "Creative Commons License"; "Join Slack" (footer) vs "Join the Slack" (nav, Join) | 8, contradicts itself; one label per action | open |
| `/about` | "The four parts of RoboRacer. Each has its own page." | 5 | open (flagged 2026-09-24) |
| `/about` | "Each name links to the page its title comes from. A verify tag means we haven't confirmed the role yet." | 5 | kept (rewritten in the copy pass) |
| `/about` | "Everyone with a public commit in the f1tenth GitHub organization. The car, the simulator, the ROS stack and the course labs are all built in the open." (28 words) | 1 | open |
| `/about` | caption "group pic ICRA 2026" | 8 | kept (Cedric, c22450d) |
| `/about` | "A freshman's journey: learning to drive and race" | 2, "journey" | kept (Cedric, `docs/copy/data-videos.md`) |
| `/race` | "Enter" / "How to enter" | 6 | open |
| `/race` | "Each competition's own site has the details. In short:" | 5 | rewritten in the copy pass, still narrates |
| `/race` | "This season" / "The rest of 2026" above IFAC 2026 and VTC 2026 Fall, both tagged "concluded" | 3 | kept |
| `/race` | "Every race so far" / "From Pittsburgh 2016 to Pittsburgh 2026" | 2, "from X to Y" | kept (`docs/copy/race.md`) |
| `/race` | h2 "IROS 2026, Pittsburgh" over "September 28 to 30, 2026, Pittsburgh" | 8, Pittsburgh twice | open (the second line is the skill's FINAL wording, so the h2 is what would change) |
| `/research` | "Papers that build on RoboRacer. Filter by topic, and each topic links to its own Scholar search." | 5 | rewritten, still narrates the UI |
| `/research` | "By year, newest first. The topic filter above works here too." | 5 | rewritten, still narrates |
| `/news` | "Cedric Hollande · Researcher - xLAB, University of Pennsylvania" and "Result: Cedric Hollande, Researcher - xLAB." | 2, a spaced hyphen used as a dash | open (flagged 2026-09-24) |
| `/news` | lead "274 racers and 56 teams in Busan: the largest race in RoboRacer history" (13 words) and its 40-word lead | 1, 6 (if news titles are not exempt) | open |
| `/news` | "Registration for the 31st competition at IROS 2026 closes September 5" / "Register your team by September 5." | 3, the date disagrees with the site's own deadline data (Sep 9) | Cedric (`docs/CONTENT.md`) |
| `/assembly` | none | | |

## Step 9: facts against .claude/skills/roboracer-content/SKILL.md

| # | Fact | Skill | On the page | Match |
|---|---|---|---|---|
| 1 | IROS 2026 dates and city | Sep 28 to 30, 2026, Pittsburgh; public line "September 28 to 30, 2026, Pittsburgh" | `/race` exact; `/about` "IROS 2026 in Pittsburgh, September 28 to 30"; `/` "September 28-30, 2026" | yes (format only on `/`, see step 8) |
| 2 | Check-in and practice | Sep 27, never a competition day | "Check-in and practice September 27" (`/`, `/race`, `/news`) | yes |
| 3 | Format | multi-agent, up to 4 cars | "multi-agent, up to 4 cars"; "IROS 2026 adds races with up to four cars on track" | yes |
| 4 | Registration deadline | Sep 5 (display plainly) | spotlights: "registration closed" (no date); `/news` Aug 23: "closes September 5"; `upcoming_events.json` `registration_deadline` "September 9, 2026" with a note that says "display the Sep 5 date plainly" | **data disagrees with itself and with the skill** (open in `docs/CONTENT.md`) |
| 5 | Qualification video due | Sep 12, 2026 | `/race` Enter ledger "qualification video due September 9, 2026" | **no** (open in `docs/CONTENT.md`; live site says Sep 18) |
| 6 | Scale | 90+ universities, 20+ countries, 1,000+ publications, "30 competitions held" until IROS | 90+, 20+, 1,000+ everywhere; "30" (`/about`, `/race`), "30+" (`/` map, Highlights) | yes |
| 7 | Origin | Penn, 2016; faculty lead Rahul Mangharam | "RoboRacer started at the University of Pennsylvania in 2016. Rahul Mangharam leads it from Penn's xLAB." | yes; the next sentence, "Madhur Behl ... co-founded the platform and the competition series", is not in the skill (sourced to UVA's faculty page, which says so) |
| 8 | IV 2026 podium | 1st Thunderbolt (UPenn, Cedric Hollande, MPPI); 2nd 404 Racers (Milan Manoj, Manasi Shrekhar); 3rd West Virginia University | news "Thunderbolt wins ... Cedric Hollande (UPenn) won with an MPPI controller. 404 Racers ... second and West Virginia University third"; team cards the same (winner listed as "UPenn Autonomous Racing") | yes (team name differs between news and team card) |
| 9 | ICRA 2026 size | "180+ competitors and 35 registered teams" (VERIFY) | "About 200 people and 30 teams from more than 12 countries" (`/news`, community card) | **no** (the site quotes the Foundation's LinkedIn post; the skill's numbers are marked VERIFY: Cedric picks one) |
| 10 | UPenn at ICRA 2026 | 5th overall, 2nd in time trials (Cedric Hollande, Dhyey Shah) | "2nd in time trials and 5th head to head", "Cedric Hollande and Dhyey Shah raced against about 30 teams" | **partly** ("head to head" vs "overall") |
| 11 | VTC 2026 Fall | 30th, Boston, Sep 6-9 | `/race` "September 6, 2026 · Boston, MA, USA · Hilton Boston Park Plaza"; its `schedule_note` cites the skill's Sep 6-9 | **no** (one day shown; the note and the value disagree) |
| 12 | People | Yon Vanommeslaeghe, "Visiting Researcher, UPenn"; roster roles TODO; "never publish a person without a role and a photo or a deliberate avatar" | Yon: "Postdoc, University of Pennsylvania (xLAB)" (source xlab.upenn.edu); **Ayagoz Smagulova is shown with an initials avatar and no role at all** (`people.json`: `{"name": "Ayagoz Smagulova", "status": "verify"}`) | **no** for both |
| 13 | Cedric Hollande | Race Director, IROS 2026; Researcher, Dept. of ESE, UPenn | "Race Director, IROS 2026", "Researcher, Department of Electrical and Systems Engineering" | yes |
| 14 | Contact and Slack | contact@roboracer.ai; Slack invite `zt-42lsbf50y-...` | both, and the invite answers 200 | yes |
| 15 | Join ledger | not in the skill | "3,000+ members, 25 time zones" (Cedric, 2026-08-21, per `community.json`); **"6 continents" is marked "estimated, verify" in the same source** | partly |

Also: the landing car callout says "Steering servo · verify" while `/assembly` states "Traxxas, from the
kit" as fact (flagged 2026-09-24, unchanged). "404 Racers, also from UPenn" (news) vs "institution
tbc" (team card) is still open in `docs/CONTENT.md`.
