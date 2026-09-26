# p3 code review: `926d2bc..34285e1 -- src public/data`

Read-only review of the seven p3 branches merged on 2026-09-25 plus the
hash-link fix (34285e1), at `revamp/polish-2` 34285e1 in
`../roboracer-site-wt/p3-qa`. Every finding below was traced through the code
path. Two are also visible in the integration QA's own captures
(`docs/qa/p3-integration/hash-direct-*.png`). `npx eslint src` is clean. No
build was run, because `tsc -b` writes build info into the worktree.

No high-severity bug turned up. The two mediums are both in the hash-link fix
(34285e1), which reuses the landing's `useScrollToHash` on pages it was not
designed for.

---

## Medium

### M1. `/about#about-spinoffs` lands with its heading under the fixed nav bar, and `/race#leaderboard` does the same on phones

- **Where:** `src/hooks/useScrollToHash.ts:121-127` (`top = topOf(el)`, then
  `scrollTo(0, top)` or `glideTo(top)`), `:36-37` (`holdAt` re-applies the
  same `topOf`). The targets are `src/pages/About.tsx:357`, where the id sits
  on the `SectionHeader` h2, and `src/pages/Race.tsx:376`, where it sits on
  the `Section`.
- **What happens:** the hook puts the target's top edge at y = 0. It knows
  nothing about the fixed, opaque paper bar (`.navbar`, `--nav-alpha: 1` off
  the hero, 3.5 to 5.3125rem tall), and it ignores `scroll-margin-top`.
  - On the landing this never showed, because `#start` carries its own
    `pt-[calc(var(--spacing-nav)+2rem)]`.
  - On /about the target is the h2 itself. The "04" eyebrow ends up above
    the window, and "Spinoffs" plus its subtitle end up under the bar.
  - On /race the target is the section, whose phone padding is
    `clamp(3rem, 7vh, 4rem)`. That is shorter than the 4.5rem bar, so the
    "05" eyebrow sits under it.
- **Failure scenario:** a docs link opens `/about#about-spinoffs` at 1536 or
  390. The reader's first line is "Two so far." with no section name. The QA
  captures `hash-direct-about_about-spinoffs-1536.png` and `-390.png` show
  exactly this. `hash-direct-race_leaderboard-390.png` shows the "05" cut by
  the bar.
