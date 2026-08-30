# Requests from Stream 1 (race) to the director

Stream 1 owns `src/pages/Race.tsx`, `src/components/race/**`,
`public/data/upcoming_events.json`, `public/data/past_races.json`,
`public/media/race/**`, `docs/qa/race.md`. Everything below is outside that
set, so it is written down here instead of edited.

## 0. Where this stream's work actually lives (read first)

The harness isolated this builder into
`/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/.claude/worktrees/agent-a0deb9d87c69cb19e`
and refused every write to the shared checkout, so the work could not be done
in the shared tree as the brief asked. That worktree arrived checked out at old
`main` (`4ea2e09`), i.e. with the whole revamp missing; it was detached onto
`revamp/pages-v1` tip `2b2d3d2` before any edit.

Before editing, every owned file was diffed against the shared checkout and
**none differed**, so the diff applies cleanly. Copy these out:

```
src/pages/Race.tsx
src/components/race/RaceTimeline.tsx
src/components/race/SeasonChain.tsx
src/components/race/eventState.ts        (new)
src/components/race/racePhotos.ts        (new)
src/components/race/useNow.ts            (new)
public/data/upcoming_events.json
public/media/race/{columbia2019,cpsiot2019,cpsweek2018,esweek2018,iccas2025,icra2026,iv2026}.webp   (new)
docs/qa/race.md
```

Eight files owned by other streams were mirrored **read-only** into the
worktree so QA rendered against the real current shell (`src/App.tsx`,
`src/index.css`, `src/components/NavBar.tsx`, `RouteBoundary.tsx`,
`src/components/ui/CommunityJoin.tsx`, `Marquee.tsx`, `src/pages/Landing.tsx`,
`src/lib/lazyWithRetry.ts`). They were never edited. Do not copy them back.

`docs/qa/race/**` holds the screenshots, axe JSON, link table and the
clock-test evidence. `docs/qa/**/*.png` is git-ignored, so keep the worktree
until the captures have been looked at.

## 1. `src/lib/data.ts`: fold four fields into `UpcomingEvent`

`upcoming_events.json` now carries fields the shared type does not know about.
`src/components/race/eventState.ts` reads them through a local intersection
type (`SeasonEvent`) so this stream did not have to touch a file it does not
own. Please add them and delete the local widening:

```ts
export type UpcomingEvent = {
  // ...existing
  /** End instant, so a race can compute its own concluded state. */
  ends_at?: string;
  venue?: string;
  /** Where to watch while the race runs. */
  stream_url?: string;
  stream_status?: "confirmed" | "unconfirmed";
  /** Provenance for starts_at / ends_at and for stream_url. */
  schedule_note?: string;
  stream_note?: string;
};
```

## 2. JS disabled renders nothing (whole app, not just /race)

With JavaScript off, `/race` returns the empty SPA shell: no `h1`, title falls
back to `RoboRacer`, zero readable content. `index.html` has no `<noscript>`
block. This is true of every route, so it is an `index.html` / build-config
decision, not a page fix. The pages-v2 definition of done asks for "JS disabled
still readable", so either:

- add a prerender step (the routes are static enough for `vite-plugin-ssg` or a
  puppeteer prerender at build time), or
- accept a `<noscript>` block in `index.html` that names the site, links
  `/rules`, the Slack invite and the current race site, and say so in the DoD.

Stream 1 has no opinion on which; both are outside its files.

## 3. `docs/ASSET_MANIFEST.md`: seven rows to fold in

Written here rather than into the manifest because three harvest agents write
that file concurrently and this builder is in a separate worktree, so an edit
would have to be merged by hand anyway.

All seven: EXIF-straightened, centre cover-cropped to 16:9, encoded by
`scripts/media.sh photo ... --width 800 --budget 150k`, output 800x450 WebP.

