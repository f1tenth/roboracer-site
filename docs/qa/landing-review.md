# Independent QA review: `/` (landing v2), secondary pass on `/assembly`

Reviewer: independent QA agent, separate from the builder/director sessions. Worktree
`/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site-wt/v2-page`, branch
`revamp/v2-page`, HEAD `e0fe55b` ("landing: wire the car chapter; fonts.ready
ScrollTrigger refresh; styleguide chip update"), working tree clean at both the start
and end of this review (verified via `git status`/`git rev-parse HEAD` before writing
this report). Reviewed against `docs/plans/landing-v2.md` and
`docs/design/NEOBOTICS_STRUCTURE.md` (this session's authoritative contract), not the
superseded parts of `docs/DESIGN.md`/the design-system skill where they conflict, per
the task brief. A second, unrelated review process (`.impeccable/review/`,
`docs/qa/landing/console.json`) was running concurrently in the same worktree during
this pass (own Chromium instance visible via `ps`, heavy CPU load, port 4176) — it did
not touch source and HEAD did not move, so it did not affect this review, but it did
slow some of my own Playwright runs (noted where relevant).

Dev server: `npm run dev -- --port 5177 --strictPort` (all functional/DOM/axe/console
checks). A second `npm run preview -- --port 5178 --strictPort` was started only to get
byte-accurate production network-transfer numbers (dev mode serves unminified,
unbundled ESM and is not representative of real payload size). Both killed at the end
of this review.

## Verdict: SHIP

Zero console errors, zero axe violations (serious/critical or otherwise) at true rest
on all three viewports in both normal and `prefers-reduced-motion: reduce` modes, zero
lint warnings, a clean build, no off-token colors anywhere on the page, exactly one
`h1`, no horizontal overflow at 390px, every internal route and all but one external
link resolve, and the hero/headline/car-chapter motion — the three most technically
ambitious pieces of this rebuild — all degrade to fully readable static layouts under
reduced motion, verified independently at every viewport, not just visually inspected.
The items below are real but none of them block shipping.

## Blockers

None.

## Should-fix

1. **Unlayered global `:focus-visible` rule silently defeats every
   `focus-visible:outline-{color}` component override, including the hero's own
   on-ink ring.** `src/index.css:119-122` declares `:focus-visible { outline: 2px
   solid var(--color-rr-violet); ... }` with no `@layer` wrapper. Tailwind v4's
   generated utilities (including `focus-visible:outline-text-on-ink`, used verbatim
   in `src/components/ui/VideoHero.tsx`'s pause button and in `Button.tsx`'s
   `on="ink"` variants) live in the `utilities` layer, and per the CSS Cascade Layers
   spec, ANY unlayered rule beats ANY layered rule regardless of source order or
   specificity. Net effect: the pause control's intended near-white ring (the plan
   explicitly allows "components over video/imagery may keep a white ring") never
   renders — every focusable element on the page gets the same violet ring instead.
   Confirmed by keyboard-tabbing to the control and reading `getComputedStyle(...)
   .outlineColor`: measured `rgb(124, 58, 237)` (violet), not `rgb(245, 245, 250)`
   (text-on-ink). Screenshot:
   `docs/qa/landing/review/desktop-keyboard-pause-control-focus.png`. This is the
   same category of bug the codebase already fixed once this session for heading
   defaults (see the `src/index.css:182` comment "unlayered these beat every layered
   Tailwind utility") — just not yet applied here. Not a contrast failure in
   practice (the plan's own math has violet at 3.5:1 on ink-950, which passes the
   3:1 non-text minimum), so not blocking, but it is dead code and a real
   maintainability trap. Fix: wrap the `:focus-visible` rule in `@layer base`.
2. **A few interactive targets are still under the 24×24px touch-target floor**,
   measured via `getBoundingClientRect()` on every rendered `a[href]`/`button` at
   390×844: "Explore the car in the interactive viewer" (`ExplodedModel.tsx`,
   267×21px) and the Get-started section's `contact@roboracer.ai` mono link
   (`Landing.tsx`, 142×20px) — both owned by this session. The Pillars/Get-started
   hairline-row links ("Build the car", "Start learning", etc.) that were flagged in
   the prior QA pass are now fixed (measured 342×29px, well over the floor) — good,
   that fix stuck. Two Footer-only instances (`contact@roboracer.ai` 160×18px and the
   Quick Links/Resources columns at 19px tall each) are pre-existing and out of this
   session's file ownership (`Footer.tsx`/`NavBar.tsx` weren't touched per the plan's
   worktree table) but are still live on this page. Fix for the two in-scope ones:
   move padding onto the anchor itself, same pattern already used for the pillar rows.
3. **All 10 Teams cards render "unverified."** Every entry in `public/data/teams.json`
   currently has `"status": "verify"`, none `"published"`, so `TeamGrid` (correctly,
   per its own doc comment: "nothing hidden on localhost") renders a mono
   "unverified" tag on every single card — confirmed in
   `docs/qa/landing/review/desktop-scroll-08.png`. The underlying data is actually
   well-sourced (each entry's `source` field cites a specific results page or
   Cedric directly, cross-checked: UPenn's ICRA 2026 "2nd Time Trials / 5th Master
   Cup" independently matches the content skill's "2nd in time trials, 5th overall"
   almost verbatim), so this isn't fabricated content — but a full 2-row grid of
   "unverified" tags is worth Cedric's explicit sign-off before this ships publicly,
   since it may read as unfinished to a visitor even though it isn't. No code
   change implied; this is a data/judgment flag, not a bug. (Confirmed clean:
   no leaked `TODO(content)`/scaffolding text renders anywhere in `result` fields —
   the exact bug the prior "sharpen" QA pass caught on the West Virginia entry is
   fixed; TODO-marked `institution` values also correctly fall back to "institution
   tbc" rather than leaking.)
4. **Slack invite link returns 403 to curl** (HEAD and GET, default and full browser
   User-Agent): `https://join.slack.com/t/robo-racer/shared_invite/...`. Same finding
   as the prior "sharpen" QA pass under the same content-skill claim ("confirmed
   valid by Cedric, 2026-08-20"). Most likely Slack's own anti-automation
   WAF/Cloudflare challenge rejecting non-interactive requests (this is common for
   Slack invite pages and would very plausibly pass in a real browser), not
   necessarily a dead invite — automated tooling cannot resolve this either way.
   Flagging again for a manual click-through before ship, since this is the page's
   only remaining solid-CTA-adjacent link I could not positively verify.

## Nice-to-have

- **No-JS renders a fully blank page** at all three viewports (`body.innerText`
  length 0; `docs/qa/landing/review/{desktop,tablet,mobile}-nojs.png`). This is
  expected and correct for the current architecture (`index.html` has no
  `<noscript>` fallback, no SSR/prerendering — confirmed via `index.html`; this is a
  site-wide characteristic of every route, not something introduced by or fixable
  within this branch). Flagging only because the task asked me to check it
  explicitly; not a landing-v2 regression and not actionable in this PR.
- **Two pending studio-photo assets (`car-studio.webp`, `car-studio-cutout.webp`)
  don't exist yet** (confirmed: not in `public/media/hero/` on disk) — exactly as
  `docs/plans/landing-v2.md` anticipates ("If the file 404s (it will until Cedric
  ships it)"). Worth knowing precisely how this behaves: the dev/preview server's
  SPA-fallback (`public/404.html`) returns `200 text/html` for the missing path
  rather than a real `404` (so it never shows up in a naive network-404 scan on
  localhost — on the real GH Pages deploy a request for a missing extensioned asset
  typically returns a genuine 404 with the custom error body). Either way, the
  `<img>` still fails to decode that HTML as WebP, `onError` fires, and I confirmed
  empirically (DOM query after settling on the car chapter) that the photo layer is
  correctly removed with zero broken-image icon and zero console error — the chapter
  runs 3D-only exactly as designed. No action needed beyond Cedric shipping the two
  files per the plan's asset list.
- **The car-chapter's studio HDR environment map loads from a third-party CDN at
  runtime** (`raw.githack.com` → 301 → `raw.githubusercontent.com`, 1.68 MB,
  confirmed 200 in a real browser context; curl's default UA gets a 403 from
  Cloudflare, browser UA does not). Works today, but it's a live runtime dependency
  on an external host with no SLA; the design system doc itself prefers a small
  bundled HDR under `public/media/hero/env/` when one exists. Not blocking (the code
  falls back to a neutral directional light if this fails, per `ExplodedModelScene`'s
  design), just a production-reliability note.
- Two team names that are hyphenated single tokens ("UBM-Tom", "UBM-Atlas") both
  collapse to the initials placeholder "U" (`initials()` in `TeamGrid.tsx` splits on
  whitespace only). Harmless — the full name renders directly below every placeholder
  — but a hyphen-aware split would disambiguate the two squares at a glance.
- `NextRaceSpotlight`'s hardcoded "format: multi-agent, 4 cars" slightly overstates
  precision versus the content skill's "up to 4 vehicles on track" — minor wording,
  not incorrect, just tighter than the source.
- Partner marquee logos (`Landing.tsx`) aren't wrapped in links to `partner.website`;
  not required by the spec, but a common/expected affordance for a partner wall.
- Pre-existing, out of this session's scope but still live on this page: no
  skip-to-content link anywhere on the site (confirmed via keyboard — first Tab
  stop is the nav logo, not a bypass link); three logo images
  (`logo-black-gradient.png`, `logo-white-gradient.svg`, `slack-logo.svg`) render
  without explicit `width`/`height` attributes (empirically ~0 measured CLS impact —
  see Performance below); Footer's "© 2026 RoboRacer Foundation" names a legal entity
  not present anywhere in the content skill (worth a VERIFY, not a landing-v2 issue).
- `/assembly` secondary pass: at 390px the floating "Scene tree" parts panel
  (`assembly.css`'s `@media (max-width: 880px)` rule, `position` anchored
  `bottom-right`) visually sits over the car's rear wheel
  (`docs/qa/landing/review/assembly-mobile.png`). This is a deliberate compact-panel
  choice, not a layout bug (confirmed in the CSS, not an accident), but it is a real
  visual trade-off worth a look before `/assembly` gets its own full pass.
- Vite build warning (pre-existing pattern, not new): `Research-CPUI5Q2G.js` (802.55
  kB / 172.58 kB gzip) and `RacecarAssembly-DLcQmeGG.js` (1,011.83 kB / 279.85 kB
  gzip) exceed the 500 kB chunk-size hint. Both are correctly route/lazy-isolated
  (confirmed by network capture: neither loads on `/` until its trigger fires), so
  this doesn't affect landing's actual payload, just a build-log line.
- axe "incomplete" (not violations, so not counted above): `color-contrast` (serious,
  3 nodes, desktop/tablet only) on the Next Race card's headline/lead/countdown text
  — most likely the hairline `guides` grid overlay makes automated background
  sampling ambiguous; visually confirmed dark text on solid `paper-50` in every
  screenshot, so almost certainly a tool limitation, not a real failure, but flagging
  since axe couldn't resolve it definitively. `no-autoplay-audio` (moderate, 1-2
  nodes, all viewports) on the two `muted` video elements — a known axe limitation
  for programmatically-muted video, not a real issue (confirmed `muted` in the DOM).

## Evidence

**Lint / build** (this branch, HEAD `e0fe55b`): `npm run lint` → 0 errors, 0
warnings. `npm run build` → `tsc -b && vite build` succeeds in 6.18s. Code-split
output (vs. the `docs/AUDIT.md` pre-revamp baseline: one monolithic
`index-BAp6Q3mR.js`, 1,229.14 kB / 310.75 kB gzip, loaded on every route):
- Landing's own initial-load JS/CSS: shared `index-d9Vsyncd.js` 345.90 kB/111.95 kB
  gzip + `Landing-zFgNDzGt.js` 7.65 kB/2.82 kB gzip + `index-BlXkPK9Y.css` 55.30
  kB/12.03 kB gzip ≈ **126.8 kB gzip critical-path JS+CSS**, about 41% of the old
  monolithic bundle's gzip size, and unlike before it isn't shipped to every route.
- Heavy chunks are now isolated and lazy: `RacecarAssembly-DLcQmeGG.js` (1,011.83
  kB/279.85 kB gzip, three.js/R3F) and `Research-CPUI5Q2G.js` (802.55 kB/172.58 kB
  gzip, BibTeX tooling) — confirmed via live network capture that neither loads on
  `/` at initial view; `ExplodedModel-CurmYiPS.js` (166.16 kB/61.80 kB gzip, the
  chapter wrapper, not the 3D engine itself) loads eagerly with the route, the actual
  `ExplodedModelScene` R3F chunk stays behind its `lazy()`+IntersectionObserver gate.
- One build warning, pre-existing pattern: "(!) Some chunks are larger than 500 kB"
  for the two chunks above (see Nice-to-have).

**Screenshots** (`docs/qa/landing/review/`, 1440×900 / 768×1024 / 390×844):
- `{desktop,tablet,mobile}-scroll-NN.png` — reliable section-by-section captures
  (real `window.scrollTo` + CDP `Page.captureScreenshot`, no viewport resizing).
  **Use these, not** `{desktop,tablet,mobile}.png`: those three are Playwright's
  `full_page=True` captures and are corrupted by a real tool artifact I traced and
  confirmed — this page uses `svh`/`vh`-sized `position: sticky` wrappers (hero
  `min-h-svh`, headline `h-[180vh]`, car chapter `min-h-[140vh]`), and Playwright's
  full-page capture works by resizing the viewport to the page's `scrollHeight`;
  because these sections size themselves off the viewport height, resizing the
  viewport to ~10,449px inflates `document.documentElement.scrollHeight` to
  ~50,679px (verified directly: DOM element counts stay correct — 1 `nav`, 1
  `video`, 1 `footer`, 1 `h1` — at every viewport size tested, so this is a capture
  artifact, not a real duplicate-render bug). Playwright does restore the real
  viewport size synchronously after the screenshot (verified), so this did not
  affect any axe/console/DOM measurement in this report, only those three PNGs.
- `{name}-rm-top.png`, `{name}-rm-car.png` — reduced-motion: hero is a static poster
  `<img>` (no `<video>`, no pause button), headline has no `180vh` pin wrapper and
  renders full-size immediately, car chapter shows exactly one static `<canvas>`
  frame with all three captions simultaneously visible, marquee is a static wrapped
  grid (`animation-name: none`) — all confirmed via DOM/computed-style queries, not
  just screenshots, at all three viewports.
- `{name}-nojs.png` — blank (see Nice-to-have).
- `{name}-t0.5.png` / `{name}-t3.png` — timed captures for visual layout-shift
  comparison; paired with numeric CLS via an injected `PerformanceObserver`.
- `desktop-car-chapter-cdp.png` / `-exploded-cdp.png` — WebGL car canvas confirmed
  painting real geometry (satin-graphite chassis, brushed standoffs, Hokuyo-style
  LiDAR with its orange ring, black tires) at two points in the outward-explosion
  scrub, captured via CDP per the task's guidance (`page.screenshot` did time out
  once elsewhere in this session under heavy concurrent load — see below — so the
  CDP path was used throughout for anything near the WebGL scene).
- `desktop-keyboard-pause-control-focus.png` — should-fix #1 above.
- `assembly-desktop.png` / `assembly-mobile.png` — `/assembly` secondary pass.

**Console / network**: zero `console.error`/`pageerror` events at any viewport, in
both normal and reduced-motion modes (checked at true rest, not mid-animation).
Zero non-2xx responses other than expected `304 Not Modified` (font revalidation)
and a `301` HDR redirect that resolves `200` (see Nice-to-have). One `page.screenshot`
call did hit Playwright's documented "can hang on live WebGL" failure mode
(`TimeoutError: Page.screenshot: Timeout 30000ms exceeded`) during a full sweep;
switching to CDP `Page.captureScreenshot` (as instructed) resolved it immediately and
was used for the rest of the WebGL-adjacent work.

**Accessibility**: axe-core 4.13.0, `resultTypes: ['violations','incomplete']`, run
at true rest (scrolled smoothly to top, ≥1.5s settle after the last scroll so GSAP's
`scrub: 0.8` fully catches up — see methodology note below) — **0 violations at all
three viewports**, both normal and reduced motion. Exactly one `<h1>` at every
viewport (`main_pass_results.json`). Heading order clean, no skipped levels (H1→H2→H3
throughout, verified programmatically). All 89 `<img>` elements on the settled page
have an `alt` attribute; meaningful images (partner/team logos) carry full names,
decorative/redundantly-captioned images correctly use `alt=""`. Both live `<video>`
elements have a `poster`. Keyboard: tab order reaches the hero's "Pause footage"
button at stop 11 of 14 (`aria-label`/`aria-pressed` both present, 40×40px), every
stop gets a visible 2px outline (should-fix #1 notwithstanding, it's still clearly
visible, just the wrong shade for on-ink components).
**Methodology note on a false positive I caught and corrected**: an early, sloppier
pass of mine (programmatic scroll-to-bottom then instant `scrollTo(0,0)`, only 400ms
settle) surfaced one spurious `color-contrast` "violation" on a headline word frozen
mid-tween (`opacity: 0.0953`) — that was an artifact of teleporting the scroll
position faster than GSAP's `scrub: 0.8` easing can follow, not a real bug (a human
scrolling normally never teleports). I re-ran cleanly (smooth incremental scroll, full
settle time, no teleporting) and got 0 violations; I'm reporting the clean numbers
above and flagging the methodology so it isn't mistaken for a real regression if
re-tested.

