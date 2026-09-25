# Where the site's video comes from

Inventory of every video and GIF the built site references, 2026-09-24
(branch `revamp/p2-media`). Sources: `grep` of `src/` and `public/data/` for
`.mp4 .webm .gif .mov`; sizes from disk; R2 status from
`curl -sI "$VITE_MEDIA_BASE/<path>"` against
`https://pub-1174c726236842f08529a0a5cc0c68fb.r2.dev`.

"R2" means the path goes through `mediaUrl()` (`src/lib/media.ts`), so the
production build fetches it from the R2 bucket `roboracer-media` and localhost
(no `VITE_MEDIA_BASE`) uses the file under `public/`. "Site" means the file
ships in `dist/` and GitHub Pages serves it.

No GIF is referenced anywhere. `public/logos/all-Logos/` is untracked and
unreferenced, so it is left out.

## Landing hero clip cycle (R2)

The hero plays these in order with crossfades (`HERO_VIDEO.clips` in
`src/pages/Landing.tsx`). None of them is in git (`.gitignore` excludes
`public/media/**/*.mp4` except the committed loop); the local copies live only
in the main checkout's `public/media/hero/` for localhost.

| Path | Size | Served from | On R2 |
|---|---|---|---|
| `/media/hero/hero-iv-start-1280.mp4` | 1,837,828 B (5.0 s, 2.94 Mbit/s) | R2 via `mediaUrl` | yes, 200, same size |
| `/media/hero/hero-iv-start-960.mp4` | 1,157,235 B | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-01-1920.mp4` | 9,082,061 B (11.1 s, 6.56 Mbit/s) | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-01-960.mp4` | 2,687,154 B | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-02-1920.mp4` | 11,952,683 B (13.1 s, 7.32 Mbit/s) | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-02-960.mp4` | 3,384,069 B | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-03-1920.mp4` | 4,305,272 B (6.1 s, 5.67 Mbit/s) | R2 via `mediaUrl` | yes |
| `/media/hero/hero-race-03-960.mp4` | 1,182,659 B | R2 via `mediaUrl` | yes |
| `/media/hero/hero-iv-rest-1280.mp4` | 10,104,517 B (27.0 s, 2.99 Mbit/s) | R2 via `mediaUrl` | yes |
| `/media/hero/hero-iv-rest-960.mp4` | 6,496,629 B | R2 via `mediaUrl` | yes |

The opening clip is `hero-iv-start`, not the committed FPV loop: the loop
below only plays if a cycle clip fails to load.

## Committed files served by the site

| Path | Size | Used by | Served from | On R2 |
|---|---|---|---|---|
| `/media/hero/hero-fpv-loop-1280.mp4` | 7,612,616 B | hero fallback when a cycle clip errors (`HERO_VIDEO.mp4_1920`), `/styleguide` hero | site (standing exception, CLAUDE.md rule 3) | no (404) |
| `/media/hero/hero-fpv-loop-960.mp4` | 2,969,014 B | hero fallback on narrow or slow links, `/styleguide`, first tile of `highlights.json` | site (standing exception) | no (404) |
| `/media/race/race-iros2026-hero-1272.mp4` | 835,909 B | landing section 06, `/race` (`MediaFrame`) | site | no |
| `/media/join/join-openrobotics-post-960.mp4` | 1,050,301 B | `community.json` post card (landing and `/about`) | site | no |
| `/media/platform/platform-research-mppi-960.mp4` | 1,285,748 B | `platform.json` | site | no |
| `/media/platform/platform-race-960.mp4` | 746,201 B | `platform.json` | site | no |
| `/media/platform/platform-build-960.mp4` | 540,605 B | `platform.json` | site | no |
| `/media/highlights/highlight-icra2025-corner-01-960.mp4` | 800,874 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2026-overtake-01-960.mp4` | 789,916 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2026-chase-02-960.mp4` | 693,642 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2026-corner-03-960.mp4` | 667,802 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2025-headtohead-01-960.mp4` | 545,734 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2025-start-01-960.mp4` | 492,944 B | `highlights.json` | site | no |
| `/media/highlights/highlight-icra2025-grid-01-960.mp4` | 214,922 B | `highlights.json` | site | no |

## Result

Nothing over 1.5 MB ships from the site except the two committed FPV encodes,
which are Cedric's standing exception. Every other file over 1.5 MB is already
on R2 and routed through `mediaUrl`, so no upload was needed for the
inventory. Every encode listed has its `moov` atom before `mdat` (faststart),
checked by walking the top-level boxes.

## Cloudflare side

- `npx wrangler whoami` works (about 10 s; the OAuth token belongs to Rahul's
  account, `Rahulm@gmail.com's Account`). `wrangler r2 bucket list` shows
  `roboracer-media`, so uploads work from this machine.
- The account still has **no workers.dev subdomain** (API error 10007,
  checked 2026-09-24), so `infra/media-worker` cannot deploy and the clips
  come from the rate-limited `r2.dev` URL, which also sends no
  `Cache-Control`. Fix: someone with access to that account opens
  Workers & Pages in the dashboard once (that creates the subdomain), then
  `npx wrangler deploy` from `infra/media-worker` and point
  `VITE_MEDIA_BASE` at the worker URL.
