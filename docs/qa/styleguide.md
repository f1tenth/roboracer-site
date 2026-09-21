# QA report: /styleguide

Date: 2026-08-21 · Branch `revamp/design-system` · Production build via `vite preview`.

## Verdict: PASS

Zero console errors, zero failed requests, **zero axe violations** (serious, critical, moderate, minor), reduced-motion renders the complete page, all links resolve.

## Checks

| Check | Result |
|---|---|
| `npm run lint` | pass, 0 problems |
| `npm run build` | pass; chunk warning is the pre-existing lazy `Research` (803 kB, bibtex parser, retired in Phase 3.2) and `RacecarAssembly` (955 kB three.js, loads only on `/assembly` or when the landing chapter nears the viewport). Entry chunk 346 kB (was 1,229 kB before route splitting) |
| Screenshots | [desktop](styleguide/desktop.png) 1440, [tablet](styleguide/tablet.png) 768, [mobile](styleguide/mobile.png) 390, full-page |
| Reduced motion | [desktop-rm](styleguide/desktop-rm.png) / tablet-rm / mobile-rm: complete static page; pinned chapters render stacked states with captions, hero renders the poster, counters show final numbers, marquee wraps to a grid |
| Console | 0 errors, 0 failed requests ([console.json](styleguide/console.json)). 4 warnings are headless-GPU `ReadPixels` notices from screenshotting WebGL, environment-only |
| axe | **0 violations** ([axe.json](styleguide/axe.json)) |
| Links | all `http(s)` hrefs 200 (incl. both roboracer.ai race sites, IFAC, VTC, all partner sites). Slack invite returns 403 to automated fetch (bot-blocked); Cedric manually confirmed it valid 2026-08-20. mailto + Google Scholar: manual per skill |
| Assets | `scripts/media.sh report public`: no file over 1.5 MB except the approved hero exception (`hero-fpv-loop-1920.mp4` 2.66 MB, `-960.mp4` 2.87 MB; poster 58.8 kB). Every `<img>` has width/height; both `<video>` elements have posters |
| Pins | ExplodedModel wrapper 230vh, PinnedChapter 220vh - both within the 150-250vh spec, sticky-based (no scroll hijack) |
| Content | `TODO(content)` markers: HighlightReel second-clip caption, SponsorCTA flyer link, ExplodedModel final copy - all intentional and listed for Cedric. teams.json TODOs live only in `status:"verify"` entries that never render publicly. No lorem, no em dashes |

## Fixes applied during QA (all committed)

1. `overflow-x: hidden` on html/body made them clip containers - nothing below the 100svh Layout root painted when scrolled. Now `overflow-x: clip`.
2. `--color-text-muted` darkened `#6b7089` -> `#62677f`: the old value measured 4.43:1 on `paper-100` (fails AA); the new one clears 4.5 on paper-50/100/200.
3. Magenta text on `bg-rr-magenta/15` tints failed on both bases (4.16 ink, 2.79 paper). New AA text tokens: `--color-rr-magenta-bright #e879f9` (chips on ink), `--color-rr-magenta-deep #a21caf` (chips on paper); applied in EventCard, TeamGrid, TagFilter.
4. Dimmed inactive captions (opacity 0.45) measured 2.55-2.62:1. Dim floor raised to 0.62 with caption bodies on `text-on-ink`; passes at ~7:1 while keeping the hierarchy.
5. NextRaceSpotlight title h3 -> h2 (heading order h1->h3 skip).
6. VideoHero credit dropped its `/80` opacity modifier; legacy Footer `text-gray-500` -> `text-gray-400` (pre-existing failure surfaced by the scan).

## Known limitations (not blockers, on the record)

- JS disabled shows the empty SPA shell ([desktop-nojs](styleguide/desktop-nojs.png)) - platform-wide behavior of the existing site, identical on every current route. Rule 6 (animations disabled -> readable static layout) is satisfied via the reduced-motion paths.
- Hero source is a 1280x720 master; the 1920 encode is an upscale at crf 48. Ask whoever shot FPV_IV.mp4 for a higher-res original; re-encode is one `scripts/media.sh video` call.
- The white legacy navbar sits over the ink hero until the Phase 3.5 nav pass.
