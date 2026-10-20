# Courses: what to bring back from Dhyey's site, and how

2026-10-20, branch `revamp/learn-courses` (PR #24), taskmap n380. Stage 1 of 3: this
file is the brief for the stage-2 builders. Read it with `CLAUDE.md`, `docs/HANDOFF.md`
section 5 (environment traps), `.claude/skills/roboracer-design-system/SKILL.md` and
`docs/learn/COURSES_CONTENT.md` (the fact rules for `courses.json`).

Cedric, 2026-10-20: "Dhyey's website was a bit better than ours right now, but it's
slightly different, so let's try to get back closer to his website (in the way that it
feels more interactive), and now let's make sure that instead of his link we see the
learn/courses link native to our website." The second half is done (merge `16a0a1d`:
the native routes are back, PR #25's forward is gone). This file is the first half.

## 0. What "did not work" on 2026-09-27/28 was

Cedric's words (session of 2026-09-28): "I was supposed to see the 'courses' tab here
but I don't see it in the roboracer-preview page" and "I feel like our take of improving
Dhyey's website really didn't work, so for now can we strictly point to it and then
when we come back we will improve our own version".

1. **The missing docs tab was a bug, now fixed, and it was not a site bug.** Read the
   Docs builds of the coursekit had been failing since setuptools dropped
   `pkg_resources` (Sphinx 3.3.1 imports it), so coursekit PR #35 never reached the
   docs. Coursekit PR #36 pinned `setuptools<70` (merged 2026-09-28); the sidebar has
   shown Overview > Introduction, Syllabus, Courses since, and the docs footer read
   "Last updated on Oct 19, 2026" today. The Courses item links to
   `https://roboracer.ai/learn/courses`.
2. **"Our take didn't work" was a judgment call, not a bug.** Nothing on our pages was
   broken: QA on 2026-09-27 and again today found no console errors, no dead route and
   the frame escape working. The pages read as a long, quiet document where Dhyey's
   read as an app. Section 1 measures the gap; section 2 says what to bring back.

## 1. The study

Method: Python Playwright against https://dhyeyshah.com/roboracer-lms/ (`index.html`,
`course.html?id=roboracer-10w` and `?id=penn`, `instructors.html`) at 1440x900 and
390x844. Every page and state was opened: grid and list view, search hit and miss,
the duration filter, card hover, the mobile menu, sign-in and register modals, the theme
toggle, "My courses" after a mock sign-in, the four course tabs, expand all, five
outline ticks, the logistics accordion, copy link, enroll while signed out, the course
assistant on the catalog and on a course, the five planner panes (plan, materials,
branding, grading, summary) and the instructor FAQ. Captures (git-ignored) are in
`docs/qa/courses-dhyey/` of the `learn-courses` worktree (the counts and chat replies
are in 1.1 and 1.2); ours, same viewports, in `docs/qa/courses-ours/`. His repo
(github.com/dhyeyshah28/roboracer-lms) changed once since our port: a rule-based
"course assistant" chat (2026-10-09). Rule 8: patterns only. None of his images,
icons, logos or copy goes into the site.

### 1.1 The numbers side by side

| | Dhyey | Ours |
|---|---|---|
| Catalog height at 1440 / 390 | 2,321 / 5,170 px | 5,313 / 7,851 px |
| Course page height at 1440 / 390 | 1,223 / 2,483 px (tabs hide three of four panels) | 2,936 to 3,681 / 4,992 to 6,624 px |
| Teach page height at 1440 / 390 | 8,208 / 15,248 px | 6,340 / 11,128 px |
| Controls in the catalog | 13 buttons, 1 search, 3 selects, view toggle | 0 buttons, 0 inputs, 7 `<details>` |
| Controls on a course page | 4 tabs, 10 to 13 accordions, 15 to 20 checkboxes, copy link, enroll | 0 buttons, 7 to 12 `<details>` |
| Controls on the teach page | 36 buttons, 41 inputs, 2 selects (planner) | 0 buttons, 9 `<details>` |
| Things that stay put while you scroll | header, course side panel (desktop), chat button | nav; the "At a glance" panel (desktop) |
| Images | hero photo, a logo tile per course card, icon tiles | the Penn logo, Rahul's photo |

