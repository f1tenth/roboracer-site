# QA: /race — pages v1

Date: 2026-08-23. Branch `revamp/pages-v1`. Build under test: production
(`npm run build` then `vite preview` on 4185), commit at time of run: the Race
rebuild. Captures in `docs/qa/race/` (git-ignored; they live in the working
tree).

## Verdict: **PASS**

Nothing blocking. Two known limits are architectural and are called out under
"Not fixed here".

## Checks

| # | Check | Result |
|---|---|---|
| 1 | `npm run lint` | clean, no warnings |
| 2 | `npm run build` | green in 6.4 s. `Race` chunk 10.24 kB (gzip 3.49). Largest three: `RacecarAssembly` 1,014 kB, `index` 497 kB, `Landing` 123 kB — all pre-existing, none loaded by /race |
| 3 | Desktop 1440x900 | `docs/qa/race/desktop.png`, page height 7,909 px, no horizontal overflow |
| 4 | Tablet 768x1024 | `docs/qa/race/tablet.png`, 9,605 px, no overflow |
| 5 | Mobile 390x844 | `docs/qa/race/mobile.png`, 11,579 px, no overflow |
| 6 | Landscape 844x390 | `docs/qa/race/landscape.png`, no overflow. Nothing on this page is pinned, so the short-viewport trap does not apply |
| 7 | Reduced motion | `*-rm.png` at all three sizes. Heights identical to the motion runs (7,909 / 9,605 / 11,579): same content, nothing hidden, no empty section. The countdown renders once and does not tick |
| 8 | Console | **0 errors, 0 warnings** at all six runs |
| 9 | Network | **0 failed requests** at all six runs |
| 10 | axe-core | **0 violations**, 0 serious, 0 critical (`docs/qa/race/axe.json`) |
| 11 | Headings | one `h1` ("Come race with us"); four `h2` (Enter, This season, Every race so far, Who competes) plus the spotlight's `h2`. No level skipped |
| 12 | Landmarks | 1 `main`, 1 `nav`, 1 `footer` |
| 13 | Document title | `Race - RoboRacer` |
| 14 | Images | every `<img>` has `width`, `height` and `alt`; none missing |
| 15 | Video | the hero clip has a poster; it is the only video on the page |
| 16 | Links | 46 external hrefs, **45 answer 200**. The one exception is the Slack invite, which returns 403 to a `curl` HEAD because Slack blocks non-browser requests — confirmed valid by Cedric on 2026-08-20. No dead anchor, no empty href, no relative `*.html` |
| 17 | Assets on this page | hero clip 836 KB, poster 108 KB, ten team photos each under 120 KB. Nothing over 1.5 MB |
| 18 | Content markers | no `lorem`, no `placeholder`, no `TODO(content)` reaches the rendered page. The six `TODO(content)` institutions in `teams.json` render as the mono "institution tbc" tag by design |

## The eleven broken links, resolved

Every past-race URL now lives in `data/events_map.source.json` as `url` +
`url_status` (`live` / `archive` / `none`), was checked by hand on 2026-08-23,
and is regenerated into `public/data/events_map.json` by
`scripts/build-world-map.mjs`.

| Was | Now | Status |
|---|---|---|
| `pittsburgh2016.html`, `porto2018.html`, `torino2018.html`, `montreal2019.html`, `columbia2019.html`, `ifac2020.html`, `iros2020.html` — relative paths that resolved against `/race` into the SPA 404 | `https://f1tenth.github.io/<file>` — the old f1tenth.org site, still served from the org's GitHub Pages | live, 200 |
| `""` (empty href, "Spring 2024 course race") — reloaded the page | unlinked text with a mono `no page` tag | none |
| `germany-race2022.f1tenth.org` — 404 | Wayback capture 2022-10-02 | archive |
| `icra2024-race.f1tenth.org` — NXDOMAIN | Wayback capture 2025-09-08 | archive |
| `iros2024-race.f1tenth.org` — NXDOMAIN | Wayback capture 2024-11-07 | archive |

Two more the audit had not caught, found by the link sweep:

| Was | Now | Status |
|---|---|---|
| `korea-race24f1tenth.org` — NXDOMAIN (the domain is also missing a dot) | Wayback capture 2024-07-20 | archive |
| `www.iros2021.org` — **the domain was resold and now serves a proton-therapy conference** | Wayback capture 2022-08-17 | archive |

Every archived link renders with a visible mono `archived page` tag, so a
reader knows before clicking that they are getting a snapshot.

## Not fixed here

1. **JavaScript disabled renders an empty page** (`desktop-nojs.png`). This is
   the whole SPA, not this route: there is no server rendering and no
   pre-render step. `CLAUDE.md` rule 6 asks for content to survive *animations*
   being disabled, which it does (see check 7). Pre-rendering is a
   site-architecture decision for Cedric, not a page fix.
2. **Three tracked files are over the 1.5 MB rule** — `public/about/image-2.JPG`
   (1.68 MB), `public/crew/billy.png` (2.99 MB), `public/crew/Roshan_Benefo.jpeg`
   (2.24 MB). All three are About-page assets and are on About's rebuild list;
   none is referenced by /race. The large hero clips are not in git.
3. **`teams.json` is still `status: verify` throughout.** Rendering them was
   the instruction; every card carries a mono `unverified` tag and six carry
   `institution tbc`. Cedric is sourcing these with Rahul.

## Screenshots

`docs/qa/race/` — `desktop.png`, `tablet.png`, `mobile.png`, `landscape.png`,
`desktop-rm.png`, `tablet-rm.png`, `mobile-rm.png`, `desktop-nojs.png`,
plus `console.json` and `axe.json`.
