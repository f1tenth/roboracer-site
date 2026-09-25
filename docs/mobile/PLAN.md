# Mobile plan: the small-screen reading experience

2026-09-25. The "mobile design pass" that `docs/HANDOFF.md` section 2 asks for,
driven by `docs/mobile/AUDIT.md` (defect ids below refer to it). This is not a
new design: the same tokens, primitives, section headers, card language and
motion vocabulary, re-read for a 360 to 430 px column and a 390 px tall
landscape window. Copy is final (`docs/copy/BRIEF.md`); nothing here rewrites a
string.

## 1. What "mobile" means on this site

- **`compact:`** (new, `src/index.css`) is the exact complement of `desktop:`:
  `not all and (min-width: 48rem) and (min-height: 34rem)`. It covers a phone in
  either orientation and any window too short for a pinned chapter. 768x1024
  portrait tablets are `desktop:` and keep the desktop layout, with the
  hamburger nav until 1024.
- **`coarse:`** (new) is `(pointer: coarse)`: tap sizes grow here and nowhere
  else, so the mouse layout never moves. /assembly already wrote the same query
  as `[@media(pointer:coarse)]`.
- Width breakpoints (`sm:`, `md:`, `lg:`) still decide columns. `compact:` or
  `desktop:` decides anything that depends on height: pins, sticky blocks,
  `svh` media, the hero's type.

## 2. System decisions (landed by the lead in `eb39a3c`, before the fixers branched)

| # | Decision | Where |
|---|---|---|
| S-1 | `compact:` and `coarse:` variants | `src/index.css` top |
| S-2 | **Phone rhythm.** Below `desktop:`, `--spacing-section` is `clamp(3rem, 7svh, 4rem)` (59 px at 390x844, 48 px in landscape, was 80 and 101) and `--spacing-section-tight` is `clamp(2.5rem, 5svh, 3rem)`. Every `py-section` on every route follows; desktop and 768 unchanged. Fixes ABOUT-04, RACE-07 and the rhythm half of LANDING-18. | `src/index.css` `@layer base` |
| S-3 | **Nav height token** `--spacing-nav` (`pt-nav`, `top-nav`, `calc(var(--spacing-nav) + 1rem)`): 4.5rem below 1024 (the bar's real height; pages used 4.25rem and 5.3125rem), 5.3125rem from 1024 (unchanged desktop). The chrome fixer adds the short-landscape value with the compact bar (C-2). Replaces every `4.25rem` / `5.3125rem` literal (CHROME-06, LANDING-20). | `src/index.css` `@theme` + `@layer base` |
| S-4 | **Headings balance, paragraphs pretty** below `desktop:` (`text-wrap: balance` on h1-h3, `pretty` on p). Fixes the orphans NEWS-05, RESEARCH-06, LANDING-17 without touching desktop line breaks. | `src/index.css` `@layer base` |

Standing rules for every fixer (not code, contracts):

- **R-1 Pinned chapters on `compact:` are unpinned.** No element taller than
  half the viewport is sticky on `compact:`; no wrapper keeps its `vh` pin length
  there. A chapter's compact layout is its reduced-motion layout (states stacked
  in reading order, each with its caption), optionally with the ordinary
  `Reveal` on entry or a pass-through scrub (`start "top 80%"`, `end "bottom 20%"`)
  that never hides content. The pin lengths move to `desktop:` classes or
  `DESKTOP_QUERY` (`src/lib/motion.ts`); no component keeps a private width-only
  "desktop" query.
- **R-2 Tap targets** are 2.75rem (44 px) on `coarse:` for standalone links,
  buttons, chips and icon buttons, grown with padding (and a matching negative
  margin where the visual rhythm must not move). Inline links inside running
  text are exempt (WCAG 2.5.8).
- **R-3 Media on phones.** The hero picks its file by `DESKTOP_QUERY` (a
  landscape phone gets the 960 encode, not 1280/1920). Nothing heavy loads
  before the reader is near it: the 3D car mounts behind its
  IntersectionObserver on `compact:` and is not preloaded (the design system's
  own rule), YouTube never self-starts on a coarse pointer, hover-only images
  (the partner `image_hover` logos) are not requested when `(hover: none)`.
- **R-4 Every hover-only affordance gets a touch equivalent** (the hero pause
  button, moving strips that can only pause on hover).
- **R-5 No new tokens, colours or palettes.** `rem`, `%`, `vw`, `svh` only.
  `prefers-reduced-motion` stays static and complete. One h1 per page, AA
  contrast, visible focus, keyboard reach.

## 3. Ownership, branches and ports

