# Mobile audit: roboracer.ai on phones

2026-09-25, branch `revamp/p2-mobile` at 95ff8d7 (before the mobile fixes). Three
read-only auditors walked every route in Chromium with touch emulation (mobile
UA, `pointer: coarse`, `hover: none`, DPR 2-3, SwiftShader WebGL) against a
production build with local media: 390x844, 360x740, 414x896, 844x390
(landscape: wide but not `desktop:`), 768x1024 (tablet, `desktop:`, hamburger
nav), plus reduced motion at 390x844. Captures are stitched CDP scroll walks
(`docs/mobile/audit/<route>/`, git-ignored; `<device>-NN.png` tiles and
`<device>-strip.jpg`). The capture helper is described in `docs/mobile/PLAN.md`
section 6. WebKit would not launch on this host, so iOS-only behaviour (safe
areas, Safari fragment scrolling) is reasoned from the code.

Severity: **S1** broken or content lost; **S2** clearly wrong, looks broken to a
visitor; **S3** polish (rhythm, type, small targets, hardening).

## Summary

Nothing overflows horizontally on any route or device, no text is under 12 px,
no page uses `100vh`, and reduced motion leaves nothing stuck invisible. What
fails is the reading experience: the pinned chapters were never designed
unpinned, the mobile menu is not usable in landscape, and every section
boundary is a desktop-sized blank band.

| Route | S1 | S2 | S3 | Section below |
|---|---|---|---|---|
| `/` | 2 | 6 | 13 | A |
| `/about` | 0 | 2 | 5 | B |
| `/race` | 0 | 1 | 6 | B |
| `/news` | 0 | 3 | 4 | B |
| `/research` | 0 | 1 | 6 | B |
| `/assembly` | 0 | 1 | 2 | C |
| `/rules` | 0 | 0 | 7 | C |
| `/build`, `/learn` | 0 | 0 | 2 each | C |
| Chrome: nav, menu, footer, `index.html` (every route) | 1 | 1 | 7 | C |
| **Total, deduplicated** | **3** | **15** | **54** | |

The same defect was often found by more than one auditor; it is counted once,
under the owner in the table:

