# QA: course page, tabs and a working side panel (U2, revamp/courses-page)

2026-10-20, taskmap n385, branch `revamp/courses-page` from `revamp/learn-courses` at `7dfbeae`.
Spec: `docs/learn/COURSES_INTERACTIVITY.md` sections 2 to 5 (unit U2), plus Cedric's change of
visual brief relayed mid-unit by the orchestrator (2026-10-20: "not interactive and stand out and
eye-catching at all (no images, colors are way too bland)"). That brief replaces section 2's "accent
as hairline, selected states in ink" for the course pages: photos, violet fills and tints, accent
selected states, cards with hover lift, one solid violet button per viewport. Dev server on 4195,
Python Playwright, axe-playwright-python.

## What was built

- **Tabs** (`src/components/learn/CourseTabs.tsx`, new): About / Outline / Staff / Logistics as
  WAI-ARIA tabs (tablist, tab, tabpanel, `aria-selected`, `aria-controls`, `aria-labelledby`),
  roving tabindex, Left/Right (wrapping), Home and End with automatic activation. Inactive panels
  are `hidden`; each panel is in the Tab order after its tab (`tabIndex=0`, the APG pattern). The
  current tab has the nav's 2px underline in violet, violet text and a faint violet tint; the
  others tint violet and scale the underline in on hover (180 ms; instant under reduced motion).
  Each tab has an ink-stroke glyph; Outline, Staff and Logistics carry a count pill (modules,
  people, questions: `modules.length`, `staff.length`, `faq.length`), solid violet on the current tab.
- **Hash deep links**: `#about`, `#outline`, `#staff`, `#logistics`. A cold load, a router
  navigation, Back/Forward and a hash typed in the address bar all select from the hash; a click
  writes it with `history.replaceState` (React Router's entry state kept), so tabs add no history
  entries and never scroll. No element has a bare tab id (`course-tab-*`, `course-panel-*`), so the
  browser's fragment jump has no target and `useRouteScroll` opens the route at its top: a deep link
  lands with the header in view. `useScrollToHash` is not used on this page.
- **Sticky tab bar from lg**, under the nav, over the course column only. Switching while it is
  stuck keeps the bar where it is and shows the new panel from its top; the panels reserve a
  window's height for that switch so a short panel cannot pull the bar down (cleared by the next
  unstuck switch or any navigation). Below lg the bar is a row that scrolls sideways, bleeds to the
  window's edges and never wraps; keyboard selection scrolls the chosen tab into view.
- **Photo banner** (in `Course.tsx`): a site photo per course (`BANNERS`, manifest rows CP-01 to
  CP-05) under a dark scrim, strongest behind the text; crumbs on ink with a magenta-bright marker;
  the one h1 in the logo gradient (`text-gradient-logo`, ink context only); the blurb; the facts as
  chips (the first one violet); below lg the solid "Start with Module A" and "Ask in Slack". Penn
  shows its logo on a white tile from lg. Full-bleed on a phone, a rounded band from sm.
- **"At a glance" card**: violet-tinted card, sticky as before (top `nav + 2rem`, only on windows at
  least 40rem tall: the PR #24 rule stands), an ink glyph on a violet tile per row, the page's one
  solid button "Start with Module A" (from lg it lives only here, so every viewport has exactly one),
  the course links, **Copy link** with an `role="status"` line ("Link copied", reserved height) and
  "See all courses". Below lg the card follows the tabs.
- **Copy link** copies `origin + pathname + hash` (the open tab, no query). Clipboard API first, a
  select-and-copy fallback (focus returned to the button), and "Could not copy. The link is in the
  address bar." if both fail. No toast library.
- **Panels**: About (about, What you'll learn with violet check tiles, Before you start as two cards:
  "You need" tinted violet, "Not covered" on paper-100); Outline (`<CourseOutline outline modules />`
  exactly as before, then the "Not in this plan" line, whose links now open the longer plan's
  Outline, `/learn/courses/<id>#outline`); Staff as cards with the photo ringed in violet (an accent
  initials badge when a person has no photo), the role as a violet badge, hover lift; Logistics as
  FAQ cards (`FaqList cards`) that warm to violet on hover and stay violet while open.
- **`FaqList`** gains an opt-in `cards` prop; without it the ruled list is byte for byte the old one,
  so `/learn/teach` is unchanged (checked: 9 ruled folds, none carded). U3 can opt in.
- Untouched: `src/index.css`, `BlockHeader.tsx`, `CourseOutline.tsx`, `LearnHeader.tsx` (still used
  by the no-such-course state), data, hooks, routes.

## LABELS (new micro-copy, `LABELS` at the top of `src/pages/Course.tsx`; stage 3 moves them into `courses.json` `course`)

| key | text |
|---|---|
| `tablist` | Course sections (the tablist's accessible name) |
| `facts` | Course facts (the banner chips' list name) |
| `tab_about` | About |
| `tab_outline` | Outline |
| `tab_staff` | Staff |
| `tab_logistics` | Logistics |
| `noun_module` | module / modules (sr-only after the Outline count) |
| `noun_person` | person / people (sr-only after the Staff count) |
| `noun_question` | question / questions (sr-only after the Logistics count) |
| `copy_link` | Copy link |
| `copied` | Link copied |
| `copy_failed` | Could not copy. The link is in the address bar. |

Also new copy, in `BANNERS` beside it: the four banner alt texts ("Two students assembling a
RoboRacer car on the pit floor", "A RoboRacer car in the air off the bridge on the ICRA 2026 track",
"A RoboRacer car at speed on the ICRA 2026 track", "The UPenn Autonomous Racing team at work on their
cars at ICRA 2026"). The panel headings are the JSON's (`about_heading`, `outline_heading`, ...).

## Page height (document, footer included; About tab)

| id | 1440 before | 1440 after | 768 before | 768 after | 390 before | 390 after |
|---|---|---|---|---|---|---|
| 4-weeks | 2,936 | **1,350** | 4,239 | 2,555 | 4,992 | 3,167 |
| 10-weeks | 3,195 | **1,376** | 4,596 | 2,616 | 5,473 | 3,290 |
| 15-weeks | 3,681 | **1,430** | 5,268 | 2,738 | 6,480 | 3,537 |
| penn | 3,681 | **1,430** | 5,414 | 2,856 | 6,624 | 3,639 |

Other tabs at 1440: Outline (folds closed) 1,739 to 3,514 with every fold open, Staff 1,158 to
1,247, Logistics 1,497 with every question open. Target was "at most about 1,600" for About.

## Checks

| check | result |
|---|---|
| `scripts/rr.sh check` (lint + build) | pass |
| Console errors | 0 at 1440, 768, 390 on all four ids and every tab; 0 on /learn/teach |
| axe, every tab state (Outline and Logistics with every fold open), 4 ids x 3 widths | 0 violations of any impact (48 states) |
| One h1 | pass everywhere; the no-such-course state unchanged ("No such course", no tablist) |
| Keyboard | 14 Tabs from the page top reach the selected tab; Right x4 wraps to About, Left from About goes to Logistics, Home/End; one tab at `tabIndex 0` throughout; Tab from the tab goes into its panel, then to its first control; Enter opens a FAQ card; focus ring visible on tab and panel (captures) |
| Cold deep links | `penn#outline`, `4-weeks#staff`, `15-weeks#logistics`, `10-weeks#about` open their tab with `scrollY 0` and the h1 in view; `#nope` and `#%` open About |
| In-app navigation | 4-weeks Outline, "See the 10-week course" -> 10-weeks with Outline open at the top; Back -> 4-weeks Outline; Forward -> the tab last picked there. Catalog card -> penn About at the top |
| Typed hash | `#outline`, `#staff`, `#about` typed on the same page each select their tab, no scroll |
| Switching never jumps | from the top, every switch keeps `scrollY 0`; stuck at y 2201 on Outline (folds open), Staff keeps the bar at 64 px and puts the panel's top at the bar's bottom |
| Nav | Learn `aria-current="true"` on every course page, no other link current |
| Copy link | "Link copied", clipboard `http://localhost:4195/learn/courses/penn#staff` (query dropped), cleared after 4 s, focus stays on the button; fallback path copies; both failing shows the failure line |
| One solid violet button per viewport | walked in half-viewport steps, every tab, 4 ids x 3 widths: never two in `main` (the nav's own "Start here" is the standing exemption, HANDOFF 2.1) |
| Sticky card fit | Penn (tallest) 509 px against 562 px of room at 1366x650, 553 against 636 at 1536x730; static below 40rem window height as before |
| Tab row at 390 | one line, scrolls sideways, tabs 45 px tall; End brings Logistics fully into view without moving the page |
| Reduced motion | 0 running animations after a switch (9 CSS transitions and the opacity step with motion allowed); captures `penn-*-1440-reduced.png` |
| CLS | at most 0.006 on load and across all tab switches |
| Horizontal overflow | 0 px at every width |
| Images | alt, width and height on all; banner and Penn tile eager (`fetchPriority="high"` on the banner: it is the first paint), staff photo lazy |
| `TODO` / `TBA` / dhyeyshah.com | none on any page or tab |
| Files over 1.5 MB | none added (no new binary at all) |

## Screenshots (git-ignored, `docs/qa/courses-page/` in the worktree, all read back)

`{4-weeks,15-weeks,penn}-{about,outline,staff,logistics}-{1440,768,390}.png` (36, each tab reached
by clicking it), `penn-*-1440-reduced.png` (4), `deeplink-penn-outline-{1440,390}.png`,
`keyboard-focus-tab-1440.png`, `keyboard-focus-panel-1440.png`, `copy-link-1440.png`,
`sticky-walk-penn-1440.png` (stitched: Outline with every fold open at y 0, 800, 1600, 2400, then
Staff chosen from the stuck bar), `hover-staff-card-1440.png`, `logistics-open-hover-1440.png`.
Fixed after reading them: the 10-week car sat under the darkest part of the scrim (the scrim now
fades after the text column), the 15-week placard showed through behind the lead below lg (darker
phone scrim), the staff role badge wrapped as a two-line pill at 390 (now a box).

## Choices where the spec left one

1. **The tab bar spans the course column, not the page**, so the "At a glance" card keeps its PR #24
   sticky rules unchanged (top and the 40rem window gate).
2. **Automatic activation** (arrows select as they move): the panels are already rendered, so there
   is no load to wait for (APG recommends it then).
3. **Counts as a pill number with the noun for screen readers** ("Outline 7", read "Outline 7
   modules"), the pattern GitHub uses; the words would push the row into a sideways scroll at 1024.
4. **No block numbers and no `Reveal` inside panels**: the tab bar is the index now, and a
   ScrollTrigger inside a `hidden` panel measures nothing. The switch itself is the system's opacity
   step (180 ms, Web Animations API, skipped under reduced motion).
5. **The header is the page's own banner**, not `LearnHeader` (U1's file, which must render Course
   and Teach unchanged): a photo banner with a gradient title could not be an additive prop.
6. **The solid button moves into the sticky card from lg**, as the brief asked: one solid button in
   every desktop viewport; below lg it is in the banner (and again in the card, a screen or more lower).
7. **`text-gradient-logo`, not `text-gradient-brand`**: the brief named the latter, which does not
   exist in `src/index.css` (the design-system skill lists it; the code has `text-gradient-logo`,
   cyan to magenta, ink only). Nothing was added to `index.css`.
8. **The aside is 5 columns at lg and 4 from xl** (it was 4 at col 9 from lg): the icon rows need the
   width at 1024 to 1279.
9. **"See all courses" is a text link beside Copy link** (was a secondary button), to keep the card
   inside the sticky room.
10. **"Not in this plan" links open the longer plan's Outline** (`#outline`): the reader came from one.

## Open questions for Cedric

1. The four banner photos (CP-01 to CP-04): keep, or pick others. CP-02's credit carries V4-09's
   "verify" note.
2. The Penn logo tile in the banner (from lg): keep or drop.
3. Visible panel headings repeat the tab ("Logistics" under "Logistics"): keep, or make them
   screen-reader only.
4. Teach's FAQ as cards too? U3 can pass `cards` to `FaqList`.
5. Stage 3: move `LABELS` and `BANNERS` into `courses.json`.
6. A later idea, not built: `hidden="until-found"` on the inactive panels would let find-in-page
   open the tab that holds a match.
