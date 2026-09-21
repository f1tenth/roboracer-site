import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, "..");
const sourceDirectory = resolve(siteRoot, "../f1tenth_gym_ros/meshes");
const targetDirectory = resolve(siteRoot, "public/models/racecar");

const assets = [
  "roboracer_accent.stl",
  "roboracer_chassis.glb",
  "roboracer_lidar.glb",
  "roboracer_wheel_front_left.glb",
  "roboracer_wheel_front_right.glb",
  "roboracer_wheel_rear_left.glb",
  "roboracer_wheel_rear_right.glb",
];

await mkdir(targetDirectory, { recursive: true });
await Promise.all(
  assets.map((asset) => copyFile(resolve(sourceDirectory, asset), resolve(targetDirectory, asset))),
);

console.log(`Synced ${assets.length} racecar mesh assets from ${sourceDirectory}`);
