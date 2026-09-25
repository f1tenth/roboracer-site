# /assembly audit (before, 2026-09-24)

Snapshot of `e82e747` served by `vite preview`, Chromium headless with
SwiftShader. Captures: `docs/qa/assembly/before/` (git-ignored):
`before-1536x730.png`, `before-1366x650.png`, `before-768x1024.png`,
`before-390x844.png`, `before-1536-lidar-selected.png`,
`before-1536-exploded.png`, `before-390-selected.png`,
`before-1536-reduced.png`, `before-landing-car-1536.png`.

## What a newcomer gets today

- A CAD tool, not an explanation. Title "RoboRacer / Assembly lab", kicker
  "Xacro visual assembly", lead about "the racecar visual tree", a stats row
  (Scale 1:1 on a one-tenth car, Parts 11, Wheelbase 0.322 m), a "Scene tree"
  of eleven rows, and an inspector that shows xacro frame, joint and XYZ.
  Nothing says what a part does or where to build it; there is no link to
  the build guide.
- The descriptions carry internals ("sprung mass and base_link visual",
  "Site model, not a racecar_mesh.xacro link") and one unverified mark shown
  on the landing ("Steering servo · verify").
- Four wheel rows out of eleven; the list is not in build order.

## Model, lighting, camera

- Lighting and materials are good (shared product rig with the landing).
- Home view leaves the car small in a full-window canvas behind floating
  panels. The floor grid's section lines read as stray diagonals.
- Focus mode flies in until the part fills the window: the LiDAR selected
  shows a giant LiDAR and a blurred wall of grey car, no context.
- The camera does not follow a focused part when the car explodes; the
  selected LiDAR leaves the top of the frame.
- Per-part HTML labels (6 to 8 px on screen) draw above the UI (z 19 vs 3-5):
  they cover "Back to Build" and the parts panel; "Accent plate" and "Power
  board" overlap; a huge clipped wheel label fills the bottom left.
- The accent plate (the platform deck) is 8% opaque when exploded, so
  selecting it shows a ghost.

## Discovery and controls

- Clickable parts are hinted only by "Select a part to inspect its Xacro
  frame" in the empty inspector and a pointer cursor.
- Five unlabelled icon tools (reset, auto-rotate, labels, wireframe, glTF
  export) plus a 0-100% slider, "E"/"R" single-key shortcuts that fire from
  any focused button (WCAG 2.1.4), no modifier check.
- A drag that ends on empty canvas clears the selection.

## Access and layout

- axe: 0 violations at 1536 and 390. Focus ring visible on all 21 stops.
- The site nav and footer are hidden (the viewer is a fixed overlay with
  its own brand bar). One h1.
- 1366x650: rows 10 and 11 hidden behind an inner scroll.
- 768: the panel covers the rear wheel, overlaps the explode control.
- 390: the panel covers 13% of the canvas, a wheel is cut at x=0, the
  inspector is hidden (no description at all on phones), the hint is hidden.
- Tap targets: all 22 under 44 px (tools 33, rows 26 tall, Assembled/Exploded
  12 tall, slider track 4 px).
- Reduced motion: honoured by CSS only; camera glide, part motion and orbit
  damping animate the same.
- Sizing: `assembly.css` is 794 lines, 196 `px`, 0 rem, 20 hard-coded colours.
  Text at 8.5 to 11.5 px.

## Performance

- DOMContentLoaded 130 ms, FCP 812 ms: the route chunk imports three.js
  statically, so no text paints before the 1 MB (281 KB gzip) 3D chunk.
- JS 420 KB over the wire; models 978 KB (10 GLB, 156 KB STL, 340 KB HDR).
- The canvas renders every frame while idle (no `frameloop`): 8.7 fps
  headless SwiftShader; on real hardware it redraws the soft-shadowed scene
  at the display rate while nobody touches it.
- No console errors or warnings; no failed requests.

## Facts to check

- The build guide (f1tenth.readthedocs.io, the docs `/build` embeds) is
  written for the Jetson Xavier NX; the site says Jetson Orin (Cedric).
- The guide mounts the VESC on the platform deck; the model places it on the
  tub floor.
- The guide keeps the stock Traxxas steering servo; its model number is not
  given anywhere (the landing callout keeps "· verify").
