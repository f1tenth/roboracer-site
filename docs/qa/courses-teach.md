# QA: U3 Teach, a plan builder you can send (`revamp/courses-teach`)

2026-10-20. Unit U3 of `docs/learn/COURSES_INTERACTIVITY.md` (stage 2), branched from
`revamp/learn-courses` at `7dfbeae`. Route: `/learn/teach`. Verdict: **PASS**, pending
Cedric's review on localhost. Stage 3 merges this branch into `revamp/learn-courses` (PR #24).

## What was built

1. **The plan builder** (`src/components/learn/PlanBuilder.tsx`, pure helpers in
   `src/lib/planBuilder.ts`) replaces the static "Choose your lectures" table
   (`LectureSelection.tsx` deleted, rule 10):
   - "Start from a plan": native radios (4, 10, 15 weeks) styled as a segmented control;
     arrow keys move between them. The checked radio is the plan the selection equals,
     so a custom selection checks none and every plan stays one click away.
   - Modules A to G as large tiles, each a real checkbox (labelled "Module A: <title>",
     described by its counts): the letter in a badge that fills violet when ticked and
     sits on a violet tint when not, the tile tinted with a violet border when ticked,
     Micro hover lift (-2px, `shadow-card-hover`, 180 ms). Under each title: its
     lectures and tutorials, and its labs (violet chip) and race (magenta chip).
   - The summary, a violet-tinted card: the status as a chip ("Matches the 10-week
     course" in violet with a tick, "Custom selection" in magenta, "No modules selected"
     neutral), a link to the matching plan's page or the reason a custom selection has no
     weeks, six counters (modules, lectures, tutorials, recorded lectures, labs, course
     races) that run to their new value in 420 ms (instant under reduced motion), then
     modules, labs by number and races as chips, the optional lecture, and the final
     project when E to G are all in.
   - Actions: **Email it to us** (the one solid violet button: a mailto to
     `meta.contact`, subject `meta.teach_subject`, the plan in a URL-encoded body),
     **Copy plan** (plain text, every module, lecture, tutorial, lab and race with its
     course-site link) and **Share link** (`/learn/teach?modules=A,B,D#teach-lectures`) as
     violet outlines; an `aria-live` line says "Plan copied." / "Link copied." (or that
     the browser blocked the clipboard); the share address is printed under it, then
     "Nothing is stored or sent; Email opens your own mail app."
   - State is the URL only: `?modules=` is written with `replace` (Back leaves the page,
     it does not undo ticks), commas left readable, no hash (so `useScrollToHash` never
     glides back). No storage of any kind. Below lg a two-line status bar sticks to the
     bottom of the window while the tiles are on screen (visual only; the card's live
     line speaks).
2. **Cedric's brief of 2026-10-20** (relayed mid-unit: the course pages must stand out,
   pictures and colour, selected states in accent):
   - A photo header on ink in `Teach.tsx` (replacing `LearnHeader` on this page only): the
     ICRA 2026 photo of two students fitting wheels on a car fills the right 62% (the top
     strip on a phone) and fades into ink under the copy; the h1 in `text-gradient-logo`
     (the brief named `text-gradient-brand`, which does not exist in `index.css`; the logo
     gradient is the one gradient-text utility, sanctioned on ink); the feature pills as
     chips with magenta markers; the course figures in `rr-magenta-bright` mono.
   - How it works: six ink-stroke icons on violet-tinted squares joined by a violet
     rule (vertical on a phone); the two portals as tinted cards with chip tags.
   - What comes with it: six icon tiles (replacing `FeatureList` on this page only); the
     five with a page on the course site link to it (`meta` addresses: license, lecture
     index, labs, grading) and lift on hover, "Pick your lectures" links to the builder.
   - The guide: numbers as violet badges, violet square markers, tips on a magenta tint.
   - Recording tips: numbers as violet badges.
3. **Section rail** (`src/components/learn/SectionRail.tsx`, item 7): from lg a slim bar
   sticky under the nav lists the six sections with their numbers; the section under the
   reading line (IntersectionObserver band at a third of the window) gets the violet 4px
   marker and the nav's 2px underline, `aria-current="location"`. A click scrolls the
   section header in under the bar (smooth unless reduced motion), moves focus to its
   heading, and leaves the URL alone. Hidden below lg. Horizontal rather than vertical:
   every teach section uses the full page width, so a side rail had no gutter to live in.
