# QA: /learn/courses catalog, U1 "plan picker and topic finder" (revamp/courses-catalog)

2026-10-20, taskmap n384, branched from `revamp/learn-courses` at `7dfbeae`. Spec:
`docs/learn/COURSES_INTERACTIVITY.md` sections 2 to 5, plus Cedric's colour brief relayed by the
orchestrator the same day ("not interactive and stand out and eye-catching at all (no images,
colors are way too bland)"), which replaces section 2's "accent as hairline, selected states in
ink" for the courses pages. Dev server on 4194, Python Playwright, axe-playwright-python.

## What was built

- **Photo hero** (`LearnHeader` new optional `media` and `overlap` props; `title` widened to
  `ReactNode`). A full-width ink band with `highlight-icra2026-pitwork-02-1200.webp` (UPenn's pit
  table at ICRA 2026) under a scrim (ink 80% on phones, a 95% to 25% left-to-right fade from md).
  The headline's last two words sit on their own line in `text-gradient-logo`. The photo loads
  eagerly with `fetchpriority="high"` because it is the largest paint. Course and Teach do not
  pass `media`, so they render as before (checked at 1440).
- **Stat tiles** (`Ledger` new optional `variant="tiles"`, plus a `CourseIcon` export): the eight
  figures from `courses.json` `stats`, in their order (course, then community), as tiles riding the
  band's bottom edge. Each tile has an ink-stroke glyph drawn for this site on a tinted square:
  violet for the course figures, magenta (values in `rr-magenta-deep`) for the community ones.
  The tiles are a `ul` (each reads "7 modules"). Grid: 2 columns, 4 from sm, 8 from xl. Values are
  the file's display strings and are not animated. Teach keeps the list variant.
