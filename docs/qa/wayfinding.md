# QA: wayfinding (landing Start here row, nav, footer), 2026-09-24

Verdict: **PASS**, pending Cedric's review on localhost. Branch
`revamp/p2-wayfinding` (worktree `../roboracer-site-wt/p2-wayfinding`), based on
`e82e747`. Captures from the worktree dev server (`npx vite --port 4195`), Chromium
through Playwright (Python venv) with `--use-gl=angle --use-angle=swiftshader
--enable-unsafe-swiftshader`, CDP viewport shots, `scrollTo` then
`mouse.wheel(0, 1)` and a 1.2 s settle. The hero's R2 clips were copied from
the main checkout into the worktree's ignored `public/media/` so the hero plays
as it does for Cedric.

Evidence in `docs/qa/wayfinding/`: PNGs (git-ignored, they live in the
worktree), `behave.json` (navigation, focus, reduced motion, axe), `cls.json`,
`links.txt`.

## What changed

| Where | Change |
|---|---|
| Landing | `00 / Start here` row right under the hero (`ui/EntryPaths`, data `public/data/paths.json`): Build a car, Learn autonomy, Race with us, Sponsor a race. Mono index, display-size verb-first label with the site's hairline underline (violet on hover and focus), one plain line, hairline grid. One column on phones (index in a gutter, a table-of-contents row), 2x2 from md, one row of four from xl. |
| Nav | Violet **Start here** (`/#start`) at the right end of the bar, the bar's one solid fill; **Join Community** becomes a hairline pill beside it. Under lg the button sits beside the menu toggle; under 390 px it moves into the menu as a full-width button. On phones the wordmark steps from 2.5 to 2 rem so the button fits; the bar stays 4.5 rem tall at every width (measured below). The menu now also closes on a hash-only navigation. Simulator kept: everything still fits at 1024. |
| Hash links | `hooks/useScrollToHash`: arriving at `/#start` from another route jumps there; on the landing it glides (jumps under reduced motion); focus moves to the section, so the next Tab is "Build a car". It waits for the list's `aria-busy` to clear before scrolling, and re-applies the jump across ScrollTrigger refreshes for 4 s (a refresh on a fresh landing restored scroll 0, found at 360 px). |
| Footer | Rules and Class leaderboard links, "Sponsor a race" (same mailto as the path); internal links are client-side `Link`s (they reloaded the app). |
| Data | `paths.json` also holds the two learning tracks for the rebuild (`docs/LEARN_TERRAIN.md`); types and `loadPaths` in `lib/data.ts`. |

## Checks

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run build` | green (the usual >500 kB warning for `RacecarAssembly`); `Landing` chunk 114.18 kB |
| Screenshots | 1536x730, 1366x650, 768x1024, 390x844: `<size>-01-hero.png` (nav over the video), `-02-handover.png` (hero leaving, row arriving), `-03-start.png` (the row), 768/390 `-04-menu.png`; plus `1366x650-10-from-race.png`, `-11-focus-first-path.png`, `-12-hover-learn.png`, `-13-nav-focus.png`, `390x844-10-bar.png`, `-11-after-tap.png`, `360x740-10-menu.png`, `-11-after-tap.png` |
| Console | 0 errors, 0 page errors, 0 responses >= 400 in every run (1366, 390, 360, reduced motion, axe runs) |
| axe (axe-core via axe-playwright-python) | landing at `/#start`, whole page: **0 violations** at 1366 and 390. Scoped to `#start` and the nav: 0 violations, 0 incomplete |
| Keyboard | "Start here" is Tab stop 11 from the top of `/about` (wordmark, 7 links, Simulator, Join Community, Start here); Enter lands on `#start` (scrollY 2080 = section top) with focus on the section; the next Tab focuses "Build a car" (violet ring, underline turns violet) |
| From another route | `/race` then Start here: 1366 lands at 2080 of 2080; 390 bar button at 2701 of 2701; 360 menu button at 2368 of 2368. Menu closed after each |
| Same page | from the top of `/`: glide, mid-flight 51 px, settles at 2080 of 2080 |
| Reduced motion | static hero (1301 px at 1366); the jump is instant (on target 250 ms after the click); the arrow nudge is off (`transform: none` on hover); direct load of `/#start` at 390 lands at 1346 of 1346. The row itself has no scroll animation in any mode |
| Layout shift | after the click, **0** layout-shift at 1366 and 390, including with `paths.json` delayed 900 ms (`cls.json`) |
| Links | `links.txt`: 43 hrefs from `paths.json` and the new nav/footer links. 35 external answer 200; 6 internal routes exist in `App.tsx`; 1 mailto (manual). The Slack invite answers 403 to curl (bot wall); it is the invite the nav and Join block already use, confirmed valid by Cedric on 2026-08-20 |
| Images | none added |

## Nav measured (`/race`, bar height and the button)

| Width | Bar | Button | Note |
|---|---|---|---|
| 320, 360, 375 | 72 px | in the menu | wordmark 2 rem |
| 390, 430 | 72 px | 95 x 32 px in the bar | 21 px clear of the wordmark at 390 |
| 640 to 1023 | 72 px | 118 x 40 px in the bar | wordmark 2.5 rem |
| 1024 | 63 px | 88 x 33 px | 221 px between wordmark and first link |
| 1366 / 1536 / 1920 | 63 / 67 / 84 px | in the row | unchanged heights (same vertical padding as the old pill) |

No horizontal overflow at any width.

## Landing length

The row adds 338 px at 1366x650 (2.4%), 360 at 1536x730 (2.3%), 581 at
768x1024 (2.8%), 731 at 390x844 (4.2%). The footer's three new links add
27 to 109 px more. Document height 14,221 to 14,586 px at 1366; 17,384 to
18,224 px at 390. Kept short by: a demoted header (`size="s"`), a 3 rem bottom
(Highlights opens with its own rule and padding), the phone gutter layout
(889 to 731 px).

Nothing else was cut. The Platform chapter overlaps three of the four
destinations, but it explains the pillars with media (Research included, no
Sponsor) while this row only routes, and it is a pinned 300vh chapter whose
height does not depend on its links. If the landing must give the space back,
the cheapest cut is copy: the Teams lead and the Research lead say the same
thing ("RL policies, MPPI and MPC ... multi-agent"), and both are over the
copy brief's 20 words. Left for the plain-English pass rather than changed
here.

## Questions for Cedric

1. **Sponsor destination.** There is no sponsor page or sponsor block; the path
   and the footer use the content skill's fallback,
   `mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship`, with a
   `TODO(content)` in `paths.json`. Export the Sponsorship Flyer to
   `public/docs/`, or add a sponsor section, and the path points there.
2. **Wording.** "Start here" (nav button and row title), "Sponsor a race" (or
   "Partner with us"), "Race with us", and the four lines. The sponsor line
   uses the skill's "90+ universities".
3. **Phone wordmark** at 2 rem instead of 2.5 so the button fits beside the
   menu toggle. Revert means the button lives in the menu only.
4. **Simulator.** The nav's "Simulator" goes to AutoDRIVE (the Sim Racing
   League); the course teaches with `f1tenth_gym_ros`. Which one is a newcomer's
   simulator (`docs/LEARN_TERRAIN.md`)?
