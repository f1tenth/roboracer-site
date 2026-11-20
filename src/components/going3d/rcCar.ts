/**
 * A small low-poly RC car for the 3D track scene, drawn straight onto the
 * canvas (no image, no model file). Proportions measured from the 3D scan of
 * the RoboRacer car (Gaussian splat, 2026-11-20): a low dark chassis tub
 * under a white deck plate, both narrowing to the front; the rear
 * electronics box (its top in the car's colour); the computer, a low wide box with a square fan
 * block on top; a small stereo camera on a short mast up front, two antennas
 * behind it; a wide front bumper and a small rear one; four chunky off-road
 * tyres. About 115 faces in 13 solid parts, plus the antennas.
 *
 * Local frame, metres (1/10 scale before SCALE): x forward, y up (0 = the
 * ground under the wheels), z to the car's left.
 */

export type V3 = [number, number, number];
type RGB = [number, number, number];
type Face = { pts: V3[]; n: V3; col: RGB };

/** Drawn about twice the size of a 1/10 car, so it reads at the scene's distances. */
const SCALE = 2;
const DARK: RGB = [30, 31, 38];
const TYRE: RGB = [38, 38, 42];
const RIM: RGB = [58, 58, 66];
const WHITE: RGB = [232, 234, 240];
const BLUE: RGB = [92, 132, 206];
/** The floor the cars fade into (--color-ink-900). */
const INK: RGB = [14, 15, 26];

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, col: RGB, top: RGB = col): Face[] {
  return [
    { pts: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], n: [1, 0, 0], col },
    { pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], n: [-1, 0, 0], col },
    { pts: [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], n: [0, 1, 0], col: top },
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], n: [0, -1, 0], col },
    { pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], n: [0, 0, 1], col },
    { pts: [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], n: [0, 0, -1], col },
  ];
}

/** A flat slab with any (convex) outline seen from above, given as [x, z]
 * corners in order round it, extruded from y0 to y1. */
function slab(outline: [number, number][], y0: number, y1: number, col: RGB): Face[] {
  const cx = outline.reduce((a, q) => a + q[0], 0) / outline.length;
  const cz = outline.reduce((a, q) => a + q[1], 0) / outline.length;
  const faces: Face[] = [
    { pts: outline.map(([x, z]): V3 => [x, y1, z]), n: [0, 1, 0], col },
    { pts: outline.map(([x, z]): V3 => [x, y0, z]), n: [0, -1, 0], col },
  ];
  outline.forEach(([x0, z0], k) => {
    const [x1, z1] = outline[(k + 1) % outline.length];
    let nx = z1 - z0, nz = -(x1 - x0);
    if (nx * ((x0 + x1) / 2 - cx) + nz * ((z0 + z1) / 2 - cz) < 0) { nx = -nx; nz = -nz; }
    const m = Math.hypot(nx, nz) || 1;
    faces.push({ pts: [[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]], n: [nx / m, 0, nz / m], col });
  });
  return faces;
}

/** A ten-sided tyre on an axle along z, resting on the ground, with a lighter
 * hub on its outer face (side: +1 left wheel, -1 right wheel). */
function wheel(cx: number, cz: number, r: number, w: number, side: 1 | -1, K = 10, hubbed = true): Face[] {
  const z0 = cz - w / 2, z1 = cz + w / 2;
  const ring = (z: number, rr: number) =>
    Array.from({ length: K }, (_, k): V3 => {
      const a = (k / K) * Math.PI * 2;
      return [cx + rr * Math.cos(a), r + rr * Math.sin(a), z];
    });
  const A = ring(z0, r), B = ring(z1, r);
  const faces: Face[] = [
    { pts: [...B], n: [0, 0, 1], col: TYRE },
    { pts: [...A].reverse(), n: [0, 0, -1], col: TYRE },
  ];
  for (let k = 0; k < K; k++) {
    const m = ((k + 0.5) / K) * Math.PI * 2;
    faces.push({ pts: [A[k], A[(k + 1) % K], B[(k + 1) % K], B[k]], n: [Math.cos(m), Math.sin(m), 0], col: TYRE });
  }
  if (!hubbed) return faces;
  // The hub: a smaller disc just proud of the outer face.
  const hz = side > 0 ? z1 + 0.001 : z0 - 0.001;
  const hub = ring(hz, r * 0.5);
  faces.push({ pts: side > 0 ? hub : [...hub].reverse(), n: [0, 0, side], col: RIM });
  return faces;
}

