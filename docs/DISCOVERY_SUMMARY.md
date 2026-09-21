# Discovery summary — Phase 1

Run 2026-08-20 on `infra/claude-harness` (`3273a8a`). Four read-only agents: [AUDIT.md](AUDIT.md), [DESIGN.md](DESIGN.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [CONTENT.md](CONTENT.md) (+ `docs/design/tokens.proposed.css`, `docs/content/*.proposed.json`). Build and lint pass today. `src/` and `public/data/` were not modified.

## Decisions needed before Phase 2 (design system)

| # | Decision | Recommendation |
|---|---|---|
| D1 | Interactive accent: magenta `#D946EF` + violet, or keep cyan `#00D1DA` (today's nav hover, and the real end of the logo gradient)? | magenta UI, cyan reserved for logo/telemetry |
| D2 | Retire the navy `blue-900` CTA for magenta-on-ink / ink-on-paper solids? | yes |
| D3 | Ink/paper split: landing, race, about open on ink; research, news, rules stay paper? | yes |
| D4 | Font pairing — Space Grotesk + Manrope (kept) vs Archivo display; card radius 1.25rem vs 0.75rem; gradient budget | Ayagoz's call, needed before tokens land |
| D5 | Merge `feat/assembly-viewer` into the revamp line first? It merges clean (zero conflicts) and is already lazy-loaded | yes — the landing `ExplodedModel` chapter then reuses its scene instead of forking it |
| D6 | Approve the dead-asset purge: ~54 MB orphaned `crew/`, `src/pages/sections/` (~30 MB), 8 dead components, `f110_fpv.mp4`, `Logo_Gradient.gif` | yes, as one `infra/` PR before any page work |
| D7 | Cloudflare bucket + domain for media (blocked on Ahmad/Rahul) | needed before the landing hero can ship |
| D8 | IROS 2026 framing: race site says Sep 27 – Oct 1 (setup→teardown), content skill says Sep 28–30 (competition days) | pick one, it goes in the spotlight everywhere |
| D9 | `/research` moves from the live BibTeX fetch to `publications.json` (77 entries, currently read by nothing) | yes |
| D10 | This PR stacks on the unpushed harness commit — one PR into `main`, or split harness and discovery? | one PR, noted in the body |

## Questions for Rahul (paste into Slack)

> Hey Rahul — we've finished the discovery pass on the site revamp and hit a few things only you can answer:
> 1. Can you reconfirm the "90+ universities" and "20+ countries" stats on the landing page, or give me updated numbers?
> 2. Team roster: can you confirm the active list (Cedric Hollande, Ayagoz Smagulova, Yon Vanommeslaeghe, Ahmad Amine, Hongrui "Billy" Zheng) with roles + headshots, and say who from the current alumni/developer lists should be dropped or kept?
> 3. Sponsors: the site currently lists zero. Do you have historical or prospective sponsor names we can show, even as "past sponsor"?
> 4. Can you or Billy pick the 10–25 papers to feature on the new Research page? `publications.json` has 77 entries and none are flagged featured.
> 5. Are `f1tenth-coursekit.readthedocs.io` (Learn) and the Spring 2024 ESE6150 site (Course) still the right destinations, or has the course material moved?
> 6. Does WVU's "3rd place at ICRA 2026" map to a specific team name on the results page? Candidates we see are "UBM-Tom" and "UBM-Atlas" — I don't want to guess.
> 7. Who owns the Cloudflare bucket/domain for media hosting? Video over 1.5 MB can't go in the repo.
> 8. The IV 2026 Detroit results page still says "Results will be posted after the competition" — can someone update it, or send me the podium directly?

## Three biggest risks

1. **Content bottleneck on Rahul.** 17 open `TODO(content)` items, zero sponsors, an unconfirmed roster, no featured papers. Landing, about, and research all depend on them — build every such section behind a flag so pages can ship without it.
2. **No 2026 media exists and no permissions are cleared.** Zero team/podium/race-action photography in any of five harvested sources; 16 LinkedIn candidates all `permission: not-asked`; the hero loop is a 720p upscale (2.94 MB, in budget) and needs a higher-res original if one exists. Start outreach this week.
3. **Payload and perf.** One unsplit 1.2 MB JS chunk, 100 MB `public/`, and three.js becomes load-bearing on the landing page once `ExplodedModel` lands. Without code splitting, a Draco/meshopt pass (2.09 MB → ~0.4–0.8 MB), and the D6 purge, Lighthouse 90+ mobile is not reachable.