- **Plan picker** (new `PlanPicker.tsx`): native radios drawn as a mono segmented control above
  the ladder. Nothing is checked on first paint. The picked segment fills violet with white text.
  Arrow keys move along the group. "Show all three" clears the pick and keeps its place while it
  is hidden, then hands focus back to the group. The pick is kept in `?plan=` (`useSearchParams`,
  `replace`) and also in local state, so the controlled radio changes in the same frame as the
  click (the router's own update runs as a transition).
- **Ladder** (`PlanLadder.tsx`): the picked plan's bar turns violet and the other rows' bars dim
  (opacity 15%; their labels keep full contrast). The modules the plan covers get a violet letter
  and a 2px violet rule; the rule is always drawn and only its opacity changes. Changes fade in
  180 ms and are instant under reduced motion.
- **Summary** (`PlanSummary` in `PlanPicker.tsx`): a violet-tinted panel showing Modules, Labs,
  Races, Final project (15 weeks only, `final_project.weeks`) and the one solid CTA "Open the
  N-week course". All four states sit in one grid cell and only the current one is visible, so
  the panel is always as tall as its tallest state. Class time (`meta.class_time.text`) is the same
  for every plan and stays put. An `aria-live` line reads "10-week course: Modules A to D, Labs 1
  to 6, Races 1 and 2." after a pick.
- **Plan cards**: three cards, each with a competition photo (manifest CC-02 to CC-04), a bottom
  scrim under "N weeks" in display type, the blurb, accent chips (weeks, modules, labs, races),
  a 3px violet top rule, the Micro hover lift (2px up plus `shadow-card-hover`, 180 ms, no lift
  under reduced motion), and "See the N-week course". The title is an `aria-pressed` toggle
  stretched over the whole card: a click anywhere picks the plan and a second click clears it.
  The picked card gets a violet 2px border and a "Selected" badge. Its focus ring is drawn on the
  card, outside the border. From 768 to 1023 the cards lie on their side (photo left, in one
  column); in three columns at 768 the blurb wrapped into a narrow ribbon.
- **Topic finder** (new `TopicFinder.tsx`), at the top of section 03 above `CourseOutline`
  (unchanged): a labelled search field in the /research style. Results show the module letter in
  a filled violet badge, the kind and number in mono, the title linking to the coursekit with the
  matched words tinted magenta, the module line, and the plans that include it as violet chips
  linking to `/learn/courses/:id`. At most 8 rows, then "N more. Add a word to narrow it down." The
  count sits beside the field. The live region speaks once typing pauses (700 ms). A miss shows a
  magenta-tinted panel listing the seven modules as buttons that fill the query and return focus
  to the field.
  Matching: every query word must start a word of the kind or title (whole words rank first).
  Then an acronym spelled by the initials of consecutive title words (MPC, MPPI, FTG, AEB, RL,
  ML, PF). Then the query run together from a word start ("ros2" finds "ROS 2"; "race" no longer
  matches inside "RoboRacer"). Then hits that need the module name, summary or body. Ties keep
  course order. There is no hand-written alias list. Where a result's plans come from: a lecture,
  tutorial or race takes its module's plans from `lectureSelection()`; a lab takes the plans whose
  `labs` include it; the final project takes the plans that run all its modules.
- **"What the course gives you"** as four icon tiles (ink glyph on a violet-tinted square, title,
  sentence), rendered in `Courses.tsx` from `visibleFeatures(...)`. Nobody edits `FeatureList`,
  and Teach still uses it.
- **Manifest**: section "Courses catalog: reused site photos" in `docs/ASSET_MANIFEST.md`, rows
  CC-01 to CC-04. No new file: each row points at its existing provenance row (V4-10, V3-18,
  V4-05, V3-02).

No data edits, no new dependency, no new route, no file over 1.5 MB, `index.css` untouched.

## Spec acceptance

| item | result |
|---|---|
| Each pick updates ladder, summary and cards in one frame, no shift | pass: 12 picks (3 sizes × 3 radios + a card click each). In the next animation frame the radio is checked, the card is `aria-pressed`, the visible CTA points at the plan, exactly one row's bar is violet, the URL holds `?plan=`, and `#outline` moved 0 px |
| `/learn/courses?plan=4-weeks` restores | pass (radio checked, card pressed, "Open the 4-week course" shown). `?plan=nope` shows nothing picked, no error |
| Back and Forward | pass: three picks leave `history.length` unchanged (`replace`). CTA to `/learn/courses/10-weeks`, then Back lands on `?plan=10-weeks` with 10 weeks checked, then Forward returns to the course page |
| "RRT" | Lecture 11 (Local planning: RRT, spline-based planner), Module D, in 10 and 15 weeks; then Module D itself (its summary) |
| "model predictive" | Lecture 21, Lab 7, Lab 8 (all 15 weeks) |
| "MPC" | Lecture 21 and Lab 7 (acronym of their titles), then Module F (its summary says MPC) |
| "particle" | Lecture 8, Tutorial 5, Module C |
| A miss | "0 matches" beside the field, the panel, the seven module buttons. A button fills the query ("Planning and control", 6 rows) and returns focus to the field |
| 390: picker full width, ladder letters only | pass (segments share the row; module names stay `sr-only` below lg) |

## Checks

| check | result |
|---|---|
| `scripts/rr.sh check` | pass (lint, `tsc -b`, build) |
| axe, a plan picked and "RRT" results showing | 0 violations of any impact at 1440, 768 and 390 |
| Console | 0 from site code at all three sizes. At 1440 and 768, once the shared CommunityJoin block loads its YouTube embed (`youtube-nocookie.com/embed/wPHYLAnpMOU`), Chrome logs the embed's own "No available adapters." warning and a postMessage origin error. Both are third-party and predate this unit |
| CLS | 0 on load and 0 after all picks at 1440 and 768; 0.0001 at 390 (on load, before any pick) |
| Reduced motion | 0 text elements at opacity 0 on first paint; every new transition computes to `transition-property: none`; full capture below |
| Keyboard | Tab from section 01 lands on the first radio. ArrowRight picks 10, then 15. Tab reaches "Show all three"; Enter clears and puts focus back on the first radio. Tab then reaches the ladder links and the first card's toggle; Space picks it (`aria-pressed=true`, radio follows). In the finder, typing then Tab lands on the first result. Focus rings show on segments, cards and links (captures below) |
| Touch (390, coarse) | segments 44 px, "Show all three" 44, field 52, module buttons 44 to 56, result title links 50 to 75 (TAP), plan chips 27 px drawn with a 44 px invisible `::after` hit area (a pill padded by TAP swelled visibly) |
| One solid violet CTA per viewport | hero "Pick a course" and the summary's "Open the N-week course" never share a viewport (they are 959 to 1442 px apart against at most 952 px of visible height, measured at 1440x900, 1366x650, 1536x730, 768x1024 and 390x844). Exception by brief: the picked segment's violet fill shares a screen with the summary CTA. The nav's "Start here" stays exempt as before (HANDOFF section 2) |
| No `TODO` / `TBA`, no dhyeyshah.com | pass at all three sizes |
| One h1, horizontal overflow | 1 h1; 0 px overflow at 1440, 768, 390 |
| Images | every `img` in `main` has alt, width and height; the cards and the Penn logo are lazy; the hero is eager and high priority (largest paint) |
| Links | the 50 coursekit URLs the finder can show (modules, lectures, tutorials, labs, races, final project) all answer 200 (curl -L, 2026-10-20) |
| Course and Teach unchanged | `LearnHeader` without `media` and `Ledger` without `variant` render the same markup (captured `/learn/teach` and `/learn/courses/penn` at 1440) |

## LABELS introduced (stage 3 moves them into `courses.json`)

`src/pages/Courses.tsx`:
- `stats`: "The course and the community in numbers" (the tiles' list label)
- `hero`: `src` `/media/highlights/highlight-icra2026-pitwork-02-1200.webp`, 1200x800, `alt` "The
  UPenn Autonomous Racing table at ICRA 2026: students at laptops beside their cars, one
  soldering", `position` "70% 40%"

`src/components/learn/PlanPicker.tsx`:
- `picker` "Show one plan"; `option` "{weeks} weeks"; `clear` "Show all three"
- `idle` "Pick a length to see what it covers and open its course."
- `modules` "Modules"; `labs` "Labs"; `race` "Race"; `races` "Races"; `project` "Final project";
  `projectValue` "{weeks} weeks"; `classTime` "Class time"
- `cta` "Open the {plan title}"
- `announce` "{plan title}: Modules {range}, Labs {range}, Race(s) {range}."; `cleared` "All three
  plans shown."

`src/components/learn/PlanLadder.tsx`:
- `selected` "Selected"; `weeks` "{n} weeks"; `modules` "Modules {range}"; `labs` "Labs {range}";
  `races` "Race(s) {range}"; `chips` "At a glance" (the chip list's label)
- `PLAN_PHOTOS`: 4 weeks `platform/platform-learn-1200.webp` (1200x750, "Two students assembling a
  car on the pit floor"); 10 weeks `highlights/highlight-icra2026-chase-02-poster.webp` (960x540,
  "Two cars nose to tail through a chicane of white boxes at ICRA 2026"); 15 weeks
  `highlights/highlight-icra2026-overtake-01-poster.webp` (960x540, "Cars racing between the
  orange barriers at ICRA 2026")

`src/components/learn/TopicFinder.tsx`:
- `label` "Find a topic"; `placeholder` "Try RRT, particle filter, MPC or YOLO"
- `hint` "Searches every module, lecture, tutorial, lab and race in the course."
- `count` "{n} match(es) for “{q}”"; `shown` ", the first 8 shown"; `more` "{n} more. Add a word to
  narrow it down."
- `none` "Nothing in the course matches “{q}”."; `suggest` "Try a module:"
- `results` "Matching topics" (list label); `inPlans` "In"; `module` "Module {id}"; `project`
  "Project"

## Captures (git-ignored, `docs/qa/courses-catalog/` in this worktree, all read back)

Per size (1440, 768, 390): `catalog-<w>-hero`, `-plan-none`, `-plan-{4,10,15}-weeks`,
`-cards-{4,10,15}-weeks`, `-topic-{rrt,mpred,mpc,particle,miss}`, `-full-idle` and
`-full-selected` (full page after a scroll walk; nothing on the page is sticky but the nav).
Also: `catalog-1440-keyboard-{radio,card,topic}`, `catalog-390-keyboard-card`,
`catalog-1440-reduced-full` (reduced motion, `?plan=15-weeks`, no scroll, so the lazy card photos
show their violet fallback panel), and `catalog-390-touch-topic-mpred`. Fixed after reading them
back: the headline wrapping into three lines at 1440, cramped three-column cards at 768, a
full-width CTA and a three-line "Final project, 5 weeks" in the summary on phones, the "0 matches"
panel repeating the status line, the focus ring merging with the picked card's border, TAP
swelling the plan chips, and "Races 1." read for a single race.

## Choices where the spec left one

1. `replace`, not push, for `?plan=` (as briefed): Back leaves the page instead of stepping
   through picks. The hero's "Pick a course" (`#courses`) drops `?plan=` from the address, so it
   also clears the pick; the address stays the one source of truth.
2. A second click on the picked card clears the pick (the toggle's `aria-pressed` contract). Arrow
   keys in the picker never clear; "Show all three" does.
3. The cards lost their Modules/Labs/Races `dl` to chips (same facts). The photo's "N weeks"
   repeats the weeks chip because the brief asked for both.
4. The summary reserves the tallest state's height. On a phone that leaves blank room under the
   idle sentence (about 150 px). This was preferred to a shift on every pick.
5. `text-gradient-brand` named in the brief does not exist in `src/index.css`. I used
   `text-gradient-logo` (cyan to magenta, ink contexts only, as its comment says) on the photo
   band. The comment there still calls the landing hero "the ONE exception"; U2 or stage 3 may
   want to update it (U1 does not own `index.css`).

## Open questions for Cedric

1. **Page length.** Idle and unscrolled, the page went from 5,313 to 5,832 px at 1440 (+519) and
   from 7,851 to 9,503 px at 390 (+1,652). Most of it is the photo hero with its tiles and the
   photo cards (390: tiles 331 px, cards 1,536 px, summary 354 px, finder 128 px). Section 5 of the
   spec calls growth a regression; the colour brief asked for these pictures. Say which wins, or
   whether to shorten the phone layout (for example 2:1 card photos and no weeks chip).
2. **Violet budget.** The picked segment is a violet fill next to the summary's solid CTA, as the
   brief asked (item 3). Keep it, or go back to an ink fill so the CTA stays the only violet fill.
3. **`docs/ASSET_MANIFEST.md`** is not in section 4's ownership table. The rows were added at the
   end at the orchestrator's request, and other units appending there will conflict trivially in
   stage 3. The manifest also lists `platform-learn-1200.webp` twice (V3-18, a photo, and V3-19,
   an RViz frame); the file on disk is the photo.
4. **Feature tiles** live in `Courses.tsx` because `FeatureList` is "nobody edits". Stage 3 could
   give `FeatureList` a tiles variant and use it on both pages.
