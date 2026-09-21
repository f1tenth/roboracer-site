# Non-landing page audit — full per-page detail

Date: 2026-08-23. Branch: `revamp/v1.0`. Read-only; no source was changed.
Ranked summary and the cross-page picture: `docs/NON_LANDING_AUDIT.md`.

Each section below is one agent's full report for one page: what renders today,
what is stale or placeholder, which media slots are empty, which data files the
page already covers, and that page's own ranked gap list.

---


# About (`/about`) — audit, 2026-08-23

Route `/about` → `src/App.tsx:30` → `src/pages/About.tsx` (158 lines, last touched **2026-08-08**, i.e. pre-revamp). `docs/HANDOFF.md:~/about` row confirms: **"old design — React page, not yet revamped."** Nothing from the v2 design system is used on this page.

---

## 1. RENDERS TODAY

Wrapper: `Layout` (`src/components/Layout.tsx:16-24`) gives `<main>`, `NavBar` (About link at `NavBar.tsx:6`), `Footer` (About link at `Footer.tsx:41`). `/about` is not in `isAltLayout`/`isHiddenRoute`, so it scrolls normally.

| # | Section | What a visitor sees | Source |
|---|---|---|---|
| 1 | Intro panel | A rounded panel with a 3-image Embla carousel behind it (auto-advances every 4 s), a black/30 scrim, a hardcoded mission paragraph in `text-gray-900`, and a 4-item ordered list (Build / Learn / Race / Research), also hardcoded. Both text blocks turn `hover:bg-white/90` on hover. | `About.tsx:106-146` |
| 2 | CTA | One button, "Read the Competition Rules" → `/rules`, styled `bg-gradient-to-r from-purple-600 to-pink-600` | `About.tsx:148` |
| 3 | Meet the Team | `<h1>Meet the Team</h1>`, then two `ProfileList` grids: "Developers" (8) and "Alumni" (12), each a 100×100 rounded photo linked to LinkedIn plus a name | `About.tsx:150-152`, `ProfileList` 40-49, `ProfileCard` 30-37 |
| 4 | Our Partners | `<h1>Our Partners</h1>`, then `PartnersList` → `<h3>Institutional Partners</h3>` + 20 logos at 150×80 linked to institution sites, each with the name below | `About.tsx:154-155`, `PartnersList` 52-66 |

**Hardcoded vs data-driven.** Sections 1 and 2 are 100% hardcoded JSX. Sections 3 and 4 are data-driven.

**Fetching.** Three raw `fetch()` calls in one `useEffect`, all bare absolute paths: `fetch("/data/team_developers.json")`, `.../team_alumni.json`, `.../partners.json` (`About.tsx:86-88`). It does **not** use the typed loaders in `src/lib/data.ts:293-297` (`loadPartners`, `loadTeamDevelopers`, `loadTeamAlumni`), which prefix `import.meta.env.BASE_URL`. Nor does it use `Partner`/`TeamMember` types from `src/lib/data.ts:26-56` — it redefines local `class TeamMember` / `class Partner` (`About.tsx:5-21`), and `useState([])` is untyped so `data.map` is `any`.

**Loading / error states.** None. `catch` does `console.error("Error fetching JSON files:", error)` (`About.tsx:97-99`) and leaves the three arrays empty, so a failed fetch silently renders three empty headed grids. No skeleton, no retry, no empty-state copy.

