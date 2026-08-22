# QA: landing (`/`) — landing v4, 2026-08-22

Verdict: **PASS** (no blockers). Branch `revamp/v4-page` at the commit after `16a21eb`; production preview `scripts/rr.sh preview` on port 54601; captures in `docs/qa/landing/` (PNGs are git-ignored, they live in the `v4-page` worktree).

## Checks

| check | result |
|---|---|
| `npm run lint` | clean (0 errors, 0 warnings) |
| `npm run build` | green; chunk warning for `RacecarAssembly-*.js` 992 KB (three.js + the car meshes, lazy), then `index-*.js` 344 KB, `motion-*.js` 144 KB |
| screenshots 1440x900 / 768x1024 / 390x844 | `desktop.png` (16,745 px tall), `tablet.png` (18,872), `mobile.png` (18,677); stitched viewport walks, so the pinned chapters repeat across their travel by design |
| reduced motion | `desktop-rm.png` (11,779 px), `tablet-rm.png` (13,285), `mobile-rm.png` (16,474): one h1, 9 sections, none empty, 0 `<video>` (posters everywhere), all copy present |
| no JS | `desktop-nojs.png`: the SPA shell only (Vite + React render nothing without JS, as in v3); the reduced-motion captures are the static-layout proof |
| console | 0 errors, 0 warnings after the YouTube embed fix (`console.json`); earlier warnings were the embed's duplicate `allowfullscreen` and missing `origin`, both fixed |
| failed requests | 2 `net::ERR_ABORTED` on `platform-race-960.mp4` and `platform-research-mppi-960.mp4`: range requests the browser cancels when the platform layers swap preload; both clips proven playing (two captures 1.5 s apart differ) |
| axe (1440, after scrolling the page) | 0 violations (`axe.json`); D2's earlier run found the Join credit contrast, fixed in `13ed66e` |
| links | 33 external checked with HEAD (table below); 10 internal |
| assets | `scripts/media.sh report public/media`: 0 files over 1.5 MB apart from the hero exception; every `<img>` in the DOM has width and height; every `<video>` has a poster; models under `public/models/racecar/` total 656 KB |
| pins | hero 320vh, platform 300vh, map 260vh, car 140vh: the first three exceed the generic 250vh guideline on purpose (contract sections 1, 5, 6 set them) |
| content | `TODO(content)` only in `community.json` (`excerpt_note`, the post-card sentence waits for Cedric's words); no lorem, no em dashes in copy; `placeholder` hits are a status enum in `HighlightReel.tsx`, not copy |

## Links not answering 200 to HEAD

| code | url |
|---|---|
| 202 | https://doi.org/10.1109/airc64931.2025.11077481 |
| 202 | https://doi.org/10.1109/lra.2026.3669765 |
| 403 | https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g |
| manual | https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG= |
| 404 | https://www.gzu.edu.cn/en/ |
| 000 | https://www.iitb.ac.in/ |

DOI resolvers answer 202 to HEAD (fine in a browser). Slack invite links refuse HEAD (403) and open normally. `gzu.edu.cn` answers 404 from this network on every variant tried (the partner URL in `partners.json` is unverified from here, manual). `iitb.ac.in` answered 200 on the second try (first was a 20 s timeout).

## Fixes applied during QA

- `CommunityJoin.tsx`: YouTube embed gets `origin=<page origin>`, fullscreen is granted through `allow` only (`16a21eb`).
- `CommunityJoin.tsx`: photo credit at full `text-text-muted` (axe contrast, `13ed66e`).

## Accepted deviations (Cedric's decisions, 2026-08-22)

- The YouTube card autoplays muted once 60 percent in view, so `youtube-nocookie.com` loads without a click when motion is allowed; the click facade stays under reduced motion.
- Map: Cedric's exact spec replaces contract section 6's colours and the one-violet-pin rule (no violet on the map; Philadelphia is the one filled marker).
- Pin lengths above 250vh, per contract.

## Section captures (changed sections, director and builders)

Director (scratchpad `a_*.png`): hero p 0.30-1.0 at 1440 and 390, reduced; next race 1440/390 a-b; highlights 1440/390; join 1440/390/reduced; platform 1440x900/1200, 1366x768, 1920x1080, 390; map empty/mid/final at 1440, 1920, 390, reduced; car yaw 30/90 at 1440, 390.
Builders (git-ignored, in their worktrees under `docs/qa/landing-v4/`): `v4-car` (`b-*`, `b2-*`), `v4-map` (`c-*`), `v4-platform` (`d-*`, `d2-*`).
