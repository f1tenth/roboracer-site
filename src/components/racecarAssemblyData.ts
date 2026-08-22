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
// accent plate 0.07 up.
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
    explosion: [0, 0, 0.07],
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

export type RacecarCalloutId = "lidar" | "compute" | "esc" | "motor" | "chassis";

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

// Landing chapter callouts (landing-v4 section 4). Names: Hokuyo UST-10LX and
// "Only brushless DC motors" from the competition rules (ICRA 2023 rules.md,
// roboracer_rules README); "Nvidia Jetson", "VESC" and the Traxxas Slash 4x4
// chassis from the F1TENTH build page (f1tenth.github.io build-old.html: Jetson
// TX1/TX2, "FOCbox or VESC 4.12") and the rules' chassis list (TRA6804R /
// TRA68086 Slash 4x4). Anchors were read off the source mesh's vertex bounds
// (docs/design/CAR_CHAPTER.md, section 5): the LiDAR cap, the 70 x 50 mm
// module plate at the deck center (`gray_001`), the 40 x 50 x 20 mm aluminum
// box at the rear of the upper deck (`metal`), the 33 mm motor can on the
// right of the tub (`motor_blue`), and the lower deck's front-right corner.
export const RACECAR_CALLOUTS: readonly RacecarCallout[] = [
  {
    id: "lidar",
    label: "Hokuyo UST-10LX · 2D LiDAR",
    part: "lidar",
    anchor: [0.0955, 0.0002, 0.168],
    side: "above",
    // At the assembled pose (reduced motion) the cap sits only 43 mm above
    // the ESC box, so this leader must outreach the ESC's by a text line.
    reach: 100,
  },
  {
    id: "compute",
    label: "NVIDIA Jetson · compute",
    part: "chassis",
    anchor: [0.012, -0.01, 0.101],
    side: "above",
    reach: 44,
  },
  {
    id: "esc",
    label: "VESC · motor controller",
    part: "chassis",
    anchor: [-0.08, 0, 0.125],
    side: "above",
    reach: 72,
  },
  {
    id: "motor",
    label: "Brushless DC motor",
    part: "chassis",
    anchor: [-0.09, -0.035, 0.063],
    side: "below",
    reach: 44,
  },
  {
    id: "chassis",
    label: "Traxxas Slash 4x4 · 1/10 chassis",
    part: "chassis",
    anchor: [0.14, -0.1, 0.07],
    side: "below",
    // Long enough to clear the motor label when the two anchors line up
    // (yaw 90 and 180 in docs/qa/landing-v4/b-lidar-yaw*.png).
    reach: 132,
  },
] as const;
