# Pages v1 (session 9): Race, About, News, Research

Status: contract. Written by the director, 2026-08-23, on `revamp/pages-v1`
(branched from `revamp/v1.0`). It governs the four non-landing React pages and
the people data model behind the About page. `docs/NON_LANDING_AUDIT.md` is the
evidence base; where this file and the audit differ, this file is the decision
and the audit is the reason.

Cedric is away for this session. Every decision that would otherwise have
waited is made here, recorded on the taskmap node it belongs to, and listed in
the final report. Section 12 is the live change log.

## 0. Session rules

- Milestones on the map are the streams, chunks are the sections of this file,
  steps are the concrete changes. Blocked only if a human answer is genuinely
  required; otherwise decide, note it, report it.
- Two pull requests. #16 `Landing v1.0` (`revamp/v1.0` -> `main`) and #17
  `Pages v1` (`revamp/pages-v1` -> `revamp/v1.0`). Both drafts. Nothing is
  merged this session and nothing touches `main`.
- Out of scope: `/build`, `/course`, `/learn`. They stay iframes of the old
  documentation sites (`CLAUDE.md` rule 9). `/chat` and `/assembly` unchanged.
- Ownership while the three builders run: About owns `src/pages/About.tsx` and
  `src/components/about/**`; News owns `src/pages/News.tsx` and
  `src/components/news/**`; Research owns `src/pages/Research.tsx` and
  `src/components/research/**`. Everything shared - `App.tsx`, `Layout.tsx`,
  `NavBar.tsx`, `Footer.tsx`, `Landing.tsx`, `rules.css`, `index.css`,
  `src/lib/*`, `src/components/ui/*` - is the director's alone. A builder that
  needs a shared change asks for it and never edits it.
- Environment: Playwright is Python-only (`/home/cedric/.venvs/ml/bin/python3`);
  captures go through a CDP session, never `full_page=True`; never `pkill -f`;
  every file write is atomic (`<file>.tmp` then replace) because a dev server
  watches the tree; never start anything on 5173 or 4242.

## 1. What these four pages have in common

They are reading pages. The landing sells; these answer. Same visual language,
calmer motion.

- **Same shell.** `<Section>` at `width="page"` (`--container-page`, 1800px),
  the same left edge as every landing section. `content` (72rem) only for
  long-form prose.