4. **Manifest**: row U3-01 in `docs/ASSET_MANIFEST.md` for the header photo (an existing
   file, provenance V3-18, Felix Jahncke, granted). No new media file.

## LABELS introduced (stage 3 moves them into `courses.json`)

All in `LABELS` at the top of `src/lib/planBuilder.ts` (`{x}` slots are filled by `fill()`):
`startLegend` "Start from a plan" · `weeksOption` "{n} weeks" · `modulesLegend` "Modules" ·
`moduleSr` "Module {id}: " · `lectureOne`/`lectureMany` "{n} lecture(s)" ·
`tutorialOne`/`tutorialMany` "{n} tutorial(s)" · `labOne`/`labMany` "Lab(s) {list}" ·
`summaryHeading` "Your plan" · `matches` "Matches the {plan}" · `custom` "Custom selection" ·
`customShort` "Custom" · `customNote` "The course site gives weeks only for its three plans." ·
`empty` "No modules selected" · `emptyShort` "No modules" · `emptyNote` "Choose at least one
module to copy, share or email a plan." · `seePlan` "See the {plan}" · `tutorials`
"tutorials" · `detailModules` "Modules" · `detailLabs` "Labs" · `detailRaces` "Races" ·
`detailOptional` "Optional" · `detailProject` "Final project" · `projectIncluded`
"Included, Modules {modules}" · `none` "none" · `email` "Email it to us" · `copy` "Copy plan" ·
`share` "Share link" · `copied` "Plan copied." · `linkCopied` "Link copied." · `copyFailed`
"Your browser blocked the clipboard. The link below can be selected and copied by hand." ·
`shareLabel` "Link to this plan" · `stored` "Nothing is stored or sent; Email opens your own
mail app." · `railLabel` "On this page" · texts: `textTitle` "RoboRacer course plan",
`textLink` "Link", `textModule` "Module {id}: {title}", `textRecorded` "recorded",
`textMaterial` "Course material", `textLicense` "License", `mailGreeting` "Hello RoboRacer
team,", `mailIntro` "We would like to teach the RoboRacer course with this plan.",
`mailFields` "University:", "Your names:" (from `teach.contact.lead`).

The other count labels come from `courses.stats[].label` (modules, lectures, labs, course
races, recorded lectures), so the builder and the header ledger use the same words. New
copy outside `LABELS`: the header photo's alt text (`HERO_PHOTO` in `Teach.tsx`).

## Decisions where the spec left a choice

- **No `?modules`**: the builder starts from the full course (the plan with every module),
  so first paint shows the whole course as the old table did.
- **Counting**: lectures are lecture pages without the optional one ("Lectures 23 to 25"
  is one page), recorded lectures include the optional one: for the full course the
  counters equal the catalog's `stats` (7, 23, 10, 3, 12), a unit check.
- **Labs** are lectureSelection()'s required labs of the ticked modules, by number; a lab
  belongs to its `module` (Lab 9 goes with E, though Lecture 18 in F assigns it).
