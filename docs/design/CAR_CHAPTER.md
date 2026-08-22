# The car chapter (landing v3, builder B, 2026-08-21)

Scope: `src/components/ui/ExplodedModel.tsx`, `ExplodedModelScene.tsx`,
`src/components/RacecarAssembly.tsx`, `racecarMaterials.ts`, `racecarAssemblyData.ts`,
`src/pages/Assembly.tsx`, `public/models/racecar/roboracer_chassis.glb`.
Evidence: `docs/qa/landing-v3/car-*.png`.

## 1. LiDAR diagnosis

Cedric: "the LiDAR frame is weird when we rotate, the frame is wrong."

**Root cause, one sentence.** The LiDAR's transform chain is correct end to end
(part table = xacro = GLB = mesh, pivot exactly on the bounding-box center, Z-up
to Y-up applied outermost), so nothing in the site's frames was wrong; what read as
a wrong frame while the car turned was the chapter's wide 40-degree lens pitched
about 20 degrees down, which made the only tall vertical on the car, the 92 mm
sensor, lean by several degrees and flip its lean as it crossed the frame, on top
of a sensor the USD models as a 42 mm upward-narrowing cone under a wider cap.

### Evidence

Transform chain, checked link by link (source frame: X forward, Y left, Z up,
origin on the rear axle; `lr = 0.17145`):

| Link | Value | Verdict |
|---|---|---|
| `racecarAssemblyData.ts` lidar | position `[0.095512, 0.000249, 0.121636]`, no rotation | `0.266962 - 0.17145 = 0.095512`, matches the xacro |
| `racecar_mesh.xacro` `base_to_laser_model` | `xyz="${s*0.266962 - lr} ${s*0.000249} ${s*0.121636}"`, no `rpy`; `laser_model/visual` has no `<origin>` | no rotation anywhere, consistent with the table |
| Source GLB node (`f1tenth_gym_ros/meshes/roboracer_lidar.glb`) | no translation, rotation or scale; positions in meters | mesh authored at its final local pose |
| Site GLB node (`public/models/racecar/roboracer_lidar.glb`) | `scale 0.046187` only | KHR_mesh_quantization dequantization: 0.046187 is the mesh's max |z| (positions are normalized int16), not a semantic transform |
| Chassis site GLB node | `translation [0.203053, 0.001068, 0.072273]` + `scale 0.224685` | the same quantization: the translation is the chassis bounding-box center, the scale its half-extent; equivalent to the source |
| Mesh pivot | bounds `[-0.0319, -0.0317, -0.0462] .. [0.0319, 0.0317, 0.0462]`; harness: pivot minus bbox center = `(0.0000, 0.0000, 0.0000)` | the part spins about its own center; no orbit |
| Orientation in the mesh | `hokuyo` body z -0.009..0.033, `orange` window ring z 0.032..0.039, black cap z 0.039..0.046, base block z -0.046..-0.009 | +Z up: ring just under the cap at the top, base block at the bottom |
| Root conversion | `RacecarAssemblyParts` group `rotation [-PI/2, 0, 0]` outside the per-part groups | world = Root(Z-up to Y-up) x T(position) x R(rpy) x mesh, the URDF order |
| Per-part rpy order | `<primitive rotation>` used three.js default "XYZ"; URDF rpy is fixed-axis (R = Rz Ry Rx = three.js "ZYX") | latent bug, 0.07 degrees on the wheels, zero on the LiDAR; fixed anyway |
| Chassis under the sensor | highest chassis vertices inside the sensor footprint: `metal` plate top at z 0.0675; sensor bbox bottom 0.0754; zero chassis vertices inside the sensor volume | sensor sits 8 mm above the front plate, as exported; nothing interpenetrates |
| Yaw symmetry | the mesh has no cable, plug or label; square base, round body, square ring and cap | yaw 0/90/180/270 are visually identical, so "cable exit toward the rear" cannot be judged on this mesh |

Renders (harness, `RacecarAssemblyParts` with every other part hidden, camera
orbiting the sensor): `car-lidar-yaw-000.png`, `-090`, `-180`, `-270`. All four show
the sensor standing upright on the car's front plate, orange ring under the cap,
pivot marker on the bbox center, bbox y 0.0754..0.1678 in world space.

