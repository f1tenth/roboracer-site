# QA: iteration-3 integration (/, /about, /research, /race), 2026-09-25

Independent review of `revamp/polish-2` at `34285e1` (detached worktree
`../roboracer-site-wt/p3-qa`), after the seven p3 merges: p3-facts,
p3-spinoffs, p3-scroll, p3-research-mobile, p3-leaderboard, p3-start-here,
p3-landing-fixes. `/news` was skipped (being rebuilt elsewhere). Read-only: no
source was edited. Captures are PNGs under `docs/qa/p3-integration/`
(git-ignored, 236 files, 136 MB).

## Verdicts

| Route | Verdict | Why, in one line |
|---|---|---|
| `/` | **SHIP** | Numbering reads 00 to 08 at all five viewports, the car chapter meets the map with no leftover band, Start here and Join work. Zero console errors, zero axe violations. The open items are small or were already open. |
| `/about` | **FIX FIRST** | The Spinoffs subtitle says both companies "grew out of the car". Quanser's own evidence in `spinoffs.json` says otherwise, and the section shows its logo and homepage without Quanser having been asked. Also: a "not confirmed" line in People, and two different "Start here" targets on one screen. |
| `/research` | **SHIP** | Year folds, the jump row and full-width phone figures all work, from the keyboard too. Zero errors, zero axe violations. |
| `/race` | **SHIP** | Hash links and the click-to-load replay work, and keyboard focus moves into the frame and back out. Only nits remain (the poster draws controls that do nothing, and the lab-close date goes stale tomorrow). |

## How it was run

- `npm run lint`: pass, 0 warnings. `npm run build` (`tsc -b && vite build && spa-fallback`): pass
  in 5.8 s. One warning, the same kind as before: `(!) Some chunks are larger than 500 kB after minification`
  (`RacecarAssembly-*.js`, lazy, 1,004.58 kB / 277.69 kB gzip).
- `npx vite preview --port 4190 --strictPort` on the built `dist/`, so production media resolves to
  R2 (`VITE_MEDIA_BASE`). Python Playwright with Chromium and SwiftShader WebGL. Screenshots were taken
  through CDP. Each walk scrolled one window at a time with a `wheel(0,1)` nudge and an 850 ms settle,
  and the frames were stitched in chunks of 8.
- Viewports: 1536x730 and 1366x650 (mouse); 390x844, 768x1024 and 844x390 (touch, `is_mobile`). Reduced
  motion: `/` and `/about` at 1536x730 and 390x844. JavaScript off: all four routes at 1536 and 390.
- Scripts (scratchpad, not committed): `walk.py` (walk, console and network log, DOM audit, axe),
  `sections.py` (per-section captures and seam measurements), `keys.py` (keyboard walks), `hash.py` and
  `flash.py` (hash targets, route reset), `links.py` plus `linkbrowser.py` (link check).

### Bundle against polish-2-final (`8bb7118`, bytes)

| Chunk | 8bb7118 | 34285e1 | Delta |
|---|---|---|---|
| `index-*.js` (shared) | 388,254 | 388,960 (135.4 kB gz) | +0.7 KB |
| `index-*.css` | 90,578 | 91,440 (18.5 kB gz) | +0.9 KB |
| `Landing-*.js` | 117,616 | 105,169 | -12.4 KB (PlatformPanel and EntryPaths gone) |
| `StartHere-*.js` (new split) | n/a | 29,041 | +29.0 KB (shared by / and /about) |
| `About-*.js` | 43,258 | 41,256 | -2.0 KB |
| `Race-*.js` | 29,403 | 34,369 | +5.0 KB (LeaderboardReplay) |
| `Research-*.js` | n/a | 16,936 | |
| `RacecarAssembly-*.js` (lazy) | 1,004,582 | 1,004,582 | 0 |
| all `dist/assets/` | 1,855,699 | 1,862,417 | +6.7 KB |

Against `docs/AUDIT.md`, which recorded one 1,229 kB chunk on every route, three.js still stays out of the shared chunk.

## Fix list, most severe first

Each item gives the route and viewport, what I saw, and the file most likely responsible.

### Blocker

