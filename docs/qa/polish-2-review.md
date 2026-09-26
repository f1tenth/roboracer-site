# QA review: revamp/polish-2 (integration head cd25d85)

Independent QA, 2026-09-24. Worktree `roboracer-site-wt/p2-leaderboard`, detached at
`cd25d85 Merge revamp/p2-copy`. Production build served with `vite preview` on 4199
(stopped afterwards). Playwright (Python, `~/.venvs/ml`), Chromium with
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, CDP captures,
stitched scroll walks with `scrollTo` + `mouse.wheel(0,1)` + 0.9 s settle. Axe via
`axe-playwright-python`, run after the full scroll walk so every reveal has fired.
The landing hero (video) is out of scope per the brief and is not judged here.

## Verdict per page

| Page | Verdict | Why, in one line |
|---|---|---|
| `/` landing | **FIX FIRST** | Research lead says "Eight papers" over an 11-paper carousel; "Register your team" still the main button 15 days after registration closed |
| `/about` | **FIX FIRST** | Cold-load layout shift 0.22 (1536) / 0.27 (768); spinoff card says LAMARRacing "won Best Performance Overall", news and join card say "fourth overall" |
| `/race` | **FIX FIRST** | 19 of the competition-site links in "Every race so far" / "This season" are dead (404 or TLS failure), including VTC 2026 Fall; registration shown as "closed" next to a solid "Register your team" |
| `/assembly` | **SHIP** | Axe clean, whole part list and every guide link reachable by keyboard, all guide anchors exist, reduced motion fine, CLS ~0 |
| `/research` | **SHIP** | Axe clean, no errors, CLS 0.0002 to 0.0008; only copy nits |
| `/news` | **FIX FIRST** | Cold-load layout shift 0.48 (1536) / 0.69 (768) / 0.49 (390) |

Axe: **0 violations of any impact** on all 6 pages at 1536x730, 768x1024 and 390x844, and on
the reduced-motion runs of `/` and `/assembly`. Console: **0 errors, 0 page errors, 0
same-origin HTTP errors, 0 mixed-content requests** across all 22 loads.

## Numbered fix list (by severity)

### High

1. **/race: 19 dead competition-site links.** Element: "This season" card (VTC 2026 Fall) and the
   "Every race so far" year list. Observed: `curl -L` with a browser user agent returns 404 for
   `vtc2026-race.roboracer.ai`, `iv2025-race.roboracer.ai`, `icra2025-race.roboracer.ai`,
   `cdc2025-race.roboracer.ai`, `bu2024-race.f1tenth.org`, `itsc2024-race.f1tenth.org`; TLS failure
   ("SSL: no alternative certificate subject name matches target host name", plain http gives 404) for
   `cps2023-race`, `cpsweek2024-race`, `cdc2024-race`, `sm2024-race`, `iv2024-race`, `icra2024-madgames`,
   `iros2023-race`, `icra2023-race`, `iv2023-race`, `iros2023-madgames`, `icra2022-race`,
   `esweek2022-race`, `korea-race` (all `.f1tenth.org`). `docs/EVENTS_VERIFICATION.md` recorded these
   as 200. Likely cause: `gh api orgs/f1tenth/repos` shows every one of these site repos is
   **private** with `has_pages: true`; the three public ones (icra2026, iv2026, iros2026) serve fine.
   Private-repo Pages stopped serving. The page lead still promises "Each one links to its site, or
   to an archived copy if the site is gone." Fix: Cedric decides whether to make the repos public
   again or plan-gate; otherwise point each at a Wayback copy (snapshots exist for vtc2026
   20260723, icra2025 20260313, iros2023 20250823, korea-race 20251206; none for iv2025, cdc2025,
   bu2024). Repro: `curl -sIL https://icra2025-race.roboracer.ai/`.
2. **/news: layout shift on first load, CLS 0.48 / 0.69 / 0.49 (1536 / 768 / 390).** Element: the
   page renders the header (401 px) and the "Contribute" section at y=469 while `news.json` loads,
   then the featured story and archive arrive and push "Contribute" from y=469 to y=7137. Seen on
   every cold context in the walks; reproduced deterministically by delaying `**/data/*.json` 1.2 s
   (shift 0.4803 at 1759 ms). Fix: do not render the sections below until the data resolves, or
   reserve the featured-story and archive heights. Evidence: `news-1536x730-t0.5s.png` vs
   `news-1536x730-t3s.png`.
