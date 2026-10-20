# Plan: /learn/courses, /learn/courses/:id, /learn/teach

2026-09-27, branch `revamp/learn-courses`, taskmap n357. Data: `public/data/courses.json`
(rules in `docs/learn/COURSES_CONTENT.md`). Pattern: /research and /about (paper base, page
header with a mono eyebrow, numbered `SectionHeader`s, hairline rules, `<details>` folds,
`CommunityJoin` last).

## Routes and shell

- `src/App.tsx`: `/learn/courses`, `/learn/courses/:id`, `/learn/teach` with `lazyWithRetry`.
  `/learn` stays the iframe page, untouched.
- `src/components/Layout.tsx`: `TITLES` for the two static routes; the course page sets
  `document.title` from its course. `isAltLayout` stays an exact match on `/learn`.
- `src/components/NavBar.tsx`: Learn is active on `/learn` and anything under `/learn/`
  (`aria-current="page"` on `/learn` itself, `"true"` below it); every other link stays exact.
- `src/main.tsx`: same-origin frame escape before render (the docs framed on /learn link here).

## /learn/courses (`src/pages/Courses.tsx`)

1. Header: crumb "Learn / Courses", h1 and lead from `catalog.hero`, primary "Pick a course"
   (`#courses`), ghost "Teach the course". Right: a mono ledger of the course figures from
   `stats` (group `course`), and one mono line with the community figures (members from
   `community.json` when loaded). Static numbers: the stat values are display strings and the
   type says never parse them, so no ticker.
2. 01 Plans (`#courses`): `PlanLadder`, a real `<table>`: modules A to G across, the three plans
   as rows, each plan a solid ink bar over the modules it covers and a dashed hairline over the
   rest, then a Labs row and a Races row. Built from `lectureSelection()` so it cannot disagree
   with `plans`. Under it the three plans as a ruled spec sheet (no boxed cards): weeks, title
   linking to the course page, blurb, modules, labs, races.
3. 02 Universities: only `status: "published"` offerings. One today (Penn), so a feature row:
   colour logo (the partner-logo file), ESE 6150, blurb, its links, link to its course page. A
   list, so a second offering is a second row.
4. 03 Outline: `CourseOutline`, one `<details>` per module with its lectures and tutorials
   (links to the coursekit, mono slides/video flags), its labs and races; the outline's own
   links and the final project under it.
5. 04 Platform: `FeatureList`, two columns, hairline rules, mono numbers, one line each. Renders
   `available` features, `platform` ones only when `meta.lms_url` is set, `verify` never.
6. 05 Teach it: `teach.contact` title and lead, the mailto, ghost link to `/learn/teach`.
7. `CommunityJoin` (index 06) behind `NearViewport`, as on /about.

## /learn/courses/:id (`src/pages/Course.tsx`)

`findCourse()`; unknown id or an unpublished offering: a short "no such course" state with a
link back. Header: crumb "Courses / Plans" or "Courses / <institution>", h1, mono meta line
(weeks, modules, labs, races; code for an offering; no dates or effort while null), primary
"Start with Module A" (the first module's coursekit page), ghost "Ask in Slack". Body 7/5:
About, What you'll learn (stroke checks), Before you start, Outline (only the plan's modules;
the rest named in one line with a link to the plan that has them), Staff, Logistics FAQ.
Right: sticky "At a glance" `<dl>` plus the course material link and "All courses".

## /learn/teach (`src/pages/Teach.tsx`)

Header from `teach.hero` (pills filtered by feature status), primary mailto, ghost "See the
course plans". 01 How it works (six numbered steps, hairline connectors, the two portals),
02 What you get (`FeatureList`, teach), 03 Step by step (five ruled blocks: checklist, tip,
doc links), 04 Lecture selection (`lectureSelection()` table), 05 Recording and resources,
06 Questions (`FaqList`), `CommunityJoin` (07).

## New components (`src/components/learn/`)

- `PlanLadder.tsx` and `PlanSheet` (inside it): the catalog's one explanatory visual.
- `CourseOutline.tsx`: module folds, shared by the catalog and the course page.
- `FeatureList.tsx`: shared by the catalog (04) and the teach page (02).
- `FaqList.tsx`: `<details>` FAQ, course page and teach page.
- `learnStyles.ts`: the link, fold and check-mark classes the three pages share, and
  `ExternalLink` / `Arrow` in `LearnLink.tsx`.

Nothing pinned, no new dependency, no new binary; Reveal for entrances only.
