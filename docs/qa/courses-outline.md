# QA: courses outline (U4 "Outline: watch, tick, expand")

2026-10-20, branch `revamp/courses-outline` (from `revamp/learn-courses` at `7dfbeae`),
taskmap n387. Spec: `docs/learn/COURSES_INTERACTIVITY.md` sections 2 to 5, plus
Cedric's visual brief of 2026-10-20 relayed by the orchestrator ("not interactive and
stand out and eye-catching at all ... no images, colors are way too bland"), which
supersedes section 2's "accent as hairline, selected states in ink" for these pages.
Verdict: **PASS** on the unit's acceptance list; Cedric's review on localhost pending.

## What was built

| File | What |
|---|---|
| `src/components/learn/CourseOutline.tsx` | Same props (`outline`, `modules`, `showLinks`); `Courses.tsx` and `Course.tsx` render it unchanged. Toolbar above the folds (meter, Expand / Collapse all, Clear, the local-only note); module heads with a violet letter badge, a "2 of 3 done" chip and, while closed, a stack of the module's lecture thumbnails; each lecture and tutorial a tile (thumbnail or number tile, label, coursekit link, assigned labs, Watch, Slides, a real "done" checkbox); labs and races with violet and magenta rules. The first module opens by default. Folds are controlled `<details>`, so closing one (or Collapse all) stops its video. Laid out with container queries, so it fits the catalog's full width and the course page's column alike (and U2's tab panel) |
| `src/components/learn/LectureWatch.tsx` (new) | `LectureThumb`, `WatchButton`, `SlidesLink`, `LecturePlayer`, `RecordingStack`; the player is the site's `YouTubePlayer` from `ui/YouTubeFacade` |
| `src/hooks/useLectureProgress.ts` (new) | One store per page over `localStorage` `rr.courses.done.v1` (JSON array of hrefs), `useSyncExternalStore`, every read and write in try/catch with a write probe, memory fallback with `persistent: false`, other tabs synced by the `storage` event, the key removed when empty |
| `public/data/courses.json`, `src/lib/data.ts` | `OutlineItem.video_id?` and `slides_url?` (the only type change); `checked` 2026-10-20 |
| `docs/learn/tools/harvest_lecture_media.py` (new) | The harvest (below); dry run by default, `--write` atomic, `--check-links` |
| `docs/learn/COURSES_CONTENT.md` | Schema row for the two fields; "Lecture media" section with source, method and the two exceptions |
| `docs/ASSET_MANIFEST.md` | CO-01: the hotlinked thumbnail pattern (nothing committed) |

## Harvest result

From each item's coursekit page (`href`), run 2026-10-20 (`python3 -I ... --cache <scratch>`):

- **video_id: 14 of 14**, each confirmed by YouTube oEmbed (200, title, author "xLAB for
  Safe Autonomous Systems"): Lectures 1 to 8, 9 (optional), 10, 12, 13; Tutorials 1, 2.
  The videos' own titles use an older numbering (Lecture 8 is "F1TENTH L09 - Particle
  Filters"); the site shows the coursekit's titles.
- **slides_url: 24 of 25**. Lectures 9 (optional), 20 and 21 embed a "Publish to the web"
  deck, linked as `https://docs.google.com/presentation/d/e/<id>/pub`; the rest as
  `.../d/<id>`. Every deck checked to open on docs.google.com without a sign-in.
- **Failed: Tutorial 3** (ROS 2 and tf2) embeds a deck that answers **HTTP 410** (deleted):
  no `slides_url`, no Slides link, `slides` left true. A coursekit fix.
- **Lecture 9 (optional)** embeds three videos (the lecture and two "Scan Matching Lab"
  parts); `video_id` keeps the lecture (`tuQXuTe8KK4`).
- **Link check**: all 105 URLs in the file answered 200 except the two known exceptions
  (slide-request form 404, Slack invite 403); `www.upenn.edu` refuses a browser user agent
  from a script, so the script retries a 403 with a plain one.

## LABELS introduced (stage 3 moves them into courses.json)

`CourseOutline.tsx`: `expandAll` "Expand all", `collapseAll` "Collapse all", `meter`
"{done} of {total} done in this outline", `moduleDone` "{done} of {total} done", `mark`
"Mark {label} as done", `done` "Done", `local` "Ticks are saved in this browser only.
Nothing is sent.", `blocked` "This browser is blocking storage, so these ticks will not be
kept. Nothing is sent.", `clear` "Clear ticks", `recorded` "recorded" (fallback for a
recording without an id; none today), `assigns` "assigns {labs}".