/** An eight-sided disc lying flat at height y (the compute box's fan). */
function disc(cx: number, y: number, cz: number, r: number, col: RGB): Face {
  return {
    pts: Array.from({ length: 8 }, (_, k): V3 => {
      const a = (-k / 8) * Math.PI * 2;
      return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];
    }),
    n: [0, 1, 0],
    col,
  };
}

/** One solid piece of the car (convex, so culling alone orders its own faces),
 * or the antennas (lines). min/max: its bounds in the car's frame. round: a
 * wheel drawn as line art, its tread as one outline (the silhouette of both
 * rims) under its visible rim, so no facet seams show. */
type Part = { faces: Face[]; lines?: [V3, V3][]; min: V3; max: V3; round?: boolean };

function part(faces: Face[], lines?: [V3, V3][]): Part {
  const sc = (q: V3) => q.map((v) => v * SCALE) as V3;
  const f = faces.map((x) => ({ ...x, pts: x.pts.map(sc) }));
  const l = lines?.map(([a, b]) => [sc(a), sc(b)] as [V3, V3]);
  const pts = [...f.flatMap((x) => x.pts), ...(l ?? []).flat()];
  const min = [0, 1, 2].map((k) => Math.min(...pts.map((q) => q[k]))) as V3;
  const max = [0, 1, 2].map((k) => Math.max(...pts.map((q) => q[k]))) as V3;
  return { faces: f, lines: l, min, max };
}

function mesh(accent: RGB): Part[] {
  // Wheels: radius 0.05, 0.05 wide, wheelbase 0.33, outer track 0.27.
  const r = 0.05, w = 0.05, ax = 0.164, az = 0.112;
  return [
    part(wheel(ax, az, r, w, 1)), part(wheel(ax, -az, r, w, -1)), part(wheel(-ax, az, r, w, 1)), part(wheel(-ax, -az, r, w, -1)),
    // Chassis tub and the white deck plate over it, both narrowing to the
    // front like the real baseplate; the bumpers fixed to the tub's ends.
    part(slab([[-0.15, -0.065], [0.05, -0.075], [0.2, -0.045], [0.2, 0.045], [0.05, 0.075], [-0.15, 0.065]], 0.03, 0.09, DARK)),
    part(slab([[-0.135, -0.083], [0.05, -0.083], [0.17, -0.04], [0.17, 0.04], [0.05, 0.083], [-0.135, 0.083]], 0.09, 0.1, WHITE)),
    part(box(0.2, 0.245, 0.05, 0.075, -0.085, 0.085, DARK)),
    part(box(-0.25, -0.15, 0.06, 0.09, -0.05, 0.05, DARK)),
    // Rear electronics box, its top in the car's colour.
    part(box(-0.13, -0.035, 0.1, 0.165, -0.08, 0.08, WHITE, accent)),
    // The computer: a low wide box, and the square fan block on top of it.
    part(box(-0.035, 0.065, 0.1, 0.14, -0.08, 0.08, WHITE)),
    part([...box(-0.027, 0.059, 0.14, 0.168, -0.043, 0.043, WHITE), disc(0.016, 0.1685, 0, 0.033, DARK)]),
    // The stereo camera up front on a short mast: small, below the antennas.
    part(box(0.115, 0.145, 0.1, 0.135, -0.03, 0.03, DARK)),
    part(box(0.11, 0.15, 0.135, 0.163, -0.045, 0.045, DARK)),
    // Antennas: two thin masts behind the camera, splaying out.
    part([], [
      [[0.09, 0.1, 0.02], [0.085, 0.224, 0.05]],
      [[0.09, 0.1, -0.02], [0.085, 0.224, -0.05]],
    ]),
  ];
}

/** The same car pared down for line art (the ICRA mark): round wheels,
 * one tapered chassis block, the rear box, the computer and the camera. */
const SIMPLE: Part[] = (() => {
  const r = 0.05, w = 0.05, ax = 0.164, az = 0.112;
  const round = (cx: number, cz: number, side: 1 | -1): Part => ({ ...part(wheel(cx, cz, r, w, side, 32, false)), round: true });
  return [
    round(ax, az, 1), round(ax, -az, -1), round(-ax, az, 1), round(-ax, -az, -1),
    part(slab([[-0.2, -0.083], [0.05, -0.083], [0.22, -0.045], [0.22, 0.045], [0.05, 0.083], [-0.2, 0.083]], 0.03, 0.1, WHITE)),
    part(box(-0.13, -0.035, 0.1, 0.165, -0.08, 0.08, WHITE)),
    part(box(-0.035, 0.065, 0.1, 0.165, -0.075, 0.075, WHITE)),
    part(box(0.11, 0.15, 0.1, 0.163, -0.045, 0.045, WHITE)),
  ];
})();

