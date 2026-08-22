# The car chapter (landing v4, stream B, 2026-08-22; v3 findings kept where still true)

Scope: `src/components/ui/ExplodedModel.tsx`, `ExplodedModelScene.tsx`,
`src/components/RacecarAssembly.tsx`, `racecarMaterials.ts`, `racecarAssemblyData.ts`,
`src/pages/Assembly.tsx`, `public/models/racecar/*`.
Evidence: `docs/qa/landing-v4/b-*.png` (QA PNGs are git-ignored; read them from the
worktree). v3 evidence was `docs/qa/landing-v3/car-*.png`.

## 1. LiDAR diagnosis

Cedric (v3 review): "the LiDAR is wrong again."

**Root cause, one sentence.** The LiDAR's transform chain was and is correct end to
end (part table = xacro = GLB, pivot on the bounding-box center, Z-up to Y-up applied
outermost, no rotation anywhere, band at the top at every yaw), so the frame was never
the problem; what read as a wrong sensor was the mesh itself: the source USD models
the Hokuyo as a body that narrows upward (54 mm where it leaves the base to 48 mm
under the ring) below a ring and cap that are wider (56 mm) than the top of the body,
and at chapter size that silhouette (narrow neck, wide top) reads as an upside-down
sensor. v3's "lens pitch" explanation only covered the apparent lean of a tall
vertical under a wide lens; the long lens it introduced was right and is kept, but it
could not fix a shape that is inverted by proportion.

### Evidence

Vertex profile of the v3 mesh along Z (car frame, mm; scratch harness over the
dequantized GLB):

| Z band | material | footprint | reads as |
|---|---|---|---|
| 75..120 | `black` | 64 x 64 square | base block |
| 112..155 | `hokuyo` | 54 -> 48 round, narrowing upward | body (a cone) |
| 153..161 | `orange` | 56 round | window band, wider than the body top |
| 160..168 | `black` | 56 round | cap, overhanging the body by 4 mm a side |

The real sensor (photos: `_harvest/drive/2026-icra/Media/Felix Jahncke/P1022894.JPG`
and `P1033212.JPG`, ForzaETH car at ICRA 2026; the F1TENTH "overview of the car"
PNG Cedric dropped in `_harvest/cedric-media/`; `assembling_car.mp4` frames for the
chassis): a straight black cylinder on a square black base, the amber window band at
the very top of the cylinder under a thin cap, never wider at the top than below.
`_harvest/cedric-media/car/` was empty (checked twice, 00:19 and 00:35).

The transform-chain table from v3 still holds and is not repeated: position
`[0.095512, 0.000249, 0.121636]` = xacro `base_to_laser_model`, no rpy; pivot minus
bbox center = 0; root rotation `[-PI/2, 0, 0]` outermost; wheel rpy applied as
three.js `"ZYX"` (URDF fixed-axis order).

### Fix

1. Mesh re-export (`public/models/racecar/roboracer_lidar.glb`, 14 KB): built from
   three.js primitives in a scratch script, exported with `GLTFExporter`, then
   `npx @gltf-transform/cli optimize --compress meshopt --simplify false
   --texture-compress false`. Proportions after the UST-10LX on its mount: square
   base 64 x 64 x 26 mm (`black`), 4 mm collar, straight cylinder diameter 54 x
   44 mm (`hokuyo`), amber window band diameter 54 x 10 mm (`orange`), cap diameter
   52 tapering to 46 x 8 mm (`black`). Same envelope (+-0.032 x +-0.032 x +-0.0462 m,
   centered) and the same three material names, so the xacro transform, the part
   table and `racecarMaterials.ts` are untouched. The window stays amber `#e8641b`.
2. Verified in the live chapter at the hold pose (`?carYaw=` dev hook):
   `b-lidar-yaw0.png`, `-yaw90`, `-yaw180`, `-yaw270`, and mid-explosion
   (`b-lidar-midexplosion.png`, pin progress 0.5, explosion 0.25): upright, band
   under the cap at the top, in all five.

Upstream note for the ROS owner (unchanged): the mesh xacro places `laser_model` at
x = 0.0955 from `base_link` while `ego_racecar.xacro` and `config/sim.yaml` put the
scan frame at x = 0.275; and the USD's sensor should be re-modeled as a straight
cylinder there too, so the site does not have to carry its own LiDAR mesh.

## 2. Camera and explosion

`ExplodedModelScene.tsx`: fov 26, azimuth 45 degrees (front-right three-quarter),
pitch 17 degrees. Distance is solved per frame so a projected span fills FILL of the
canvas width:

```
d = span / fill / (2 * tan(13 deg) * max(aspect, 0.45))
span: 0.53 m at rest -> 0.62 m at the hold pose (lerp on progress)
fill: 0.78 (FILL); 0.90 on phone canvases (aspect < 0.85)
target: (0.03, 0.06, 0) at rest -> (0.03, 0.09, 0) at the hold
```