**Design-token compliance**: computed-style scan of `color`/`background-color`/
`border-color`/`fill`/`stroke`/`outline-color`/`text-decoration-color` across every
element on the settled page (excluding logo images/elements), all three viewports:
**zero matches** for `rr-magenta #d946ef`, `rr-magenta-bright #e879f9`,
`rr-magenta-deep #a21caf`, `rr-cyan #00d1da`, or the gradient stops `#fb00ff`/
`#fc00ff`/`#00dbde`. Static grep confirms the only remaining uses of those tokens in
`src/index.css` (`.purple-radial-gradient`, `.border-animated`) are applied only in
`Race.tsx`, never on `/` or in shared chrome. Exactly 2 elements site-wide match
`rr-violet`'s `background-color` (`rgb(124, 58, 237)`): "Register your team" (Next
Race, section 4 of 11) and "Join the community on Slack" (Get started, section 11 of
11) — far enough apart that they never share a viewport, satisfying "max one solid
violet CTA per viewport." Radii, mono eyebrows, numbered `NN /` section markers,
5/7 and hairline-row layouts all match the plan section-by-section.

**Content**: every fact I could cross-check traced cleanly to
`.claude/skills/roboracer-content` or a cited, resolving source page (see should-fix
#3 for the one item worth Cedric's sign-off). Zero em dashes and zero "lorem ipsum"
anywhere in `src/` or `public/data/` (full-tree grep). Dates ("September 28 to 30,
2026, Pittsburgh", "Check-in and practice September 27", "registration closes
September 5, 2026") match the content skill's FINAL copy verbatim. Scale numbers in
the markup are 90+/20+/1,000+/30 exactly per the content skill (a couple of my
screenshots caught the `StatCounter` mid-count-up — e.g. "81+/18+/896+/27" — that's
the 1.8s intentional count-up animation being sampled mid-flight by a timed
screenshot, not wrong data; the final DOM value is correct from first render, per
`StatCounter.tsx`).

**Links**: 9 internal routes all 200 on the dev server (`/`, `/about`, `/build`,
`/learn`, `/race`, `/course`, `/research`, `/news`, `/assembly`). External, via curl
`-L` with a real browser User-Agent: `autodrive-ecosystem.github.io` 200,
`iros2026-race.roboracer.ai` (both registration and rules) 200, Google Scholar query
200, the featured arXiv paper 200, and — cross-checking the Teams data — both
`icra2026-race.roboracer.ai/results.html` and `iv2026-race.roboracer.ai/results.html`
200 (these back every result cited in `teams.json`). Only the Slack invite fails (see
should-fix #4). Every `target="_blank"` link already carries `rel="noopener
noreferrer"` (verified in the rendered DOM, all 6 instances) — the prior QA pass's
should-fix on this (partial `noreferrer`-only on `NextRaceSpotlight`) is fully fixed.

**Performance** (production `vite preview`, not dev server, for realistic numbers):
first-load transfer at 1440×900 = **7.77 MB across 20 requests**, of which the single
hero video (`hero-fpv-loop-1280.mp4`) is 7.43 MB — within the CLAUDE.md rule 3 approved
exception (desktop encode, ≤8 MB). Excluding that one approved file, the real
application payload is ≈0.51 MB (JS 109.8 KB + ExplodedModel chunk 60.8 KB + poster
36 KB + 3 fonts ~78 KB combined + CSS 12.1 KB + JSON data + small SVGs). No duplicate
video request (the highlights strip's lazy video is correctly gated behind its own
`IntersectionObserver` and never fires until scrolled near). CLS (own
`PerformanceObserver({type:'layout-shift', buffered:true})`, injected pre-navigation):
**desktop 0.0523, tablet 0.00035, mobile 0.00102** — all solidly in Core Web Vitals
"good" (<0.1); the desktop figure is the highest only because of the 3 pre-existing,
out-of-scope logo images without explicit dimensions (see Nice-to-have). No horizontal
overflow at any viewport (`document.documentElement.scrollWidth === clientWidth`
exactly at 1440/768/390).

**`/assembly` secondary pass**: 0 console errors, 0 axe violations at 1440×900 and
390×844. Canvas fills the viewport and paints correctly at both sizes (confirmed via
screenshot, not just element presence). Light `paper-100`-family CAD-configurator
theme confirmed (13 distinct computed colors site-wide, all ink/paper/grey plus one
legitimate real part color — the LiDAR's `#e8641b` sensor-orange swatch, which
matches `racecarAssemblyData.ts`'s authored `color` field exactly — no neon/magenta/
cyan anywhere). One nice-to-have noted above (mobile parts-panel overlap).

## Summary for Cedric

Ship it. Zero console errors, zero axe violations, zero off-token colors, and the
hero/headline/car-chapter — the three hardest pieces this session touched — all
verified to degrade correctly under reduced motion at every viewport, not just
eyeballed. The real should-fix list is short: an unlayered CSS rule quietly overrides
the hero pause button's intended white focus ring with violet (harmless today, still
worth a one-line `@layer` fix), two links are a touch under the 24px tap-target floor,
all 10 Teams cards read "unverified" right now (data is solid, just wants your
explicit okay before it's public), and the Slack invite 403s to every automated tool
I threw at it (probably Slack's own bot-wall, not a dead link — worth one manual
click). Nothing here should hold up merging.