- **Same section headers.** `SectionHeader` with `index` ("01", "02", ...),
  `title` (the section's *name*: "Rules", "People", "Partners"), `subtitle`
  (the headline), `lead` (the description), optional `action`. Numbering
  restarts at 01 on every page.
- **Same type scale and spacing** as the landing. No page-specific sizes.
- **Motion.** GSAP + ScrollTrigger through `useGSAP` and `src/lib/motion.ts`.
  `Reveal` for entrances. No pinning on reading pages except the Race hero.
  Every animation is wrapped in `gsap.matchMedia()` on `MOTION_OK_QUERY` and
  the static layout is the readable one. **Never** wrap a callback that fires
  on a scrub tick in `contextSafe` - see section 2.
- **Accent rule.** Buttons solid violet, no glow. Strong cyan and magenta stay
  in the logo plus the two accepted exceptions (the lit platform title, the
  partner-logo cast). The purple/pink gradient cards these pages ship today go
  away entirely; they are replaced, not patched.
- **Accessibility is part of done.** Exactly one `<h1>` per page plus a
  document title, semantic landmarks, alt text on every image, visible focus,
  AA contrast measured **at rest** and not on hover, keyboard-reachable
  everything. About and Race ship two `<h1>`s today; both go to one.
- **Media discipline.** Every image `loading="lazy"` with explicit `width` and
  `height`; every video a poster; WebP/AVIF; nothing over 1.5 MB into git.
  Partners render from `image_rest`/`image_hover`, never the originals.
- **Unverified facts are visible, not hidden.** A fact whose source is still
  being confirmed renders with a small mono tag next to it. Nothing is gated
  out of the build because it is unverified, and nothing is hidden on
  localhost.

## 2. Two shell fixes that landed first (done)

Recorded here because every page in this session depends on them.

- **Client-side navigation blanked the whole site.** Not a basename or 404
  problem: an exception thrown while the landing unmounted. GSAP's
  `Context.add` does `prev.data.push(self)` on every call with no dedup, so the
  world-map ticker's `contextSafe` `swap`/`flash` callbacks - which fire on
  every scrub tick - put two of `WorldMapChapter`'s contexts into each other's
  `data`. `Context.getTweens` then recursed until the stack overflowed, and
  with no error boundary the throw unmounted the React root, so every later
  navigation painted white until a reload. Fixed by making those two plain
  functions with an explicit `killTweensOf` cleanup, plus `RouteBoundary` (a
  route-level error boundary keyed on the pathname) and a scroll reset +
  `ScrollTrigger.refresh()` on every navigation. Commit `4cac1ac`.
- **`rules.css` leaked to the whole site.** `.rules ol, ul` was unscoped *and*
  unlayered; an SPA never unloads a route chunk, so one visit to `/rules` gave
  every list on every page 20px of padding until a full reload, and being
  unlayered it outranked every Tailwind utility. Now fully scoped and inside
  `@layer components`; the raw `<style>` block injected through
  `public/rules.md` is gone. Commit `4cac1ac`.

## 3. Race (`/race`)

The page the revamp exists to serve: it turns a reader into a competitor. Built
first and by hand, because the other three copy its rhythm.

**Structure** (section numbering as rendered):

| # | Section | What it is |
|---|---|---|
| — | Hero | IROS 2026 spotlight: `media/race/race-iros2026-hero-1272.mp4` behind the competition name, `dates_headline`, `dates_secondary`, a live countdown to `registration_deadline`, and two buttons: Register (solid violet) and Rules |
| 01 | Enter | How to compete: the corrected `/rules`, the registration form, the qualification-video deadline, the Slack channel |
| 02 | The 2026 season | The remaining chain from `upcoming_events.json` - IFAC 2026 (Busan, Aug 24-27), VTC 2026 Fall (Boston, Sep 6-9), IROS 2026 (Pittsburgh, Sep 28-30) - as a chain, not a card grid |
| 03 | Every race so far | Timeline of the 40 sourced events in `events_map.json`, grouped by year, newest first, each with its ordinal number where it has one |
| 04 | Who competes | `teams.json`: ten teams with photos and results, each with a mono `unverified` tag while `status: verify` |

**Content source.** `public/data/upcoming_events.json` (already carries
`spotlight`, `dates_headline`, `dates_secondary`, `registration_deadline`,
`register_url`, `starts_at` - all four currently unused),
`public/data/events_map.json` (40 numbered, source-cited events),
`public/data/teams.json`, and `.claude/skills/roboracer-content` for anything
not in the JSON. `past_races.json` is superseded by `events_map.json` for the
timeline; it stays on disk only until nothing reads it.

**Countdown.** Reads `registration_deadline` ("September 5, 2026") from the
JSON, never a literal in the component. It counts days, and it degrades to the
plain date under reduced motion and with JS off. After the deadline it says the
deadline has passed rather than counting negative.

**Media source.** `media/race/race-iros2026-hero-1272.mp4` for the hero (poster
required), team photos from `media/team/`, and `highlights.json` for the season
section if it needs images. No new binaries over 1.5 MB.

**The eleven broken links.** Seven relative `*.html` paths resolve against
`/race` into the SPA 404 (`iros2020.html`, `ifac2020.html`, `columbia2019.html`,
`montreal2019.html`, `torino2018.html`, `porto2018.html`, `pittsburgh2016.html`).
They are pages of the old site, which is still served from the org's GitHub
Pages, so each is repointed at `https://f1tenth.github.io/<file>` once that URL
is confirmed to answer 200. One empty `href` reloads the page and is removed.
Three domains are dead and already logged in `docs/EVENTS_VERIFICATION.md`
(`germany-race2022.f1tenth.org` 404, `icra2024-race.f1tenth.org` and
`iros2024-race.f1tenth.org` NXDOMAIN); each gets an archive URL if one resolves,
otherwise it renders as **unlinked text with a mono tag saying the page is
gone**. Rule: no anchor on this page leads nowhere, and nothing is silently
dropped.

**Landing patterns reused.** `NextRaceSpotlight` (the hero), `Section` +
`SectionHeader`, `EventCard`, `TeamGrid`, `Button`, `MediaFrame`, `Reveal`.

## 4. About (`/about`)

Story, platform, people, partners, how to join. Replaced, not patched.

**Structure**: hero (one `h1`) / 01 What RoboRacer is / 02 The platform /
03 People / 04 Partners / 05 Join.

- **The platform section** renders from `public/data/platform.json` (four rows,
  already used by the landing). It replaces the hardcoded, broken `<ol>`.
- **People** uses the four categories in section 6. **Contributors** renders
  live from `public/data/contributors.json`, because commit history is
  self-evidencing. **Faculty and advisors**, **Crew** and **Past crew** render
  from whatever curated data exists on the day; a card with no role or no
  headshot must still look deliberate - a monogram tile and the name, never an
  empty frame or a broken image. Cedric Hollande and Ahmad Amine are Crew. The
  five active people the content skill names are the roster, **not** the 20 in
  `team_developers.json` + `team_alumni.json`, which the skill calls stale.
  Active people are labelled **Crew** and inactive **Past crew** - never
  "Alumni". Nothing blocks on a missing role or photo; every gap goes into one
  forwardable ask in the final report.
- **Partners** render from `partners.json` `image_rest` / `image_hover`, the
  optimized WebPs, never `image`. The page ships 15.33 MB of eager originals
  today, including a 2.9 MB PNG drawn at 100x100 and a 1.0 MB logo at 150x80.
  Every logo lazy with explicit dimensions.
- **`bg-brand-radial` is undefined** and `About.tsx:106` is its only occurrence
  in the repo, so the hero panel has no background: dark text sits on a
  darkened photo and is legible only on hover. Either define the token or drop
  the class for a real surface; contrast is measured **at rest**.
- **The truncated sentence** at `About.tsx:137` ("...in the design of
  autonomous.") is finished from the content skill's wording.

## 5. News (`/news`)

Rebuilt from `public/data/community.json`, whose `join.posts` array holds 11
sourced 2026 LinkedIn posts - exactly the material the feed lacks. The newest
item in `news.json` is February 2024.

- The feed must cover **ICRA 2026, IV 2026, IFAC 2026** (which starts
  2026-08-24) **and IROS 2026**.
- `news.json` carries three different date formats and cannot be sorted:
  normalise every entry to ISO `YYYY-MM-DD` and keep a display string.
- Merge the two sources into one reverse-chronological feed. Every item keeps
  its source link, its author and its credit.
- The empty state must look deliberate - a designed panel that says the feed is
  quiet and links Slack - not a blank column.

## 6. People data model

Four categories on the About page:

| Category | Source | Verification |
|---|---|---|
| Faculty and advisors | `docs/content/people.candidates.json` after Cedric approves | Public professional source URL per person |
| Crew (active organisers) | Curated; the five active people from the content skill, plus Cedric Hollande and Ahmad Amine | Cedric |
| Contributors | `public/data/contributors.json`, harvested from the GitHub org | Commit history, self-evidencing |
| Past crew | Curated; inactive organisers | Cedric |

Rules that hold for every person on the site, without exception:

1. **Public professional sources only.** GitHub public profiles, published
   paper author lists and affiliations, public lab and conference pages. Never
   a personal email, never a phone number, never anything from a private or
   personal-life source.
2. **Every person carries a source URL.**
3. **Never invent a title, an affiliation or a role.** A role that cannot be
   sourced is null and the card renders without it.
4. `docs/content/people.candidates.json` is a candidates file for Cedric to
   approve. It is not published content and nothing renders from it until he
   says so.
5. `public/data/contributors.json` ships with a JSON Schema beside it and a
   re-runnable `scripts/harvest-contributors.mjs`.

## 7. Research (`/research`)

Already rebuilt in `6d566b0`. This is a fix list, not a rebuild.

- **49 of 133 papers have no reachable link** (48 no PDF either) and render as
  dead plain text. Each gets a resolvable link (DOI, arXiv, OpenAlex, Semantic
  Scholar, publisher landing page) or renders as unlinked text with a mono tag.
- **Featured goes from 6 to the 10-25 the content skill asks for**, chosen so
  that no topic chip shows an empty grid. 8 papers have figures and 68 have
  abstracts, all currently unused.
- **Strip the LaTeX scrape artifacts**: `OPSEC\# 7248`, `Jan W\kegrzynowski`
  and the rest. A sweep, not a whitelist.
- **The two CTU theses from 2017 and 2019 are titled "RoboRacer"**, a name that
  did not exist then. Restore their original titles from the source record.

## 8. Media

Any page still looking bland pulls from `_harvest/cedric-media` and
`_harvest/drive` through the media-curator agent, run **serially**, never as an
extra parallel stream. `highlights.json` (16 live), `teams.json` photos (10
present) and `media/join/` are all on disk and wired only into the landing.
Organizer media is credited in `docs/ASSET_MANIFEST.md`, never on the tile. No
assets from neobotics.org, no stock. `_harvest/` never enters git.

## 9. Landing change in this session

The partner ribbon goes to two rows. Same 112px logos, same hover link pills,
same `:has(a:focus-visible)` pause behaviour. Director's change, on the shared
files.

## 10. Definition of done, per page

Build and lint green; 1440 / 768 / 390 reviewed plus a landscape check; no
console errors; axe zero serious or critical; reduced motion verified; JS
disabled still readable; every external link resolves; images lazy with
dimensions; no layout shift; copy matches `roboracer-content`; QA report at
`docs/qa/<page>.md`; Cedric approves on localhost.

## 11. Order of work

1. Shell fixes (done, `4cac1ac`)
2. `/rules` content (done, `2129b6b`)
3. This contract
4. People harvest - two agents, data files only, parallel with 5
5. Race, by the director. **Halt after it for Cedric's review on localhost.**
6. About, News and Research - three builders in worktrees, only after his go
7. Landing partner ribbon
8. Close: lint, build, QA all four pages, tick the checklist on #17

## 12. Change log

- 2026-08-23 — Contract written.
- 2026-08-23 — `/rules` corrected for the 31st competition and added to the nav
  (`2129b6b`). The IROS 2026 venue is named from `events_map.json`'s cited
  source, which outranks the content skill under the skill's own precedence
  rule.
- 2026-08-23 — Race rebuilt (`f6d6d58`). Thirteen broken links repaired, not
  eleven: the audit's eleven plus `korea-race24f1tenth.org` (NXDOMAIN) and
  `www.iros2021.org`, whose domain was resold and now serves a proton-therapy
  conference. Every past-race URL now lives in `data/events_map.source.json`
  as `url` + `url_status`, checked by hand. `past_races.json` is superseded
  for the timeline and no longer read by any page.
- 2026-08-23 — `upcoming_events.json` gains `registration_deadline_at` (an
  instant, so no component parses "September 5, 2026") and short names for
  IFAC and VTC. `NextRaceSpotlight` gains an optional deadline countdown, an
  internal rules link and a heading level; the landing is unchanged.
- 2026-08-23 — `Layout` sets a document title per route. The SPA announced
  every page as plain "RoboRacer", which fails the "one h1 plus a page title"
  rule on all of them at once.
- 2026-08-23 — People harvest committed (`e9b04c2`). Director's calls: the
  contributor activity window is the full eighteen months the brief asked for
  rather than the six its quoted date gave; private repos stay out of the
  published roster, which leaves ~48 private-only committers off it by design.
- 2026-08-23 — **Halt for Cedric's review of /race on localhost.** About, News
  and Research have not started.