**Responsive.** Only Tailwind breakpoints: grids `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (`About.tsx:43, 55`) and `responsive-padding` (defined `src/index.css:264-266`). The panel uses `lg:max-w-[75svw]` / `lg:max-w-[70svw]` (`About.tsx:106-107`) — svw units for a text column, not the system container. No use of the `desktop:` variant documented in `HANDOFF.md §4`.

**Reduced motion.** **Zero handling.** `grep -c "reduced\|motion" src/pages/About.tsx` → `0`. The Embla autoplay `setInterval(scrollNext, 4000)` (`About.tsx:75`) runs unconditionally — a direct breach of CLAUDE.md rule 6 and of the design system's motion table (every pattern must sit inside `gsap.matchMedia(MOTION_OK_QUERY)`).

**Accessibility.**
- **Two `<h1>`s** on the page (`About.tsx:150` and `:154`), and **neither is the page title** — there is no "About" h1 at all. Design-system anti-pattern list: "a second h1".
- Heading order jumps h1 → h4 → h5 (`:150` → `:42` → `:35`) and h1 → h3 → h5 (`:154` → `:54` → `:61`).
- Carousel alt text is meaningless: `alt={\`Creative Piece Image ${index + 1}\`}` (`About.tsx:120`).
- Partner cards announce the name twice (`alt={partner.name}` at `:59` + `<h5>{partner.name}` at `:61`).
- No `<section>` landmarks, no `aria-labelledby`; the whole page is one `<div>` (`About.tsx:105`).
- No images carry `loading="lazy"` or `decoding="async"` (contrast `TeamGrid.tsx:44-45` and `LogoCloud.tsx:24-25`, which do).
- Autoplaying carousel has no pause control and no `aria-live`/`aria-hidden` management.
- Body copy readable **only on hover**: `text-gray-900` sits over the carousel images. `bg-brand-radial` (`About.tsx:106`) **is not defined anywhere** — `grep -rn "brand-radial" src/` returns only that one line — so the panel has no background; the only backdrop is images at opacity 0.3 (`src/index.css:571-577` unlayered `.embla__slide img { opacity: .3 }` beats the JSX's `opacity-20`) plus `bg-black/30` (`:129`). Dark text over a darkened photo. Contrast must be measured; the `hover:bg-white/90` on `:107` and `:132` reads as an acknowledgement that it does not pass at rest.

**Design-system primitives used: none.** No `Section`, `SectionHeader`, `Reveal`, `Button`, `MediaFrame`, `LogoCloud`, `TeamGrid`, `StatCounter`, `Marquee`, `SponsorCTA`. `grep -rn "TeamGrid\|LogoCloud" src/` matches only `Styleguide.tsx` and `Landing.tsx`. Instead the page uses legacy classes (`responsive-padding`, `space-font`, `embla__*` — all in the block `src/index.css:220-222` labelled *"LEGACY below: styles the pre-revamp pages still depend on. Delete each block when its page migrates"*) and one-off Tailwind (`rounded-lg` where the token is `--radius-card: 0.25rem` at `src/index.css`, `shadow-inner`, raw `text-gray-900`, `from-purple-600 to-pink-600`).

The CTA at `About.tsx:148` is a **gradient button** — explicitly banned by design-system D2 ("the navy blue-900 CTA is retired; buttons are solid magenta-on-ink / ink-on-paper, never gradient") and by the anti-pattern list ("gradient buttons"). It also uses raw `<a href="/rules">`, not react-router `Link` (no `react-router` import in the file), so it hard-navigates and drops the SPA state.

The intro paragraph is centered and runs well past two lines — anti-pattern: "centered paragraphs over two lines".

---

## 2. STALE OR PLACEHOLDER

| Severity | Exact string / location | Problem |
|---|---|---|
| Blocker | `team_developers.json` (8 entries) rendered at `About.tsx:151`; `team_alumni.json` (12) at `:152` | `roboracer-content/SKILL.md:37`: *"`team_developers.json` (8) and `team_alumni.json` (12) are **stale**. Active roster (Cedric, 2026-08-20: use these five now): Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, Ahmad Amine, Hongrui 'Billy' Zheng."* Same line: *"Never publish a person without a role and a photo or a deliberate avatar"* and *"until then the roster renders only in dev/styleguide contexts."* The page publishes 20 stale people with **no roles at all**, and four of them (`Wesley Yee`, `Lejun Jiang`, `Ravi Konkimalla`, `Karel Smejkal` — `team_alumni.json`) render `crew/avatar.svg`. Also cross-confirmed by `docs/CONTENT.md:31-32`. |
| Blocker | Missing entirely from `About.tsx` | *"mention 'formerly F1TENTH' **once on the About page** and in SEO metadata"* (`roboracer-content/SKILL.md:13`). `grep -rn "F1TENTH" src/pages/About.tsx` → no match; the string appears nowhere in `src/` except Research/iframe URLs. |
| Major | `"...emphasize the analytical skills to recognize and reason about situations with moral content in the design of autonomous."` — `About.tsx:137` | Sentence is **cut off mid-clause** ("design of autonomous."). Already logged in `docs/CONTENT.md:30` as CHANGE. |
| Major | 20 partners rendered from `partners.json`, `About.tsx:155` | `roboracer-content/SKILL.md:35`: *"`partners.json` lists 20 institutions; `public/partners/` holds about 70 logos."* Verified: `ls public/partners/*.png *.jpg` → **67** files vs **20** JSON entries. 47 unused logos (antwerp, bu, colorado, costarica, halmstad, iowa, kansas, kit, kth, kyungpook, lehigh, lund, maryland, monterrey, munich, nagoya, nebraska, northcarolina, …). `docs/content/partners.proposed.json` already exists with the expansion. |
| Major | `<h3>Institutional Partners</h3>` (`About.tsx:54`) + `<h1>Our Partners</h1>` (`:154`) as a 4-col grid with names under logos | Skill line 35: *"Partners are institutions that use the platform, **not sponsors**. Present them as a **marquee or logo cloud, alphabetical, not tiered.**"* The current grid is JSON-order, not alphabetical (`LogoCloud.tsx:13` does the sort the page is missing), and reads as a sponsor wall — the design-system anti-pattern *"walls of equal-size logos presented as sponsors"*. |
| Major | No sponsors section anywhere in `About.tsx` | Skill line 36 and `docs/CONTENT.md:38`: About must carry the zero-sponsor state. `SponsorCTA` (`src/components/ui/SponsorCTA.tsx`) is built and unused on this page. |
| Major | No featured-teams section | `roboracer-content/SKILL.md:60`: *"Rendered as TeamGrid below the sponsors block on landing **and about**."* `TeamGrid` exists and is used on `Landing.tsx:324`, not here. |
| Minor | `"RoboRacer is an international community of researchers, engineers, and autonomous systems enthusiasts."` (`About.tsx:108`) | Skill line 12 says *"researchers, engineers, and **students**"*. "autonomous systems enthusiasts" is not in the skill. |
| Minor | Intro omits the story the skill asks for | Skill line 57: About must cover *"Story (2016 Penn, formerly F1TENTH, why 1/10 scale, open source), what the platform is (car, sim, courses, races, research), the people, the partners, the sponsors, how to join."* Present today: mission sentence + 4 pillars + people + partners. Missing: 1/10 scale, open source, sim, sponsors, how to join. Ready-written copy sits in `docs/CONTENT.md:186-190` ("About story opening") and has not been used. |
| Minor | No stats anywhere on the page | Skill line 31-32: "90+ universities", "20+ countries", "1,000+ publications", "30 competitions held". `StatCounter` (`src/components/ui/StatCounter.tsx`) is unused here. |
| Minor | No Slack / join CTA | Skill line 15 gives the confirmed invite; `CommunityJoin` (`src/components/ui/CommunityJoin.tsx`) exists and is unused here. |
| Minor | `contrast-[1]` (`About.tsx:33`) | Identity filter — dead class. |
| Minor | `class TeamMember` / `class Partner` with a constructor never called (`About.tsx:5-21`) | Dead code; `Partner` has no constructor yet is used as a type only. CLAUDE.md rule 10. |

**External links.** All are institution homepages from `partners.json` and LinkedIn profile URLs from the team JSONs — not fetched here, none look malformed. One to check by hand: `Tom Jose` in `team_alumni.json` has **no `linkedin` field**, so `ProfileCard` renders `<a href={undefined}>` (`About.tsx:32`) — a link to the current page. That is a real dead link, not a suspicion.

**No lorem/TODO markers in the page copy itself**, and no invented dates or counts — the page states no dates or numbers at all, which is itself the gap.

---

## 3. MEDIA SLOTS (all checked on disk)

Every referenced file **exists**; the problem is weight and the absence of the slots the target design needs.

**Carousel** (`About.tsx:23-27`) — all three present:

| File | Size |
|---|---|
| `public/about/upenn-ppl-min.jpg` | 569 KB |
| `public/about/image-2.JPG` | **1,636 KB — over the 1.5 MB rule-3 ceiling** |
| `public/about/image-3.JPG` | 1,433 KB |

Two of the three have generic filenames (`image-2.JPG`, `image-3.JPG`), unnamed subjects, no entry I could find tying them to `docs/ASSET_MANIFEST.md` provenance, and the alt text is `"Creative Piece Image N"`. All three are JPEG, not WebP/AVIF (CLAUDE.md rule 3).

**Crew headshots** — all 20 referenced files exist in `public/crew/`. Three are grossly oversized for a 100×100 render:

| File | Size | Rendered at |
|---|---|---|
| `crew/billy.png` | **2,916 KB** | 100×100 |
| `crew/Roshan_Benefo.jpeg` | **2,184 KB** | 100×100 |
| `crew/Malavika_Manoj.jpg` | 1,265 KB | 100×100 |
| `crew/madhur.jpg` | 889 KB | 100×100 |
| `crew/Tom_Jose.jpeg` | 793 KB | 100×100 |

`crew/avatar.svg` (4 KB) is the placeholder stub, used by 4 alumni.
Unused-but-present crew files: `Kalluraya.jpeg`, `Nalamwar.png`, `WilliamHoganson.jpg` (they belong to `testimonies.json`).

**Partner logos** — all 20 `image` paths exist. `partners/duke.png` is **1,021 KB** rendered at 150×80. Every entry also has `image_rest` (tinted WebP, ~6–38 KB) and `image_hover` (colour WebP) under `partners/tint/` and `partners/color/` — **all 40 files verified present, and About uses none of them**; it loads the heavy originals instead.

**Measured page payload:** **15.33 MB of images, every one eager-loaded** (no `loading="lazy"` anywhere in the file). Roughly 3.6 MB carousel + 9.6 MB crew + 2.3 MB partners.

**Slots the target design implies with no asset at all:**
- Hero / opening image or video for the About story — none. `public/media/hero/` (60 MB) holds the FPV loop and posters; nothing About-specific.
- Sponsors section media — n/a (zero-sponsor CTA needs no media).
- Team photos with roles — `roboracer-content/SKILL.md:37` marks roles and headshots `TODO(content)` for the five active people. **No headshots exist on disk for Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, or Ahmad Amine.** Only Billy has one (`crew/billy.png`, unoptimized).
- Featured-teams imagery — already produced and unused here: 10 files in `public/media/team/` (`team-*-800.webp`, 31–115 KB each), one per `teams.json` entry.
- `/media/hero/car-studio.webp` and `car-studio-cutout.webp` are noted in `HANDOFF.md §2.3` as never produced, if About wants a car still.

---

## 4. DATA COVERAGE

| File | Status on `/about` | Detail |
|---|---|---|
| `partners.json` | **Consumed** — `About.tsx:88, 96, 155` | 20 entries, all fields populated (`name`, `website`, `image`, `image_rest`, `image_hover`). Missing: the other 47 institutions whose logos are on disk (`docs/content/partners.proposed.json` has them staged). `image_rest`/`image_hover` are ignored by the page. |
| `team_developers.json` | **Consumed** — `About.tsx:86, 94, 151` | 8 entries, fields `name`/`linkedin`/`image` only. Missing: `role`, `affiliation`, `status`. Skill says the whole file is stale. |
| `team_alumni.json` | **Consumed** — `About.tsx:87, 95, 152` | 12 entries. Same three fields. `Tom Jose` has no `linkedin` → broken anchor. 4 entries fall back to `avatar.svg`. Skill says stale. |
| `teams.json` | **Could consume, does not** | 10 entries, schema `{name, institution, country, website, social, logo, since_year, highlights, status, photo}`. All 10 have a real `photo` under `public/media/team/`. **All 10 are `status: "verify"`**; 5 have `institution: "TODO(content): unknown…"` and `country: null` (404 Racers, LAMARRacing, VAUL, UBM-Tom/Atlas, Brake Check Buddies). `TeamGrid` renders unverified entries with a mono "unverified" tag (`TeamGrid.tsx:74-78`), so it is safe to mount. Required by `roboracer-content/SKILL.md:60`. |
| `testimonies.json` | **Could consume, does not** | 8 entries `{author, institution, image, quote}`. Loader exists (`src/lib/data.ts:295`) but **nothing in `src/` calls it** — the file and the `FloatingTestimonials` component referenced by `docs/CONTENT.md:23` are both gone from the codebase. Images: `Rosa Zheng`/`Khai Nguyen`/`Ira J. Stokes`/`Michael Yuhas`/`Nicolas Baumann` under `public/testimonials/` (22 files there vs 8 used); `Nalamwar.png`, `Kalluraya.jpeg`, `WilliamHoganson.jpg` under `public/crew/`. Note `image` paths have **no leading slash** (`docs/CONTENT.md:23` already flags this) and one contains a smart quote (`"MS Robotics’23"` as an institution, which is a role not an institution). |
| `community.json` | **Could consume, does not** | `{members: 3000, members_display: "3,000+", timezones: 25, continents: 6, updated: "2026-08-21"}` plus `join.photo`, `join.post`, `join.youtube`, `join.posts` (11 community posts with posters in `public/media/join/posts/`). Directly serves the "how to join" section the skill requires. `continents: 6` is flagged unverified in its own `source` field. |
| `platform.json` | **Could consume, does not** | 4 rows (build/learn/race/research) with `n`, `title`, `body`, `href`, `linkText`, and a `media {type, src, poster, caption, credit}`. This is the **data-driven version of the exact hardcoded `<ol>` at `About.tsx:132-145`**, with better copy and real media in `public/media/platform/` (2.7 MB). Rendered by `PlatformPanel.tsx` on the landing. |
| `highlights.json` | **Could consume, does not** | 16 entries, **all `status: "live"`**, all with `poster`, `caption`, `credit`, `aspect`, `event`. `HighlightReel` (`src/components/ui/HighlightReel.tsx`) consumes it. Relevant if About wants a "what a race looks like" band; optional. |
| `publications.json` | **Could consume, does not** | 133 items, 10 tags, 6 `featured: true`, `scholar_query_url` present, `updated: 2026-08-21`. About only needs the "1,000+ publications" line + link, not the list. |
| `events_map.json` | **Could consume, does not** | `updated: 2026-08-22`, 40 events (33 `held`), 24 countries, 24 regions with SVG paths. Backs the "20+ countries" claim visually via `WorldMapChapter`. Heavy (81 KB) — optional for About. |
| `upcoming_events.json` | Irrelevant / optional | 3 entries; IROS 2026 carries `spotlight: true` and the final D8 copy. Belongs on `/` and `/race`, not About. |
| `past_races.json` | Optional | 34 `{name, url}` entries — could back a "30 competitions held" stat. |
| `news.json` | Irrelevant | `/news`. |

---

## 5. TOP GAPS (ranked)

1. **Blocker — the page publishes a roster the content skill calls stale, with no roles.** 20 people at `About.tsx:151-152`; skill line 37 names five active people and forbids publishing anyone without a role. *Fix: cut the two `ProfileList` grids, replace with the five-person roster once Cedric supplies roles and headshots; until then render nothing or a "team page coming" line.*
2. **Blocker — page is entirely off the design system.** No `Section`/`SectionHeader`/`Button`/`Reveal`; legacy `responsive-padding`/`space-font`/`embla__*` classes; a banned gradient CTA at `About.tsx:148`; `bg-brand-radial` is an undefined class so the panel has no background at all. Breaks CLAUDE.md rule 5. *Fix: rebuild the page against the landing's section pattern, paper base, `<Section width="page">`.*
3. **Blocker — two `<h1>`s (`About.tsx:150, 154`) and no page `<h1>`,** plus h1→h4→h5 heading jumps and `alt="Creative Piece Image 1"`. Fails CLAUDE.md rule 7 and the definition of done. *Fix: one `<h1>About RoboRacer</h1>`, demote the rest to `SectionHeader` h2s, write real alt text.*
4. **Blocker — no `prefers-reduced-motion` handling; the carousel autoplays unconditionally** (`About.tsx:72-77`). Fails CLAUDE.md rule 6. *Fix: drop the auto-carousel (the design system has no "auto-carousel" pattern and bans carousels without narrative purpose) or gate the interval on the media query and add a pause control.*
5. **Blocker — body copy is legible only on hover.** `text-gray-900` over the darkened carousel with no panel background (`About.tsx:106-111`), with `hover:bg-white/90` papering over it. *Fix: opaque paper surface; if photos stay, a real scrim per the design system's "text over photos without a scrim" anti-pattern.*
6. **Major — 15.33 MB of eager images**, incl. `crew/billy.png` 2.9 MB and `crew/Roshan_Benefo.jpeg` 2.2 MB at 100×100, `partners/duke.png` 1.0 MB at 150×80, `about/image-2.JPG` 1.6 MB (over the rule-3 ceiling). *Fix: WebP at render size, `loading="lazy" decoding="async"` with explicit dimensions; consume `partners.json`'s existing `image_rest`/`image_hover` WebPs.*
7. **Major — "formerly F1TENTH" appears nowhere,** despite `roboracer-content/SKILL.md:13` requiring it once on this page. *Fix: open the story with `docs/CONTENT.md:187`.*
8. **Major — three required sections are missing:** sponsors (zero-sponsor `SponsorCTA`), featured teams (`TeamGrid` + `teams.json`, all 10 photos already produced), and how-to-join (`community.json` + Slack invite). *Fix: mount the three existing primitives with the existing data.*
9. **Major — partner presentation contradicts the skill:** 20 of 67 logos, JSON order not alphabetical, headed "Institutional Partners" under a grid that reads as sponsor tiers. *Fix: `LogoCloud` or `Marquee`, and merge `docs/content/partners.proposed.json`.*
10. **Major — broken sentence shipped in production copy:** `"...in the design of autonomous."` (`About.tsx:137`). *Fix: replace the hardcoded `<ol>` with `platform.json`, whose four rows already carry finished copy, links and media.*
11. **Minor — dead link:** `Tom Jose` has no `linkedin`, so `About.tsx:32` renders `<a href={undefined}>`. *Fix: conditionally render the anchor.*
12. **Minor — engineering hygiene:** raw `fetch("/data/...")` instead of `src/lib/data.ts` loaders (breaks under a non-root `BASE_URL`), local `class TeamMember`/`class Partner` duplicating `src/lib/data.ts:26-56`, untyped `useState([])`, `contrast-[1]` no-op, `<a href="/rules">` instead of router `Link`, no loading or error UI. *Fix: swap to `loadPartners`/`loadTeams`, delete the local classes, add an error state.*

---

# Race (`/race`) — audit

Route `/race` → `src/App.tsx:33` → `src/pages/Race.tsx` (68 lines, unrevamped). Related route `/rules` → `src/App.tsx:35` → `src/pages/Rules.tsx` + `src/pages/rules.css` + `public/rules.md`.

## 1. RENDERS TODAY

**Shell.** `src/components/Layout.tsx:16-24` wraps every route: fixed `<nav aria-label="Main">` (`src/components/NavBar.tsx:185`, `position: fixed` at `src/index.css:324`), one `<main>`, `<Footer/>`. Race is not in `isAltLayout`/`isHiddenRoute`, so it gets the normal shell. No `<h1>` naming the page, no landmark inside the page, no per-route `<title>`/meta (`index.html:7` is a single static `<title>RoboRacer</title>`).

**Whole page is two ungrouped card grids** (`src/pages/Race.tsx:32-67`):

| Section | What a visitor sees | Evidence |
|---|---|---|
| Top padding | `w-full responsive-padding py-24 flex flex-col items-center gap-8` — 96px clears the ~66px fixed nav; no `Section` primitive, no `py-section` rhythm | `Race.tsx:33` |
| Dead code | A commented-out Google Calendar iframe block sits at the top of the JSX | `Race.tsx:34-36` |
| "Upcoming Events" | `<h1>` (base style 2.5rem, `src/index.css:229-234`), then a 1/2/3/4-col grid of 3 anchor cards from `upcoming_events.json`: title (h3), dates, location. Each is `target="_blank"` to the event site. | `Race.tsx:37-52` |
| "Past Events" | A **second `<h1>`**, then a 1/2/3/4-col grid of 34 anchor cards, each just a centered name string. No dates, no city, no year grouping, no ordinal, no results. | `Race.tsx:54-65` |

**Data-driven?** Yes for the card text, no for structure. Both grids fetch raw JSON in one `useEffect` — `fetch("/data/past_races.json")` (`Race.tsx:20`) and `fetch("/data/upcoming_events.json")` (`Race.tsx:25`) — bypassing the typed loaders in `src/lib/data.ts` (which already export `UpcomingEvent` with all the spotlight fields, `src/lib/data.ts:4-24`). Local `class Race` / `class UpcomingEvent` are declared as ad-hoc types (`Race.tsx:3-13`).

**Loading / error states:** none. Initial state is `[]` (`Race.tsx:16-17`), so first paint is two headings over empty space; a fetch failure only calls `console.error` (`Race.tsx:23,28`) and leaves the page permanently blank below the headings. No skeleton, no empty-state copy, no retry.

**Responsive:** grid breakpoints only (`Race.tsx:38,55`). No use of the `desktop:` variant, no `max-w-page` container — at 1920 the cards stretch the full `2xl:px-32` width, unlike every landing section.

**Reduced motion:** not handled. `hover:scale-[1.01] transition-transform` (`Race.tsx:45`) and `transition-all` (`Race.tsx:61`) run unconditionally; there is no `usePrefersReducedMotion` import (compare `src/components/ui/NextRaceSpotlight.tsx:3,49`).

**A11y:** **two `<h1>`s** on one page (`Race.tsx:37` and `Race.tsx:54`) — violates CLAUDE.md rule 7 and the design-system anti-pattern list. No `aria-labelledby` section grouping, no `<section>` at all. Anchors carry `rel="noopener noreferrer"` correctly. No images → no alt-text issue, but also no media. `key={index}` on past races (`Race.tsx:57`).

**Design-system usage: zero.** No `Section`, `SectionHeader`, `EventCard`, `NextRaceSpotlight`, `Button`, `Reveal`, `MediaFrame`. `EventCard` (`src/components/ui/EventCard.tsx`) and `NextRaceSpotlight` (`src/components/ui/NextRaceSpotlight.tsx`) exist and are only used by `Styleguide.tsx:247,111` and `Landing.tsx:297`. The card styling is the retired v1 palette: `bg-gradient-to-br from-purple-100 via-pink-50 to-gray-100` + `shadow-lg` + `text-gray-900` (`Race.tsx:45,61`) — no token (`rr-*`, `paper-*`, `ink-*`, `text-strong`) is used anywhere on the page. `space-font` (`src/index.css:269`) is the legacy alias for `--font-display`.

**`/rules` (`src/pages/Rules.tsx`)**: fetches `/rules.md` (`Rules.tsx:15`), renders a marked TOC and body through two `dangerouslySetInnerHTML` (`Rules.tsx:46-47`). Loading state is the literal string `"Loading..."` (`Rules.tsx:9`); error state is `"<p>Failed to load Markdown.</p>"` (`Rules.tsx:36`). The `<nav>` TOC has no `aria-label`. The page has no `<h1>` of its own; the markdown supplies two (`public/rules.md:27` `# 1. General`, `:38` `# 2. In-person (physical) competition`). `/rules` is **not in the nav** (`src/components/NavBar.tsx:5-13`); its only in-site entry point is `src/pages/About.tsx:148`.

## 2. STALE OR PLACEHOLDER

### Race page

| Claim | Evidence | Verdict |
|---|---|---|
| The IROS 2026 next race is rendered as **one of three identical cards** with no spotlight, no countdown, no deadline, no CTA | `Race.tsx:39-51`; the spotlight fields sit unused in `public/data/upcoming_events.json:20-30` (`spotlight: true`, `dates_headline`, `dates_secondary`, `starts_at`, `registration_deadline`, `register_url`, `rules_url`) | **Blocker.** Skill: "must be featured on the roboracer.ai homepage **and race page**"; "Lead with dates, city, and 'Register by Sep 5'." |
| `"dates": "September 28-30, 2026"` | `upcoming_events.json:19` | Dates and venue are **correct** vs skill ("competition Mon Sep 28 to Wed Sep 30, 2026"; Pittsburgh, PA). Format is off: skill wants `"September 28 to 30, 2026"` in prose / `"Sep 28-30, 2026"` in cards. Minor. |
| `"register_url": "https://iros2026-race.roboracer.ai/registration.html"` | `upcoming_events.json:24` | Skill names the form `https://forms.gle/nhDytwxKEy4EpUHa6` as the registration path. Flag for Cedric — likely fine (the page fronts the form) but unverified here. |
| `"rules_url": "https://iros2026-race.roboracer.ai/"` | `upcoming_events.json:25` | Points at the race-site root, not a rules doc, and **not** at `/rules` — arguably correct, since `/rules` is stale (below). |
| VTC 2026 `"url": "https://events.vtsociety.org/vtc2026-fall/"` | `upcoming_events.json:14` | Skill lists `https://vtc2026-race.roboracer.ai` (VERIFY) and notes it is co-hosted with Neobotics. Divergence, unresolved. |
| No **fee** and no **prize amount** anywhere | grep of `Race.tsx` + `upcoming_events.json` | **Correct** per skill ("discounted registration, details to come", never a dollar amount; no prize amounts). |
| No sponsors block | — | **Correct** current state (zero sponsors), but `SponsorCTA` (`src/components/ui/SponsorCTA.tsx`) is not rendered; the landing comment at `Landing.tsx:311` says the zero-sponsor CTA "lives on /about and /race for now" — it does not. Major. |
| Missing entirely: format ("multi-agent, up to 4 vehicles", "final rules to be updated soon"), orientations Aug 26 / Sep 16 2026, organizing committee, "30 competitions held" | — | Skill "Next race: Format / Orientations / People", "Scale statements". Major. |
| ICRA 2026 Vienna reduced to one 4-word card | `past_races.json:6-9` → rendered at `Race.tsx:62` | Skill: "ICRA 2026 gets substantial space on landing, race, and news"; "biggest and most successful competition to date: 180+ competitors and 35 registered teams" (both VERIFY). IV 2026 podium likewise absent. Major. |
| **7 dead relative links** — `href` resolves against `/race`, e.g. `roboracer.ai/iros2020.html` | `past_races.json:112,116,120,124,128,132,136` (`iros2020.html`, `ifac2020.html`, `columbia2019.html`, `montreal2019.html`, `torino2018.html`, `porto2018.html`, `pittsburgh2016.html`); I confirmed none of these files exist anywhere under `public/` | **Blocker.** All 7 hit the SPA `public/404.html`. |
| **1 empty href** — `"RoboRacer Autonomous Racing Competition - Spring 2024 Course"` renders `<a href="">`, i.e. reloads `/race` | `past_races.json:64` | Blocker (same fix). |
| **2 NXDOMAIN links** — `https://iros2024-race.f1tenth.org/`, `https://icra2024-race.f1tenth.org/` | `past_races.json:36,56`; both confirmed dead in `docs/EVENTS_VERIFICATION.md:38,44` and raised as open question 2 (`:82`) | Blocker. |
| **1 hard 404** — `https://germany-race2022.f1tenth.org/` (Pages, no repo behind it) | `past_races.json:96`; `docs/EVENTS_VERIFICATION.md:28,83` | Blocker. |
| **1 dead domain** — `https://korea-race24f1tenth.org/` (note the missing dot; a separate domain, no longer resolves) | `past_races.json:32`; `docs/EVENTS_VERIFICATION.md:84` | Blocker. |
| `"ICCAS 2025 Race"` → `https://2025.iccas.org/` | `past_races.json:14-17` | Points at the host conference, not the race. Minor. |
| Past list has no ordinals for 32 of 34 entries and no year grouping | `past_races.json` (only the top two carry "28th"/"27th") | `docs/CONTENT.md:46` already flags: "present as a timeline grouped by year per skill". Major. |
| Dead commented-out Google Calendar iframe | `Race.tsx:34-36` | Delete (CLAUDE.md rule 10). |
| No lorem / no TODO strings, no invented sponsor/stat/person on this page | grep | Clean. |

### `/rules` — the page the race must link to

| Quote | file:line | Problem |
|---|---|---|
| `"These rules are prepared for the _24th International Roboracer Autonomous Racing Competition_"` | `public/rules.md:20-21` | IROS 2026 is the **31st**. The whole document is two race cycles old. **Blocker.** |
| `"The latest version can be found [here](http://icra2025-race.roboracer.ai/rules.html)"` | `public/rules.md:22` | Points readers away to ICRA 2025, over plain `http://`. |
| `"Date: 2026-01-10"` | `public/rules.md:24` | 7 months stale. |
| `"[registration form](https://forms.gle/FdfY9sKXREdu772u6)"` | `public/rules.md:33` | **Wrong form.** Skill: IROS 2026 registration is `https://forms.gle/nhDytwxKEy4EpUHa6`. Blocker — a team registering from `/rules` registers for the wrong race. |
| `"the _#ICRA2025_ channel on [Roboracer-teams Slack]"` | `public/rules.md:35` | Stale channel (Slack workspace URL itself matches the skill, so only the channel name is wrong). |
| `"The competition will take place inside [Georgia World Congress Center]"` | `public/rules.md:89` | Atlanta / ICRA 2025. IROS 2026 is Pittsburgh (David L. Lawrence Convention Center per `events_map.json` iros2026 `source`). **Blocker.** |
| `"two main stages – Online Qualification and Vehicle Head-to-Head Knockout Races"` | `public/rules.md:40` | Contradicts the skill's IROS 2026 format: on-site time trials into a knockout bracket, **multi-agent, up to 4 vehicles on track** — the 4-car format appears nowhere in the file. Blocker. |
| Duplicate section number `## 2.3` used twice | `public/rules.md:101` ("Practice") and `:114` ("Inspection") | Breaks the TOC's implied ordering. Minor. |
| Raw `<style>` block at the top of the markdown, injected into the live DOM via `dangerouslySetInnerHTML` | `public/rules.md:1-16` → `Rules.tsx:47` | Global `h2,h3,h4,h5,h6 { margin-top/bottom: 1rem }` leaks site-wide once `/rules` is visited in the SPA. Major. |
| `.rules ol, ul { padding-left: 20px; margin-bottom: 10px; }` — the `ul` half is **unscoped** | `src/pages/rules.css:55-58` | Once the `/rules` chunk's CSS loads it never unloads; every `<ul>` on every route gets the padding. Unlayered, so it beats Tailwind utilities (the known trap). Major. |
| `.rules ul { color: red; }` | `src/pages/rules.css:65-67` | **Every bullet list in the rules document renders red.** Not a token, not in the palette, likely a leftover debug rule. Major. |
| `.rules body { … }` | `src/pages/rules.css:1-7` | Dead selector — `body` can never descend from `.rules`. |
| `color: #FC00FF` (h2), `#0073e6` (links), `#333` (body) | `rules.css:23,70,6` | Hardcoded off-system colors; magenta text on paper also fails the AA note in the design system (use `rr-magenta-deep`). Major. |

## 3. EMPTY MEDIA SLOTS

**The Race page references zero media — no `<img>`, no `<video>`, no `MediaFrame`.** (`grep` over `Race.tsx` returns no `src=`.) So there is nothing to check for existence; everything below is a slot the design implies and the page does not fill.

Assets that exist on disk today, verified, and are **not** used by `/race`:

| Slot the design implies | Asset | On disk | Size | Currently used by |
|---|---|---|---|---|
| Race hero / next-race frame | `public/media/race/race-iros2026-hero-1272.mp4` + `race-iros2026-hero-poster.webp` | ✅ | 816 KB / 106 KB | only `src/pages/Landing.tsx:75-76`. Provenance and credit are already recorded (`docs/ASSET_MANIFEST.md:369`, V4-11, Ezio Bartocci, "NOT ASKED; Cedric owns asking"). |
| Race-day highlight reel | 16 entries in `public/data/highlights.json`, `public/media/highlights/` | ✅ all 16 `src` + `poster` paths resolve (checked) | 5.1 MB dir | only Landing |
| Team faces for "who competes" | 10 files in `public/media/team/` | ✅ all 10 `teams.json` `photo` paths resolve | 736 KB | only Landing |
| World map of the series | `public/media/map/world-land.svg` (inlined `?raw` at `WorldMapChapter.tsx:19`) | ✅ | 68 KB | only Landing |

Stub found: `public/events/placeholder.png` is the **only** file in `public/events/` — an orphaned placeholder from the old site, referenced by nothing in `src/`.

No IROS 2026-specific media exists at all: no venue photo of the David L. Lawrence Convention Center, no track diagram, no 4-car format illustration, no organizer portraits. Every "next race" visual would have to reuse ICRA 2026 Vienna footage (which is what `race-iros2026-hero-1272.mp4` already is — its caption on landing is `"the hall · ICRA 2026, Vienna"`, `Landing.tsx:81`).

## 4. DATA COVERAGE

| File | Status for `/race` | Detail |
|---|---|---|
| `upcoming_events.json` | **Consumed** (`Race.tsx:25`) — partially | 3 entries. Page reads only `title`, `dates`, `location`, `url` (`Race.tsx:47-49`). **Unused fields already present on the IROS entry**: `short_name`, `spotlight: true`, `dates_headline` ("September 28 to 30, 2026, Pittsburgh"), `dates_secondary` ("Check-in and practice September 27"), `starts_at` ("2026-09-28T09:30:00-04:00"), `registration_deadline` ("September 5, 2026"), `register_url`, `rules_url` (`upcoming_events.json:16-27`). Missing across all entries: `format`, `orientation_dates`, `organizers`, `venue`, per-event media. |
| `past_races.json` | **Consumed** (`Race.tsx:20`) | 34 entries, schema is only `{name, url}` (`src/lib/data.ts:21-24`). Missing for the timeline the skill asks for: `year`, `number`, `city`, `country`, `ends`, results/podium, media. 11 of the 34 URLs are dead or empty (§2). |
| `events_map.json` | **Could consume, does not** | 81 KB, `updated: 2026-08-22`. 40 events with `id, year, label, city, country, lat, lng, kind, status, verified, number, source` (+ `ends`, `labelDx/Dy`), plus 24 `countries` and `regions` with SVG paths. This is the year-grouped, numbered, source-cited timeline `docs/CONTENT.md:46` asks for — `past_races.json` has none of it. Consumed today only by `WorldMapChapter` (`src/components/ui/WorldMapChapter.tsx:12`, `loadEventsMap`) on Landing. Gaps: 12 of 40 events have `number: null`; 3 have `verified: false` (`icra2021-workshop`, `course2024`, plus ordinal collisions flagged at `docs/EVENTS_VERIFICATION.md:88`). |
| `teams.json` | **Could consume, does not** | 10 entries. Skill explicitly says TeamGrid renders "on race as 'who competes'". All 10 `photo` paths resolve. **All 10 are `status: "verify"`** — `TeamGrid` renders them with a mono "unverified" tag (`src/components/ui/TeamGrid.tsx:74`), so the section works today but ships unverified badges. Missing fields: `country` on 5 of 10 (404 Racers, LAMARRacing, VAUL, UBM-Tom/Atlas, Brake Check Buddies), `institution` is a literal `TODO(content):` string on 3, `website` on 6, `logo` on 8, `since_year` on all 10. |
| `highlights.json` | **Could consume, does not** | 16 entries, all `status: "live"`, all media present, all credits filled. `HighlightReel` (`src/components/ui/HighlightReel.tsx`) is built for it. 12 of 16 are race-day moments from ICRA 2026/2025 and IV 2026 — exactly the "ICRA 2026 gets substantial space on race" the skill requires. |
| `community.json` | **Could consume (weakly)** | `members: 3000`, `members_display: "3,000+"`, `timezones: 25`, `continents: 6`, `updated: 2026-08-21`, plus a `join` block with photo/LinkedIn/YouTube media. Relevant to a "join the series" close on `/race`; the Slack CTA belongs here. |
| `platform.json` | **Irrelevant as a source, relevant as a caller** | Its `race` entry (`platform.json` id `race`) links `/race` with `linkText: "See the races"` and copy "An international competition series at the major robotics conferences." The Race page must deliver on that promise. |
| `partners.json` | **Could consume** | 20 institutions with `image`/`image_rest`/`image_hover`. Skill says partners = institutions using the platform; a `/race` "who shows up" logo cloud is plausible but the skill assigns partners to landing/about. Low priority. |
| `news.json` | **Could consume, does not** | 7 items, newest **Feb 15, 2024** — 2.5 years stale (`docs/CONTENT.md:65`). Not usable for a race-results feed without new sourced items. |
| `publications.json` | **Irrelevant** | Research page. |
| `testimonies.json`, `team_alumni.json`, `team_developers.json` | **Irrelevant / stale** | Skill marks the two team files stale (8 + 12 people); active roster is 5 names, roles and headshots `TODO(content)`. |

## 5. TOP GAPS

1. **blocker — `/race` does not feature IROS 2026 at all.** The next race is card #3 of 3, with no countdown, deadline, format, or CTA, while every field needed sits unused in `upcoming_events.json:16-27`. → Rebuild the top of the page as `Section` + `SectionHeader index="01"` + `NextRaceSpotlight` fed from the `spotlight: true` entry, exactly as `Landing.tsx:297-307` already does.
2. **blocker — 11 of 34 past-race links are broken.** 7 relative `*.html` paths that 404 (`past_races.json:112-136`), 1 empty href (`:64`), 2 NXDOMAIN (`:36,:56`), 1 Pages 404 (`:96`) — all confirmed against `docs/EVENTS_VERIFICATION.md`. → Repoint or drop the URL and render those entries as unlinked timeline rows; take Cedric's answers to `EVENTS_VERIFICATION.md` questions 2-4 first.
3. **blocker — `/rules` serves the 24th competition's rules** (`public/rules.md:20`, dated `:24`), with the **wrong registration form** (`:33`), the wrong venue (`:89`), the wrong Slack channel (`:35`), and no mention of the 4-car multi-agent format. → Do not link `/rules` from the race page until Cedric replaces `rules.md`; until then point "Rules" at `https://iros2026-race.roboracer.ai/`.
4. **blocker — two `<h1>`s and no page `<h1>`** (`Race.tsx:37,54`). → One `<h1>` naming the page, the two grid headings demote to `SectionHeader` titles.
5. **major — the page is entirely off the design system.** Purple/pink gradient cards, `shadow-lg`, `text-gray-900`, no tokens, no `Section`/`SectionHeader`/`EventCard`/`Button`, no `max-w-page` (`Race.tsx:33,45,61`). Violates CLAUDE.md rule 5 and design-system D2. → Rebuild on the primitives; `EventCard` (`src/components/ui/EventCard.tsx`) is already written for both variants and is currently used only by the styleguide.
6. **major — no loading or error state.** Empty arrays on first paint, `console.error` on failure (`Race.tsx:16-17,23,28`) leaves a permanently blank page. → Switch to `src/lib/data.ts` loaders and render a skeleton plus a visible failure message.
7. **major — the past-events list is 34 flat name chips.** No years, no ordinals, no cities, no results. → Render the timeline from `events_map.json` (40 events, numbered, city/country, `verified`, `source`) and keep `past_races.json` only as the link source.
8. **major — four sections the skill requires on `/race` are missing:** race-day highlights (`highlights.json`, 16 live assets ready), "who competes" TeamGrid (`teams.json`, 10 entries), the sponsor CTA (`SponsorCTA` — `Landing.tsx:311` says it "lives on /about and /race", and it does not), and the "30 competitions held" scale line. → Add all four; they need no new assets.
9. **major — `rules.css` leaks globally and paints bullets red.** `.rules ol, ul` at `rules.css:55` is unscoped and unlayered (so it outranks Tailwind utilities once `/rules` is visited), `.rules ul { color: red }` at `:65-67`, plus a raw `<style>` block injected from `public/rules.md:1-16`. → Scope every selector, delete the red rule, strip the `<style>` block from the markdown.
10. **minor — reduced motion unhandled** (`Race.tsx:45,61` hover scale/transition). → Wrap in the motion-ok query or use `Button`/`EventCard` hovers, which already comply.
11. **minor — `/rules` is unreachable from the nav** (`NavBar.tsx:5-13`); the only link is `About.tsx:148`, itself a retired gradient button. → Link it from the race page's rules CTA once the content is current.
12. **minor — data hygiene:** VTC 2026 URL diverges from the skill's `vtc2026-race.roboracer.ai` (`upcoming_events.json:14`); ICCAS 2025 points at the host conference (`past_races.json:16`); date string format is neither the skill's prose nor its card form (`upcoming_events.json:19`); dead commented-out calendar iframe (`Race.tsx:34-36`). → JSON edits plus one delete.

---

# /research audit — `src/pages/Research.tsx`

Route: `src/App.tsx:34` (`/research` → lazy `pages/Research`), wrapped in `Layout` (`src/components/Layout.tsx:19` `<main>`; `/research` is not in `isAltLayout`/`isHiddenRoute`, so Navbar + Footer render). Nav entry `src/components/NavBar.tsx:11`.

**Note on repo docs:** `docs/HANDOFF.md:62` lists `/research` as **"old design"**. That is stale — the page was rebuilt on the design system in `6d566b0` (2026-08-22, "pages: about, race, news, rules, research and the iframe routes"). It is not a bibtex-fetching legacy page any more.

---

## 1. RENDERS TODAY

Top offset `pt-[68px] md:pt-[85px]` for the fixed nav (`Research.tsx:108`). Four `Section` blocks, all `variant="paper"`, all default `width="content"` (72rem, `src/index.css:91`) — the landing uses `width="page"`/`bleed`, so /research is deliberately narrower and text-first.

| # | Section | What a visitor sees | Source |
|---|---|---|---|
| 1 | Header | Mono eyebrow "Research" with the 4px ink marker; `h1` "1,000+ publications reference the platform" (`:121`); lead paragraph (`:123-127`); secondary Button "See the Scholar query" → `pubs.scholar_query_url` with `SCHOLAR_URL` fallback (`:104,129`); a 4-cell mono `<dl>` ledger: Curated papers / Featured / Topics / Updated (`:134-155`) | copy hardcoded, numbers data-driven |
| 2 | Featured | `SectionHeader` eyebrow "Featured", title "Selected papers" (`:161-166`); `TagFilter` chips built from `pubs.tags` (`:174`); live count + per-topic Scholar deep link (`:176-188`); 1/2/3-col grid of `PublicationCard` inside `Reveal stagger` (`:191-195`) | data-driven from `publications.json` |
| 3 | All curated | `edge` (paper-100) section; search input in the header `action` slot (`:214-227`); "N of M papers · Tag · "query"" live line (`:232-236`); year groups (`:252-270`) with a sticky mono year label at `md:` and a `<ul>` of `Row` items — title link, `authorLine` authors, mono `venue_short / venue / type · tags`, right-aligned arXiv / DOI / PDF links | data-driven |
| 4 | Contribute | "Submit your paper" + the one solid primary Button → `SUBMIT_MAILTO` (`:13,289`), mailto `contact@roboracer.ai` subject "RoboRacer publication" | hardcoded (matches skill) |

**Fetch / states.** One fetch: `loadPublications()` → `public/data/publications.json` via `loadJson` (`src/lib/data.ts:285-288, 298`), called in `useEffect` (`Research.tsx:85-87`).
- Loading: no skeleton; the ledger shows `"…"` (`:138,144,149,153`) and sections 2/3 render only their headers (`{pubs && …}` at `:172,230`). Section 3 shows nothing but its header + search box while loading.
- Error: `failed` renders one line in section 2 only (`:167-171`). **Section 3 silently renders an empty shell on failure** — no message, no fallback.
- Empty-filter states are handled: no featured for a tag (`:196-201`), no search match with a Scholar escape hatch (`:237-249`).

**Design-system compliance.** Uses `Section`, `SectionHeader`, `Button`, `Reveal`, `TagFilter`, `PublicationCard` — all from `src/components/ui/`. No page-specific palette; every color is a token (`ink-950/10`, `paper-50`, `text-strong/body/muted`, `rr-violet`, `rounded-btn|card|pill`, `py-section`) defined in `src/index.css:34-102`. Deviations from the system: no `SectionHeader index` numbering ("01 /") anywhere, unlike the landing rhythm (`roboracer-design-system` SKILL:13); the header section (`:110`) hand-rolls its eyebrow instead of using `SectionHeader`; the search `<input>` is one-off markup (no Input primitive exists); and all four sections are paper — no ink section, so the page has no surface rhythm at all.

**Motion / reduced motion.** Only `Reveal` (`ui/Reveal.tsx:32-43`): `gsap.matchMedia(MOTION_OK_QUERY)` = `(prefers-reduced-motion: no-preference)` (`src/lib/motion.ts:24`), and it uses `gsap.from`, so under reduced motion content is simply static and visible. Guard at `Reveal.tsx:31` skips the tween when children are empty. Correct.

**No-JS.** The page renders nothing without JS — SPA with no prerender (`index.html:13-15`). Same for every route; noted, not page-specific.

**Responsive.** Header 8/4 grid at `md:`, featured grid 1→2→3 cols, Row 1-col → `[1fr_auto]` at `md:`, year label sticky only at `md:` (`:260`). Search box `w-full md:w-80`.

**A11y.** Single `h1` (`:117`). Heading order h1 → h2 (SectionHeader) → h3 (card title `PublicationCard.tsx:23`) / h3 (year `:258`) → h4 (row title `:37`) — valid. Every `Section` is `<section aria-labelledby=…>` (`:110,160,207,278`). `role="group"` + `aria-pressed` on the filter chips (`TagFilter.tsx:22-40`). Two `aria-live="polite"` counters (`:176,232`). Labelled search (`:215`), `role="search"` form. Thumbnail `alt=""` with the duplicate link `tabIndex={-1} aria-hidden` (`PublicationCard.tsx:59,76-82`) — decorative, one link announced per card. Focus ring is global (`src/index.css:135`). Gaps: **no skip link anywhere in `Layout.tsx`/`NavBar.tsx`** (grep found none) — on this page the visitor tabs the whole nav before reaching content; `aria-label="Links"` on the row link list (`:53`) is vague; and the featured/list counters are `aria-live` on elements that also change identity, which can double-announce on filter change.

---

## 2. STALE OR PLACEHOLDER

The page's own copy is clean and matches the skill — the problems are in the data it renders verbatim.

- **BibTeX/LaTeX artifacts render as-is on the page.**
  - `publications.json` `joglekar-2023-data` title: `"…Using Koopman Operator: Distribution A: Approved for Public Release; Distribution Unlimited. OPSEC\# 7248"` — the literal `\#` and the export banner appear in the 2023 list (`Research.tsx:41`). Already flagged as a scrape artifact in `docs/content/featured-papers.md:13` (pick 13) and never fixed.
  - Authors: `w-kegrzynowski-2024-learning` → `"Jan W\kegrzynowski"`; `kerner-2017-software` → `"Bc Jiř\'\i Kerner"`. Rendered by `authorLine` (`src/lib/publications.ts:8-11`) at `Research.tsx:46`.
  - `vajnar-2017-model` venue: `"Master’s thesis, Czech Technical University in Prague, Faculty of Electrical~…"` — trailing `~…`; its `venue_short` is the pre-truncated `"Master’s thesis, Czech Technical Univ..."`, printed literally at `Research.tsx:48`. `lelko-2025-safe` `venue_short` is likewise `"Periodica Polytechnica Transportation..."`.
- **Two titles appear to have been renamed away from the published title.** `dusil-2019-slip` = `"Slip detection for RoboRacer model car"` and `vajnar-2017-model` = `"Model car for the RoboRacer autonomous car racing competition"` — both 2017/2019 CTU theses whose `notes` say only `"bibtex key dusil2019slip"` / `"bibtex key vajnar2017model"`. RoboRacer did not exist under that name in 2017-2019 (skill: "formerly F1TENTH"). `scripts/migrate-bibtex.py:147` copies titles verbatim from `f1tenth/roborace_publications`, so the rename came in upstream — but citing a paper under a title it was never published with is a factual error on our page. **VERIFY with Cedric / upstream before shipping.**
- **Platform name mis-cased in titles**, visible on the hero-most featured card: `"F1tenth: An open-source evaluation environment…"` (`okelly-2020-f1tenth`, featured, first card). Across the file: `F1TENTH` ×8, `F1Tenth` ×6, `F1tenth` ×3 — Scholar-style sentence-casing. Skill line 13 makes both names load-bearing on this page, so inconsistent casing reads as sloppiness rather than quotation.
- **5 entries have an empty `venue`**, so `Research.tsx:48` falls through to `p.type` and prints a bare lowercase word: `"journal"` (`moualhi-2024-experimental`, `dusil-2019-slip`, `kerner-2017-software`), `"thesis"` (`guedes-2019-robotic`, `almeida-2019-implementing`).
- **The "Featured" section lead over-promises order.** `"Recent work on the platform, newest first."` (`:165`) — there is no sort in `featuredAll` (`:91`); it is raw array order. It happens to read newest-first today only because `items` is coincidentally year-sorted descending (verified). Any `/add-paper` insertion out of order silently falsifies the lead.
- No `TODO(content)`, lorem, or dead dates in the page or in `publications.json` (grep: 0 hits). `updated: "2026-08-21"` matches the newest `added` value; two days old, fine.
- **50 of 133 entries have no `url`, `doi`, or `arxiv`** — `paperHref` returns `undefined` (`src/lib/publications.ts:28-33`) and the title renders as **plain unclickable text** (`Research.tsx:42`). 48 of those have no `pdf` either, i.e. **48 papers on the page are dead ends with no way to reach them** (`zarrar-2024-tinylidarnet`, `betz-2024-f1tenth`, `evans-2023-high`, `becker-2023-model`, `okelly-2020-tunercar`, …). 4 of them carry the arXiv id inside the venue string (`samak-2024-autonomy` → `"arXiv preprint arXiv:2402.14739"`, also `kuipers-2024-conformal`, `samak-2024-validation`, `zheng-2022-gradient`) — the link is one field-move away.
- Link hosts on the entries that do link are all reputable resolvers (`doi.org` ×49, `arxiv.org` ×31, `sciencedirect.com` ×2, `proceedings.mlr.press` ×1); PDFs on `arxiv.org` ×32, `dl.acm.org` ×4, `mdpi.com` ×5, plus single institutional hosts (`iris.unimore.it`, `pp.bme.hu`, `zora.uzh.ch`, `sba.org.br`, `ifaamas.org`) — those five are the plausible rot candidates, not fetched.
- The Scholar CTA and per-tag deep links are correct per skill line 41 (`scholar_query_url` in the JSON; `scholarTagUrl` builds `(f1tenth | roboracer) (…)`, `src/lib/publications.ts:36-39`).

---

## 3. EMPTY MEDIA SLOTS

The page references media only through `PublicationCard`'s `thumbnail` (`PublicationCard.tsx:19,56-67`). No hero image, no video, no logos.

All 6 referenced thumbnails exist on disk in `public/media/research/` (940 KB total, all well under budget):

| id | file | size | on page |
|---|---|---|---|
| `elgouhary-2026-learning` | `research-elgouhary-2026-learning-1200.webp` | 38 KB | ✅ |
| `piccinini-2026-trajectory` | `research-piccinini-2026-trajectory-1200.webp` | 37 KB | ✅ |
| `charles-2025-advancing` | `research-charles-2025-advancing-1200.webp` | 118 KB | ✅ |
| `li-2025-data` | `research-li-2025-data-1200.webp` | 54 KB | ✅ |
| `ghignone-2025-rlpp` | `research-ghignone-2025-rlpp-1200.webp` | 75 KB | ✅ |
| `okelly-2020-f1tenth` | `research-okelly-2020-f1tenth-1200.webp` | 69 KB | ✅ |

No missing files, no stubs. `width={1200} height={750}`, `loading="lazy"`, `decoding="async"` are all set (`PublicationCard.tsx:61-64`) — no CLS from images.

**Slots the design implies but that have no asset:**
- **The featured grid is 6 cards where the skill asks for 10-25** (`roboracer-content` SKILL:42) — so 4-19 thumbnail slots are simply absent. `scripts/paper_thumbs.py` exists to generate them.
- 8 `figure` assets exist (`*-fig-1600.webp`, incl. `baumann-2024-forzaeth`, `trumpp-2024-racemop`, `feng-2025-bridging` which have **no** `thumbnail`) but `/research` never reads `figure` — it is consumed only by the landing's `ResearchCarousel`. Three paid-for figures render nowhere on this page.
- `PublicationCard` has no figure-less fallback in use: `src/lib/publications.ts:75-84` `venueInitials()` was written for exactly that placeholder and **is never called from `/research`** — so a thumbnail-less featured paper renders a text-only card next to image cards, an uneven grid.
- `figureCredit` prints "Figure: X et al." under every thumbnail (`PublicationCard.tsx:91`) with no provenance entry — check against `roboracer-media` permission rules for reproducing paper figures.

---

## 4. DATA COVERAGE

| File | Status for /research |
|---|---|
| **`publications.json`** | **Consumed** — the only fetch (`Research.tsx:86` → `data.ts:298`). 133 items, all `status: "published"`, 0 hidden/candidate. Fields present: `id/title/authors/year/venue/venue_short/type/tags/featured/status/added/source/notes` on all 133; `abstract` 68, `citations` 73, `url` 83, `pdf` 54, `arxiv` 52, `doi` 52, `institutions` 39, `featured_order` 8, `thumbnail` 6, `figure` 8. **Unused by this page: `abstract` (68 entries), `citations` (73), `institutions` (39), `figure` (8), `featured_order` (8), `type` (except as a venue fallback), `added`, `notes`.** Tag histogram: systems-platform 43, RL 33, control-mpc 24, perception 20, multi-agent 19, planning 19, safety 18, sim-to-real 17, education 6, **raceline-optimization 2**. 0 untagged items, 0 duplicate ids or titles. |
| `teams.json` | **Could consume, does not.** Entries carry `institution` + `highlights`; `publications.json` carries `institutions` on 39 items — a "papers from teams you'll see on track" cross-link is available but unbuilt. `teams.json` is itself full of `TODO(content): unknown` institutions and `status: "verify"`, so it is not ready anyway. |
| `events_map.json` | **Could consume, does not.** 81 KB, keys `countries / projection / regions / viewBox / updated` — a research-geography map (39 items have `institutions`) is possible but is the landing's `WorldMapChapter` job. Low value here. |
| `highlights.json` | **Irrelevant** — competition moments, no research surface. |
| `community.json` | **Could consume, does not.** Has `members_display: "3,000+"`, `timezones: 25`, `continents: 6`, `updated`. The header ledger currently shows only paper-local numbers; the skill's scale statements (90+ universities, 20+ countries) live in the skill, not here. Minor: the ledger could carry one community number for context. |
| `platform.json` | **Irrelevant** — build/learn/race panel rows for the landing. |
| `partners.json` / `news.json` / `past_races.json` / `upcoming_events.json` / `testimonies.json` / `team_*.json` | **Irrelevant** to /research. `news.json` and the team files are also untouched since 2026-08-08 while every other data file was refreshed 2026-08-22. |

---

## 5. TOP GAPS (ranked)

| # | Severity | Gap | Fix |
|---|---|---|---|
| 1 | **blocker** | **48 of 133 papers have no reachable link at all** (no `url`/`doi`/`arxiv`/`pdf`); their titles render as dead plain text (`Research.tsx:38-44`). The page's whole job is to get people to papers. | Run `scripts/resolve_paper.py` over the 48 ids to backfill `doi`/`arxiv`/`url`; start with the 4 whose arXiv id is already sitting in the `venue` string. |
| 2 | **blocker** | **Only 6 papers are `featured: true`**; the skill requires 10-25 (`roboracer-content` SKILL:42), and 4 of the 10 topic chips (perception-estimation, multi-agent, safety, education) show an **empty featured grid** when selected — the filter's headline interaction is broken for 40% of topics. The reviewed shortlist already exists at `docs/content/featured-papers.md` (16 papers) and was never applied. | Get Cedric/Rahul to confirm the 16-paper shortlist, set `featured: true`, run `scripts/paper_thumbs.py` for the new thumbnails; guarantee ≥1 featured paper per tag. |
| 3 | **major** | **BibTeX/LaTeX scrape artifacts render verbatim**: `"…OPSEC\# 7248"` (`joglekar-2023-data`), `"Jan W\kegrzynowski"`, `"Bc Jiř\'\i Kerner"`, venue `"…Faculty of Electrical~…"`, `venue_short` values ending in a literal `"..."`. | One cleanup pass over `publications.json` (delatex + strip export banners + drop the two pre-truncated `venue_short`s), then re-run `scripts/validate-publications.py --strict`. |
| 4 | **major** | **Two titles carry a name the papers were never published under** — `"Slip detection for RoboRacer model car"` (2019), `"Model car for the RoboRacer autonomous car racing competition"` (2017). Citing a paper under a wrong title is a factual error under CLAUDE.md rule 4. | Verify the published titles with Cedric; correct in `publications.json` and, if upstream is wrong, report it to `f1tenth/roborace_publications`. |
| 5 | **major** | **The "All curated" section has no error state.** On fetch failure `failed` renders one line in section 2 (`:167-171`); section 3 renders a header and search box over nothing (`:230`), and there is no loading skeleton anywhere. | Hoist the `failed` message (and a skeleton) to both data-backed sections. |
| 6 | **major** | **No per-route metadata.** `index.html:7` is `<title>RoboRacer</title>` for every route; no description, canonical, OG/Twitter tags. A research index is exactly the page that gets shared and indexed. | Add a title/meta effect (or a tiny `usePageMeta` hook) — `/research` → "Research — RoboRacer" + description + OG. |
| 7 | **major** | **No skip link** in `Layout.tsx`/`NavBar.tsx`; keyboard users tab the full 7-link nav plus two CTAs before the h1 on every visit. Also `main` has no `id`. | Add a visually-hidden-until-focus `Skip to content` anchor to `#main` in `Layout.tsx:19`. |
| 8 | **minor** | **Featured order is unsorted** while the lead claims "newest first" (`:91` vs `:165`); correct only by coincidence of array order. | `.sort((a,b) => b.year - a.year)` in `featuredAll`, or pin an explicit order field. |
| 9 | **minor** | **5 entries print a bare lowercase `type`** ("journal", "thesis") where a venue should be (`:48`, empty `venue` on `moualhi-2024-experimental`, `guedes-2019-robotic`, `almeida-2019-implementing`, `dusil-2019-slip`, `kerner-2017-software`). | Fill the venues; failing that, title-case the fallback and label it ("Thesis"). |
| 10 | **minor** | **Rich data sits unused**: `abstract` (68), `citations` (73), `institutions` (39), `figure` (8) — three `figure` assets (`baumann-2024-forzaeth`, `trumpp-2024-racemop`, `feng-2025-bridging`) exist on disk and render nowhere on this page. `venueInitials()` exists as the figure-less card placeholder and is never called, so featured cards will be visually uneven the moment #2 lands. | Expose `abstract` on the featured card (expand/hover), `citations` as a mono line, and wire `venueInitials()` as the no-thumbnail fallback in `PublicationCard`. |
| 11 | **minor** | **Design-system drift**: no `SectionHeader index` numbering, hand-rolled eyebrow in the header section (`:113-116`), one-off search `<input>`, and four consecutive paper sections with no ink surface — the page has no rhythm against the landing's vocabulary. `PublicationCard`'s `h3` has no size class, so it falls through to the **legacy** base rule `h3 { font-size: 1.5rem }` (`src/index.css:245-249`) rather than a v2 type token. | Add `index` props, move the header eyebrow into `SectionHeader`, put an explicit type token on the card `h3`, and consider an ink "Submit your paper" section for closure. |
| 12 | **minor** | **Platform name casing inconsistent across titles** (`F1TENTH` ×8, `F1Tenth` ×6, `F1tenth` ×3) — most visible on the featured `okelly-2020-f1tenth` card. | Normalize to the published casing per paper; where Scholar sentence-cased it, restore `F1TENTH`. |
| 13 | **minor** | **No QA report** — `docs/qa/` has `landing*`, `styleguide*`, `sharpen`, but **no `research.md`**, and `docs/HANDOFF.md:62` still calls the page "old design" though it was rebuilt in `6d566b0`. Definition-of-done is unmet on paper. | Run `/qa-page research`; update the HANDOFF row to the real state. |

---

# News (`/news`) — audit

**File:** `/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/src/pages/News.tsx` (50 lines, last touched `b5cad9b` 2026-01-05). Route wired at `src/App.tsx:32` (lazy, `src/App.tsx:12`). State per `docs/HANDOFF.md:61`: **"old design"** — this page was never revamped. Design system D3 (`.claude/skills/roboracer-design-system/SKILL.md:24`) assigns it the **paper base**; it does not use the system at all.

---

## 1. RENDERS TODAY

| # | What the visitor sees | Evidence |
|---|---|---|
| — | Global chrome: `Navbar` + `<main>` + `Footer` from `Layout` (`src/components/Layout.tsx:18-22`); `/news` is not in `isAltLayout`/`isHiddenRoute`, so both render. Nav marks News active (`src/components/NavBar.tsx:12,193-203`). Nav is opaque paper here (`HERO_ROUTES` = `/`, `/styleguide` only, `NavBar.tsx:24,112`). | |
| 1 | One centered column: `<h1>News</h1>`, then a vertical stack of up to 7 cards, `max-w-3xl`, `pt-32 pb-10`, legacy `.responsive-padding` (`src/index.css:264-266`). No `<section>`, no eyebrow, no lead, no CTA, no footer band. | `News.tsx:38-48` |
| 2 | Each card is a full-card `<a target="_blank">` containing a 128px-tall thumbnail, `<h3>` title, `platform - date` line, and description. | `News.tsx:15-26` |

**Data:** fully data-driven. Fetches `"/data/news.json"` on mount (`News.tsx:3,31-36`). Hardcoded copy is exactly one string: the `h1` "News" (`News.tsx:40`) and the loading text (`News.tsx:45`).

**Loading / error:** the only state is `articles.length > 0` (`News.tsx:42`). A failed fetch logs to console (`News.tsx:35`) and the page shows **"Loading news…" forever** — there is no error state and no empty state.

**Responsive:** `flex-col md:flex-row` on the card, `text-center md:text-left` (`News.tsx:17,19`). That is the whole responsive story; no type scaling, no container beyond `max-w-3xl`.

**Reduced motion:** nothing animates (`transition-all` on hover shadow only, `News.tsx:17`), so rule 6 is satisfied by omission, not by design.

**JS disabled:** the page is blank — content only arrives via `fetch` in `useEffect`. Same as every route in this SPA, but worth noting for the "usable with JS animations disabled" bar.

**a11y:**
- One `h1` ✅ (`News.tsx:40`), landmarks come from `Layout` ✅.
- ❌ `alt={title}` on the thumbnail (`News.tsx:18`) duplicates the `<h3>` immediately after it inside the same link — a screen reader hears the headline twice.
- ❌ No `width`/`height` and no `loading="lazy"` on any thumbnail (`News.tsx:18`) — violates the definition-of-done ("images lazy-loaded with dimensions set; no layout shift"). All 7 images are remote, so CLS is guaranteed.
- ❌ No `aria-label`/visually-hidden text saying links open in a new tab.
- Focus: relies on the browser default ring; the system's focus treatment is never applied.

**Design-system primitives used: zero.** No `Section`, `SectionHeader`, `Reveal`, `Button`, `MediaFrame`, `TagFilter`. Concretely off-system:
- `bg-gradient-to-br from-purple-100 via-pink-50 to-gray-100` (`News.tsx:17`) — an invented purple/pink palette. Violates CLAUDE.md rule 5 and design-system D1/D2 (`SKILL.md:22-23`: magenta is the accent, gradients are for display text and the logo only).
- `rounded-lg` / `shadow-lg hover:shadow-xl` (`News.tsx:17`) instead of `rounded-card` (1.25rem) + `shadow-card`/`shadow-card-hover` (`SKILL.md:38,42`).
- `text-gray-600` / `text-gray-500` (`News.tsx:22,45`) instead of `text-body`/`text-muted` tokens.
- `text-3xl` on the h1 (`News.tsx:40`) = 1.875rem. Tailwind utilities beat the `@layer base` h1 default (`src/index.css:227-233`), so the page h1 renders far below `text-display-xl` (`SKILL.md:40`).
- No mono eyebrow, no numbered index, no hairline rules — none of the v2 "engineering publication" vocabulary.

**Bypasses the typed data layer.** `src/lib/data.ts:294` exports `loadNews()`, and grep shows **no consumer anywhere in `src/`** — it is dead code. Worse, its type is wrong: `NewsItem` declares `image?: string` (`src/lib/data.ts:42`) while every record in `news.json` uses `thumbnail`. `News.tsx:6-13` redeclares its own local interface. Also `News.tsx:3` hardcodes `"/data/news.json"` instead of `${import.meta.env.BASE_URL}data/...` as `loadJson` does (`src/lib/data.ts:286`) — fine today (`vite.config.ts` `base: "/"`) but drift.

---

## 2. STALE OR PLACEHOLDER

**The feed is 2.5 years dead.** Newest item is `"date": "Feb 15, 2024"` (`public/data/news.json:5`); oldest `"February 12, 2020"` (`news.json:53`). Today is 2026-08-23. Last content commit to the file: `7e94f53 2025-02-27 "added news article"`. `docs/CONTENT.md:67` already flagged this on 2026-08-20.

Everything the content skill says is newsworthy is **absent**:
- ICRA 2026 Vienna — "the biggest and most successful competition to date… gets substantial space on landing, race, **and news**" (`.claude/skills/roboracer-content/SKILL.md:28`). Not present.
- IV 2026 Detroit podium (`SKILL.md:28`). Not present.
- IROS 2026 Pittsburgh, Sep 28-30, register by Sep 5 2026 — **five days after registration would have closed relative to nothing on this page** (`SKILL.md:19-20`). Not present.
- IFAC 2026 Busan (Aug 24-27, i.e. **tomorrow**) and VTC 2026 Boston (Sep 6-9), both in `public/data/upcoming_events.json:2-14`. Not present.

**Dead / suspicious external links** (not fetched, flagged by inspection):
- `"link": "https://app.stitcher.com/splayer/f/125922/67297121"` (`news.json:55`) — Stitcher was shut down in 2023; `app.stitcher.com` is almost certainly dead. **Blocker for "every external link resolves".**
- `"thumbnail": "https://static.libsyn.com/p/assets/e/e/f/d/eefd0fe31b3fede0/iTunes_Graphic.jpg"` (`news.json:56`) — same era, likely 404.
- `"thumbnail": "https://miro.medium.com/max/1400/1*MU35Lr-u7cj8yOry5LnYWA.jpeg"` (`news.json:48`) — Medium's `/max/` CDN form is legacy and hotlink-fragile.
- Two different items both point at the bare `https://autodrive-ecosystem.github.io` (`news.json:15` and `news.json:23`) — the same generic landing page for two distinct stories; neither deep-links to its subject.

**Naming.** Titles/descriptions say "F1Tenth" / "F1TENTH" (`news.json:3,6,11,19,27,54`). Per `docs/CONTENT.md:69` this is a deliberate KEEP — these are third-party titles predating the rename — but the page gives the reader no framing ("formerly F1TENTH"), so it reads as unmaintained branding rather than archive.

**No lorem/TODO in the page or in `news.json`** — the problem is absence, not placeholder text. **No invented facts** either: every item is attributed to a named outlet. The `description` fields read as third-party summaries, not RoboRacer voice; none violate the voice rules (`SKILL.md:49`) because none were written by us.

**Metadata:** `index.html:7` has a single global `<title>RoboRacer</title>`, no description, no OG/Twitter tags, and the SPA never sets a per-route title. `/news` shares the homepage's title and social card.

---

## 3. EMPTY MEDIA SLOTS

**Local media referenced by this page: none.** `find public -ipath '*news*'` outside `public/data/` returns nothing; there is no `public/news/` or `public/media/news/`.

All 7 thumbnails are **hotlinked from third-party hosts** (`News.tsx:18` renders `thumbnail` verbatim):

| # | thumbnail host | on disk? |
|---|---|---|
| 0 | `autoware.org` (`news.json:8`) | no — remote |
| 1-4 | `img.youtube.com/vi/{FsbARE8vwXI,Rq7Wwcwn1uk,lE_Dk1iJHHg,FiC58K9zAwc}/hqdefault.jpg` (`news.json:16,24,32,40`) | no — remote, 480×360 low-res |
| 5 | `miro.medium.com` (`news.json:48`) | no — remote |
| 6 | `static.libsyn.com` (`news.json:56`) | no — remote |

This bypasses `src/lib/media.ts` (`mediaUrl`, lines 9-12), the R2 media base (`docs/HANDOFF.md` §1), and the whole `roboracer-media` provenance/manifest discipline. Four of seven are YouTube auto-thumbs at 480px — they will look soft in any card larger than the current 128px strip.

**Slots the redesign implies but that have no asset:** a hero/lead image for the page; a per-item 1200-wide WebP with a poster; an OG image for `/news`. None exist.

**Adjacent media that DOES exist and is unused by this page** (verified on disk, all present):
- `public/media/highlights/` — 5.1 MB, all 16 `highlights.json` entries resolve, 8 MP4s + 8 WebPs, no misses. Only the 9 image entries have `"poster": ""` (`highlights.json:102,114,126,138,150,162,174,186`), which is correct — `HighlightReel.tsx:128` only reads `poster` for `type: "video"`.
- `public/media/join/` — 2.0 MB, all 16 `community.json` paths resolve (photo, Open Robotics video + poster + SVG logo, YouTube poster, 11 post posters). No misses.

---

## 4. DATA COVERAGE

| File | Status for `/news` | Detail |
|---|---|---|
| **`news.json`** | **consumed** — `News.tsx:3,32` | 7 items, fields `title, platform, date, description, link, thumbnail`. Missing everything a redesign needs: no `id`, no ISO date (dates are free text: `"Feb 15, 2024"`, `"July 2023"`, `"February 12, 2020"` — three different formats, unsortable), no `event` tag, no `type` (press/paper/post/result), no `featured`, no local image, no width/height, no alt. Type in `src/lib/data.ts:36-43` says `image?` — does not match the data. |
| **`community.json`** | **could consume, does not** — only `CommunityJoin.tsx:48` reads it (landing §08) | Richest untapped source for this page: `join.posts[]` is 11 fully-curated 2026 LinkedIn items (`community.json:40-205`) with `post_url, author, author_url, affiliation, date` (ISO), `event, poster` (on disk), `width/height, alt, excerpt, credit`. Every one is ICRA 2026 / IV 2026 — exactly the news the feed is missing. Also `members_display "3,000+"`, `timezones 25`, `continents 6`, `updated "2026-08-21"` (`community.json:2-6`). |
| **`highlights.json`** | **could consume, does not** — only `Landing.tsx:115` and `Styleguide.tsx:77` | 16 entries, `id/type/src/poster/caption/credit/event/href/aspect/status`, all `status: "live"`, all files present. A per-event news entry could pull its hero media from here. `HighlightReel` (`src/components/ui/HighlightReel.tsx:33`) is reusable as-is — it takes `items: Highlight[]` and nothing else, handles reduced motion (`:43-51`), lazy video via IntersectionObserver (`:142-184`), and `aria-hidden` clones (`:75,87`). |
| **`upcoming_events.json`** | **could consume, does not** | 3 events; IROS 2026 entry carries `spotlight, dates_headline, dates_secondary, starts_at, registration_deadline "September 5, 2026", register_url, rules_url` (`upcoming_events.json:16-27`). A "Register by Sep 5" banner belongs on this page. |
| **`past_races.json`** | could consume | 34 entries, only `{name, url}` — no dates, no results, no media. Enough for an archive rail, not for cards. |
| **`teams.json`** | could consume | 10 entries, **all `status: "verify"`** — per `SKILL.md:61` unsourced entries are not rendered. Rich `highlights[{event, result}]` (ICRA/IV 2026 podiums) that would let a news item name winners. Blocked on Cedric. |
| **`publications.json`** | marginal | 133 items, 10 tags, `updated: 2026-08-21`, 6 `featured: true`. Belongs on `/research`; at most a "new paper" news type later. |
| **`events_map.json`** | irrelevant | 40 events / 24 countries / 24 regions, `updated 2026-08-22`; it is the landing world-map geometry. |
| **`platform.json`** | irrelevant | 4 pillar rows for `PlatformPanel`. |
| **`partners.json`** | irrelevant | 20 partners with tint/color logo variants. |
| `testimonies.json`, `team_developers.json`, `team_alumni.json` | irrelevant + stale | mtime Aug 8; `docs/CONTENT.md:117-118` marks both team files stale. |

**Cross-file issues found while checking (not `/news`, but in scope of the brief):**
- `community.json:188` — `"About 200 people and 30 teams from more than 12 countries, the largest competition yet."` contradicts the skill's `"180+ competitors and 35 registered teams (both VERIFY)"` (`SKILL.md:28`). Two different published numbers for ICRA 2026.
- `community.json:14` — `"caption": "4th F1TENTH Korea Championship · Incheon, Nov 2025 · verify"`. The literal word **"verify" is rendered into the page** as the figcaption (`CommunityJoin.tsx:119`), live on the landing today.
- `community.json:27-28` — `excerpt` is our draft with `"excerpt_note": "TODO(content): one sentence in Cedric's words; this draft is ours, not the post text"`, and it renders.
- `highlights.json:7` — caption `"1st UPenn Autonomous Racing · IV 2026, Detroit"`; the skill names the IV 2026 winner **"Thunderbolt, UPenn"** (`SKILL.md:28`). Team-name conflict with `teams.json`.
- `highlights.json:15,39,51,75` — ids `icra2026-headtohead`, `icra2026-grid-01`, `icra2026-start-01`, `icra2026-corner-02` all carry `"event": "icra2025"` and ICRA 2025 media/captions. Cosmetic but will mislead any future filter keyed on `id`.
- `CommunityJoin.tsx:11-14` — `TODO(content): Cedric confirms the LinkedIn page` still open.

---

## 5. TOP GAPS

| # | Severity | Gap | One-line fix |
|---|---|---|---|
| 1 | **blocker** | Feed's newest item is Feb 2024; ICRA 2026, IV 2026, IFAC 2026 (Aug 24-27, tomorrow) and IROS 2026 are all missing (`news.json:5`; `SKILL.md:28`) | Reseed `news.json` from the 11 sourced posts in `community.json:40-205` plus the three events in `upcoming_events.json`, with a new schema (`id`, ISO `date`, `type`, `event`, local `image`+`width`/`height`/`alt`). |
| 2 | **blocker** | Page is entirely off-system: purple/pink gradient cards, `rounded-lg`, `shadow-lg`, gray-600 text, `text-3xl` h1, zero primitives (`News.tsx:17,20,22,40`) | Rebuild on `Section variant="paper"` + `SectionHeader index=… ` + `Reveal` + `MediaFrame`, per D3 and the component catalog (`SKILL.md:24,59-66`). |
| 3 | **blocker** | Dead external link `https://app.stitcher.com/splayer/f/125922/67297121` (`news.json:55`) and its likely-404 libsyn thumbnail (`news.json:56`) | Drop or repoint the Stitcher item; run the link check before ship. |
| 4 | **major** | All 7 thumbnails hotlinked from third-party hosts, four of them 480px YouTube auto-thumbs (`news.json:8,16,24,32,40,48,56`) | Re-host as local WebP under `public/media/news/` via the `roboracer-media` pipeline, record provenance, or drop the item. |
| 5 | **major** | Images have no `width`/`height` and no `loading="lazy"` (`News.tsx:18`) — guaranteed CLS on a page of 7 remote images | Use `MediaFrame` (`src/components/ui/MediaFrame.tsx`), which sets both. |
| 6 | **major** | No error and no empty state: a failed fetch shows "Loading news…" indefinitely (`News.tsx:34-36,42-46`) | Add `status: "loading" \| "ready" \| "error"` and route through `loadNews()`. |
| 7 | **major** | `loadNews()` is dead code and its `NewsItem.image` field does not match the data's `thumbnail` (`src/lib/data.ts:42,294`) | Fix the type to the new schema and make `News.tsx` call `loadNews()` instead of its private `fetch("/data/news.json")`. |
| 8 | **major** | No IROS 2026 call to action anywhere on the page despite `registration_deadline: "September 5, 2026"` being 13 days out (`upcoming_events.json:20`) | Add a `NextRaceSpotlight` or a single hairline banner reading the spotlight entry. |
| 9 | **minor** | `alt={title}` duplicates the adjacent `<h3>` inside the same link (`News.tsx:18`) | `alt=""` for the decorative thumbnail, or a distinct description. |
| 10 | **minor** | Three incompatible date formats — `"Feb 15, 2024"`, `"July 2023"`, `"February 12, 2020"` (`news.json:5,29,53`) — so items cannot be sorted or grouped | Store ISO `date`, render as `"Sep 28-30, 2026"` per the voice rule (`SKILL.md:49`). |
| 11 | **minor** | No per-route `<title>`/meta/OG; `/news` inherits `<title>RoboRacer</title>` (`index.html:7`) | Set head tags per route (skill `fixing-metadata`). |
| 12 | **minor** | Historical "F1Tenth" titles render with no framing (`news.json:3,11,19`) | Keep the titles verbatim per `docs/CONTENT.md:69`, add an "Archive (as F1TENTH)" group heading. |
| 13 | **minor** | No `docs/qa/news.md` exists (`docs/qa/` holds only landing/styleguide) | Produce it via `/qa-page news` before ship. |