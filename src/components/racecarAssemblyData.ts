// No three.js import here on purpose: the landing chapter's shell
// (ExplodedModel.tsx) reads the callout table, and a `three` import would pull
// the whole library into the page's critical path instead of the lazy scene chunk.
const DEG = Math.PI / 180;
const degToRad = (degrees: number) => degrees * DEG;

export type VectorTuple = [number, number, number];

export type RacecarPartId =
  | "chassis"
  | "accent"
  | "lidar"
  | "jetson"
  | "pcb"
  | "vesc"
  | "servo"
  | "front-left-wheel"
  | "front-right-wheel"
  | "rear-left-wheel"
  | "rear-right-wheel";

export type RacecarPart = {
  id: RacecarPartId;
  name: string;
  description: string;
  frame: string;
  joint: string;
  asset: string;
  format: "glb" | "stl";
  position: VectorTuple;
  rotation?: VectorTuple;
  explosion: VectorTuple;
  color: string;
};

const ASSET_ROOT = `${import.meta.env.BASE_URL}models/racecar`;

// These assembled transforms mirror urdf/racecar_mesh.xacro at s=1.0 and
// lr=0.171450. Keeping them here, next to the display metadata, makes it easy
// to compare the browser assembly with the robot_description source.
// `rotation` is the visual-origin rpy in radians, applied with three.js Euler
// order "ZYX" (= URDF fixed-axis rpy) by RacecarAssembly.tsx. The LiDAR has
// no rotation on purpose: its mesh is authored upright, centered on its
// bounding box, and verified at yaw 0/90/180/270 (docs/design/CAR_CHAPTER.md).
// `explosion` is the full offset at explosion 1 (/assembly's slider end); the
// landing chapter holds at half of it (CHAPTER_MAX_EXPLOSION). Ceilings from
// landing-v4 section 4 (Cedric: "wheels stick out too far"): wheels 0.11 m
// lateral (the hold pose moves them 0.055 m, one 40 mm tire width beyond the
// hub), front +0.05 / rear -0.04 along X, 0.03 up; LiDAR 0.14 up; the
// accent plate 0.11 up (B2: at the hold pose it floats between the Jetson's
// top and the LiDAR's underside, docs/design/CAR_CHAPTER.md section 2).
// The four electronics parts (jetson, pcb, vesc, servo) are site models, not
// xacro links: placed on the chassis mesh's real upper deck (top z 0.0764)
// and tub floor (z 0.029) where the ROS mesh only had abstract blocks (removed
// from the chassis re-export, CAR_CHAPTER.md section 7). Their explosions are
// small lifts, so they stay under the plate at every explosion value.
// `color` drives the part label dots and panel swatches only; the values are
// the part tones from racecarMaterials.ts (the accent plate shows the
// committed ACCENT_VARIANT).
export const RACECAR_PARTS: readonly RacecarPart[] = [
  {
    id: "chassis",
    name: "Chassis",
    description: "The complete sprung mass and base_link visual.",
    frame: "base_link",
    joint: "Visual origin",
    asset: `${ASSET_ROOT}/roboracer_chassis.glb`,
    format: "glb",
    position: [-0.17145, 0, 0],
    explosion: [0, 0, 0],
    color: "#2c2f35",
  },
  {
    id: "accent",
    name: "Accent plate",
    description: "Tintable upper deck used to distinguish race agents.",
    frame: "base_link",
    joint: "Visual origin",
    asset: `${ASSET_ROOT}/roboracer_accent.stl`,
    format: "stl",
    position: [-0.17145, 0, 0],
    explosion: [0, 0, 0.11],
    color: "#00d1da",
  },
  {
    id: "lidar",
    name: "LiDAR",
    description: "Top-mounted laser scanner and its fixed sensor frame.",
    frame: "laser_model",
    joint: "base_to_laser_model",
    asset: `${ASSET_ROOT}/roboracer_lidar.glb`,
    format: "glb",
    position: [0.095512, 0.000249, 0.121636],
    explosion: [0.02, 0, 0.14],
    color: "#e8641b",
  },
  {
    id: "jetson",
    name: "Jetson Orin",
    description:
      "NVIDIA Jetson Orin developer kit on the upper deck: carrier board, module and finned heatsink. Site model, not a racecar_mesh.xacro link.",
    frame: "base_link",
    joint: "Fixed (site model)",
    asset: `${ASSET_ROOT}/roboracer_jetson.glb`,
    format: "glb",
    position: [0.005, 0, 0.0764],
    explosion: [0, 0, 0.01],
    color: "#8c9198",
  },
  {
    id: "pcb",
    name: "Power board",
    description:
      "The power board PCB at the rear of the upper deck: screw terminals, DC-DC module, switch. Site model, not a racecar_mesh.xacro link.",
    frame: "base_link",
    joint: "Fixed (site model)",
    asset: `${ASSET_ROOT}/roboracer_pcb.glb`,
    format: "glb",
    position: [-0.105, -0.005, 0.0764],
    explosion: [-0.02, 0, 0.03],
    color: "#2e4a34",
  },
  {
    id: "vesc",
    name: "VESC",
    description:
      "VESC motor controller in the rear of the tub, beside the motor. Site model, not a racecar_mesh.xacro link.",
    frame: "base_link",
    joint: "Fixed (site model)",
    asset: `${ASSET_ROOT}/roboracer_vesc.glb`,
    format: "glb",
    position: [-0.134, 0, 0.03],
    explosion: [0, 0, 0.04],
    color: "#23262c",
  },
  {
    id: "servo",
    name: "Steering servo",
    description:
      "Standard-size steering servo in the front of the tub, ahead of the battery. Site model, not a racecar_mesh.xacro link. TODO(content): the exact servo model.",
    frame: "base_link",
    joint: "Fixed (site model)",
    asset: `${ASSET_ROOT}/roboracer_servo.glb`,
    format: "glb",
    position: [0.11, 0, 0.029],
    explosion: [0.01, 0, 0.05],
    color: "#15171c",
  },
  {
    id: "front-left-wheel",
    name: "Front left wheel",
    description: "Steering wheel mesh with its measured camber and toe correction.",
    frame: "front_left_wheel",
    joint: "front_left_hinge_to_wheel",
    asset: `${ASSET_ROOT}/roboracer_wheel_front_left.glb`,
    format: "glb",
    position: [0.150283, 0.132904, 0.051058],
    rotation: [-3.574, 0.068, 2.177].map(degToRad) as VectorTuple,
    explosion: [0.05, 0.11, 0.03],
    color: "#b4b9c1",
  },
  {
    id: "front-right-wheel",
    name: "Front right wheel",
    description: "Steering wheel mesh with its measured camber and toe correction.",
    frame: "front_right_wheel",
    joint: "front_right_hinge_to_wheel",
    asset: `${ASSET_ROOT}/roboracer_wheel_front_right.glb`,
    format: "glb",
    position: [0.149152, -0.1316, 0.050883],
    rotation: [1.899, -0.046, 2.803].map(degToRad) as VectorTuple,
    explosion: [0.05, -0.11, 0.03],
    color: "#b4b9c1",
  },
  {
    id: "rear-left-wheel",
    name: "Rear left wheel",
    description: "Driven rear wheel attached through a fixed hinge frame.",
    frame: "back_left_wheel",
    joint: "back_left_hinge_to_wheel",
    asset: `${ASSET_ROOT}/roboracer_wheel_rear_left.glb`,
    format: "glb",
    position: [-0.172283, 0.130772, 0.051076],
    rotation: [-2.543, -0.005, -0.246].map(degToRad) as VectorTuple,
    explosion: [-0.04, 0.11, 0.03],
    color: "#26282d",
  },
  {
    id: "rear-right-wheel",
    name: "Rear right wheel",
    description: "Driven rear wheel attached through a fixed hinge frame.",
    frame: "back_right_wheel",
    joint: "back_right_hinge_to_wheel",
    asset: `${ASSET_ROOT}/roboracer_wheel_rear_right.glb`,
    format: "glb",
    position: [-0.170617, -0.132075, 0.050856],
    rotation: [2.932, 0.007, -0.29].map(degToRad) as VectorTuple,
    explosion: [-0.04, -0.11, 0.03],
    color: "#26282d",
  },
] as const;