### 1.2 Every widget, what it does, and whether it carries information

| Widget | Where | Behaviour | Real information? |
|---|---|---|---|
| Stat tiles with count-up | catalog | icon tile, number counts up once in view | **No**: 16 courses, 1,200 members, 12 instructors, 7 institutions are unsourced or wrong |
| Search box | catalog | filters the six cards as you type ("planning" leaves 2) | Thin: six cards, title and blurb only |
| Institution, duration, sort selects | catalog | filter or reorder the cards; "No courses match your filters." | Thin: one real university; sort by "Newest start" sorts invented dates |
| Grid / list toggle | catalog | remembered in localStorage | No |
| Course cards | catalog | logo tile, code, title, "N weeks" and "N hours per week" chips, start date, a gradient bar; lift 5px and shadow on hover | Partly: title and weeks are real, hours and dates are invented |
| "My courses" with progress bars | catalog | appears after mock sign-in and enroll, "0 of 14 units, 0%", Continue | Mock state |
| Sign in / Register modal, role cards | every page | fake accounts in localStorage, toasts | No (fake auth) |
| Theme toggle | every page | dark palette | No (one theme site-wide) |
| Course header | course | dark gradient band, title, "weeks, hours", Enroll / View course | Partly |
| **Tabs: About, Course outline, Staff, Logistics** | course | one panel at a time, so the page is one screen tall at 1440 | **Yes**: same content, far less scrolling |
| **Sticky side panel** | course (desktop) | course number, start, end, effort, length, Copy link, All courses | Partly (dates and effort invented) |
| **Outline accordions with Expand all** | course | modules as cards, one open by default, Expand / Collapse all | **Yes** (our outline is the real one) |
| **Unit checkboxes and a progress bar** | course | "5 of 14 units completed", bar fills, needs sign-in, localStorage | Local state; motivating, honest only if labelled |
| Copy link | course | clipboard, toast | Convenience |
| Logistics accordions | course | five questions | Yes (we have the rewritten five) |
| Course assistant chat | every page | floating button, panel with suggested questions, canned answers after a fake typing delay | **No, and harmful**: "how long is the course" got the "find a course" answer; "do I need the car" answered "everything works in the simulator", which the coursekit contradicts (its races run on the car) |
| How it works flow | teach | six numbered steps with icons | Yes (we have them) |
| **Planner dashboard** | teach | left pane nav; weeks and hours sliders, prior-knowledge select, 17 lecture checkboxes with hours, KPI tiles (units, total hours, per week, % of weekly budget), Apply suggestion / Select all / Clear; materials upload, branding (name, dates, colour, logo preview), grading weight sliders that must total 100%, summary with Copy plan / Download JSON / Reset | **Mixed**: choosing lectures for a plan is real; every hour figure is invented (2.5 h / 4.5 h per lecture), uploads and branding go nowhere |
| Admin section | teach | create a user, welcome email template, copy | No (internal ops) |
| Instructor FAQ accordions | teach | nine questions | Yes (rewritten) |
| Hover lifts everywhere | all | cards 5px, feature tiles 3px, buttons 1px | Feel only |

### 1.3 What makes his feel better (the headline)

1. **Everything answers a click.** Tabs, filters, folds, ticks and a planner give the
   reader something to do on every screen; ours offers links and folds only.
2. **The course page fits in one screen.** Tabs plus a sticky side panel make it feel
   like an app; ours is a 3,000 px document where the outline sits below three sections.
3. **Visible progress and choice.** A progress bar, "Apply suggestion" and live KPI tiles
   make the reader feel the course is theirs, even though the numbers behind them are
   mostly invented.
4. **Cards with identity.** Each course is an object you can hover, with a picture; our
   plans are ruled text and a table.
