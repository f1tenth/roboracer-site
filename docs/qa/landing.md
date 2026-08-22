# QA: landing (`/`), landing v3

Date 2026-08-21. Branch `revamp/v3-page` (integration of revamp/v3-hero-nav, v3-car,
v3-map-community, v3-media, v3-papers). Production build served by `vite preview` on
127.0.0.1:5187; captures by CDP viewport walks stitched with PIL (full-page capture
mangles the vh pins; Playwright screenshot hangs on the live WebGL canvas).

## Verdict: PASS

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run build` | green; three largest chunks: RacecarAssembly 1,013 kB (280 kB gzip, pre-existing warning, lazy), index 351 kB (115 kB gzip), motion 143 kB (55 kB gzip, shared lazily by the landing and the nav); Landing 93 kB (42 kB gzip, includes the inlined 70 kB map SVG) |
| Screenshots | `desktop.png` 1440x14457, `tablet.png` 768x16141, `mobile.png` 390x16445, plus `*-rm.png` (reduced motion: 1440x11448, 768, 390x14209) and `desktop-nojs.png` |
| Console errors / warnings | 0 in all six runs (`console.json`) |
| Failed requests / 404s | 0 (every media file referenced resolves) |
| axe (wcag2a/2aa/21a/21aa + best-practice) | **0 violations** at 1440 and at 390 (`axe.json`) |
| Reduced motion | complete static page: poster + static headline on paper, assembled car frame with captions and photos, static map with every pin and the four numbers, posters grid in the platform panel, no empty pinned section (`desktop-rm.png` vs `desktop.png`) |
| Pin lengths | hero 320vh (contract), car 140vh, map 260vh: the contract's own numbers; the qa-page 250vh guideline is exceeded by the hero and the map by design (landing-v3 sections 1 and 6) |
| No-JS above the fold | empty root: the site is a Vite SPA with no prerender (pre-existing, same as landing v2); the reduced-motion and weak-device paths cover "animations disabled" (CLAUDE.md rule 6) |
| Assets | `scripts/media.sh report public/media`: 0 files over 1.5 MB besides the approved hero encodes; every `<img>` carries width/height; every `<video>` carries a poster (grep of the landing components) |
| Links (29 external, curl -sIL) | 200/202 for all but: Slack invite 403 (Slack blocks HEAD from curl; the invite is confirmed valid by Cedric 2026-08-20), berkeley.edu 403 (bot block), gzu.edu.cn 404 on every path tried (partner data, pre-existing: Cedric to confirm the Guizhou URL), iitb.ac.in fixed from http (timeout) to https (200). Scholar query: manual |
| Content grep | no lorem, no em dashes in copy (one em dash inside a paper abstract in publications.json, data not copy); one `placeholder` tile (IV 2026 podium, documented in docs/media/SELECTION.md: no IV 2026 photos exist in the Drive mirror); `TODO(content)` only in the car chapter comment (final chapter copy from Cedric) |
| One h1 | the hero chapter (`aria-label` "Autonomous racing built and raced in the open") |

## Fixes applied during QA (trivial, data only)
- `public/data/partners.json`: IIT Bombay website http -> https (the http URL timed out).

## Known follow-ups for Cedric (not blockers)
- Guizhou University URL (404), see above.
- IV 2026 podium tile stays an honest placeholder until the podium photos arrive.

Screenshots: `docs/qa/landing/desktop.png`, `tablet.png`, `mobile.png`, `*-rm.png`,
`desktop-nojs.png`; per-section builder evidence in `docs/qa/landing-v3/`.
