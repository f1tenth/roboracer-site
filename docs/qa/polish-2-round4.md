# Fix round 4 (final QA fixes)

Branch `revamp/p2-round4`, from `fcf0098` ("docs(handoff): PR #20"). One
commit per item. `npm run lint` and `npm run build` pass at the head. Source
of the items: the final QA (`docs/qa/polish-2-final.md` in the p2-leaderboard
worktree) and the lead's batches 2 and 3.

## Method

- Production build (`npm run build`, `.env.production`, hero clips from R2),
  served by `vite preview --port 4203`, driven by Python Playwright (Chromium,
  headless; SwiftShader GL on the landing).
- CLS: a fresh context per load, a `layout-shift` PerformanceObserver injected
  before any script (`buffered`), shifts without recent input summed at 7 s,
  no scrolling. 390x844 and 844x390 in touch contexts with a mobile UA unless
  noted.
- Captures: `docs/qa/polish-2-round4/` in this worktree (git-ignored).
- The machine was swapping during batch 2 and 3, so those items have one
  production-build check each, not a matrix.

## Batch 1

| # | Item | Before (`fcf0098`) | After | Commit |
|---|---|---|---|---|
| 1 | /rules layout shift on cold load | 1536x730: **0.4668** (`footer y250->0` 0.4397, then `div.rules-body y158->142` 0.0270); 390x844: 0 | 1536x730: **0.0030** (3 of 3 runs); 390x844: **0** (3 of 3); 1366x650: **0.0009**; 844x390: **0** (touch), 0.0129 in a desktop context. What is left is the source line rewrapping at the font swap (`#text y86->84`) and the nav text | b96b6e6 |
| 2 | Platform dial indices over the words | Ink boxes (glyph ascent/descent from the baseline, times the row scale): at 1366, 1536 and 1920 every state has an index over a neighbouring word (for example at 1536, Learn state: "02" over "Build" 196 px2); 768 two states | **No index or word ink meets another row's** in any of the four states at 1366x650, 1536x730, 1920x1080 and 768x1024; the four words share one left edge; the active index's top is within 1.1 px of the word's cap height | 12cbc81 |
| 3 | Footer edge | Content column at x=358 at 1536 (sections at 67) | Footer content left = section content left: **67.2 / 67.2** at 1536, 26 / 26 at 1366, 84 / 84 at 1920, 24 / 24 at 768 and 390; right edges match too (1468.8 at 1536). Phone layout unchanged (it was already `px-6` below lg) | b6e09bd |

Notes:

- **Rules (1).** Two causes, two changes. The footer: the page (`.rules`) now
  holds at least one window of height (`100vh`, then `100svh`), so the footer
  starts below the first window while `rules.md` loads. On the page, not the
  placeholder: a window-tall placeholder that moves 16 px when the source
  line rewraps counts its whole area (measured 0.0279). The 16 px jump: it was
  the web font, not the file. The source line wraps to three lines in the
  fallback face and two in Manrope at 1536 (50.4 px, then 33.6 px); the file
  arrived at 455 ms, the fonts at 514 ms. The rulebook now waits for
  `document.fonts.ready` once the file is in, capped at 1 s. With the fonts
  held 2.5 s (over the cap) the rulebook shows at 1 s and takes the old small
  jump (0.028 at 1536): the cap is the trade. Deep link `/rules#kill-switch`
  still lands (target 141 px from the top at 1536, 176 at 390); `rules.md`
  held 1.5 s: footer at y=730 at 1 s (off screen), CLS 0.0030.
  No other route changed: `/` 0.0001, `/about` 0.0026, `/race` 0.0005,
  `/research` 0.0002, `/news` 0.0002 at 1536 (0 to 0.0028 at 390).
- **Dial (2).** Each index hangs in a 2rem column left of its word, top on the
  word's cap height; each row scales about its word's left edge
  (`origin-[var(--dial-index)_50%]`), so the words keep one edge and the body
  and link below sit on it too. Captures `dial-after-<size>.png` (the four
  states side by side), `dial-before-*` for comparison.
- **Footer (3).** Captures `footer-after-<size>.png`.

## Batch 2

One production-build check per item (the machine was swapping).