- **Smallest fix:** make the hook honour scroll margin, and give headings the
  margin Research already uses:
  ```ts
  // useScrollToHash.ts
  const topOf = (el: HTMLElement) =>
    el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  ```
  Then add `scroll-mt-[calc(var(--spacing-nav)+1rem)]` (Research's `UNDER_NAV`)
  to the h2 in `SectionHeader.tsx:56` and to `Section id="leaderboard"`.
  `scroll-margin` only affects scroll-into-view, so nothing else moves. The
  landing's `#start` stays as it is: it has no scroll margin and keeps its own
  padding.

### M2. `/about#about-spinoffs` jumps before the content above it has loaded; only the browser's scroll anchoring puts the reader back

- **Where:**
  - The wait for busy content checks only the target and its descendants
    (`src/hooks/useScrollToHash.ts:113`).
  - The target is the h2 (`About.tsx:357`). The busy placeholder
    (`About.tsx:378-381`) is its sibling, not inside it.
  - `PartnerWall` returns `null` until `partners.json` arrives
    (`src/components/about/PartnerWall.tsx:84`), and the contributor strips
    wait on `contributors.json`. Both sit above the spinoffs.
  - `holdAt` re-applies the jump only on ScrollTrigger `"refresh"` events
    (`useScrollToHash.ts:40`). /about never dispatches one when its data
    lands. The landing does, at `Landing.tsx:263-266`.
  - A `Reveal` mounting later does not dispatch one either: a new, unpinned
    ScrollTrigger calls only its own `self.refresh()`, and the global
    `_queueRefreshAll` is for pins only (gsap `ScrollTrigger.js:1293-1294`).
- **What happens:** `go()` finds the h2 on the first animation frame after
  mount, with nothing busy, and jumps there. `partners.json` then renders
  about 80 logos in groups above the target (four groups of 48 to 80px rows),
  so the target moves down by 1,000 to 2,000px after the jump.
  - Chromium and Firefox correct this with CSS scroll anchoring. That is why
    the QA capture, taken in Chromium, is right.
  - A browser without scroll anchoring stays where it jumped, which is now
    inside the partner wall. The repo's own note at `Rules.tsx:92-93` says
    Safari has none. If that holds, every iPhone reader is affected.
- **Failure scenario:** on an iPhone, open `/about#about-spinoffs` on a cold
  load. You land among the university logos, one or two screens above
  "Spinoffs".
- **Smallest fix:** copy the landing's pattern into `About.tsx`, so the
  4-second hold re-applies the jump once the data is in (it also refreshes the
  `Reveal` trigger starts):
  ```ts
  useEffect(() => { ScrollTrigger.refresh(); }, [partners, contributors, videos, spinoffs, youtube]);
  ```
  Verify on WebKit (Playwright `webkit`), not Chromium. /race has the same
  exposure in principle (TeamGrid renders nothing until `teams.json`), but
  there the jump waits for the leaderboard's cross-origin reads, which almost
  always finish after the local `teams.json`.

---

## Low

### L1. `rankOf` leaves a gap on an even-length carousel when every strip fits

- **Where:** `src/components/ui/ResearchCarousel.tsx:180-184`, `rankOf`:
  `return before < after ? before * 2 - 1 : after * 2;`
- **What happens:** with even `n`, the card opposite the active one ties
  (`before === after === n/2`) and gets rank `n`. Rank `n - 1` is never
  handed out.
  - When the fit allows every strip (`fit.strips === n - 1`), that card is
    dropped (`rank > strips`). The active card's width still reserves
    `n - 1` strips (`calc(100% - strips * (--rc-i + --rc-gap))`), so a
    strip-wide hole opens at the row's end.
  - With `n = 2` the only neighbour is never shown.
  - This contradicts the new comment ("keeping the ranks up to `strips`
    shows exactly that many strips").
  - It is latent today: `featured_order` has 11 papers, and 11 gives ranks
    1 to 10 with none missing.
- **Scenario:** Cedric trims `featured_order` to 4 papers. At 1536 the fit
  allows 3 strips, but only 2 show, followed by an empty slot.
- **Fix:** break the tie toward the earlier rank:
  `return before <= after ? before * 2 - 1 : after * 2;`

### L2. Forward or Back onto a same-page hash entry glides to the anchor instead of restoring the reader's place

- **Where:** `src/hooks/useRouteScroll.ts:66-73` restores the entry's stored
  position in a layout effect. Then `src/hooks/useScrollToHash.ts:91-131`
  runs because `key` changed. That is not the arrival key, so it glides to
  the hash target and moves focus there.
- **What happens:** this breaks the contract written at
  `useRouteScroll.ts:34-36`: Back and Forward inside one page return exactly
  where that entry was left.
- **Scenario:** on `/`, click "Start here" (the `/#start` entry) and scroll
  down to Research. Press Back: `/` is restored, correctly. Press Forward:
  the Research position is restored for one frame, then the page glides back
  up to `#start` and focus jumps to the section.
- **Fix:** in `useScrollToHash`, read `useNavigationType()` and return early
  when it is `"POP"` and `!firstVisit`. `useRouteScroll` owns that case.

### L3. Reload now always opens at the top, and history entries from before a reload lose their positions

- **Where:**
  - `src/lib/motion.ts:19`: `clearScrollMemory("manual")`.
  - `src/hooks/useRouteScroll.ts:6`: `positions` is a module-level `Map`,
    lost on reload.
  - `:56-61`: the reset also runs on the first mount.
- **What happens:** before this change Chrome restored the scroll position
  on reload. Now a reload of `/research`, deep in 2023, or of `/rules` puts
  the reader at the top. After a reload, Back to an earlier same-page entry
  (a rulebook anchor, say) does nothing, because no position was kept.
- **Scenario:** Cedric reviews `/rules` at section 7 and presses Cmd-R after
  an HMR hiccup. He is back at the top.
- **Fix, if it is unwanted (ask Cedric):**
  - Persist `positions` in `sessionStorage`; Navigation API keys survive a
    reload.
  - On a `performance.getEntriesByType("navigation")[0].type === "reload"`
    first mount, restore instead of resetting.

### L4. On phones the research list stretches 320px thumbnails to full width

- **Where:**
  - `src/components/research/figures.ts:27-29`: `rowThumb` is always a
    320x200 file.
  - `src/components/research/PaperRow.tsx:68`: the plate is now `w-full`
    below `desktop:`.
- **What happens:** at 390 the figure is about 342 CSS px wide, drawn from a
  320px file. That is about a 3x upscale on a 3x phone, and in the two-up
  landscape grid it is about the same. Cedric asked for "images larger" and
  got blurrier ones. Desktop at `lg` (20rem) is already about 2x.
- **Fix:** below `desktop:`, prefer `p.thumbnail` (1200x750) when it exists.
  Otherwise emit a 640 or 960 `*-row-*.webp` and add `srcset`.

### L5. The replay column appears, then disappears, when a board has fewer than two recordings (latent)

- **Where:** `src/components/race/Leaderboard.tsx`, the `replay` line:
  `replayCfg && (!board || canReplay(board))`.
- **What happens:** while a board loads, `board` is undefined, so the table
  takes 5 columns and the poster 7. When the file arrives and
  `canReplay(board)` is false, the grid flips to 8 plus 4 and the poster
  vanishes. It happens again on every chip switch to that board. That is a
  visible layout shift. Today every row on both lab-4 boards has a recording
  (`docs/LEADERBOARD.md`), so it cannot trigger yet.
- **Fix:** key the decision on the board summary rather than the file, for
  example with a `recorded` count in `index.json`. Or keep the column and
  show the poster with a "no recorded laps on this board" line instead of
  removing it.

### L6. Dead fields and stale comments left by the verify-tag removal and the merges

- `JoinPhoto.caption_verify` (`src/lib/data.ts:279-281`) and
  `public/data/community.json:14` (`"caption_verify": true`): nothing reads
  them since `VerifyTag` was deleted. The comment still promises "the shared
  verify tag follows it". Delete both, or mark the field bookkeeping-only the
  way `Team.status` now is.
- `src/components/about/people.json:2` (`note`) still says a person without
  a sourced role "carries status verify and a mono tag".
- `src/components/ui/CommunityJoin.tsx:59` docstring says "Landing section
  09", but the landing now passes `index="08"`.
- `src/components/race/LeaderboardReplay.tsx:217`: the play glyph is a fixed
  `width="18" height="18"` px SVG inside a rem-sized disc. It is the only px
  size in the new components that does not follow the fluid root (HANDOFF
  §4). Use `className="size-[1.125rem]"`, as `SocialGlyph` does.

---

## Checked and found sound

- **`useRouteScroll`:**
  - The scroll listener is removed on cleanup and the refresh rAF is
    cancelled.
  - StrictMode's double run is harmless: `remember(0)` runs before the POP
    restore, so the restore reads 0.
  - The scroll setter goes through `ScrollTrigger.getScrollFunc(window)`, so
    ScrollTrigger's cache stays correct.
  - `clearScrollMemory("manual")` sticks: `_refreshAll` re-applies
    `_scrollRestoration` on every refresh (gsap `ScrollTrigger.js:312`).
  - Lazy routes reset only when the new route commits (transition), which
    matches the integration QA.
  - Native `#anchor` entries are keyed by the Navigation API. Where that API
    is missing, a null `history.state` makes `remember` a no-op; it does not
    write to a wrong key.
  - Rules keeps its own arrival handler (`Rules.tsx:75-104`), so
    `/rules#...` deep links still work after the mount reset.
- **`LeaderboardReplay`:**
  - The crop transform is right: `translate(-(frame-crop)/2*s) scale(s)`
    with `origin-top-left` maps the crop's corner to (0, 0).
  - A width of 0 gives scale 0, not NaN.
  - There is one keyed iframe per board and run, so no history entry is
    added (the board itself only uses `replaceState`).
  - `allow-same-origin` is safe because the frame is cross-origin.
  - The reveal timer is cleared on href change, on restart and on unmount.
    The ResizeObserver is disconnected.
  - Focus moves into the frame only after a keyboard activation
    (`detail === 0`), and QA confirmed Tab can leave the frame.
  - Both posters exist at exactly 2x their crops (1960x1350, 804x1294).
- **`leaderboardData`:**
  - `readReplay` validates the replay block, and `FALLBACK_CONFIG` equals
    `leaderboard.json`, so the href is stable from first paint.
  - A refresh that keeps the same board does not reload the frame (the href
    is unchanged).
- **`StartHere`:**
  - `BUNDLED_PATHS` matches `paths.json` field by field, all 5 paths.
  - All 22 media files referenced by the new components exist, with the
    declared dimensions.
  - Ids are unique per page (`start` / `start-title` on the landing,
    `about-start` on /about; the two routes never mount together;
    `start-<id>-line` appears once per row).
  - The stable `key`s keep the same `<li>` nodes from the loading state to
    the loaded one, so `Reveal`'s inline styles land on the real rows.
  - Reduced motion creates no `<video>`, and `Reveal` animates only under
    `no-preference`.
  - IntersectionObserver and `canplay` listeners are cleaned up.
  - `aria-busy` gates the `/#start` jump.
- **Research:**
  - `shown + rest` always equals the year's items, and singular and plural
    are right in both summary labels.
  - With a topic or a search, every match shows and no fold renders.
  - The figures-first sort is stable (it copies per year, so it does not
    mutate state).
  - The `<details>` summaries carry one visible label each, with the
    chevron `aria-hidden`.
  - Headings go h1, h2, h3 (year), h4 (paper).
  - The jump links and `#contribute` use `scroll-mt` under the bar.
  - The controlled featured fold does not loop through `onToggle`.
- **`ResearchCarousel`:**
  - The strip count now uses the row's content box.
  - The fit math has no division by a variable and guards `--spacing-nav`
    against NaN.
  - `setFit` bails out on equal values, so there is no ResizeObserver loop.
  - The resize listener is removed on cleanup.
  - The rank fix is correct for odd `n`: n = 11 gives ranks 1 to 10.
- **`CommunityJoin` / `SocialButton`:**
  - `SocialGlyph`'s `useId` keeps gradient ids unique across the four
    glyphs.
  - `ChannelRow` has a proper accessible name.
  - The Slack button stays the section's only solid violet button.
- **`SpinoffGrid` / `spinoffs.json`:**
  - Every field the component reads is present in both entries.
  - A `TODO(content)` origin is hidden (Quanser).
  - The preview window's and the car link's new-tab labels are present.
  - Hover motion is `motion-safe`.
- **Dead code:** nothing in `src` still references `platform.json`,
  `loadPlatform`, `PlatformRow`, `EntryPaths`, `PlatformPanel`,
  `PlatformList`, `VerifyTag` or `spinoffShown`. No script under `scripts/`
  reads the deleted `platform.json`. `eslint src` passes.
- **`teams.json` / `events_map.json`:** the Bonn/UNIST correction is
  consistent between the team entries and the map's country notes, and
  `TeamGrid` drops `TODO(content)` institutions.
