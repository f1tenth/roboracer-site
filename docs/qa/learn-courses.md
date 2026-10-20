# QA: the courses pages (PR #24, `revamp/learn-courses`)

The one QA report for PR #24. Last run 2026-10-20 (stage 4, the catalog, taskmap n394; stage 3, taskmap n382, for the other pages) on Cedric's dev server
(port 4193, worktree `../roboracer-site-wt/learn-courses`), Python Playwright (Chromium) and
axe-playwright-python. History: the first port of Dhyey Shah's LMS mock (2026-09-27, the old
version of this report is in git history), a forward to his site (PR #25, undone 2026-10-20), the
interactivity study (`docs/learn/COURSES_INTERACTIVITY.md`), four stage 2 build units (appendix),
and this stage 3 review and polish (`docs/qa/courses-review.md`), then stage 4, the catalog's own
round (section "Stage 4" below).

**Catalog: stage 4 done and checked.** Cedric reviewed the merged pages on 4193 on 2026-10-20: the
course pages are good (4 weeks especially); the catalog got another round: the class leaderboard
at the top (Spielberg, pure pursuit, top 5), the numbers counting up, the plan bars in the logo
gradient, "Pick your length" reworked as an ink centrepiece, and the page no longer scrolls itself
to the board.

## What the pages are now

- **`/learn/courses`** (`Courses.tsx`): a photo band (the ICRA 2026 car at speed, right 62% from
  lg) with the headline's last words in the logo gradient and eight stat tiles riding its edge that
  count up on arrival; 01 "Race what you learn": the ESE 6150 board's replay of the top 5 on
  Spielberg (pure pursuit, Follow car on) beside the header and the top-5 table, a link to
  `/race#leaderboard`; 02 "Pick your length" on ink: the picker in the header, the ladder with the
  plan bars in the logo gradient over modules A to G, the summary with the one solid CTA, three
  photo cards whose top rule is their share of the gradient; 03 Penn as the one published
  offering; 04 the outline with the topic finder above it; 05 what the course gives as icon tiles;
  06 teach it; the shared Join block.
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

## Stage 4: the catalog (2026-10-20, taskmap n391 to n394)

Cedric, after seeing the merged pages on 4193: the class leaderboard from `/race` at the beginning
of the page; every violet number ticking up like a billboard, as on the other big pages; the plan
bars in the logo gradient ("the more you learn the better"); "Pick your length" with more visual
appeal. Mid-round, two rulings: the page must not scroll itself down to the leaderboard, and the
board shown is the top 5 on Spielberg, pure pursuit, with Follow car on.

| commit | what |
|---|---|
| `6b5b998` | Section 01 "Race what you learn": `Leaderboard` gains a `feature` prop (the section header in the grid's first cell, the replay beside it from lg and before the table on phones, the link "More lap times on the race page" to `/race#leaderboard`). `/race` unchanged (same 1,080 px section, five rows). Copy in `courses.json` `catalog.leaderboard_heading`, from Penn's offering and the `/race` lead; no new fact |
| `77966b2` | The eight stat tiles and the teach strip count up: StatTicker's time-mode count is shared as `TickerValue` (1.2 s once fully in view, 0.15 s stagger per tile, width reserved to the final string, mono digits), fed by new `value_number` and `suffix` beside each display string; the count runs only while they spell the string exactly, and the string is the no-JS and reduced-motion text. Members follow `community.json` (`members` 3500, `members_display` "3,500+"). The course pages show no big numbers (only small tab count badges), so nothing changed there. `/research` and `/about` still count |
| `a4ecace` | `bg-gradient-scale` in `index.css` (an `@utility`): cyan, the logo's magenta at 4/7 (where the 10-week plan ends), violet. Ink twins `LINK_INK` and `INK_NOTE`, `LearnLink on="ink"`, a colour prop on `CourseIcon` |
| `43e1ad5` | "Pick your length" on ink (`Section variant="ink" edge tight`), because the logo gradient is the logo's ink colouring and its cyan end is 1.9:1 on paper. The picker in the header's action slot; the ladder as the figure: module letters in badges keyed by their colour on the scale (a picked plan's modules fill with it), each plan's bar one gradient over all seven columns clipped to the modules it reaches (4 weeks stays cyan, 10 weeks is the logo's cyan into magenta, 15 weeks runs on into violet), dashed hairlines over the rest, labs and race rows (the picked plan's light up), column guides; the summary ruled under it with the one solid "Open the N-week course"; the plan cards as photo cards on ink (4:3 from lg, on their side 768 to 1023) with the plan's share of the gradient as the top rule (2/7, 4/7, 7/7 of the modules). The bars draw left to right once in view (transform only, 0.15 s apart); under reduced motion they stand drawn. Picked bar full strength, others at 25%; labels at full contrast |
| `5ad5754`, `e6d0c8c` | **The page scrolled itself to the leaderboard** (Cedric). Cause: the board's player opens as a modal dialog with Play autofocused (`replay.js`), and Chrome scrolls the embedding page to a focus inside a cross-origin frame: about 800 px a second after load, since the frame mounts at load here. `inert` and `visibility: hidden` on the frame do not stop it (tested). `useFocusGrabGuard` puts back the one scroll that follows focus entering the frame without a Tab or a press in the page and without the pointer over the replay, before paint, and hands focus back to the page (the last focus, else the top). Old headless Chromium never reproduced it; new headless (`channel="chromium"`) does, so the checks below use it. The cure is upstream (`docs/LEADERBOARD.md`, question 6 b) |
| `5669520`, `8010915` | **The catalog's board: top 5, Spielberg, pure pursuit** (Cedric). A `BoardPin` (board slug, rows, replay) from `courses.json` over the loaded config, so the pick, the Levine / Spielberg switch and the fallbacks work as on `/race`, which keeps lab 4. Five rows. Follow car is the player's own default on a track this big (no URL parameter exists); `aria-pressed="true"` read in the frame. Its own posters RACE-LB-03/04 (the RACE-LB-01 recipe; its phone dialog is 696 px tall, not 647, so a replay config may carry `posters.narrow_height`) |

### Checks (stage 4)

New-headless Chromium (`s4-qa.py`, `s4-keys.py`, `s4-scrolltest.py`, `s4-guardcheck.py` in the
scratchpad), Cedric's dev server on 4193. Catalog states: idle (after 6 s with no input: counters
finished, board loaded, replay playing), 10 weeks picked with "RRT" in the finder, `?plan=4-weeks`
restored with "model predictive", "MPC" and "particle", 15 weeks picked with a miss; plus `/learn/teach`
and `/race`. 1440x900, 768x1024, 390x844.

| check | result |
|---|---|
| `scripts/rr.sh check` (lint, `tsc -b`, build) | CHECK OK |
| axe, 18 states (6 per width) | 0 violations of any impact |
| Console from site code | none. Third-party only: the board frame's 404 on `data/archive/index.json` and "Blocked autofocusing" (known), and the Join block's YouTube embed "No available adapters." |
| Failed requests | only the board frame's `data/archive/index.json` |
| The page moves by itself | never: cold load, reload and a client navigation from `/learn/courses/4-weeks` hold `scrollY` 0 for 6 s at 1440x900, 1440x700, 1280x720, 768x1024 and 390x844; a requestAnimationFrame sampler never sees another offset (nine runs); a wheel over the replay during load still scrolls (960 px) |
| Focus after load | back on the page (body) at every size; the first Tab goes to the nav, not the player. On `/race` a reader paging down with Space keeps paging the site while the player plays |
| Board | Lab 5: SLAM and Pure Pursuit, Spielberg selected, top 5 of 14; the frame shows "Top 5 / Spielberg, fastest clean lap", five cars, Follow car pressed, at 1440, 768 and 390. `/race`: lab 4 follow the gap, five rows |
| Counters | the tiles end on 7, 23, 10, 3, 12, 3,500+, 90+, 20+ (the display strings); 0 to final with the 0.15 s wave; the final strings from the first frame under reduced motion |
| CLS on load | catalog 0.0002 (1440), 0.0002 to 0.001 (768), 0.0005 (390); teach 0 to 0.0001; `/race` 0.0008 to 0.0028 (font swap in the nav, unchanged code). The tiles reserve their final width; the board draws its skeleton rows and the replay box at its final size before the laps arrive |
| Finder | "RRT" 2 matches (Lecture 11, Module D), "model predictive" 3, "MPC" 3, "particle" 3, "zzqx" the empty state with the module buttons |
| `?plan=` | `/learn/courses?plan=4-weeks` restores the pick; the arrow keys move the picker and the address follows (`?plan=10-weeks`) |
| One h1, overflow | 1 h1; 0 px horizontal overflow in every state |
| Images | every `img` in `main` has alt, width and height; every one below the first screen is `loading="lazy"` except the shared Join block's 47 post thumbnails, which mount only near the viewport (`NearViewport`) |
| One solid violet button per viewport | pass in all states (walked in half-viewport steps; the picked segment and "Selected" are spans, selected states) |
| Reduced motion | catalog and teach at 3 widths: no text invisible, counters final, bars drawn (no transform), the replay a Spielberg poster with a play disc |
| Keyboard only | catalog at 1440: nav, crumb, Pick a course, Teach the course, then the replay (17 stops inside the player), its two links, the two board chips, the race-page link, the picker (arrow keys pick), Show all three, the three row links, Open the 10-week course, the three card toggles and links: 20 stops in `main`, every one ringed and in view; at 390, 22 stops, the same |
| Links added | the board's Spielberg and Levine replay links, the Spielberg board JSON, `/race`, the two posters: 200 |
| Files over 1.5 MB | none; this round adds two WebP posters, 38 KB and 28 KB |

Heights (full page after a walk, Join block and footer included): catalog 9,140 / 11,834 / 14,410
(1440 / 768 / 390), from 8,279 / 10,269 / 12,671 after stage 3: the leaderboard section is new.
"Pick your length" is about as tall as before but the figure fills it (1,370 px at 1440, 1,805 at
768, 2,636 at 390).

Captures (git-ignored, `docs/qa/learn-courses/`, read back): `s4-<state>-<w>.png` full page
(`catalog`, `catalog-10w-rrt`, `catalog-plan4-mpc`, `catalog-15w-miss`, `teach`, `race`),
`s4-catalog-<w>-reduced.png`, `s4-teach-<w>-reduced.png`, `s4-replay-playing-<w>.png` (the
replay in the viewport: full-page captures draw the cross-origin frame blank at 768 and 390),
`s4-keyboard-picker-<w>.png`, `s4-keyboard-cards-<w>.png`.

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

From stage 4 (the catalog):

13. **"Pick your length" on ink.** A dark showpiece section on the paper page, because the logo
    gradient is the logo's ink colouring (its cyan end is 1.9:1 on paper). Keep, or a paper version
    (the 4-week bar would be pale cyan on white)?
14. **The leaderboard section's words**: "In class / Race what you learn" and "Penn teaches this
    course as ESE 6150. Its students race each lab in the grading simulator, and these are their
    best clean laps, replayed." (ours, from the Penn offering and the `/race` lead). The replay
    heading says "Top 5, pure pursuit" because it follows the Levine / Spielberg switch.
15. **"More lap times on the race page"** goes to `/race#leaderboard`, which shows lab 4 (follow
    the gap), a different board. Fine, or link the board's own Spielberg page instead?
16. **The board-side fix**: the site's guard works around the player's autofocus; the cure is no
    autofocus when framed, in `RoboRacer-Class/leaderboard` (`docs/LEADERBOARD.md` question 6).
    Who can change that repo?
17. **The cards' top rule** is the plan's share of the modules (2/7, 4/7, 7/7), as the ladder's
    bars are, not of the weeks (4/15, 10/15, 15/15).
18. **The outline's "0 of 29 done" meter** is the one violet number that does not count up: it is
    the reader's own tick count, live. Fine?

## Appendix: the stage 2 unit notes

Each unit's own QA, decisions and questions (their LABELS lists are now `courses.json` keys):

- U1, catalog (photo hero, stat tiles, plan picker, plan cards, topic finder): `docs/qa/courses-catalog.md`
- U2, course page (tabs, photo banner, "At a glance", Copy link): `docs/qa/courses-page.md`
- U3, teach (photo header, plan builder, section rail): `docs/qa/courses-teach.md`
- U4, outline (thumbnails, Watch inline, done ticks, expand all): `docs/qa/courses-outline.md`
- Stage 3 review: `docs/qa/courses-review.md`

## Verdict

Course pages, teach and the catalog: **ready for Cedric's review on localhost**.
