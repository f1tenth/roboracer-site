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
- **Footer (3).** Captures `footer-after-<size>.jpg`.
