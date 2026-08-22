# roboracer.ai revamp plan

Owner: Cedric Hollande. Design: Ayagoz Smagulova. Stakeholder: Rahul Mangharam. Target: the new site live before IROS 2026 (Sep 28), with the next-race spotlight and research page live first.

## Principles
- Quality over speed. Every page ships only after Cedric reviewed it on localhost and Ayagoz reviewed the design.
- Branch per page, PR per page, `main` is always deployable. Deploy is automatic from `main`.
- Data-driven content, tokens-driven design, documented decisions. Anything Claude cannot verify becomes a `TODO(content)` and a question, never a guess.
- Automate everything repetitive (audits, QA, screenshots, paper intake); keep judgment calls (copy, layout, media choice, merge) human.

## Phases and gates

### Phase 0: harness (done in this handoff)
CLAUDE.md, settings and hooks, 6 subagents, 10 project skills + 14 vendored skills, publication tooling, helper scripts, this plan. Gate: `scripts/rr.sh setup` and `scripts/rr.sh check` pass on Cedric's machine; `/discover` runs.

### Phase 1: discovery (one session, ~1 hour of agent time)
`/discover all` runs four read-only agents in parallel: repo-auditor (docs/AUDIT.md), design-extractor (docs/DESIGN.md + tokens), asset-harvester (docs/ASSET_MANIFEST.md), content-auditor (docs/CONTENT.md + proposed JSON). Outputs land on `infra/discovery` as a PR for Ayagoz.
Gate: Cedric answers the "decisions before design" list in docs/DISCOVERY_SUMMARY.md and sends the Rahul questions. Ayagoz reads DESIGN.md.

### Phase 2: design system (one session, branch `revamp/design-system`)
Approved tokens into `src/index.css` `@theme`; fonts loaded properly (self-host woff2 or Google Fonts with `preconnect`); `src/components/ui/` primitives (Section, SectionHeader, Button, Reveal, Marquee, StatCounter, MediaFrame, EventCard, LogoCloud, TagFilter, PinnedChapter, VideoHero); `src/lib/data.ts` typed JSON loaders; `usePrefersReducedMotion`; GSAP + ScrollTrigger + @gsap/react + lenis installed and a `src/lib/motion.ts` with the registered plugins and the shared eases. `ExplodedModel` built on the existing `/assembly` viewer scene (explosion amount as a scroll-driven prop, lazy-loaded; keep `/assembly` as the immersive full viewer, add it to the footer/about as "Explore the car") and `TeamGrid`/`HighlightReel` primitives; `public/data/teams.json` seeded with `status: verify` entries. A `/styleguide` dev-only route rendering every primitive in both ink and paper variants, used for review with Ayagoz.
Gate: styleguide reviewed on localhost by Cedric and Ayagoz; `/qa-page styleguide` passes; PR merged (the route is fine to ship, it is harmless and useful).