| Fixer | Branch / worktree | Port | Owns (edits only these) |
|---|---|---|---|
| landing | `revamp/p2-mobile-landing` | 4301 | `src/pages/Landing.tsx`, **all of `src/components/ui/*`**, `src/lib/motion.ts`, `src/lib/media.ts`, `src/index.css` except the nav block |
| chrome | `revamp/p2-mobile-chrome` | 4302 | `src/components/NavBar.tsx`, `Footer.tsx`, `Layout.tsx`, `src/pages/Rules.tsx`, `rules.css`, `Build.tsx`, `Learn.tsx`, `Assembly.tsx` (+ `RacecarAssembly.tsx` only for ASM-02), `index.html`, and the nav block of `src/index.css` (`@layer components` `.navbar` through `.mobile-menu-primary` and the nav media queries) |
| news-research | `revamp/p2-mobile-news` | 4303 | `src/pages/News.tsx`, `Research.tsx`, `src/components/news/*`, `src/components/research/*` |
| about | `revamp/p2-mobile-about` | 4304 | `src/pages/About.tsx`, `src/components/about/*` |
| race | `revamp/p2-mobile-race` | 4305 | `src/pages/Race.tsx`, `src/components/race/*` |

Shared primitives used by other pages (`TagFilter`, `SectionHeader`,
`NextRaceSpotlight`, `TeamGrid`, `YouTubeFacade`, `CommunityJoin`, `buttonStyles`)
are fixed once, by the landing fixer; the page fixers verify against them after
the merge.

## 4. Per page

### 4.1 `/` landing (landing fixer)

The landing's phone story, top to bottom: the hero (a short pin, then the
headline), the four ways in, highlights, the car turning into its parts as it
passes, the platform as four stacked pillars, the map in its final state, the
partner ribbons, the next race, teams, research, join. Each chapter reads as a
section, not as a stage that never pins.

| Id | Change | Why |
|---|---|---|
| L-1 | **Car chapter unpinned on `compact:`.** Canvas in normal flow (no `sticky`, `z-10`, `bg-ink-950` below `desktop:`); the 220vh minimum height becomes desktop-only; the explosion runs as a pass-through scrub on `compact:` with motion (`top 80%` to `bottom 20%` of the canvas), static assembled under reduced motion; captions, "Open the 3D viewer" and both photos follow in flow. In landscape (844x390) canvas and captions must both be seeable: canvas at most `75svh`, captions beside it from `sm:` if that reads better. No preload of the 3D chunk on `compact:`; it mounts on the IntersectionObserver (rootMargin 600px). Offsets use the nav token. | LANDING-01 (S1), LANDING-20, LANDING-25 |
| L-2 | **Hero on phones.** Size, zoom and margins keyed on `desktop:` / `DESKTOP_QUERY`, not width: in landscape the three headline lines and the description fit between the bar and the bottom edge (type capped by height, e.g. `min(8.5vw, 10svh)`), and nothing sits under the nav. The pin is shorter on `compact:` (about 200vh instead of 320vh; the headline completes within the first screen of scroll and no more than half a screen passes with nothing changing). The pause button is visible on `(hover: none)` and 44 px. The file choice uses `DESKTOP_QUERY` (R-3). | LANDING-03 (S1), LANDING-07, LANDING-11, LANDING-25 |
| L-3 | **Map unpinned on `compact:`.** Import `DESKTOP_QUERY` from `lib/motion` (drop the local width-only one); below `desktop:` render the final state (every race lit, counters at their final values or counting once in view, legend) with no 260vh wrapper and no `min-h-svh` centring; city labels `desktop:` only. Let the map use the full column (or bleed) so the dots stay legible. | LANDING-05 |
| L-4 | **Platform as four stacked pillars on `compact:`**, as the component's own doc says: each pillar a row with its poster (16/10, `max-h-[55svh]`), title, body and link; no dial, no video on phones. Header-to-content gap `gap-6 desktop:gap-10`. | LANDING-06, LANDING-18 |
| L-5 | **Research carousel.** At 844x390 a card fits the window under the bar (two-pane card or a narrower card, the reader never scrolls inside a sideways row). Strip dots and arrows 44 px on `coarse:`. 768: the figure sits at the top of its pane. | LANDING-08, LANDING-15, LANDING-24c |
| L-6 | **TeamGrid** (landing and /race): below `sm:` one row per team (5rem photo left, name and result right); `sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`, photos 4/3 under `lg:`. "Team site" 44 px on `coarse:`. | LANDING-09, RACE-05 |
| L-7 | **Moving strips.** Reduced motion: the partner rows collapse into one dense static grid (no `gap-16`), the community cards into a manually swiped row. Touch: one pause toggle per strip group (partners, highlights, community), shown on `coarse:`, 44 px, mono, `aria-pressed`, pausing through a data attribute the unlayered marquee rule respects. Partner `image_hover` logos not requested on `(hover: none)`. | LANDING-10, LANDING-13, LANDING-14 |
| L-8 | **Shared primitives.** `SectionHeader`: `mb-8 desktop:mb-12`; the action wrapper `max-md:w-full` (the /research search box fills the row). `TagFilter`: chips `coarse:min-h-11`; below `sm:` one horizontally scrolling row (snap, the selected chip scrolled into view, an edge fade) instead of an eight-row wall. `NextRaceSpotlight`: padding `p-6 sm:p-8 lg:p-10`, headline `text-display-m desktop:text-display-l` so a phone's h1 outranks it. `buttonStyles`: `whitespace-nowrap` if no button overflows at 320. `YouTubeFacade`: auto-start only on a fine pointer at `desktop:`; channel link 44 px on `coarse:`. `CommunityJoin`: its links 44 px on `coarse:`. | RESEARCH-02/03, NEWS-06, RACE-01, LANDING-16, LANDING-24a, ABOUT-06/07, JOIN-B1 |
| L-9 | **06 Next race** split at `lg:` instead of `md:` so a 768 tablet stacks the video over the panel. | LANDING-24a |