5. **Instant feedback.** Hover lifts, toasts and live counters; ours has entrance
   reveals and colour changes only.

What ours already does better and must keep: every fact is sourced, the outline is the
real coursekit (23 lectures, 5 tutorials, 10 labs, 3 races, each linked), the plan
ladder explains the three plans in one picture, it is accessible (real table, native
folds, one h1), and it is the site's own design.

## 2. What to bring back, ranked, and how

Rules for all of it: no accounts, no enrolment, no invented numbers (no hours, dates or
counts that `courses.json` does not hold), no gradient buttons or pills, the accent
(`rr-violet`, the solid Button fill per `src/index.css`) as one solid CTA per viewport
and otherwise as hairlines, markers and underlines. Local state is allowed only where
the page says it is local ("Saved in this browser only. Nothing is sent.") and offers a
way to clear it; it lives under `localStorage` keys prefixed `rr.courses.`, every read
and write in try/catch, and the page works when storage is blocked. Every control is a
real control (button, radio, checkbox, input) with a visible focus ring, reachable by
keyboard, with hit areas of 44 px on touch (`TAP` in `learnStyles.ts`). Motion is only
the system's Micro pattern (hover -2px plus `shadow-card-hover`, 180 ms) and opacity;
under reduced motion state changes are instant.

| # | Bring back | Our version | Real data it uses | Unit |
|---|---|---|---|---|
| 1 | Course page tabs + sticky panel | ARIA tabs About / Outline / Staff / Logistics under the header, mono labels with the nav's 2px underline for the current tab, sticky under the nav from lg, scrolling sideways at 390; hash deep links (`#outline`); the "At a glance" panel stays sticky and gains Copy link | `course.*` headings, the plan or offering | U2 |
| 2 | Outline: expand all, ticks, progress | Expand / Collapse all; a checkbox per lecture and tutorial ("Mark Lecture 3 as done"), keyed by the lecture URL so a tick follows the lecture across plans; "2 of 3 done" in each module summary; a meter "5 of 14 done in this plan"; the local-only note and Clear | `outline.modules[].items` | U4 |
| 3 | Something to watch (beyond Dhyey) | A Watch button on each recorded lecture and tutorial opens a click-to-play YouTube facade inline (`ui/YouTubeFacade` `YouTubePlayer`), one open at a time; Slides links | new `video_id`, `slides_url` per item, harvested from each coursekit lecture page (they embed the YouTube video and the Google Slides deck) | U4 |
| 4 | Catalog filters, reimagined as a plan picker | A segmented control (4, 10, 15 weeks) on the plan ladder: the chosen row stays ink, the others dim, the covered module heads get an accent hairline, a summary (modules, labs, races, class time) and the one solid CTA "Open the N-week course" answer at once; the plan sheet below becomes selectable cards that lift on hover; `?plan=10-weeks` in the URL | `plans`, `lectureSelection()`, `outline.races`, `meta.class_time` | U1 |
| 5 | Catalog search, reimagined as a topic finder | "Find a topic": type RRT, particle filter, model predictive, YOLO and get the lecture, tutorial or lab, its module, and which plans include it (links to the plan pages and to the coursekit page); live result count; empty state with the module names as suggestions | `outline` items, labs, races, final project; `lectureSelection()` | U1 |
| 6 | The planner, reimagined as a plan builder you can send | Start from a plan, toggle modules A to G, see lectures, tutorials, recorded lectures, labs and races update live and whether the selection matches a plan; Copy plan (plain text with links), Share link (`?modules=A,B,D`), and "Email it to us" (mailto contact@roboracer.ai, subject `meta.teach_subject`, the plan in the body). State in the URL only; nothing stored | `plans`, `outline`, `lectureSelection()`, `meta.contact`, `meta.teach_subject` | U3 |
| 7 | A sense of place on the long teach page | A sticky section rail from lg (the six sections, current one marked with the 4px index marker, IntersectionObserver), hidden below lg | section ids | U3 (if time) |
| 8 | Copy link with feedback | Clipboard with a select-and-copy fallback, an `aria-live` "Link copied" line, no toast library | the URL | U2 |