1. **/about, all viewports, 04 Spinoffs: the subtitle claims something the sources contradict.** "Companies that
   grew out of the car" covers both features. For Quanser, the evidence in `spinoffs.json` says the opposite:
   quanser.com/about says it was founded by Dr. Jacob Apkarian with "35+ years of academic partnership", and
   neither its pages nor the QCar 2 page mention F1TENTH or RoboRacer. Its `origin` is still
   `TODO(content)`, so the card shows no connection at all. Neobotics is labelled "nonprofit" under
   "Companies", and its sourced link is race-rule compatibility plus co-organizing VTC 2026, not an origin.
   Both features use the company's logo, car photo and homepage capture, and the manifest (SP-01 to SP-07)
   says permission has not been asked. The site is public, so this is a claim about a third party. Needs
   Cedric: supply the Quanser origin, or reword the subtitle to what the sources support (for example "Built
   on RoboRacer" or "Cars built to RoboRacer rules"), or hold Quanser back until he answers.
   Files: `src/pages/About.tsx:359` (subtitle), `public/data/spinoffs.json`.

### Should fix

2. **/about, all viewports, 02 People > Past crew: a verification disclaimer is still rendered.** The lead reads
   "Earlier team members, from the old F1TENTH about page. Their roles aren't confirmed yet." The words
   "verify" and "unverified" are gone from all four routes, but this sentence is the verify tag in prose,
   and Cedric asked for no rendered verification markers (2026-09-25). File: `src/pages/About.tsx:324`.
3. **/about, all viewports: two "Start here" targets on one screen.** The nav's solid "Start here" goes to `/#start` on the landing,
   and /about's own "01 Start here" section sits right under its hero. At 1366 and 1536 both are visible
   at once (`sec-about-start-1366x650-1.png`). A reader who clicks the button leaves the page they are
   reading to see the same five rows. Decide: the nav targets the local section on /about, the /about
   section is retitled, or the nav label changes. Files: `src/components/NavBar.tsx:346,357,394`,
   `src/pages/About.tsx:226`.
4. **/ (all viewports): "30+" where the other routes say 30.** / says "Moments from 30+ competitions since 2016" (01 lead) and the
   map counter says "30+ competitions held". /about says "30 competitions held" and "There have been 30
   competitions since 2016", and /race says "30 competitions since 2016". The content skill says "until
   then '30 competitions held'", because IROS (the 31st) is Sep 28 to 30. Files: `src/pages/Landing.tsx:307`,
   `src/components/ui/WorldMapChapter.tsx:33`.
5. **All four routes, all viewports: two solid violet buttons in one viewport.** The nav's "Start here" is solid violet in every
   frame of every walk. Any viewport that also holds an in-page primary therefore shows two: / 05 "See the
   race site", / and /about Join "Join the Slack", and /race hero "See the race site". The leaderboard
   poster also draws a violet "Play" into its image. This was already open as `docs/qa/polish-2-review.md`
   item 9 and needs Cedric's decision. Measured by computed background `rgb(124, 58, 237)` on visible
   `a`/`button` per frame; the only in-page duplicates are the nav plus one primary. Files:
   `src/components/NavBar.tsx`, `src/index.css` (`.nav-primary`).
6. **/ and /about Join, all viewports: the icons use the logo gradient, off-token (new today).** `SocialGlyph` draws the
   Slack eyebrow mark and the LinkedIn, Instagram and GitHub marks in a hard-coded `#00D1DA` to `#FC00FF`
   gradient. The token is `--color-rr-grad-start: #fb00ff`, cyan is reserved for the logo, and the system says
   icons are ink strokes with magenta nowhere else. Files: `src/components/ui/SocialButton.tsx:66-67`,
   `src/components/ui/CommunityJoin.tsx:114,372` (pass `gradient={false}`).
7. **/about at 1366 and 1536, 01 Start here intro: the photo outweighs the text.** Two short paragraphs (about 130 to 180 px of text)
   sit beside a 6-column ICRA photo about 360 px tall. It is the same "image too big for the text"
   imbalance Cedric called out in Join, which is fixed there. A 7/5 split or a smaller figure would balance
   it. File: `src/pages/About.tsx:232-251`.
8. **Every route: the Slack invite could not be verified.** `join.slack.com/.../zt-42lsbf50y-...` returns 403 to curl
   (HEAD and GET, browser UA) and "your browser is not supported" to headless Chromium. The content skill
   recorded it valid on 2026-08-20; if it was created with a 30-day expiry, it has lapsed. It is the nav CTA
   and the Join CTA everywhere, so Cedric should open it once while signed out.
9. **/race, all viewports, 05 Leaderboard: the poster draws controls that do nothing.** The poster is a
   screenshot of the player, so it shows "Full screen", "Close", "Play", "Compare" and "Copy link", while the
   whole box is one button ("Play the replay: Top 5, follow the gap"). A tap on the drawn "Close" loads
   the replay. Crop the poster to the track, or dim the drawn chrome behind the play cue. At 844x390 the
   box (796x548) is taller than the screen, which was already known. File:
   `src/components/race/LeaderboardReplay.tsx` and its poster asset.
10. **/ and /about, all viewports: partner logos have `width="auto"`.** That is not a valid dimension, so the
    "every image has width, height and alt" check fails for the 82 partner logos (plus their hover copies and
    marquee clones on /). All other images on the four routes pass. Files: `src/pages/Landing.tsx:178,191`,
    `src/components/about/PartnerWall.tsx:51`, `src/components/ui/LogoCloud.tsx:23`. Pre-existing.

### Nice to have

11. **/about Spinoffs.** The Neobotics homepage capture is a motion-blurred FPV frame whose only headline is
    about 6 px tall at window size (the window is 295 px wide at 1536), so it does not read as a summary of their
    site. The Quanser card has about 7rem of dead space above "See the QCar 2" at 1366, 1536 and 768,
    because it has no origin line. Files: `public/media/spinoffs/spinoff-neobotics-site-960.webp`,
    `src/components/about/SpinoffGrid.tsx:112`.
12. **/ at 768x1024: the car-to-map seam.** The pinned Community chapter centres in the tall portrait window, which
    leaves 268 px of paper between the car's ink edge and the "03" eyebrow. At the other viewports the gap
    is 52 to 81 px. This is not a Platform leftover, since the seam is clean at every size; it comes from
    vertical centring. File: `src/components/ui/WorldMapChapter.tsx`.
13. **Off-scale values added today.** `src/components/ui/ResearchCarousel.tsx:287` uses `text-[1.375rem] leading-[1.625rem]`
    and `:296` uses `text-[0.9375rem]`. Both are in rem but off the type scale; use `text-display-s` and
    `text-small` or `text-body`. `src/components/race/LeaderboardReplay.tsx:216` uses `rounded-full shadow-sm`;
    use `rounded-pill` and `shadow-card`.
14. **Dead code left by p3-facts.** `caption_verify` in `src/lib/data.ts:281` and `public/data/community.json:14` is
    no longer rendered by anything (CLAUDE.md rule 10).
15. **Styleguide coverage.** `/styleguide` does not render the new `ui/StartHere` in either density, although the
    design system reviews every primitive there. File: `src/pages/Styleguide.tsx`.
16. **Section eyebrows.** /research uses word eyebrows ("Research", "Featured", "All papers", "Contribute"), while /, /about and
    /race use numbered indexes. The one section-top vocabulary is inconsistent across routes (pre-existing).
17. **/race 05 date.** "lab closes Sep 25" becomes a past date tomorrow (it comes from the live board). Consider
    hiding the row once the date has passed. File: `src/components/race/Leaderboard.tsx`.
18. **Start here Race row.** The alt text says "A RoboRacer car ... driving between yellow track barriers" while the
    caption says "two cars through the corner". Files: `public/data/paths.json`,
    `src/components/ui/StartHere.tsx` (BUNDLED_PATHS).
19. **Partner links on http.** gzu.edu.cn, katech.re.kr, clemson.edu and kaist.edu are `http://` in
    `public/data/partners.json`; they all serve https.
20. **Nav "Start here" jump from another route.** It shows the landing hero for about 190 to 255 ms before it jumps to #start
    (1536: y 0 at 201 ms, then 2336 at 456 ms; 390: 0 at 189 ms, then 1688 at 374 ms). It is brief, but the
    hero video flashes. File: `src/hooks/useScrollToHash.ts`.
21. **Performance (pre-existing, not from today's merges).** / at 1536 pulls 17.7 MB in its first 3 s, because the
    R2 clip `hero-race-01-1920.mp4` (9.08 MB) is prefetched while the opening clip plays, and 40.4 MB after
    a full walk (largest asset: `hero-race-02-1920.mp4`, 11.95 MB). A 768x1024 touch tablet gets the 1920
    encodes (15.3 MB in 3 s). The research carousel serves 1600 px figures to phones (296 KB). The hero's
    second crossfade `<video>` has no `poster` attribute.

## Per page

### / (landing)

- **Section numbering.** The DOM order of the index eyebrows is `00 01 02 03 04 05 06 07 08` at all five
  viewports and under reduced motion (1536, 390), with no gaps and no duplicates. The sections are 00 Start
  here, 01 Highlights, 02 The car, 03 Community, 04 Our partners, 05 Next race, 06 Teams, 07 Research and 08 Join.
- **Car chapter into Community.** No leftover band where Platform was. Measured from the ink wrapper's bottom
  edge to the "03" eyebrow: 81 px at 1536, 76 at 1366, 59 at 390, 52 at 844x390, and 268 at 768x1024 (fix
  12). The section background is `rgb(251, 251, 253)` (paper-50), the same as the body. Captures:
  `sec-landing-seam-<vp>.png`.
- **00 Start here.** The header and lead sit beside the five rows from lg (sticky) and stack above them below
  lg. Each row has a thumb, a label, one sentence and one link, and the link's `::after` spans the whole row,
  so the row is the touch target and the focus ring (2px `rgb(124,58,237)`) draws around it. Keyboard: 11 nav
  stops, then "Pause footage", then Build the car, Start the course, Find the next race, Browse the
  research, and Write to contact@roboracer.ai (`kbd-landing-start-row1-1536.png`,
  `kbd-landing-start-row5-1536.png`). No skip link (pre-existing).
- **Nav "Start here" from a scrolled /about.** From about y 7337 at 1536, focusing the link and pressing Enter
  lands on `/#start` with `#start` top = 0 and the h2 at 123 px, below the bar. `document.activeElement`
  is the section, and the next Tab goes to "Build the car". At 390 it lands at y 1688 with `#start` top = 0
  and the h2 at 141 px. The position stays put between 1 s and 6 s (no ScrollTrigger snap-back).
  Captures: `kbd-nav-start-from-about-{1536,390}.png`, `kbd-nav-start-then-tab-{1536,390}.png`. A direct
  load of `/#start` lands the same way (`hash-direct-_start-*.png`).
- **08 Join.** It leads with copy: header, lead, then the Slack card with 3,000+ members, 25 time zones and
  the one solid CTA, the ruled "Also on" list, and "Write to us". The Korea photo is in the 5/12 column,
  and on phones it comes after the text. The same component with the same content renders as 06 on /about
  (`showYouTube={false}` there, because the /about hero carries the reel). Captures: `sec-landing-join-*`,
  `sec-about-join-*`.
- **07 Research carousel.** The figure fills its pane at 1536, 1366 and 768 (`sec-landing-research-*`).
- **Reduced motion (1536, 390).** Hero poster, then the h1 on paper; Start here rows are static and visible;
  the car is a static render; the partners are one grid; Highlights and Community are static. No video
  requests on /about. CLS is 0.0001 and 0 (`landing-*-reduced-walk-*.png`).
- **JavaScript off.** The `index.html` noscript card ("RoboRacer needs JavaScript" plus plain links) shows on
  all four routes. This is the SPA's known behaviour (`nojs-*.png`).
- **Text scan (innerText after a full walk).** No "verify", "unverified", "tbc", "TODO", lorem, "placeholder"
  or em dash. The only "verif" hits are the research topic "Safety and verification". No SVG map label
  carries "tbc".

### /about

- **Sections:** hero, then `01 02 03 04 05 06` (Start here, People, Our partners, Spinoffs, Videos, Join) at
  every viewport. One h1, no heading-level skips.
- **01 Start here (full density).** Story and ICRA photo, then five rows: frame with clip and caption on
  the left, label, sentence, second sentence and link on the right. Phones get the small thumbs. It reads
  well, but see fixes 3 and 7.
- **04 Spinoffs.** Neobotics and Quanser. From desktop they sit two across and the browser window overlaps
  the photo's lower edge without covering either car. At 768 there are two narrow one-column cards; on
  phones they stack with the window last. All six images load. See fixes 1 and 11.
- **Hash target.** A direct load of `/about#about-spinoffs` lands with the section top at 0 (1536: y 11725;
  390: y 13218) (`hash-direct-about_about-spinoffs-*.png`).
- **Partner count** settles at 82 on both pages. A mid-count frame on /about showed 81, which is the
  StatTicker counting up, not a data mismatch.
- **Text scan:** no "verify" or "unverified" anywhere; one "aren't confirmed yet" (fix 2).

### /research

- **Folds.** Desktop and tablet show four papers per year, then "Show N more papers from YYYY" (2026: 19,
  2025: 42, 2024: 18, 2023: 14, 2022: 9, 2020: 4). Phones open only 2026 and 2025; older years are closed
  folds ("Show 22 papers from 2024" and so on, 2017 included). The counts add up (for example 2025: 46 = 4 + 42).
- **Keyboard (1536).** The first year fold is Tab stop 63. Enter opens it (label becomes "Hide 19 papers from
  2026", the summary stays in place at top 536) and Space closes it. The focus ring is 2px violet on the
  full-width summary. At 390 it is stop 43 and behaves the same.
  Captures: `kbd-research-fold-{focus,open}-{1536,390}.png`.
- **Phones.** Figures fill the column with the text under them. On a landscape phone they sit two across
  (`sec-research-list-844x390-*`). The jump row lists every year and "Submit your paper".
- **Route reset.** Opening /research from a landing scrolled to 50% (footer link and nav link) renders the
  new route at y 0 on its first frame. The frames at the old y are still the landing, waiting for the lazy
  chunk. Back to / also renders at 0.

### /race

- **Hash target.** A direct load of `/race#leaderboard` lands with `#leaderboard` top at 0 (1536: y 6377;
  390: y 8151).
- **Leaderboard.** Pinned to Lab 4 Follow the Gap. The poster box sits beside the table from lg and under
  it below lg. Before a click there is no iframe in the DOM. Keyboard: Tab stop 39 is "Play the replay:
  Top 5, follow the gap" (804x554, 2px violet ring). Enter mounts
  `roboracer-class.github.io/leaderboard/?lab=lab-4-follow-the-gap-lap&compare=top5` (titled and
  sandboxed) and moves focus into the frame. Six Tabs later focus leaves for "Open the replay" and then
  "Restart the replay", so there is no trap. Captures: `kbd-race-play-{focus,loaded}-1536.png`,
  `sec-race-leaderboard-*`. See fixes 9 and 17.
- One h1 ("Come race with us"); sections 01 to 05; no heading skips.

## Evidence tables

### Console and network, per route and viewport (full walk)

| Route | Viewport | Console errors | Page errors | Warnings | HTTP 4xx/5xx | Failed requests | Mixed content | h-overflow | CLS | First 3 s | Full walk |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 1536x730 | 0 | 0 | Failed to execute 'postMessage' on 'DOMWindow': The target o; No available adapters. | 0 | net::ERR_ABORTED hero-race-03-1920.mp4; net::ERR_ABORTED qoe?cpn=ngQSq971cAQghAYr&el=embe | 0 | 0 | 0.0009 | 17.72 MB / 243 req | 40.39 MB / 295 req |
| `/` | 1366x650 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0004 | 17.72 MB / 243 req | 36.80 MB / 278 req |
| `/` | 390x844 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0018 | 7.44 MB / 139 req | 15.90 MB / 180 req |
| `/` | 768x1024 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0075 | 15.27 MB / 148 req | 23.68 MB / 187 req |
| `/` | 844x390 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0046 | 7.87 MB / 145 req | 16.88 MB / 186 req |
| `/` | 1536x730-reduced | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0001 | 6.29 MB / 235 req | 8.15 MB / 258 req |
| `/` | 390x844-reduced | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0000 | 4.60 MB / 150 req | 6.13 MB / 169 req |
| `/about` | 1536x730 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0026 | 0.84 MB / 30 req | 8.45 MB / 254 req |
| `/about` | 1366x650 | 0 | 0 | No available adapters. | 0 | net::ERR_ABORTED qoe?cpn=hpHTCnh32P_50kQB&el=embe | 0 | 0 | 0.0031 | 0.84 MB / 30 req | 9.62 MB / 270 req |
| `/about` | 390x844 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0056 | 0.66 MB / 30 req | 5.07 MB / 185 req |
| `/about` | 768x1024 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0011 | 0.87 MB / 33 req | 8.45 MB / 254 req |
| `/about` | 844x390 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0086 | 0.86 MB / 32 req | 8.45 MB / 254 req |
| `/about` | 1536x730-reduced | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0007 | 0.84 MB / 30 req | 4.83 MB / 250 req |
| `/about` | 390x844-reduced | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0000 | 0.66 MB / 30 req | 4.02 MB / 184 req |
| `/research` | 1536x730 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0001 | 1.38 MB / 31 req | 1.74 MB / 58 req |
| `/research` | 1366x650 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0000 | 1.48 MB / 33 req | 1.74 MB / 58 req |
| `/research` | 390x844 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0001 | 0.80 MB / 21 req | 0.86 MB / 28 req |
| `/research` | 768x1024 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0000 | 1.15 MB / 27 req | 1.74 MB / 58 req |
| `/research` | 844x390 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0000 | 0.83 MB / 24 req | 0.86 MB / 28 req |
| `/race` | 1536x730 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0006 | 1.47 MB / 27 req | 2.52 MB / 41 req |
| `/race` | 1366x650 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0006 | 1.56 MB / 28 req | 2.52 MB / 41 req |
| `/race` | 390x844 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0014 | 1.42 MB / 26 req | 2.51 MB / 41 req |
| `/race` | 768x1024 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0003 | 1.42 MB / 26 req | 2.52 MB / 41 req |
| `/race` | 844x390 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0020 | 1.42 MB / 26 req | 2.52 MB / 41 req |

### axe (axe-core via axe-playwright-python, whole page after a full walk, every impact level)

| Route | 1536x730 | 390x844 |
|---|---|---|
| `/` | 0 violations | 0 violations |
| `/about` | 0 violations | 0 violations |
| `/research` | 0 violations | 0 violations |
| `/race` | 0 violations | 0 violations |

The warnings and failed requests all come from YouTube's embed (the `/` Join reel and the /about hero reel
autostart muted once they are in view on a fine pointer): "No available adapters", a `postMessage`
origin mismatch, and aborted `qoe` stats beacons. The aborted `hero-race-03-1920.mp4` is the hero cycle
swapping clips. None of them comes from the site. In headless Chromium the Join reel shows YouTube's "This
video is unavailable". oEmbed returns 200 for `wPHYLAnpMOU` and the five /about video IDs, so they are
embeddable; this is a headless artifact, but check it once in a real browser.

The axe run used the whole page at the top after a full walk, so lazy content was mounted. At every impact
level (serious and critical included) there were zero violations. One h1 per route, no skipped heading levels.

### Links on / and /about (curl, HEAD then GET on a non-2xx, `-L`, 5 s timeout, browser UA)

251 unique external URLs, 9 internal routes. Every `target="_blank"` carries `noopener noreferrer` on all four
routes. All internal routes (`/`, `/about`, `/assembly`, `/build`, `/learn`, `/news`, `/race`, `/research`,
`/rules`) return 200.

| Result | Count | What it is |
|---|---|---|
| 200 | 176 | resolves |
| 202 | 7 | IEEE DOIs (`doi.org/10.1109/...`): IEEE's bot interstitial; in Chromium they open the paper (checked `lra.2026.3669765`) |
| LinkedIn 429 / 999 / 405 | 76 (`/in/...` and posts) | LinkedIn rate limiting and its bot wall, not dead links (47 are 429) |
| 403, bot challenge | 4 | `www.columbia.edu`, `www.ffg.at`, `engineering.virginia.edu/faculty/madhur-behl`, `doi.org/10.1002/rob.22429` (Wiley): each serves a Cloudflare "Just a moment..." page to headless Chromium too; live for people |
| 403, not verifiable | 1 | the Slack invite (fix 8) |
| 403 HEAD / 200 GET | 1 | `www.bmimi.gv.at` |
| 404 HEAD / 200 GET | 1 | `http://www.gzu.edu.cn/en/` (http link, fix 19) |
| 301 then timeout | 1 | `http://www.katech.re.kr/`: the https hop took over 5 s; 200 in Chromium (fix 19) |
| 000 HEAD / 200 GET | 1 | `www.iitb.ac.in` (slow; the Chromium navigation timed out at 25 s) |

No link is confirmed dead. Raw results: `links-landing-about.json` (scratchpad; rerun with `links.py`).

### Images and media

- Width, height and alt: every `<img>` on the four routes has an alt attribute and numeric width and height,
  except the partner logos, which have `width="auto"` (fix 10). No broken images (complete with
  naturalWidth 0) at any viewport.
- Every video has a poster except the hero's second crossfade layer (fix 21).
- Layout shift: CLS at or below 0.009 on every route and viewport (table above). The 0.5 s and 3 s
  captures (`<route>-<vp>-t0.5s.png`, `-t3s.png`) show no layout movement, only the hero clip advancing.

## Design review against the design system

- **Section rhythm.** / runs hero, then Start here (tight, with top padding that clears the bar for the
  jump), then the tinted Highlights band, the ink car chapter, and the paper map. The ink-to-paper edge
  is clean at every viewport, so removing Platform left no hole. /about keeps one Section rhythm from 01 to 06, and the shared
  Join closes both pages identically. /research and /race are unchanged in rhythm. Every section shares
  the `max-w-page` edge.
- **One solid violet button per viewport.** The rule holds inside the page: no viewport has two in-page
  primaries. The nav's solid "Start here" makes it two wherever a primary appears (fix 5, already open).
  The Start here rows correctly use underlined links, not buttons.
- **Type in rem.** The new components use the token scale (`text-display-s/m`, `text-lead`, `text-body`,
  `text-small`, `text-eyebrow`) and no px font sizes. Two carousel lines use arbitrary rem values off the
  scale (fix 13).
- **Start here rows against the card language.** They follow the system well: a hairline-ruled index list
  with mono numbers, 16/10 thumbs in `rounded-media` with a hairline border, one verb link per row, and
  the focus ring drawn around the row. It is not a card grid and it gives a strong first impression under
  the hero. On /about the full density (4/8 split, clip, caption) keeps the same vocabulary at a larger
  size.
- **Spinoff features against the card language.** They are `rounded-card` bordered paper cards, two across,
  with photo, mono kind line, mark, h3, sentence and link. That fits the system. The browser-window chrome (three
  ink dots, mono address pill, "Visit ↗", `shadow-card`) is a new motif outside the catalog, but it is
  tokenised and matches Cedric's "summarized preview" direction. Anti-pattern check: no emoji and no
  gradient buttons. Two equal cards are not the rejected "four identical cards after the hero". The brand
  reds of the two logos and the Quanser capture bring a colour the system does not use, which is acceptable
  as the companies' own marks. Weak spots: the blurred Neobotics capture and the dead space in the Quanser
  card (fix 11).
- **Accent use.** Gradient glyphs in Join (fix 6) are the one new off-token colour from today.
- **Motion.** No new motion beyond the existing Reveal staggers and the spinoff hover lift (`motion-safe`).
  Reduced motion degrades to static, readable layouts on / and /about.

## Screenshots (`docs/qa/p3-integration/`, git-ignored)

- Stitched walks: `<route>-<vp>-walk-NN.png` for route `landing|about|research|race`, vp
  `1536x730|1366x650|390x844|768x1024|844x390`; reduced motion `landing-*-reduced-walk-*`,
  `about-*-reduced-walk-*`; load-shift pairs `<route>-<vp>-t0.5s.png` / `-t3s.png`.
- Section captures: `sec-landing-{start,seam,join,research}-<vp>[-n].png`,
  `sec-about-{start,spinoffs,join}-<vp>-n.png`, `sec-research-list-<vp>-n.png`,
  `sec-race-leaderboard-<vp>-n.png`.
- Keyboard: `kbd-landing-start-row{1,5}-1536.png`, `kbd-nav-start-from-about-{1536,390}.png`,
  `kbd-nav-start-then-tab-{1536,390}.png`, `kbd-race-play-{focus,loaded}-1536.png`,
  `kbd-research-fold-{focus,open}-{1536,390}.png`.
- Hash targets: `hash-direct-{_start,about_about-spinoffs,race_leaderboard}-{1536,390}.png`.
- JavaScript off: `nojs-{landing,about,research,race}-{1536x730,390x844}.png`.

## Not checked

- `/news` (out of scope). Safari and WebKit (WebKit does not launch here), so check a real iPhone once.
- The Slack invite (fix 8) and the YouTube embeds in a real, non-headless browser.
- The replay iframe's own contents (third-party board) beyond focus entering and leaving it.

## Summary for Cedric

1. The integration holds: /, /research and /race can ship. /about needs one decision first.
2. The landing reads 00 to 08 at every size, the car meets the map cleanly, and Start here and Join work from mouse, touch and keyboard.
3. Zero console errors, zero failed site requests, zero axe violations on all four routes at 1536 and 390. CLS is at or below 0.009.
4. Blocker: the /about Spinoffs subtitle says Quanser "grew out of the car", and Quanser's own pages say otherwise. Give its origin, or reword the line.
5. Your calls: the "not confirmed" line in Past crew, the nav's "Start here" on /about, "30+" versus 30, the violet nav button beside a page primary, and open the Slack invite once.
