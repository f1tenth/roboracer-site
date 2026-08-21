# roboracer-site (roboracer.ai)

Public website of RoboRacer (formerly F1TENTH): open-source autonomous racing platform, courses, research, and the international competition series. We are mid-revamp: a Neobotics-inspired, scroll-driven redesign in RoboRacer's own visual language. Quality beats speed. Cedric Hollande (Race Director, IROS 2026) reviews every page on localhost before anything merges; Ayagoz Smagulova co-owns design.

## Stack (do not change without an explicit decision from Cedric)

- Vite 6 + React 19 + TypeScript 5.7 + Tailwind CSS v4 (`@tailwindcss/vite`, tokens via `@theme` in `src/index.css`)
- Routing: `react-router-dom` v7, SPA. Routes live in `src/App.tsx`; layout in `src/components/Layout.tsx`
- Motion: `motion` / `framer-motion` (already installed). Scroll choreography: GSAP + ScrollTrigger + `@gsap/react` (`useGSAP`), smooth scroll: `lenis`. GSAP is fully free incl. plugins
- 3D: `three` + `@react-three/fiber` + `drei` (present, use sparingly)
- Content is data: `public/data/*.json` (events, partners, team, news, testimonials, publications). Copy changes are JSON edits, not component edits
- Deploy: push to `main` -> GitHub Actions `build_to_pages.yml` -> `gh-pages` branch -> GitHub Pages, custom domain `roboracer.ai` (`public/CNAME`). PRs run `test_build.yml`
- Node 20. `npm ci` for installs. Helper CLI: `scripts/rr.sh` (see `scripts/rr.sh --help`)

## Commands

```
npm ci                     # install (never npm install in CI paths)
npm run dev                # Vite dev server, HMR, default port 5173
npm run build              # tsc -b && vite build -> dist/  (must pass before any PR)
npm run preview            # serve dist/ (production-like check)
npm run lint               # eslint (must pass before any PR)
scripts/rr.sh page <name>  # new worktree + branch revamp/<name> in ../roboracer-site-wt/<name>
scripts/rr.sh check        # lint + build
```

## Hard rules

1. Never commit to or push `main`. Work on `revamp/<page>` (page builds), `content/<topic>` (data-only), `infra/<topic>` (tooling). One PR per page or topic. Cedric merges.
2. `npm run lint` and `npm run build` must pass before you call anything done or open a PR.
3. No binary over 1.5 MB enters git, with one standing exception approved by Cedric (2026-08-20): the landing hero loop encodes committed under `public/media/hero/` (each under 3 MB, poster required). There is no Cloudflare account; all other video and large GIFs are cut to fit, reduced to posters, or dropped (see skill `roboracer-media`). Images are compressed to WebP/AVIF with a poster for every video. Existing oversized files in `public/landing` get replaced, not duplicated.
4. Facts on the site (dates, fees, venues, deadlines, names, counts) come only from `.claude/skills/roboracer-content` or from Cedric. If a fact is not there, write `TODO(content): ...` in the JSON and tell Cedric. Never invent a sponsor, team member, stat, or date.
5. One theme across the whole site: every page uses the same tokens, nav, section rhythm, card language, and motion vocabulary from `.claude/skills/roboracer-design-system`. No page-specific palettes or one-off layouts. No ad hoc colors, no emoji as icons, no generic SaaS card grids as a first impression, no carousel without a narrative purpose.
6. Every animated element respects `prefers-reduced-motion` and degrades to a static, fully readable layout. Content must be visible and usable with JavaScript animations disabled.
7. Accessibility is part of done: semantic landmarks, one `h1` per page, alt text on every image, visible focus states, color contrast AA, keyboard reachable nav and CTAs.
8. Do not copy assets (images, video, SVG, copy) from neobotics.org or any third-party site. Neobotics is a pattern reference only. Media from community LinkedIn posts is used only after permission is recorded in the media manifest.
9. Keep existing routes working (`/`, `/about`, `/build`, `/course`, `/learn`, `/news`, `/race`, `/research`, `/rules`, `/chat`). `/build`, `/learn`, `/course` stay iframes in v1 unless Cedric says otherwise.
10. Prefer editing over adding. Delete dead code you replace. No parallel "v2" components living next to old ones after a page ships.

## How work flows

Discovery (read-only agents, outputs in `docs/`) -> design system (`src/index.css` tokens + `src/components/ui/*` primitives) -> one page per branch via `/build-page <page>` -> `/qa-page <page>` -> Cedric reviews on localhost -> `/ship <page>` opens the PR -> Cedric merges -> Actions deploys.

Use subagents for anything that floods context (audits, scraping, screenshot loops, log reading). Keep the main session for decisions and page work. Summarize findings into `docs/` files, not chat.

## Skills in this repo

- `roboracer-site-map` (what the repo is), `roboracer-design-system` (how it should look and move), `roboracer-content` (what is true), `roboracer-media` (where assets live, how they are processed)
- Tasks: `/discover` (run all audits), `/build-page <page>`, `/qa-page <page>`, `/add-paper <url|doi|arxiv|pdf>`, `/discover-papers`, `/ship <page>`
- Vendored third-party skills (see `.claude/skills/VENDORED.md`): frontend-design, webapp-testing, gsap-*, baseline-ui, improve-ui, create-design-md, fixing-motion-performance, fixing-accessibility, fixing-metadata, web-quality-audit, vite

## Definition of done for a page

Build + lint green; desktop (1440), tablet (768), mobile (390) screenshots reviewed; no console errors; axe: zero serious or critical violations; reduced-motion verified; every external link resolves; images lazy-loaded with dimensions set; no layout shift on load; copy matches `roboracer-content`; QA report written to `docs/qa/<page>.md`; Cedric approved on localhost.
