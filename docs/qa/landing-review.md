# Independent QA review: `/` (landing)

Reviewer pass, separate from the builder's self-QA at `docs/qa/landing.md`. Branch `revamp/landing`, production build served via `vite preview` on `http://localhost:5198/`. First pass 2026-08-21 (commit `3981eab`); re-verified same day after fixes at commit `cc0a868`. Both passes used my own Playwright scripts (network capture, `PerformanceObserver` for CLS, axe-core 4.13.0) independent of the builder's self-QA numbers.

## Verdict: SHIP

Both blockers from the first pass are fixed and independently re-verified with my own measurements (not the builder's). No new issues introduced by the fix commit. Remaining items are should-fix/nice-to-have, none ship-blocking.

## Blockers from first pass — now resolved (re-verified independently, commit `cc0a868`)

1. ~~Highlights chapter double-autoplayed the same placeholder video off-screen~~ — **FIXED.** `HighlightReel` now gates each `<video>` behind an `IntersectionObserver` (poster `<img>` until near viewport). Re-measured with a fresh Playwright network capture (fullPage load, networkidle): initial-load transfer **3.468 MB desktop, 3.468 MB tablet, 3.182 MB mobile** (was 8.94 / 8.95 / 9.14 MB). Exactly **one** video request fires at initial load per viewport — the hero's own encode only (1920 on desktop/tablet at 2595.3 KB, 960 on mobile at 2303.2 KB) — confirmed by inspecting every network response, not just the top-N by size. axe's `no-autoplay-audio` incomplete dropped from 3 nodes to 1 (only one live `<video>` exists at load now). Matches the reported 3.18-3.47 MB / 2.36-2.66 MB figures.
2. ~~CLS 0.327 ("poor") on tablet from webfont swap~~ — **FIXED.** Space Grotesk 500/600 is now self-hosted (`public/fonts/space-grotesk-latin-500-600.woff2`, 22,288 bytes) and preloaded (`<link rel="preload" as="font" crossorigin>` in `index.html`); the Google Fonts stylesheet link no longer requests Space Grotesk (Manrope + JetBrains Mono only, still `display=swap`). Re-measured CLS with my own `PerformanceObserver({type:'layout-shift', buffered:true})` injected pre-navigation: **desktop 0.0126, tablet 0.0197, mobile 0.0599** (was 0.028 / 0.327 / 0.060). All three now solidly in Core Web Vitals "good" territory (<0.1). Matches the reported 0.013 / 0.020 / 0.060 almost exactly.

## Should-fix — resolved

3. ~~Mobile video encode larger than desktop's~~ — **FIXED.** `hero-fpv-loop-960.mp4` re-encoded to 2,358,458 bytes (2.25 MB), now smaller than `hero-fpv-loop-1920.mp4` at 2,657,578 bytes (2.53 MB), confirmed on disk.
4. ~~"Roboracer" mis-casing~~ — **FIXED.** Zero remaining instances of lowercase "Roboracer" in `public/data/upcoming_events.json` or `past_races.json`; grep confirms 3 and 9 correct "RoboRacer" instances respectively.
6. ~~`aria-prohibited-attr` on the countdown wrapper~~ — **FIXED.** `NextRaceSpotlight.tsx:69` now reads `<div role="group" aria-label="Time until the competition starts" ...>`. That axe "incomplete" no longer appears in the fresh run.

## Should-fix — remaining (non-blocking)

5. **`rel="noopener noreferrer"` fix was partial.** `TeamGrid.tsx` and `PublicationCard.tsx` now correctly use `rel="noopener noreferrer"` (confirmed in source and in rendered DOM). `NextRaceSpotlight.tsx` lines 89 and 93 ("Register your team", "Rules and resources" — both external, `target="_blank"`) still hardcode `rel="noreferrer"` only; these weren't in the fix commit's stated scope (EventCard/LogoCloud/TeamGrid/PublicationCard). Still functionally safe (`noreferrer` alone blocks `window.opener`), still just a consistency nit.
7. **Registration-deadline VERIFY caveat** — intentionally left open per the coordinator's note; still flagged to Cedric to confirm "September 5, 2026" hasn't been extended before/at ship. Unchanged from first pass.

## Nice-to-have (unchanged from first pass, not re-verified in depth)

8. Pillar-card links hand-roll `Button`'s ghost-variant classes instead of reusing the component.
9. `ExplodedModel` car renders small in a large empty canvas at desktop width (subjective).
10. No sitewide `<meta name="description">` (pre-existing, out of scope for this branch).
11. `NextRaceSpotlight` still nests a visible `<h2>` right after the section's `sr-only` `<h2>`.
12. Full-page screenshots of the pinned 3D chapter still render as an empty gap — confirmed in the first pass to be a Playwright/Chromium `position: sticky` capture artifact, not a page bug; not re-litigated here.

## Re-verification method (this pass)

- `npm run lint` (0 errors/warnings) and `npm run build` (passes, 5.75s) re-run clean at `cc0a868`; bundle chunk sizes unchanged from the first pass (this was a media/font/data fix, not a logic change) — `RacecarAssembly` 955.23 kB/260.34 kB gzip still correctly deferred, Landing's own critical-path JS+CSS still ~187 kB gzip.
- Full three-viewport Playwright pass re-run fresh (own script, not reused numbers): console **0 errors** at all viewports, axe **0 violations** at all viewports (2 "incomplete" remain: `color-contrast`, unchanged/expected — text over the hero video+scrim, axe cannot resolve a video background; `no-autoplay-audio`, now 1 node instead of 3).
- Confirmed via source + rendered DOM: font preload link present, Google Fonts link no longer includes Space Grotesk, both video file sizes on disk, zero "Roboracer" mis-casings, `role="group"` on the countdown div, `rel` values on every `target="_blank"` link on the page.

## Evidence

- Refreshed screenshots (this pass overwrote the first pass's, reflecting current state): `docs/qa/landing/review/{desktop,tablet,mobile}.png` (full page), `-rm.png`, `-nojs.png`, `-t0.5.png`/`-t3.png`.
- Network/CLS raw data captured in-session via Playwright (`page.on('response')` body-size capture; `PerformanceObserver` layout-shift, buffered) — not persisted as a file per scope; exact figures quoted above.
- Commit under review: `cc0a868` "landing: address qa-reviewer blockers".

## Summary for Cedric

Both blockers are fixed and I re-verified both independently rather than trusting the reported numbers: first-load transfer is down to 3.18-3.47 MB (was 8.9-9.1 MB, confirmed only the hero video streams at load now) and CLS is 0.013-0.060 across all three viewports (was up to 0.327 on tablet, now all "good"). Lint and build are clean, console and axe are clean. One small leftover: two links in `NextRaceSpotlight` still use `rel="noreferrer"` instead of `noopener noreferrer` (safe, just inconsistent, wasn't in this fix's scope). The registration-deadline VERIFY stays open for you as planned. Ready to ship.


---

## v2 sharpen re-review (2026-08-21)

Independent re-review after the full visual-direction change (`docs/design/SHARPEN.md`, "Direction v2" in `docs/DESIGN.md`). Branch `revamp/sharpen`, HEAD `c0bf60e` ("qa(landing v2): zero errors, zero axe violations after sharpen"). Reviewed against Direction v2, not the superseded ink-heavy v1 rules this same file's first pass used. Production preview on `http://localhost:5198/`. Own Playwright (Node, `chromium.launch`) + CDP `Network` domain for byte-accurate transfer accounting + axe-core 4.13.0 + hand-computed WCAG contrast ratios — independent of the builder's self-QA (`c0bf60e`'s own commit message).

### Verdict: SHIP

Zero axe violations (any impact) at all three viewports, zero console errors, zero failed/non-2xx requests anywhere on the page (checked at first load and across a full scroll-through), lint and build clean, hero media inside its approved budget, and the Direction v2 rules (paper-default, one-magenta-CTA-per-viewport, no gradient text, 4/6px radii, mono eyebrows, 5/7 splits) all independently verified true, not just visually plausible. Findings below are real but non-blocking.

### Blockers

None.

### Should-fix

1. **`HighlightReel` re-fetches the hero footage at a second resolution.** `src/pages/Landing.tsx`'s Highlights item hardcodes `src: HERO_VIDEO.mp4_960` regardless of viewport. Verified with a network probe: on desktop/tablet the hero already streams `hero-fpv-loop-1280.mp4` (7.6 MB), then scrolling one section further to Highlights fires a **second, distinct** request for `hero-fpv-loop-960.mp4` (2.97 MB) — the same IV 2026 Detroit clip, different encode, both now in flight. A desktop visitor can be streaming ~10.5 MB of video within the first two sections. Fix: give `HighlightReel`'s video item the same responsive `<source media>` pair the hero uses, or reuse the hero's own buffered element instead of declaring a second one.
2. **Authoring note leaked into public copy.** `public/data/teams.json`, West Virginia University entry: `"result": "3rd place; exact team/competition alias TODO(content), institution led by Amr El-Wakeel's group per skill"`. This renders verbatim on the live Teams card (confirmed in `TeamGrid.tsx`, which renders `best.result` directly) — including the literal string "TODO(content)" and "per skill" (an internal cross-reference to the content skill file, meaningless to a visitor). This is distinct from the intentional "unverified" tag mechanism (which is correct, by design). Only this one entry has leaked scaffolding text; the other 9 are clean. Fix is data-only: move the alias/institution caveat into the existing `source` field (already present, already not rendered) and shorten `result` to something like `"3rd place, IV 2026 (Detroit)"`.
3. **Touch targets under the WCAG 2.5.8 24px floor on mobile**, systematically on the hairline-row link pattern: `<a>` elements in the Platform pillars ("Build the car", "Start the course", "See the races", "Browse the research"), Get-started rows ("Start building", "Start learning"), and the car chapter's "Explore the car in the interactive viewer" measure **342×21px / 267×21px** — generous width, but only 21px of the anchor's own hit-box is tall (the row's `py-6` padding lives on the parent `<li>`, not the `<a>` itself, so it doesn't extend the actual click target). Measured at 390×844 via `getBoundingClientRect()` on every rendered `a[href]`/`button`. Fix: move vertical padding onto the anchor (e.g. `py-2` inline) or make the whole row a stretched-link.
4. **Redundant stacked `<h2>` in the Next Race section.** `SectionHeader` renders `<h2>IROS 2026, Pittsburgh</h2>`, immediately followed by `NextRaceSpotlight`'s own `<h2>September 28 to 30, 2026, Pittsburgh</h2>` — two visible H2s back to back saying almost the same thing (visible in `docs/qa/landing/review/v2-sharpen/desktop.png`, y≈1150-1250). Not an axe violation (no level skipped), but a rhythm/hierarchy nit carried over from the previous pass's item 11. `NextRaceSpotlight`'s internal headline should drop to `h3`.
5. **Slack invite link returns 403 to curl** (`https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g`): HEAD and GET, default and browser user-agent, all land on a 302 to `robo-racer.slack.com/join/...` then a `403` from Slack's own domain. This contradicts the content skill's "confirmed valid by Cedric, 2026-08-20" note. Most likely Slack's anti-bot/WAF challenging non-interactive requests (common for Slack invite pages, a real browser navigation may pass fine) rather than an actually-dead invite, but flagging for a manual click-through since curl cannot confirm it either way.

### Nice-to-have

- Partner marquee logos (`src/pages/Landing.tsx` partners `<img>`) use `width="auto"` (not a valid HTML width value) with `height={36}`; browsers can't reserve aspect-ratio space from that pair the way a numeric width/height would. Low risk (lazy, below the fold, empirically added ~0 measurable CLS in this pass), but worth a real width per logo.
- `ExplodedModel` car still renders small inside a large empty canvas at 1440 width (subjective, carried over from the previous pass). On mobile the car chapter's front/rear-left wheels are slightly clipped at the canvas edge (`docs/qa/landing/review/v2-sharpen/mobile-car-chapter.png`).
- Legacy `NavBar`/`Footer` logos (`logo-black-gradient.png` 198 KB, out of scope per this task's known-accepted list) have no `width`/`height` attributes, only a CSS `h-10`; low CLS risk since height is fixed, but still not the belt-and-suspenders pattern used elsewhere on this page.
- Several `public/partners/*.png` referenced by the marquee are uncompressed and large (`duke.png` 1.0 MB, `kaist.png` 204 KB, `czech.png` 174 KB) — pre-existing data, not introduced by this branch, but now genuinely in the Landing page's payload once a user scrolls to Partners.
- No team in `teams.json` currently has a `website` value, so `TeamGrid`'s "Team site" link never renders yet — correct guard behavior, just a content gap, not a bug.

### Evidence

**Build/lint** (this branch, HEAD `c0bf60e`): `npm run lint` — 0 errors, 0 warnings. `npm run build` — passes in 6.04s, 1080 modules. Chunk-size warning (>500 kB) for `RacecarAssembly-CYUwcTrF.js` (955.23 kB / 260.34 kB gzip) and `Research-C5mmvrRn.js` (802.55 kB / 172.58 kB gzip) — both confirmed lazy (network-probed: `RacecarAssembly` only fetches once the car chapter's `IntersectionObserver` fires, never at first load).

**Bundle vs `docs/AUDIT.md` baseline**: Landing's critical path = `index-BM0Pruyg.js` (345.90 kB/111.95 kB gzip) + `PublicationCard-CXqnpM3H.js` (161.57 kB/60.43 kB gzip — string-searched, this chunk actually carries GSAP+ScrollTrigger+Lenis+`lib/data.ts`+`PublicationCard`, Rollup's automatic shared-chunk naming just picked that name) + `Landing-DJI32aEE.js` (7.90 kB/2.93 kB gzip) + `index-DNbZEyB9.css` (53.67 kB/11.58 kB gzip) = **569.04 kB raw / 186.89 kB gzip**. `docs/AUDIT.md`'s pre-revamp baseline (single unsplit bundle, every route): 1,273.14 kB raw / 320.39 kB gzip. Delta: **-703.1 kB raw (-55.2%), -133.5 kB gzip (-41.7%)**, despite materially more functionality today (3D chapter, GSAP choreography, more data-driven sections) — the baseline predates all code-splitting so this is directional, not apples-to-apples, but the direction is unambiguous. Apples-to-apples: this same file's previous pass measured Landing's own critical JS+CSS at "~187 kB gzip" pre-sharpen (commit `cc0a868`) — today's 186.89 kB gzip confirms the visual rewrite added no bundle weight.

**Hero media budget** (CLAUDE.md rule 3 exception): `public/media/hero/hero-fpv-loop-1280.mp4` 7,612,616 bytes (7.26 MiB) inside the 8 MB budget; `hero-fpv-loop-960.mp4` 2,969,014 bytes (2.83 MiB) inside the 3 MB mobile budget; poster 36,636 bytes.

**Console/network**: 0 errors at all viewports. Desktop only: 4 `GL Driver Message ... GPU stall due to ReadPixels` WebGL warnings (software/headless GPU driver noise from the 3D chapter, not application code). 0 failed requests, 0 non-2xx responses (206 partial-content on the ranged video requests excluded) — checked both at first load and across a full scroll-through (50 total responses observed).

**Performance**: first-load transfer (CDP `Network.dataReceived`, summed per request, snapshotted before any scroll/screenshot could trigger lazy content) = 508.1 KB identical baseline (JS/CSS/fonts/poster/JSON) at all three viewports, plus the hero video streaming progressively in the background (desktop/tablet: ~5.0-5.25 MB of the 7.61 MB file buffered by ~5.5s post-load per `video.buffered`; mobile: the full 2.97 MB file buffered by the same mark). Largest asset: the hero video (within its approved budget); second largest never-at-first-load asset: `RacecarAssembly-CYUwcTrF.js`. CLS (`PerformanceObserver({type:'layout-shift', buffered:true})`, injected pre-navigation): **desktop 0.0125, tablet 0.0190, mobile 0.0598** — all "good" (<0.1), matching the previous pass's 0.013/0.020/0.060 almost exactly (no regression). Visually confirmed no shift between `*-t0.5.png` and `*-t3.png` at all three viewports.

**Accessibility**: axe — **0 violations** (any impact) at 1440×900, 768×1024, 390×844. "Incomplete" (not violations) at every viewport: `color-contrast` (16/26/4 nodes) and `no-autoplay-audio` (1 node, the muted hero `<video>` — axe cannot verify a muted element carries no audio track, expected). Investigated `color-contrast` rather than waving it through: every flagged node's `failureSummary` is either "background color could not be determined due to a background gradient" (the hero's scrim over video — genuinely unresolvable by axe, expected) or "...because it partially overlaps other elements" (text inside `md:col-span-N` CSS Grid layouts — Platform, Research, PublicationCard). Re-ran axe after a full scroll-through forcing every GSAP `ScrollTrigger` reveal to complete first: same 16 nodes still flagged, ruling out a pre-animation opacity:0 cause. Hand-computed WCAG contrast for every flagged token pair: text-strong/paper-50 18.87:1, text-body/paper-50 10.02:1, text-muted/paper-50 5.40:1, text-muted/paper-100 5.07:1, text-muted/paper-200 4.56:1, `rr-magenta-deep`/paper-50 6.12:1, `rr-magenta`/ink-950 5.81:1 — all pass AA (≥4.5:1). Conclusion: axe-core CSS-Grid geometry limitation, not a real contrast defect. Heading order: exactly one `h1`, no skipped levels (h1→h2→h3 throughout). Alt text: present on every `<img>` (0 missing). Focus: global `:focus-visible` (magenta 2px outline) in `src/index.css`. Touch targets: see should-fix 3.

**Design conformance (Direction v2)**: paper-default confirmed (only the hero wrapper and `<div className="bg-ink-950"><ExplodedModel/></div>` are ink; all other 8 `Section`s default to paper). One-magenta-CTA-per-viewport verified by computed style (`background-color: rgb(217, 70, 239)`), not eyeballed: exactly 4 solid-fill CTAs on the whole page ("Register for IROS 2026" y≈793, "Register your team" y≈1406, "Become a sponsor" y≈5467, "Join the community on Slack" y≈8308 at 1440×900) — consecutive gaps of 613/4061/2841px, so no two are ever simultaneously visible in a 900px-tall viewport. No gradient text: computed-style scan (`background-clip: text` + non-`none` `background-image`) across every `h1-h4/p/span/a` returned zero matches at all three viewports. Radii: `--radius-card: 0.25rem`, `--radius-media: 0.375rem` (`src/index.css:87-88`), visually confirmed sharp. Numbered mono eyebrows, mono data/captions, 5/7 splits (Platform, Research), and `text-display-*` line-height 0.98 all confirmed in source and screenshots. No emoji icons, no 2x2 SaaS pillar grid (Platform correctly uses hairline numbered rows instead — the exact anti-pattern SHARPEN.md called out), no carousel, single token set.

**Content**: race dates/deadlines/format ("September 28 to 30, 2026, Pittsburgh", "Check-in and practice September 27", "registration closes / September 5, 2026", "multi-agent, 4 cars") and the scale strip ("90+", "20+", "1,000+", "30 competitions held") match `.claude/skills/roboracer-content` verbatim. Thunderbolt and 404 Racers team results match Cedric's IV 2026 Detroit podium notes verbatim. Zero em dashes, zero lorem ipsum, zero images missing alt text. One content bug found: should-fix 2 above.

**Links**: all 9 internal routes (`/`, `/about`, `/build`, `/learn`, `/race`, `/course`, `/research`, `/news`, `/assembly`) return 200 from the preview server. External links 200 except the Slack invite (should-fix 5). Every `target="_blank"` link (11 found) carries `rel="noopener noreferrer"` — the previous pass's partial-fix item (`NextRaceSpotlight` using bare `noreferrer`) is now fully resolved.

**Screenshots**: `docs/qa/landing/review/v2-sharpen/{desktop,tablet,mobile}.png` (full page), `-t0.5.png`/`-t3.png` (CLS comparison pairs), `-rm.png` (reduced motion, full page — confirmed poster `<img>` replaces `<video>`, no pinned-chapter gap), `-nojs.png` (JS disabled, above the fold — blank shell, the known-accepted no-noscript SPA state), `-car-chapter.png` (mid-scroll capture of the pinned 3D chapter, since full-page capture renders sticky sections as a gap, same Chromium artifact noted in the previous pass).

### Summary for Cedric

Zero blockers: axe is clean (0 violations at every viewport, and I hand-verified the "incomplete" contrast flags are an axe/CSS-Grid limitation, not real failures), console and network are clean, and the Direction v2 rules — paper-default, one magenta CTA per viewport, no gradient text, sharp radii — all measured true, not just eyeballed. Bundle weight for Landing is unchanged from the pre-sharpen pass (~187 kB gzip critical path) and 42% lighter than the old pre-revamp baseline. Two real should-fix items worth a fast follow-up: `HighlightReel` silently re-downloads the hero clip at a second resolution (~3 MB avoidable on desktop/tablet), and one `teams.json` entry leaks an authoring TODO into public copy. Ship it; fix those two plus the mobile touch-target sizing when convenient.
