# p3-scroll: every route opens at its top

Cedric, 2026-09-25: "When we switch pages it doesn't start from the beginning
of scrolling; it already loads the scrolling percentage or something we had on
the page we were just in." Branch `revamp/p3-scroll`, taskmap n277.

## How it was measured

`docs/qa/p3-scroll/repro_route_scroll.py` (Python Playwright, WebGL flags).
There are three profiles:

- mouse: 1536x730, fine pointer, so Lenis runs.
- reduced: 1536x730 with `prefers-reduced-motion: reduce`.
- touch: 390x844, `has_touch`, `is_mobile`. Links are tapped in the phone menu.

A recorder logs `window.scrollY` on every animation frame. The new route has
committed once `document.title` changes, because Layout sets the title in the
same commit that resets the scroll. The script reports the value at +0, +100,
+500 and +1500 ms after that commit, plus the min and max over all frames. A
case passes only if every frame reads 0, or the hash target for hash links.

```
python3 docs/qa/p3-scroll/repro_route_scroll.py http://localhost:4183 mouse,reduced,touch
```

## Before (base `b78ce9f`, dev server)

| Case | mouse | reduced | touch |
|---|---|---|---|
| `/` at 50% -> nav click to /about, /research, /race, /news | 0 on every frame | 0 | /about, /race: 0. **/research lands at 8798 (the bottom, 100%). /news lands at 1374** |
| Back to `/` from any of them | **7564 on the first frame, then 12185 (80.6%)** | **5708, then 9527 (83.5%)** | **7336, then 13291 (90.6%)** |
| Forward again | 0 | 0 | **/research and /news: 1848 and 1374 on the first frame, then 0** |
| Scrolled /about (40%) -> Back to `/` | **12185 (80.6%)** | **9527** | **13291** |
| Scrolled /about -> logo click to `/` | 0 | 0 | 0 |

Back always landed the landing lower than the reader had left it: 50% came
back as 80-90%. That is the "percentage" Cedric saw. Phones also got it on a
plain menu tap.

## Root cause

1. **Back/Forward (all devices).** `history.scrollRestoration` stayed
   `"auto"`, and ScrollTrigger writes back the value it read at startup on
   every refresh. Chrome defers the restore of a same-document traversal to
   the first layout after it. So it re-applied the old entry's pixel offset
   after Layout's `window.scrollTo(0, 0)`, when React had already rendered the
   landing. The landing then grows as its pin spacers and data sections come
   in, and scroll anchoring carried that offset down: 7564 became 12185.
2. **Nav tap on a phone.** Layout reset the window behind ScrollTrigger's
   back. ScrollTrigger caches the window's scroll and only re-reads it after a
   scroll event with a live trigger. With no trigger alive on the new page, its
   cache kept the landing's 7336. The rAF `ScrollTrigger.refresh()` recorded
   that stale value as the position to restore and scrolled /research there.
   The page was short at that moment, so it clamped to 1848. The research list
   then loaded and anchoring carried it to the bottom. On a mouse this does
   not happen, because the landing's Lenis cleanup runs a refresh before the
   scroll event.

These suspects were ruled out: a Lenis glide still running at click time
(tested with a DOM click mid-glide, lands at 0), `scroll-behavior: smooth`
(none on html), pin-spacer removal on its own, and `useScrollToHash`.

## Fix

- `src/lib/motion.ts`: `ScrollTrigger.clearScrollMemory("manual")` right after
  the plugins register. Scroll restoration is off, set through ScrollTrigger so
  its refreshes stop writing `"auto"` back.
- `src/hooks/useRouteScroll.ts` (new), called from `Layout`, holds all scroll
  placement:
  - Any change of pathname, whether clicked or Back/Forward, goes to the top.
    It goes through `ScrollTrigger.getScrollFunc(window)(0)` so ScrollTrigger's
    cache agrees, and then does the same rAF refresh as before.
  - Back/Forward within one page returns exactly where that history entry was
    left. The positions are recorded on scroll and keyed by the Navigation
    API's entry key, or by React Router's key where that API is missing.
    Before the fix the browser did this itself, and turning its restoration
    off would otherwise break it: the rulebook's in-text anchors and the
    landing's "Start here".
  - Hash targets stay with their pages: `useScrollToHash` on the landing and
    the arrival handler on /rules.
