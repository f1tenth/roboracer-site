// Stream B2: re-export of the ROS chassis mesh without the abstract deck
// electronics (the center compute cluster, the rear power-board stack, their
// board standoffs and screws), which the site now models as explicit parts
// (jetson, pcb, vesc, servo). Reads the uncompressed source GLB, writes an
// uncompressed GLB; meshopt compression is the gltf-transform CLI's job.
//   node b2_chassis_strip.mjs <src.glb> <out.glb>
import { NodeIO } from "/home/cedric/.npm/_npx/6e1a7b84fabb98f4/node_modules/@gltf-transform/core/dist/index.js";

const LR = 0.17145; // xacro lr at s=1: car x = mesh x - LR
const [src, out] = process.argv.slice(2);

// Whole primitives that are deck-electronics placeholders.
const DROP_MATERIALS = new Set([
  "black_002", // compute carrier + module block at the deck center
  "gray_001", // 70 x 50 plate on standoffs (the module placeholder)
  "metal_001", // hardware at the left of the center cluster
  "gold_pin_001", // pin headers
  "green_connector", // terminal blocks of the rear stack
  "green_light_001",
  "yellow_light_001",
  "red_switch",
  "silver", // 70 x 75 x 15 block of the rear stack
]);

// Triangle filters by centroid in the CAR frame (meters). Return true to drop.
const inBox = (c, x0, x1, y0, y1, z0, z1) => c[0] >= x0 && c[0] <= x1 && c[1] >= y0 && c[1] <= y1 && c[2] >= z0 && c[2] <= z1;
const DROP_TRIANGLES = {
  // screws of the rear stack; the two front edge strips (car x ~ +0.127) stay
  metal: (c) => c[0] < 0,
  // the seven short board standoffs above the deck; the four 45 mm chassis
  // standoffs (z <= 0.073) stay
  standoff: (c) => c[2] > 0.0735,
  // the two plates of the rear stack (70 x 75 x 4 at z 90..94, 50 x 75 x 3 at z 97..100)
  black: (c) => inBox(c, -0.134, -0.053, -0.046, 0.039, 0.089, 0.101),
  // small connector bits on the rear stack; the four shock springs stay
  white_connector: (c) => c[0] < -0.09 && c[2] > 0.09 && Math.abs(c[1]) < 0.04,
};

const io = new NodeIO();
const doc = await io.read(src);
let dropped = 0;
let kept = 0;
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const name = prim.getMaterial()?.getName() ?? "";
    if (DROP_MATERIALS.has(name)) {
      mesh.removePrimitive(prim);
      prim.dispose();
      console.log(`drop primitive ${name}`);
      continue;
    }
    const filter = DROP_TRIANGLES[name];
    if (!filter) continue;
    const pos = prim.getAttribute("POSITION");
    const indices = prim.getIndices();
    const idx = indices.getArray();
    const keep = [];
    const p = [0, 0, 0];
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    let removed = 0;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      pos.getElement(idx[t], p);
      pos.getElement(idx[t + 1], a);
      pos.getElement(idx[t + 2], b);
      const c = [(p[0] + a[0] + b[0]) / 3 - LR, (p[1] + a[1] + b[1]) / 3, (p[2] + a[2] + b[2]) / 3];
      if (filter(c)) removed++;
      else keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    const next = doc.createAccessor().setType("SCALAR").setBuffer(indices.getBuffer());
    next.setArray(keep.length > 65535 || Math.max(...keep) > 65535 ? new Uint32Array(keep) : new Uint16Array(keep));
    prim.setIndices(next);
    indices.dispose();
    console.log(`${name}: removed ${removed} triangles, kept ${keep.length / 3}`);
    dropped += removed;
    kept += keep.length / 3;
  }
}
await io.write(out, doc);
console.log(`wrote ${out}; triangles removed by filter ${dropped}, kept ${kept}`);