`LectureWatch.tsx`: `watch` "Watch", `close` "Close", `watchName` " {name}" (sr-only),
`closeName` " the video of {name}" (sr-only), `playerTitle` "{name} (recorded lecture)",
`onYouTube` "Open on YouTube", `recordedNote` "Recorded lecture from the coursekit",
`slides` "Slides", `slidesName` " for {name}" (sr-only), `recordedCount` "{n} recorded".
`{name}` is "Lecture 3: Rigid body transformations".

## For Cedric's visual brief (what was added)

- **Pictures**: each recorded lecture and tutorial shows its own YouTube thumbnail
  (`i.ytimg.com` mqdefault, srcset hqdefault, 320x180 set, lazy) beside its row, with a
  play disc in the corner so the slide title stays readable; a closed module shows a stack
  of its thumbnails and "N recorded". Lectures without a recording get a violet-tint tile
  with their number, so the column of pictures lines up.
- **Colour**: letter badges filled `rr-violet` (A to G); Watch a violet-outlined pill with
  a stroke play glyph, filled on hover and while open; the meter's count in violet display
  type and its bar `rr-violet` on `paper-200`; checked boxes filled violet with a white
  tick and the tile tinted with a violet border; the module chip neutral at zero, magenta
  tint with `rr-magenta-deep` text once something is ticked, filled violet with a tick when
  the module is complete; labs ruled violet, races magenta.
- **Liveliness**: tiles lift 0.125rem with `shadow-card-hover` on hover (Micro, 180 ms; off
  while a video plays in the tile); the thumbnail zooms 4% on hover; the tick scales in;
  the meter bar slides; an opened fold and an opened player fade in (`@starting-style`,
  measured mid-fade in Chromium 151). All of it off under reduced motion.
- Kept: no gradients, no emoji, nothing over a picture but the disc, tokens only.

## Decisions where the spec left a choice

1. **Watch is one click.** With the thumbnail already on the row as the poster, Watch (or
   a click on the thumbnail) mounts the player at once, playing with sound, as the /news
   "Play the video" button does. The thumbnail is a duplicate mouse target, out of the tab
   order and hidden from assistive tech (the /news pattern), so a row announces one Watch.
2. **Clear clears the outline on screen**, not the whole key: on a plan page it leaves
   ticks for lectures that plan does not list (tested: Lecture 17 survived Clear on the
   10-week page, then Clear on the catalog emptied and removed the key).
3. **The module chip is neutral at zero** and turns accent once something is ticked, so
   colour means progress rather than seven identical magenta chips on a first visit.