3. **/about: layout shift on first load, CLS 0.217 / 0.268 / 0.043 (1536 / 768 / 390).** Element:
   the hero's YouTube facade is rendered as `{youtube && ...}` after `community.json` resolves, so
   the hero grows 467 -> 1379 px and "01 What RoboRacer is" drops by 912 px. Spinoffs also mount
   late (after `spinoffs.json`), shifting Videos by 269 px; that one is below the fold on load but
   hits anyone arriving at `/about#about-spinoffs` or scrolling fast. Pre-existing (the facade moved
   into the hero on 2026-08-23; `docs/qa/about.md` recorded "none observed"), but it fails the
   definition of done. Fix: reserve the facade's 16:9 box in the hero and a min-height for the
   spinoff grid. Repro: delay `**/data/*.json` 1.2 s, watch `about-what` top go 467 -> 1379.
4. **Landing: "Eight papers to start with." is wrong.** Element: `08 Research` lead
   (`src/pages/Landing.tsx:390`, introduced by `ecf6a19` in this round). The carousel renders
   "Paper 1 of 11" ... "11 / 11". Fix: derive the number from `featured.length` or drop it.
5. **Registration state contradicts itself (landing, /race, /news).** Data: `registration_deadline`
   "September 9, 2026" (passed). /race spotlight shows both "registration closes September 9, 2026"
   and "registration closed", above a solid "Register your team". The landing spotlight shows only
   "registration closes September 9, 2026" (future tense, no closed row, because `deadlineAt` is
   not passed there) and the same solid button. /news item of Aug 23 still reads "Registration for
   the 31st competition at IROS 2026 closes September 5" and "Register your team by September 5".
   `qualification_video_due` is also September 9 while the content skill says Sep 12. Needs
   Cedric: is late registration open? If not, swap the primary CTA (e.g. "Read the rules" /
   "Watch the race") once `deadlinePassed`, and pass `deadlineAt` on the landing too.

### Medium

6. **Landing: the "Start here" paths row reserves no height.** `EntryPaths` renders an empty
   `<ul aria-busy>` until `paths.json` arrives. Section height 199 -> 360 px at 1536, 242 -> 731 px
   at 390. It sits below the pinned hero (y=2336 / 2701), so a normal load logs no CLS, and the nav
   jump waits for `aria-busy` (verified: lands with `#start` at top=0 and focus on the section). If
   the reader is already there when the JSON is slow: CLS 0.048 (1536) / **0.277** (390). Fix: four
   placeholder cells at the final height, or import the four paths statically. Evidence:
   `probe-paths-scrolled-390x844-hold.png`.
7. **/race Leaderboard: 46 px shift at 390 when laps arrive.** The skeleton reserves one chip row
   (`min-h-10`); lab 4 has two boards and the chips "Fastest clean lap" / "Fastest clean obstacle
   lap" wrap to two rows on a phone. Block 1126 -> 1172 px, shift 0.0164 on the table. Desktop is
   exact (865 -> 865 px, zero shift); the error path (abort) renders its short state directly with
   no skeleton flash. Fix: shorter chip labels on phones, or reserve two rows under `sm`. Also
   note: a failure *after* the skeleton shows collapses the block 865 -> 570 px (by design, but
   the footer jumps). Evidence: `probe-leaderboard-390x844-hold.png`, `section-race-leaderboard-390x844.png`.
8. **Landing car chapter at 768: the LiDAR callout runs into the step copy.** "HOKUYO UTM-30LX · 2D
   LIDAR" ends flush against "source design puts it." (no gap). Evidence:
   `landing-768x1024-full.png` (car chapter, first "Race-ready" state).
9. **Two solid violet buttons in one viewport, now on most pages.** The new nav "Start here" is a
   solid `rr-violet` fill on every route, so every in-page primary Button adds a second one:
   `/assembly` "Open the build guide", landing and /race "Register your team", Join "Join the
   Slack". DESIGN.md: "At most ONE solid ... CTA per viewport". Decision for Cedric: accept the nav
   as the exception, or demote in-page primaries to secondary where they share a viewport with it.
