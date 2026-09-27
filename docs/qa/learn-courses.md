# QA: /learn/courses, /learn/courses/:id, /learn/teach (revamp/learn-courses)

2026-09-27, taskmap n357 (build) and n359 (QA), on top of `6dadc3b` (the courses content audit).
Dev server on 4187, Python Playwright, axe-playwright-python.

## What changed

- **Routes** (`src/App.tsx`, `lazyWithRetry`): `/learn/courses` (`Courses.tsx`),
  `/learn/courses/:id` (`Course.tsx`), `/learn/teach` (`Teach.tsx`). `/learn` is untouched: still
  the docs frame, one window tall, no footer (`isAltLayout` stays an exact match).
- **Titles**: "Courses - RoboRacer" and "Teach the course - RoboRacer" in `TITLES`; the course page
  sets "<course title> - RoboRacer" itself ("No such course - RoboRacer" for an unknown id).
- **Nav**: Learn is current on `/learn` (`aria-current="page"`) and on anything under `/learn/`
  (`aria-current="true"`); every other link stays exact. The mobile menu's current-page underline
  now also matches `aria-current="true"` (`src/index.css`).
- **Frame escape** (`src/main.tsx`): before render, a same-origin parent frame is sent to this URL
  at the top level; a cross-origin parent is left alone. Comment kept as briefed.
- **Components** (`src/components/learn/`): `LearnHeader` (crumbs, h1, lead, meta, actions, ledger
  from lg), `Ledger`, `PlanLadder` (the plans as a real table over modules A to G, then the ruled
  plan sheet), `CourseOutline` (module folds, catalog and course page), `FeatureList` (catalog 04
  and teach 02), `FaqList`, `LectureSelection` (from `lectureSelection()`), `BlockHeader`,
  `LearnLink` (internal Link, new tab with an sr-only note for web links, arrow glued to the last
  word), `CoursesUnavailable` (loading and failed states), `learnStyles.ts`. Hook
  `src/hooks/useCourses.ts`. `logoAttrs` now takes any `{width, height}`.
- **Data** (`public/data/courses.json`, labels only, each with a `TODO(content)` note):
  `catalog.outline_heading`, `course.glance_heading`, `course.not_found`,
  `teach.hero.plans_link`. Types extended in `src/lib/data.ts`. No fact, date or count added.
- Plan in `docs/plans/learn-courses.md`.