export type RacecarCalloutId =
  | "lidar"
  | "compute"
  | "pcb"
  | "motor"
  | "servo"
  | "esc"
  | "chassis";

export type RacecarCallout = {
  id: RacecarCalloutId;
  /** One line, mono eyebrow caps. Names come from the build docs (see below). */
  label: string;
  /** Part whose group carries the anchor, so it travels with the explosion. */
  part: RacecarPartId;
  /** Anchor in the car frame at rest (base_link: X forward, Y left, Z up, m). */
  anchor: VectorTuple;
  /** The label sits above or below the anchor at the end of a vertical leader. */
  side: "above" | "below";
  /** Leader length in CSS px; different lengths keep labels apart as the car turns. */
  reach: number;
};

// Landing chapter callouts (landing-v4 section 4). Names: "Hokuyo 10LX or
// 30LX LIDAR", "Nvidia Jetson", "FOCbox or VESC 4.12" and the "power board
// (designed at Penn)" from the F1TENTH build page (f1tenth.github.io
// build-old.html); "Only brushless DC motors" and the Traxxas Slash 4x4
// chassis (TRA6804R / TRA68086) from the competition rules. The UTM-30LX and
// the Jetson Orin are Cedric's (landing v4 review). The steering servo's model
// is not in the docs (the Slash 4x4 ships with Traxxas's own servo), hence
// " · verify". Anchors sit on the parts themselves (each site-modeled part
// carries its own anchor), except the motor can (`motor_blue`, 33 mm, rear
// right of the tub) and the lower deck's front-right corner on the chassis.
// Leader lengths: "above" 44 / 84 / 100; "below" 40 (servo, whose anchor
// rides 25 to 35 px higher on screen than the others at every yaw) / 84
// (motor) / 128 (VESC) / 204 (chassis, whose front-right-corner anchor
// projects up to 45 px higher than the VESC's when the corner is on the far
// side), so no two labels on the same side share a band when their anchors
// line up (first B2 captures: at 72/40 the servo and motor labels collided at
// yaw 30, at 128/172 the VESC and chassis labels touched at yaw 90).
export const RACECAR_CALLOUTS: readonly RacecarCallout[] = [
  {
    id: "lidar",
    label: "Hokuyo UTM-30LX · 2D LiDAR",
    part: "lidar",
    anchor: [0.0955, 0.0002, 0.168],
    side: "above",
    reach: 100,
  },
  {
    id: "compute",
    label: "NVIDIA Jetson Orin · compute",
    part: "jetson",
    // Heatsink top. At the hold pose the plate floats 14 mm above it; the
    // label sits a text line above the plate.
    anchor: [0.005, 0, 0.106],
    side: "above",
    reach: 44,
  },
  {
    id: "pcb",
    label: "Power board · PCB",
    part: "pcb",
    anchor: [-0.105, -0.005, 0.097],
    side: "above",
    reach: 84,
  },
  {
    id: "motor",
    label: "Brushless DC motor",
    part: "chassis",
    anchor: [-0.0925, -0.0345, 0.063],
    side: "below",
    reach: 84,
  },
  {
    id: "servo",
    label: "Steering servo · verify",
    part: "servo",
    anchor: [0.11, 0.012, 0.069],
    side: "below",
    reach: 40,
  },
  {
    id: "esc",
    label: "VESC · motor controller",
    part: "vesc",
    anchor: [-0.134, 0, 0.051],
    side: "below",
    reach: 128,
  },
  {
    id: "chassis",
    label: "Traxxas Slash 4x4 · 1/10 chassis",
    part: "chassis",
    anchor: [0.14, -0.1, 0.07],
    side: "below",
    reach: 204,
  },
] as const;
