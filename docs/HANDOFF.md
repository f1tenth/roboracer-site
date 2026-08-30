# Handoff: where roboracer.ai stands, and how to work on it

Read this once at the start of a session, then follow `CLAUDE.md` (loaded
automatically) for the standing rules. This file is the state of play as of
**2026-08-22**, after the v1.0 landing shipped. Keep it current: when you finish
a page, update the table in section 3 and the open items in section 2.

---

## 1. Where the work lives

| | |
|---|---|
| Working branch | `revamp/v1.0` (local and `origin/revamp/v1.0`), 28 commits from `main` |
| `main` | untouched at `4ea2e09`. **Never commit or push to it.** Cedric merges. |
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

1. **Mobile design pass.** Nothing overflows or breaks any more (see the
   `desktop:` variant in section 4), but the small-screen *reading experience*
   was never designed: type scale, section rhythm, how the pinned chapters read
   when they are not pinned. This is a design job, not a bug hunt.
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
| `/assembly` | `Assembly.tsx` | v1.0 | Part focus mode: click a part, the rest goes grey, camera flies in |
| `/styleguide` | `Styleguide.tsx` | live | Every primitive; check changes here first |
| `/about` | `About.tsx` | **old design** | React page, not yet revamped |
| `/news` | `News.tsx` | **old design** | React page, reads `news.json` |
| `/research` | `Research.tsx` | **revamped** | Rebuilt in `6d566b0`; reads `publications.json`; `/add-paper` and `/discover-papers` feed it. Fix list in `docs/NON_LANDING_AUDIT.md` |
| `/rules` | `Rules.tsx` | **old design** | React page, long-form |
| `/race` | `Race.tsx` | **old design** | React page, not an iframe; reads `upcoming_events.json` and `past_races.json` |
| `/build` `/learn` `/course` | iframes | **iframe of the old site** | `CLAUDE.md` rule 9: these stay iframes in v1 unless Cedric says otherwise |
| `/chat` | `Chat.tsx` | old | Unchanged this revamp |

When you build a page: one page per branch (`revamp/<page>`), `/build-page
<page>`, then `/qa-page <page>`, then Cedric reviews on localhost, then `/ship
<page>`. Use the landing as the pattern source, not a template to copy.

---

## 4. The visual system a new session must know

Read `.claude/skills/roboracer-design-system` for the full contract. The parts
that are easy to get wrong:

- **Containers.** `--container-page` (1800px) is the shared page width. Use
  `<Section width="page">`, or `mx-auto max-w-page px-6` inside a `bleed`
  section. Every landing section shares that edge; a new page must too.
  `content` (72rem) is for long-form text only.
- **`desktop:` variant** (`src/index.css`, `@custom-variant`) means *wide **and**
  at least 34rem tall*: `(min-width: 48rem) and (min-height: 34rem)`. Use it,
  not `md:`, for anything pinned or viewport-height — a landscape phone is wide
  but has no vertical room. `DESKTOP_QUERY` in `src/lib/motion.ts` is the same
  query for JS.
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

## 8. Hero cinematic trial (branch `revamp/hero-cinematic`, 2026-08-30)

An overnight trial of a scroll-scrubbed film hero (Higgsfield-generated from the ICRA 2026
photos): contract `docs/plans/hero-cinematic-v1.md`, report `docs/hero-lab/REPORT.md`, QA
`docs/qa/hero-cinematic.md`. Worktree `../roboracer-site-wt/hero-cinematic`; `/` shows the film,
`/?hero=classic` the clip-cycle hero. The frames live only locally under `public/media/hero-cine/`
(git-ignored; R2 upload is the first follow-up), so a dev server started before they were cut
needs a restart. Nothing on `revamp/landing-v1` changed; the draft PR is for Cedric's decision.
