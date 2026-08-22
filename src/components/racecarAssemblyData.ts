import { MathUtils } from "three";

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
// `color` drives the part label dots and panel swatches only; the values are
// the neutral/real part tones from racecarMaterials.ts (product-render
// direction, 2026-08-21) - no neon.
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
    name: "Accent shell",
    description: "Tintable body accents used to distinguish race agents.",
    frame: "base_link",
    joint: "Visual origin",
    asset: `${ASSET_ROOT}/roboracer_accent.stl`,
    format: "stl",
    position: [-0.17145, 0, 0],
    explosion: [0, 0, 0.12],
    color: "#4a4e55",
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
    explosion: [0.04, 0, 0.22],
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
    rotation: [-3.574, 0.068, 2.177].map(MathUtils.degToRad) as VectorTuple,
    explosion: [0.16, 0.35, 0.08],
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
    rotation: [1.899, -0.046, 2.803].map(MathUtils.degToRad) as VectorTuple,
    explosion: [0.16, -0.35, 0.08],
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
    rotation: [-2.543, -0.005, -0.246].map(MathUtils.degToRad) as VectorTuple,
    explosion: [-0.12, 0.35, 0.08],
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
    rotation: [2.932, 0.007, -0.29].map(MathUtils.degToRad) as VectorTuple,
    explosion: [-0.12, -0.35, 0.08],
    color: "#26282d",
  },
] as const;
