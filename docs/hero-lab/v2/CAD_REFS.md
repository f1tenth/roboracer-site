# CAD reference renders for the hero exploded-view shot

Rendered 2026-08-30 from the site's own three.js assembly (`/assembly`: `src/pages/Assembly.tsx`,
`src/components/RacecarAssembly.tsx`, the eleven meshes under `public/models/racecar/`) in headless
Chromium on SwiftShader. Files: `_harvest/higgsfield/refs-cad/*.png`; contact sheet: `cad-refs-sheet.jpg`.

Viewport 1600x900, device scale factor 1, so the WebGL canvas is 1600x900 px; PNG, full viewport.
Lens FOV 26 (the landing chapter's `CHAPTER_FOV`, set on the live camera), the page's own lighting
(`ProductLighting`: studio HDR, key, rim, soft shadows, contact shadow) and ACES tone mapping.
Background is the page's scene color `#f3f4f8`; drei's floor grid hidden; no UI chrome, no labels.
Azimuth: 0 = car front, 90 = the car's right side; elevation above the ground plane; d = camera to
orbit target in metres.

| File | Explosion | Camera (az / el / d) | Visible |
| --- | --- | --- | --- |
| `cad-assembled-3q-front.png` (hero) | 0.00 | 45 / 14 / 0.81 | Chassis, opaque cyan plate, LiDAR, Jetson heatsink, power board, all four wheels (front pair nearest). Servo and VESC are inside the tub, not readable. |
| `cad-assembled-side.png` | 0.00 | 90 / 6 / 0.84 | Right-side profile: chassis, plate edge, LiDAR, Jetson heatsink, power board edge, the two right wheels (left pair hidden behind them). |
| `cad-assembled-3q-rear.png` | 0.00 | 135 / 16 / 0.81 | Rear three-quarter: chassis, plate, LiDAR, Jetson, power board at the rear of the deck, rear wheels nearest. |
| `cad-exploded-50-3q-front.png` | 0.50 | 45 / 14 / 0.96 | Plate 55 mm up, LiDAR 80 mm up, wheels 55 mm out; Jetson, power board, VESC and servo lifting out of the tub. |
| `cad-exploded-100-3q-front.png` | 1.00 | 45 / 14 / 1.19 | Fully separated: LiDAR 160 mm up, plate 110 mm, wheels 110 mm out; Jetson and power board above the deck, VESC and servo raised out of the tub. Same camera and pose as `cad-seq-3.png`. |
| `cad-exploded-100-side.png` | 1.00 | 90 / 8 / 1.02 | The vertical stack in profile: LiDAR, plate, Jetson and power board, chassis. Wheels displaced sideways, so near and far pairs overlap. |
| `cad-exploded-100-top.png` | 1.00 | 45 / 60 / 1.65 | High angle: footprint with the four wheels out, plate over the deck (it covers most of the Jetson), LiDAR top, rear power board and VESC. |
| `cad-exploded-75-3q-rear.png` | 0.75 | 135 / 16 / 1.12 | Rear: power board, VESC, Jetson under the plate, LiDAR, all wheels out. |
| `cad-seq-0.png` .. `cad-seq-3.png` | 0.00 / 0.33 / 0.66 / 1.00 | fixed 45 / 14 / 1.19 (fitted at explosion 1.0) | The explosion at the hero angle with one camera for all four frames; the assembled car sits smaller in frame 0 by design. |

## How the poses were set

- Explosion: the page's range input `input[aria-label="Explosion amount"]`, written through the native
  `HTMLInputElement.prototype.value` setter followed by `dispatchEvent(new Event("input", {bubbles: true}))`
  (React's onChange), then each part group (`scene.getObjectByName(part.id)`) was polled against
  `part.position + explosion * part.explosion` until the worst error was under 0.2 mm.
- Camera: the R3F store via `_roots` from the Vite-prebundled fiber module
  (`import("/node_modules/.vite/deps/@react-three_fiber.js?v=...")`, `_roots.get(canvas).store.getState()`
  gives `camera`, `controls` (drei OrbitControls, `makeDefault`) and `scene`). `camera.fov = 26`, then
  `camera.position = target + dir(az, el) * d`, `controls.target.copy(target)`, `controls.update()`.
  d and the target were solved iteratively so the projected assembly fills 86% of the frame: the union
  bounding-box corners for the first pass (kept: 10-15% extra margin), sampled mesh vertices plus
  per-mesh boxes for the top view, which the union box had left at half size.
- Labels: the page's toggle `button[aria-label="Part labels"]` clicked until `aria-pressed="false"`, plus
  `.assembly-label{display:none}`.
- Chrome hidden with `page.add_style_tag`: `.viewer-header, .viewer-intro, .parts-panel, .explode-control,
  .assembly-vignette, .assembly-loader`. Grid: the drei mesh whose material has a `cellSize` uniform, `visible = false`.
- Capture: CDP `Page.captureScreenshot` with a 1600x900 clip (composited page, so no `preserveDrawingBuffer`
  needed and no black canvas); three rAF ticks plus 1 s after every change. Chromium flags
  `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`; 7-12 s per frame.
- Script: Playwright Python, session scratchpad `cad_refs.py` (not committed).

## Caveats

- Accent plate: the page fades it to opacity 0.08 from explosion 0.5 on (`accentOpacity`,
  `src/components/racecarMaterials.ts`), which would erase the plate from the exploded references. In every
  frame with explosion > 0 the plate's material `opacity` was held at 0.9 (and `depthWrite` on) through
  in-page property overrides; source untouched. It stays faintly see-through (the far wheel shows through
  it in the 0.75 rear frame). Assembled frames use the page's own opaque plate.
- Background is the viewer's light `#f3f4f8`, not the hero's near-black; the contact shadow was kept.
- Servo and VESC are only readable in the exploded frames (0.5 and up), and the servo is small.
- All eleven parts loaded (11/11); no console errors or warnings during the run; the studio HDR was loaded
  before the first capture. SwiftShader output matches the GPU path apart from antialiasing quality.
- `cad-seq-3.png` and `cad-exploded-100-3q-front.png` are the same image by construction.