- **Final project** shows only when E, F and G are all ticked (CourseOutline's rule).
- **No weeks for a custom selection**, and the card says why; the matching plan's weeks
  appear only through its own title.
- **Empty selection** is allowed (`?modules=`): actions disabled, the card says to tick one.
- **Email body**: greeting, the two blank fields the contact copy asks for, the plan
  (status, module letters and titles, counts, labs, races) and the share link, CRLF line
  breaks. Longest encoded body over all 128 selections: 817 characters (whole mailto 894).
- **Header photo eager** (`fetchpriority="high"`, width and height set): it is the first
  view, so lazy would only delay it.

## Checks

| Check | Result |
|---|---|
| `scripts/rr.sh check` (lint + build + publications) | CHECK OK |
| Unit checks of `planBuilder.ts` (all 128 selections against `courses.json`) | 1,575 passed, 0 failed |
| Wiring at 1440, 768, 390 (independent re-count from `courses.json`) | 400 passed, 0 failed |
| Axe, serious or critical: default, custom + "Plan copied.", empty, each width | 0 |
| Keyboard pass (1440, 390) | pass |
| Reduced motion | pass |
| Section rail (1440) | pass |
| Console errors | none (warnings at 768 come from the Join block's YouTube embed and a WebGPU probe, not this unit) |
| CLS on load | under 0.1 at all three widths |
| One solid violet button per viewport (whole page walked, nav excluded) | pass at 1440, 768, 390 |
| `TODO` / `TBA` on the page, link to dhyeyshah.com | none |
| New dependency, file over 1.5 MB | none (no new media file) |

What the checks covered:

- **Unit checks** (script `u3-plan-test.ts` in the session scratchpad, bundled with the
  repo's esbuild and run on node). Each plan reproduces lectureSelection(): the same
  modules, the same labs, the same races, and it matches itself. The full course equals
  `stats`. For every selection, labs and races follow their modules, no lab is lost, and
  the match is right. The encoded email body stays under 1,800 characters. The share link
  round-trips through `URL`. No week, hour or date appears in a custom plan's texts.
  Removing a module drops its labs and race (10 weeks minus D loses Lab 6 and Race 2;
  everything minus G loses Race 3 and the final project). Parsing handles lowercase,
  unknown and repeated letters, and spaces or plus signs as separators.
- **Wiring at each width** (`u3-qa.py`, Python Playwright). The three radios, the
  custom selection A, B, D, then minus D. Each state's counters, chips, status and
  checked radio are checked against `courses.json`. Toggling never scrolls. The mailto
  is checked (recipient, subject, body under 1,800 characters, body carries the link).
  Copy plan and Share link are read back from the clipboard. The empty state disables
  the actions. A shared link opened in a fresh page restores the ticks and lands with the
  builder's heading under the nav. A clipboard without permission falls back to
  select-and-copy and focus returns to the button. With both blocked, the card says so.
- **Keyboard pass** (1440, 390). Tab goes: checked radio, the seven boxes in order, "See
  the 15-week course", Email, Copy, Share. Every stop shows the 2px violet ring and is in
  view. ArrowLeft picks 10 weeks, Space unticks C (focus stays through the URL update),
  and Enter on Copy plan copies.
- **Reduced motion**. The counters change at once. Tile transitions are off and tiles do
  not lift. No text is left invisible.
- **Section rail** (1440). It marks 04 inside the builder. Clicking "02 What you get"
  puts its heading under the bar, focuses it and keeps `?modules`. At 1440x900 the whole
  builder (start-from to tile G, and the whole card) fits one screen under the bars.
- **Other**. One h1. The header photo is 1200x750 with alt text. Rail hidden below lg.

## Screenshots (git-ignored, in this worktree's `docs/qa/courses-teach/`)

Read back for this note: `<w>-0-header.png` (photo header), `<w>-1-full-course.png`,
`<w>-2-four-weeks.png`, `<w>-3-custom-abd.png` (the three selections, section captures
with the fixed nav hidden), `<w>-4-sheet-link-copied.png`, `390-5-empty.png`,
`<w>-page.png` (full page), `1440-walk-*.png` and `390-walk-*.png` (viewport walks through
the builder: sticky card at lg, the phone status bar), `1440-rail-in-builder.png`,
`1440-builder-one-screen.png`, `1440-reduced-motion-builder.png`; `<w>` is 1440, 768, 390.

## Open questions for Cedric

1. **Page length**: `/learn/teach` measures 6,779 px at 1440 (6,340 before) and 13,846 px
   at 390 (11,128 before): the photo strip, the icon tiles and the module tiles cost
   height on a phone. Keep, or fold the feature tiles to a list below sm?
2. **The rail is horizontal** (a bar under the nav), not a side rail: say if you want it
   on the side, which needs a gutter on every section.
3. **Gradient title**: `text-gradient-logo` (cyan to magenta) on the h1 over ink, the
   landing hero's exception extended to this header per the brief.
4. **Email body wording** ("We would like to teach the RoboRacer course with this plan.",
   the University / Your names fields) and the subject (unchanged `teach_subject`).
5. For stage 3: `FeatureList`'s `page: "teach"` branch, `LearnHeader` and `Ledger` are no
   longer used by `/learn/teach` (the catalog and course pages still use all three);
   `docs/ASSET_MANIFEST.md` gained a section at its end (U3-01), so a sibling unit adding
   rows there may conflict on the last lines.
