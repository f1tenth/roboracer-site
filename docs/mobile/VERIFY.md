# Mobile verification: roboracer.ai

2026-09-25. Read-only check of `revamp/p2-mobile` at `0e87754` (the audit, the
system tokens, the six fixer branches and `revamp/polish-2`), production build
with local media. Python Playwright through `mobilekit.py`: touch contexts with a
mobile UA (`pointer: coarse`, `hover: none`), stitched CDP walks,
`elementFromPoint` probes, axe-playwright. Captures: `docs/mobile/verify/<route>/`
(git-ignored); walk tiles `<dev>-NN.png` with a `<dev>-strip.jpg` per walk, probes
`V-*`. Defect ids refer to `docs/mobile/AUDIT.md`; fixes to `docs/mobile/PLAN.md`.
Section "Round 2" at the end records what was fixed after this pass.

## Verdict (round 1)

- **S1:** 3 of 3 fixed, each checked with a targeted probe.
- **S2:** 12 of 15 fixed; ABOUT-01, ABOUT-02 and RESEARCH-01 partly.
- **Nothing regressed.** Two new S3 issues from the fixes (landing Next race video in landscape, About hero offset).
- **axe** (390x844, wcag2a/2aa/21a/21aa/22aa, after scrolling to mount lazy content): **0 violations on all 9 routes, at every impact level.** "Incomplete" only: `color-contrast` over media/gradients, `video-caption` and `no-autoplay-audio` on muted decorative clips.
- **Reduced motion:** static and complete on `/` and `/assembly`.
- **Desktop 1440x900:** the four landing chapters are box-for-box identical to the pre-pass measure; other desktop changes are the ones PLAN planned.
- **768x1024:** all four chapters still pin.

| Route | Ids checked | Fixed | Partly | Deferred / optional | Regressed | New |
|---|---|---|---|---|---|---|
| `/` | 22 | 16 | 3 (09, 13, 25) | 3 (12, 22, 26) | 0 | 1 |
| `/about` | 7 | 4 | 3 (01, 02, 03) | 0 | 0 | 1 |
| `/race` | 7 | 7 | 0 | 0 | 0 | 0 |
| `/news` | 7 | 7 | 0 | 0 | 0 | 0 |
| `/research` | 7 | 6 | 1 (01) | 0 | 0 | 0 |
| `/assembly` | 3 | 2 | 0 | 1 (ASM-02) | 0 | 0 |
| `/rules` | 7 | 6 | 0 | 1 (RULES-04) | 0 | 0 |
| `/build`, `/learn` | 2 each | 2 each | 0 | 0 | 0 | 0 |
| Chrome | 9 | 8 | 1 (CHROME-09) | 0 | 0 | 0 |

## Walks: every route at 390x844, 360x740, 844x390

- **Overflow:** `scrollWidth == innerWidth`, zero offenders, all 9 routes, all three sizes. At 320x568 one pre-existing exception: `/race` with "earlier events" open, year rows 2-9 px past the edge (`RaceTimeline.tsx:99`).
- **Console:** no errors from our code. On `/news` LinkedIn's own frame logs `getInstalledRelatedApps`, `requestStorageAccess` and a 401 (third party, also in the audit).
- **Truncation:** only the research carousel's intended `line-clamp`.
- **Tap targets:** the bar's wordmark and "Start here" boxes are 32 px but their `::after` hit areas are 44 px (measured below); footer links 44 px tall; partner logos in the moving ribbons 27-44 x 60 (names on touch deferred, LANDING-13); carousel strip segments 31x44 at 390. Not in the audit: `/rules` list items that hold only a link (22 px), `/news` archive card title links (23-26 px).

Page heights (audit at 390 in brackets):

| Route | 390 | 360 | 844x390 |
|---|---|---|---|
| `/` | 15,539 (17,927) | 15,295 | 11,512 |
| `/about` | 24,722 (26,001) | 25,190 | 15,507 |
| `/race` | 10,236 (11,157) | 10,534 | 8,108 |
| `/news` | 13,455 (13,795) | 13,792 | 8,262 |
| `/research` | 13,105 (53,065) | 14,152 | 9,324 |
| `/rules` | 31,576 (30,756) | 33,903 | 21,820 |

`/assembly`, `/build`, `/learn` are exactly one window tall.

## S1 and S2 by targeted probe

**CHROME-01 (S1) fixed.** The open menu fits and scrolls everywhere:

| Size | Menu | Scrolls | Scrim |
|---|---|---|---|
| 844x390, 667x375 | y 56-332, two columns | no need | visible |
| 390x844 | y 72-596 | no need | visible |
| 360x740 | y 72-664, "Start here" first | no need | visible |
| 360x640 | y 72-640 | 24 px | none, menu fills the window |
| 320x568 | y 72-568 | 96 px | none, menu fills the window |