/** Each car's colour, on top of its rear box: the real car's blue, then cyan, pink, violet. */
export const CAR_ACCENTS: RGB[] = [BLUE, [0, 209, 218], [251, 80, 220], [167, 139, 250]];
const MESHES = CAR_ACCENTS.map(mesh);

/** Where the car is: p, the ground point under its middle; f, l, u: its
 * forward, left and up directions in the world. */
export type CarPose = { p: V3; f: V3; l: V3; u: V3 };
type Projected = { sx: number; sy: number; d: number };

const LIGHT: V3 = (() => {
  const v: V3 = [-0.35, 1, -0.25];
  const m = Math.hypot(...v);
  return v.map((x) => x / m) as V3;
})();

/**
 * The order to paint the parts in, far to near, for a camera at c (in the
 * car's frame). The parts never overlap, so each pair has a plane between
 * them along x, y or z: the one on the camera's side of it is nearer and is
 * painted later. Only pairs that overlap on screen get that rule (rules
 * between parts that never cover each other can chain into a loop, which
 * would leave no valid order). A topological sort of the rules gives an
 * order that is right from any angle (sorting faces by their middles is not:
 * a large face like the deck's top can sort in front of the box standing on it).
 */
function paintOrder(parts: Part[], c: V3, overlap: (i: number, j: number) => boolean): number[] {
  const n = parts.length;
  const after: number[][] = parts.map(() => []);
  const deg = new Array(n).fill(0);
  const eps = 1e-6;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!overlap(i, j)) continue;
      const A = parts[i], B = parts[j];
      for (let k = 0; k < 3; k++) {
        let first = -1, second = -1;
        if (A.max[k] <= B.min[k] + eps) {
          if (c[k] >= B.min[k]) { first = i; second = j; } else if (c[k] <= A.max[k]) { first = j; second = i; }
        } else if (B.max[k] <= A.min[k] + eps) {
          if (c[k] >= A.min[k]) { first = j; second = i; } else if (c[k] <= B.max[k]) { first = i; second = j; }
        }
        if (first >= 0) {
          after[first].push(second);
          deg[second]++;
          break;
        }
      }
    }
  }
  // Kahn's algorithm; among parts free to go, the farthest from the camera first.
  const dist = parts.map((P) => Math.hypot(...[0, 1, 2].map((k) => (P.min[k] + P.max[k]) / 2 - c[k])));
  const ready = parts.map((_, i) => i).filter((i) => deg[i] === 0);
  const order: number[] = [];
  while (ready.length) {
    ready.sort((a, b) => dist[b] - dist[a]);
    const i = ready.shift()!;
    order.push(i);
    for (const j of after[i]) if (--deg[j] === 0) ready.push(j);
  }
  // (A cycle cannot happen with separated boxes; if it ever did, add the rest by distance.)
  if (order.length < n) order.push(...parts.map((_, i) => i).filter((i) => !order.includes(i)).sort((a, b) => dist[b] - dist[a]));
  return order;
}

/**
 * Draw one car. project returns null for a point behind the camera, in which
 * case the car is skipped. Parts are painted in paintOrder; within a part,
 * faces turned away from the camera are culled. Lit by a fixed light; fade
 * (0..1) blends the colours towards the floor (ink) to fade it in or out.
 * opts.size scales the car up (the ICRA mark draws it as a larger glyph);
 * opts.outline draws the pared-down car as line art: faces filled with the
 * floor colour (hiding what is behind) and edged in that colour.
 * Returns the car's outline on screen (the convex hull of what was drawn),
 * or null if it was not drawn.
 */