SPAN is solved, not estimated: a scratch solver projects the mesh vertices through
this lens (perspective included) over a full turntable revolution and bisects d until
the widest yaw fills FILL. 1440x900 (canvas 621x648): rest 1.54 m, hold 1.78 m
(probe reads 1.80 with SPAN 0.62). 768x1024 (672x614): 1.35 / 1.55 m. 390x844
(342x473): 1.67 / 1.93 m. Vertical extent never exceeds +-0.5 NDC.

Finding (v4): v3's `aspect < 1` "portrait = phone" branch also caught the desktop
column (aspect 0.96), so desktop ran at fill 0.95 and FILL never applied; the first
v4 probe measured a 0.93 fill at the hold with a tire on the canvas edge. The phone
threshold is now 0.85. Measured on the final captures (lit columns in the wheel band,
labels excluded): 0.766 of the canvas at yaw 0 and 270, margins 55 to 90 px. The
phone fill drops from 0.95 to 0.90 because 0.95 put a tire on the edge at 390.

Explosion ceilings (landing-v4 section 4; the part table holds the full offsets, the
chapter holds at `CHAPTER_MAX_EXPLOSION` 0.5 of them; /assembly's slider runs the full
range):

| part | table offset (m) | at the hold pose |
|---|---|---|
| wheels, lateral | +-0.11 | 0.055 (one 40 mm tire width beyond the hub) |
| front wheels, X | +0.05 | 0.025 |
| rear wheels, X | -0.04 | 0.02 |
| wheels, Z | 0.03 | 0.015 |
| LiDAR | [0.02, 0, 0.14] | 0.07 up |
| accent plate | [0, 0, 0.07] | 0.035 up |

Spin: 0.3 rad/s at rest easing to 0.16 rad/s at the hold, never still (v3 stopped
the turntable at the ceiling). Explosion completes at 65% of the pin and holds.
Render loop pauses (`frameloop="never"`) while the chapter is off screen.

## 3. Materials and lighting

`roboracer_chassis.glb` is re-exported from the ROS source with
`npx @gltf-transform/cli optimize <f> <f> --compress meshopt --simplify false
--texture-compress false --palette false` (155 KB, 15 named materials). The old
export had merged all chassis materials into one palette texture, which made
per-material tone impossible and forced the flat `#82878f` multiplier.

Material table (`racecarMaterials.ts`, `envMapIntensity` = env):

| Part / source material | Finish | Color | metal | rough | env |
|---|---|---|---|---|---|
| accent STL (the upper deck, tinted per agent in the sim) | ACCENT_FINISH cyan / magenta, MeshPhysicalMaterial, clearcoat 0.3 (clearcoat roughness 0.25) | #00d1da / #fc00ff | 0.55 | 0.32 | 0.9 |
| chassis `chassis_gray` (lower deck plate) | deck | #22252b | 0.12 | 0.68 | 0.16 |
| chassis `metal` (40 x 50 x 20 mm aluminum box at the rear of the upper deck, the ESC, plus the deck's front edge strip) | caseAluminum | #8c9198 | 0.80 | 0.42 | 0.8 |
| chassis `black`, `black_002`, `gray_001` (the 70 x 50 mm module plate at the deck center), `bumper` | plastic | #15171c | 0.05 | 0.74 | 0.2 |
| chassis `metal_001` (90 x 22 mm hardware at the left of the deck), `standoff` | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| chassis `silver` (70 x 75 mm board at the rear), `white_connector` (shock springs) | steel | #a6abb4 | 0.95 | 0.28 | 1.2 |
| chassis `gold_pin_001` | brass | #8f7640 | 0.90 | 0.38 | 1.0 |
| chassis `motor_blue` (33 mm motor can at the rear right of the tub plus the center driveline) | slate | #262b3d | 0.20 | 0.50 | 0.5 |
| chassis `green_connector` | pcb | #2e4a34 | 0.10 | 0.60 | 0.5 |
| chassis `red_switch` | oxide | #8a4a42 | 0.05 | 0.60 | 0.5 |
| chassis `green_light_001` / `yellow_light_001` | lamp | #2a3a2c / #5f592a | 0 | 0.40 | 0.6 |
| wheel `rim` | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| wheel `tire` | rubber | #131316 | 0 | 0.90 | 0.3 |
| lidar `hokuyo` | lidarBody | #10141f | 0.15 | 0.45 | 0.6 |
| lidar `black` (base, cap) | lidarBase | #17191f | 0.20 | 0.55 | 0.5 |
| lidar `orange` | lidarWindow | #e8641b | 0.10 | 0.28 | 0.9 |

The accent plate is Cedric's third accent exception (after the headline gradient and
the map). `ACCENT_VARIANT` in `racecarMaterials.ts` is committed as `"cyan"`; the
director picks from `b-plate-cyan.png` and `b-plate-magenta.png` (hold pose, yaw 30,
1440). Body text and buttons are unchanged. The part roles in the table were
re-read from per-material vertex bounds in v4 (the v3 note had called `metal` the
compute case; it is a 40 x 50 x 20 mm box at x -99..-60 mm, the ESC's footprint, and
the module-sized plate at the center is `gray_001`). The flat-color debug finding
stands: the upper platform deck is the accent STL, not a chassis material.