### Kept out, and why

| Mock feature | Why it stays out |
|---|---|
| Sign in, register, role cards, Enroll, "My courses", enrolled badge | Fake accounts; there is no course platform (`meta.lms_url` is null) |
| Theme toggle | One theme site-wide (CLAUDE.md rule 5) |
| Course assistant chat | Canned answers, two of them wrong in our test; duplicates the FAQ; a floating button competes with the one CTA per viewport. If Cedric wants an assistant, the site's `/chat` widget is the place, as its own decision |
| Stat count-up | The motion explains nothing (design principle 2) and the values are display strings the type says never to parse; the mono ledger stays static. **Overruled by Cedric, 2026-10-20 (stage 4):** the numbers tick up as on every other big page, from `value_number` beside each display string (`TickerValue`) |
| Grid / list toggle, sort, institution filter | Four courses and one published university: controls without information. The plan picker and topic finder replace them |
| Hours per lecture, "% of weekly budget", per-plan hours, start and end dates | Invented; the coursekit gives class time only (`COURSES_CONTENT.md`) |
| Planner uploads, branding preview, grading weight sliders, admin email | Platform-only or internal; nothing to send them to |
| Gradient pills, gradient card bars, icon tiles, hero gradient text | Design anti-patterns (no gradient buttons, accent as hairline, icons as ink strokes). **Changed by Cedric, 2026-10-20:** the plan ladder's bars and the plan cards' top rules take the logo gradient, laid along modules A to G (stage 4); buttons and pills stay solid |
| His hero photo, logo tiles, icons, copy | Rule 8. If a unit wants a picture, it uses a site asset with a manifest row, such as `/media/platform/platform-learn-1200.webp` from `paths.json` |

## 3. Work breakdown (four units, parallel)

Each unit is one fresh agent, one worktree, one branch from `revamp/learn-courses` at
the commit that adds this file, about two hours. Units merge back into
`revamp/learn-courses` (stage 3); PR #24 stays the one PR to `main`.

```
git -C <main checkout> worktree add ../roboracer-site-wt/courses-<u> -b revamp/courses-<u> revamp/learn-courses
cd ../roboracer-site-wt/courses-<u> && npm ci     # then npm run dev -- --port <port> --strictPort
```

| Unit | Branch / worktree | Dev port | Scratch prefix |
|---|---|---|---|
| U1 Catalog | `revamp/courses-catalog`, `../roboracer-site-wt/courses-catalog` | 4194 | `u1-` |
| U2 Course page | `revamp/courses-page`, `../roboracer-site-wt/courses-page` | 4195 | `u2-` |
| U3 Teach | `revamp/courses-teach`, `../roboracer-site-wt/courses-teach` | 4196 | `u3-` |
| U4 Outline | `revamp/courses-outline`, `../roboracer-site-wt/courses-outline` | 4197 | `u4-` |

Acceptance that every unit shares: `scripts/rr.sh check` green; captures at 1440, 768
and 390 read back (interactive states included, stitched viewport walks if anything is
sticky); no console errors; axe zero serious or critical with each new state exercised;
reduced motion verified; keyboard-only pass; no `TODO`/`TBA` on the page; no link to
dhyeyshah.com; no new dependency; no file over 1.5 MB; one solid CTA per viewport; new
micro-labels kept in a `LABELS` const at the top of the unit's own file, each listed in
the unit's QA note (stage 3 moves them into `courses.json`); a QA note
`docs/qa/courses-<unit>.md`; small plain commits through `git -C`; dev server stopped
with `fuser -k <port>/tcp` at the end.

### U1 Catalog: plan picker and topic finder

- **Goal**: `/learn/courses` stops reading as a document and starts answering: pick a
  length and see what it covers, or type a topic and see where it is taught.
