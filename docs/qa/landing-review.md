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

