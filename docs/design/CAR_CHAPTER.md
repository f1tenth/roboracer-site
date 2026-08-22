# The car chapter (landing v4, streams B and B2, 2026-08-22; v3 findings kept where still true)

Scope: `src/components/ui/ExplodedModel.tsx`, `ExplodedModelScene.tsx`,
`src/components/RacecarAssembly.tsx`, `racecarMaterials.ts`, `racecarAssemblyData.ts`,
`src/pages/Assembly.tsx`, `public/models/racecar/*` (B2 adds `roboracer_jetson.glb`,
`roboracer_pcb.glb`, `roboracer_vesc.glb`, `roboracer_servo.glb` and re-exports the chassis
and LiDAR).
Evidence: `docs/qa/landing-v4/b-*.png` (stream B) and `b2-*.png` (stream B2: UTM-30LX,
the four electronics parts, the plate fade, the persisting callouts). QA PNGs are
git-ignored; read them from the worktree. v3 evidence was `docs/qa/landing-v3/car-*.png`.

## 1. LiDAR

Cedric (v3 review): "the LiDAR is wrong again." Cedric (v4 review of stream B's
straight-cylinder UST-10LX): "i understand you made the cylindrical lidar but this wont
cut it. we need the actual lidar to be the one it is which has the square top", then:
"put it back to the 30 ULX or whatever it's called that's rectangular like i asked you
and orange still (the USB version)".

**The unit is a Hokuyo UTM-30LX (USB), 60 x 60 x 87 mm.** The old F1TENTH build page
lists "Hokuyo 10LX or 30LX LIDAR"; the car at the center of Cedric's overview diagram
(`public/media/car/car-overview-diagram-960.webp`) and the UPenn car in the ICRA 2026
pit photo carry the boxy 30LX: a square black body, a near-full-width smoked window
cylinder, the amber band at the top of that cylinder, and a flat square cap with rounded
corners. (The product shot in the diagram's top-right corner is the smaller UST-10LX,
which is what stream B had modeled; the v3 USD mesh was a narrow-neck hybrid that read
as upside down.)

Transform chain (unchanged since v3, verified again on the B2 captures): part table =
xacro `base_to_laser_model` ([0.095512, 0.000249, 0.121636], no rpy), mesh pivot on the
bounding-box center, Z-up to Y-up applied outermost by the assembly root, no rotation on
the part. The band is at the top at every yaw because the mesh is authored upright.

### Mesh (`roboracer_lidar.glb`, 17 KB)

Built from three.js primitives (`b2_parts_mesh.mjs`, the pipeline in section 7),
mesh-local Z-up, envelope +-0.032 x +-0.032 x +-0.0462 m centered on the origin: the ROS
mesh's envelope, so the part transform and the callout anchor (cap top at z 0.168) are
untouched. Stack, bottom to top (mm):

