// Stream B2: builds the site-authored part meshes from three.js primitives and
// exports each as a binary glTF (then meshopt-compressed by the gltf-transform
// CLI, see docs/design/CAR_CHAPTER.md). Mesh frames are Z-up like the ROS
// meshes; RacecarAssembly.tsx applies the Z-up -> Y-up root rotation.
//   node b2_parts_mesh.mjs <outDir> [part ...]
// Parts: lidar (origin = bbox center, same envelope as the ROS mesh so the
// xacro transform is unchanged), jetson, vesc, pcb, servo (origin = bottom
// center = the part's mount point in racecarAssemblyData.ts).
import { writeFileSync, mkdirSync } from "node:fs";

const WT = "/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site-wt/v4-car";
const NM = `${WT}/node_modules`;
const THREE = await import(`${NM}/three/build/three.module.js`);
const { GLTFExporter } = await import(`${NM}/three/examples/jsm/exporters/GLTFExporter.js`);
const { mergeGeometries } = await import(`${NM}/three/examples/jsm/utils/BufferGeometryUtils.js`);

// Node has Blob but no FileReader; the exporter's binary path needs one.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const OUT_DIR = process.argv[2] ?? `${WT}/public/models/racecar`;
const ONLY = process.argv.slice(3);
mkdirSync(OUT_DIR, { recursive: true });

const mm = (v) => v / 1000;
const SEG = 48;

/** Box of w (x) by d (y) by h (z), centered on (cx, cy), bottom at z0. All mm. */
function box(w, d, h, cx, cy, z0) {
  const g = new THREE.BoxGeometry(mm(w), mm(d), mm(h), 1, 1, 1);
  g.translate(mm(cx), mm(cy), mm(z0 + h / 2));
  return g;
}
/** Vertical cylinder (axis Z) of diameter dia, height h, bottom at z0. */
function cylZ(dia, h, cx, cy, z0, seg = SEG, topDia = dia) {
  const g = new THREE.CylinderGeometry(mm(topDia / 2), mm(dia / 2), mm(h), seg, 1, false);
  g.rotateX(Math.PI / 2);
  g.translate(mm(cx), mm(cy), mm(z0 + h / 2));
  return g;
}
/** Cylinder along X (a wire or pin), from x0 to x0 + len, centered on (cy, cz). */
function cylX(dia, len, x0, cy, cz) {
  const g = new THREE.CylinderGeometry(mm(dia / 2), mm(dia / 2), mm(len), 24, 1, false);
  g.rotateZ(Math.PI / 2);
  g.translate(mm(x0 + len / 2), mm(cy), mm(cz));
  return g;
}
/** Rounded-rectangle outline (w by d, corner radius r) centered on the origin. */
function roundedRect(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/** Extruded rounded block: outer footprint w by d (bevel included), height h
 * (bevel included), bottom at z0, centered on (cx, cy). */
function roundedBlock(w, d, r, h, cx, cy, z0, bevel = 0) {
  const shape = roundedRect(w - 2 * bevel, d - 2 * bevel, Math.max(0.5, r - bevel));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: mm(h - 2 * bevel),
    bevelEnabled: bevel > 0,
    bevelThickness: mm(bevel),
    bevelSize: mm(bevel),
    bevelSegments: 2,
    curveSegments: 10,
    steps: 1,
  });
  // Shape coordinates were given in mm; scale to meters.
  g.scale(0.001, 0.001, 1);
  g.translate(mm(cx), mm(cy), mm(z0 + bevel));
  return g;
}

// Hokuyo UTM-30LX (USB): 60 x 60 x 87 mm, on a 5.4 mm mount plate; envelope
// +-32 x +-32 x +-46.2 mm centered on the origin = the ROS mesh's envelope, so
// the xacro transform, pivot and callout anchor are unchanged.
function lidar() {
  const Z0 = -46.2;
  const plate = box(64, 64, 5.4, 0, 0, Z0); // mount plate
  const base = roundedBlock(60, 60, 3, 36, 0, 0, Z0 + 5.4); // square body
  const win = cylZ(56, 30, 0, 0, Z0 + 41.4, 64); // smoked optical window
  const band = cylZ(57, 12, 0, 0, Z0 + 71.4, 64); // amber band under the cap
  const cap = roundedBlock(60, 60, 7, 9, 0, 0, Z0 + 83.4, 1); // flat square cap
  const top = Z0 + 92.4;
  if (Math.abs(top - 46.2) > 1e-6) throw new Error(`lidar envelope: top ${top}`);
  return {
    black: { color: "#17191f", geometries: [plate, base, cap] },
    hokuyo: { color: "#10141f", geometries: [win] },
    orange: { color: "#e8641b", geometries: [band] },
  };
}

