# /assembly plan: the car, part by part

Goal: a newcomer learns what is in a RoboRacer car, what each part does, and
where the build guide covers it. The viewer is the bridge to the build docs.
Audit: `docs/assembly/AUDIT.md`. Scope: `/assembly` only; the landing's car
chapter keeps its behaviour (it shares `RacecarAssemblyParts`).

## Layout

- The site nav stays on (no more full-screen overlay with its own brand bar
  and "Back to Build"). No footer: the page is a workspace like `/build`, one
  viewport tall, inside the shared `max-w-page px-6` edge.
- Split view from `lg`, and on any landscape screen from `md` (a landscape
  phone gets the split, not a 150 px canvas): the 3D frame on the left
  (`rounded-media`, `bg-paper-100`), the part panel on the right (30rem).
  Portrait tablet and phone: the frame on top (44svh), the panel under it,
  scrolling on its own, under the thumb.
- Panel, top to bottom: mono eyebrow "Build", `h1` "The car, part by part",
  one-sentence lead, the one solid violet CTA "Open the build guide" (under
  the lead, so it is in view on a 730 px tall laptop), the numbered part
  list, then "Last step: wire it all together". Rem units only, site tokens
  only. `src/pages/assembly.css` (794 lines of px) is deleted.

## The part list (build order)

Eight entries in the order of the build guide (lower chassis, then the upper
deck in the guide's mounting order). Each row: number, plain name, product in
mono where a source names it, one-line role (under 45 characters, so one line
at 1536). The selected row opens one more line (how it connects) and a link
to its build-guide section (verified 200 and anchor present, 2026-09-24).

| # | Entry | Product | Guide section |
|---|---|---|---|
| 01 | Chassis | Traxxas Slash 4x4 | Lower level chassis |
| 02 | Wheels (4 parts, one entry) | none | none: they come on the chassis |
| 03 | Steering servo | Traxxas, from the kit | Attaching the PPM cable |
| 04 | Platform deck (the accent plate) | none | Upper level chassis |
| 05 | Motor controller | VESC | Mounting the VESC |
| 06 | Computer | NVIDIA Jetson Orin | Mounting the Jetson |
| 07 | Power board | none | Mounting the power board |
| 08 | LiDAR | Hokuyo UTM-30LX | Mounting the LiDAR |

Roles come from what the build guide wires to what (VESC drives motor and
servo, power board feeds 12 V to Jetson and LiDAR, the servo is the one stock
part kept). No counts, times or prices. The copy lives next to the part table
in `racecarAssemblyData.ts` (`CAR_PARTS`); the landing callouts are untouched.

## The 3D view

- Kept: the shared scene graph, product lighting, focus mode (others grey,
  edge outline, camera glides to the part). Framing fixed: the glide stops at
  0.8 m or more, so the car stays in the picture (today the LiDAR fills the
  screen), and follows the part when the car explodes. Home framing fits the
  exploded car to the frame: two thirds of its height on a wide frame, 86% of
  its width on a phone. A selected platform deck turns opaque (it is an 8%
  ghost when exploded).
- Two-way link: hovering a row lights the part, hovering a part lights the
  row; clicking either selects. A drag never counts as a click.
- Controls, in the frame's bottom-left: "Assembled / Exploded" (two pressed
  buttons, opens exploded) and "Reset view" (also clears the selection).
  Hint text, top-left: "Drag to turn · Scroll to zoom" (pinch on touch).
- Removed: wireframe, auto-rotate, per-part floating labels, the glTF
  export, the 0-100 slider, the E/R single-key shortcuts (WCAG 2.1.4), the
  floor grid, the Xacro frame/joint/XYZ inspector, the "Scale / Parts /
  Wheelbase" stats.

## Motion and access

- Reduced motion: explode/assemble and the camera glide jump straight to
  their end state; nothing moves unless the reader drags. The view opens in
  the static exploded pose, and the list works without the canvas.
- Every part is reachable from the keyboard through the list (buttons with
  `aria-pressed`, arrow keys move between rows, Escape clears). The canvas is
  `aria-hidden`; the list carries all its information.
- WebGL missing or the 3D chunk failing: an error boundary shows one line in
  the frame; the list still works.

## Performance

- The page chunk no longer imports three.js: the viewer is a lazy chunk, so
  the heading and list paint before the 1 MB 3D bundle arrives. A status line
  with the load percentage sits in the frame until the parts resolve.
- `frameloop="demand"`: the canvas renders only while something moves (idle
  was 60 fps of soft shadows). R3F already forces context loss on unmount;
  the cloned part materials are disposed with their part.

## Open for Cedric

- Build guide describes the Jetson Xavier NX; the site says Jetson Orin.
- The model puts the VESC in the tub; the guide mounts it on the platform deck.
- Exact steering servo model (the guide keeps the stock Traxxas servo).
