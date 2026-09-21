# QA: landing (`/`) — landing v5 round two, 2026-08-22

Verdict: **PASS** after the post-run fixes at the end of this report (the run itself read FIX FIRST on two small items; everything else passes). Branch `revamp/integration`, main checkout. The tree moved under the run: lint, build and the reduced-motion / no-JS captures are from `0b41e9a`; the motion captures, axe, console and the specific checks are from the production build of `0b41e9a` served by `npx vite preview --port 4180 --strictPort` (stopped after the run). HEAD is now `99a05b5` (platform title tint 50%, LiDAR explosion 0.16 / hold y 0.10: `PlatformPanel.tsx`, `ExplodedModelScene.tsx`, `racecarAssemblyData.ts`), which was not rebuilt for this report; nothing in that diff touches markup, roles, links or assets. An earlier pass against `bf47a6f` (the HEAD at start) gave the same console, axe and link results.

Captures in `docs/qa/landing/` (PNGs are git-ignored; the `run-*.json`, `console.json`, `axe*.json`, `hrefs.json` are the machine-readable evidence). Capture method: CDP viewport shots stitched into a top-to-bottom walk (viewport-height steps, wheel nudge, 650 ms settle, walk started within 3 s of load so the hero's 33 s auto-scroll never fired), because a full-page capture hangs on the live WebGL canvas and mangles the pinned chapters. Pinned chapters therefore repeat across their travel in the stitched images, by design.

## Blockers

1. **axe `color-contrast` (serious) on the map ticker wheel** (`src/components/ui/WorldMapChapter.tsx:590-612`, `WHEEL_OPACITY = [1, 0.42, 0.16]` at line 68). The two rows above the centred entry are real text faded by opacity, and at 1440 axe measures them at 2.82:1 / 2.18:1 (row 0) and 1.41:1 / 1.31:1 (row 1) against `#fbfbfd`. Six nodes, details under "axe". The definition of done says zero serious violations. Options for Cedric / the builder: raise the neighbour opacities so the blended text clears 4.5:1 (roughly 0.7 for row 0 is still well under), or treat the off-centre rows as the inactive part of a wheel and mark them `aria-hidden` plus `inert` while the centred row carries the list for assistive tech (axe then skips them; the visual fade stays). Not present at 390 (the wheel is `xl:` only).
2. **Nav CTA off-screen between 768 and 1048 px** (`src/index.css:354-396`, `.nav-links { gap: 2rem }`, `.nav-cta`; `NavBar.tsx:185-220`). Measured: the `nav.navbar` content is 1,049 px wide at every viewport from 768 to 1024, so the "Join Community" button's right edge sits at 1,049 px (`ctaVisible: false`) and the wordmark's right edge (264 px) touches the first link (264 px). `html`/`body` are `overflow-x: clip`, so the page does not scroll sideways; the CTA is simply unreachable by pointer at tablet widths (it stays in the tab order). Visible in `tablet.png` / `tablet-rm.png` frame 1. Site-wide (the bar is shared), surfaced here because 768 is a DoD viewport. The mobile menu (`md:hidden`) only takes over below 768.

## Checks

| check | result |
|---|---|
| `npm run lint` | clean (exit 0, no warnings) at `bf47a6f` and `0b41e9a` |
| `npm run build` | green; one Vite warning: chunk over 500 kB. Largest chunks (`0b41e9a`): `RacecarAssembly-4CU20s3K.js` 1,014.46 kB (three.js + car meshes, lazy), `index-DmKpXhq_.js` 351.38 kB, `motion-qL_t1FFv.js` 143.41 kB; `Landing-DoVTRHM5.js` 121.50 kB |
| screenshots 1440x900 / 768x1024 / 390x844 | `desktop.png` (20 frames, 18,000 px; document 17,926 px), `tablet.png` (20 frames, document 20,285 px), `mobile.png` (22 frames, document 17,905 px). All 9 sections reached, footer included; 1 `h1` ("Autonomous racing built and raced in the open") at every viewport |
| reduced motion | `desktop-rm.png` (14 frames, document 12,163 px), `tablet-rm.png` (14, 13,791 px), `mobile-rm.png` (19, 15,308 px): 9 sections, none empty, 0 `<video>` elements (posters everywhere: 260 `<img>` at 1440), hero 1.74vh, platform 0.86vh, car and map unpinned (the map renders its static variant without `[data-map-chapter]`), community marquee static (`animation-name: none`), research carousel not rotating (`data-running="false"`); 0 console messages, 0 failed requests, 0 responses >= 400 |
| no JS | `desktop-nojs.png`: SPA shell only, `#root` empty, no `<noscript>` in `index.html` (same as v3/v4). The reduced-motion captures are the static-layout proof |
| console (1440 / 768 / 390) | **0 errors**, 0 page errors. Warnings only from the YouTube embed (below) |
| failed requests | `net::ERR_ABORTED` on `platform-race-960.mp4` and `platform-research-mppi-960.mp4` (range requests cancelled when a platform layer swaps `preload`, known from v4, the clips play) and on YouTube's own `api/stats/*`, `ptracking` inside the embed. **0 responses with status >= 400** in the final passes (the first mobile pass saw two 404s on `partners/tint/asu.webp` and `partners/color/asu.webp`: `dist/` was being rebuilt by another session at 16:11:40 mid-walk; both files are in `dist/` and answer 200, re-run clean) |
| axe 1440 (after full scroll) | **2 violations: 1 serious (`color-contrast`, 6 nodes), 1 minor (`aria-allowed-role`, 1 node)**; 0 critical (`axe-desktop-1440.json`; 44 rules passed) |
| axe 390 (after full scroll) | **1 violation: minor (`aria-allowed-role`, 8 nodes)**; 0 serious, 0 critical (`axe-mobile-390.json`; 45 rules passed) |
| axe `/assembly` 1440 | **0 violations** (`axe-assembly-1440.json`; 36 rules passed) |
| links | 73 distinct `href`s on the rendered page: 34 external checked with HEAD (29 x 200, 4 x 202 from IEEE Xplore, 1 x 403 Wiley, 1 x 404-to-HEAD / 200-to-GET, 1 x timeout / 200 on GET), 10 internal all 200 from the preview, 29 manual (27 LinkedIn, Scholar, mailto). Table below |
| assets | `scripts/media.sh report public`: 102.7 MB total, 11 files over the 1.5 MB git rule excluding the hero exception (table below). Every `<img>` in the rendered DOM has `width`, `height` and `alt` (303 at 1440, 304 at 768, 301 at 390); every `<video>` has a poster except the hero's second stacked element (intended) |
| pins (measured) | 1440x900: hero `[data-hero-chapter]` 2,880 px = 3.20vh; platform `[data-platform-pin]` 2,700 px = 3.00vh; car wrapper `style="min-height: 220vh"` 1,980 px = 2.20vh; map `[data-map-chapter]` 2,340 px = 2.60vh. 768x1024: 3.20 / 3.00 / 2.20 / 2.60vh. 390x844: hero 3.20vh, platform 2.68vh (content height, the `md:` min-height does not apply), car 2.20vh, map 2.60vh. Hero 320vh approved (v4); platform 300vh and map 260vh above the 250vh guideline by the v4 acceptance; car 220vh within it |
| content | no `lorem`; `TODO(content)` only in comments and non-copy fields; two visible labels worth a decision ("unverified" on all 10 team cards, "institution tbc" on some): list below |
| specific checks (a)-(f) | 7 pass, 1 pass-by-design (carousel does not autoplay under `md`); table below |

## Console messages (all three viewports)

No errors. Two warnings, both emitted by the `youtube-nocookie.com` player iframe after the Join card autoplays (accepted in v4):

- `No available adapters.` (WebGPU probe inside the embed; source `.../embed/wPHYLAnpMOU?autoplay=1&mute=1&playsinline=1&rel=0&origin=http%3A%2F%2Flocalhost%3A4180`) at 1440, 768 and 390
- `Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://localhost:4180') does not match the recipient window's origin ('https://www.youtube-nocookie.com').` at 1440 and 390 (not at 768 in this run; nothing in `src/` calls `postMessage`)

`GPU stall due to ReadPixels` did not appear. `/assembly` at 1440: 0 console messages, 0 page errors, 0 failed requests.

## axe

### 1440 (`axe-desktop-1440.json`, axe-core 4.12.1)

**`color-contrast` (serious)**, https://dequeuniversity.com/rules/axe/4.12/color-contrast. All six nodes are inside the map chapter's ticker wheel, `WorldMapChapter.tsx:590-612`; they are the two rows above the centred (last) entry, faded with `opacity` 0.42 and 0.16 (`WHEEL_OPACITY`, line 68). Background `#fbfbfd` (`paper-50`).

| selector | html | measured |
|---|---|---|
| `div[data-wheel-row="0"] > .text-display-l.leading-none.font-display > .-top-\[0\.82em\].text-\[0\.5em\].inline-block` | `<span class="relative -top-[0.82em] inline-block text-[0.5em] leading-none">st</span>` | 2.82:1, fg `#96979b`, 32px normal, needs 3:1 |
| `div[data-wheel-row="0"] > .text-\[1\.125rem\].leading-tight.mt-1` | `<p class="mt-1 font-display text-[1.125rem] leading-tight font-semibold text-text-strong">ESWeek 2016</p>` | 2.82:1, fg `#96979b`, 18px, needs 4.5:1 |
| `div[data-wheel-row="0"] > .mt-0\.5.text-text-body.text-small` | `<p class="mt-0.5 font-mono text-small text-text-body">Pittsburgh, United States</p>` | 2.18:1, fg `#aaacb6`, 14px, needs 4.5:1 |
| `div[data-wheel-row="1"] > .text-display-l.leading-none.font-display > .-top-\[0\.82em\].text-\[0\.5em\].inline-block` | `<span class="relative -top-[0.82em] inline-block text-[0.5em] leading-none">nd</span>` | 1.41:1, fg `#d5d5d8`, 32px normal, needs 3:1 |
| `div[data-wheel-row="1"] > .text-\[1\.125rem\].leading-tight.mt-1` | `<p class="mt-1 font-display text-[1.125rem] leading-tight font-semibold text-text-strong">CPS Week 2018</p>` | 1.41:1, fg `#d5d5d8`, 18px, needs 4.5:1 |
| `div[data-wheel-row="1"] > .mt-0\.5.text-text-body.text-small` | `<p class="mt-0.5 font-mono text-small text-text-body">Porto, Portugal</p>` | 1.31:1, fg `#dcdde2`, 14px, needs 4.5:1 |

(The ordinal digits themselves, "1" and "2", are 64px bold and clear the 3:1 large-text bar at row 0 only; axe reports the suffix spans. Rows 2 and 3 of the wheel are `opacity: 0; visibility: hidden` and skipped. The ticker is `xl:`-only, so there is nothing to flag at 390. New since v4: the wheel replaced the flat ticker in this round, n76.)

**`aria-allowed-role` (minor)**, https://dequeuniversity.com/rules/axe/4.12/aria-allowed-role. `ResearchCarousel.tsx:553-561` (stage) and `:616-620` (stacked row): `<article role="group" aria-roledescription="slide" aria-label="2 of 8" class="relative shrink-0 ov..." style="width: calc(100% - 7...">`, message "ARIA role group is not allowed for given element". One node at 1440 (`article[aria-label="2 of 8"]`, the others are `aria-hidden` and land in `incomplete`); all 8 at 390 (`article[aria-label="1 of 8"]` ... `"8 of 8"`, none hidden in the scroll-snap row). Fix is a one-word change (`article` to `div`, or drop `role="group"` and keep `aria-roledescription`); not applied here because it is markup, not one of the trivial-fix categories.

`incomplete` (needs review, not failures): `color-contrast` on `.nav-link[href$="about"]` while it sits over the hero video (1440) and on one community-post excerpt in the marquee (390); `aria-allowed-role` on `article[aria-label="1 of 8"]` (1440); `frame-tested` on the YouTube `iframe`; `video-caption` on `video[width="1272"]` (next-race clip, muted, no audio track); `no-autoplay-audio` on a muted platform clip.

### 390 (`axe-mobile-390.json`)

`aria-allowed-role` (minor) only, 8 nodes as above. 0 serious, 0 critical.

### `/assembly` 1440 (`axe-assembly-1440.json`)

0 violations, 36 rules passed.

## Links

`hrefs.json` holds the 73 distinct `href`s from the rendered 1440 page. Checked with `curl -sIL --max-time 15`; retried the non-200s with GET and a browser UA.

| code | url | note |
|---|---|---|
| 403 (HEAD and GET) | https://doi.org/10.1002/rob.22429 -> https://onlinelibrary.wiley.com/doi/10.1002/rob.22429 | Wiley blocks curl outright (Cloudflare); resolves in a browser. Research carousel paper link |
| 202 (x4) | https://doi.org/10.1109/icra55743.2025.11128227, `.../lra.2026.3669765`, `.../icra55743.2025.11127278`, `.../iros58592.2024.10801657` -> ieeexplore.ieee.org/document/... | IEEE Xplore answers 202 to curl (bot gate), fine in a browser |
| 403 | https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-... -> robo-racer.slack.com/join/shared_invite/... | Slack invite links refuse curl; opens in a browser (same as v4) |
| 404 -> 200 | https://www.gzu.edu.cn/en/ | 404 to HEAD, 200 to GET with a browser UA; fine |
| 000 -> 200 | https://www.iitb.ac.in/ | timeout on HEAD, 200 on GET (slow host, same as v4) |
| manual | 27 LinkedIn URLs (company pages `roboracer-foundation`, `open-source-robotics-foundation`, `knapp-ag`, `unicorn-racing`; 12 community posts + author profiles; the next-race post) | LinkedIn, manual |
| manual | https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG= | Scholar rate-limits |
| manual | mailto:contact@roboracer.ai | |

All other 29 external links: 200. Internal: `/`, `/about`, `/build`, `/learn`, `/race`, `/course`, `/research`, `/news`, `/assembly`, `/#` all 200 from the preview. Every external `target="_blank"` anchor carries `rel="noopener noreferrer"` (0 offenders).

## Assets

`scripts/media.sh report public`: 102,707,836 bytes total, 11 files over the 1.5 MB git rule (excluding the hero exception).

| file | size | status |
|---|---|---|
| `public/media/hero/hero-fpv-loop-1280.mp4` | 7.26 MB | tracked, standing exception (CLAUDE.md rule 3, desktop encode <= 8 MB) |
| `public/media/hero/hero-fpv-loop-960.mp4` | 2.83 MB | tracked, standing exception (mobile encode < 3 MB) |
| `public/media/race/race-iros2026-hero-1272.mp4` | 0.80 MB | tracked, next-race clip (within budget; the second standing exception is not needed at this size) |
| `public/media/hero/hero-race-02-1920.mp4` / `-960.mp4` | 11.40 / 3.23 MB | untracked (`.gitignore` `public/media/**/*.mp4`), awaiting hosting (n72) |
| `public/media/hero/hero-iv-rest-1280.mp4` / `-960.mp4` | 9.64 / 6.20 MB | untracked, awaiting hosting |
| `public/media/hero/hero-race-01-1920.mp4` / `-960.mp4` | 8.66 / 2.56 MB | untracked, awaiting hosting |
| `public/media/hero/hero-race-03-1920.mp4` / `-960.mp4` | 4.11 / 1.13 MB | untracked, awaiting hosting |
| `public/media/hero/hero-iv-start-1280.mp4` / `-960.mp4` | 1.75 / 1.10 MB | untracked, awaiting hosting |
| `public/crew/billy.png` | 2.85 MB | tracked legacy, `/about` only |
| `public/crew/Roshan_Benefo.jpeg` | 2.13 MB | tracked legacy, `/about` only |
| `public/about/image-2.JPG` | 1.60 MB | tracked legacy, `/about` only |

Hosting note: `src/lib/media.ts` (new in `04b87f0`) resolves the five hero clips through `VITE_MEDIA_BASE` (Cloudflare R2 behind `infra/media-worker`); with the variable unset, as in this preview, every clip resolves to the local `public/` copy, which is why the captures show the sequence. A Pages deploy without `VITE_MEDIA_BASE` and without the files in git would 404 the clips (hero stays on its poster). Not a blocker for this QA, still a blocker for `/ship` until n72 is decided.

DOM audits (rendered page, every viewport): 0 `<img>` without `width`/`height`; 0 without `alt`; `<video>` without poster: only `video.absolute.inset-0.h-full[aria-hidden=true]` with `src=/media/hero/hero-race-03-1920.mp4` (1440, 768: `hero-race-01-1920.mp4` at the moment of the audit) / `hero-race-03-960.mp4` (390): the hero's second stacked video, the crossfade target, by design. 15 `<video>` at 1440, 14 at 768, 9 at 390; 0 under reduced motion.

## Motion

`desktop.png` vs `desktop-rm.png`: same 9 sections in the same order (hero, highlights, car, platform, partners, map, next race, teams, research, join + footer), no empty pinned section, every heading and body copy present in both (section text lengths match; the hero's 52 vs 45 characters differ by the scroll hint). With motion the document is 17,926 px, under reduced motion 12,163 px; the difference is the pin travel. Pin lengths as measured above.

## Specific checks (this round)

| # | check | result | measured |
|---|---|---|---|
| a | research carousel `data-running="true"` within 2 s of scrolling into view; active slide label changes within 8 s | **pass** at 1440 and 768; **n/a by design** at 390 | 1440: `true` after 0.00 s, label "Go to paper 1: F1tenth: An open-source evaluation environment..." -> "Go to paper 2: ForzaETH Race Stack..." after 4.11 s (first pass 3.98 s). 768: `true` after 0.00 s, changed after 4.49 s. 390: `data-running="false"`, no change in 9 s: `autoplay = stage && !reduced && n > 1` with `STAGE_QUERY = (min-width: 48rem)` (`ResearchCarousel.tsx:45, 290`); under `md` the stacked scroll-snap row has no autoplay. Under reduced motion also `false` at all three widths |
| b | community posts marquee spans the full viewport width, track `animation-duration` set | **pass** | `[aria-label="Posts from the community"]` left 0, width 1440 / 768 / 390 = viewport; `.rr-marquee-track` `animation-duration` 110s (1440, 768), 70s (390), `animation-name: rr-marquee`. Reduced motion: `0s` / `none` (static) |
| c | Next race after the map chapter and before Teams in DOM order | **pass** | element indices at 1440: map `[data-map-chapter]` 592 < next race `section[aria-labelledby="next-race"]` 1430 < teams `section[aria-labelledby="teams"]` 1469 (768: 591 / 1429 / 1468; 390: 536 / 1373 / 1412; rm: next race 1129 < teams 1167) |
| d | no visible text contains "Photo:" or "Video:" | **pass** | 0 visible leaf elements matching `/(Photo|Video):/` at 1440, 768, 390 and under reduced motion |
| e | team grid has 10 cells, each with an `<img>` | **pass** | `section[aria-labelledby="teams"] ul` has 10 `<li>`, 10 with `<img>` at every viewport. Alt texts: 404 Racers, West Virginia University, LAMARRacing, UPenn Autonomous Racing, ForzaETH, UNICORN_Racing, VAUL, UBM-Tom/Atlas, Brake Check Buddies, Scuderia Segfault ("... team photo") |
| f | `/assembly`: clicking `.part-row:nth-child(3) .part-select` adds `is-selected`; no `.part-visibility` button | **pass** | 11 `.part-row`; third row class before `part-row `, after `part-row is-selected` (row "03 LiDAR"), 1 selected row; `.part-visibility` count 0; 1 `canvas`; h1 "RoboRacer ASSEMBLY LAB". `assembly-1440.png` |

## Content hits

- `src/components/ui/TeamGrid.tsx:72,76`: visible copy. Every team card shows the word **"unverified"** because all 10 entries in `public/data/teams.json` have `"status": "verify"` (`TeamGrid.tsx:74` prints it for any status other than `published`), and cards with no institution and no country print **"institution tbc"**. Both are honest states, both are on the public landing: Cedric flips the statuses (and fills the institutions) or the builder hides the labels.
- `public/data/teams.json:4, 31, 109, 122, 147` `institution` = `TODO(content): unknown...` (five teams; `TeamGrid.tsx:33` hides any institution starting with `TODO(content)`, see above)
- `public/data/community.json:28` `excerpt_note` = `TODO(content): one sentence in Cedric's words...` (note field, not rendered)
- `src/components/ui/CommunityJoin.tsx:13` comment (`TODO(content)` LinkedIn page confirmation)
- `src/components/ui/ExplodedModel.tsx:84, 375, 443` comments (final chapter copy, nominal dimensions)
- `src/components/ui/HighlightReel.tsx:30, 38, 96` `placeholder` is a status enum; `highlights.json` has 0 items with that status
- `public/data/events_map.json:559` `source` field (not copy); `teams.json:26` `source` field
- em dash: `public/data/publications.json:1088` in the abstract of `kim-2025-model` (not in `featured_order`, so not in the landing carousel; it would show on `/research`). `src/lib/publications.ts:83` returns `"—"` as the venue-initials fallback (none of the 8 featured papers hits it)
- no `lorem` anywhere in the listed files

## Fixes applied during QA

None. The two trivial-fix categories (alt text, dimensions, `rel`) had zero offenders. The two blockers are component/CSS changes for the builder.

## Captures

- `docs/qa/landing/desktop.png`, `tablet.png`, `mobile.png` (motion, stitched walks, build of `0b41e9a`)
- `docs/qa/landing/desktop-rm.png`, `tablet-rm.png`, `mobile-rm.png` (reduced motion)
- `docs/qa/landing/desktop-nojs.png` (1440x900, JavaScript disabled)
- `docs/qa/landing/assembly-1440.png` (`/assembly` after selecting the LiDAR row)
- `docs/qa/landing/console.json` (console + failed requests per run, incl. assembly), `axe.json` (summary), `axe-desktop-1440.json`, `axe-mobile-390.json`, `axe-assembly-1440.json` (full axe-core 4.12.1 output), `hrefs.json`, `run-*.json` (DOM audits, pin measurements, scroll positions, carousel timings)
- `axe-after-fixes-*.json` and `capture-results.json` are the v4 run's files, left untouched

## Fixes after the run (director, 2026-08-22, commit after 99a05b5)

Re-measured on the dev server at the same viewports:

1. **Nav CTA off-screen 768-1048** -> the hamburger now takes over below lg
   (1024) and `.nav-links` uses a 1.25rem gap at lg (`src/index.css`,
   `NavBar.tsx` `lg:hidden`). Measured: 768 hamburger shown, links hidden;
   1024 links shown, "Join Community" right edge 992 px; 1100: 1068 px;
   1440: 1408 px.
2. **Ticker wheel color-contrast (serious, 6 nodes)** -> the off-centre rows
   are no longer opacity-faded; distance is told by scale and by colour
   (`data-d` 0/1/2 -> text-strong / text-body / text-muted, all AA on paper),
   opacity 1 (`WorldMapChapter.tsx`). Measured row colours at p 0.5:
   rgb(11,12,20) / rgb(59,63,85) / rgb(98,103,127), opacity 1 on all five.
3. **aria-allowed-role (minor)** -> carousel slides are `<div role="group">`.

axe re-run on `[data-ticker]`, the carousel region and `nav` at 1440: 0
violations. Remaining known items: the ten untracked hero clips (hosting in
progress on Cloudflare R2, `src/lib/media.ts` / `infra/media-worker`), the
"unverified" team labels (all `teams.json` entries carry `status: verify`
until Cedric confirms them).