// NVIDIA Jetson Orin developer kit (carrier 100 x 79, module + finned
// heatsink), 29.6 mm tall. Origin: bottom center of the feet.
function jetson() {
  const feet = [[-44, -33], [44, -33], [-44, 33], [44, 33]].map(([x, y]) => cylZ(6, 5, x, y, 0, 24));
  const carrier = box(100, 79, 1.6, 0, 0, 5);
  const io = box(12, 52, 14, -44, -4, 6.6); // USB / Ethernet / DP stack
  const header = box(50, 5, 8, 10, 35, 6.6); // 40-pin expansion header
  const jack = box(9, 9, 6, -44, 30, 6.6); // DC jack
  const module = box(70, 45, 8, 8, -4, 6.6);
  const sink = box(70, 45, 3, 8, -4, 14.6);
  const fins = [];
  for (let i = 0; i < 9; i++) fins.push(box(66, 1.6, 12, 8, -4 + (i - 4) * 5, 17.6));
  return {
    standoff: { color: "#b4b9c1", geometries: feet },
    pcb: { color: "#2e4a34", geometries: [carrier] },
    ports: { color: "#15171c", geometries: [io, header, jack] },
    module: { color: "#15171c", geometries: [module] },
    heatsink: { color: "#8c9198", geometries: [sink, ...fins] },
  };
}

// VESC motor controller: 40 (x) x 60 (y) x 18 mm anodized case with shallow
// fins and three phase-wire stubs toward the motor (+x). Origin: bottom center.
function vesc() {
  const body = roundedBlock(40, 60, 3, 18, 0, 0, 0);
  const fins = [];
  for (let i = 0; i < 5; i++) fins.push(box(2, 56, 3, -12 + i * 6, 0, 18));
  const wires = [-8, 0, 8].map((y) => cylX(3.5, 12, 20, y, 9));
  return {
    case: { color: "#23262c", geometries: [body, ...fins] },
    wires: { color: "#15171c", geometries: wires },
  };
}

// Power board: 80 x 60 x 1.6 mm PCB on 6 mm standoffs with screw terminals,
// a DC-DC module, capacitors, a toggle switch and a pin header. Origin:
// bottom center of the standoffs.
function pcb() {
  const standoffs = [[-36, -26], [36, -26], [-36, 26], [36, 26]].map(([x, y]) => cylZ(5, 6, x, y, 0, 24));
  const board = box(80, 60, 1.6, 0, 0, 6);
  const terminals = [-22.5, -14.5, -6.5, 1.5].map((y) => box(7.5, 7.5, 8, -34, y, 7.6));
  const dcdc = box(22, 16, 9, 8, -14, 7.6);
  const caps = [[22, 14], [32, 14]].map(([x, y]) => cylZ(8, 12, x, y, 7.6, 24));
  const inductor = cylZ(10, 6, -8, 8, 7.6, 24);
  const header = box(2.5, 25, 8, -10, 24, 7.6);
  const switchBase = box(8, 6, 5, 30, -20, 7.6);
  const switchLever = cylZ(2.5, 8, 30, -20, 12.6, 12);
  return {
    standoff: { color: "#b4b9c1", geometries: standoffs },
    board: { color: "#2e4a34", geometries: [board] },
    terminal: { color: "#38663f", geometries: terminals },
    component: { color: "#15171c", geometries: [dcdc, inductor, header, switchBase] },
    capacitor: { color: "#262b3d", geometries: caps },
    switch: { color: "#8a4a42", geometries: [switchLever] },
  };
}

// Steering servo: standard-size body 20 (x) x 40 (y) x 34 mm with mounting
// flanges, output boss, spline and a horn on top (40 mm overall). Origin:
// bottom center of the body.
function servo() {
  const body = box(20, 40, 34, 0, 0, 0);
  const flange = box(20, 54, 2.5, 0, 0, 27);
  const boss = cylZ(12, 2.5, 0, 12, 34, 32);
  const spline = cylZ(5, 1.5, 0, 12, 36.5, 16);
  const hub = cylZ(8, 2, 0, 12, 38, 24);
  const arm = box(4, 22, 2, 0, 1, 38);
  return {
    body: { color: "#15171c", geometries: [body, flange, boss] },
    shaft: { color: "#8f7640", geometries: [spline] },
    horn: { color: "#9aa0a8", geometries: [hub, arm] },
  };
}

const BUILDERS = { lidar, jetson, vesc, pcb, servo };

function exportPart(name, groups) {
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.name = `roboracer_${name}`;
  scene.add(root);
  for (const [matName, { color, geometries }] of Object.entries(groups)) {
    const merged = mergeGeometries(geometries.map((g) => g.toNonIndexed()));
    merged.computeVertexNormals();
    merged.computeBoundingBox();
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
    material.name = matName;
    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `${name}_${matName}`;
    root.add(mesh);
  }
  const bbox = new THREE.Box3().setFromObject(scene);
  const fmt = (v) => v.map((x) => (x * 1000).toFixed(1)).join(", ");
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      scene,
      (result) => {
        const out = `${OUT_DIR}/roboracer_${name}.glb`;
        writeFileSync(out, Buffer.from(result));
        console.log(`${name}: bbox(mm) min [${fmt(bbox.min.toArray())}] max [${fmt(bbox.max.toArray())}] -> ${out} ${result.byteLength} bytes`);
        resolve();
      },
      reject,
      { binary: true, onlyVisible: true, truncateDrawRange: true },
    );
  });
}

for (const [name, build] of Object.entries(BUILDERS)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  await exportPart(name, build());
}