10. **Fact conflicts across pages (content, ask Cedric).**
    - LAMARRacing: /about spinoff origin "then won Best Performance Overall at ICRA 2026 in Vienna";
      /news and the join card "Fastest in time trials, fourth overall"; teams card "1st, Time Trials".
    - Quanser spinoff card: origin is `TODO(content)` and hidden, so the card says nothing about how
      Quanser relates to RoboRacer; it reads as an unrelated company.
    - 404 Racers team card: "institution tbc" while the community card beside it says "404 Racers,
      University of Pennsylvania".
    - "Cédric Hollande" (community cards, news) vs "Cedric Hollande" everywhere else.
    - /race lead "on four continents" counts CDC 2025 Rio, which the list itself marks "online";
      not in the content skill.
11. **Landing first-load weight (pre-existing, hero excluded).** 4 s after load, no scrolling, at
    1536: 11.6 MB over 243 requests: 196 WebP (5.1 MB, including 1600w research figures such as
    `research-zang-2026-sit-fig-1600.webp` 296 KB), 4 x `join-openrobotics-post-960.mp4` (1.05 MB
    each: one visible plus three `aria-hidden` marquee clones, all `autoplay`, so `preload=metadata`
    is ignored), `race-iros2026-hero-1272.mp4` 817 KB at y=10157, and 471 KB of car GLBs. `vite
    preview` sends `Cache-Control: no-cache`, so on GitHub Pages (max-age=600) the clones may share
    one download; the visible one still loads 14,000 px below the fold. Fix: clones get `preload=none`
    and no `autoplay` (or a poster image), and the spotlight / join videos start in view.

### Low

12. Landing car callout "STEERING SERVO · VERIFY" is public text, while `/assembly` states
    "Traxxas, from the kit" as fact (`racecarAssemblyData.ts:355` keeps the mark on purpose).
13. Footer (`src/components/Footer.tsx`, edited this round) still uses off-token Tailwind grays:
    `bg-gray-900`, `text-gray-400`, `border-gray-800`, `bg-white/10`. Should be `ink-*` /
    `text-on-ink*` tokens.
14. /about hero counters run about 2.4 s (0.8 s -> 3.2 s after navigation) against the 1.2 s cap,
    and "publications" sits on **999+** for a beat before snapping to 1,000+ (visible in
    `about-1536x730-t3s.png` and `about-390x844-t3s.png`). StatTicker is unchanged this round.
15. Tag vocabulary differs: "verify" (people, spinoffs, join photo caption "· verify") vs
    "unverified" (teams). The leads explain it twice in two words ("A verify tag" / "An unverified tag").
16. New-tab links in the new sections lack the sr-only "(opens in a new tab)" that `/assembly`
    uses: "See the full leaderboard ↗", the three spinoff names, the "Sponsor a race" path is a
    mailto (fine).
17. Transient or blocked externals to recheck by hand: `endeavors.unc.edu/the-fast-and-the-autonomous/`
    (/news, connection refused), `www.iitb.ac.in` (partners, 502).

## Copy against docs/copy/BRIEF.md (sentences that still break a rule)

| Page | Text | Rule |
|---|---|---|
| `/` | "RoboRacer is an open-source race car at one-tenth scale. Program it to drive itself, then race it at the largest robotics conferences." (22 words) | 1, lead under 20 words |
| `/` | "Eight papers to start with." | 3, wrong number (fix 4) |
| `/` | "Next race" / "Come to our next race" | 6, subtitle repeats the headline |
| `/` | map legend "hosted a race, deeper with more partner institutions" | 8, unclear aloud |
| `/`, `/about` | community card meta "Team, 1st place ICRA 2026" | 8, reads as a fragment |
| `/about` | "The four parts of RoboRacer. Each has its own page." | 5, narrates the page |
| `/about` | "They teach and do research with it. Alphabetical in each group." | 5, narration |
| `/about` | "Each name links to the page its title comes from." | 5, narration |
| `/about` | "Everyone with a public commit in the f1tenth GitHub organization. The car, the simulator, the ROS stack and the course labs are all built in the open." (28 words) | 1 |
| `/about` | caption "group pic ICRA 2026" (others: "group photo · ICRA 2026, Vienna") | 8, caption style |
| `/about` | "A freshman's journey: learning to drive and race" | 2, "journey" (already deferred to Cedric in `docs/copy/data-videos.md`) |
| `/race` | "Enter" / "How to enter" | 6, subtitle repeats the headline |
| `/race` | "Each competition's own site has the details. In short:" | 5, narration |
| `/race` | "IROS 2026, Pittsburgh" then "September 28 to 30, 2026, Pittsburgh" | 8, Pittsburgh twice in two lines |
| `/race` | "This season" / "The rest of 2026" above two concluded races | 3, not true of IFAC and VTC |
| `/race` | "Every race so far" / "From Pittsburgh 2016 to Pittsburgh 2026" | 2 and 3, "from X to Y"; the list ends at VTC Boston, IROS has not happened |
| `/race` | "Each one links to its site, or to an archived copy if the site is gone." | 3, false for 19 entries today (fix 1) |
| `/research` | "Papers that build on RoboRacer. Filter by topic, and each topic links to its own Scholar search." | 5, narrates the UI |
| `/research` | "By year, newest first. The topic filter above works here too." | 5, narration |
| `/news` | "Cedric Hollande · Researcher - xLAB, University of Pennsylvania" (and "Result: ... Researcher - xLAB") | 2, spaced hyphen used as a dash |
| `/news` | featured headline "274 racers and 56 teams in Busan: the largest race in RoboRacer history" (13 words) and its 39-word lead | 1 and 6, if news titles are not exempt |
| site | dates mixed: "September 28-30, 2026" (landing card), "September 28 to 30, 2026" (race), "August 24-27, 2026" (race card) | voice: "September 28 to 30, 2026" in prose, "Sep 28-30, 2026" in cards |
| `/assembly` | none found | |