- **Owns**: `src/pages/Courses.tsx`, `src/components/learn/PlanLadder.tsx`,
  `src/components/learn/Ledger.tsx`, `src/components/learn/LearnHeader.tsx` (additive,
  optional props only: Course and Teach use it too), new
  `src/components/learn/PlanPicker.tsx`, new `src/components/learn/TopicFinder.tsx`.
- **Data**: `plans`, `offerings`, `outline` (items, labs, races, final project),
  `lectureSelection()`, `meta.class_time`. No data edits.
- **Build**: (1) the picker as a radio group (native radios styled as a mono segmented
  control; arrow keys move) above the ladder; nothing selected on first paint (the
  ladder reads as today), a selection dims the other rows' bars (labels stay full
  contrast for AA), marks covered module heads with a 2px accent top rule, fills a
  summary block of reserved height (no layout shift) with modules, lab numbers, races,
  class time, and the solid CTA to the plan page; `?plan=` via `useSearchParams` with
  `replace`; Penn's row in "Taught on campus" says which plan it follows (as now).
  (2) The plan sheet as three selectable cards (click selects; "See the N-week course"
  still navigates), Micro hover, the selected card with a 2px accent top rule.
  (3) TopicFinder at the top of section 03, above `CourseOutline` (unchanged): a
  labelled search input, results as a list (kind and number in mono, title linking to
  the coursekit, module letter, the plans that include it as links), at most 8 with
  "N more" text, an `aria-live="polite"` count, an empty state listing the seven module
  names as buttons that fill the query.
- **Accept**: each plan selection updates ladder, summary and cards in one frame, no
  shift; `/learn/courses?plan=4-weeks` restores; Back and Forward behave; "RRT" finds
  Lecture 11 in Module D, in the 10- and 15-week plans; "model predictive" finds
  Lecture 21 and Labs 7 and 8; "MPC" finds at least Module F (its summary says MPC;
  matching acronyms built from title initials, MPC and MPPI, is a welcome extra, but no
  hand-written alias list); "particle" finds Module C; a miss shows the empty state; at 390 the picker is
  full width and the ladder keeps letters only.
- **QA**: Playwright clicks each plan and types the four queries at 1440, 768, 390;
  axe with a plan selected and results showing.

### U2 Course page: tabs and a working side panel

- **Goal**: `/learn/courses/:id` fits in about one screen at 1440: header, tab bar, one
  panel, the sticky panel.
- **Owns**: `src/pages/Course.tsx`, new `src/components/learn/CourseTabs.tsx`,
  `src/components/learn/BlockHeader.tsx`, `src/components/learn/FaqList.tsx`,
  `src/index.css` (only if a global is unavoidable, inside `@layer components` or
  `@layer base`: unlayered rules beat Tailwind utilities).
- **Data**: `course.*` headings and copy, the plan or offering, `staff`, `faq`,
  `learn`, `prerequisites`. No data edits.