The source USD and converter referenced by the xacro header
(`meshes/roboracer.usd`, `scripts/usd_to_mesh.py`) are not in the
`f1tenth_gym_ros` checkout or in any branch of its history (only
`scripts/measure_wheel_alignment.py` ever existed, removed in "Remove dev tools
for URDF"), so the GLB geometry above is the deepest source available.

Why it looked wrong: with the v2 camera (fov 40, pitch 19.6 degrees, canvas
55svh), a vertical at horizontal image offset u (in focal units) leans by
`atan(u * tan(pitch))`: 3.3 degrees where the sensor sat in the v2 capture and
5 to 8 degrees toward the frame edges that the 70% framing now reaches. The
sensor is the only tall vertical on a flat car, so the lean reads as the sensor
tilting, and because the turntable carries it from left to right, the lean
flips sign mid-spin. The v2 captures (`scratchpad` session, mid and ceiling) show
it.

### Fix

1. Long lens: `CHAPTER_FOV` 40 -> 26 degrees, pitch 17 degrees, distance solved
   from the canvas aspect (section 2). Maximum sensor lean at the 70% framing is
   now under 3 degrees. /assembly follows with fov 30 and rescaled orbit distances.
2. Rotation order: wheel alignment rpy now applied as three.js `"ZYX"`
   (`URDF_EULER_ORDER` in `RacecarAssembly.tsx`).
3. Part table unchanged: positions stay the xacro's, the LiDAR keeps no
   rotation, documented in `racecarAssemblyData.ts`.
4. Verified at the four yaws (renders above) and inside the spinning chapter
   (`car-chapter-rest-1440.png`, `-mid-`, `-ceiling-`): upright at every angle.

Upstream note for the ROS owner (not a site issue): the mesh xacro places
`laser_model` at x = 0.0955 from `base_link`, while `ego_racecar.xacro`
(`laser_distance_from_base_link 0.275`) and `config/sim.yaml`
(`lidar_base_link_to_lidar_tf: [0.275, 0, 0]`) put the simulator's scan frame at
x = 0.275, 18 cm ahead of the rendered sensor. In a 3D panel that shows both,
the scan origin swings around a point well in front of the mesh when the car
turns. Also, the USD's Hokuyo is simplified (42 mm tall cone, overhanging cap);
a re-modeled sensor in the USD would improve every render.

## 2. Camera

`ExplodedModelScene.tsx`: fov 26, azimuth 45 degrees (front-right three-quarter),
pitch 17 degrees. Distance is solved per frame so a projected span fills 70% of
the canvas width at any aspect:

```
d = span / 0.7 / (2 * tan(13 deg) * max(aspect, 0.45))
span: 0.49 m at rest -> 0.74 m at the explosion ceiling (lerp on progress)
target: (0.03, 0.06, 0) at rest -> (0.03, 0.10, 0) at the ceiling
```

At 1440x900 the canvas is 621x648 (aspect 0.958): rest distance 1.58 m,
ceiling distance 2.39 m (the dolly-out). Measured on the final captures
(columns brighter than ink-950 inside the canvas rect): car span 0.70 of the
canvas width at rest on the diagonal pose and 0.63 on a narrower turntable
pose, 0.79 at the ceiling with 61 px left and 69 px right margins (nothing
crops, the LiDAR top keeps 225 px of air). Mobile 390x844, canvas 342x473:
0.69 at rest. Tablet 768x1024 uses the 60svh canvas (`car-chapter-rest-768.png`).

Spin: 0.3 rad/s at rest, eased out by `1 - explosion / ceiling` (unchanged).
Ceiling stays 0.5, explosion completes at 65% of the pin (unchanged).
Render loop pauses (`frameloop="never"`) while the chapter is off screen.

## 3. Materials and lighting

`roboracer_chassis.glb` is re-exported from the ROS source with
`npx @gltf-transform/cli optimize <f> <f> --compress meshopt --simplify false
--texture-compress false --palette false` (155 KB, 15 named materials). The old
export had merged all chassis materials into one palette texture, which made
per-material tone impossible and forced the flat `#82878f` multiplier. Add
`--palette false` to the command in the design-system and media skills for the
chassis (the wheels and LiDAR have fewer than five materials and are unaffected).

Material table (`racecarMaterials.ts`, `envMapIntensity` = env):

| Part / source material | Finish | Color | metal | rough | env |
|---|---|---|---|---|---|
| accent STL (the upper platform deck, tinted per agent in the sim) | graphite | #2e3138 | 0.20 | 0.66 | 0.16 |
| chassis `chassis_gray` (lower deck plate) | deck | #22252b | 0.12 | 0.68 | 0.16 |
| chassis `metal` (compute case on the upper deck) | caseAluminum | #8c9198 | 0.80 | 0.42 | 0.8 |
| chassis `black`, `black_002`, `gray_001`, `bumper` (tub, arms, towers, housing, bumper) | plastic | #15171c | 0.05 | 0.74 | 0.2 |
| chassis `metal_001` (small hardware), `standoff` | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| chassis `silver` (small plate), `white_connector` (shock springs) | steel | #a6abb4 | 0.95 | 0.28 | 1.2 |
| chassis `gold_pin_001` | brass | #8f7640 | 0.90 | 0.38 | 1.0 |
| chassis `motor_blue` | slate | #262b3d | 0.20 | 0.50 | 0.5 |
| chassis `green_connector` | pcb | #2e4a34 | 0.10 | 0.60 | 0.5 |
| chassis `red_switch` | oxide | #8a4a42 | 0.05 | 0.60 | 0.5 |
| chassis `green_light_001` / `yellow_light_001` | lamp | #2a3a2c / #5f592a | 0 | 0.40 | 0.6 |
| wheel `rim` | aluminum | #b4b9c1 | 0.90 | 0.35 | 1.2 |
| wheel `tire` | rubber | #131316 | 0 | 0.90 | 0.3 |
| lidar `hokuyo` | lidarBody | #10141f | 0.15 | 0.45 | 0.6 |
| lidar `black` (base, cap) | lidarBase | #17191f | 0.20 | 0.55 | 0.5 |
| lidar `orange` | lidarWindow | #e8641b | 0.10 | 0.28 | 0.9 |

The `deckUpper` finish is unused and kept out of the table; the first mapping
attempt read part roles off vertex bounds alone and got the upper deck wrong
(the plate is the accent STL, not a chassis material). A flat-color debug
render of every material (throwaway harness, `?debug=materials`) settled the
table above: `chassis_gray` is the lower plate, `metal` the compute case,
`white_connector` the springs, `standoff` / `metal_001` the hardware.

Lighting (`ProductLighting` in `RacecarAssembly.tsx`, shared by the chapter and
/assembly): drei `Environment preset="studio"` at 0.5, rotated -90 degrees
about Y (neutral three-point fallback offline), key directional white 5 at
azimuth 85 / elevation 35 degrees with a soft 2048 px shadow (1024 on small
screens), rim white 2 at azimuth 180 / elevation 28 (behind-left of the
three-quarter view), `ContactShadows` 0.55, ACES tone mapping, exposure 1.15,
`shadows="soft"`. No fog, no colored lights. The brief's 1.5 / 0.6 intensities
were measured first: next to the studio HDR they add nothing visible on dark
paint (the car renders black with the IBL off), so the rig uses
physically-sized values and lets the HDR carry the fill.

Why the environment is rotated (the biggest finding of the look pass): the
flat decks are seen at a grazing 73 degrees from the front-right camera, where
Fresnel mirrors roughly 20% of whatever the studio HDR holds in the mirror
direction. At rotation 0 that direction held the HDR's main softbox and the
plates rendered light grey (#a4acb7) whatever their albedo or
`envMapIntensity`; an isolation test in the live chapter (directionals off:
still light; IBL off: black) pinned it on the IBL, and a rotation sweep
(0 / 90 / 180 / 270) showed -90 degrees puts a dark part of the studio there
(plates #3b414c to #4d5564) while the rims and standoffs still catch the
light. The first diagnosis of "silver decks" had blamed the material mapping;
the flat-color debug render then showed the upper plate is the accent STL.

Review pair: `car-render-vs-photo.png` (render beside a downscaled ICRA 2026
photo, org media): dark satin decks and tub, aluminum rims, standoffs and
springs, the orange ring as the one color accent, matching the black car in
the photo.

## 4. Layout

Header above the grid at `text-display-m`; grid `md:grid-cols-[7fr_5fr]`; canvas
`h-[56svh] md:h-[60svh] lg:h-[72svh]`; right column: the three scroll captions,
the viewer link, then two 4/3 photo slots (`/media/car/car-photo-01-1200.webp`,
`-02-`, `width/height 1200x900`, lazy, mono caption, `onError` removes the slot).
The pinned block sits below the fixed nav (`pt 68px+1rem` / `85px+1rem`).
Desktop pins the whole block; on mobile the block is taller than the viewport,
so only the canvas cell is sticky (`top-[68px]`, opaque ink) and the captions and
photos scroll beneath it while the explosion runs
(`car-chapter-ceiling-photos-390.png`). The studio photo crossfade slot and the
reduced-motion / weak-device static layout are unchanged in behavior
(`car-chapter-reduced-motion-1440.png`).

The `photos` prop on `ExplodedModel` carries captions and credits; the defaults
are neutral placeholders until the curator's captions land (TODO(content)).
