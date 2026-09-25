# QA - /assembly

Date: 2026-09-24. Branch: `revamp/p2-assembly`. Dev server on 4197, production
snapshots on 4196 (before, `e82e747`) and 4198 (after). Chromium headless with
SwiftShader. Screenshots are git-ignored under `docs/qa/assembly/`:
`before/` (audit), `wip/` (build iterations), `after/` (final pass).

## Before and after

| View | Before | After |
|---|---|---|
| 1536x730 | `before/before-1536x730.png` | `after/after-1536x730.png`, `wip/w3-1536x730.png` |
| 1366x650 | `before/before-1366x650.png` | `wip/w3-1366x650.png` |
| 768x1024 | `before/before-768x1024.png` | `wip/w3-768x1024.png` |
| 390x844 | `before/before-390x844.png` | `wip/w3-390x844.png` |
| LiDAR selected | `before/before-1536-lidar-selected.png` | `after/after-1536-lidar.png`, `wip/w3-390-lidar.png` |
| Assembled, part in the tub | none | `wip/w3-1536-vesc-assembled.png` |
| Reduced motion, 350 ms after a click | `before/before-1536-reduced.png` | `wip/w3-reduced-1536-computer-350ms.png` |
| Landing car chapter | `before/before-landing-car-1536.png` | `wip/w3-landing-car-1536-60.png` |

## Checks

- `npm run lint` and `npm run build`: green. The route chunk (`Assembly`,
  7.8 KB) imports three.js dynamically; the glTF exporter chunk is gone.
- 1536x730 and 1366x650: heading, CTA and all eight rows fit without
  scrolling. 768 and 390: frame on top, list under it, rows 57 px tall,
  frame buttons 44 px on touch.
- Canvas: hovering a part lights its row and sets a pointer cursor; a drag
  that starts on a part does not select it; a click selects; a drag from
  empty space keeps the selection; a click on empty space clears it.
- Reduced motion: the camera is on the part 350 ms after the click, poses
  jump, orbit damping off.
- Landing chapter renders and explodes as before; no console errors on `/`
  or `/assembly` in the dev captures.
- Guide links: every URL answered 200 with its anchor present (checked with
  curl on 2026-09-24).
- Pending when this file was written: the independent pass (axe, keyboard
  walk, draw-call count at idle, unmount, landscape phone). Its captures land
  in `after/`.

## Open for Cedric

- The build guide is written for the Jetson Xavier NX; the site says Jetson
  Orin. The Jetson link goes to "Mounting the NVIDIA Jetson NX".
- The model puts the VESC on the tub floor; the guide mounts it on the
  platform deck.
- Steering servo model: the guide keeps the stock Traxxas servo; the model
  number is `TODO(content)` and the landing callout keeps "· verify".
- The landing still calls the deck "the accent plate" and links "Explore the
  car in the interactive viewer"; the viewer now says "Platform deck".
- Removed from the viewer: wireframe, auto-rotate, floating labels, the glTF
  download, the slider, E/R shortcuts. Say if the glTF download should return.