| # | Item | Check | Result | Commit |
|---|---|---|---|---|
| 1 | /rules CLS at 1366x650 and 844x390 (QA: 0.4864, 0.0641) | One cold load each | **0.0009** at 1366x650; **0** at 844x390 (touch), 0.0129 in a desktop context at 844x390 (the placeholder line moving when the source line rewraps at the font swap) | b96b6e6 (batch 1) |
| 2 | `car-studio.webp` requested on every landing load | Landing at 1536, scrolled into the car chapter | **0 requests** for `car-studio*`, 0 console errors; the 3D render shows as before. `car-studio-cutout.webp` (reduced motion) is guarded the same way | 0f5f0a6 |
| 3 | Car callouts printing over each other | Text boxes of the open labels, pairs sharing a column, gap vs one label height; "ready" = pin progress 0.3 (4 labels open), "exploded" = 0.8 (7 open) | **No pair closer than one label height** at 768x1024, 1366x650, 1536x730 and 1920x1080 in both states (before: Power board over Jetson Orin at 1366/1536/1920 ready, VESC on Traxxas at 768 exploded, per the QA). Captures `car-after-<size>-<state>.png` | 1ae34f5 |
| 4 | "The Roboracer Foundation", footer "Join Slack" | grep of `dist/data`, DOM | No "The Roboracer Foundation" in any data file (7 display fields now "RoboRacer Foundation", URLs unchanged); footer link reads "Join the Slack" | d2def75 |
| 5 | "Team, 1st place ICRA 2026" | grep of `dist/data` | "1st place, ICRA 2026" on the community card and the matching /news card (same fragment there) | 688a748 |
| 6 | "· verify" inside the Join photo caption | DOM | Caption "4th F1TENTH Korea Championship · Incheon, Nov 2025" followed by the shared `VerifyTag` chip (`caption_verify: true`) | d24938a |
| 7 | "September 28-30, 2026" | DOM, landing and /race | Landing spotlight "September 28 to 30, 2026"; /race This season: "August 24 to 27, 2026", "September 6 to 9, 2026", "September 28 to 30, 2026" (IFAC follows so the card has one date style). Note: the skill also says "Sep 28-30, 2026" in cards; the lead's wording was used | 000c46f |
| 8 | /about 02 lead and Contributors line | DOM | "Each has its own page." and "Everyone with a public commit in the f1tenth GitHub organization, where the car, the simulator, the ROS stack and the labs are built." Count and link unchanged | 6d32a54 |
| 9 | UPenn result, VTC dates | grep, DOM | "2nd in time trials and 5th overall" in the news title and community card; VTC 2026 Fall "September 6 to 9, 2026" (`ends_at` Sep 9) | 31a57fe |
| 10 | Questions for Cedric | n/a | Five questions added to `docs/CONTENT.md` ("From the final QA"); site unchanged | 52be4fb |

## Batch 3

| # | Item | Check | Result | Commit |
|---|---|---|---|---|
| 1 | /news UNC Endeavors link refuses connections | Wayback capture `curl -L`: 200; DOM | Card links `https://web.archive.org/web/20260515201552/https://endeavors.unc.edu/the-fast-and-the-autonomous/`; accessible name "The fast and the autonomous ↗ (archived copy)". News items take `archive` (+ `archive_note`), as the race timeline does | a56e46a |
| 2 | Hero: the stalled clip keeps playing its 1920 file | QA step 6 method: 1536x730, CDP 625,000 B/s, 40 ms, `navigator.connection` undefined, 40 s at the top, clips from R2 | Before (QA): 18 `waiting` on `race-01-1920` between 8.4 and 31.7 s, about 13.6 s frozen. After: `race-01-1920` waits 1.45 s, 1.29 s, then 1.98 s; the stall threshold passes at 14.4 s, `race-02-960` is requested at once and plays at 15.8 s (crossfade done about 16.7 s). Then `race-02-960`, `race-03-960` and `iv-rest-v2-960` play through: 0.9 s of waiting at race-02's start, none after. About 5.6 s frozen on race-01 in all. The stalled clip's unfinished download is dropped after the crossfade | 98edf4f |
| 3a | "6 continents" | grep "continent" | The Join block's third stat was `community.json` "continents": 6, recorded as an estimate and not in the skill. Stat, field and type removed; the block shows 3,000+ members and 25 time zones (Cedric). `scripts/slack_stats.py` still writes the field; the site ignores it | fff8385 |
| 3b | Ayagoz Smagulova without a role | DOM /about | Card reads "Ayagoz Smagulova, Design, roboracer.ai" (`project_role`, source "CLAUDE.md, 2026-08"; the skill has no role for her) | 788650d |
| 3c | KATECH partner link is http | `curl -sI https://www.katech.re.kr/` | **Left as is**: curl exits 60 (certificate chain not verifiable; `-k` answers 200; http answers 200). The rule was "https only if curl resolves it" | none |

## Also seen

- The car callout "Steering servo · verify" (`src/components/racecarAssemblyData.ts`)
  prints a status word in a public label, the same pattern as batch 2 item 6.
  Not changed.