On the other 7 routes checked at 844x390 and 320x568 (plus `/` and `/rules` at all six sizes): the last link fully visible every time, after a swipe inside the menu where needed. `chrome/844x390-home-menu-open.png`, `320x568-home-menu-scrolled.png`, `360x640-rules-menu-scrolled.png`.

**CHROME-02 (S2) fixed.** `html` `overflow: hidden`, `main` and `footer` `inert` while open; `scrollY` and a reference heading stay put through opening, swipes, scrim and Escape on every route and size. Escape closes and returns focus to the toggle everywhere; a scrim tap does wherever a scrim is visible. Tab cycles menu links, one document stop, wordmark, "Start here", toggle; never the page.

**Bar hit areas** (`elementFromPoint`, 0.5 px steps): wordmark and "Start here" drawn at y 20-52, hit from y 14 to 57.5 (44 px); at 844x390 and 667x375 (56 px bar) y 6-50. Toggle box 44x44. "Start here" still lands on `#start` (h2 133 px from the top, focus on the section) from the bar at 390 and 844x390 and from the menu at 360 and 320.

**LANDING-01 (S1) fixed.** No sticky element in the car chapter at 390, 360, 844x390; wrapper = content (1,542 px at 390, 838 at 844x390); `elementFromPoint` returns each of captions 1-3, "Open the 3D viewer" and both photos at 3 points each; at 844x390 the canvas is 293 px (75svh) with captions beside it. `landing/V-390x844-car-00..02.png`, `V-844x390-car-00..03.png`.

**LANDING-03 (S1) fixed.** At 844x390, headline assembled: lines at y 111-165, 159-200, 200-242 under a nav ending at 56; description y 266-322; type 39 px (the 10svh cap). Same at 667x375. The hero plays the 960 encodes in landscape (`hero-iv-start-v2-960.mp4`, then `hero-race-0N-960.mp4`). `landing/V-844x390-hero-p42.png`, `-p90.png`, `V-667x375-hero-p60.png`.

**LANDING-05 (S2) fixed.** Map not sticky, no `min-h`; 743 px at 390 (was 2,194), 645 at 844x390; SVG 390x172 / 703x310, fits under the bar; no city labels; counters final (90+, 20+, 1,000+, 30+). `landing/V-844x390-map-0..2.png`.

**LANDING-06 (S2) fixed.** Four stacked pillars, no `<video>`, nothing sticky; posters 342x214 (capped at 55svh); header to first pillar 24 px. `landing/V-390x844-platform-0..3.png`.

**LANDING-07 (S2) fixed.** Hero pause opacity 1 and 44x44 on touch; with a mouse at 1440 unchanged (hover-revealed, 30x30).

**LANDING-08 (S2) fixed.** At 844x390 each research card is a 726x302 two-pane card inside the 334 px under the bar; strip segments 61x44, arrows 44x44.

**LANDING-09 (S2) fixed at 390, partly at 844x390.** 390: one row per team, section 2,205 px. 844x390: four columns with 4/3 photos, section 1,459 px (was 3,351), but each card is 200x414, taller than the 334 px under the bar.

**LANDING-10 (S2) fixed.** Reduced motion at 390: page 16,613 px (was 24,796); partners one dense grid (1,315 px, was 4,413); community a swiped row (Join 1,946 px, was 6,833).

**ABOUT-01 (S2) partly.** Nothing clipped at 390, 360, 320. But `[overflow-wrap:anywhere]` breaks surnames mid-word at 360 (Pennypacke|r, Nagarakshit|h, Sreenivasul|u) and 320 (8 words). `about/V-360x740-pastcrew-*.png`.

**ABOUT-02 (S2) partly.** Faculty and Developers are rows at 390 and 2-up at 844x390, but People is 10,724 px at 390 (-4.8%; target about half). Past crew in three columns is 4,062 px of it. 5,850 px at 844x390 (was 8,135).

**RACE-01 (S2) fixed.** 768: one column, video over panel, the button one line (50 px). 844x390: video capped at 505x315 under the 56 px bar, panel below.

**NEWS-01 (S2) fixed.** With `*linkedin.com*` and `*licdn.com*` aborted: frame opacity 0 and `inert`, poster link focusable and hit at the box centre. Live: the frame takes over, the poster leaves the accessibility tree. **NEWS-02** fixed (`object-fit: contain`, top). **NEWS-03** fixed (year headings static at 844x390, sticky and flush under the bar on desktop).

**RESEARCH-01 (S2) partly.** 13,105 px at 390 (was 53,065); 17 featured cards as 342x246 rows; 2017-2025 (114 papers) folded into one `<details>`, all years open under a search or topic. But the search box is at y 6,024, 7.1 screens down (target: a few).