| id | file | WxH | bytes | what it shows | credit | provenance | permission |
|---|---|---|---|---|---|---|---|
| RACE-T-01 | public/media/race/cpsweek2018.webp | 800x450 | 42704 | competitor reaching over the barrier for a car on the carpeted track | **TODO(content)** | `_harvest/pick/race/cpsweek2018.jpg` (A2) | pending A2's table |
| RACE-T-02 | public/media/race/esweek2018.webp | 800x450 | 71998 | competitors behind the barrier, arms raised | **TODO(content)** | `_harvest/pick/race/esweek2018.png` (A2) | pending A2's table |
| RACE-T-03 | public/media/race/cpsiot2019.webp | 800x450 | 64890 | a car on an outdoor asphalt track beside a red and white kerb | **TODO(content)** | `_harvest/pick/race/cpsiot2019.jpg` (A2) | pending A2's table |
| RACE-T-04 | public/media/race/columbia2019.webp | 800x450 | 60710 | the field in a group photo behind a row of cars | **TODO(content)** | `_harvest/pick/race/columbia2019.jpg` (A2) | pending A2's table |
| RACE-T-05 | public/media/race/iccas2025.webp | 800x450 | 63478 | a large group inside the taped track in the exhibition hall | Photo: RoboRacer organizers (via Cedric Hollande) | `_harvest/cedric-media/The4thF1TenthCompetitionKorea.jpg` (A1) | own media, allowed |
| RACE-T-06 | public/media/race/icra2026.webp | 800x450 | 41066 | a car cornering on the raised wooden track between orange tube barriers | Photo: Felix Jahncke | `_harvest/drive/2026-icra/Media/Felix Jahncke/` (A1) | own media (organizer media set), allowed |
| RACE-T-07 | public/media/race/iv2026.webp | 800x450 | 90182 | competitors with a checkered flag behind the barriers, cars lined up | Photo: RoboRacer organizers (via Cedric Hollande) | `_harvest/cedric-media/IV_Group_Picture.jpeg` (A1) | own media, allowed |

`docs/media/RACE_PHOTOS.drive.md` (A1, 2024+) landed at 19:11 and supplied the
credits for T-05 to T-07. `docs/media/RACE_PHOTOS.web.md` (A2, 2023 and
earlier) never landed, so T-01 to T-04 still have no recorded photographer —
their two declared sources (the old f1tenth.org pages and the Wayback pulls)
are "allowed without asking" under the media skill, but the credit line is
still `TODO(content)`. **Fill those four before this reaches production**, and
re-check every alt string in `src/components/race/racePhotos.ts` against A2's
table when it arrives.

### One pick deliberately not used: `icra2025`

A1 delivered `_harvest/pick/race/icra2025.jpg`, a frame at 92.0 s of
`https://www.youtube.com/watch?v=wPHYLAnpMOU`, credited "Video: The Robotics
Club (YouTube @madeautonomous)", with a burned-in `@madeautonomous` watermark.

That is a third party's copyrighted footage, and permission status is
`not-asked`. CLAUDE.md rule 8 and the media skill both say community media is
used only once permission is recorded, so ICRA 2025 keeps its placeholder tile.
This is the one case where the "render it with an unverified tag" convention
does not apply: a mono tag fixes an unverified *fact*, not the use of someone
else's video. To ship it: ask @madeautonomous, record `granted <date, by whom,
scope>` in the manifest, crop the lower-left watermark, then

```
/home/cedric/.venvs/ml/bin/python3 <scratchpad>/race-encode.py icra2025
```

and add `icra2025` with its alt to `src/components/race/racePhotos.ts`.

A1's table also records `none found` for thirteen 2024-2025 events (every race
site reuses one shared template hero, which is a studio car photo, not an event
photo). Those rows are placeholders by fact, not by omission.

## 4. Recurring chore, not automated this session

After IFAC 2026 ends (Aug 27, 2026 Busan time) run
`node scripts/build-world-map.mjs` so `events_map.json` moves IFAC from the
upcoming set into the held set. The race page does not depend on it for the
live/concluded label (that is computed from the instants), but the timeline
only lists an event once the map calls it held, and the hero's competition
count is `max(number)` over the held set.

## 5. Not requested, just flagged

`Button variant="primary"` renders violet, not the `rr-magenta` the design
system calls "THE interactive accent" (D1/D2). Consistent site-wide, so it
looks deliberate; noting it only in case it is not.
