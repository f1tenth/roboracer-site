# Handoff: where roboracer.ai stands, and how to work on it

Read this once at the start of a session, then follow `CLAUDE.md` (loaded
automatically) for the standing rules. Sections 1 and 3 are the state of play as
of **2026-09-21**, when the whole site went up for merge to `main`; the rest
dates from 2026-08-22, after the v1.0 landing. Keep it current: when you finish
a page, update the table in section 3 and the open items in section 2.

---

## 1. Where the work lives

| | |
|---|---|
| Working branch | `revamp/pages-v1` (local and origin). PR #17 takes it to `main`: the landing and every rebuilt page in one merge (Cedric, 2026-09-21: deploy rather than keep it in dev). `revamp/v1.0` is an ancestor of it. |
| `main` | at `4ea2e09` until Cedric merges PR #17. **Never commit or push to it.** Cedric merges; the merge deploys roboracer.ai. |
| Preview (safe to share) | <https://roboracer-preview.pages.dev> — Cloudflare Pages, project `roboracer-preview`, redeploy with `npx wrangler pages deploy dist --project-name roboracer-preview --branch v1-preview --commit-dirty=true` |
| Live site | roboracer.ai = Porkbun DNS -> **GitHub Pages** from `gh-pages`. The preview above cannot affect it. |
| Large media | Cloudflare R2 bucket `roboracer-media`, public base `https://pub-1174c726236842f08529a0a5cc0c68fb.r2.dev`. `.env.production` sets `VITE_MEDIA_BASE`; `src/lib/media.ts` resolves `/media/...` paths through it in production and to the local file on localhost. |
| Old history | local branch `revamp/integration` holds the previous 212-commit history as a safety net. Same tree, deletable on request. |

Commits: plain messages, **no `Co-Authored-By`, no AI attribution anywhere**
(standing rule; the branch was rebuilt once to remove 77 such trailers).

`.claude/hooks/guard-git.sh` blocks force pushes, pushes to `main`/`gh-pages`,
`rebase`, `filter-branch`, `filter-repo` and `reset --hard`. Do not route
around it — if a task seems to need one of those, say so and ask.

---

## 2. What is still open on the landing

The landing is a **v1.0 draft**, not finished. In priority order:

1. **Mobile design pass: done on `revamp/p2-mobile` (2026-09-25).** Audit of
   every route on five phone and tablet sizes (`docs/mobile/AUDIT.md`), the plan
   (`docs/mobile/PLAN.md`), and the verification (`docs/mobile/VERIFY.md`). The
   pinned chapters read unpinned on `compact:` (below `desktop:`), the menu is
   bounded and modal, section rhythm and headings follow the window on phones,
   tap targets are 44 px on `coarse:`. Open items and Cedric's questions are at
   the end of VERIFY.md.
2. **Copy pass.** Only the hero has had real text written. Every other section
   carries working copy: section leads, captions, the `TODO(content)` markers,
   and the ten team entries still tagged `status: verify`. Facts come from
   `.claude/skills/roboracer-content` or from Cedric — never invent one.
3. Smaller, known:
   - `/media/hero/car-studio.webp` and `car-studio-cutout.webp` were never
     produced; the car chapter falls back to the 3D render by design.
   - The account has no `workers.dev` subdomain, so the R2 files come from the
     rate-limited `r2.dev` URL. `infra/media-worker` is written and ready to
     deploy once a subdomain is claimed.
   - Team institutions marked `TODO(content)`; UNICORN_Racing's institution
     needs verifying (its own post says UNIST, `teams.json` says Bonn).

---

## 3. Page inventory

| Route | File | State | Notes |
|---|---|---|---|
| `/` | `src/pages/Landing.tsx` | **v1.0 draft** | Nine sections, the reference for the visual system |
| `/assembly` | `Assembly.tsx` | **revamped** (`revamp/p2-assembly`) | "The car, part by part": site nav, 3D frame plus a list of 8 parts in build order, each linked to its build-guide section (`CAR_PARTS` in `racecarAssemblyData.ts`). Focus mode kept. `docs/assembly/` |
| `/styleguide` | `Styleguide.tsx` | live | Every primitive; check changes here first |
| `/about` | `About.tsx` | **revamped** | Ends on section 05 Videos (`videos.json`, click-to-load `YouTubeFacade`) and the shared Join block |
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
- Never take assets from neobotics.org; it is a pattern reference only.
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
