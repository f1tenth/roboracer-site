# QA report: / (landing)

Date: 2026-08-21 · Branch `revamp/landing` (off `revamp/integration`) · Production build via `vite preview`.

## Verdict: PASS

Zero console errors, zero failed requests, **zero axe violations**, reduced-motion complete, links resolve, no new over-budget assets (net -4.5 MB).

## Checks

| Check | Result |
|---|---|
| lint / build | pass / pass. Largest chunks: `RacecarAssembly` 955 kB (lazy; loads only near the ExplodedModel chapter or on `/assembly`), `Research` 803 kB (pre-existing lazy page), entry `index` 346 kB |
| Screenshots | [desktop](landing/desktop.png) · [tablet](landing/tablet.png) · [mobile](landing/mobile.png) (full-page) |
| Reduced motion | [desktop-rm](landing/desktop-rm.png) / tablet-rm / mobile-rm - complete static page: hero poster, static countdown (no seconds), reel posters, assembled car + stacked captions, final stat numbers, wrapped logo grid |
| Console | 0 errors, 0 failed requests ([console.json](landing/console.json)); remaining warnings are headless-GPU ReadPixels notices from screenshotting WebGL |
| axe | **0 violations** ([axe.json](landing/axe.json)) |
| Links | all http(s) 200 incl. the arXiv link from a featured publication; Slack invite 403 to bots (Cedric verified manually 2026-08-20); mailto + Scholar manual per skill |
| Assets | new page media = committed hero set only. `public/landing/hero-bg.jpg` (4.5 MB) deleted - orphaned by this page, per PLAN. Remaining over-budget files are About/News assets (`about/image-2.JPG`, `crew/billy.png`, `crew/Roshan_Benefo.jpeg`) - scheduled for those page passes |
| Pins | ExplodedModel 230vh (within 150-250 spec); no other pinned section |
| Content | one `TODO(content)`: the second highlight tile awaits Cedric's ICRA 2026 clip (explicit template placeholder per PLAN). VERIFY-marked facts (180+/35 ICRA numbers) are NOT rendered. No lorem, no em dashes. teams.json TODOs stay in never-rendered `verify` entries |

## Fixes applied during QA

1. `Reveal` warned (`GSAP target not found`) when staggering a container whose data had not loaded yet - now renders static until children exist.
2. Deleted orphaned `public/landing/hero-bg.jpg` (4.5 MB, the old hero background this page replaces).

## Notes for review

- Featured-teams section is built but hidden: every `teams.json` entry is `status: "verify"`. It appears (below sponsors) as soon as Cedric flips entries to `"published"`.
- `public/landing/car-inside.png` (530 kB) is also orphaned now; left for the About pass to decide.
- The white legacy navbar over the ink hero remains until the Phase 3.5 nav/footer pass.