- `src/components/Layout.tsx`: the inline reset is gone and Layout calls the
  hook. The title effect stays.

The first version of the hook put a key into native anchor entries with
`history.replaceState`. That was dropped: nothing is written into history.

## After (fix, dev server and `npm run build` + `npm run preview`)

Every route-change case in every profile reads 0 on every frame after the
commit. There are 17 per profile, 51 in total, with 0 BAD. The production
build was checked with mouse and touch: 45 OK, 0 BAD.

```
[mouse] /about -> / (back): before=/about y=0 ... -> OK  ys=0,0,0,0 (all frames 0..0, final 0) | after h=15856 pct=0% lenis=True
[mouse] /about (scrolled 40%) -> / (back): before=/about y=5516 (40%) -> OK  ys=0,0,0,0 (all frames 0..0, final 0)
[mouse] / -> /research (nav click during a scroll glide): before=/ y=5936 (39.2%) -> OK  ys=0,0,0,0 (all frames 0..0, final 0)
[reduced] /research -> / (back): ... -> OK  ys=0,0,0,0 (all frames 0..0, final 0)
[touch] / -> /research (nav click): before=/ y=7336 (50%) -> OK  ys=0,0,0,0 (all frames 0..0, final 0) | after h=9642
[touch] / -> /news (nav click): ... -> OK  ys=0,0,0,0 (all frames 0..0, final 0)
[touch] /news -> / (back): ... -> OK  ys=0,0,0,0 (all frames 0..0, final 0)
```

Hash targets and same-page history (all three profiles, dev and prod):

```
[mouse] /about (scrolled) -> /#start (Start here click): y=2336 target=2336 vtop=0 OK
[mouse] full load /#start: y=2336 target=2336 OK
[mouse] full load /rules#kill-switch: vtop=141 scroll-margin=140.8 OK
[mouse] /rules in-text anchor #operator: at 5001 -> 1194; back -> 5001 (want 5001); forward -> 1194 (want 1194) OK
[mouse] / Start here: at 0 -> 2336; back -> 0 (want 0); forward -> 2336 (want 2336) OK
[mouse] Lenis after /about -> /: y0=0 y@50ms=201 y@1.5s=600 lenis-class=True OK (smooth)
[touch] /rules in-text anchor #operator: at 5001 -> 2497; back -> 5001; forward -> 2497 OK
[touch] / Start here: at 0 -> 1688; back -> 0; forward -> 1688 OK
```

Screenshots are git-ignored and stay in the worktree under
`docs/qa/p3-scroll/`:

- `1536-landing50-to-research.png` and `390-landing50-to-research.png`: the
  /research header after a tap from the landing at 50%.
- `1536-research-back-to-landing.png` and `390-research-back-to-landing.png`:
  the hero, with nothing scrolled, after Back.

## Also checked

- **Reload** opens at the top both before and after the fix: Layout reset on
  mount already did that. There is no behaviour change here.
- **Console**: the reduced-motion run once logged `requestStorageAccess:
  Permission denied.` twice. That message comes from a third-party embed
  iframe (YouTube or LinkedIn), not from site code: the string does not
  appear in `src/`. It did not come back on a clean pass over /, /about,
  /research, /race, /news and /rules. No site errors were logged.
- **Harness quirk**: a DOM `el.click()` on a rulebook `#anchor` does not make
  headless Chromium jump to the fragment, and base behaves the same way. The
  script therefore uses a real mouse click or touch tap for that case.
- `npm run lint`: clean. `npm run build`: passes, with only the usual
  chunk-size warning.

## Left

- `/race#leaderboard` has no hash handler on /race. A client-side link to it
  opens at the top, and a full load relies on the browser. That behaviour
  predates this branch: nothing in the site links there today, and it is
  outside this brief.
- In browsers without the Navigation API, anchor entries the browser creates
  itself carry no key. There, Back inside the rulebook stays where it is
  instead of returning. Changes of route are unaffected.
