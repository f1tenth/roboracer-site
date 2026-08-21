# QA: landing (v2 rebuild) — 2026-08-21

Route `/` on branch `revamp/v2-page` (A+B+C merged), production preview build.
Supersedes the sharpen-v2 report (history in git). Companion reviews:
`docs/qa/landing-review.md` (@qa-reviewer, verdict SHIP) and the /impeccable
finish review (fix list applied, see "Fixes applied").

## Verdict: PASS

| Check | Result |
|---|---|
| `npm run lint` | pass |
| `npm run build` | pass (largest chunks: RacecarAssembly 992K lazy, Research 784K lazy pre-existing, index 340K) |
| Console errors / warnings (desktop walk, prod build) | 0 / 0 |
| Failed network requests | 0 |
| axe serious/critical | **0** (0 violations of any severity) |
| One h1 | yes ("Autonomous racing, built and raced in the open") |
| Horizontal overflow 1440 / 390 | none / none |
| `<video>` without poster | 0 |
| `<img>` without dimensions | 0 after fix (was 3: nav+footer logos) |
| Pinned wrappers | 180vh (headline), 140vh (car) — both ≤ 250vh |
| Reduced motion | complete static page: poster hero, no cue, full-size headline, wrapped static strip, static assembled car, final counter values (desktop-rm/tablet-rm/mobile-rm.png) |
| Accent discipline | zero magenta/cyan computed styles on `/`; violet only as the two solid CTAs (Register, Slack) |
| External links | all 200 except Slack invite 403 to curl (bot-wall; Cedric confirmed the invite valid 2026-08-20 — one manual click-through recommended) and Scholar (rate-limits, manual per protocol) |
| Media budget | no new binaries; >1.5MB files are pre-existing (`crew/`, `about/`) + the approved hero exception |
| TODO(content) | only sanctioned: final car-chapter copy; studio photo dims pending `car-studio*.webp` |
| Em dashes in copy | none |

## Screenshots (this folder; full-page files are stitched scroll-throughs)

`desktop.png`, `tablet.png`, `mobile.png`, `*-rm.png`, `desktop-nojs.png`,
`axe.json`, `console.json`, plus `review/` (58 files from @qa-reviewer).
Note: naive `full_page=True`/`captureBeyondViewport` captures mangle this page
(vh-based pins re-trigger on the resize); the full-page files here are
stitched viewport walks instead — pinned content legitimately repeats across
its travel in them.

## Fixes applied during QA (all verified on the preview build)

1. Car body to satin graphite (grey multiplier + envMapIntensity on the
   chassis palette — aluminum split preserved) and product-scale camera that
   dollies out with the explosion (impeccable material 1–2).
2. Highlights header demoted to mono label + one-line lead; placeholder tiles
   share the live tiles' caption-below skeleton so row edges stay flush
   (impeccable material 4, polish 5).
3. Research CTAs stacked left-aligned; TeamGrid initials split on `_-` so
   UBM-Tom/UBM-Atlas/UNICORN_Racing render UT/UA/UR, not U/U/U (polish 6–7).
4. `:focus-visible` wrapped in `@layer base` so component ring overrides work
   again — hero pause button ring measured white rgb(245,245,250) over video
   (qa-reviewer should-fix 1).
5. Touch targets: "Explore the car" and the mailto link now ≥24px tall at 390
   (qa-reviewer should-fix 2).
6. Nav/footer logo `width`/`height` attributes (CLS hygiene).
7. Spotlight format line corrected to "multi-agent, up to 4 cars" (content
   skill wording).

## Flags for Cedric (no action taken)

- All 10 teams render with the mono "unverified" tag (per your instruction;
  qa-reviewer suggests explicit sign-off before public ship).
- Slack invite: bot-walled to automated checks; one manual click-through.
- No-JS renders a blank SPA shell — site-wide architecture, pre-existing,
  not a landing regression; noscript fallback is a Phase 4 candidate.
- Car chapter studio HDR loads from the drei preset CDN at runtime (all
  CC0 1k studio HDRs measured >1.5MB, so none entered git); neutral-light
  fallback covers offline.