| element | material | footprint | height | z (mesh) |
|---|---|---|---|---|
| mount plate | `black` | 64 x 64 | 5.4 | -46.2 .. -40.8 |
| body | `black` | 60 x 60, corner r 3 | 36 | -40.8 .. -4.8 |
| optical window | `hokuyo` | cylinder d 56 | 30 | -4.8 .. 25.2 |
| amber band | `orange` (#e8641b, unchanged) | cylinder d 57 | 12 | 25.2 .. 37.2 |
| cap | `black` | 60 x 60, corner r 7, 1 mm bevel | 9 | 37.2 .. 46.2 |

The sensor is 87 mm (36 + 30 + 12 + 9) on a 5.4 mm plate: 1:1 with the UTM-30LX's
60 x 60 x 87, no scaling. Proportions (body 41%, window 34%, band 14%, cap 10%) were
read off the zoomed diagram photo (body ~36, window ~30, band ~12, cap ~8 of 87). The
three material names are the ones `racecarMaterials.ts` keys on, unchanged.

Evidence: `docs/qa/landing-v4/b2-lidar-yaw0.png`, `b2-lidar-yaw90.png` (hold pose),
`b2-lidar-mid.png` (pin progress 0.33, explosion 0.25): upright, amber band under the
square cap, in all three.

Upstream note for the ROS owner (unchanged): the mesh xacro places `laser_model` at
x = 0.0955 from `base_link` while `ego_racecar.xacro` and `config/sim.yaml` put the
scan frame at x = 0.275; and the USD's sensor should be re-modeled as a UTM-30LX there
too, so the site does not have to carry its own LiDAR mesh.

## 2. Camera and explosion

`ExplodedModelScene.tsx`: fov 26, azimuth 45 degrees (front-right three-quarter),
pitch 17 degrees. Distance is solved per frame so a projected span fills FILL of the
canvas width:

```
d = span / fill / (2 * tan(13 deg) * max(aspect, 0.45))
span: 0.53 m at rest -> 0.62 m at the hold pose (lerp on progress)
fill: 0.86 (FILL; the director raised it from stream B's 0.78 so the hold pose is bigger); 0.90 on phone canvases (aspect < 0.85)
target: (0.03, 0.06, 0) at rest -> (0.03, 0.09, 0) at the hold
```

SPAN is solved, not estimated: a scratch solver projects the mesh vertices through
this lens (perspective included) over a full turntable revolution and bisects d until
the widest yaw fills FILL. At FILL 0.78, 1440x900 (canvas 621x648): rest 1.54 m, hold 1.78 m (B2 probe at FILL 0.86: hold 1.63 m)
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
| LiDAR | [0.02, 0, 0.14] | 0.07 up (underside at z 0.145) |
| accent plate | [0, 0, 0.11] | 0.055 up: z 0.125..0.131, between the Jetson's top (0.111) and the LiDAR's underside (0.145); B2, was 0.07 / 0.035 |
| Jetson Orin | [0, 0, 0.01] | 0.005 up (top at z 0.111) |
| power board | [-0.02, 0, 0.03] | 0.01 back, 0.015 up |
| VESC | [0, 0, 0.04] | 0.02 up, out of the tub once the plate is gone |
| steering servo | [0.01, 0, 0.05] | 0.005 forward, 0.025 up |

Plate opacity (B2; Cedric, v4 review: "the accent plate should go close to transparent
when we go towards exploded view (the more we are the more it should be transparent)
... and this should be the case for both the assembly in the hero page and the assembly
page"): `accentOpacity(explosion)` in `racecarMaterials.ts`, applied every frame by
`StlGeometry` in `RacecarAssembly.tsx`, so the landing chapter and /assembly share it.
Mapping: t = min(1, explosion / 0.5), opacity = 1 - 0.87 * (1 - (1 - t)^3): 1.0
assembled, 0.70 at t 0.13 (where the rising plate starts crossing the Jetson), 0.32 at
t 0.4, 0.16 at t 0.66, 0.13 at the hold pose (explosion 0.5) and for every larger
slider value in /assembly. The ease-out is deliberate: the plate lifts off through the
electronics it used to carry (plate bottom 69.7 + 110a mm against the Jetson top
106 + 10a: the crossing runs from a 0.07 to 0.37), so it is already mostly dissolved
while that happens. Material: `transparent` always (the plate is the only transparent
object, drawn after the opaque parts), `depthWrite` only at opacity 1 so nothing behind
it is culled, `castShadow` off below 0.5 (a see-through plate throwing a solid shadow
onto the Jetson read as a bug). Reduced motion / static pose: explosion 0, opacity 1.
Capture: `b2-plate-fade.png` (pin progress 0.4, explosion 0.31, opacity 0.18).

Spin: 0.3 rad/s at rest easing to 0.16 rad/s at the hold, never still (v3 stopped
the turntable at the ceiling). Explosion completes at 65% of the pin and holds.
Render loop pauses (`frameloop="never"`) while the chapter is off screen.

## 3. Materials and lighting

`roboracer_chassis.glb` is re-exported from the ROS source (B2: after stripping the
abstract deck electronics, section 7) with
`npx @gltf-transform/cli optimize <f> <f> --compress meshopt --simplify false
--texture-compress false --palette false` (90 KB, 7 named materials after B2; 155 KB and 15 before). The old
export had merged all chassis materials into one palette texture, which made
per-material tone impossible and forced the flat `#82878f` multiplier.

Material table (`racecarMaterials.ts`, `envMapIntensity` = env):

| Part / source material | Finish | Color | metal | rough | env |
|---|---|---|---|---|---|
| accent STL (the upper deck, tinted per agent in the sim) | ACCENT_FINISH cyan / magenta, MeshPhysicalMaterial, clearcoat 0.3 (clearcoat roughness 0.25) | #00d1da / #fc00ff | 0.55 | 0.32 | 0.9 |
| chassis `chassis_gray` (lower deck plate) | deck | #22252b | 0.12 | 0.68 | 0.16 |
| chassis `metal` (the deck's two front edge strips; B2 removed the rear screws) | caseAluminum | #8c9198 | 0.80 | 0.42 | 0.8 |
| chassis `black` (tub, arms, towers, bumper frame, battery), `bumper` | plastic | #15171c | 0.05 | 0.74 | 0.2 |
| chassis `standoff` (the four 45 mm chassis-to-deck standoffs) | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| chassis `white_connector` (shock springs) | steel | #a6abb4 | 0.95 | 0.28 | 1.2 |
| chassis `motor_blue` (33 mm motor can at the rear right of the tub plus the center driveline) | slate | #262b3d | 0.20 | 0.50 | 0.5 |
| jetson `heatsink` | caseAluminum | #8c9198 | 0.80 | 0.42 | 0.8 |
| jetson `pcb`, pcb `board` | pcb | #2e4a34 | 0.10 | 0.60 | 0.5 |
| jetson `standoff`, pcb `standoff` | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| jetson `module` / `ports`, pcb `component`, vesc `wires`, servo `body` | plastic | #15171c | 0.05 | 0.74 | 0.2 |
| pcb `terminal` | terminal | #38663f | 0 | 0.60 | 0.5 |
| pcb `capacitor` | slate | #262b3d | 0.20 | 0.50 | 0.5 |
| pcb `switch` | oxide | #8a4a42 | 0.05 | 0.60 | 0.5 |
| vesc `case` | anodized | #32363e | 0.70 | 0.42 | 0.9 |
| servo `shaft` | brass | #8f7640 | 0.90 | 0.38 | 1.0 |
| servo `horn` | connector | #9aa0a8 | 0 | 0.70 | 0.5 |
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
captions and photos scroll beneath it. Below `md` the seven callouts render as a list
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

| id | label | part / anchor (car frame, m) | side / reach | name source |
|---|---|---|---|---|
| lidar | Hokuyo UTM-30LX · 2D LiDAR | lidar, cap top (0.0955, 0.0002, 0.168) | above / 100 | build page ("Hokuyo 10LX or 30LX"), Cedric (the 30LX USB) |
| compute | NVIDIA Jetson Orin · compute | jetson, heatsink top (0.005, 0, 0.106) | above / 44 | Cedric ("Make sure it says NVIDIA Jetson Orin"); build page had TX1/TX2 |
| pcb | Power board · PCB | pcb, board top (-0.105, -0.005, 0.097) | above / 84 | build page ("power board ... designed at Penn") |
| motor | Brushless DC motor | chassis, motor can top (-0.0925, -0.0345, 0.063) | below / 84 | rules ("Only brushless DC motors", Velineon 3500) |
| servo | Steering servo · verify | servo, horn (0.11, 0.012, 0.069) | below / 40 | no model in the docs (the Slash 4x4 ships with Traxxas's own servo); TODO(content) |
| esc | VESC · motor controller | vesc, case top (-0.134, 0, 0.051) | below / 128 | build page ("FOCbox or VESC 4.12") |
| chassis | Traxxas Slash 4x4 · 1/10 chassis | chassis, lower deck front-right corner (0.14, -0.1, 0.07) | below / 204 | rules (1:10 Traxxas, TRA6804R / TRA68086 Slash 4x4) |

Below `md` the seven labels render as a list under the canvas (`CalloutList`).

Timing: once the pin passes the hold point (progress 0.65) and the scrub has caught
up (0.6 s), the labels fade in over 0.4 s (200 ms each, 80 ms stagger). They then STAY:
no exit tween when the pin releases, they leave the viewport with the chapter (Cedric,
v4 review: "the descriptive titles do not stay when you scroll past";
`b2-callouts-past.png`, pin progress 1.6, the chapter on its way out with all seven
labels up). Scrubbing back up below the hold point fades them out (the in-stagger
reversed). Implementation: `onUpdate` alone decides from `progress >= 0.65`; the
`onLeave` / `onEnterBack` handlers of stream B are gone, and `isActive` no longer
gates the show. Reduced motion: no transition, visible at the assembled pose.

Leader lengths put each side's labels in distinct bands: above 44 / 84 / 100, below
40 / 84 / 128 / 204. The servo gets the shortest "below" leader because its anchor
(the horn, 25 mm above the motor can and lifted 25 mm more at the hold) projects 25
to 35 px higher than the other "below" anchors at every yaw; at 72 / 40 (servo /
motor) the two labels collided in the first B2 capture, and at 128 / 172 the VESC and
chassis labels touched at yaw 90, where the corner is on the far side (hence 204). Known and accepted: on a
turntable a label sometimes crosses the car or the translucent plate; it stays
legible (white on the dark body).

## 6. Dev hooks

Development only (`import.meta.env.DEV`, compiled out of production bundles):
`?carYaw=<degrees>` freezes the turntable; `?carAccent=cyan|magenta` overrides the
committed plate variant; `window.__rrCar` exposes `{distance, explosion, progress,
aspect, fov}` for the capture harness. Captures go through a CDP
`Page.captureScreenshot` on SwiftShader Chromium (Playwright's own screenshot hangs
on the live canvas).

## 7. Site-modeled electronics and the mesh pipeline (B2)

Cedric (v4 review): "in the assembly the PCB (as well as main page), VESC and jetson
are not there. there's also a servo motor for the steering". The ROS chassis mesh only
had abstract blocks where the electronics sit (a 100 x 88 x 5 board carrying a
60 x 39 x 15 block on 19 mm standoffs at the deck center; a 70 x 75 x 15 block with two
plates, four terminal blocks, a switch and screws at the rear), so four explicit parts
replace them. They are site models, not xacro links (`joint: "Fixed (site model)"` in
the part table; /assembly lists them and its CAD export carries them).

### Chassis re-export (`roboracer_chassis.glb`, 155 KB -> 90 KB)

`b2_chassis_strip.mjs` (scratch, `@gltf-transform/core` from the npx cache) reads the
uncompressed ROS source (`../f1tenth_gym_ros/meshes/roboracer_chassis.glb`), drops the
primitives `black_002`, `gray_001`, `metal_001`, `gold_pin_001`, `green_connector`,
`green_light_001`, `yellow_light_001`, `red_switch`, `silver`, and filters triangles by
centroid in the car frame: `metal` keeps only x > 0 (the two front edge strips; the
rear screws go), `standoff` keeps z <= 0.0735 (the four 45 mm chassis standoffs; the
seven board standoffs go), `black` loses the two rear plates (x -0.134..-0.053,
|y| < 0.046, z 0.089..0.101), `white_connector` loses the rear connector bits
(x < -0.09, z > 0.09, |y| < 0.04; the four shock springs stay). Then
`npx @gltf-transform/cli optimize <in> <out> --compress meshopt --simplify false
--texture-compress false --palette false`. Seven materials remain (CHASSIS_FINISH in
`racecarMaterials.ts`). Per-material component bounds for all of this came from
`b2_components.mjs` (union-find over shared vertices of the uncompressed source).

### Part meshes (`b2_parts_mesh.mjs`)

three.js primitives -> `GLTFExporter` (binary) -> the same optimize command without
`--palette false`. Mesh-local Z-up; origin at the bottom center, which is the part's
`position` in the table (the mount point). Finishes: SITE_PART_FINISH in
`racecarMaterials.ts`, keyed by these material names.

| part | GLB | geometry (mm) | materials | position (car frame, m) | explosion (full) |
|---|---|---|---|---|---|
| Jetson Orin | roboracer_jetson.glb, 12 KB | carrier 100 x 79 x 1.6 on 5 mm feet, I/O stack 12 x 52 x 14, 40-pin header, DC jack, module 70 x 45 x 8, heatsink base 3 mm + nine 1.6 x 66 x 12 fins; 29.6 tall | standoff, pcb, ports, module, heatsink | [0.005, 0, 0.0764]: on the deck, x -45..55 mm clears the LiDAR plate (x 63.5) | [0, 0, 0.01] |
| power board | roboracer_pcb.glb, 10 KB | 80 x 60 x 1.6 on 6 mm standoffs; four 7.5 mm screw terminals, DC-DC 22 x 16 x 9, two d8 capacitors, inductor, pin header, toggle switch; 20.6 tall | standoff, board, terminal, component, capacitor, switch | [-0.105, -0.005, 0.0764]: rear of the deck, where the ROS stack was | [-0.02, 0, 0.03] |
| VESC | roboracer_vesc.glb, 8 KB | case 40 x 60 x 18 (r 3) with five fins, three d3.5 phase-wire stubs toward the motor; 21 tall | case, wires | [-0.134, 0, 0.03]: tub floor, rear, behind the battery (x <= -0.113) and left of the motor can (y <= -0.018) | [0, 0, 0.04] |
| steering servo | roboracer_servo.glb, 8 KB | body 20 x 40 x 34, flange 54 wide at z 27, d12 boss, d5 spline, 22 mm horn; 40 tall | body, shaft, horn | [0.11, 0, 0.029]: tub floor, front, ahead of the battery (x >= 0.041), behind the front tower (x 0.139); horn top 0.7 mm under the deck | [0.01, 0, 0.05] |

Placement facts from the chassis mesh (car frame, m): deck (the accent STL)
z 0.0697..0.0764, x -0.156..0.154, |y| <= 0.073; tub floor z 0.029 (the battery,
154 x 45 x 27 mm, sits at x -0.113..0.041, y 0.013..0.058); motor can d33 at
x -0.119..-0.066, y -0.051..-0.018, z 0.030..0.063; rear towers x -0.166..-0.148 at
|y| > 0.034; front tower x 0.139..0.156.

Vertical order at every explosion amount a (all offsets are linear in a): Jetson top
0.106 + 0.01a sits under the plate bottom 0.0697 + 0.11a from a 0.37 on (the crossing
below that is what the plate's opacity ease covers, section 2); the plate top
0.0764 + 0.11a stays under the LiDAR underside 0.0754 + 0.14a; VESC top 0.051 + 0.04a
stays under the PCB bottom 0.0764 + 0.03a; the servo's horn 0.069 + 0.05a never
reaches the plate bottom. At the hold (a 0.5): Jetson 0.111, plate 0.125..0.131, LiDAR
0.145, as Cedric asked ("in between the lidar and the jetson's top").

Copy changed with the parts: the chapter's "What is inside" caption now counts eleven
parts (the previous "The rear pair is driven" sentence was dropped: the chassis is a
Slash 4x4). `/assembly`'s "Parts 07" stat in `src/pages/Assembly.tsx` (outside B2's
files) still says 07; see the B2 report for the one-line diff.