Not in this pass: a portrait-cropped hero encode (LANDING-12, media work), the
4 s image-hold release (`Landing.tsx:125`), partner names on touch beyond alt
text (LANDING-13, a design call), the video-before-panel order in 06 (LANDING-22).

### 4.2 Chrome: nav, menu, footer, /rules, /build, /learn, /assembly (chrome fixer)

| Id | Change | Why |
|---|---|---|
| C-1 | **Menu that works on a phone.** Bounded panel: `max-height: calc(100svh - var(--spacing-nav))` (safe-area aware at the bottom), `overflow-y: auto`, `overscroll-behavior: contain`. Escape and a tap outside close it and return focus to the toggle; page scroll locked while open; a scrim under it; `inert` on `main` and the footer so Tab stays in the bar and the menu. On phones below 390 px the primary "Start here" sits **above** the link list, not after it. Current page marked (`aria-current="page"` + the desktop link's 2 px bar). No stray hairline under the last link. Toggle 44 px; the bar's "Start here" keeps its 2rem look with a 44 px hit area. Verify at 360x640 and 320x568 as well. | CHROME-01 (S1), CHROME-02, CHROME-03/04/05, lead's note |
| C-2 | **Compact bar on short landscape** (`max-height: 33.99rem` and below 1024): 3.5rem bar (wordmark 2rem, in-bar "Start here" at its phone size) and `--spacing-nav: 3.5rem` there, so every page offset follows. | CHROME-07, LANDING-19 |
| C-3 | **Footer on the system.** `mx-auto max-w-page px-6` (the 24 px page edge), ink tokens instead of `gray-*`, headings as the mono section-index style, link columns two-up on phones (about half the height), links 44 px on `coarse:`, legal line left-aligned on phones. Desktop look kept. | CHROME-08, LANDING-23, FOOT-B1 |
| C-4 | **/build and /learn:** `pt-nav` (no 4 px under the bar, no 13 px band), an `sr-only` h1, and a small "Open the docs ↗" link so a phone reader can leave the double-barred frame (new label, flagged to Cedric). | CHROME-06, BUILD-02, LEARN-02 |
| C-5 | **/rules on a phone:** the 24 px page edge; a phone heading scale where h1 > h2 > h3 (sizes only; the legacy colours stay until the page is migrated); the source note at 14 px; contents links 44 px on `coarse:`; measure 68ch; tables/`pre` scroll inside their box and long tokens wrap (hardening); deep links re-run `useScrollToHash` once the markdown renders. Optional: a quiet way back to the contents on a 36-screen document, if it needs no new copy beyond a symbol. | RULES-01..07 |
| C-6 | **/assembly:** one row of frame controls at 360 (ASM-01), the build-guide arrow follows its last word (ASM-03), `pt-nav`; ASM-02 camera offset only if it is a one-line change. | ASM-01..03, CHROME-06 |
| C-7 | **`index.html`:** `theme-color` = paper-50. No `viewport-fit=cover`: without safe-area padding on every container it would put content under the notch; the letterbox is the safe default (question for Cedric). | CHROME-09, LANDING-26a |

### 4.3 `/news` and `/research` (news-research fixer)

| Id | Change | Why |
|---|---|---|
| N-1 | **LinkedIn embed fallback:** the poster stays the fallback. The frame is transparent over it (no opaque `bg-paper-50`), and the poster link is never hidden on `onLoad` alone (a blocked frame still fires `load`). While loading, the poster is `object-contain object-top` so the slide reads whole. | NEWS-01, NEWS-02 |
| N-2 | Year headings sticky only at `desktop:`, flush under the bar (`top-nav`). | NEWS-03 |
| N-3 | Masthead starts about 1rem under the bar on `compact:` like /about and /race (wrapper `pt-nav`, first section's top padding small on `compact:`). Same on /research. | NEWS-04, RESEARCH-05 |
| N-4 | Lead-story action links 44 px on `coarse:`; "Send us your news" and "Submit your paper" header-to-button gap `gap-6 desktop:gap-10`. | NEWS-06, NEWS-07 |
| N-5 | **/research length on phones:** below `sm:` the featured cards take the row layout (figure as a thumb left, like `PaperRow`), and the list rows use a 5rem thumb (or a body-size title); years before the current season fold into one native `<details>` like the race timeline, opened automatically while a filter or search is active. Per-row arXiv/PDF/DOI links 44 px on `coarse:`. Target: under half of today's 53,000 px at 390, search reachable in a few screens. | RESEARCH-01, RESEARCH-04, RESEARCH-07 |

### 4.4 `/about` (about fixer)

| Id | Change | Why |
|---|---|---|
| A-1 | Past crew grid three columns below `sm:` (fillers follow), names and roles wrap (`overflow-wrap: anywhere`) instead of clipping. | ABOUT-01 |
| A-2 | **People density:** below `sm:` a person is a row (a 5rem square portrait left, name, role and links right), one column; in landscape phones portraits are capped so a card never exceeds the window (4 columns from `sm:` on `compact:`, or a height cap). About halves the People section. | ABOUT-02 |
| A-3 | The "↗" after a name or spinoff title never wraps alone (no-break space). | ABOUT-03 |
| A-4 | Hero video facade capped by the window height on `compact:` landscape, centred. | ABOUT-05 |
| A-5 | Standalone links (platform list, person names) 44 px on `coarse:`. | ABOUT-07 |

ABOUT-06 (YouTube self-start) is fixed in the primitive (L-8).

### 4.5 `/race` (race fixer)

| Id | Change | Why |
|---|---|---|
| R-1 | Hero splits at `lg:` instead of `md:`: a 768 tablet and a landscape phone stack video over panel like the portrait phone. | RACE-01 |
| R-2 | Leaderboard board chips 44 px on `coarse:` (same size as `TagFilter`); the alias cell wraps a long name instead of widening the table. | RACE-02, RACE-03 |
| R-3 | "This season": a race with no photo gets the timeline's thumbnail-sized placeholder on phones, not a full-width empty 16:9 box. | RACE-04 |
| R-4 | Hero credit and Slack links 44 px on `coarse:`; the hero clip is not `priority` below `desktop:` (the poster leads). | RACE-05, RACE-06 |

### 4.6 `/assembly`

Rebuilt and QA'd on 2026-09-24. Only ASM-01..03 and the nav offset (C-6).

## 5. Merge order and verification

1. The fixers branch from `revamp/p2-mobile` at the system commit and commit only
   their own files. The lead checks each branch's log, then merges landing
   first (shared primitives), chrome, news-research, about, race; lint and build
   after the last merge.
2. Before verification the lead merges `revamp/polish-2` (the parallel QA-fix
   branch) and re-runs lint and build.
3. Verification (read-only agent, `docs/mobile/VERIFY.md`): the audit walk on
   every route at 390x844, 360x740 and 844x390 (plus 360x640 and 320x568 for
   the menu), axe with zero serious or critical, reduced motion on `/` and
   `/assembly`, a 1440x900 desktop spot-check that nothing moved.

## 6. Capture recipe

`mobilekit.py` (session scratchpad) wraps Python Playwright
(`/home/cedric/.venvs/ml/bin/python3`): touch contexts with a mobile UA and DPR
2-3, Chromium with `--use-gl=angle --use-angle=swiftshader
--enable-unsafe-swiftshader`, stitched CDP `Page.captureScreenshot` walks with a
`mouse.wheel(0, 1)` nudge and a 1 s settle after each scroll, and DOM reports
for overflow, tap targets, truncation and type. Serve a production build with
local media: `VITE_MEDIA_BASE= npx vite build --outDir dist-<name>` then
`npx vite preview --outDir dist-<name> --port <port> --strictPort`.