Rendering rules from `docs/learn/COURSES_CONTENT.md`, as built: only Penn renders among the
offerings (TUM and UC San Diego are `verify`: no row, and their ids give the no-such-course state);
null dates and effort render nothing (no row, no "TBA"); no `TODO(content)` string reaches the page;
features show `available` only (the 4 `platform` ones wait for `meta.lms_url`, the 3 `verify` ones
never render, and the teach hero's "Your logo and colors" pill is filtered the same way); the members
figure is read from `community.json` once loaded; the lecture table and the plan ladder come from
`lectureSelection()`; `meta.slide_downloads` is not linked anywhere.

## Checks

| check | result |
|---|---|
| `npm run lint` | pass |
| `npm run build` | pass (each commit also typechecks on its own) |
| Console errors, 9 routes at 1440 plus 12 captures | 0 from site code. Once, on /learn/teach at 1440: Chrome's "Permissions policy violation: compute-pressure", from a third-party embed inside the shared CommunityJoin block |
| axe, every `<details>` opened | 0 serious, 0 critical on all 9 routes. One moderate `heading-order` on the no-such-course state only (the footer's h3s follow an h1 with no h2 between) |
| One h1 per page | pass on all 9 routes |
| Images | every `<img>` in `main` has alt, width and height; lazy, except CommunityJoin's marquee (eager by design) |
| Horizontal overflow | 0 px at 1440, 768 and 390 on the four captured pages |
| Reduced motion (1440) | 0 text elements at opacity 0 before any scroll on the four pages; captures below |
| `TODO` / `TBA` in page text | none on any route |
| Unknown ids | `/learn/courses/tum`, `/ucsd`, `/nope`: the no-such-course state with "See all courses", no crash |
| /learn unchanged | frame src is the coursekit, no footer, title "Learn - RoboRacer", Learn `aria-current="page"` |
| Nav under /learn | Learn `aria-current="true"` on every new route, no other link current |
| "Pick a course" (`#courses`) | lands with the section heading 104 px under the top, clear of the bar |
| Frame escape, same origin | an iframe of `/learn/courses?from=frame` injected into `/learn/teach`: the top window navigated to it, one frame left |
| Frame escape, cross origin | a `file://` page framing `/learn/courses`: stays put, the page renders inside the frame, no error |
| External links (103 unique on the pages) | 94 answer 200, including every coursekit, Open edX, edX docs, OBS, ROS, GitHub and CC link from courses.json. Slack invite 403 to curl (known, valid per Cedric). 8 LinkedIn profile links (999/405) come from the shared CommunityJoin block; LinkedIn refuses curl |
| Sticky "At a glance" | fits under the bar at 1366x650, 1536x730, 1440x900 (Penn's panel is the tallest, 464 px); static below 40rem window height |
| Copy | JSON strings only, except micro-labels listed below |

Captures (git-ignored) in `docs/qa/learn-courses/` in the worktree
`../roboracer-site-wt/learn-courses`: `courses-{1440,768,390}.png`,
`course-4-weeks-{1440,768,390}.png`, `course-penn-{1440,768,390}.png`, `teach-{1440,768,390}.png`,
and `{courses,course-4-weeks,course-penn,teach}-1440-reduced.png`. All were read back and fixed
where they looked off (the 768 ledger squeezing "3,500+" into "90+", the ladder's module names
running into each other at 768, the 7/5 split starving the course column at 768, the staff bio as a
narrow ribbon on a phone, wrapped meta lines ending on a dot, the table marks sitting off the line).

## Where the build departs from the brief

1. **Copy from the JSON, not the brief's wording**: the catalog hero keeps "Learn autonomous
   racing", "Pick a course" and "Teach the course"; the teach hero keeps "Email the team". The
   brief's ghost "See the course plans" was added as `teach.hero.plans_link`; the JSON's own
   secondary ("Open the course material") moved to the lecture-table section's action.
2. **Stats are static**, no `StatTicker`: the values are display strings the type says never to parse.
3. **Out-of-plan modules are left out** of a plan's outline and named in one line with links to
   the longer plans: a dimmed fold still opens and reads as part of the plan, and dimmed text
   falls under AA.
4. **Splits start at lg (1024), not md**: the header ledger and the course page's 7/5. At 768 both
   were too narrow; below lg the panel follows the course.
5. **Catalog 05's mailto is an outline button**, not solid: CommunityJoin's Slack card holds the
   solid one and the two share a screen at 1440.
6. **Class time** (`meta.class_time`) shows on plan pages only: Penn's own sessions differ
   (`effort_note`).
7. **Crumbs** start with "Learn" ("Learn / Courses / Plans") to match the catalog's "Learn / Courses".
8. **Nav** takes two lines plus one CSS selector, not one line, to mark the section with
   `aria-current="true"` rather than claim `page`.
9. **Frame test** used an injected same-origin iframe for the escape and a `file://` page for the
   cross-origin case (a `file://` parent is cross-origin, so it proves the guard, not the escape).

## Open questions for Cedric

From `docs/learn/COURSES_CONTENT.md` (unchanged, every `TODO(content)` in the file):

1. `meta.lms_url`: the Open edX portal URL. Until then the 4 `platform` features stay hidden.
2. Is the platform open to instructors now? **/learn/teach renders steps 2 to 5, the Studio and
   Courses portal blocks, and FAQ answers that describe the platform** (including "Can I use my own
   logo and colors? Yes", while the matching feature is hidden). Ship as is, or hold these until
   `lms_url` is set?
3. Plan dates. 4. Student effort per plan (and Penn). 5. TUM. 6. UC San Diego.
7. Penn term dates and the 15-week plan. 8. Who grants slide downloads (the form is 404).
9. Quizzes. 10. Lecturer notes. 11. Background courses. 12. Monthly new material.
13. Instructor and institution counts.

New from this build:

14. Labels written by the builder, marked `TODO(content)` in the JSON: `catalog.outline_heading`
    ("Outline" / "What the course covers" / "Modules A to G, as the course site runs them. Every
    lecture and lab opens there."), `course.glance_heading` ("At a glance"), `course.not_found`
    ("No such course", one sentence, "See all courses"), `teach.hero.plans_link`
    ("See the course plans").
15. Micro-labels in code, not JSON: ledger groups "The course" / "The community"; "You need" /
    "Not covered"; table heads "Plan", "Labs", "Race", "Module", "Required labs"; "Tip"; "On the
    course site"; "Not in this plan: Modules C to G"; "See the <plan> course"; "follows the
    15-week course"; lecture flags "slides", "recorded", "assigns Lab N". Move any to the JSON if
    you want them editable there.
16. How do readers reach these pages? The nav's Learn goes to the `/learn` frame, which the brief
    keeps byte for byte; today the way in is the coursekit sidebar link (and direct links).

## Verdict

**SHIP** for Cedric's review on the preview, with question 2 decided first.