export function drawCar(
  ctx: CanvasRenderingContext2D,
  pose: CarPose,
  car: number,
  project: (q: V3) => Projected | null,
  camPos: V3,
  thin: number,
  fade = 1,
  opts: { size?: number; outline?: string } = {},
): Projected[] | null {
  const { p, f, l, u } = pose;
  const size = opts.size ?? 1;
  const world = (q: V3): V3 => [
    p[0] + (f[0] * q[0] + u[0] * q[1] + l[0] * q[2]) * size,
    p[1] + (f[1] * q[0] + u[1] * q[1] + l[1] * q[2]) * size,
    p[2] + (f[2] * q[0] + u[2] * q[1] + l[2] * q[2]) * size,
  ];
  const turn = (n: V3): V3 => [
    f[0] * n[0] + u[0] * n[1] + l[0] * n[2],
    f[1] * n[0] + u[1] * n[1] + l[1] * n[2],
    f[2] * n[0] + u[2] * n[1] + l[2] * n[2],
  ];
  const dc: V3 = [camPos[0] - p[0], camPos[1] - p[1], camPos[2] - p[2]];
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const camLocal: V3 = [dot(dc, f) / size, dot(dc, u) / size, dot(dc, l) / size];
  const parts = opts.outline ? SIMPLE : MESHES[car % MESHES.length];

  // Project everything first: if any of it is behind the camera, skip the car.
  type Drawn = { pts: Projected[]; fill: string };
  const perPart: { faces: Drawn[]; lines: [Projected, Projected][] }[] = [];
  const all: Projected[] = [];
  for (const P of parts) {
    const faces: Drawn[] = [];
    if (P.round) {
      // The tread: the outline around both rims (all the wheel's points).
      const s = P.faces.flatMap((face) => face.pts.map((q) => project(world(q))));
      if (s.some((q) => !q)) return null;
      const pts = hull(s as Projected[]);
      faces.push({ pts, fill: "" });
      all.push(...pts);
    }
    for (const face of P.faces) {
      if (P.round && face.n[2] === 0) continue;
      const w = face.pts.map(world);
      const c = w.reduce((a, q) => [a[0] + q[0] / w.length, a[1] + q[1] / w.length, a[2] + q[2] / w.length] as V3, [0, 0, 0] as V3);
      const n = turn(face.n);
      if (n[0] * (camPos[0] - c[0]) + n[1] * (camPos[1] - c[1]) + n[2] * (camPos[2] - c[2]) <= 0) continue;
      const s = w.map(project);
      if (s.some((q) => !q)) return null;
      const pts = s as Projected[];
      const lit = 0.42 + 0.58 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      faces.push({ pts, fill: `rgb(${face.col.map((v, j) => Math.round(INK[j] + (v * lit - INK[j]) * fade)).join(",")})` });
      all.push(...pts);
    }
    const lines: [Projected, Projected][] = [];
    for (const [a, b] of P.lines ?? []) {
      const sa = project(world(a)), sb = project(world(b));
      if (sa && sb) lines.push([sa, sb]);
    }
    perPart.push({ faces, lines });
  }

  // Each part's box on screen, to tell which parts can cover each other.
  const boxes = perPart.map(({ faces, lines }) => {
    const pts = [...faces.flatMap((x) => x.pts), ...lines.flat()];
    if (!pts.length) return null;
    return [Math.min(...pts.map((q) => q.sx)), Math.min(...pts.map((q) => q.sy)), Math.max(...pts.map((q) => q.sx)), Math.max(...pts.map((q) => q.sy))];
  });
  const overlap = (i: number, j: number) => {
    const a = boxes[i], b = boxes[j];
    return !!a && !!b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  };
  ctx.lineJoin = "round";
  for (const i of paintOrder(parts, camLocal, overlap)) {
    const { faces, lines } = perPart[i];
    ctx.lineWidth = opts.outline ? thin : thin * 0.6;
    for (const { pts, fill } of faces) {
      ctx.fillStyle = opts.outline ? `rgb(${INK.join(",")})` : fill;
      ctx.strokeStyle = opts.outline ?? fill;
      ctx.beginPath();
      pts.forEach((q, k) => (k ? ctx.lineTo(q.sx, q.sy) : ctx.moveTo(q.sx, q.sy)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (lines.length) {
      ctx.strokeStyle = `rgba(170,175,200,${0.9 * fade})`;
      ctx.lineWidth = thin;
      ctx.beginPath();
      for (const [a, b] of lines) {
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
      }
      ctx.stroke();
    }
  }
  return hull(all);
}

/** Convex hull of screen points (monotone chain). */
function hull(pts: Projected[]): Projected[] {
  const P = [...pts].sort((a, b) => a.sx - b.sx || a.sy - b.sy);
  if (P.length < 3) return P;
  const cross = (o: Projected, a: Projected, b: Projected) => (a.sx - o.sx) * (b.sy - o.sy) - (a.sy - o.sy) * (b.sx - o.sx);
  const lower: Projected[] = [];
  for (const p of P) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Projected[] = [];
  for (const p of [...P].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
