---
name: source-yield
description: Which of the 5 harvest sources (repo history, org repos, wayback, race sites, LinkedIn) actually produced new usable material, to prioritize future harvest passes
metadata:
  type: project
---

From the 2026-08-20 harvest pass (see `docs/ASSET_MANIFEST.md`):

- **`public/` itself (already in repo)**: by far the largest source (194 files, ~100 MB), and the one most in need of cleanup — 14 files already committed over the 1.5 MB git budget, all crew headshots / hero media / one old GLB. Always inventory this first; it's the baseline everything else gets compared against.
- **f1tenth GitHub org repos**: mostly a dead end. 51 repos, only 3 have media (`f1tenth_media` — 4 stale 2020 banners; `f1tenth_doc` — 291 files of car-build photos/GIFs, good for `/build` chapter; `f1tenth_coursekit` — race GIFs under `assignments/races/img/`, actual race footage, good race-page candidate). No repo matches the "site/web/race/.github.io" naming the harvest script looks for except this repo itself — `roboracer-site` *is* the org's site repo, there is no separate old-site-source repo to find.
- **Wayback (2024-01-09 f1tenth.org snapshot)**: low marginal yield — the crew and partner image sets in the archived `about.html` are **already 1:1 identical** to what's in `public/crew/` and `public/partners/` today, so no new headshots/logos surfaced. It *did* surface ~9 old race-event banner PNGs (2018-2023) not currently in `public/`, useful for a news/archive timeline, plus one of the only SVG logos found anywhere (`race/IROS-LOGO.svg`).
- **Race sites (icra2026/iros2026/iv2026-race.roboracer.ai)**: high yield for *current* (2026) material — organizer headshots, event logos, and (icra2026 only) a set of Austrian/German sponsor logos (FFG, Magna, TU Wien, HTU, Knapp, BMIMI, Qualisys) not yet in `public/partners/`. All three sites currently only have one motion asset: a 20.5 MB `roboracer_video.gif` of the same FPV footage already in `_harvest/hero/` — worth telling Ahmad/Rahul the new compressed encodes exist so those sites can swap too.
- **LinkedIn community media**: zero usable rows, by design (skill forbids scraping; permission tracked as `not-asked`). This is nonetheless the *best* likely source of real 2026 competition/podium photography, which is the single biggest content gap on the site. Prioritize outreach here over more repo/wayback digging next time.
- **`_harvest/drive/`**: did not exist in this environment session — Cedric's Drive sync folders (Logo, Posters 2026, Old Banners, 2026 ICRA/Media, Logos) were never inventoried. Re-check for this directory at the start of any future harvest pass; it's likely the richest source of 2026-specific assets once synced.

**How to apply**: on a repeat harvest pass, spend less time re-crawling GitHub org repos and Wayback (low new-yield, already captured) and more time on (a) checking whether `_harvest/drive/` now exists, (b) chasing LinkedIn permission status changes, (c) re-checking the live race sites for newly added photos as events approach.