No banned word other than "journey" appears in our own copy; "robust", "leverages",
"comprehensive", "state-of-the-art" occur only inside quoted paper abstracts.

## Evidence

All captures under `docs/qa/polish-2/` (git-ignored). Naming: `<page>-<viewport>-full.png`
(stitched walk; nav repeats at each frame; pinned chapters appear once per frame by design of
the method), `-t0.5s.png` / `-t3s.png` (first viewport at 0.5 s and 3 s), `-reduced-*` (prefers-reduced-motion),
`section-*.png` (single viewport on the new blocks), `kbd-*.png` (focus rings),
`probe-*.png` (data held back), `start-here-from-race-*.png`.

### Build and lint

- `npm run lint`: pass, 0 warnings.
- `npm run build` (`tsc -b && vite build && spa-fallback`): pass in 5.6 s. One warning, unchanged in
  kind: chunk over 500 kB (`RacecarAssembly-*.js`, lazy).
- Bundle vs deployed main (`origin/gh-pages`, deploy of `e82e747`), bytes:

| Chunk | main | this branch | delta |
|---|---|---|---|
| `index-*.js` (shared) | 385,434 | 385,865 | +0.4 KB |
| `index-*.css` | 69,815 | 75,587 | +5.8 KB (assembly.css folded in) |
| `Assembly-*.css` | 11,701 | removed | -11.7 KB |
| `Assembly-*.js` | 8,608 | 8,038 | -0.6 KB |
| `GLTFExporter-*.js` | 35,329 | removed | -35.3 KB |
| `RacecarAssembly-*.js` (lazy) | 1,014,035 | 1,004,582 | -9.5 KB |
| `Landing-*.js` | 110,004 | 113,671 | +3.7 KB |
| `About-*.js` | 37,714 | 39,856 | +2.1 KB |
| `Race-*.js` | 15,983 | 24,728 | +8.7 KB (leaderboard) |
| all `assets/` | 1,836,533 | 1,808,481 | -28 KB |

  Against `docs/AUDIT.md` (one 1,229 kB chunk, 310.75 kB gzip on every route): the shared chunk is
  now 385.87 kB / 134.29 kB gzip; three.js stays in the lazy 1,004.58 kB / 277.70 kB gzip chunk.

### Console and network (22 loads)

- Errors: none. Page errors: none. Same-origin 4xx/5xx: none. Mixed content: none.
- Warnings: `No available adapters.` (landing at all widths, /about at 768 and 390; WebGPU probe
  under headless SwiftShader); `Failed to execute 'postMessage' on 'DOMWindow': The target origin
  provided ('http://127.0.0.1:4199') does not match the recipient window's origin
  ('https://www.youtube-nocookie.com')` (landing, about) and the same for `https://www.linkedin.com` (news).
- Failed requests: aborted media ranges (`platform-*-960.mp4`, normal), the R2 hero (out of scope),
  YouTube `qoe` beacons, LinkedIn embed assets (`static.licdn.com`, `media.licdn.com`).
