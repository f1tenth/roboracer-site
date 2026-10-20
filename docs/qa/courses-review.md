# Courses: fresh-eyes review after the stage 2 merge (stage 3)

2026-10-20, `revamp/learn-courses` (PR #24) from `655820a` (the four stage 2 units merged), taskmap
n382. Method: Python Playwright against Cedric's dev server on 4193, every route and tab at 1440x900,
768x1024 and 390x844, a scroll walk and then a full-page capture, read beside Dhyey Shah's captures
(`docs/qa/courses-dhyey/`) and ours from before the rebuild (`docs/qa/courses-ours/`). Captures
(git-ignored): `docs/qa/learn-courses/review/` in the `learn-courses` worktree.

Midway Cedric looked at the merged pages on 4193: the course pages are good (the 4-week page
especially). The catalog gets one more round in a **stage 4** (the class leaderboard from `/race`
near the top, the stat numbers counting up as on the other big pages, the plan bars in the logo
gradient, a reworked "Pick your length"). So the catalog items below that stage 4 owns are listed,
not fixed here.

## Heights (full page after a scroll walk, the shared Join block and the footer included)

The stage 2 notes measured before the lazy Join block loaded, so their figures are shorter.

| page | 1440 before | 1440 after | 768 after | 390 before | 390 after |
|---|---|---|---|---|---|
| `/learn/courses` | 8,327 | 8,279 | 10,269 | 12,688 | 12,671 |
| `/learn/courses/4-weeks` (About) | 1,350 | 1,307 | 2,507 | 3,167 | 3,119 |
| `/learn/courses/10-weeks` (About) | 1,376 | 1,334 | 2,568 | 3,290 | 3,242 |
| `/learn/courses/15-weeks` (About) | 1,430 | 1,387 | 2,690 | 3,537 | 3,489 |
| `/learn/courses/penn` About / Outline / Staff / Logistics | 1,430 / 2,657 / 1,247 / 1,247 | 1,387 / 2,615 / 1,247 / 1,247 | 2,808 / 4,326 / 2,252 / 2,360 | 3,639 / 5,244 / 2,745 / 2,742 | 3,591 / 5,196 / 2,697 / 2,695 |
| `/learn/teach` | 8,457 | 7,881 | 11,281 | 15,617 | 14,919 |

Dhyey's, for scale (his captures): catalog 2,321 / 5,170, course page 1,223 / 2,483, instructors
8,208 / 15,248 (1440 / 390).

## What still read as bland, static or unfinished, in order

| # | Item | Where | Status |
|---|---|---|---|
| 1 | The catalog's first picture was people at a pit table, a weak first sight for "Learn autonomous racing"; under the full-width scrim the subject sat behind the copy | catalog hero | **Fixed**: the ICRA 2026 car at speed (V4-08), in the right 62% of the band from lg with a fade into the ink (the teach header's layout), so the car sits clear of the headline; full band under the 80% scrim below lg. Manifest CC-01 |
| 2 | One photo, three jobs: the UPenn pit table was the catalog hero and the Penn banner; the students-building photo was the teach header, the 4-week banner and the 4-week card | catalog, Penn, teach, 4-week | **Fixed**: every page top now has its own photo. Catalog: car at speed. Teach: a team at its pit table (V3-12). 4 weeks: students building (kept, Cedric liked the page; its card shows the same photo on purpose). 10 weeks: the bridge. 15 weeks: the ICRA 2026 group behind the track (V5-01; its car photo went to the catalog). Penn: the UPenn table. Manifest CC-01, CP-03, U3-01 |
| 3 | A tall blank band between the stat tiles and "Pick your length" at 1440 (the full section padding under tiles that already end the band) | catalog | **Fixed**: that section takes the tight top padding |
| 4 | A lecture playing in the Outline tab kept playing after the reader switched tab (hidden, still audible) | course pages | **Fixed**: the tabs tell each panel whether it shows; the outline closes its player when hidden and nothing replays on return (U4's question) |
| 5 | Panel headings repeating the tab: "Logistics" under "Logistics", "Course outline" under "Outline", "Course staff" under "Staff", "About this course" under "About" | course pages | **Fixed**: those four are for screen readers only (still in the heading list); "What you'll learn" and "Before you start" stay visible (U2's question) |
| 6 | The teach page is long: 240 px of blank per section boundary at 1440, six feature tiles stacked with the icon on its own row on phones, roomy guide rows | teach | **Fixed in part**: the tight section rhythm, phone tiles with the icon beside the title, tighter guide rows on phones (−576 px at 1440, −698 at 390, no content removed). The rest is content: see 7 and 8 |
| 7 | "How it works" (six icon steps) and "Set up and run your course" (five detailed steps) walk the same path twice (apply, set up, change, enroll, preview) | teach | **Open for Cedric**: dropping the six-step strip would save about 650 px at 390 and 300 at 1440; his site has both too |
| 8 | The shared Join block is the longest section on the catalog and on teach (2,218 px at 1440, 2,277 at 390) | catalog, teach | **Open for Cedric**: it closes most pages site-wide; an instructors page could end on its own questions and "Email the team" |
| 9 | The stat tiles are static; the plan bars are flat violet and grey; "Pick your length" is a table, a summary and three cards stacked | catalog | **Stage 4** (Cedric's note) |
| 10 | The catalog is 3.6 times Dhyey's at 1440 (8,279 against 2,321) | catalog | **Stage 4** |
| 11 | The plan builder's ticks lagged the click by a few frames (the router applies the address change as a transition) | teach | **Fixed**: the pick shows in the click's frame (local state keyed to the address, as the catalog's picker) |
| 12 | On phones the course banner's photo is nearly black under its scrim (95 / 90 / 75%), so the band reads as plain ink; U2 darkened it to hide the 15-week placard, which is gone now | course pages, 390 | Open, minor: the scrim could lighten at the top now that no placard sits there |
| 13 | At 768 the "At a glance" card sits under the tabs at 36rem wide, half the row left empty | course pages, 768 | Open, minor |
| 14 | Twelve of the fourteen lecture thumbnails are the same navy title-slide template, so a module's column of pictures repeats itself | outline | No action: they are the recordings' own thumbnails |
| 15 | Nothing on roboracer.ai links to `/learn/courses` (the nav's Learn opens the `/learn` frame; only the coursekit sidebar links here) | site | **Open for Cedric** (COURSES_INTERACTIVITY.md section 6) |

## The merge check (item g): every control on one page

`s3-interact.py` (scratchpad) at 1440, 768 and 390, results in `docs/qa/learn-courses.md`. On the
catalog the picker, the cards, "Show all three", the topic finder (hit and miss), a tick, Watch,
Expand all and Collapse all (which stops the player) all work on the one page that renders U1's
picker and finder above U4's outline. A tick made on the catalog shows on the 10-week page's
Outline tab; the tabs answer the arrow keys, End and the hash; Copy link copies the tab's address;
Clear empties the store. On teach the builder matches the 4-week plan, goes custom when Module B is
unticked, copies the plan, and the rail marks section 03 after a click.

## What reads better than Dhyey's

- Real competition photos under scrims on every page top, banner and plan card (his: one stock-like
  hero and a logo tile per card), and the course title in the logo gradient over ink.
- The outline is the real coursekit: 29 items each linked, 14 recordings playable inline (his has
  no video), slides links, ticks with a meter that follow a lecture across plans, labelled local.
- Tabs with icons and counts, hash deep links, a sticky "At a glance" card with icons, Copy link
  with a spoken status (his: tabs and a static side card).
- The topic finder searches every module, lecture, tutorial, lab and race and says which plans
  include it (his search filters four course cards).
- The plan builder counts only real things and sends them (copy, share link, email); his planner's
  hours and KPI tiles are invented.
- Accessibility: one h1, real controls, 44 px touch targets, reduced motion, zero axe violations in
  the stage 2 runs.

## What his still does better

- The catalog reads as one screen of choices (a grid of course cards with hover); ours is a long
  document (stage 4).
- His teach page leads with a gradient hero card; ours is a photo header, which Cedric's brief asked
  for, so no change.
- Sign-in, "My courses", a theme toggle and a chat assistant: kept out by decision
  (COURSES_INTERACTIVITY.md section 2).
