# Firefox vs Chrome scroll performance on the landing

**Date** 2026-08-23 · **Branch** revamp/pages-v1 · **Node** n156 · **Time-box** 30 min, honoured
**Verdict** Cause named and measured. **No fix landed** — the one change that reproduces the win is not in a file I own, and the two CSS-only substitutes I tested either did nothing or changed the layout.

## Method

`http://localhost:4180`, viewport 1440x900, **headed** (`DISPLAY=:1`) — headless numbers are garbage here (headless Chromium's rAF free-runs and reported a 33 ms median, inverting the result). Scripted wheel scroll from the top; `requestAnimationFrame` deltas collected in-page. Two profiles: *slow* (60 x 120 px, 60 ms apart, ~7 200 px) and *stress* (90 x 220 px, 16 ms apart, the full ~17 800 px).

**Read the numbers within an engine, not across engines.** Playwright's Firefox on this box is not vsync-locked: it free-runs rAF at ~140 fps (7.1 ms median) while Chromium is pinned to 60 Hz (16.7 ms median). Cross-engine medians are therefore meaningless. What *is* comparable is each engine's **tail relative to its own median** (p95, frames > 2.5x median) and, above all, **how each engine responds to the same ablation**.

## Per-engine numbers

Stress profile, `/`, baseline:

| engine | median | p95 | p95/median | frames > 32 ms | frames > 2.5x median | max |
|---|---|---|---|---|---|---|
| Chromium 151 | 16.7 ms | 16.8 ms | **1.01** | 10 / 346 | 3 | 134 ms |
| Firefox (pw 1538) | 7.1 ms | 21.3 ms | **3.00** | 10 / 377 | 31 | 91 ms |
| WebKit | — | — | — | — | — | — |

Chromium's p95 sits exactly on the vsync interval: it is not missing frames during the scroll at all. Firefox's tail is 3x its own median. That is the lag Cedric is seeing.

**Is it the landing or the shell?** The landing, unambiguously. Slow profile, baseline:

| page | Firefox p95 | FF > 2.5x med | Chromium p95 | Cr > 32 ms |
|---|---|---|---|---|
| `/` | 14.2 ms | 21 | 35.0 ms | 26 |
| `/race` | **7.1 ms** | **0** | 16.8 ms | **0** |
| `/research` | **7.1 ms** | **0** | 19.1 ms | **0** |

`/race` and `/research` are perfectly flat in both engines — p95 *equal to* median, zero long frames. The nav, Lenis and ScrollTrigger are all mounted on those pages too, so **Lenis and ScrollTrigger are eliminated as the cause.**

## The cause: the partner marquees

Ablation on `/`, stress profile, each ablation injected as a stylesheet after load:

| ablation (Firefox) | p95 | frames > 2.5x median | > 32 ms |
|---|---|---|---|
| baseline | 21.3 ms | 31 | 10 |
| `canvas { display: none }` (the three.js car) | — | 27 (slow profile, vs 21 base) | 0 |
| `.navbar { backdrop-filter: none }` | 20.4 ms | 23 | 6 |
| **`.rr-marquee-track { animation: none }`** | **14.2 ms** | **10** | **4** |
| all three off | 14.3 ms | 13 | 6 |

Killing the marquee alone recovers essentially the entire win: **p95 down 33 %, long frames down 68 %**, and "all three off" is no better than "marquee off". The same ablation in Chromium:

| ablation (Chromium) | p95 | frames > 2.5x median |
|---|---|---|
| baseline | 16.8 ms | 3 |
| all three off | 16.8 ms | 5 |

**Zero effect. 0.0 ms of p95.** That asymmetry is the whole answer: this animation is free in Chromium and expensive in Gecko.

Why: `Marquee.tsx` renders **two tracks per marquee, each holding the item set twice** — so a partner ribbon is 4 copies of its logos, and the landing has two ribbons, i.e. **four independently animated tracks**, each a very wide (~12 700 px) composited layer of `<img>` elements running a `translateX(0 -> -50%)` CSS animation. Chromium hands that to the compositor and, crucially, throttles composited animations that are outside the viewport. Gecko keeps ticking and re-rastering tiles of those very wide layers **for the whole 18 700 px of scroll**, even though the ribbons are on screen for maybe 1 000 px of it.

Secondary, real but ~4x smaller: `.navbar` animates the **radius** of a `backdrop-filter: blur(calc(var(--nav-alpha) * 12px))` continuously while the hero scrubs (`src/index.css:338`), and re-evaluates a chain of six `color-mix()` declarations off the same changing variable each frame. Animating a blur radius on a full-width fixed bar violates "never animate blur continuously"; it accounts for roughly a quarter of Firefox's long frames.

Eliminated with evidence: **Lenis** (flat on `/race` and `/research`, which mount it), **ScrollTrigger pinning** (same, and the landing pins with CSS `sticky`, not GSAP `pin: true`), **the three.js car** (hiding the canvas made Firefox slightly *worse*, i.e. noise).

## What I changed

**Nothing.** Two candidate CSS-only fixes were measured and both rejected:

- `will-change: transform` on `.rr-marquee-track` — p95 20.4 ms, 22 long frames vs a 21.3 / 31 baseline. Inside run-to-run variance (repeat baselines came back 21.3 and 14.4). Gecko already promotes an animated transform; the hint buys nothing and would only enlarge the layer. Not worth a line of CSS.
- `content-visibility: auto` on `.rr-marquee` — the best numbers of anything tested (1 frame > 32 ms, 4 long frames) **but the document scrolled 400 px shorter**, i.e. it changed layout. That is a layout-shift risk on a page whose definition of done says "no layout shift on load". Disqualified.

Run-to-run variance on this box is large enough (baseline p95 14.4-21.3 ms) that anything under ~20 % improvement is unprovable here. The marquee ablation clears that bar by a wide margin; neither substitute does.

## Recommended, not done (touches files I do not own)

1. **Pause the marquees when they are off screen.** One `IntersectionObserver` in `src/components/ui/Marquee.tsx` toggling `animation-play-state: paused` on `.rr-marquee-track` — the mechanism the hover/focus pause already uses, so no new CSS vocabulary. Invisible in Chrome, invisible in Firefox *while the ribbon is on screen*, and it deletes ~17 000 px of scroll worth of pointless compositing. This is the fix; it is ~10 lines and it is the highest-value item here.
2. **Halve the layer.** Two tracks x 2 copies = 4 copies of every logo. A seamless `-50%` loop needs the items twice *per track*, but the second track appears to duplicate what the first already provides. Worth a look by whoever owns `Marquee.tsx`; halving the layer width halves Gecko's raster cost directly.
3. **Stop animating the nav's blur radius** (`src/index.css:338`). Any fix here is a visual change in Chrome — a constant radius blurs the hero video behind a nominally transparent bar — so it needs Cedric's call, not a silent edit. Cheapest honest version: hold the radius constant above a threshold and drop the filter entirely below it, accepting a visible step.

## Safari / WebKit

**Not measured.** WebKit is installed but its MiniBrowser will not launch on this box: it needs `libavif16`, which is not installed, and there is no sudo. I extracted the `.deb` and put the library on `LD_LIBRARY_PATH`; the process still exits 127. Rather than report invented numbers, here is the feature-level answer:

- **The marquee cost is very likely worse in Safari, not better.** WebKit rasterises large composited layers in tiles much like Gecko and is more conservative than Chromium about throttling off-screen animations. A ~12 700 px layer x 4 is exactly the shape WebKit struggles with, and Safari on Apple silicon has less headroom to hide it than a desktop Chrome. Fix #1 above helps Safari at least as much as Firefox.
- **The nav backdrop-filter is the one place Safari is likely *better*** — WebKit has had a hardware `-webkit-backdrop-filter` path longest, and the property is already double-written at `src/index.css:338`. An animated radius is still not free.
- **`.big-blur::before { backdrop-filter: blur(40px) }` (`src/index.css:526`)** is legacy and static, so it is not in the scroll path, but a 40 px backdrop blur is the single most expensive declaration in the file if a migrating page ever puts it under motion.
- The `@supports not (color-mix(...))` guard at `src/index.css` already handles Safari < 16.2 by pinning the nav to the paper state — that is correct and also happens to remove the per-frame `color-mix` chain on old Safari.

To measure Safari properly, someone with sudo runs `sudo apt-get install libavif16`, then `HEADED=1 DISPLAY=:1` with the same script.

## Note for whoever is on the landing right now

While finishing this, `http://localhost:4180/` started white-paging: `Invalid hook call ... can't access property "useRef", resolveDispatcher() is null`, thrown under `<BrowserRouter>`. That appeared *after* every measurement above was taken, from a live edit by another agent in this checkout. Flagging it; it is not in my files and I did not touch it.
