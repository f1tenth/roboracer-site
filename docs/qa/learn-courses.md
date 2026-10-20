# QA: the courses pages (PR #24, `revamp/learn-courses`)

The one QA report for PR #24. Last run 2026-10-20 (stage 3, taskmap n382) on Cedric's dev server
(port 4193, worktree `../roboracer-site-wt/learn-courses`), Python Playwright (Chromium) and
axe-playwright-python. History: the first port of Dhyey Shah's LMS mock (2026-09-27, the old
version of this report is in git history), a forward to his site (PR #25, undone 2026-10-20), the
interactivity study (`docs/learn/COURSES_INTERACTIVITY.md`), four stage 2 build units (appendix),
and this stage 3 review and polish (`docs/qa/courses-review.md`).

**Catalog QA is pending stage 4.** Cedric reviewed the merged pages on 4193 on 2026-10-20: the
course pages are good (4 weeks especially); the catalog gets another round (the class leaderboard
from `/race` near the top, the stat numbers counting up as on the other big pages, the plan bars in
the logo gradient, a reworked "Pick your length"). The catalog was checked here only for what
stage 3 changed (hero photo, the gap under the tiles) and for the merge (every control on one page);
its full QA comes with stage 4.

## What the pages are now

- **`/learn/courses`** (`Courses.tsx`): a photo band (the ICRA 2026 car at speed, right 62% from
  lg) with the headline's last words in the logo gradient and eight stat tiles riding its edge; 01
  "Pick your length": a plan picker (4, 10, 15 weeks, `?plan=`), the plan ladder over modules A to
  G, a summary with the one solid CTA, three photo cards; 02 Penn as the one published offering; 03
  the outline with the topic finder above it; 04 what the course gives as icon tiles; 05 teach it;
  the shared Join block.
- **`/learn/courses/:id`** (`Course.tsx`; `4-weeks`, `10-weeks`, `15-weeks`, `penn`): a photo
  banner per course with the title in the logo gradient and the facts as chips; four tabs (About,
  Outline, Staff, Logistics) with icons, counts, hash deep links and a sticky bar from lg; a sticky,
  violet-tinted "At a glance" card holding the page's one solid button (Start with Module A) and Copy
  link. The Outline tab is the shared outline: lecture thumbnails, Watch inline (one player at a time,
  closed when the tab is left), Slides links, done ticks saved in this browser only with a meter,
  Expand / Collapse all and Clear.
- **`/learn/teach`** (`Teach.tsx`): a photo header on ink, a section rail from lg, How it works (six
  icon steps, the two portals), what comes with it (icon tiles linking the course site), the guide,
  the plan builder (start from a plan, tick modules, copy, share or email the plan, `?modules=`),
  recording tips and docs, instructor questions, the shared Join block.
- **Data**: everything renders from `public/data/courses.json`: facts (sourced, see
  `docs/learn/COURSES_CONTENT.md`), page copy, the interface labels (`catalog.picker`, `.ladder`,
  `.finder`, `course.ui`, `outline.ui`, `teach.builder`) and the photos (`catalog.hero.photo`,
  `teach.hero.photo`, `plans[].banner`, `plans[].card_photo`, `offerings[].banner`), each photo
  pointing at its `docs/ASSET_MANIFEST.md` row. TUM and UC San Diego stay `verify` and do not
  render; null dates and effort render nothing; no `TODO(content)` string reaches a page.
- **Routing**: the Learn nav link is current under `/learn/*`; `main.tsx` sends a same-origin
  parent frame to the top level, so a coursekit link to `/learn/courses` from inside the `/learn`
  frame opens the page at the top level.

## Stage 3 changes

| commit | what |
|---|---|
| `c08259a` | Catalog hero: the ICRA 2026 car at speed (was the UPenn pit table), in the right 62% of the band from lg. Teach header: a team at its pit table (was the 4-week banner's photo). 15-week banner: the ICRA 2026 group behind the track. Photos into `courses.json`; `BANNERS` and `PLAN_PHOTOS` gone; manifest CC-01, CP-03, U3-01 rewritten. The tight top padding under the catalog's stat tiles |
| `b31fd3b` | Leaving the Outline tab closes a playing lecture (`PanelActive` context from `CourseTabs`); the panel headings that repeat the tab are screen-reader only |
| `14ad8f2` | Teach length: tight section rhythm, phone feature tiles with the icon beside the title, tighter guide rows on phones (8,457 to 7,881 px at 1440, 15,617 to 14,919 at 390, nothing removed) |
| `e5af1a7` | The plan builder's ticks show in the click's frame (they lagged a router transition) |
| `522e26e` | `docs/qa/courses-review.md` |
| `eff33b2` | The stage 2 `LABELS` move into `courses.json`, typed in `data.ts`; one `fill()` in `learnStyles.ts`. Text of 34 page states identical before and after (every route and tab, finder hit, miss and overflow, picker, builder states, the copied plan and the mailto) |
| `4b35e05` | Dead code: `FeatureList`, the Ledger's list variant, LearnHeader's `meta` and `aside`, LearnLink's `CheckMark` |
| `0f380a7` | The gradient-text note in `index.css` names the courses pages' photo tops |
| `d27dd9d` | The no-such-course state keeps the loading placeholder's height (CLS 0.26 to 0 at 768) |

## Checks (stage 3)

24 states per width (the catalog idle and with a plan picked and "RRT" in the finder; the four
course ids on each of the four tabs; Penn's Outline with every fold open, two ticks and a lecture
playing; Penn's Logistics with every question open; teach default, custom A, B, D after Copy plan,
and empty; the no-such-course state), at 1440x900, 768x1024 and 390x844.

| check | result |
|---|---|
| `scripts/rr.sh check` (lint, `tsc -b`, build) | CHECK OK |
| axe, 72 states | 0 serious, 0 critical. One moderate `heading-order` on the no-such-course state only (the footer's h3s after an h1 with no h2), as on 2026-09-27 |
| Console from site code | none. Third-party only: the YouTube embeds (the Join block's video, a lecture player) log "No available adapters." and a postMessage origin warning, and once Chrome's "Permissions policy violation: compute-pressure" from inside the embed |
| Failed requests (4xx/5xx) | none |
| One h1, horizontal overflow | 1 h1 everywhere; 0 px overflow in all 72 states |
| CLS on load | at most 0.004 (course pages), 0.0001 (catalog, teach), 0 (no-such-course, after `d27dd9d`). Opening every Logistics question by script shows up to 0.13 because the script's opens are not user input; with clicks they are excluded |
| Images | every `img` in `main` has alt, width and height in every state |
| `TODO`, `TBA`, dhyeyshah.com in page text | none |
| One solid violet button per viewport (walked in half-viewport steps, `main` only; the nav's "Start here" is the standing exemption, HANDOFF 2.1) | pass in 71 of 72 states. Penn's Outline with a lecture playing shows the filled "Close" pill beside the card's Start with Module A: the open Watch pill is a selected state, filled by the brief like the picked plan segment (question 8) |
| Reduced motion (catalog, 4w About, 15w Outline, Penn About, Staff, Logistics, teach; 3 widths) | 0 text elements invisible before any scroll; captures `*-reduced.png` |
| Merge check (`s3-interact.py`) | 22 of 22 at 1440, 21 of 21 at 768 and 390 (the rail check needs lg): picker, card toggle, Show all three, finder hit and miss, a tick saved, Watch with one player, Expand all, Collapse all stopping the player, the tick shown on the 10-week Outline, arrow keys and End on the tabs with the hash following, Copy link (`/learn/courses/10-weeks#logistics`), Clear, the builder matching the 4-week plan then going custom, Copy plan, the rail marking 03 |
| Leaving Outline while a lecture plays | the player closes (1 iframe, then 0 on Staff, 0 back on Outline) |
| Sticky parts (1440 walks) | the tab bar sticks under the nav; switching to Staff from a stuck Outline keeps the bar at 64 px and the panel under it; the "At a glance" card stays beside; the teach rail marks 02, 04 and 06 as they pass the reading line |
| Keyboard only | Penn at 1440: 14 stops in `main` (crumbs, the selected tab, its panel, the card's links, Start with Module A, Copy link, See all courses), every one with a visible ring and in view; teach at 1440: 34 stops through the rail, the tiles, the guide's links, the builder's radio and seven boxes and its actions, all ringed and in view; the same at 390 (16 and 42 stops) |
| Links (112 unique: every `href` on the pages with folds open, plus every URL in `courses.json`) | 109 answer 200. `www.upenn.edu` 403 to a browser user agent, 200 to plain curl. The Slack invite 403 to curl (valid, Cedric). The slide-request form `forms.gle/4UJigTa36VAMyGheA` 404 is only in `meta.slide_downloads` (status `broken`, never linked) |
| Files over 1.5 MB | none outside the approved `public/media/hero/` encodes; stage 3 added no binary |
| `/learn` frame | the coursekit loads in the frame ("RoboRacer - Course Documentation") |
| Frame escape | an iframe of `/learn/courses` injected into `/learn`: the top window navigated to `/learn/courses`, one frame left |

Heights (full page after a scroll walk, Join block and footer included): catalog 8,279 / 10,269 /
12,671; course pages About 1,307 to 1,387 at 1440, Outline 1,960 to 2,615, Staff and Logistics
1,158 to 1,247; teach 7,881 / 11,281 / 14,919 (1440 / 768 / 390). The full table is in
`docs/qa/courses-review.md`.

## Screenshots

Git-ignored, in `docs/qa/learn-courses/` of the worktree, all read back:

- `<state>-<w>.png` for the 24 states above at 1440, 768 and 390 (`catalog`, `catalog-picked-rrt`,
  `{4w,10w,15w,penn}-{about,outline,staff,logistics}`, `penn-outline-open`, `penn-logistics-open`,
  `teach`, `teach-custom-abd`, `teach-empty`, `notfound`), full page after a scroll walk.
- `<state>-<w>-reduced.png` for 7 states at each width (no scroll, reduced motion).
- `walk-teach-1440-y{1400,3300,4700}.png`, `walk-penn-outline-1440-y{900,2400}.png`,
  `walk-penn-staff-from-stuck-1440.png` (sticky parts), `keyboard-{penn,teach}-{1440,390}-NN.png`,
  `learn-frame-1440.png`.
- `review/`: the fresh-eyes captures behind `docs/qa/courses-review.md` (`r-*` before the fixes,
  `f-*` and `t-*` after).

## Open questions for Cedric

1. **Done ticks** on the outline: keep them? Local to the browser, labelled, clearable (U4).
2. **Lecture 9 (optional) embeds two more videos** (the scan-matching lab, parts I and II); one
   `video_id` per item today. Show them too? (U4)
3. **The section rail on teach is horizontal**, a bar under the nav; a side rail needs a gutter on
   every section (U3).
4. **Page length**: teach is 7,881 px at 1440 and 14,919 at 390 after stage 3's cuts. Two content
   cuts are yours to make: drop the six-step "How it works" strip, which walks the same path as the
   five-step guide (about 300 px at 1440, 650 at 390), and end the instructors page without the
   shared Join block (2,218 px at 1440). The catalog's length goes to stage 4 (U1, U3, review).
5. **Tutorial 3's slide deck is deleted** (HTTP 410) on its coursekit page; worth a coursekit fix
   (U4).
6. **Permission notes for the reused photos**: the 10-week banner (CP-02, the car off the bridge,
   V4-09) is credited to you with "verify: looks like a DSLR frame"; the Penn banner (CP-04, V4-10)
   shows an identifiable student. Every other photo on these pages is Felix Jahncke's or the Samaks'
   (granted) or your own.
7. **How readers reach `/learn/courses` from roboracer.ai**: today only the coursekit sidebar links
   it (the nav's Learn opens the `/learn` frame). A Courses entry in the landing's Learn tile or in
   `paths.json`, a slim link bar above the frame, or a nav change.
8. **Violet budget**: the picked plan segment (U1) and the open Watch pill (U4) are violet fills
   that can share a screen with the solid CTA, as the brief allows for selected states. Keep, or
   tint them so the CTA stays the only fill.
9. **The Penn logo tile** in the Penn banner from lg: keep or drop (U2). **Teach's FAQ** as cards
   like Logistics? (U2)
10. **The email the plan builder writes**: "We would like to teach the RoboRacer course with this
    plan." plus University / Your names fields, subject unchanged (U3).
11. **Lecture thumbnails load before a click** (from i.ytimg.com, as /news does); only the player
    waits for the click. Fine? (U4)
12. Still open from `docs/learn/COURSES_CONTENT.md`: the Open edX portal URL (`meta.lms_url`);
    whether `/learn/teach` may describe the Studio and Courses portals before the URL is public;
    plan dates and hours per week; TUM and UC San Diego; Penn term dates; who grants slide downloads
    now that the form is a 404; the labels the 2026-09-27 build wrote (`catalog.outline_heading`,
    `course.glance_heading`, `course.not_found`, `teach.hero.plans_link`).

## Appendix: the stage 2 unit notes

Each unit's own QA, decisions and questions (their LABELS lists are now `courses.json` keys):

- U1, catalog (photo hero, stat tiles, plan picker, plan cards, topic finder): `docs/qa/courses-catalog.md`
- U2, course page (tabs, photo banner, "At a glance", Copy link): `docs/qa/courses-page.md`
- U3, teach (photo header, plan builder, section rail): `docs/qa/courses-teach.md`
- U4, outline (thumbnails, Watch inline, done ticks, expand all): `docs/qa/courses-outline.md`
- Stage 3 review: `docs/qa/courses-review.md`

## Verdict

Course pages and teach: **ready for Cedric's review on localhost**. Catalog: pending stage 4.