### Phase 3: pages (one branch each, in this order)
1. `landing`: full-bleed FPV hero video (Neobotics-style, from Cedric's roboracer_fpv.mp4), next-race spotlight (IROS 2026), highlights reel from past competitions (template with placeholder media, Cedric swaps clips later), what RoboRacer is with the 3D car chapter (parts assemble inward on scroll, from the URDF/GLB), community scale, sponsors, featured teams (always below sponsors, up to 10 seeded from past results), research teaser with the 1,000+ message, build/learn entry points, Slack CTA. Replaces the 13 MB unused video and the 4.5 MB hero background.
2. `research`: publications.json seeded by `scripts/migrate-bibtex.py`, tag filters, featured grid (Rahul picks 10 to 25), year-grouped list with search, Scholar CTA, submit-a-paper CTA. Retire the BibTeX fetch.
3. `race`: next race spotlight (same data), upcoming events, past races as a timeline grouped by year with 30 entries, how to compete (register, rules, resources, orientation dates), sponsors block.
4. `about`: introduces the whole thing in depth: story (2016 Penn, formerly F1TENTH, why 1/10 scale, open source), the platform (car, sim, courses, races, research), organizing team with roles (after Rahul confirms), partners (full set reconciled with the 70 logos), sponsors (tiers + become a sponsor), featured teams below sponsors, contact. Same theme and primitives as landing.
5. `news` (data refresh + card redesign), `rules` (typography only), `nav-footer` (final pass, social links, active states, mobile menu motion).
6. Later: `build`/`learn`/`course` landing sections in front of the iframes; a `/iros2026` redirect or embed decision.
Per-page gate: `/build-page` -> `/qa-page` PASS -> `@qa-reviewer` SHIP -> Cedric localhost review -> Ayagoz design review -> `/ship` -> Cedric merges -> live check.

### Assembly viewer follow-ups (from the Codex handoff, schedule after landing ships)
Generate the transform manifest from the xacro in `scripts/sync-racecar-assets.mjs`; vehicle-size selector (F1TENTH / F1FIFTH / full scale) using the original formulas; URL state for vehicle, explosion amount, selected part; Playwright tests for slider, visibility toggles, export; decide whether `/assembly` gets a nav entry or stays a deep link.

### Phase 4: hardening
Lighthouse on the live site (target: Performance 90+ mobile, Accessibility 100, Best Practices 100, SEO 100), OpenGraph/Twitter cards per route (fixing-metadata skill), sitemap + robots, 404 page, analytics decision (none, Plausible, or GA4), `test_build.yml` gets `synchronize` so PR pushes rebuild, Cloudflare media bucket documented, README updated for contributors.

## Review protocol (how Cedric gives feedback)
1. `rr-review <page>` (or `cd ../roboracer-site-wt/<page> && scripts/rr.sh dev --port 0`) and look at the URL printed.
2. Feedback goes in the same Claude Code session as short, concrete notes: "hero headline too long", "chapter 2 pins too long on mobile", "use the ICRA podium photo instead". Claude edits, HMR refreshes, repeat.
3. Design feedback from Ayagoz comes as PR comments or screenshots; Cedric pastes them into the session.
4. When it looks right: `/qa-page <page>` then `/ship <page>`. Merge in GitHub. Check roboracer.ai after the Actions run (2 to 4 minutes).

## Paper intake (day to day, after Phase 3.2)
- One paper: in any Claude Code session on the repo, `/add-paper <doi|arxiv|url|pdf path>`; answer one confirmation if asked; merge the PR.
- From the browser or phone: Claude Code on the web (claude.ai/code) with the roboracer-site repo connected; type the same command; the project skill is in the repo so it is available there too. Upload the PDF to the session or paste the link.
- Automatic: Mondays the `discover-papers` workflow opens a PR listing candidates; Cedric or Rahul skim, run `/add-paper` for keepers (or comment "accept all" and let Claude do it), reject the rest.
- Curation: `featured: true` for the showcase (keep under 30), `status: hidden` to retire.

## Decisions log
- 2026-08-20: stay on Vite + React (no Next.js migration); add GSAP/ScrollTrigger/lenis; keep Build/Learn/Course as iframes in v1; one PR per page; publications move from external BibTeX to `public/data/publications.json`; Google Scholar is linked, not embedded or scraped; neobotics.org is a pattern reference only.
- 2026-08-20 (Cedric, Phase 2 go): D1 magenta #D946EF is the interactive accent, cyan #00D1DA reserved for logo and telemetry. D2 blue-900 CTA retired. D3 ink for landing/race/about, paper for research/news/rules. D4 Space Grotesk + Manrope kept, card radius 1.25rem, gradient only on display text and the logo (Ayagoz may override). D5 assembly viewer merges before the landing chapter; ExplodedModel reuses RacecarAssemblyParts. D6 dead-asset purge approved (shipped as PR #14, 43 MB). D7 NO Cloudflare: the hero loop encodes are committed under `public/media/hero/` as the one approved exception to the 1.5 MB rule (CLAUDE.md rule 3 amended). D8 IROS 2026 public copy: headline "September 28 to 30, 2026, Pittsburgh", secondary "check-in and practice September 27". D9 /research moves to publications.json. D10 discovery PR stays stacked on the harness commit.
- 2026-08-20 (facts): IV 2026 Detroit podium 1st Thunderbolt (UPenn, Cedric Hollande), 2nd 404 Racers, 3rd WVU (name TODO); WVU's 3rd was at IV, not ICRA. ICRA 2026 Vienna: biggest event to date, 180+ competitors / 35 teams (VERIFY), UPenn 5th overall + 2nd time trials; gets substantial space on landing/race/news. Zero sponsors is correct - render Become-a-sponsor CTA, partners as proof of scale. Slack invite valid. Roster: five active names, roles TODO(content). Stats 90+/20+ stay until Rahul answers. Hero source: /home/cedric/Downloads/FPV_IV.mp4, loop cut 3s-36s (Cedric, Aug 21).
- 2026-08-21 (Phase 2 implementation): route-level React.lazy on every page (index chunk 1229 kB -> 346 kB, three.js in its own lazy chunk); racecar GLBs meshopt-compressed 2.04 MB -> 0.49 MB with no viewer change; lenis is opt-in per page (`useLenis`), not global, until the landing ships; legacy element/nav CSS kept under a marked block and deleted per page in Phase 3; `scripts/media.sh` created (the media skill referenced it, it did not exist).
- Open: font pairing final call + radius + gradient budget (Ayagoz); featured papers list (Rahul; interim auto-featured set applied); team roster roles (Rahul); historical sponsors (Rahul); social handles for the footer; analytics; higher-res hero master if one exists (source is 720p).

## Risks
- Content bottleneck on Rahul (team, sponsors, featured papers): build the sections with `TODO(content)` placeholders hidden behind a feature flag so pages can ship without them.
- Media permissions: start outreach in week one with the template in the media skill; design so every hero works with organizer-owned footage.
- Motion performance on mid-range phones: measure on a real device before approving pinned chapters; reduced-motion path is mandatory.
- GitHub Pages SPA routing and caching: the `404.html` copy is the fallback; after deploy, hard-refresh and check a deep link.
- Context drift in long Claude sessions: one page per session, `/compact` between pages, `/clear` before a new page; the skills carry the state, not the chat.