- **Build**: WAI-ARIA tabs (tablist, tab, tabpanel, `aria-selected`, `aria-controls`,
  roving tabindex, Left/Right/Home/End); panels About (about, what you'll learn,
  before you start), Outline (`<CourseOutline outline modules />` exactly as today, plus
  the "not in this plan" line; the tab label carries a mono count such as "2 modules"),
  Staff, Logistics. Inactive panels get `hidden`. Hash sync with `history.replaceState`
  (`#about`, `#outline`, `#staff`, `#logistics`); a deep link selects the tab and leaves
  the header in view (this page does not use `useScrollToHash`; `useRouteScroll` must
  not jump to a hidden panel). Tab bar sticky under the nav from lg, a sideways-scrolling
  row at 390 (no wrap). The "At a glance" panel stays sticky (its height rules from
  PR #24 stand) and gains Copy link (clipboard, fallback, `aria-live` "Link copied").
  Under lg the panel follows the tabs.
- **Accept**: About tab page height at 1440 at most about 1,600 px for every id; each
  tab by keyboard; `/learn/courses/penn#outline` opens Outline; switching tabs never
  jumps the page; the no-such-course state unchanged; nav Learn still
  `aria-current="true"`.
- **QA**: every tab at 1440, 768, 390 for `4-weeks`, `15-weeks`, `penn`; axe in each
  tab state; the deep link; a keyboard-only walk.

### U3 Teach: a plan builder you can send

- **Goal**: replace the static lecture table on `/learn/teach` with the honest half of
  Dhyey's planner: choose modules, see what you get, send it.
- **Owns**: `src/pages/Teach.tsx`, `src/components/learn/LectureSelection.tsx`
  (deleted once replaced, rule 10), new `src/components/learn/PlanBuilder.tsx`, new
  `src/lib/planBuilder.ts` (pure: selection to counts, plain text, mailto URL, query),
  new `src/components/learn/SectionRail.tsx` (optional, item 7).
- **Data**: `plans`, `outline`, `lectureSelection()`, `meta.contact`,
  `meta.teach_subject`, `teach.lecture_selection` heading. No data edits; no hours or
  weeks for a custom selection (only a plan's own `weeks` when the selection equals a
  plan).
- **Build**: start-from radios (4, 10, 15 weeks), module toggles A to G as checkboxes
  (the plan's modules preselected), a live mono summary (modules, lectures, tutorials,
  recorded, labs by number, races, "Matches the 10-week course" or "Custom"), actions
  Copy plan, Share link (`?modules=A,B,D` restores), Email it to us (mailto, body under
  about 1,800 characters, URL-encoded). A line under the actions: "Nothing is stored or
  sent; Email opens your own mail app." Then, if time, the section rail.
- **Accept**: picking each plan reproduces `lectureSelection()` exactly; every toggle
  updates counts; the mailto opens with subject and body; the share link round-trips;
  removing a module removes its labs and race; no number appears that the data does not
  hold.
- **QA**: unit-style checks of `planBuilder.ts` through a short node or Playwright
  script; captures of three selections at 1440, 768, 390; axe; keyboard.

### U4 Outline: watch, tick, expand

- **Goal**: the outline (catalog section 03 and the course page's Outline) becomes the
  interactive heart: open everything, watch a lecture in place, tick what you did.
- **Owns**: `src/components/learn/CourseOutline.tsx` (props unchanged: `outline`,
  `modules`, `showLinks`), new `src/hooks/useLectureProgress.ts`, new
  `src/components/learn/LectureWatch.tsx`, `public/data/courses.json` (sole owner),
  `src/lib/data.ts` (sole owner; only `OutlineItem.video_id?: string` and
  `OutlineItem.slides_url?: string`), new `docs/learn/tools/harvest_lecture_media.py`,
  `docs/learn/COURSES_CONTENT.md` (a row for the new fields and their source).
- **Data**: harvest from each coursekit lecture and tutorial page: the
  `youtube.com/embed/<id>` id into `video_id` where `video: true` (expect 12 lectures and
  2 tutorials, as `stats` says), the Google Slides deck into
  `slides_url = https://docs.google.com/presentation/d/<id>` where `slides: true`; check
  every id with YouTube oEmbed (200 and a title); record the date in the file's
  `checked` field. Downloads are untrusted: own directory, `python -I`.
- **Build**: Expand / Collapse all above the folds; per item a checkbox (real input,
  label "Mark Lecture 3 as done"), state from `useLectureProgress` keyed by item `href`
  in `rr.courses.done.v1`; module summaries add "2 of 3 done"; a meter above the folds
  ("5 of 14 done in this outline", text plus a bar in ink on `paper-200`); the local-only
  note and Clear; storage blocked still toggles in memory and says it will not be kept.
  Watch: a mono "Watch" button with a stroke play glyph (no emoji) on items with
  `video_id`, opening `YouTubePlayer` inline under the row (poster from i.ytimg.com with
  width and height, iframe only after the click), one open at a time; "Slides" link when
  `slides_url` is set.
- **Accept**: ticks survive a reload and show on every page that lists the lecture;
  Clear empties them; no YouTube request before a click; the catalog and course page
  both render the new outline without a prop change; at 390 the checkbox and Watch hit
  areas are 44 px.
- **QA**: Playwright ticks, reloads, clears; a context with storage throwing; a video
  opened at 1440 and 390; network log shows no youtube.com before the click; axe with
  folds open and a video open.

## 4. Shared files and merge rules

| File | Rule |
|---|---|
| `public/data/courses.json` | U4 only. Everyone else reads it; new labels go in a `LABELS` const in the unit's file |
| `src/lib/data.ts` | U4 only, and only the two optional `OutlineItem` fields above. Other helpers live in the unit's own files (`src/lib/planBuilder.ts` for U3) |
| `src/components/learn/CourseOutline.tsx` | U4 only; its props stay `outline`, `modules`, `showLinks` so U1 and U2 compile against today's signature |
| `src/components/learn/LearnHeader.tsx`, `Ledger.tsx` | U1 only, additive optional props; Course and Teach must render unchanged |
| `src/components/learn/learnStyles.ts`, `LearnLink.tsx`, `FeatureList.tsx`, `CoursesUnavailable.tsx`, `src/hooks/useCourses.ts` | Nobody edits. New classes and helpers live in the unit's own files |
| `src/index.css` | U2 only, inside a `@layer`; everyone else uses utilities and tokens |
| `src/App.tsx`, `Layout.tsx`, `NavBar.tsx`, `main.tsx` | Nobody (no new routes) |
| `docs/HANDOFF.md`, `docs/qa/learn-courses.md` | Nobody in stage 2; stage 3 updates them from the units' QA notes |
| `package.json`, lockfile | Nobody (no new dependency) |

Merge order for stage 3 (each a `git merge --no-ff` into `revamp/learn-courses`, then
`scripts/rr.sh check` and a smoke pass on the three routes before the next): U4 (data
and outline), U2 (wraps the outline in a tab), U1, U3. The file sets are disjoint, so a
conflict means a unit broke its ownership: fix it in that unit's branch, not in the
merge.

## 5. Risks

- **Tabs against the scroll hooks.** `useRouteScroll` resets on route change and
  `useScrollToHash` re-applies hash targets on other pages; a tab hash must select, not
  scroll to a hidden element. U2 tests a cold deep link and an in-app navigation.
- **Accent budget.** The picker, tabs, builder and Watch buttons add controls to pages
  that already carry a solid CTA. Selected states are ink, not violet; the one solid
  violet button per viewport is checked in every capture.
- **Honesty of local state.** Ticks are the one local state; if the note is missing the
  feature reads as an account. The note is an acceptance item.
- **Third-party video.** YouTube embeds load only after a click; posters come from
  i.ytimg.com (as `/news` does); the ids are the coursekit's own embeds (source and date
  in `courses.json`).
- **Layout shift.** Summaries, meters and result lists reserve their space; QA measures
  CLS on load and on interaction.
- **Length creep.** U2 must make the course page shorter and U1 must not add a section;
  if a unit's page grows, that is a regression.
- **Agents.** Each unit reads only this file and the listed files; rulings go in its
  first prompt, never by a relayed message.

## 6. Open for Cedric (not in any unit)

1. **How readers reach `/learn/courses` from roboracer.ai.** Today only the coursekit
   sidebar links it (the nav's Learn opens the `/learn` frame). Options: a Courses
   entry in the landing's Learn tile or the Learn path in `paths.json`, a slim link bar
   above the `/learn` frame (that page stays byte for byte until you say so), or a nav
   change.
2. **Local progress ticks** (U4): dropped in September as localStorage state; today's
   brief allows them if the page says they are local. Keep or drop on review.
3. **A course assistant**: kept out (section 2); say so if you want one through `/chat`.
4. Still open from PR #24 (`COURSES_CONTENT.md`): the Open edX portal URL, whether
   `/learn/teach` may describe the portals before it is public, cohort dates and hours,
   TUM and UC San Diego, Penn term dates, who grants slide downloads.