| Defect | Also reported as |
|---|---|
| CHROME-01 menu unreachable in landscape | LANDING-02, NAV-B1 |
| CHROME-02 menu not modal (Escape, scroll lock, tap-through, Tab) | LANDING-04, NAV-B2 |
| CHROME-04 bar tap targets | NAV-B3, part of LANDING-15 |
| CHROME-06 stale nav-height constants | LANDING-20 (landing's own offsets stay on the landing) |
| CHROME-07 bar takes 18% of a landscape phone | LANDING-19 |
| CHROME-08 legacy footer | LANDING-23, FOOT-B1 |
| LANDING-07 hero pause invisible on touch | LAND-HOVER-01 |
| LANDING-13 partner names hover-only | LAND-HOVER-02 |
| LANDING-14 marquees cannot pause on touch | LAND-HOVER-03, JOIN-B1 (part) |
| ABOUT-04 / RACE-07 section rhythm | every route (system fix) |

### The five worst

1. **CHROME-01 (S1), 844x390, every route.** The open menu is 525 px tall in a
   390 px window and cannot scroll: News, Simulator and Join the Slack are
   unreachable; a swipe scrolls the page behind. `src/index.css` `.mobile-menu`.
   Evidence `docs/mobile/audit/chrome/844-race-menu.png`.
2. **LANDING-01 (S1), every phone.** The car chapter's canvas stays sticky over
   its own captions, "Open the 3D viewer" link and both car photos, which scroll
   underneath it (a 135 px strip at 390; never visible at 844x390), then an empty
   ink band. `ExplodedModel.tsx` phone branch. Evidence
   `docs/mobile/audit/landing/390-car-05.png`, `844x390-car-05.png`.
3. **LANDING-03 (S1), 844x390.** The hero h1's first line sits under the fixed
   nav: type size, zoom and margins are keyed on width only.
   `HeroChapter.tsx`. Evidence `docs/mobile/audit/landing/844x390-hero-p46.png`.
4. **CHROME-02 (S2), every phone.** The open menu has no Escape, no scroll lock,
   no scrim, no outside-tap close; taps and Tab go through to the page.
   `NavBar.tsx`. Evidence `docs/mobile/audit/chrome/390-rules-menu.png`.
5. **LANDING-05 + LANDING-06 (S2), phones.** The pinned chapters do not read
   unpinned: the map stays pinned (counters count up below the fold in
   landscape, 4 px labels), and the Platform dial lights "Research" after its
   media frame has scrolled away. Evidence `docs/mobile/audit/landing/844x390-map-01.png`,
   `390-platform-06.png`.

Close behind: NEWS-01 (a blocked LinkedIn frame leaves a blank 342x692 box and
hides the fallback poster), RESEARCH-01 (/research is 63 phone screens; search
starts 14 screens down), ABOUT-01/02 (Past crew names clipped in a four-column
grid; People is 43% of /about), LANDING-25 (about 22 MB loads in the first 10 s
at the top of the landing on a phone, including 2.1 MB of 3D nobody has
scrolled to).

### What already works (leave it alone)

No horizontal overflow anywhere; every full-window box already uses `svh`; the
hero picks the 960 encode on portrait phones with poster, `muted`,
`playsinline`; "Start here" lands on `#start` from anywhere; the research
carousel swipes one card at a time; the LinkedIn frame fits at every tested
width; the leaderboard table fits 360 without scrolling; /assembly scrolls its
part list, has 44 px controls and a working focus mode; /rules anchors clear the
bar; /build and /learn fill the window with no double scrollbar; reduced motion
is static and complete on every route.

---

## A. Landing and the menu seen from it

Auditor A (read-only), 2026-09-25. Build `http://127.0.0.1:4300` (vite preview of `revamp/p2-mobile` at 95ff8d7, local media). Python Playwright via `mobilekit.py` in touch contexts (`pointer: coarse`, `hover: none`). Stitched CDP walks at 390x844, 844x390, 768x1024, 360x740, 414x896, plus 390x844 reduced motion. Scripted probes for the hero schedule, car-chapter occlusion (`elementFromPoint`), the platform dial, the map pin, the menu (CDP touch swipes, Escape, Tab, tap outside), carousel swipes, partner taps, a keyboard pass and a CDP byte count.

Screenshots in `docs/mobile/audit/landing/`: walk tiles `<dev>-NN.png`, strips `<dev>-strip.jpg` (`<dev>` = `390`, `360`, `414`, `844x390`, `768`, `390rm`); probes `390-car-NN`, `844x390-car-NN`, `390-platform-NN`, `390-map-NN`, `844x390-map-NN`, `*-menu-*`, `*-hero-*`, `*-research-*`, `390-partners-*`. Tile N sits at about 759·N (390x844), 351·N (844x390), 921·N (768), 666·N (360), 806·N (414).

Section map at 390x844 (document 17,927 px, about 21 screens):

| Section | Top (px) | Height (px) |
|---|---|---|
| Hero | 0 | 2,701 (320vh) |
| 00 Start here | 2,701 | 731 |
| 01 Highlights | 3,431 | 810 |
| 02 Car | 4,241 | 1,857 (220vh) |
| 03 Platform | 6,098 | 1,129 |
| 04 Map | 7,227 | 2,194 (260vh) |
| 05 Partners | 9,421 | 445 |
| 06 Next race | 9,866 | 1,257 |
| 07 Teams | 11,124 | 2,451 |
| 08 Research | 13,575 | 1,385 |
| 09 Join | 14,960 | 1,988 |
| Footer | ~16,948 | ~980 |

Counts: **S1: 3 · S2: 7 · S3: 16**

#### S1: broken, or content lost

**LANDING-01 · S1 · all phones (390, 360, 414, 844x390): the car chapter's captions, "Open the 3D viewer" link and both car photos slide under the sticky canvas; at 844x390 they are never visible.**
- Below `desktop:` the canvas cell (56svh canvas + callout list) sticks at `top 4.25rem` with `z-10 bg-ink-950`; the caption and photo column scrolls behind it. At 390x844 the cell covers y 68–709, leaving a 135 px strip (the 145 px photos never fit; each caption crosses it in ~200 px of scroll). At 844x390 the cell covers y 68–455, taller than the screen: every caption, the link and both photos covered at every step. After release, an empty ink band (wrapper 1,857 px vs 1,518 px of content at 390). Keyboard focus on "Open the 3D viewer" lands under the canvas (WCAG 2.4.11).
- Evidence: `390-car-03`…`08.png`, `390-07.png`, `414-07.png`, `844x390-08`…`10.png`, `844x390-car-03`…`09.png`, `390x844-focus-08.png`.
- Repro: scroll 4,480–5,600 at 390x844, or 2,850–3,600 at 844x390.
- Cause: `src/components/ui/ExplodedModel.tsx:422` (`sticky top-[4.25rem] z-10 bg-ink-950` on the canvas cell in the phone branch); `:407` inline `minHeight: 220vh` (`PIN_HEIGHT`, `:36`) on every device; `:413` only desktop pins the block.
- Fix: below `desktop:` keep the canvas in normal flow (no sticky/z/bg); move the 220vh to `desktop:`; on phones drive the explosion with a pass-through trigger (`top 80%` → `bottom 20%`), like PlatformPanel's `ROLL_QUERY`.

**LANDING-02 · S1 · 844x390 (any screen under ~600 px tall): four menu links unreachable.** (Same defect as NAV-B1 / CHROME-01.)
- Menu 525 px tall (y 72–597) inside the fixed nav on a 390 px screen; Research cut, News/Simulator/Join the Slack below the fold; a swipe scrolls the page behind (scrollY 0 → 235 → 470).
- Evidence: `844x390-menu-top.png`, `844x390-menu-after-swipe.png`.
- Cause: `src/index.css:499-507` `.mobile-menu` absolute, `top:100%`, no max-height/overflow.
- Fix: `max-height: calc(100dvh - 4.5rem); overflow-y: auto; overscroll-behavior: contain` + scroll lock (LANDING-04).

**LANDING-03 · S1 · 844x390: the first h1 line "Autonomous racing" sits under the fixed nav, never readable.**
- At pin progress 0.46 and 0.9 the three lines sit at y 3–81, 81–158, 158–235 (62.5 px type, zoom 1.3); line 1 overlaps the logo, "Start here" and the menu icon while the nav is transparent, then disappears behind the paper bar as it fills. Description at y 304–360 against the bottom edge.
- Evidence: `844x390-01.png`, `844x390-02.png`, `844x390-hero-p46.png`, `844x390-hero-p90.png`.
- Cause (`src/components/ui/HeroChapter.tsx`), keyed on width only: `:204` `DISPLAY_TYPE` `md:text-[7.4vw]`; `:141` `WIDE_QUERY = "(min-width: 768px)"` picks the 1.3 zoom at `:455`; `:714` `md:mt-24`.
- Fix: key size, zoom and margin on `desktop:` / `DESKTOP_QUERY`; below desktop cap the size by height (e.g. `text-[min(8.5vw,10svh)]`); keep the 1.12 narrow zoom.

#### S2: clearly wrong

**LANDING-04 · S2 · all phones: the open menu has no scroll lock, no Escape, no outside-tap close, no scrim, no focus containment.** (Same as NAV-B2 / CHROME-02.)
- At 390 the menu covers y 72–597; the live page stays visible and tappable below. Swipes scroll the page (0 → 522 → 964). Escape does nothing. A tap outside leaves the menu open and hits the page. Tab leaves the menu into the page. (Working: the bar goes solid, focus ring visible.)
- Evidence: `390-menu-top.png`, `390-menu-after-swipe.png`, `390-menu-mid.png`, `360-menu-top.png`.
- Cause: `src/components/NavBar.tsx:110-177`; `index.css:499`.
- Fix: Escape + outside tap close and return focus to the toggle; lock page scroll; scrim; `inert` on the page while open.

**LANDING-05 · S2 · 844x390 (390 portrait less so): the 04 map chapter stays pinned on phones.**
- 844x390: pinned block 545 px tall on a 390 px screen; for the whole pin (y 5,339–5,963) the map bottom, the four counters and the legend are below the fold, counters count up out of sight; 25 city labels (`md:block`) render at 4 px; dots 2.9 px; map 420 px wide.
- 390x844: the pin fits but spends 1,350 px of scroll on a 342x151 map with 4.7 px dots and no labels; `min-h-svh justify-center` leaves ~270 px blank between the Platform text and "04".
- Evidence: `844x390-map-00`…`03.png`, `844x390-16.png`, `844x390-17.png`, `390-map-00`…`04.png`, `390-09.png`.
- Cause (`src/components/ui/WorldMapChapter.tsx`): `:719-727` 260vh wrapper + `sticky min-h-svh` on every device (only reduced motion unpins); `:558` labels `hidden md:block`; `:101` local `DESKTOP_QUERY = "(min-width: 768px)"` (width only); `:456` `--map-max` floor 26.25rem.
- Fix: pin only at `desktop:` (import `DESKTOP_QUERY` from `lib/motion`); below desktop render the reduced-motion branch (final state) or a non-pinning reveal; labels only at `desktop:`.

**LANDING-06 · S2 · phones: the Platform dial spreads its four bands over the whole section, so "Research" lights only after the media frame has scrolled away; at 844x390 the frame is taller than the screen.**
- At 390 the Race → Research switch starts with the frame at y −142…122 (mostly under the nav); the Research clip is at most a 50 px sliver; the lit "Research" title sits under the nav (top −7), then ~250 px of blank. At 844x390 the `aspect-[16/10]` frame is 796x497. The component doc (`PlatformPanel.tsx:110`) promises inline posters and no video on phones; the code ships one frame, the dial and video.
- Evidence: `390-platform-05.png`, `390-platform-06.png`, `844x390-12`…`14.png`.
- Cause: `src/components/ui/PlatformPanel.tsx:36`, `:163-169` (`ROLL_QUERY` triggers on the whole wrapper incl. header, `top 75%` → `bottom 25%`); `:230` `aspect-[16/10]` uncapped below desktop.
- Fix: below desktop give each pillar its own row with an inline poster (as the doc says), or trigger the dial on the frame+dial block only; cap the frame `max-h-[55svh]` on short screens.

**LANDING-07 · S2 · every touch device: the hero pause button is invisible.** (Same as LAND-HOVER-01.)
- `opacity-0` until `group-hover` (never on `hover: none`) or keyboard focus: an invisible 40x40 tap area bottom right; a stray tap pauses the video and only then shows the button. ~35 s clip cycle: WCAG 2.2.2 on touch.
- Evidence: `390-hero-00.png` (measured opacity 0).
- Cause: `src/components/ui/HeroChapter.tsx:725-727`.
- Fix: `[@media(hover:none)]:opacity-100` and 44 px (`h-11 w-11`).

**LANDING-08 · S2 · 844x390: each research card is 726x813, more than two screens tall.**
- The 16/10 figure alone is 454 px; reading the abstract means scrolling vertically inside a sideways row.
- Evidence: `844x390-research-00.png`, `844x390-33`…`35.png`.
- Cause: `src/components/ui/ResearchCarousel.tsx:690` (`w-[86vw]`) with the stacked card layout (`:219-220`) whenever `STAGE_QUERY` is false.
- Fix: on short wide screens the two-pane card at `h-[calc(100svh-6rem)]`, or `w-[min(86vw,24rem)]`.

**LANDING-09 · S2 at 844x390, S3 at 390: Teams stays at two columns of square photos until `lg`.**
- 844x390: ~398 px squares, each taller than the screen; section 3,351 px (8.6 screens). 390: 2,451 px, 138 px text columns (124 at 360), results wrap to 4–7 mono lines.
- Evidence: `844x390-23`…`31.png`, `390-15`…`17.png`, `360-16`…`18.png`.
- Cause: `src/components/ui/TeamGrid.tsx:292` (`grid-cols-2 … lg:grid-cols-5`), `:299` (`aspect-square`).
- Fix: `sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` with 4/3 photos under lg; on portrait phones consider one row per team with a 5rem photo.

**LANDING-10 · S2 · reduced motion at 390: the static partner grid spans ~5 screens; the page grows 38%.**
- Each ribbon becomes a grid keeping the strip's `gap-16`: ~2 logos per row at 34 px over 4,413 px; the community strip becomes 12 stacked cards (Join 6,833 px). Page 24,796 px vs 17,927.
- Evidence: `390rm-10`…`15.png`, `390rm-23`…`32.png`.
- Cause: `src/pages/Landing.tsx:272` (`gap-16 pr-16`), `src/index.css:217-230`, `CommunityJoin.tsx:146`.
- Fix: under reduced motion one dense grid for all partners (`grid-cols-3 gap-x-6 gap-y-4`), and a manually swiped row for the community cards.

#### S3: polish

- **LANDING-11 (design note):** at 390 the first screen is video and nav only; the headline starts at 186 px of scroll and completes at ~780 px; nothing changes from 855 to 1,858 px; the scroll cue appears only after 10 s; the auto-scroll fired at ~33 s idle (a touch cancels it). Evidence `390-hero-t0.png`, `390-hero-00.png`, `390-hero-p25.png`…`p100.png`. Cause `HeroChapter.tsx:137` (`h-[320vh]` on every device). Consider `h-[220vh] desktop:h-[320vh]`.
- **LANDING-12 (media note):** in portrait the 16:9 960 encode is cropped to the centre 26% (1,500 CSS px wide at 390, 4.7x upscale at DPR 3): soft. A portrait centre-crop encode would be sharper and lighter.
- **LANDING-13:** on touch, partner names never show (hover/focus pill, `Landing.tsx:321`); the first tap on a moving logo opens the site; logos 70x34 median, four under 24 px tall, narrowest 27 px; the 82 colour `image_hover` logos (1.6 MB) download on touch but never show (`Landing.tsx:296-308`): render them only when `(hover: hover)`. Evidence `390-partners-00.png`, `390-partners-after-tap.png`.
- **LANDING-14 (a11y):** Highlights, partner and community strips pause only on `:hover`/key focus: no pause on touch (WCAG 2.2.2); community cards carry text and links moving ~58 px/s. Cause `index.css:213-216`, `HighlightReel.tsx:55`, `CommunityJoin.tsx:146`. Fix: pause toggle per strip, or a manually swiped row on touch.
- **LANDING-15:** tap targets under 44 px: menu button 40x40 (`index.css:482`); bar "Start here" 99x32 (`NavBar.tsx:286`); logo 186x32; pause 40x40; carousel strip 24x32 at 390 (`ResearchCarousel.tsx:534`); arrows 32x32 (`:271`); "Read the paper" 116x19; 12x "View on LinkedIn" 120x19; "Team site" 68x29; "Open the 3D viewer" and "Browse the research" 29 px tall; footer links 19–20 px (`Footer.tsx:4`). Fix: `min-h-11` hit areas via padding; visuals unchanged.
- **LANDING-16:** heading sizes invert on phones: the h1 is 33 px at 390 (30.6 at 360), smaller than the 36 px `display-l` h3s ("IROS 2026, Pittsburgh", the lit dial row). Cause `index.css:69` (`display-l` min 2.25rem). Lower that min on phones or raise the h1.
- **LANDING-17:** orphaned last words: "…building and / racing" (`390-19.png`), "…build on this / platform" (`390-18.png`). Fix `text-balance` on the SectionHeader subtitle, `text-pretty` on the lead.
- **LANDING-18:** desktop-sized gaps at 390: ~100 px between the Platform lead and the frame (header `mb-12` + `gap-10`), ~100 px between the caption and the dial (`PlatformPanel.tsx:212`), ~270 px between Platform and Community (LANDING-05). Fix `gap-6 desktop:gap-10`, `mb-8 desktop:mb-12`.
- **LANDING-19:** at 844x390 the nav is 72 of 390 px (18%) with a 40 px logo; size steps are width-only (`index.css:555-583`). Add a `(max-height: 33.99rem)` step for a ~3.5rem bar.
- **LANDING-20:** sticky offsets assume a 4.25rem (68 px) nav, the phone bar is 4.5rem (72 px): 4 px of the canvas under the nav (`ExplodedModel.tsx:413,422`, `WorldMapChapter.tsx:723`). One nav-height token.
- **LANDING-21 (design note):** under 390 px wide, "Start here" moves from the bar to the last menu item (`NavBar.tsx:286`); a 1.75rem logo would let it fit (`360-menu-top.png`).
- **LANDING-22:** in 06 Next race the video comes first, so "Register your team" is ~1,050 px below the title at 390 (`Landing.tsx:342-381`). Consider `order-first md:order-none` on the panel (lead's call).
- **LANDING-23:** footer still legacy (`bg-gray-900`, `text-gray-400`, `max-w-7xl`, `responsive-padding`, 16 px edge vs 24 px), ~980 px tall with 19 px link rows (`Footer.tsx:4`, `:13-16`; `390-23.png`, `360-24.png`). Same as CHROME-08.
- **LANDING-24 (768x1024):** (a) "Register your team" wraps to two lines (`Landing.tsx:342` 7/5 split, `NextRaceSpotlight.tsx:83` `md:p-10`; `768-15.png`); (b) the callout "TRAXXAS SLASH 4X4 · 1/10 CHASSIS" runs under the photos (`ExplodedModel.tsx:421` 8/4 split; `768-06.png`); (c) the research figure sits at the bottom of an empty pane (`ResearchCarousel.tsx:220`; `768-19.png`).
- **LANDING-25 (performance, reported not fixed):** 10 s at the top of a 390 phone, no scrolling: video 10.6 MB, images 8.0 MB (187 requests), 3D 2.1 MB (`RacecarAssembly` 1.25 MB, HDR 344 KB, 11 GLB, STL 152 KB, all without scrolling), JS 737 KB, fonts 165 KB, CSS 90 KB: **~21.9 MB** (uncompressed preview). One hero cycle is 13.75 MB at 960; landscape phones and tablets get the 1280/1920 files (37 MB per cycle; the 844x390 walk pulled 41 MB of video). The YouTube reel starts itself at 60% visible. Causes: `ExplodedModel.tsx:233-236` (3D preload on every device), `HeroChapter.tsx:141,309` (file choice by width), `Landing.tsx:125` (held images released after 4 s regardless), `Landing.tsx:296-308`, `YouTubeFacade.tsx:54-61`. Suggestions: preload 3D only at `desktop:`, pick the video file by `DESKTOP_QUERY`, skip hover logos on touch, YouTube click-to-play on touch.
- **LANDING-26 (check on a real iPhone):** (a) `index.html:6` has no `viewport-fit=cover` (landscape notch: paper side bands next to dark sections); (b) the hero's sticky layer is `h-svh` (`HeroChapter.tsx:646`) in a 320vh wrapper, so a strip of ink may show under the video when the toolbar collapses. Fix `viewport-fit=cover` with `env(safe-area-inset-*)` padding, and `h-dvh`.

#### Working, leave alone
- No horizontal overflow at any of the five sizes; no text under 12 px; body 16 px, lead 18 px.
- Hero on portrait phones: loads the 960 file (`hero-iv-start-v2-960.mp4`) with the poster preloaded; `muted`, `playsinline`, `play()` work; clip cycle and crossfades run; headline keeps a 31 px margin at 390; description readable over the dimmed video; nav fill-in and fade-out work; auto-scroll cancels on touch.
- "Start here": in the bar from 390 wide, in the menu below; lands on `#start` (header 133 px from the top) from mid-page, from `/about` and on a fresh `/#start` load; moves focus to the section.
- Menu at 390/360/414 apart from LANDING-04: solid bar when open, 53 px links, visible focus, correct ARIA, nav back to transparent over the hero.
- Carousel on phones: a swipe moves exactly one card; strip and SR announcement update; vertical swipes scroll the page; a strip tap jumps to its card. At 390x844 the 710 px card fits; the next card peeks 15 px.
- 00 Start here: 121 px full-width rows; 2x2 at 844 and 768.
- Map at 390 portrait: fits, names each race as it appears, counters finish.
- 06 Next race stacks cleanly at 390 and 360.
- Reduced motion (apart from LANDING-10): hero poster then the headline on paper; no videos load; nothing stuck invisible; Platform posters and list; map final state; car captions, link and photos.
- Highlights: 185 px tiles; videos load only near the screen.
- Console: no errors on any device (aborted video requests from clip switching, the YouTube stats ping, a headless "No available adapters." warning).

#### Copy notes (not mobile defects)
- "· verify" shows in the Join photo caption (`community.json:14`) and "STEERING SERVO · VERIFY" (`racecarAssemblyData.ts:355`): deliberate per the code, but reads unfinished on a phone.
- The Research lead says "Eight papers"; the carousel shows 11.
- 06 Next race shows "registration closes September 9, 2026" (passed) above a live "Register your team" button (`upcoming_events.json:35`).
- The YouTube reel showed "This video is unavailable" in headless Chrome (oEmbed 200): probably headless; check on a real phone.


---

## B. /about, /race, /news, /research

Auditor B, 2026-09-25. Worktree `roboracer-site-wt/p2-wayfinding` (`revamp/p2-mobile`, HEAD 95ff8d7), production build on `http://127.0.0.1:4300`.
Devices: 390x844, 360x740, 414x896, 844x390 (not `desktop:`), 768x1024 (`desktop:`, hamburger nav). Touch contexts (`pointer: coarse`, `hover: none`, root font 16px everywhere).
Screenshots are under `docs/mobile/audit/<route>/` in the worktree (git-ignored): `<prefix>-NN.png` tiles (1x CSS, one viewport each), `<prefix>-strip.jpg` stitched walks, `390-rm-NN.png` reduced motion, plus named probe captures. Raw reports: `B-<route>-<device>.json`, `B-probe-*.json`, `B-rm.json` in the scratchpad.

**Global results for all four routes:** `scrollWidth == innerWidth` on every device, and the overflow scan found **zero** elements crossing the viewport edge. No text under 12px. No `h-screen`/`100vh` in these routes' components (only `NearViewport` `60svh` and Layout `100svh`, both fine). Reduced motion at 390x844: nothing stuck at opacity 0 on any route, tickers show final values, no `<video>` is created, the About YouTube facade does not self-start. Console: no errors from our code (the only entries come from LinkedIn's frame on /news and YouTube's player on /about, see notes). Focus rings are visible (2px violet outline) on the nav, the CTAs and the filter chips (`docs/mobile/audit/research/390-focus-chip.png`).

Severity: S1 broken or content lost, S2 clearly wrong, S3 polish.

| Route | S1 | S2 | S3 |
|---|---|---|---|
| /about | 0 | 2 | 5 |
| /race | 0 | 1 | 6 |
| /news | 0 | 3 | 4 |
| /research | 0 | 1 | 6 |
| Shared chrome seen on these routes (not counted above) | 1 | 1 | 3 |

---

### /about

Page height: 26,001 px at 390 (31 screens), 26,631 at 360, 19,014 at 844x390. The People section alone is 11,268 px at 390 (43% of the page).

| ID | Sev | Device | What you see | Evidence | Repro | Root cause | Suggested fix |
|---|---|---|---|---|---|---|---|
| ABOUT-01 | S2 | 390, 360, 414 | Past crew grid: long names and project roles run past their cell and are clipped by the next cell or by the grid's `overflow-hidden`: "Christophe(r)", "Konkimall(a)", "Kumtheka(r)", "Leberman(n)", "Maheshwa(ri)", "Pennypack(er)", "Sreenivasu(lu)", "Localizatio(n)", "Autonomou(s)". Measured: 8 cells overflow at 390 (up to 17px), 14 at 360 (up to 25px), 5 at 414. Cells are 85px (390), 78px (360), 91px (414). | `about/390-18.png`, `about/390-19.png`, `about/360-22.png`, `about/414-17.png` | /about, scroll to "Past crew" (y about 13,300 at 390) | `src/components/about/PeopleGroup.tsx:100-103` (`COLUMNS.compact = [4, 7, 12]`) and `:117-118` (`grid-cols-4` at base); `PersonCard.tsx:48` (`p-3` leaves ~61px of text width); nothing lets a long word break. | Base 3 columns for compact (`grid-cols-3 sm:grid-cols-7 lg:grid-cols-12`, `COLUMNS.compact = [3, 7, 12]` so the fillers stay right) and add `[overflow-wrap:anywhere]` (or `break-words hyphens-auto`) to the name link and the `project_role` line in `PersonCard`. |
| ABOUT-02 | S2 | 390, 360, 414, 844x390 | People density. Faculty (11) and Developers (13) render as 2-column cards with a full square portrait and 4-6 line roles (~420px per row), so People is ~13 phone screens before Partners. At 844x390 the grid is 3 columns of 240px portraits: every card is taller than the viewport, 8,135px of section (21 landscape screens). The intent in `PeopleGroup.tsx:98-99` ("so a reader reaches the partners without scrolling through fifty portraits") is lost on phones. | `about/390-06.png` to `about/390-20.png`, `about/390-strip.jpg`, `about/844x390-10.png`, `about/844x390-11.png` | /about at 390, scroll from "03 People" to "04 Our partners" | `PeopleGroup.tsx:117-119` (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`), `PersonCard.tsx:25-26` (full-width `aspect-square` photo on every card) | Below `sm`, lay `PersonCard` out as a row: portrait `w-16`/`w-20` square on the left (`max-sm:flex-row`, photo `max-sm:w-20 max-sm:shrink-0 max-sm:aspect-square`), text on the right, one column (`grid-cols-1 sm:grid-cols-3`). Keep the hairline grid. For landscape (wide, short), cap the portrait (`max-desktop:` variant or `max-h-[40svh]`), or use 4 columns from `sm` when not `desktop:`. Roughly halves the section. |
| ABOUT-03 | S3 | 390, 360, 414 | The "↗" after a wrapped name drops onto its own line ("Rahul Mangharam / ↗", "Dhruv Karthik / ↗", "Chris Kennedy / ↗"). | `about/390-07.png`, `about/390-18.png` | People cards | `PersonCard.tsx:57` (`<span aria-hidden="true"> &#8599;</span>`: a breaking space before the arrow); same pattern `SpinoffGrid.tsx:262-265` | Use a no-break space: `{" "}&#8599;` (or wrap last word + arrow in `whitespace-nowrap`). |
| ABOUT-04 | S3 | all phones; worst 844x390 | Every section boundary is a blank band: `py-section` = 80px bottom + 80px top = 160px at 390; 101 + 101 = 202px at 844x390, half the landscape viewport. Seven boundaries on this page. | `about/390-02.png`→`390-03.png`, `about/390-06.png`, `about/390-26.png`→`390-27.png`, `about/844x390-09.png` | Scroll past any section end | `src/index.css:92` `--spacing-section: clamp(5rem, 12vw, 10rem)`, applied in `src/components/ui/Section.tsx:50` | System decision for the lead (index.css owner): e.g. `clamp(3.5rem, min(12vw, 16svh), 10rem)`; or keep the token and have `Section` use `py-section-tight` below `desktop:`. Same on every route. |
| ABOUT-05 | S3 | 844x390 | The hero YouTube facade runs the full container width (796px), so the 16:9 poster is 448px tall in a 390px viewport: the video can never be seen whole in landscape. | `about/844x390-01.png`, `about/844x390-02.png` | /about at 844x390, scroll one screen | `src/pages/About.tsx:201-205` (`mx-auto mt-12 max-w-page px-6` wrapper) | Cap the width by the viewport height below `desktop:`: `max-desktop:max-w-[min(100%,calc((100svh-6rem)*16/9))]` on the wrapper (centred). Same treatment would suit any full-width 16:9 media in landscape. |
| ABOUT-06 | S3 | all phones | The hero facade self-starts: once 60% visible (first scroll on a phone) it mounts YouTube's player iframe (player JS, stream) with `autoplay=1&mute=1`. On a phone that is a data and battery cost the reader did not ask for. (Our headless Chromium shows "This video is unavailable"; oEmbed returns 200 for `wPHYLAnpMOU`, so that is the test browser, not the video. Verify on a real phone.) | `about/390-01.png`, `about/768-00.png` | /about at 390, scroll 400px | `src/components/ui/YouTubeFacade.tsx:199-213` (auto-start observer), `About.tsx:203` (default `autoStart`) | Decision for the lead: pass `autoStart={false}` on coarse pointers / non-`desktop:` (the poster and 56px play disc are already a good facade). Reduced motion already never self-starts. |
| ABOUT-07 | S3 | all phones | Standalone links under 44px tall: platform "Build the car", "Start the course", "See the races", "Browse the research" (22px), person name links (26px), video cards' "… on YouTube ↗" (19px), the hero caption channel link (19px). Spacing between them is fine. | `about/390-04.png`, `about/390-05.png`, `about/390-28.png` | Tap-target report `B-about-390.json` | `PlatformList.tsx:187-193`, `PersonCard.tsx:50-58`, `YouTubeFacade.tsx:270-274` | `inline-flex min-h-11 items-center` (2.75rem) on those standalone links; keep the underline style. |

**Works, leave alone:** no overflow at any size; h1 36px (display-l floor) with lead and the four-stat ledger in the first 390 viewport; platform rows stack cleanly with muted `playsInline` clips that mount near the viewport and pause off it (posters under reduced motion); the partner wall (3 columns, 48px logo boxes, lazy, no shift) is readable; spinoffs stack to one column; all six video facades are 16:9 with the whole poster as the button and a 56px play disc, tap-to-load, never self-start; contributor chips are 52px tall; `NearViewport` keeps the Join block's four clip copies off first paint; reduced motion clean.

---

### /race

Page height: 11,157 px at 390, 10,481 at 844x390. Leaderboard loaded live from the class board (Lab 4, two boards) on every device.

| ID | Sev | Device | What you see | Evidence | Repro | Root cause | Suggested fix |
|---|---|---|---|---|---|---|---|
| RACE-01 | S2 | 768x1024, 844x390 | The hero splits 7/5 from `md`, so the next-race panel gets ~276px (768) with 40px padding: the primary "Register your team" button wraps to two lines at 768, the dates headline takes 3 lines, "multi-agent, up to 4 cars" wraps. At 844x390 the panel is ~2 screens tall beside a short video, leaving an empty ink half. | `race/768-00.png`, `race/844x390-00.png` to `race/844x390-02.png` | /race at 768x1024, first screen | `src/pages/Race.tsx:149-150,185` (`md:grid-cols-12`, `md:col-span-7` / `md:col-span-5`); `src/components/ui/NextRaceSpotlight.tsx:83` (`p-8 md:p-10`); `src/components/ui/buttonStyles.ts:15` (no `whitespace-nowrap`) | Split the race hero at `lg:` instead of `md:` (stacked on tablets and landscape phones, like the phone layout that already works); panel padding `p-6 sm:p-8 lg:p-10`; add `whitespace-nowrap` to the shared button base so a CTA never breaks. |
| RACE-02 | S3 | all phones | Leaderboard board switch chips are 39px tall (8px apart). | `race/390-12.png`, `race/360-14.png` | /race, section 05 | `src/components/race/Leaderboard.tsx:26-27` (`px-4 py-2 text-small`) | `min-h-11` (2.75rem) on `CHIP_BASE`; same fix as `TagFilter` (NEWS-06) so the two chip rows stay identical. |
| RACE-03 | S3 (latent) | 360, 390 | The table fits today (anonymous aliases "Team 8"; the extra column hides below `sm`; values `whitespace-nowrap`), but the alias cell has no break rule: a non-anonymous board with a long single-word team name would widen the table past the column, and html/body `overflow-x: clip` would cut the lap-time column off. There is no scroll container. | `race/390-12.png`, `race/360-14.png` | Only with a long alias | `Leaderboard.tsx:223-227` (row `th`) | Add `[overflow-wrap:anywhere]` to the alias `th` (or wrap the table in `overflow-x-auto` with the `-mx-6 px-6` edge). |
| RACE-04 | S3 | 390, 360, 414 | "This season": a race with no photo (VTC 2026 Fall) shows a full-width 16:9 empty paper box with a faint logo, a 342x192 hole in the chain on a phone. | `race/390-05.png` | /race, section 02 | `src/components/race/SeasonChain.tsx:67-96` and `:127-129` (placeholder always rendered at full column width) | On phones, render the placeholder at the timeline's thumbnail size (`max-md:w-32`, as `RaceTimeline.tsx:219`) or skip it when `!event.image` below `md`. |
| RACE-05 | S3 | all phones | Small standalone links: "our post on LinkedIn ↗" hero credit (21px), "RoboRacer teams Slack" (18px), "Team site" (29px), timeline event names (23px, 24px apart, acceptable). | `race/390-00.png`, `race/390-03.png`, `race/390-09.png` | Tap-target report `B-race-390.json` | `Race.tsx:168-175`, `Race.tsx:259-261`, `src/components/ui/TeamGrid.tsx:236` (`py-1`) | `inline-flex min-h-11 items-center` on those links (TeamGrid: `py-3`). |
| RACE-06 | S3 | all phones | The hero clip is the 1272px encode (836 KB), loaded with `priority` at first paint, for a 342px box. | `race/390-00.png` | Network: `race-iros2026-hero-1272.mp4` | `Race.tsx:24-26,155-164` | Media owner's call: a ~640px encode for non-`desktop:` (roboracer-media budgets), or drop `priority` below `desktop:` so the poster leads. |
| RACE-07 | S3 | all phones | Section rhythm: 160px blank band at each of five boundaries (202px at 844x390). | `race/390-03.png`→`race/390-04.png`, `race/844x390-09.png` | | `src/index.css:92`, `Section.tsx:50` | See ABOUT-04 (system decision). |

Non-mobile note for the lead: registration shows "closed" in the panel, but "Register your team" stays the primary CTA in the hero and in section 01 (`NextRaceSpotlight.tsx:130`, `Race.tsx:236`). This is a content decision, not a layout one.

**Works, leave alone:** no overflow; h1 36px, lead and the hero video in the first 390 viewport, panel stacks under it; countdown lines wrap cleanly (`flex-wrap justify-between`); entry steps stack one per row with a readable 16px body; the leaderboard table fits 360 and 390 without scrolling (rank, alias, right-aligned mono lap time; extra column from `sm`), skeleton rows keep the height; the timeline's 128px thumbnails keep rows compact and pre-2025 years fold into a native `<details>`; TeamGrid 2 columns; hero video is muted, `playsInline`, poster-first; reduced motion static.

---

### /news

Page height: 13,795 px at 390, 8,634 at 844x390. LinkedIn's frame loads on every device; console entries (`getInstalledRelatedApps`, aborted `static.licdn.com` requests) come from inside LinkedIn's frame.

| ID | Sev | Device | What you see | Evidence | Repro | Root cause | Suggested fix |
|---|---|---|---|---|---|---|---|
| NEWS-01 | S2 | all (worst on phones: 692px box) | If LinkedIn's frame fails (content blocker, tracking protection, network error), the lead story shows a **blank 342x692 white box**: the frame still fires `load` on its error page, `loaded` flips to true, the opaque `bg-paper-50` iframe covers the poster, and the poster link turns `aria-hidden` and `tabIndex=-1`. | `news/390-linkedin-blocked.png`, `news/390-linkedin-blocked-2.png` | /news at 390 with requests to `*linkedin.com*` and `*licdn.com*` aborted; scroll to the lead | `src/components/news/LinkedInEmbed.tsx:280-307` (`onLoad={() => setLoaded(true)}`, `bg-paper-50`, poster hidden once `loaded`) | Keep the poster visible behind a transparent frame (drop `bg-paper-50` on the iframe, since LinkedIn paints its own background), and never hide the poster link based on `onLoad` alone. Or use a load timeout plus `postMessage`-free heuristics. The poster must stay the fallback, as the component comment says. |
| NEWS-02 | S2 | 390, 360, 414 | While the frame loads (seconds on a phone network) the poster is shown `object-cover` in a 340x690 box. The 4:5 slide (1080x1350) is cropped by ~19% on each side, so its headline reads "4 racers. / o steering whee". | `news/390-linkedin-poster.png`, `news/360-linkedin-poster.png` | /news with LinkedIn requests held open | `LinkedInEmbed.tsx:294` (`h-full w-full object-cover object-top`) in the fixed-height box `:279` | `object-contain object-top` on the poster (the box is already `bg-paper-100`), so the whole slide shows at the top of the box. |
| NEWS-03 | S2 | 844x390; S3 at 768x1024 | Year headings are sticky from `md` (width only): a ~48px band pinned at 96px under the 72px nav. In landscape, nav plus band cover ~38% of the 390px viewport and cut card titles mid-line. At both sizes card text shows through the 24px gap between the nav and the band ("logistics ↗" above "2026"). | `news/844x390-08.png` to `news/844x390-11.png`, `news/768-03.png` | /news at 844x390, scroll into "2026" | `src/pages/News.tsx:185` (`md:sticky md:top-24 md:z-10 md:bg-paper-100/95 md:py-2 md:backdrop-blur-sm`) | Gate the sticky year on `desktop:` (or `lg:`), not `md:`, and set it flush under the bar (`top-[4.5rem]`, the nav's 4.5rem) so nothing peeks through. |
| NEWS-04 | S3 | all phones; worst 844x390 | Top of page: `pt-[4.25rem]` wrapper + `py-section` = 148px before the eyebrow (76px blank under the nav at 390, ~100px at 844x390, where the first screen then holds little more than the h1). | `news/390-00.png`, `news/844x390-00.png` | /news first screen | `News.tsx:79` + `:81` (first `Section` untight) | First section `pt-8 desktop:pt-section` (or `tight`) so the masthead starts ~2rem under the bar, as About and Race heroes do (`pt-[5.5rem]` total). Same on /research. |
| NEWS-05 | S3 | 390, 360 | h1 breaks "News from the / races", leaving one orphan word. | `news/390-00.png`, `news/390-rm-00.png` | | `News.tsx:88-91` | `text-balance` on the h1 (better: a base-layer `text-wrap: balance` for display headings, system decision; add it in `@layer base` per the unlayered-CSS rule). |
| NEWS-06 | S3 | all phones | Filter chips 39px tall, 8px apart; lead-story action links "Read the post on LinkedIn ↗" and "See the full results ↗" are 21px tall, stacked 8px apart. | `news/390-01.png`, `news/390-03.png` | | `src/components/ui/TagFilter.tsx:306`; `src/components/news/NewsLead.tsx:57-66, 90-101` | Chips `min-h-11`; action links `inline-flex min-h-11 items-center` (the row already wraps with `gap-x-6`). |
| NEWS-07 | S3 | 390, 360 | "Send us your news": ~90px gap between the lead and the button (`SectionHeader` `mb-12` plus grid `gap-10`). | `news/390-16.png` | | `News.tsx:207` (`gap-10`) + `SectionHeader.tsx:114` (`mb-12`) | `gap-6 md:gap-10`, or pass `className="mb-0"` to that header. Same pattern on /research submit. |

LinkedIn frame sizing, measured (LinkedIn's document height as a top-level page at each frame width vs the box `LinkedInEmbed.tsx:279` gives it): 312px wide needs 689 (box 692, fits by 3px, the 360 case); 342 needs 689 (box 692, the 390 case); 366 needs 653 (box 692, 39px spare at 414); 544 needs 608 (box 612, tablet and landscape). **No clipping and no nested scroll on any test device**, so the step table is correct. It is a tight fit at 360: a 320px phone (frame 272px) would clip. Optional: add a base step below `@min-[19.5rem]`.

**Works, leave alone:** no overflow; h1 44px fits 312/342; ledger 2x2; the lead stacks (text, stats 3-across, byline, links, then the post); LinkedIn frame mounts 300px ahead and fits at every tested width; archive cards one column with 16:10 lazy images with dimensions; text cards `self-start` (no stretched empty panels); filter updates the `aria-live` count; reduced motion clean.

---

### /research

Page height: **53,065 px at 390 (63 screens)**, 57,861 at 360, 49,768 at 414, 36,775 at 844x390. The 390 and 360 walks stop at 60 tiles (~45k px); the page tail is in `research/390-tail-0..2.png`. 137 papers listed, 17 featured, 11 topic chips.

| ID | Sev | Device | What you see | Evidence | Repro | Root cause | Suggested fix |
|---|---|---|---|---|---|---|---|
| RESEARCH-01 | S2 | 390, 360, 414 | Length. The featured grid is one column of 17 full cards (16:10 figure + text, ~670px each = 11,439px, 13.5 screens). "Every paper we track" and its search start at y=12,281 (14.5 screens down). The list then runs 39,304px (137 rows ~280px, titles up to 198px tall at 390 and 223px at 360 in a 206/176px column). A phone reader has no practical way to reach search or older years. | `research/390-02.png` to `research/390-15.png` (featured), `research/390-16.png` (list start), `research/390-strip.jpg` | /research at 390, scroll | `src/pages/Research.tsx:182` (`grid gap-6 md:grid-cols-2 lg:grid-cols-3`, all 17 rendered); `src/components/research/PaperCard.tsx:60` (full-width 16:10 figure); `Research.tsx:247-261` (every year open) | On phones: (a) show the first 3-4 featured, then a native `<details>` "Show all 17 featured" (the `RaceTimeline.tsx:339-362` pattern), or a compact card below `sm` (thumb left like `PaperRow`); (b) fold years before 2025 into one `<details>` like the race timeline; (c) optionally a mono "search all papers" anchor to `#all-curated` next to the filter. Copy for (c) is a note for the lead. |
| RESEARCH-02 | S3 | 390, 360 | The search input is 229px wide in a 342px (312px) column: it does not fill the row on phones. | `research/390-search.png`, `research/360-search.png`, `research/390-16.png` | /research, "All papers" header | `src/components/ui/SectionHeader.tsx:145` (action wrapper `min-w-0 max-w-full` shrink-wraps), so `Research.tsx:205` `w-full md:w-80` resolves against the shrunken wrapper | `max-md:w-full` on the SectionHeader action wrapper (neutral on desktop; About's partner ticker is unaffected visually). |
| RESEARCH-03 | S3 | 390, 360 | The topic filter is a wall: 11 chips wrap into 8 rows (~380px), each 39px tall with 8px gaps. | `research/390-filters.png`, `research/360-filters.png` | | `TagFilter.tsx:306` (chip size), `:314` (`flex flex-wrap gap-2`) | `min-h-11` chips (shared with NEWS-06). To shorten the wall, below `sm`: one horizontally scrolling row (`max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:-mx-6 max-sm:px-6 snap-x`) with the selected chip scrolled into view. Lead's call: a scroll row hides options. |
| RESEARCH-04 | S3 | all phones | Per-row "arXiv" / "PDF" / "DOI" links are 40x18 / 24x18px, 16px apart. They are the row's direct paper links, and on phones they sit alone on a line under the thumbnail. | `research/390-search.png`, `research/390-17.png` | | `src/components/research/PaperRow.tsx:225-238` | `inline-flex min-h-11 min-w-11 items-center` on each extra link (keep mono text-small). |
| RESEARCH-05 | S3 | all phones; worst 844x390 | Same top gap as NEWS-04 (148px before the eyebrow). At 844x390 the first screen is the eyebrow plus the 3-line 50px h1 only: lead, CTA and ledger are below the fold. | `research/844x390-00.png`, `research/844x390-01.png`, `research/390-00.png` | | `Research.tsx:63` + `:65` | As NEWS-04. |
| RESEARCH-06 | S3 | 390, 360 | h1 leaves "platform" alone on the last line ("1,000+ / publications / reference the / platform"). | `research/390-00.png`, `research/390-rm-00.png` | | `Research.tsx:72-77` | `text-balance` (see NEWS-05). |
| RESEARCH-07 | S3 | 390, 360 | Paper rows: the 120px thumbnail leaves 206px (176px at 360) for a `text-lead` title, so titles run 5-8 lines. | `research/390-17.png`, `research/390-search.png` | | `PaperRow.tsx:155` (`w-[7.5rem]` at base) | `w-20` (5rem) thumb below `sm`, or `text-body` title below `sm`. Either cuts row height by about a third and compounds with RESEARCH-01. |

Also: "Submit your paper" has the same ~90px lead-to-button gap as NEWS-07 (`Research.tsx:270`, `research/390-tail-1.png`); section rhythm as ABOUT-04 (`research/844x390-01.png`). Not counted again.

**Works, leave alone:** no overflow at any size (longest h1 word "publications" fits 312px at 44px); search input font 16px (no iOS zoom), 52px tall, native clear button, live count "6 of 137 papers · 'overtaking'"; focus order nav → Scholar CTA → chips with visible violet rings; featured figures lazy with width/height, venue tiles on the missing ones; 768 tablet layout (2-column featured, `[1fr_auto]` rows with right-aligned links) is good; reduced motion static.

---

### Shared chrome seen on these routes (for the chrome/landing owner, not counted per route)

| ID | Sev | Device | What you see | Evidence | Root cause | Suggested fix |
|---|---|---|---|---|---|---|
| NAV-B1 | S1 | 844x390 | Open menu is 525px tall (top 72 to 597) in a 390px viewport, `overflow: visible`, inside the fixed bar: "Research" is cut, and **News, Simulator and Join the Slack cannot be reached** (scrolling moves the page underneath, not the menu). | `news/844x390-menu-open.png` | `src/index.css:499-507` (`.mobile-menu` absolute, no max-height/overflow) | `max-height: calc(100svh - 100%)` (or `calc(100svh - 4.5rem)`), `overflow-y: auto`, `overscroll-behavior: contain`. |
| NAV-B2 | S2 | 390, 844x390 | With the menu open the page scrolls underneath (wheel moved `scrollY` by 400), and **Escape does not close it** (still open, `aria-expanded="true"`). Focus stays on the toggle, which is acceptable for a disclosure. | `race/390-menu-open.png`, `B-rm.json` | `src/components/NavBar.tsx:114-177` (no keydown handler, no scroll lock) | Close on Escape and return focus to the toggle. Lock page scroll while open (`overflow: hidden` on html, or `inert` on `main`). |
| NAV-B3 | S3 | all phones | Bar "Start here" is 32px tall and the menu toggle 40x40 (both under 44). Below 390px "Start here" moves into the menu by design. | any `*-00.png` | `NavBar.tsx:286` (`px-3.5 py-1.5`), `.nav-menu-button` | Invisible hit-area padding (`relative` + `after:absolute after:-inset-1.5`) keeps the 2rem visual size. |
| FOOT-B1 | S3 | all phones | Footer links are 19px tall at ~17px pitch. | `race/390-14.png` | `src/components/Footer.tsx` | `py-2.5` on footer list links. |
| JOIN-B1 | S3 | all phones | CommunityJoin marquee cards: "View on LinkedIn ↗" 19px tall; the contact mail link is 37px. | `about/390-32.png` | `src/components/ui/CommunityJoin.tsx` | `min-h-11` on those links. |

### Notes for the lead
- System decisions that touch every route: the section token (ABOUT-04) and `text-wrap: balance` on display headings (NEWS-05 / RESEARCH-06).
- Chips: `TagFilter` and the leaderboard `CHIP_BASE` should get the same `min-h-11` so the two stay one component language.
- No copy changes are required for any fix above. The only copy item is the optional "search all papers" anchor in RESEARCH-01 (c).
- The About hero YouTube "This video is unavailable" in headless Chromium is the test browser (oEmbed 200). Check it on a real phone once.


---

## C. /assembly, /rules, /build, /learn and the site chrome

Auditor C, 2026-09-25. Worktree `roboracer-site-wt/p2-wayfinding` (branch `revamp/p2-mobile`, HEAD `95ff8d7`),
production build on `http://127.0.0.1:4300`, Chromium + SwiftShader via `mobilekit.py` (touch, mobile UA,
`pointer: coarse`, `hover: none`). Devices: 390x844, 360x740, 414x896, 844x390, 768x1024, plus reduced motion
at 390x844. WebKit could not launch on this host (missing `libgav1`, `libyuv`), so iOS-only behaviour
(safe areas, fragment scrolling after async content) is reasoned from the code, not measured.
Screenshots: `docs/mobile/audit/{chrome,assembly,rules,build,learn}/` (git-ignored). Raw data:
`C-chrome-390.json`, `C-chrome-360-844.json`, `C-chrome-414-768.json`, `C-rules-*.json`, `C-frames.json`,
`C-assembly.json` in the scratchpad.

### Counts

| Scope | S1 | S2 | S3 |
|---|---|---|---|
| Chrome (nav, menu, footer, index.html) | 1 | 1 | 7 |
| /assembly | 0 | 1 | 2 (+ CHROME-06) |
| /rules | 0 | 0 | 7 |
| /build | 0 | 0 | 2 (+ CHROME-06) |
| /learn | 0 | 0 | 2 (+ CHROME-06, same file pattern as /build) |
| Grep hits owned by other pages (/, /about) | 0 | 1 | 2 |

Worst five: CHROME-01 (S1), CHROME-02 (S2), ASM-01 (S2), LAND-HOVER-01 (S2, landing, from the grep),
CHROME-06 (S3, the stale nav-height constants behind three routes).

---

### Chrome (NavBar, mobile menu, Footer, Layout, index.html), every route

Measured on `/`, `/about`, `/race`, `/news`, `/research`, `/assembly`, `/rules`, `/build`, `/learn` at
390x844, 360x740 and 844x390 (plus `/rules` and `/about` at 414x896 and 768x1024). The nav is identical on
all nine routes: bar 72 px (4.5rem) at every width below 1024, wordmark 186x32 (phones) / 232x40 (from 640),
"Start here" in the bar from 390 up, in the menu under 390.

#### CHROME-01 · S1 · 844x390: the lower half of the mobile menu cannot be reached
- **See**: the open menu is 525 px tall under a 72 px bar in a 390 px window. "Research" is half cut
  (361-414), "News", "Simulator" and "Join the Slack" sit at 414-573, below the window. Swiping on the menu
  scrolls the page behind it instead (wheel test: page `scrollY` +400, menu `top` stays 72, `scrollTop` 0).
  Same on all nine routes.
- **Shots**: `docs/mobile/audit/chrome/844-race-menu.png`, `844-rules-menu.png`, `844-home-menu.png`.
- **Repro**: any route, 844x390, tap "Open menu", try to reach "News".
- **Root cause**: `src/index.css:499-507` `.mobile-menu` is `position: absolute; top: 100%` inside the
  `position: fixed` `.navbar` (`index.css:355`) with no `max-height` and no `overflow-y`, so nothing can
  scroll it and the page scrolls underneath.
- **Fix**: `max-height: calc(100svh - 4.5rem); overflow-y: auto; overscroll-behavior: contain;` on
  `.mobile-menu` (4.5rem = the bar, see CHROME-06 for a shared token). On short landscape screens the
  links could also go two-up (`@media (max-height: 30rem) { .mobile-menu { display: grid; grid-template-columns: 1fr 1fr; column-gap: 1.5rem } }`), which fits all nine in 318 px.

#### CHROME-02 · S2 · all devices: the open menu is not modal enough for a phone
- **See**: (a) Escape does nothing (menu still open after Escape on every route and device tested);
  (b) no scroll lock: the page scrolls under the open menu (`scrollY` +400 under a 400 px wheel on every scrolling route),
  so the reader loses their place; (c) no scrim and no outside-tap close: at 390 the page below the menu
  (y 597-844) stays visible and live, a tap there hits page links while the menu stays open;
  (d) Tab walks the menu and then leaves it into the page behind (`tabseq`: after "Join the Slack" focus goes
  to "Pause footage" on `/`, "Register your team" on `/race`, the iframe on `/build`), with the menu still
  covering the top of the screen. Focus return is fine: closing with the button leaves focus on it.
- **Shots**: `docs/mobile/audit/chrome/390-rules-menu.png` (page text live under the menu),
  `390-home-menu.png`.
- **Repro**: 390x844 `/rules`, open the menu, press Escape; or scroll the text under the menu.
- **Root cause**: `src/components/NavBar.tsx:110-337` has no keydown handler, no outside-pointer handler,
  no body lock, no `inert` on `main`; the panel (`NavBar.tsx:311-334`) is a plain absolutely placed div.
- **Fix**: in the `menuOpen` effect add a `keydown` Escape -> `setMenuOpen(false)` + focus the toggle;
  set `document.documentElement.style.overflow = "hidden"` while open (html/body already clip x); a
  full-height paper/ink scrim sibling (`fixed inset-0 top-[4.5rem] bg-ink-950/30`) whose click closes;
  and `inert` on `<main>`/`<footer>` while open (keeps Tab inside nav + menu without a trap library).

#### CHROME-03 · S3 · all devices: no current-page mark in the mobile menu
- **See**: every menu link has `aria-current=null` on its own route (e.g. "Rules" on `/rules`); the desktop
  bar marks it (underline + `aria-current="page"`).
- **Shot**: `docs/mobile/audit/chrome/390-rules-menu.png`.
- **Root cause**: `NavBar.tsx:313-317` maps the links without the `active` test used at `NavBar.tsx:242-253`.
- **Fix**: same `active` test, `aria-current="page"`, and a visible mark in `.mobile-menu-link[aria-current]`
  (font-weight 600 + the 2 px `currentColor` bar the desktop link uses, or `text-text-strong` with a
  `shadow-[inset_0.125rem_0_0_var(--color-ink-950)]` like the selected /assembly row).

#### CHROME-04 · S3 · phones: bar tap targets under 44 px
- **See**: menu toggle 40x40 on every device; "Start here" in the bar 99x32 (390, 414), 119x40 (from 640);
  wordmark link 186x32. Toggle and "Start here" are 8 px apart (ok).
- **Root cause**: `index.css:482-490` (`padding: 0.5rem; margin: -0.5rem` around a 24 px icon);
  `NavBar.tsx:286` `py-1.5 text-small leading-5` (kept small on purpose so the bar stays 4.5rem).
- **Fix**: toggle `padding: 0.625rem; margin: -0.625rem` (44 px, bar height unchanged). For "Start here" keep
  the visual size and grow the hit area only: `relative after:absolute after:-inset-y-1.5 after:content-['']`.

#### CHROME-05 · S3 · 390 and up: stray hairline under the last menu link
- **See**: "Join the Slack" keeps its bottom border, then 24 px of padding (visible in the 390/414/768/844
  menu shots). At 360 it is correct because "Start here" is visible there.
- **Root cause**: `index.css:519-521` `.mobile-menu-link:last-child` never matches: the last child is the
  menu "Start here" (`NavBar.tsx:330`), which is only `display:none` via `min-[24.375rem]:hidden`.
- **Fix**: draw the rule on top instead (`.mobile-menu-link + .mobile-menu-link { border-top: 1px solid var(--color-paper-200) }`, no bottom border), or `min-[24.375rem]:border-b-0` on the Slack link.

#### CHROME-06 · S3 · all phones, 844x390, 768x1024: page offsets assume a nav height the nav no longer has
- **See**: the bar is 72 px (4.5rem) at every width under 1024 (`index.css:555-575`, comment: "the bar keeps
  4.5rem"), but the workspace pages pad for 68 px under `md` and 85 px from `md`:
  - `/build`, `/learn`: iframe top 68 -> **4 px of the docs' header under the nav** on 360/390/414; iframe top
    85 -> **a 13 px paper band** between nav and frame at 768 and at 844x390, where every pixel counts
    (frame only 305 px tall).
  - `/assembly`: same 13 px band at 844x390 and 768 (frame starts at 101 instead of 88).
  - Same constants in `ExplodedModel.tsx:413` and `WorldMapChapter.tsx:723` (`pt-[calc(4.25rem+1rem)]`,
    landing), and `Rules.tsx:61` (`pt-[5.5rem] md:pt-[6.5625rem]`, 16 px vs 33 px gap).
- **Shots**: `docs/mobile/audit/build/390-top.png`, `build/844-top.png`, `learn/844-top.png`,
  `assembly/844-ready.png`.
- **Root cause**: `src/pages/Build.tsx:3`, `src/pages/Learn.tsx:3`, `src/pages/Assembly.tsx:156`
  `pt-[4.25rem] md:pt-[5.3125rem]`; 5.3125rem (85 px) is the old desktop bar, 4.25rem is 4 px short.
- **Fix**: one token in `index.css` (`--spacing-nav: 4.5rem`, 5rem from `lg`, next to the `.navbar` rules)
  and `pt-nav` / `pt-[calc(var(--spacing-nav)+1rem)]` everywhere; remove the `md:` step.

#### CHROME-07 · S3 · 844x390: the fixed bar takes 18.5% of a landscape phone on every route
- **See**: 72 of 390 px, on every route, never hides. On `/build`/`/learn` the docs get 305 px, on
  `/assembly` the frame and panel 273 px, on `/rules` 318 px of reading height.
- **Root cause**: `.navbar` padding and `.nav-logo` height (`index.css:361, 385, 555-575`) have no
  short-viewport step.
- **Fix**: `@media (max-height: 30rem) { .navbar { padding-block: 0.625rem } .nav-logo { height: 2rem } }`
  (bar 3.25rem = 52 px, same breakpoint family as `desktop:`'s 34rem height rule) with CHROME-06's token
  following it.

#### CHROME-08 · S3 · 390/360: the Footer is the legacy block, off the page edge and the token system
- **See** (same on every route that has it): (a) left edge 16 px (`responsive-padding` = `px-4`) while the
  wordmark above and every revamped page sit at 24 px (`px-6`); (b) one column, 979 px tall at 390 (999 at
  360), more than a full screen for 12 links; (c) link hit areas 19-20 px tall (14 px text), `contact@` 20 px,
  "Sponsor a race" 20 px (36 px pitch, so spacing passes 2.5.8 but not the 44 px house bar); (d) column
  headings are 24 px (the legacy base-layer `h3`, `index.css:276-281`) next to 14 px links; (e) the legal line
  is centred under left-aligned columns; (f) colours are Tailwind `gray-900`/`gray-400`, not `ink-*` /
  `text-on-ink-muted`. There are no social icons besides the Slack button (GitHub, YouTube, LinkedIn are
  absent: content call for the lead).
- **Shots**: `docs/mobile/audit/chrome/390-home-footer.png`, `360-home-footer.png`, `390-rules-footer.png`.
- **Root cause**: `src/components/Footer.tsx:4, 13, 15-16, 39, 52, 81, 111-118`.
- **Fix**: `mx-auto max-w-page px-6`; `grid-cols-2` from the smallest width for Quick links + Resources
  (brand and Community span 2), halving the height; links `inline-flex min-h-11 items-center` (or `py-2.5`)
  on coarse pointers; headings as the mono eyebrow (`font-mono text-small text-text-on-ink-muted`) like the
  section indices; `bg-ink-950 text-text-on-ink-muted`; legal line `text-left md:flex-row`.
- **Copy notes for the lead**: "Creative Commons License" is plain text with no link and no licence name
  (`Footer.tsx:116-118`); the footer says "Join Slack", the nav and menu say "Join the Slack".

#### CHROME-09 · S3 · index.html: no theme colour, no safe-area plan for landscape notches
- **See** (reasoned, not measurable in Chromium): `index.html:6` is
  `width=device-width, initial-scale=1.0` (no `viewport-fit=cover`), there is no
  `<meta name="theme-color">`, and `src/` has zero `env(safe-area-inset-*)`. On a notched iPhone in landscape
  Safari letterboxes the page and paints the side bands with the html background (paper-50), so the ink hero,
  ink chapters and the dark footer get pale bars at both sides; the browser UI tint is sampled, not set.
  Nothing is hidden under the notch today (the letterbox protects it), so this is polish.
- **Fix**: add `<meta name="theme-color" content="#fbfbfd">` (paper-50, the bar colour). If the pale bands
  bother Cedric, add `viewport-fit=cover` **together with** `padding-inline: max(1.5rem, env(safe-area-inset-left/right))`
  on `.navbar` and the `max-w-page px-6` containers and `padding-bottom: env(safe-area-inset-bottom)` on the
  footer's legal bar; never `cover` alone.

#### Chrome: verified working (leave alone)
- Bar height 72 px and wordmark scale identical on all nine routes and five devices; no horizontal overflow
  from the chrome anywhere.
- "Start here" sits in the bar from 390 up and moves into the menu as a full-width violet button at 360 (52 px
  tall); from the menu at 360 on `/rules` it lands on `/#start` with the section heading clear of the bar.
- The menu closes on every navigation (`location.key`), the toggle's `aria-expanded`/`aria-controls` and label
  flip correctly, focus stays on the toggle after closing, the first Tab after opening enters the menu.
- Reduced motion: the menu opens at opacity 1 with no tween and unmounts on close.
- The menu forces the solid paper bar over the landing video; focus ring visible (violet 2 px) on the bar.
- Layout: `/assembly`, `/build`, `/learn` are exactly one window (`docScrollH == innerHeight` on all devices),
  no footer, no double scrollbar.

---

### /assembly

Verified at 390x844, 360x740, 414x896, 844x390, 768x1024 and 390x844 reduced motion. The 3D view loads and
renders on SwiftShader (canvas 595x646 at 390 with the DPR cap 1.75), no console errors, no overflow, no text
under 12 px. Canvas effective `touch-action: none` (R3F wrapper), so drags turn the car and never move the page.

#### ASM-01 · S2 · 360x740: the frame controls wrap to two rows and sit on the car
- **See**: "Assembled | Exploded" needs 194 px and "Reset view" 102 px plus the 8 px gap = 304 px; the frame
  leaves 300 px (312 wide minus the 12 px inset), so "Reset view" drops to a second row. The two rows cover
  y 298-397 of a 326 px frame (the bottom third): the front wheel is hidden in the home view and, in focus
  mode, the selected steering servo sits against the buttons.
- **Shots**: `docs/mobile/audit/assembly/360-ready.png`, `360-selected-servo.png`.
- **Repro**: `/assembly` at 360x740, no interaction needed.
- **Root cause**: `src/pages/Assembly.tsx:300` (`absolute bottom-3 left-3 flex flex-wrap gap-2`) with
  `px-3` buttons at `Assembly.tsx:314` and `:326`.
- **Fix**: keep one row: `right-3 flex-nowrap justify-between` and `px-2.5` on the three buttons (292 px, fits
  300), or move "Reset view" to the top-right corner and shorten the hint to one line at `max-[24.375rem]`.

#### ASM-02 · S3 · 844x390 (also a little at 390): the controls cover the front wheel in the home view
- **See**: in the 273 px landscape frame the controls band (44 + 12 px) is 21% of the frame height; the home
  framing centres the exploded car on the full frame, so the front-left wheel is half behind
  "Exploded"/"Reset view".
- **Shots**: `docs/mobile/audit/assembly/844-ready.png` (crop in scratchpad `C-asm-844-crop.png`).
- **Root cause**: `src/components/RacecarAssembly.tsx:477-490` (`HOME_FILL` height 0.66, target at the frame
  centre) does not know about the overlay at `Assembly.tsx:300`.
- **Fix**: shift the home view up by half the controls band (`camera.setViewOffset` or lower
  `VIEWER_TARGET` by the band's share) when the frame is under ~20rem tall, or use `HOME_FILL.height` 0.56 there.

#### ASM-03 · S3 · 360x740: a wrapped build-guide link leaves its arrow stranded at the right edge
- **See**: "Build guide: Attaching the PPM cable" wraps to two lines and the "↗" floats at the far right of the
  box, detached from the text.
- **Shot**: `docs/mobile/audit/assembly/360-selected-servo.png`.
- **Root cause**: `Assembly.tsx:251` (`inline-flex items-center gap-1`): the text is one flex item that wraps,
  the arrow a second item.
- **Fix**: plain `inline` with the coarse-pointer padding on an `inline-block` wrapper, or keep the label and
  `<ExternalMark />` in one span so the arrow follows the last word.

#### /assembly observation (not counted, Cedric's call; the layout was QA'd today)
- At 360x740 and 844x390 the panel shows the heading block and one part row; the list scrolls inside the panel
  (`overflow-y: auto`, scrollHeight 747-918 vs 273-298) with no visual hint that more rows follow. A bottom fade
  (`mask-image: linear-gradient(to bottom, #000 85%, transparent)` while not scrolled to the end) would say so.

#### /assembly: verified working (leave alone)
- One window tall, no page scroll, no footer; the part list scrolls where it must: at 844x390 the panel scrolls
  to "Last step: wire it all together" (bottom exactly at the panel edge), same at 390/360/414/768.
- Tap sizes on touch: Assembled/Exploded/Reset 44 px (`min-h-11`, `pointer:fine` shrink works), rows 61-82 px,
  "Open the build guide" 44 px, guide links 45 px.
- Focus mode: a row selects its part (others grey, camera glides, row opens its note and guide link, the row
  scrolls into view); a canvas tap selects the part under it ("Computer"); Escape clears; "Assembled" works.
- Split view at 844x390 (frame left, 24rem panel right); frame-over-panel on portrait phones and 768.
- Reduced motion: identical layout, canvas visible (opacity 1), nothing stuck at 0; hint says "Pinch to zoom" on
  touch.

---

### /rules

`public/rules.md` has **no tables, no code blocks and no bare long URLs** (the two long URLs are inside HTML
comments), so nothing overflows: `scrollWidth == innerWidth` at 360, 390, 414, 768 and 844 and the overflow
report is empty. Page height 30,756 px at 390 (32,672 at 360). Full walks:
`docs/mobile/audit/rules/{390,360,844,768}-walk-*.png` and `*-walk-strip.jpg`.

#### RULES-01 · S3 · phones: the text edge is 16 px, the page edge is 24 px
- **See**: body text and headings start at x=16 on 360/390/414 while the wordmark above starts at 24; at 768
  and 844 the text is at 32.
- **Shots**: `docs/mobile/audit/chrome/390-rules-top.png`, `rules/844-walk-03.png`.
- **Root cause**: `src/pages/Rules.tsx:61` uses the legacy `responsive-padding` (`index.css:297-301`,
  `px-4 md:px-8 ...`).
- **Fix**: `mx-auto w-full max-w-page px-6` (the shared edge), text measure handled by RULES-06.

#### RULES-02 · S3 · phones: heading scale and colour are the legacy set, the h1 barely outranks an h2
- **See**: h1 "RoboRacer Rules" 32 px / 700 in body grey (#3b3f55), h2 28 px violet-deep, h3 24 px, h4 20 px.
  Other pages' h1 are `text-display-l` (36 px at 390) in `text-text-strong`; violet is reserved for buttons,
  hover underline and focus (accent rule). HANDOFF lists `/rules` typography as still legacy.
- **Shot**: `docs/mobile/audit/chrome/390-rules-top.png`.
- **Root cause**: `src/pages/rules.css:62-97`.
- **Fix**: h1 `text-display-l text-text-strong`, h2 `text-display-m text-text-strong`, h3 `text-display-s`,
  h4 16 px semibold; the CSS-counter numbers in `font-mono text-text-muted` (as the section indices elsewhere).

#### RULES-03 · S3 · all: the source note renders at 16 px and comes before the h1
- **See**: the first thing on a phone is a four-line muted paragraph; the h1 starts at y=214 (390) / 238 (360).
  The note was meant to be 14 px.
- **Root cause**: `rules.css:13-17` `.rules-source { font-size: 0.875rem }` loses to `.rules p` (`rules.css:105-110`,
  higher specificity) -> 16 px.
- **Fix**: select it as `.rules .rules-source` (or `p.rules-source`); consider rendering the note after the
  document's h1 (split the first line out in `render()`), or give the page its own eyebrow + h1 and demote the
  document's `# RoboRacer Rules`.

#### RULES-04 · S3 · phones: a 36-screen document with its contents only at the top
- **See**: the contents list is the only navigation; after section 2 there is no way back to it except
  fling-scrolling 30,000 px. No sticky contents, no back-to-top.
- **Root cause**: `Rules.tsx:26-40` renders the document as is; `rules.css` has no contents affordance.
- **Fix**: in `render()`, append a small "Back to contents ↑" link (`#` of the contents list) after each h2
  section, or a sticky "Contents" `<details>` under the bar on phones (`sticky top-[4.5rem]`).

#### RULES-05 · S3 · all: contents links are 22 px tall with 7 px between them
- **See**: the 15 contents links (block list items, not running text) are 22 px tall at a 29 px pitch.
- **Root cause**: `rules.css:131-133` (`.rules li { margin-bottom: 0.3125rem }`) and the default inline link.
- **Fix**: for the contents list only (first `ul` after "organized as follows"): `a { display: inline-block;
  padding-block: 0.625rem }` under `@media (pointer: coarse)`; running-text links stay as they are.

#### RULES-06 · S3 · 844x390 and 768x1024: lines run to ~95-100 characters
- **See**: paragraphs 780 px wide at 844 and 704 at 768 (16 px Manrope), about twice the phone measure.
- **Root cause**: `rules.css:112-115` `max-width: 90ch`.
- **Fix**: `max-width: 68ch` (the value `.rules-source` already uses) or the `content` container.

#### RULES-07 · S3 (hardening) · all: nothing guards a future table, code block or long token
- **See**: today nothing overflows because the file has none of these. `scripts/check-rules-drift.mjs --write`
  copies upstream byte for byte, and `html, body { overflow-x: clip }` (`index.css:131`) would silently cut a
  table or a long URL at the right edge.
- **Root cause**: `rules.css:163-173` styles tables without a scroll wrapper; no `overflow-wrap` on `.rules-body`.
- **Fix**: `.rules-body table { display: block; overflow-x: auto; max-width: 100% }`,
  `.rules-body pre { overflow-x: auto }`, `.rules-body { overflow-wrap: break-word }`.

#### /rules risk (unverified, WebKit unavailable here)
- Deep links (`/rules#kill-switch`, `#time-trial`, `#track-features`) land correctly in Chromium on a fresh load,
  because Chromium retries the fragment scroll after the fetched markdown renders. Safari is known not to retry
  after async content. `src/hooks/useScrollToHash.ts` already exists (landing): calling it once `html` is set in
  `Rules.tsx:53` would make it deterministic.

#### /rules: verified working (leave alone)
- Anchor jumps clear the fixed bar: contents link -> `#definitions` and `#time-trial` land the target at 176 px
  with the heading fully visible; inline term links (`#green-flag`) land the same; Back returns to the previous
  anchor. `scroll-margin-top` in `rules.css:51-60` does its job.
- Body 16 px / 24 px line height, ~45 characters per line on phones; the deepest list (4 levels) keeps a
  248 px column at 360; no text under 12 px, nothing truncated, no overflow on any device.
- The draft highlight (`mark`) reads as one quiet tint; focus ring visible on links (violet 2 px).

---

### /build and /learn

Same pattern (`src/pages/Build.tsx`, `src/pages/Learn.tsx`). Both readthedocs sites load in the emulator
(network reachable, no `X-Frame-Options`), in 3-4 s. Inside the frame the docs get the full frame width
(no horizontal scroll), their own viewport meta, and their end is reachable by scrolling inside the frame
(`scrollY == max` at 390 and 844). The page itself never scrolls (`docScrollH == innerHeight`), so there is
no double scrollbar, and `100svh` is right here: the document does not scroll, so the iOS toolbar never
collapses and the frame ends at the visible bottom.

#### BUILD-01 / LEARN-01 · S3 · see CHROME-06: 4 px of the docs' header under the bar on phones, a 13 px dead band at 844x390 and 768
- **Shots**: `docs/mobile/audit/build/390-top.png`, `build/844-top.png`, `learn/390-top.png`, `learn/844-top.png`.
- **Root cause / fix**: `Build.tsx:3`, `Learn.tsx:3`; the shared nav token in CHROME-06.

#### BUILD-02 / LEARN-02 · S3 · all: no h1, and no way out of the frame on a small screen
- **See**: `h1` count 0 on both routes (house rule: one h1 per page). At 844x390 the docs get a 305 px tall frame
  and switch to their desktop layout (sidebar + content, their "Read the Docs" flyout over the sidebar foot); on
  phones the docs' own 55 px blue bar stacks under our 72 px bar (127 px of chrome). There is no "open the docs
  in a new tab" link anywhere on the page.
- **Shots**: `docs/mobile/audit/build/844-top.png`, `learn/844-top.png`, `build/390-top.png`.
- **Root cause**: `Build.tsx:1-11`, `Learn.tsx:1-11` render only the iframe.
- **Fix**: `<h1 className="sr-only">Build the car</h1>` / `Learn`; a small text link "Open the docs ↗" (for
  example right-aligned in the nav band on these two routes, or `sr-only focus:not-sr-only`), plus CHROME-07's
  compact bar on short landscape screens to give the frame back ~20 px.

#### /build, /learn: verified working (leave alone)
- The frame fills exactly the window under the bar on all five devices; no footer; external docs load and
  scroll to their end; the iframe has a `title`; the menu opens over the frame and closes normally.

---

### Site-wide greps (all of `src/`)

#### Viewport-height units
No `100vh`, `h-screen`, `min-h-screen` or `max-h-screen` anywhere. Every full-window box already uses `svh`:
`Layout.tsx:53`, `Build.tsx:3`, `Learn.tsx:3`, `Assembly.tsx:156` and `:280` (`44svh`), `Chat.tsx:33`,
`HeroChapter.tsx:619` and `:646` (`h-svh`), `PinnedChapter.tsx:79`, `WorldMapChapter.tsx:456/463/723`,
`ExplodedModel.tsx:367/413/423`, `PlatformPanel.tsx:212/230`, `NearViewport.tsx:27`, `Styleguide.tsx:357`.

The four remaining `vh` values are scroll lengths or clamped row heights, not boxes that must fit the window;
none needs to change for the address bar (iOS `vh` = the large viewport and does not resize while scrolling):

| file:line | value | owner | phones? | verdict |
|---|---|---|---|---|
| `src/components/ui/HeroChapter.tsx:137` (used `:642`) | `h-[320vh]` pin length | `/` | yes (not in the static branch) | keep; `svh` only for consistency |
| `src/components/ui/ExplodedModel.tsx:36` (used `:407`, inline `minHeight`) | `220vh` pin length | `/` | yes (not static) | keep; `svh` optional |
| `src/components/ui/PlatformPanel.tsx:202` | `desktop:motion-safe:min-h-[300vh]` | `/` | no (desktop only) | fine |
| `src/components/ui/HighlightReel.tsx:11` | `h-[clamp(10rem,22vh,16.25rem)]` row height | `/` | yes | fine (clamped); `svh` optional |

#### Fixed sizes that could exceed 360 px
No `w-[NNNpx]`, `h-[NNNpx]`, `min-w-[...]` or px `basis` utilities exist in `src/` (the site sizes in rem).
Rem widths over 22.5rem are all gated or max-widths: `Assembly.tsx:164` `md:landscape:w-[24rem] lg:w-[30rem]`
(768+ only), `LinkedInEmbed.tsx:39` `max-w-[34rem]`, `NewsLead.tsx:78` `max-w-[36rem]`. Fixed Tailwind widths
are small or responsive (`RaceTimeline.tsx:45` `w-32 sm:w-48 md:w-64 lg:w-72`, `Research.tsx:205`
`w-full md:w-80`, `Leaderboard.tsx:151` skeleton `w-64` = 256 px). Info for `/news`: `LinkedInEmbed.tsx:40` is a
fixed `h-[43.25rem]` (692 px) scroll box under 23.75rem, nearly a full 360x740 screen of nested scrolling (by
design per its comment).

#### Hover-only affordances with no touch equivalent
| id | sev | file:line | owner | what is lost on touch | fix |
|---|---|---|---|---|---|
| LAND-HOVER-01 | S2 | `src/components/ui/HeroChapter.tsx:726` | `/` | The hero video's pause button is `opacity-0 group-hover:opacity-100` while playing: on a phone the autoplaying loop has no visible pause control (it still takes a Tab stop). WCAG 2.2.2. Visible as the invisible "Pause footage" Tab stop in the menu test and absent from `chrome/844-home-top.png`. | `[@media(hover:none)]:opacity-100` (or `opacity-70`) so touch always sees it |
| LAND-HOVER-02 | S3 | `src/pages/Landing.tsx:321` | `/` | Partner institution names in the marquee appear only on hover/focus; a phone reader sees logos only, never the names. | show the name line under the logo on `hover:none`, or rely on the static list |
| LAND-HOVER-03 | S3 | `src/index.css:213-216` | `/`, shared `CommunityJoin` / `LogoCloud` | The marquee pauses on hover or key focus only; touch has no way to stop moving content (WCAG 2.2.2 for motion over 5 s). | pause while `:active`/on `pointerdown`, or a small pause toggle, or slower/static on `hover:none` |

Not hover-only (fine): `Landing.tsx:306` logo colour swap and `PartnerWall.tsx:42` opacity 85 -> 100 are
cosmetic; `/assembly` row/part hover lighting has click and focus equivalents; `EntryPaths.tsx:36` arrow nudge
is decoration. `src/App.css` (`.logo:hover`) is not imported anywhere (dead file).