Lighting (`ProductLighting` in `RacecarAssembly.tsx`, shared by the chapter and
/assembly, unchanged): drei `Environment preset="studio"` at 0.5, rotated -90 degrees
about Y (neutral three-point fallback offline), key directional white 5 at
azimuth 85 / elevation 35 degrees with a soft 2048 px shadow (1024 on small
screens), rim white 2 at azimuth 180 / elevation 28, `ContactShadows` 0.55, ACES tone
mapping, exposure 1.15, `shadows="soft"`. The environment is rotated because the flat
decks, seen at a grazing angle, Fresnel-mirror whatever the studio HDR holds in the
mirror direction; at -90 degrees that is a dark part of the studio (v3 sweep).

## 4. Layout

Header above the grid at `text-display-m`; grid `md:grid-cols-[7fr_5fr]`; canvas
`h-[56svh] md:h-[60svh] lg:h-[72svh]`; right column: the three scroll captions, the
viewer link, then two 4/3 photo slots (`/media/car/car-photo-01-1200.webp`, `-02-`,
the curator's ICRA 2026 close-ups, unchanged: Cedric's car folder had nothing better).
Desktop pins the whole block; on mobile only the canvas cell is sticky and the
captions and photos scroll beneath it. Below `md` the five callouts render as a list
under the canvas, inside the sticky cell (`b-car-390.png`). The reduced-motion /
weak-device static layout renders the assembled car with the callouts simply visible
(checked at 1440 with `prefers-reduced-motion: reduce`: layout intact, captions
stacked, photos present).

## 5. Callouts

`RACECAR_CALLOUTS` in `racecarAssemblyData.ts`; rendered by `CarCallouts` in
`ExplodedModelScene.tsx` with drei `Html` (projected every frame from the part's
group, so anchors ride the explosion and the turntable; `occlude` off;
`pointerEvents="none"`). Mono eyebrow caps, `text-on-ink/80`, one line each, a 1 px
vertical hairline leader and a 12 px tick; the text runs toward the canvas center
whenever it would not fit on the anchor's right (measured label width + 12 px).

| id | label | anchor (car frame, m) | side / reach | name source |
|---|---|---|---|---|
| lidar | Hokuyo UST-10LX · 2D LiDAR | LiDAR cap top (0.0955, 0.0002, 0.168), follows the lidar part | above / 100 px | ICRA 2023 rules ("Hokuyo UST-10LX"), old f1tenth Build page ("Hokuyo 10LX") |
| compute | NVIDIA Jetson · compute | `gray_001` plate top (0.012, -0.010, 0.101) | above / 44 px | old Build page ("Nvidia Jetson TX1 or TX2"), rules (Jetson Xavier NX, Orin Nano) |
| esc | VESC · motor controller | `metal` box top (-0.08, 0, 0.125) | above / 72 px | old Build page ("FOCbox or VESC 4.12") |
| motor | Brushless DC motor | `motor_blue` can top (-0.09, -0.035, 0.063) | below / 44 px | rules ("Only brushless DC motors", Velineon 3500) |
| chassis | Traxxas Slash 4x4 · 1/10 chassis | lower deck front-right corner (0.14, -0.10, 0.07) | below / 132 px | rules (1:10 Traxxas, TRA6804R / TRA68086 Slash 4x4) |

No label carries ` · verify`: every name is in the harvested docs. The ESC and
motor anchors are inferred from vertex bounds (the source mesh names are generic),
not from a labeled model.

Timing: once the pin passes the hold point (progress 0.65) and the scrub has caught
up (0.6 s), the labels fade in over 0.4 s (200 ms each, 80 ms stagger); they fade out
(all at once) when scrolling back below the hold point or when the pin releases
(`onLeave`); `onEnterBack` brings them back. Reduced motion: no transition, visible
at the assembled pose.

Leader lengths are chosen so that no two labels share a band when their anchors line
up: chassis 132 vs motor 44 (yaw 90 and 180), LiDAR 100 vs ESC 72 at the assembled
pose (the cap is only 43 mm above the ESC box before the explosion lifts it). Known
and accepted: on a turntable a label sometimes crosses the car (the ESC label runs
over the LiDAR body around yaw 0 to 90); it stays legible (white on the dark body).

## 6. Dev hooks

Development only (`import.meta.env.DEV`, compiled out of production bundles):
`?carYaw=<degrees>` freezes the turntable; `?carAccent=cyan|magenta` overrides the
committed plate variant; `window.__rrCar` exposes `{distance, explosion, progress,
aspect, fov}` for the capture harness. Captures go through a CDP
`Page.captureScreenshot` on SwiftShader Chromium (Playwright's own screenshot hangs
on the live canvas).