- The landing's YouTube player shows "This video is unavailable" in headless Chromium (beacon
  error `auth ... This_video_is_unavailable`); oEmbed for `wPHYLAnpMOU` returns 200, so this is
  probably a headless block. Check once in a real browser.

### Layout shift (CLS during load, before any scroll)

| Page | 1536x730 | 768x1024 | 390x844 |
|---|---|---|---|
| `/` | 0.0001 | 0 | 0.0001 |
| `/about` | **0.217** | **0.268** | 0.043 |
| `/race` | 0.0006 | 0.0009 | 0.0023 |
| `/assembly` | 0.0003 | 0.00002 | 0.0028 |
| `/research` | 0.0002 | 0.0008 | 0.0004 |
| `/news` | **0.481** | **0.686** | **0.490** |

Block probes (data held, then released): leaderboard 865 -> 865 px at 1536, 1126 -> 1172 px at
390; paths row 199 -> 360 px at 1536, 242 -> 731 px at 390.

### Keyboard

- Landing: Tab 11 reaches "Start here" (Tab 2 at 390, before the menu button); Enter lands on
  `/#start` with the section at top=0 and focus on it; the next four Tabs are the four paths in
  order, violet 2px ring visible (`kbd-path1-focus-1536.png`). Same from `/race` at 1536 and 390.
- /about: the three spinoff name links are consecutive Tab stops with a visible ring
  (`kbd-spinoff1-focus-1536.png`).
- /race: both board chips are Tab stops with `aria-pressed`, Enter switches boards and the link
  follows (`?lab=lab-4-follow-the-gap-obstacles`); "See the full leaderboard" is reachable
  (`kbd-leaderboard-link-focus-1536.png`).
- /assembly: Tab 13 reaches row 01; ArrowDown moves rows; Enter selects (`aria-pressed=true`) and
  the next Tab lands on "Build guide: ..." for all seven rows that have one (Wheels has none);
  Escape clears the selection; then "wire it all together", Assembled, Exploded, Reset view. The
  focused link stays inside the window at 390 (bottom 820 of 844).

### Links

514 unique external hrefs across the six pages, checked with a browser UA and redirects followed.
Scoped set all resolve: spinoffs (neobotics.org, quanser.com/products/qcar-2, lamarr-institute.org
news), leaderboard (`roboracer-class.github.io/leaderboard/` and both `?lab=` variants,
`data/index.json`), build guide (`index`, `lower_level_chassis`, `upper_level_chassis`,
`all_together`, and anchors `#mounting-the-vesc`, `#mounting-the-nvidia-jetson-nx`,
`#mounting-the-powerboard`, `#mounting-the-lidar`, `#attaching-the-ppm-cable` all present), 2026
event sites except VTC. Dead: see fix 1. Bot-blocked, not broken: 30 x 403 (ACM, MDPI, Wiley,
ScienceDirect, Columbia, FFG, UVA, Medium, Slack invite), 54 x 429/999 (LinkedIn), 70 x 202 (IEEE Xplore).
Every `target="_blank"` carries `rel="noopener noreferrer"`.

### Other checks

- One `h1` per page, no skipped heading levels, `main`/`nav`/`footer` present (`/assembly` has no
  footer by design). No image without `alt` or without `width`/`height`. No `<video>` without a
  poster except the R2 hero encodes (out of scope). No horizontal scroll at any width.
- Touch targets at 390: nothing under 24x24 px except inline text links (WCAG 2.5.8 inline
  exception); assembly rows 49 to 61 px tall; board chips 32 to 40 px.
- Reduced motion (`/` and `/assembly` at 1536 and 390): everything readable and static, marquees
  become wrapped grids, no console output, CLS 0.0001 / 0.0003 / 0.0001 / 0.005.
- JavaScript off: the `<noscript>` fallback in `index.html` (unchanged, known SPA limit).

## Summary for Cedric

1. Assembly and research can ship; landing, about, race and news need fixes first.
2. Biggest: 19 old race sites now dead on /race because their repos went private (GitHub Pages off).
3. /news (CLS 0.5 to 0.7) and /about (0.2 to 0.27) jump on a first visit while their JSON loads.
4. Registration closed Sep 9, but landing and /race still lead with "Register your team"; /news says Sep 5.
5. Landing copy says "Eight papers" over 11; the paths row and the phone leaderboard need reserved height.
