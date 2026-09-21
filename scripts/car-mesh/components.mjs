// Connected components (by shared vertex index) per primitive of an
// uncompressed GLB, with bounds in the CAR frame (x - lr). Scratch only (B2).
import { readFileSync } from "node:fs";
const LR = 171.45; // mm, xacro lr at s=1
const f = process.argv[2];
const only = process.argv[3]; // optional material filter
const minVerts = Number(process.argv[4] ?? 0);
const buf = readFileSync(f);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
const binOff = 20 + jsonLen + 8;
const bin = buf.subarray(binOff, binOff + buf.readUInt32LE(20 + jsonLen));
const readAcc = (i) => {
  const a = json.accessors[i];
  const bv = json.bufferViews[a.bufferView];
  const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const base = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const size = a.componentType === 5126 || a.componentType === 5125 ? 4 : a.componentType === 5123 ? 2 : 1;
  const stride = bv.byteStride ?? n * size;
  const rd = a.componentType === 5126 ? (o) => bin.readFloatLE(o) : a.componentType === 5125 ? (o) => bin.readUInt32LE(o) : a.componentType === 5123 ? (o) => bin.readUInt16LE(o) : (o) => bin.readUInt8(o);
  const out = new Array(a.count);
  for (let k = 0; k < a.count; k++) {
    const row = new Array(n);
    for (let c = 0; c < n; c++) row[c] = rd(base + k * stride + c * size);
    out[k] = n === 1 ? row[0] : row;
  }
  return out;
};
for (const mesh of json.meshes) {
  for (const prim of mesh.primitives) {
    const mat = prim.material !== undefined ? json.materials[prim.material].name : "(none)";
    if (only && mat !== only) continue;
    const pos = readAcc(prim.attributes.POSITION);
    const idx = prim.indices !== undefined ? readAcc(prim.indices) : [...pos.keys()];
    // union-find over vertex indices, merging by position too (welded)
    const key = (p) => `${p[0].toFixed(5)},${p[1].toFixed(5)},${p[2].toFixed(5)}`;
    const canon = new Map();
    const parent = new Int32Array(pos.length).map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
    const used = new Set(idx);
    for (const i of used) { const k = key(pos[i]); if (canon.has(k)) union(i, canon.get(k)); else canon.set(k, i); }
    for (let t = 0; t + 2 < idx.length; t += 3) { union(idx[t], idx[t + 1]); union(idx[t + 1], idx[t + 2]); }
    const comps = new Map();
    for (const i of used) {
      const r = find(i);
      let c = comps.get(r);
      if (!c) { c = { n: 0, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }; comps.set(r, c); }
      c.n++;
      for (let k = 0; k < 3; k++) { if (pos[i][k] < c.min[k]) c.min[k] = pos[i][k]; if (pos[i][k] > c.max[k]) c.max[k] = pos[i][k]; }
    }
    const list = [...comps.values()].filter((c) => c.n >= minVerts).sort((a, b) => b.n - a.n);
    console.log(`== ${mat}: ${comps.size} components, ${used.size} verts`);
    for (const c of list.slice(0, 40)) {
      const mn = [c.min[0] * 1000 - LR, c.min[1] * 1000, c.min[2] * 1000];
      const mx = [c.max[0] * 1000 - LR, c.max[1] * 1000, c.max[2] * 1000];
      const sz = mx.map((v, k) => v - mn[k]);
      console.log(`   n=${String(c.n).padStart(5)}  x ${mn[0].toFixed(0).padStart(5)}..${mx[0].toFixed(0).padStart(4)}  y ${mn[1].toFixed(0).padStart(5)}..${mx[1].toFixed(0).padStart(4)}  z ${mn[2].toFixed(0).padStart(4)}..${mx[2].toFixed(0).padStart(4)}  size ${sz.map((v) => v.toFixed(0)).join(" x ")}`);
    }
  }
}