4. **The first module starts open** (Dhyey's pattern), so the outline shows pictures
   without a click; Expand / Collapse all is one toggle button.
5. **The checkbox sits top-right of each tile**, first in the tile's tab order; its
   visible "Done" hides below a 28rem outline width (the box alone, still 44px).
6. **Tutorial 3 shows no "slides"** word or link: its deck is gone (410).
7. **Container queries** instead of window breakpoints inside the outline, so the course
   page column (and U2's tab) gets the stacked layout rather than a cramped side column.

## Checks

| Check | Result |
|---|---|
| `scripts/rr.sh check` | green (lint + build) |
| Console | no errors or warnings from site code; the only messages are a warning from inside the YouTube iframe ("No available adapters.") and, only during the axe runs, a postMessage origin warning (axe messaging the cross-origin frame) |
| Network before a click | 0 requests to youtube.com / youtube-nocookie.com / googlevideo; 14 `i.ytimg.com` thumbnails (lazy, about 10 to 20 KB each). After clicking Watch: the youtube-nocookie.com embed and its assets (22 requests) |
| Ticks survive a reload, show on every page | 6 ticked on the catalog; after reload the 10-week page shows the 5 it lists ("5 of 17 done in this outline"), at 1440, 768 and 390 |
| Clear | course page cleared its 5, left Lecture 17; catalog Clear emptied it and removed the key; Clear is then disabled |
| Storage blocked (`localStorage` getter throws SecurityError) | ticks toggle in memory (2 ticked, meter "2 of 29"), the note reads "This browser is blocking storage, so these ticks will not be kept. Nothing is sent.", gone after reload, no console error (1440, 390) |
| One video at a time | opening a second Watch leaves one iframe; closing its module or Collapse all leaves none |
| Both pages render the new outline, props unchanged | catalog 29 items, 10-week page 17, Penn 29; `Courses.tsx` and `Course.tsx` untouched |
| Hit areas at 390 (touch, `pointer: coarse` true) | checkbox 44x44, Watch 96x44, Slides 64.5x44, Expand all 125x44, Clear 114x44 |
| axe, folds open + a tick + a video open | 0 violations of any impact: catalog 1440, catalog 390, 10-week page 1440 |
| Reduced motion | tile `translate` none on hover, transitions none on tile, meter and tick; ticks and Watch still work. Motion-ok: tile lifts `0px -1.5px` |
| Keyboard only | Tab: Expand all (Enter opens 7 folds) > summary A > "Mark Lecture 1 as done" (Space ticks, meter "1 of 29") > lecture link > Watch (Enter opens the player; the button becomes "Close the video of ...", `aria-expanded=true`) > Slides > the player; Enter on Close removes it and keeps focus. Every stop `:focus-visible` with the 2px violet ring |
| CLS | 0 on load and 0 after ticks, Expand all and a video, at all three widths |
| No TODO / TBA, no dhyeyshah.com | none on the three routes |
| No new dependency, no file over 1.5 MB | none (thumbnails are hotlinked, nothing committed) |
| One solid CTA per viewport | the nav's "Start here" stays the one solid violet button; the badges are not controls, and filled Watch / checked boxes / complete chips are states, as the brief asks |

Checks run with Python Playwright (Chromium 151) and axe-playwright-python against the dev
server on port 4197; scripts and JSON results stayed in the scratch dir.

## Screenshots (git-ignored, in the worktree's `docs/qa/courses-outline/`)

Stitched viewport walks of the whole outline (nav cut from later frames):
`cat-1440-3-open-ticks-video.png`, `cat-768-3-open-ticks-video.png`,
`cat-390-3-open-ticks-video.png` (all folds open, six ticks, Lecture 3 playing).
Single viewports: `cat-<w>-1-initial.png` (first visit), `cat-1440-2-closed-stacks.png`
(closed modules with their thumbnail stacks), `course-10w-<w>-4-ticks-after-reload.png`,
`cat-1440-5-storage-blocked.png`, `cat-390-5-storage-blocked.png`,
`cat-1440-6-reduced-motion.png`, `cat-1440-7-keyboard-focus.png` (ring on Watch).

## Open questions

1. **Keep the ticks?** (section 6 item 2). They are local, labelled, clearable.
2. **Tutorial 3's deck is deleted** (410) on the coursekit page: worth a coursekit fix.
3. **Lecture 9 (optional) has two more videos** (the scan-matching lab, parts I and II).
   One `video_id` per item today; show them too?
4. **Thumbnails load before a click** (from i.ytimg.com, as /news does); only the player
   waits for the click. Fine, or should the pictures wait for a click as well?
5. **For stage 3 / U2:** if the Outline tab can be hidden while a video plays, the player
   keeps playing out of sight; U2 should unmount the panel or close the fold on tab change.