**ASM-01 (S2) fixed.** At 360x740 the three frame controls sit on one row, 44 px each.

## Every other id

- **/** LANDING-11 fixed (200vh hero on phones, headline complete by y 355); 12 deferred (portrait encode); 13 partly (no hover logos requested on touch; names on touch deferred); 14 fixed (Pause toggles 88x44 on touch, pause every track); 15 fixed; 16 fixed (h1 33 px > panel h3 28 px); 17 fixed (balance/pretty below desktop); 18 fixed (section padding 59 px at 390, 48 at 844x390); 20 fixed; 21 fixed; 22 deferred; 24 fixed (768: Next race stacked, chassis callout clear of the photos, research figure at the top); 25 partly (no three.js/GLB/HDR/STL in the first 10 s on phones, 960 in landscape, no hover logos, YouTube click-to-play; the 4 s image hold unchanged as planned); 26 deferred (`viewport-fit`, question for Cedric).
- **/about** ABOUT-03 partly (Past crew arrow still wraps alone for 5 names: `&nbsp;` does not hold under `overflow-wrap: anywhere`); 04 fixed; 05 fixed (523x294 at 844x390); 06 fixed (0 YouTube iframes on touch); 07 fixed.
- **/race** 02-07 fixed (RACE-06: not `priority` below desktop, poster preloaded; the only encode is still 1272 px).
- **/news** 04-07 fixed.
- **/research** 02-07 fixed (search full column; one scrolling row of 44 px chips; 44 px paper links; 5rem thumbs).
- **/assembly** ASM-02 not fixed (optional; controls cover the front-left wheel at 844x390, `RacecarAssembly.tsx:476-488`); ASM-03 fixed.
- **/rules** 01, 02 (h1 36 > h2 28 > h3 22 px), 03, 05, 06, 07 fixed; 04 not fixed (optional, needs a label); `/rules#time-trial` lands 176 px from the top at every size.
- **/build, /learn** fixed: `sr-only` h1, a 44 px "Open the docs ↗" strip on phones (new label), frame directly under the bar (289 px tall at 844x390).
- **Chrome** 03-08 fixed (footer 825 px at 390, was 979); 09 partly (`theme-color` set, `viewport-fit` for Cedric).

## Desktop 1440x900 and tablet 768x1024

- Landing chapter heights identical to the pre-pass measure (hero 2,880, car 1,980, platform 2,700, map 2,340); all sticky; every layout box to depth 5 matches except polish-2's map copy. Touch-only additions stay hidden with a mouse.
- `/race` 7/5 split from `lg`; `/research` unchanged layout on desktop; footer 4 columns with `ink-950` and mono headings (planned); `/news` sticky year about 8 px higher, flush under the bar (planned).
- 768x1024: all four chapters pin, wrapper heights identical; pinned content 6-10 px higher (nav token 4.5rem, PLAN S-3); document 20,204 px (was 21,424) from Teams 4-up and Next race stacked.

## Open after round 1

| Sev | Issue | Device | Capture | Cause |
|---|---|---|---|---|
| S2 | ABOUT-02 People 10,724 px | 390 / 360 | `about/390x844-06..20.png` | Past crew three-up grid, 4,062 px (`PeopleGroup.tsx`) |
| S2 | ABOUT-01/03 mid-word breaks, lone arrow | 360, 320 | `about/V-360x740-pastcrew-*.png` | `PersonCard.tsx` `overflow-wrap: anywhere` |
| S2 | RESEARCH-01 search 7.1 screens down | 390 / 360 / 844x390 | `research/V-390x844-search.png` | 17 featured rows ahead of the list (`Research.tsx:228`) |
| S3 new | Next race video taller than the window | 844x390 | `landing/V-844x390-next-race-video.png` | `Landing.tsx:427`, no cap like `Race.tsx:192` |
| S3 new | About hero offset hard-coded | 844x390, 768 | `about/844x390-00.png` | `About.tsx:152` |
| S3 | Team card 414 px tall | 844x390 | `landing/844x390-20.png` | `TeamGrid.tsx` |
| S3 pre-existing | Join YouTube facade 844x474 | 844x390 | `landing/V-844x390-join-youtube.png` | `CommunityJoin.tsx:200` |
| S3 pre-existing | `/race` earlier events 2-9 px overflow | 320 | `race/V-320x568-timeline-open.png` | `RaceTimeline.tsx:99` |
| S3 | News archive title links 23 px, lone arrow | phones | `news/390x844-15.png` | `NewsCard.tsx:67-75` |
| S3 optional | ASM-02, RULES-04 | 844x390; all | `chrome/V-844x390-assembly.png` | `RacecarAssembly.tsx`; `Rules.tsx` |
