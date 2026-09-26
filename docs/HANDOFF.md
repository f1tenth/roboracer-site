# Handoff: where roboracer.ai stands, and how to work on it

Read this once at the start of a session, then follow `CLAUDE.md` (loaded
automatically) for the standing rules. Sections 1 to 3 are the state of play as
of **2026-09-26**, the end of iteration 3; the rest dates from 2026-08-22,
after the v1.0 landing. Keep it current: when you finish
a page, update the table in section 3 and the open items in section 2.

---

## 1. Where the work lives

| | |
|---|---|
| Working branch | `revamp/polish-2` (iteration 3, 2026-09-25/26, from Cedric's review notes): verify tags gone, team facts from the `RoboRacer_Teams_DB` sheet (`docs/content/teams.sheet.json`), Neobotics and Quanser as website-preview features under "Related platforms", every route change opens at the top (`hooks/useRouteScroll.ts`, hash landings clear the nav), `/research` with full-width phone figures and per-year folds, `/race` leaderboard on follow the gap with the top-5 replay, one "Start here" section replacing Start here + Platform on `/` and opening `/about` (`ui/StartHere`), the research carousel figure filling its pane, the Join section leading with copy, and the news history 2016 to 2026 (75 items, `docs/news/`). The topic branches `revamp/p3-*` are merged into it and kept, with their worktrees in `../roboracer-site-wt/p3-*` (QA PNGs live there, git-ignored). **PR #20** takes it to `main`. |
| `main` | at `e82e747` (PR #19, merged 2026-09-24) = the live roboracer.ai. **Never commit or push to it.** Cedric merges; the merge deploys. |
| Preview (safe to share) | <https://roboracer-preview.pages.dev> — Cloudflare Pages, project `roboracer-preview`, redeploy with `npx wrangler pages deploy dist --project-name roboracer-preview --branch v1-preview --commit-dirty=true`. Cedric reviews iterations here, not on roboracer.ai. |
| Live site | roboracer.ai = Porkbun DNS -> **GitHub Pages** from `gh-pages`. The preview above cannot affect it. |
| Large media | Cloudflare R2 bucket `roboracer-media`, public base `https://pub-1174c726236842f08529a0a5cc0c68fb.r2.dev`. `.env.production` sets `VITE_MEDIA_BASE`; `src/lib/media.ts` resolves `/media/...` paths through it in production and to the local file on localhost. The IV hero clips are the `-v2` encodes (from the source, 2026-09-24); localhost needs them copied into `public/media/hero/` (curl lines in `docs/media/HERO_PERF.md`), and a dev server started before that copy 404s them until restarted. `docs/media/HOSTING.md` lists where every video is served from. |
| Reviews of this iteration | `docs/qa/p3-integration-review.md` (independent QA of the merged pages, 21 items; 15 applied in `docs/qa/p3-fixes.md`), `docs/reviews/p3-code-review.md` (fresh-eyes code review; applied in `docs/qa/p3-fixes-2.md`), `docs/news/AUDIT.md` (fact audit of the 53 new news items; applied) and `docs/news/MERGE.md` (what the news merge added, held, and the contradictions for Cedric). Per-branch QA notes are `docs/qa/p3-*.md`. |
| Old history | local branch `revamp/integration` holds the previous 212-commit history as a safety net. Same tree, deletable on request. |

Commits: plain messages, **no `Co-Authored-By`, no AI attribution anywhere**
(standing rule; the branch was rebuilt once to remove 77 such trailers).

`.claude/hooks/guard-git.sh` blocks force pushes, pushes to `main`/`gh-pages`,
`rebase`, `filter-branch`, `filter-repo` and `reset --hard`. Do not route
around it — if a task seems to need one of those, say so and ask.

How iteration 3 was run (and the lessons): ten parallel Opus agents in
worktrees, then fresh agents per stage (research -> checkpoint -> page ->
audit -> fixes), an independent QA pass and a code review before the merge
closed. Keep agents under about 400k tokens: split by stage, checkpoint to
disk, hand rulings to agents in their first prompt (a ruling relayed to a
running agent was refused as instruction poisoning).

---

## 2. What is still open

1. **Cedric's decisions from iteration 3:**
   - The nav's solid violet "Start here" plus one in-page primary gives two
     solid violet buttons per viewport (`docs/qa/polish-2-review.md` item 9,
     again in `docs/qa/p3-integration-review.md` item 5). Recommended: keep
     the nav solid and exempt the fixed bar from the one-button rule.
   - News (`docs/news/MERGE.md`): the 2023 ordinals (San Antonio vs London as
     the 11th), the founding year (2015 vs 2016), CDC 2025's status, the VTC
     2026 winner (Firebird, one competitor's post), sponsor names in the IROS
     2026 and ICRA 2024 posts, the newsletter photos for the 2024 races,
     naming Ambimat on the power-board item, and the Germany 2022 result
     (attributed to ETH Zürich's own post).
   - Permission notes: Neobotics and Quanser have not been asked about the
     logos, car photos and homepage captures (manifest rows SP-01 to SP-07);
     the LinkedIn slides used as embed posters are from the Foundation's own
     page (NEWS-03 to NEWS-10).
   - The AI-generated car image in the landing's car chapter (`CAR_PHOTOS[1]`,
     captioned "AI-generated illustration"): keep, or swap for a photo.
2. **Left from the reviews, not blocking:** the hero shows for ~200 ms before
   a `/#start` jump from another route (review item 20); the 268 px paper band
   under the car chapter at 768x1024 (item 12); `/research` section eyebrows
   are words where other routes use numbers (16); the landing prefetches a 9 MB
   clip and tablets get the 1920 encodes (21); 61 of 77 research row thumbs
   are 320 px files and look soft on 3x phones (a 960 px media pass,
   `docs/qa/p3-fixes-2.md` L4); a reload always opens at the top (L3).
3. **Earlier items still open:** `docs/CONTENT.md` (the registration
   deadline; the 19 race-site repos that went private), `docs/LEADERBOARD.md`
   (a `leaderboard.roboracer.ai` CNAME; two small fixes proposed for the
   board repo: an empty `data/archive/index.json` and no autofocus when
   framed), `docs/mobile/VERIFY.md` (viewport-fit, a portrait hero encode),
   `docs/media/HERO_PERF.md` (R2 still serves from the rate-limited `r2.dev`
   URL until someone opens Workers & Pages in Rahul's dashboard).
4. **Copy** follows `docs/copy/BRIEF.md` (card bodies under 25 words; the
   news trim pass is in `docs/news/TRIM.md`). Facts still come only from
   `.claude/skills/roboracer-content` or from Cedric.
5. **Learn and build rebuild** (next iteration): the two tracks are data in
   `public/data/paths.json` and the state of play is `docs/LEARN_TERRAIN.md`.
   `/build` and `/learn` stay iframes until Cedric says otherwise.
6. Smaller, known: `/media/hero/car-studio.webp` was never produced (the car
   chapter falls back to the 3D render); Safari was not testable here (WebKit
   would not launch), so check a real iPhone once, portrait and landscape.

---

## 3. Page inventory

| Route | File | State | Notes |
|---|---|---|---|
| `/` | `src/pages/Landing.tsx` | **v1.1** | The reference for the visual system. Hero clip cycle loads one clip at a time and drops to 960 on slow links (`HeroChapter.tsx`, `lib/media.ts`); "00 Start here" after the hero: one line on what RoboRacer is, then Build, Learn, Race, Research, Sponsor with a small picture each, from `paths.json` (`ui/StartHere.tsx`, compact density; it replaced the entry-path row and the pinned Platform chapter, 2026-09-25); sections 00 to 08; chapters unpinned on `compact:` |
| `/assembly` | `Assembly.tsx` | **revamped** (`revamp/p2-assembly`) | "The car, part by part": site nav, 3D frame plus a list of 8 parts in build order, each linked to its build-guide section (`CAR_PARTS` in `racecarAssemblyData.ts`). Focus mode kept. `docs/assembly/` |
| `/styleguide` | `Styleguide.tsx` | live | Every primitive; check changes here first |
| `/about` | `About.tsx` | **revamped** | 01 Start here: the story beside the ICRA group photo, then the landing's ways in, fuller (`ui/StartHere` `density="full"`: clip, caption and a second sentence; phones get the thumbs); 04 Related platforms from `spinoffs.json` (`about/SpinoffGrid.tsx`; Neobotics and Quanser as website-preview features, each with a one-line relation to RoboRacer; Quanser is not affiliated, Cedric 2026-09-26), 05 Videos (`videos.json`, click-to-load `YouTubeFacade`), 06 the shared Join block |
| `/news` | `News.tsx` | **revamped** | Reads `news.json`; a lead item with an `embed` shows the LinkedIn post itself (`news/LinkedInEmbed.tsx`) |
| `/research` | `Research.tsx` | **revamped** | Rebuilt in `6d566b0`; reads `publications.json`; `/add-paper` and `/discover-papers` feed it. Fix list in `docs/NON_LANDING_AUDIT.md` |
| `/rules` | `Rules.tsx` | **old design, new text** | A `marked` viewer over `public/rules.md`, which is `rules_v3.md` from `f1tenth/roboracer_rules` `dev-2026`, byte for byte. `scripts/check-rules-drift.mjs` compares the two; `--write` refreshes the copy. Typography is still the legacy `rules.css`, not the design system. |
| `/race` | `Race.tsx` | **revamped** | Reads `upcoming_events.json`, `past_races.json` and `events_map.json`; "N competitions since 2016" is the highest held `number` in the map, and an upcoming event past its `ends` date counts as held. Section 05 reads the ESE 6150 class leaderboard live from its public JSON (`public/data/leaderboard.json`, `docs/LEADERBOARD.md`) |
| `/build` `/learn` `/course` | `Build.tsx`, `Learn.tsx` | see the files | `/course` redirects to `/learn` |
| `/chat` | `Chat.tsx` | old | Unchanged this revamp |

When you build a page: one page per branch (`revamp/<page>`), `/build-page
<page>`, then `/qa-page <page>`, then Cedric reviews on localhost, then `/ship
<page>`. Use the landing as the pattern source, not a template to copy.

---

## 4. The visual system a new session must know

Read `.claude/skills/roboracer-design-system` for the full contract. The parts
that are easy to get wrong:

- **Root size follows the window.** `html { font-size: clamp(75%, 100vw / 120, 100%) }`
  from 1024 up on mouse devices (`src/index.css`): the design was tuned on a
  1920-wide window and read 25% too large on ordinary 1440 to 1600 laptops,
  cutting the pinned hero. So **size everything in rem** (or vw/%), never px:
  a px value does not shrink with the rest. Media queries ignore the root size,
  so breakpoints do not move. QA at 1536x730 and 1366x650, not only 1440x900.
- **Containers.** `--container-page` (1800px) is the shared page width. Use
  `<Section width="page">`, or `mx-auto max-w-page px-6` inside a `bleed`
  section. Every landing section shares that edge; a new page must too.
  `content` (72rem) is for long-form text only.
- **`desktop:` variant** (`src/index.css`, `@custom-variant`) means *wide **and**
  at least 34rem tall*: `(min-width: 48rem) and (min-height: 34rem)`. Use it,
  not `md:`, for anything pinned or viewport-height — a landscape phone is wide
  but has no vertical room. `DESKTOP_QUERY` in `src/lib/motion.ts` is the same
  query for JS.
- **`compact:` and `coarse:` variants, `--spacing-nav`** (mobile pass,
  2026-09-25). `compact:` is the exact complement of `desktop:` (a phone in
  either orientation); `coarse:` is `(pointer: coarse)`, for 44 px touch
  targets that leave the mouse layout alone. `pt-nav` / `top-nav` /
  `calc(var(--spacing-nav) + 1rem)` place anything under the fixed bar: 4.5rem
  below 1024, 3.5rem on a short landscape screen, 5.3125rem from 1024. Never
  hard-code the bar height again. Below `desktop:` the section padding follows
  the window height and h1-h3 use `text-wrap: balance`.
- **Section headers.** The section's *name* is the `title` ("Platform"), the
  old headline is the `subtitle`, the description is the `lead`.
  `SectionHeader` takes `index`, `title`, `subtitle`, `lead`, `action`.
- **Motion vocabulary.** GSAP + ScrollTrigger with `useGSAP`; Lenis smooth
  scroll on fine pointers. Scrubbed timelines whose last tween ends before 1.0
  get their schedule stretched — pin the length with a proxy tween
  (`tl.to({t:0},{t:1,duration:1},0)`). Everything must degrade under
  `prefers-reduced-motion` to a static, readable layout.
- **Accent rule.** Buttons solid violet. Cyan appears only as the faint tint on
  the lit platform title and the partner-logo cast; magenta nowhere else.
- **Marquee children are never lazy.** `loading="lazy"` inside a marquee never
  fires (the browser measures the layout box), so cards show alt text as they
  scroll in. Use `loading="eager" fetchPriority="low"`.

---

## 5. Environment: things that cost hours to rediscover

- **Playwright is Python-only here.** `/home/cedric/.venvs/ml/bin/python3`,
  `from playwright.sync_api import sync_playwright`. There is no node
  Playwright. `axe-playwright-python` is installed in that venv.
- **Captures.** `page.screenshot(full_page=True)` hangs on the landing (live
  WebGL) and mangles pinned chapters. Use a CDP session
  (`page.context.new_cdp_session(page)` -> `Page.captureScreenshot`) and stitch
  a scroll walk with Pillow. After `window.scrollTo`, do
  `page.mouse.wheel(0, 1)` and wait ~0.5–1.2s so Lenis/ScrollTrigger sync
  before reading the DOM. For WebGL launch Chromium with
  `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
- **Never `pkill -f <pattern>`** — it matches the Bash tool's own command line
  and kills the shell mid-script (silent exit 144, later commands skipped).
  Stop servers with `fuser -k <port>/tcp`.
- **Write files atomically.** Cedric keeps a Vite dev server on **5173** all
  session. A truncate-then-write (`write_text`, `sed -i`, `>`) can be read
  mid-write; Vite caches an empty module and every route importing it goes
  white until the file is re-saved. Write to `<file>.tmp` and `os.replace`.
  Never start a server on 5173 (his) or 4242 (the task dashboard).
- **A long-running dev server also caches the public dir.** Files added to
  `public/` after it started 404 until it restarts — the production build is
  fine. If an image "doesn't load" for Cedric, check that first.
- **taskmap** commands need the repo as cwd; the dashboard is
  <http://127.0.0.1:4242>.
- Ports used by convention: 5173 Cedric's dev server, 4242 taskmap, 4180/4185
  QA previews.

---

## 6. Media and content rules in one line each

- No binary over 1.5 MB in git. The exceptions are the committed hero loop
  encodes; everything larger goes to R2 (section 1) or is cut to fit.
- Every image: WebP/AVIF, explicit `width`/`height`, alt text; every video: a
  poster.
- Provenance goes in `docs/ASSET_MANIFEST.md` (source, credit, permission) and
  the choice rationale in `docs/media/INTAKE.md`.
- Never take assets from neobotics.org; it is a pattern reference only. Exception (Cedric, 2026-09-25): the `/about` spinoff features for Neobotics and Quanser use their own logos, car photos and homepage captures (manifest rows SP-01 to SP-07, permission not yet asked).
- Copy on tiles and photos shows **no** "Photo:" / "Video:" credit line — the
  credits stay in the JSON and the manifest.

---

## 7. Definition of done for any page

Build and lint green; 1440 / 768 / 390 reviewed plus a landscape check; no
console errors; axe zero serious or critical; reduced motion verified; every
external link resolves; no layout shift; copy matches the content skill; QA
report at `docs/qa/<page>.md`; Cedric approves on localhost.

The landing's own history is in `docs/plans/landing-v2.md` through
`landing-v5.md` — v5 section 11 lists the last round of changes and the final
numbers, which is the best single read for how a chapter is specified here.
