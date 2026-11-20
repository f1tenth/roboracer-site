import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP, useDesktop, DESKTOP_QUERY, MOTION_OK_QUERY } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import PauseToggle from "../ui/PauseToggle";
import { drawCar, CAR_ACCENTS, type CarPose, type V3 } from "./rcCar";

/* ---------------------------------------------------------------------------
 * The scene: a track over a plain floor, in 3D, drawn on a canvas
 * with a plain perspective camera (no three.js on this page).
 *
 * The trick behind "2D": a flat world seen exactly edge-on, from its own
 * height, collapses into one line. So at p = 0 the camera sits on the floor
 * and the whole track reads as a single line across the screen. As p
 * grows the camera rises and tilts down (the line opens into a plane running
 * to the horizon), then bumps grow out of the track and the camera drifts.
 * ------------------------------------------------------------------------- */

const N = 600;            // track samples
const WIDTH = 1.8;        // track width
const ROLLER = 0.45;      // tallest roller at full height
const BANK_MAX = 0.5;     // ~29 degrees through the middle of the turn
const NEAR = 0.2;         // near clipping plane, metres in front of the camera

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** The cars fade in just after the camera has lifted off the floor, while
 * the track is still flat; their jumps then grow with the rollers. */
const carsIn = (p: number) => ease((p - 0.1) / 0.1);
/** a: the camera lifts above the straight. c: it orbits round to the side view.
 * b: the rollers and the banking grow (the track goes 3D). k: colour comes in
 * (the 2D line starts plain white and takes on colour as the camera lifts). */
const phases = (p: number) => ({
  a: ease(p / 0.3),
  c: ease((p - 0.22) / 0.58),
  b: ease((p - 0.5) / 0.5),
  k: ease((p - 0.04) / 0.28),
});

/* The track on the floor (x across, z away from the starting camera), as
 * segments: a long straight, a banked right-hander, a short straight with two
 * rollers, then a gentle left-hander that points the rest straight away from
 * the side camera, so it runs off the top of the screen. The first straight
 * runs off the side. Nothing stops in empty space. */
type Seg = { kind: "S" | "R" | "L"; len: number; r?: number };
const RT = 7;
const RT2 = 14;
const SEGS: Seg[] = [
  { kind: "S", len: 54 },
  { kind: "R", len: RT * ((110 * Math.PI) / 180), r: RT },
  { kind: "S", len: 14 },
  { kind: "L", len: RT2 * ((42 * Math.PI) / 180), r: RT2 },
  { kind: "S", len: 70 },
];
const STRAIGHT = SEGS[0].len;
const ARC = SEGS[1].len;
const TOTAL = SEGS.reduce((t, g) => t + g.len, 0);
/** [x, z, turn] at each sample, evenly spaced along the track: turn is +1 in
 * the right-hander, -1 in the left-hander, 0 on the straights. */
const PATH: [number, number, number][] = (() => {
  let x = 0, z = -40, h = 0;   // h: heading, angle from +z towards +x
  let k = 0, into = 0;
  const step = TOTAL / N;
  const out: [number, number, number][] = [[x, z, 0]];
  for (let i = 1; i <= N; i++) {
    let rem = step;
    while (rem > 1e-9) {
      const g = SEGS[k];
      const take = Math.min(rem, g.len - into);
      if (g.kind === "S") {
        x += take * Math.sin(h);
        z += take * Math.cos(h);
      } else {
        const sgn = g.kind === "R" ? 1 : -1;
        const r = g.r!;
        const dh = (sgn * take) / r;
        x += r * sgn * (Math.cos(h) - Math.cos(h + dh));
        z += r * sgn * (Math.sin(h + dh) - Math.sin(h));
        h += dh;
      }
      into += take;
      rem -= take;
      if (into >= g.len - 1e-9 && k < SEGS.length - 1) { k++; into = 0; }
    }
    const kind = SEGS[k].kind;
    out.push([x, z, kind === "R" ? 1 : kind === "L" ? -1 : 0]);
  }
  return out;
})();
/** Signed banking at each sample, easing in and out of each turn. */
const TURN: number[] = PATH.map((_, i) => {
  let sum = 0, n = 0;
  for (let d = -30; d <= 30; d++) { sum += PATH[Math.min(N, Math.max(0, i + d))][2]; n++; }
  return sum / n;
});

/** Gentle rollers, placed in metres along the track: three before the turn,
 * two after it (where mark C shows them). */
const ROLLERS: [number, number][] = [
  [STRAIGHT - 10.5, 1.2], [STRAIGHT - 7.1, 1.2], [STRAIGHT - 3.8, 1.2],
  [STRAIGHT + ARC + 4.4, 1.2], [STRAIGHT + ARC + 8.4, 1.2],
];
const roller = (d: number) => ROLLERS.reduce((h, [c, w]) => h + Math.exp(-(((d - c) / w) ** 2)), 0);

/** The section the side view frames, and the ICRA mark shows: metres along the track. */
const SECTION: [number, number] = [STRAIGHT - 13.9, STRAIGHT + ARC + 14 + SEGS[3].len * 0.6];

type Pt = { x: number; y: number; z: number };

/** Both edges and the centre height of the track, with rollers and banking at
 * strength b. In each turn the outside edge lifts and the inside stays on
 * the floor. */
function track(b: number) {
  const L: Pt[] = [];
  const R: Pt[] = [];
  const C: number[] = [];
  for (let i = 0; i <= N; i++) {
    const [x, z] = PATH[i];
    const [x2, z2] = PATH[Math.min(N, i + 1)];
    const [x1, z1] = PATH[Math.max(0, i - 1)];
    const len = Math.hypot(x2 - x1, z2 - z1) || 1;
    const nx = -(z2 - z1) / len;
    const nz = (x2 - x1) / len;
    // Right-handers lift the left edge, left-handers the right edge.
    const bank = BANK_MAX * TURN[i] * b;
    const rise = (WIDTH / 2) * Math.sin(Math.abs(bank));
    const sg = bank >= 0 ? 1 : -1;
    const y = ROLLER * b * roller((TOTAL * i) / N) + rise;
    C.push(y);
    L.push({ x: x + (nx * WIDTH) / 2, y: y + sg * rise, z: z + (nz * WIDTH) / 2 });
    R.push({ x: x - (nx * WIDTH) / 2, y: y - sg * rise, z: z - (nz * WIDTH) / 2 });
  }
  return { L, R, C };
}

/* ---------------------------------------------------------------------------
 * Cars: small RC cars lapping the track. Each one follows the surface until a
 * crest drops away faster than gravity can pull it down; then it flies,
 * ballistic, until it lands. At this speed every roller launches it.
 * ------------------------------------------------------------------------- */

/** A car on its rails: s metres along the track, in lane 0 or 1. */
type Car = { s: number; lane: number; tint: number };
/** On a run of rollers, each jump is aimed to land this far past the next
 * crest, on its down slope, rather than wherever the take-off sends it
 * (which, at these speeds, is the next roller's up slope: an odd bounce).
 * Aiming nearer the crest clips it and hops again; 1.1 m lands 0.6-0.9 m
 * past it at both lane speeds. */
const LAND_PAST = 1.1;
const G = 9.81;
/** The rails run on 60 m past the track's end (cars leave just after it). */
const LOOP = TOTAL + 60;
/** The exit straight fades out over this stretch (metres along the track),
 * so on tall screens, where all of it is in view, the track never just
 * stops; cars fade with it. */
const FADE_OUT: [number, number] = [TOTAL - 50, TOTAL - 16];
const endFade = (s: number) => 1 - ease((s - FADE_OUT[0]) / (FADE_OUT[1] - FADE_OUT[0]));

/** Floor position, direction (t) and left (n) at s metres along the track; past the end it runs straight on. */
function frameAt(s: number) {
  if (s >= TOTAL) {
    const [x1, z1] = PATH[N - 1], [x2, z2] = PATH[N];
    const l = Math.hypot(x2 - x1, z2 - z1) || 1;
    const tx = (x2 - x1) / l, tz = (z2 - z1) / l;
    return { x: x2 + tx * (s - TOTAL), z: z2 + tz * (s - TOTAL), tx, tz, nx: -tz, nz: tx };
  }
  const k = (Math.max(0, s) / TOTAL) * N;
  const i = Math.min(N - 1, Math.floor(k));
  const t = k - i;
  const [x1, z1] = PATH[i], [x2, z2] = PATH[i + 1];
  const l = Math.hypot(x2 - x1, z2 - z1) || 1;
  const tx = (x2 - x1) / l, tz = (z2 - z1) / l;
  return { x: lerp(x1, x2, t), z: lerp(z1, z2, t), tx, tz, nx: -tz, nz: tx };
}

/** Surface height at s metres along, o metres left of the centre line, with the
 * track at 3D strength b (the same shape track() builds). */
function groundAt(s: number, o: number, b: number): number {
  if (s <= 0 || s >= TOTAL) return 0;
  const k = (s / TOTAL) * N;
  const i = Math.min(N - 1, Math.floor(k));
  const bank = BANK_MAX * lerp(TURN[i], TURN[i + 1], k - i) * b;
  const rise = (WIDTH / 2) * Math.sin(Math.abs(bank));
  return ROLLER * b * roller(s) + rise + (bank >= 0 ? 1 : -1) * rise * (o / (WIDTH / 2));
}

/** The lanes: offset from the centre line (m) and speed (m/s). Both race
 * lanes run at the same speed, so the cars keep their even spacing. */
const LANES = [
  { o: -0.42, v: 8.4 },
  { o: 0.42, v: 8.4 },
  // The centre line: only the ICRA mark's cars use it.
  { o: 0, v: 8.4 },
];
/** Rails resolution: metres per sample. */
const RAIL_STEP = 0.05;

/**
 * Each lane's jumps, worked out once with the full 3D track: how high the car
 * is above the surface at every point of the lap (0 on the ground). The car
 * follows the surface until it falls away faster than gravity, then flies;
 * with another roller close ahead, the jump is aimed for its down slope.
 * Cars then run on these rails: scrolling (which raises and lowers the
 * track) scales the jumps with it and can never launch a car.
 */
const RAILS: Float32Array[] = LANES.map(({ o, v }) => {
  const lift = new Float32Array(Math.ceil(LOOP / RAIL_STEP) + 2);
  const h = 1 / 240;
  let s = 0, y = 0, vy = 0, air = false;
  while (s < LOOP) {
    s += v * h;
    const g = groundAt(s, o, 1);
    if (air) {
      vy -= G * h;
      y += vy * h;
      if (y <= g) {
        air = false;
        y = g;
        vy = (v * (groundAt(s + 0.05, o, 1) - groundAt(s - 0.05, o, 1))) / 0.1;
      }
    } else {
      const follow = (g - y) / h;
      if (follow >= vy - G * h) {
        vy = follow;
        y = g;
      } else {
        air = true;
        const next = ROLLERS.find(([r]) => r > s + 1.5 && r < s + 5.5);
        if (next) {
          const target = next[0] + LAND_PAST;
          const time = (target - s) / v;
          vy = (groundAt(target, o, 1) - y + 0.5 * G * time * time) / time;
        }
        vy -= G * h;
        y += vy * h;
      }
    }
    const i = Math.round(s / RAIL_STEP);
    if (i < lift.length) lift[i] = Math.max(0, y - g);
  }
  // Fill any sample the steps skipped from its neighbour.
  for (let i = 1; i < lift.length; i++) if (lift[i] === 0 && lift[i - 1] > 0 && lift[i + 1] > 0) lift[i] = (lift[i - 1] + lift[i + 1]) / 2;
  return lift;
});

/** Height of a car's wheels above the surface at s, in its lane, at full 3D. */
function liftAt(lane: number, s: number): number {
  const r = RAILS[lane];
  const k = Math.max(0, s) / RAIL_STEP;
  const i = Math.min(r.length - 2, Math.floor(k));
  return lerp(r[i], r[i + 1], k - i);
}

/** Height of a car at s with the track at 3D strength b: the surface, plus
 * its jump scaled with the track. */
function carHeight(c: Car, s: number, b: number): number {
  return groundAt(s, LANES[c.lane].o, b) + liftAt(c.lane, s) * b;
}

/* Traffic: cars enter at the start of the track and leave at its end (both
 * out of sight). A spawn tick comes round on a fixed schedule; each one
 * brings, after a random delay within the tick, either one car in a random
 * lane or a pair (one in each lane, from wheel to wheel to a few lengths
 * apart; never two pairs in a row). The schedule never drifts; the delays and
 * pairs make the gaps uneven. There is no set number of cars, only a cap. */

/** Seconds between spawn ticks; the longest random delay, as a share of a
 * tick. Every tick brings a car, so two cars are never more than
 * SPAWN_EVERY * (1 + SPAWN_DELAY) = 3.0 s apart: about 26 m, so by the time
 * the last car on screen reaches the banked turn the next one is coming on
 * (the track comes into view 31 to 42 m along, the turn is at 54 m). */
const SPAWN_EVERY = 1.9;
const SPAWN_DELAY = 0.6;
/** Chance of a pair per tick (otherwise a single car). */
const P_PAIR = 0.18;
/** How far the second car of a pair trails the first, in seconds (0.05 s is
 * about half a metre, 0.6 s about 5 m). */
const PAIR_LAG: [number, number] = [0.05, 0.6];
/** Most cars on the track at once; closest two cars in one lane may get (m). */
const MAX_CARS = 16;
const MIN_GAP = 5;
/** Where a car leaves (m along): past the track's end, where it has faded out. */
const EXIT = TOTAL + 2;

type Traffic = {
  cars: Car[];
  /** Seconds since the traffic started, and the next tick. */
  t: number;
  tick: number;
  /** Cars due to enter: when, and in which lane. */
  due: { at: number; lane: number }[];
  /** When the last car entered each lane. */
  last: [number, number];
  /** Whether the last tick brought a pair. */
  pair: boolean;
  rand: () => number;
};

/** Advance the traffic by dt seconds: tick the schedule, let in the cars that
 * are due (if there is room under the cap and in their lane), move every car
 * along its rails, and drop the ones past the end. */
function stepTraffic(tr: Traffic, dt: number) {
  const v = LANES[0].v;
  tr.t += dt;
  while (tr.t >= tr.tick) {
    const roll = tr.rand();
    const at = tr.tick + tr.rand() * SPAWN_DELAY * SPAWN_EVERY;
    let lane = tr.rand() < 0.5 ? 0 : 1;
    const pair = roll < P_PAIR && !tr.pair;
    if (pair) {
      tr.due.push({ at, lane }, { at: at + lerp(PAIR_LAG[0], PAIR_LAG[1], tr.rand()), lane: 1 - lane });
    } else {
      // A single car too close behind the last in its lane takes the other one.
      if ((at - tr.last[lane]) * v < MIN_GAP) lane = 1 - lane;
      tr.due.push({ at, lane });
    }
    tr.pair = pair;
    tr.tick += SPAWN_EVERY;
  }
  tr.due.sort((x, y) => x.at - y.at);
  while (tr.due.length && tr.due[0].at <= tr.t) {
    const { at, lane } = tr.due.shift()!;
    if (tr.cars.length >= MAX_CARS || (at - tr.last[lane]) * v < MIN_GAP) continue;
    tr.last[lane] = at;
    tr.cars.push({ s: (tr.t - at) * v, lane, tint: Math.floor(tr.rand() * CAR_ACCENTS.length) });
  }
  for (const c of tr.cars) c.s += LANES[c.lane].v * dt;
  tr.cars = tr.cars.filter((c) => c.s < EXIT);
}

/** The traffic as the page opens: run from empty (fixed seed, so every load
 * starts the same) until the track is full and a car is in the air between
 * the first two rollers (also the still under reduced motion); random after. */
function startingTraffic(): Traffic {
  const tr: Traffic = { cars: [], t: 0, tick: 0, due: [], last: [-1e9, -1e9], pair: false, rand: seeded(11) };
  const flying = () => tr.cars.some((c) => c.s > STRAIGHT - 10 && c.s < STRAIGHT - 7.5 && liftAt(c.lane, c.s) > 0.25);
  const fill = TOTAL / LANES[0].v;
  for (let k = 0; k < 4000 && (tr.t < fill || !flying()); k++) stepTraffic(tr, 1 / 60);
  tr.rand = Math.random;
  return tr;
}

/** A car's pose on the track: ground point, forward (pitched along its
 * path), left (rolled with the banking), up. */
function carPose(c: Car, b: number): CarPose {
  const fr = frameAt(c.s);
  const o = LANES[c.lane].o;
  const x = fr.x + fr.nx * o, z = fr.z + fr.nz * o;
  const y = carHeight(c, c.s, b);
  const pitch = Math.atan((carHeight(c, c.s + 0.1, b) - carHeight(c, c.s - 0.1, b)) / 0.2);
  const roll = Math.atan((groundAt(c.s, WIDTH / 2, b) - groundAt(c.s, -WIDTH / 2, b)) / WIDTH);
  const f: V3 = [fr.tx * Math.cos(pitch), Math.sin(pitch), fr.tz * Math.cos(pitch)];
  const l0: V3 = [fr.nx * Math.cos(roll), Math.sin(roll), fr.nz * Math.cos(roll)];
  // up = left x forward, then left re-squared to both.
  const cross = (a: V3, q: V3): V3 => [a[1] * q[2] - a[2] * q[1], a[2] * q[0] - a[0] * q[2], a[0] * q[1] - a[1] * q[0]];
  const norm = (a: V3): V3 => {
    const m = Math.hypot(...a) || 1;
    return [a[0] / m, a[1] / m, a[2] / m];
  };
  const u = norm(cross(l0, f));
  const l = norm(cross(f, u));
  return { p: [x, y, z], f, l, u };
}

/** The side view (mark C): looking at the turn from the left, 68 degrees round
 * and 16 degrees down. */
const SIDE_AZ = (68 * Math.PI) / 180;
const SIDE_EL = (16 * Math.PI) / 180;

/* The camera always looks at a target point and moves on a sphere around it
 * (theta: the horizontal angle of camera - target, phi: height angle, r:
 * distance). One continuous orbit, so the track never slides on screen:
 *   start  on the floor behind the straight, looking down it (phi 0: a line)
 *   lift   up above the straight
 *   end    round to the side view, aimed at the middle of the section */
type Pt3 = [number, number, number];
const T_START: Pt3 = [0, 0, 20];
const T_LIFT: Pt3 = [0, 0, 12];
const T_END: Pt3 = [4.5, 0.3, 14.5];
const SPH_START: Pt3 = [Math.PI, 0, 21];
const SPH_LIFT: Pt3 = [Math.PI, Math.atan(9 / 18), Math.hypot(9, 18)];
const SPH_END: Pt3 = [SIDE_AZ + Math.PI, SIDE_EL, 60];

type Cam = { pos: Pt3; yaw: number; pitch: number };

function cameraAt(p: number): Cam {
  const { a, c } = phases(p);
  const T = [0, 1, 2].map((k) => lerp(lerp(T_START[k], T_LIFT[k], a), T_END[k], c)) as Pt3;
  const th = lerp(lerp(SPH_START[0], SPH_LIFT[0], a), SPH_END[0], c);
  const ph = lerp(lerp(SPH_START[1], SPH_LIFT[1], a), SPH_END[1], c);
  const r = Math.exp(lerp(lerp(Math.log(SPH_START[2]), Math.log(SPH_LIFT[2]), a), Math.log(SPH_END[2]), c));
  const pos: Pt3 = [T[0] + r * Math.cos(ph) * Math.sin(th), T[1] + r * Math.sin(ph), T[2] + r * Math.cos(ph) * Math.cos(th)];
  const dx = T[0] - pos[0], dy = T[1] - pos[1], dz = T[2] - pos[2];
  return { pos, yaw: Math.atan2(dx, dz), pitch: Math.atan2(-dy, Math.hypot(dx, dz)) };
}

/** Camera space for a world point: x, y and depth. */
function view(c: Cam) {
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  return (q: Pt) => {
    const dx = q.x - c.pos[0], dy = q.y - c.pos[1], dz = q.z - c.pos[2];
    const x = dx * cy - dz * sy;
    const f = dx * sy + dz * cy;
    return { x, y: dy * cp + f * sp, d: -dy * sp + f * cp };
  };
}

/** The lens at the end: the section fitted to 88% of the width (with the aim
 * above, the first bumps sit near the right edge and the turn well left). Computed once
 * per canvas size. */
let endLens = { W: 0, F: 1 };
function endFocal(W: number): number {
  if (endLens.W === W) return endLens.F;
  const v = view(cameraAt(1));
  const { L, R } = track(1);
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) {
    const d = (TOTAL * i) / N;
    if (d < SECTION[0] || d > SECTION[1]) continue;
    for (const q of [L[i], R[i]]) {
      const k = v(q);
      xs.push(k.x / k.d);
    }
  }
  endLens = { W, F: (0.88 * W) / (Math.max(...xs) - Math.min(...xs)) };
  return endLens.F;
}

/** A small seeded random generator, so the traffic starts the same on every load. */
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** The full scene for the chapter at progress p. */
function draw(canvas: HTMLCanvasElement, p: number, cars: Car[] = []) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const { b, c, k } = phases(p);
  const cam = cameraAt(p);
  /** Neutral (the plain 2D line) blended towards a colour by k. */
  const tint = (n: [number, number, number, number], col: [number, number, number, number]) =>
    `rgba(${n.slice(0, 3).map((v, j) => Math.round(v + (col[j] - v) * k)).join(",")},${n[3] + (col[3] - n[3]) * k})`;
  const v = view(cam);
  // The lens lengthens as the camera backs away (log-interpolated, so the
  // apparent size changes evenly). The frame's centre never moves.
  const F0 = Math.min(W, H * 1.6) * 0.95;
  const F = Math.exp(lerp(Math.log(F0), Math.log(endFocal(W)), c));
  const ox = W / 2;
  const oy = H * 0.55;
  const screen = (k: { x: number; y: number; d: number }) => ({ sx: ox + (F * k.x) / k.d, sy: oy - (F * k.y) / k.d });
  const thin = Math.max(1, W / 1600);

  ctx.clearRect(0, 0, W, H);
  ctx.shadowBlur = 0;
  ctx.lineWidth = thin;

  // Horizon glow, synthwave-style: magenta at the horizon line fading into
  // violet below it. Only when the horizon is anywhere near the frame.
  const hy = oy - F * Math.tan(cam.pitch);
  if (k > 0.001 && hy > -H * 0.3 && hy < H * 1.3) {
    const g = ctx.createLinearGradient(0, hy - H * 0.22, 0, hy + H * 0.45);
    g.addColorStop(0, "rgba(251,0,255,0)");
    g.addColorStop(0.32, `rgba(251,0,255,${0.16 * k})`);
    g.addColorStop(0.42, `rgba(124,58,237,${0.14 * k})`);
    g.addColorStop(1, "rgba(124,58,237,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, hy - H * 0.22, W, H * 0.67);
  }

  /** A polygon in the world on screen, cut at the near plane (null if all behind). */
  const screenPoly = (pts: Pt[]) => {
    const c = pts.map(v);
    const out: { x: number; y: number; d: number }[] = [];
    for (let i = 0; i < c.length; i++) {
      const a = c[i], e = c[(i + 1) % c.length];
      if (a.d > NEAR) out.push(a);
      if (a.d > NEAR !== e.d > NEAR) {
        const t = (NEAR - a.d) / (e.d - a.d);
        out.push({ x: a.x + t * (e.x - a.x), y: a.y + t * (e.y - a.y), d: NEAR });
      }
    }
    return out.length > 2 ? out.map(screen) : null;
  };
  /** Add a polygon in the world to the current path, always wound the same way (so
   * overlapping pieces of one fill merge instead of cancelling). */
  const addPoly = (pts: Pt[]) => {
    const P = screenPoly(pts);
    if (!P) return;
    let area = 0;
    for (let i = 0; i < P.length; i++) { const a = P[i], e = P[(i + 1) % P.length]; area += a.sx * e.sy - e.sx * a.sy; }
    const Q = area < 0 ? [...P].reverse() : P;
    ctx.moveTo(Q[0].sx, Q[0].sy);
    for (const q of Q.slice(1)) ctx.lineTo(q.sx, q.sy);
    ctx.closePath();
  };
  // No grid in the site's look: the floor is the page's own flat ink-900.
  const seg = (s: readonly [{ sx: number; sy: number }, { sx: number; sy: number }] | null) => {
    if (s) { ctx.moveTo(s[0].sx, s[0].sy); ctx.lineTo(s[1].sx, s[1].sy); }
  };

  const { L, R, C } = track(b);
  const VL = L.map(v), VR = R.map(v);
  const SL = VL.map((k) => (k.d > NEAR ? screen(k) : null));
  const SR = VR.map((k) => (k.d > NEAR ? screen(k) : null));

  // Under the raised track: its shadow on the floor (the footprint), and a
  // curtain of cyan light from each raised edge down to the floor, fading
  // towards it (four bands, each one path so overlaps never double up).
  if (b > 0.01) {
    const raised = (i: number) => L[i].y > 0.02 || R[i].y > 0.02 || L[i + 1].y > 0.02 || R[i + 1].y > 0.02;
    const flat = (q: Pt): Pt => ({ x: q.x, y: 0, z: q.z });
    ctx.fillStyle = `rgba(6,4,16,${0.3 * b})`;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (!raised(i)) continue;
      addPoly([flat(L[i]), flat(R[i]), flat(R[i + 1]), flat(L[i + 1])]);
    }
    ctx.fill();
    const BANDS = [0.22, 0.14, 0.08, 0.03];
    BANDS.forEach((alpha, j) => {
      const t0 = 1 - j / BANDS.length, t1 = 1 - (j + 1) / BANDS.length;
      const at = (q: Pt, t: number): Pt => ({ x: q.x, y: q.y * t, z: q.z });
      ctx.fillStyle = `rgba(0,209,218,${alpha * b})`;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        for (const E of [L, R]) {
          if (E[i].y < 0.02 && E[i + 1].y < 0.02) continue;
          addPoly([at(E[i], t0), at(E[i + 1], t0), at(E[i + 1], t1), at(E[i], t1)]);
        }
      }
      ctx.fill();
    });
  }

  // Track surface, farthest pieces first, lit by the slope along it and the bank across it.
  // The cars go into the same far-to-near order as the track pieces (a car a
  // little nearer than the piece it stands on), so crests and banking hide
  // them where they should. They appear just after the camera lifts, on the
  // still-flat track.
  const carAlpha = carsIn(p);
  const items: { d: number; i: number; car?: Car; pose?: CarPose }[] = [];
  for (let i = 0; i < N; i++) if (SL[i] && SR[i] && SL[i + 1] && SR[i + 1]) items.push({ d: VL[i].d + VR[i].d, i });
  if (carAlpha > 0.01) {
    for (const car of cars) {
      if (car.s <= 0 || car.s >= TOTAL) continue;
      const pose = carPose(car, b);
      const d = v({ x: pose.p[0], y: pose.p[1], z: pose.p[2] }).d;
      if (d > NEAR + 1) items.push({ d: 2 * d - 1.2, i: -1, car, pose });
    }
  }
  items.sort((x, y) => y.d - x.d);
  const project = (q: V3) => {
    const k = v({ x: q[0], y: q[1], z: q[2] });
    return k.d > NEAR ? { ...screen(k), d: k.d } : null;
  };
  /** One piece of track surface, and every tenth its faint cross-tie. */
  /** How visible the track is at sample i: fading out at the end. */
  const fadeAt = (i: number) => endFade((TOTAL * i) / N);
  const piece = (i: number) => {
    const fa = fadeAt(i + 0.5);
    if (fa < 0.01) return;
    const alpha0 = ctx.globalAlpha;
    ctx.globalAlpha = alpha0 * fa;
    const slope = (C[i + 1] - C[i]) * N * 0.02;
    const tilt = (L[i].y - R[i].y) / WIDTH;
    const lit = Math.max(0, Math.min(1, 0.5 - slope + 0.6 * tilt));
    // Deep violet, lifting towards lavender on the lit faces.
    const col = tint([26 + 46 * lit, 28 + 36 * lit, 52 + 86 * lit, 1], [32 + 62 * lit, 20 + 44 * lit, 70 + 120 * lit, 1]);
    const a0 = SL[i]!, b0 = SR[i]!, a1 = SL[i + 1]!, b1 = SR[i + 1]!;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(a0.sx, a0.sy);
    ctx.lineTo(b0.sx, b0.sy);
    ctx.lineTo(b1.sx, b1.sy);
    ctx.lineTo(a1.sx, a1.sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (i % 10 === 0) {
      ctx.strokeStyle = "rgba(238,240,247,0.14)";
      ctx.beginPath();
      ctx.moveTo(a0.sx, a0.sy);
      ctx.lineTo(b0.sx, b0.sy);
      ctx.stroke();
    }
    ctx.globalAlpha = alpha0;
  };
  const carItems: { d: number; car: Car; pose: CarPose }[] = [];
  for (const { d, i, car, pose } of items) {
    if (car && pose) carItems.push({ d, car, pose });
    else piece(i);
  }

  // The two edges in the logo gradient across the track (cyan, magenta,
  // violet), with a magenta glow that grows as the track goes 3D.
  let minX = Infinity, maxX = -Infinity;
  for (const S of [SL, SR]) for (const q of S) if (q) { minX = Math.min(minX, q.sx); maxX = Math.max(maxX, q.sx); }
  const lo = Math.max(0, minX), hi = Math.min(W, maxX);
  const edge = ctx.createLinearGradient(lo, 0, hi > lo ? hi : lo + 1, 0);
  edge.addColorStop(0, "#00d1da");
  edge.addColorStop(0.57, "#fb00ff");
  edge.addColorStop(1, "#8b5cf6");
  ctx.lineWidth = Math.max(1.5, W / 650);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const edges = () => {
    const base = ctx.globalAlpha;
    /** One stroke through samples a..b of an edge (gaps where it is behind the camera). */
    const run = (S: typeof SL, a: number, z: number) => {
      ctx.beginPath();
      let pen = false;
      for (let i = a; i <= z && i < S.length; i++) {
        const q = S[i];
        if (!q) { pen = false; continue; }
        if (pen) ctx.lineTo(q.sx, q.sy); else ctx.moveTo(q.sx, q.sy);
        pen = true;
      }
      ctx.stroke();
    };
    const f0 = Math.floor((FADE_OUT[0] / TOTAL) * N);
    for (const S of [SL, SR]) {
      // Whole up to the fade, then in short runs at falling strength.
      run(S, 0, f0);
      for (let a = f0; a < N; a += 6) {
        const fa = fadeAt(a + 3);
        if (fa < 0.01) break;
        ctx.globalAlpha = base * fa;
        run(S, a, Math.min(N, a + 6));
      }
      ctx.globalAlpha = base;
    }
  };
  // White first (the plain 2D line), fading out as the colour comes in.
  if (k < 1) {
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = "rgba(238,240,247,0.95)";
    edges();
  }
  if (k > 0) {
    ctx.globalAlpha = k;
    ctx.strokeStyle = edge;
    ctx.shadowColor = "rgba(251,0,255,0.75)";
    ctx.shadowBlur = (W / 140) * (0.35 + 0.65 * b);
    edges();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Cars last, on top of the edges' glow, far to near. Any track clearly
  // nearer than a car (a crest, the high side of the banking) is then painted
  // again over it, clipped to the car's outline, so it still hides the car.
  carItems.sort((x, y) => y.d - x.d);
  for (const { d, car, pose } of carItems) {
    // Fading in (as the track turns 3D, or past the start) and out (with the
    // end of the track) blends the car's colours towards the floor rather than
    // making it see-through, so its hidden faces never show.
    const fade = carAlpha * Math.min(1, car.s / 8) * endFade(car.s);
    if (fade < 0.01) continue;
    ctx.save();
    ctx.shadowBlur = 0;
    // Its shadow on the surface below, fainter and wider the higher it flies.
    const lane = LANES[car.lane].o;
    const lift = liftAt(car.lane, car.s) * b;
    const fr = frameAt(car.s);
    const spread = 1 + lift * 1.5;
    const corners = ([[0.5, 0.28], [0.5, -0.28], [-0.5, -0.28], [-0.5, 0.28]] as const).map(([a, o]) => {
      const sa = car.s + a * spread, so = lane + o * spread;
      return project([fr.x + fr.tx * a * spread + fr.nx * so, groundAt(sa, so, b) + 0.01, fr.z + fr.tz * a * spread + fr.nz * so]);
    });
    if (corners.every(Boolean)) {
      ctx.fillStyle = `rgba(6,4,16,${(0.5 * fade) / (1 + 5 * lift)})`;
      ctx.beginPath();
      corners.forEach((q, j) => (j ? ctx.lineTo(q!.sx, q!.sy) : ctx.moveTo(q!.sx, q!.sy)));
      ctx.closePath();
      ctx.fill();
    }
    const outline = drawCar(ctx, pose, car.tint % CAR_ACCENTS.length, project, cam.pos, thin, fade);
    if (outline && outline.length > 2) {
      const xs = outline.map((q) => q.sx), ys = outline.map((q) => q.sy);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      // A piece of track hides the car only if the camera is above its
      // surface while the car is below it (behind a crest, or under the high
      // side of the banking). Track that is merely nearer, lying flat in
      // front of the car, must not be painted over it.
      const mid: V3 = [pose.p[0] + pose.u[0] * 0.3, pose.p[1] + pose.u[1] * 0.3, pose.p[2] + pose.u[2] * 0.3];
      const front = items.filter((it) => {
        if (it.car || it.d >= d - 0.4) return false;
        const q = [SL[it.i]!, SR[it.i]!, SL[it.i + 1]!, SR[it.i + 1]!];
        if (Math.max(...q.map((z) => z.sx)) < x0 || Math.min(...q.map((z) => z.sx)) > x1 || Math.max(...q.map((z) => z.sy)) < y0 || Math.min(...q.map((z) => z.sy)) > y1) return false;
        const a = L[it.i], bR = R[it.i], c2 = L[it.i + 1];
        const e1: V3 = [bR.x - a.x, bR.y - a.y, bR.z - a.z], e2: V3 = [c2.x - a.x, c2.y - a.y, c2.z - a.z];
        let n: V3 = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
        const side = (q3: V3) => n[0] * (q3[0] - a.x) + n[1] * (q3[1] - a.y) + n[2] * (q3[2] - a.z);
        return side(cam.pos) > 0 && side(mid) < 0;
      });
      if (front.length) {
        ctx.globalAlpha = 1;
        ctx.beginPath();
        outline.forEach((q, j) => (j ? ctx.lineTo(q.sx, q.sy) : ctx.moveTo(q.sx, q.sy)));
        ctx.closePath();
        ctx.clip();
        for (const it of front.sort((x, y) => y.d - x.d)) piece(it.i);
        ctx.strokeStyle = edge;
        ctx.lineWidth = Math.max(1.5, W / 650);
        ctx.beginPath();
        for (const it of front) for (const S of [SL, SR]) seg([S[it.i]!, S[it.i + 1]!] as const);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

/** Logo gradient stops, cyan to magenta to violet, for the mark. */
const MARK_GRAD: [number, [number, number, number]][] = [[0, [0, 209, 218]], [0.57, [251, 0, 255]], [1, [109, 40, 217]]];
function markColour(t: number): string {
  for (let k = 0; k < MARK_GRAD.length - 1; k++) {
    const [t0, c0] = MARK_GRAD[k];
    const [t1, c1] = MARK_GRAD[k + 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((v, j) => Math.round(v + u * (c1[j] - v))).join(",")})`;
    }
  }
  return "rgb(109,40,217)";
}

/** What the mark shows, in metres along the track: the three bumps, the banked
 * turn, the two bumps after it and the whole left-hander, plus a short run of
 * the straight beyond it. */
const MARK_SECTION: [number, number] = [STRAIGHT - 13.9, STRAIGHT + ARC + 14 + SEGS[3].len + 6];

/** The mark's two cars, on the centre line: one just leaving the third
 * roller, nose up (from the same rails as the scene), one leaning into the
 * banked turn. Drawn a little larger than life, as line art in the track's
 * colour where each one is. */
const MARK_CARS: Car[] = (() => {
  // Take-off: the first point near the third crest where the wheels leave
  // the surface; then a few tenths of a metre into the flight.
  let jump = STRAIGHT - 3.8;
  while (jump < STRAIGHT && liftAt(2, jump) < 0.01) jump += RAIL_STEP;
  jump += 0.4;
  return [
    { s: jump, lane: 2, tint: 0 },
    { s: STRAIGHT + ARC * 0.55, lane: 2, tint: 0 },
  ];
})();
const MARK_CAR_SIZE = 1.8;

/** The finished track as a mark: the chapter's final view (the same camera),
 * outline only, coloured along its length in the logo gradient, scaled to
 * fit its box, with two cars on it. */
function drawMark(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const full = track(1);
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const d = (TOTAL * i) / N;
    if (d >= MARK_SECTION[0] && d <= MARK_SECTION[1]) idx.push(i);
  }
  const v = view(cameraAt(1));
  const persp = (q: Pt) => {
    const c = v(q);
    return { sx: c.x / c.d, sy: -c.y / c.d };
  };
  const L = idx.map((i) => persp(full.L[i]));
  const R = idx.map((i) => persp(full.R[i]));
  const all = [...L, ...R];
  const minX = Math.min(...all.map((q) => q.sx)), maxX = Math.max(...all.map((q) => q.sx));
  const minY = Math.min(...all.map((q) => q.sy)), maxY = Math.max(...all.map((q) => q.sy));
  const pad = Math.max(2, W / 120);
  const k = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad) / (maxY - minY));
  const ox = (W - k * (maxX - minX)) / 2 - k * minX;
  const oy = (H - k * (maxY - minY)) / 2 - k * minY;
  const fit = (q: { sx: number; sy: number }) => ({ sx: ox + k * q.sx, sy: oy + k * q.sy });
  const PL = L.map(fit);
  const PR = R.map(fit);
  const M = PL.length - 1;

  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Cross-ties, faint, then the two edges, each piece in its colour along the track.
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = Math.max(1, W / 900);
  for (let i = 0; i <= M; i += 5) {
    ctx.strokeStyle = markColour(i / M);
    ctx.beginPath();
    ctx.moveTo(PL[i].sx, PL[i].sy);
    ctx.lineTo(PR[i].sx, PR[i].sy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(1.5, W / 420);
  for (const P of [PL, PR]) {
    for (let i = 0; i < M; i++) {
      ctx.strokeStyle = markColour(i / M);
      ctx.beginPath();
      ctx.moveTo(P[i].sx, P[i].sy);
      ctx.lineTo(P[i + 1].sx, P[i + 1].sy);
      ctx.stroke();
    }
  }
  // The cars, far one first, through the same camera and fit.
  const cam = cameraAt(1);
  const project = (q: V3) => {
    const c = v({ x: q[0], y: q[1], z: q[2] });
    return c.d > NEAR ? { ...fit({ sx: c.x / c.d, sy: -c.y / c.d }), d: c.d } : null;
  };
  const cars = MARK_CARS.map((c) => ({ pose: carPose(c, 1), t: (c.s - MARK_SECTION[0]) / (MARK_SECTION[1] - MARK_SECTION[0]) }));
  const depth = (q: CarPose) => v({ x: q.p[0], y: q.p[1], z: q.p[2] }).d;
  for (const { pose, t } of cars.sort((a, b) => depth(b.pose) - depth(a.pose))) {
    drawCar(ctx, pose, 0, project, cam.pos, Math.max(1, W / 520), 1, { size: MARK_CAR_SIZE, outline: markColour(t) });
  }
}

/* ---------------------------------------------------------------------------
 * The label: "2D" becomes "3D". The digit slides up and out as the 3 slides
 * up into its place (the D stays), then the type gains an extruded depth in
 * the accent violet, so the word turns 3D with the track.
 * ------------------------------------------------------------------------- */

function extrusion(depth: number): string {
  const n = Math.round(14 * depth);
  if (n === 0) return "none";
  const layers: string[] = [];
  for (let k = 1; k <= n; k++) {
    const t = k / 14;
    const r = Math.round(124 - 88 * t);
    const g = Math.round(58 - 34 * t);
    const bl = Math.round(237 - 150 * t);
    layers.push(`${(k * 0.007).toFixed(3)}em ${(k * 0.007).toFixed(3)}em 0 rgb(${r},${g},${bl})`);
  }
  return layers.join(", ");
}

type Label = { before: string; after: string; noteBefore: string; noteAfter: string };

type TerrainSceneProps = {
  /** "pinned": the full-screen chapter (pins on desktop, scrubbed). "inline": the finished track as a mark, like a logo, as wide as className makes it. */
  variant: "pinned" | "inline";
  /** Section header, drawn over the scene's top-left (pinned only). */
  header?: ReactNode;
  /** The big 2D -> 3D label (pinned only). */
  label?: Label;
  className?: string;
};

export default function TerrainScene({ variant, header, label, className = "" }: TerrainSceneProps) {
  const reduced = usePrefersReducedMotion();
  const desktop = useDesktop();
  const pinned = variant === "pinned" && desktop && !reduced;
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(1);
  const beforeRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const noteBeforeRef = useRef<HTMLSpanElement>(null);
  const noteAfterRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const trafficRef = useRef<Traffic | null>(variant === "pinned" ? startingTraffic() : null);
  const pauseRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const canvasId = useId();

  /** Paint the scene and the label for progress p (0 = 2D, 1 = 3D). */
  const renderRef = useRef((p: number) => {
    void p;
  });
  renderRef.current = (p: number) => {
    progressRef.current = p;
    const c = canvasRef.current;
    if (c) {
      if (variant === "inline") drawMark(c);
      else draw(c, p, trafficRef.current?.cars ?? []);
    }
    // Digit swap in the middle of the shift, depth as the bumps grow.
    const t = Math.max(0, Math.min(1, (p - 0.46) / 0.14));
    const swap = t * t * (3 - 2 * t);
    if (beforeRef.current) {
      beforeRef.current.style.transform = `translateY(${-0.55 * swap}em)`;
      beforeRef.current.style.opacity = String(1 - swap);
    }
    if (afterRef.current) {
      afterRef.current.style.transform = `translateY(${0.55 * (1 - swap)}em)`;
      afterRef.current.style.opacity = String(swap);
    }
    if (noteBeforeRef.current) noteBeforeRef.current.style.opacity = String(1 - swap);
    if (noteAfterRef.current) noteAfterRef.current.style.opacity = String(swap);
    if (wordRef.current) wordRef.current.style.textShadow = extrusion(phases(p).b);
    // The Pause button is there while the cars are. Hidden, it also leaves the tab order.
    if (pauseRef.current) pauseRef.current.style.visibility = carsIn(p) > 0 ? "visible" : "hidden";
  };

  // The cars run only while the scene is on screen.
  useEffect(() => {
    const el = stageRef.current;
    if (variant !== "pinned" || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, [variant, pinned]);

  // The cars' loop: they run while the scene is on screen, until paused.
  // Reduced motion, or off screen: nothing runs; the cars hold their
  // starting still, mid-jump.
  useEffect(() => {
    if (variant !== "pinned" || reduced || !onScreen || paused) {
      renderRef.current(progressRef.current);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (trafficRef.current) stepTraffic(trafficRef.current, dt);
      renderRef.current(progressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [variant, paused, reduced, onScreen]);

  // Size the canvas to its box at device resolution, and repaint on resize.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      renderRef.current(progressRef.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [pinned]);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const stage = stageRef.current;
      if (!wrap || !stage) return;
      // The inline band is a still: the finished 3D track, never animated.
      if (variant === "inline") {
        renderRef.current(1);
        return;
      }
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK_QUERY, desktop: DESKTOP_QUERY }, (ctx) => {
        const { motion, desktop: wide } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) {
          renderRef.current(1);
          return;
        }
        const state = { p: 0 };
        renderRef.current(0);
        const trigger = wide
          ? { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.6 }
          : { trigger: stage, start: "top 85%", end: "bottom 35%", scrub: 0.6 };
        gsap.to(state, { p: 1, ease: "none", onUpdate: () => renderRef.current(state.p), scrollTrigger: trigger });
        return () => renderRef.current(1);
      });
    },
    { scope: wrapRef, dependencies: [variant, pinned] },
  );

  const canvas = <canvas ref={canvasRef} id={canvasId} aria-hidden="true" className="absolute inset-0 h-full w-full" />;

  if (variant === "inline") {
    return (
      <div ref={wrapRef} className={className}>
        <div ref={stageRef} className="relative aspect-[21/10] w-full">
          {canvas}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative ${pinned ? "h-[240vh]" : ""} ${className}`}>
      <div
        ref={stageRef}
        className={`${pinned ? "sticky top-0 h-[100svh]" : "h-[85svh] min-h-[32rem]"} relative w-full overflow-hidden`}
      >
        {canvas}
        {/* Keeps the copy readable where the far track runs behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink-900 via-ink-900/40 via-35% to-transparent to-60%"
        />
        <div className="relative mx-auto flex h-full max-w-page flex-col justify-between px-6 pb-10 pt-[calc(var(--spacing-nav)+2rem)]">
          <div className="max-w-md">{header}</div>
          {label && (
            <p aria-hidden="true" className="flex items-baseline gap-4">
              <span
                ref={wordRef}
                className="relative inline-flex font-display text-display-xl font-semibold leading-none text-text-on-ink"
              >
                <span className="relative inline-block">
                  <span ref={beforeRef} className="inline-block">
                    {label.before.replace(/D$/, "")}
                  </span>
                  <span ref={afterRef} className="absolute inset-0 inline-block">
                    {label.after.replace(/D$/, "")}
                  </span>
                </span>
                <span>D</span>
              </span>
              <span className="relative font-mono text-small text-text-on-ink-muted">
                <span ref={noteBeforeRef}>{label.noteBefore}</span>
                <span ref={noteAfterRef} className="absolute left-0 top-0 whitespace-nowrap">
                  {label.noteAfter}
                </span>
              </span>
            </p>
          )}
        </div>
        {/* The cars never stop on their own (WCAG 2.2.2), so they can be paused. */}
        {!reduced && (
          <div ref={pauseRef} className="invisible absolute bottom-6 right-6">
            <PauseToggle
              always
              paused={paused}
              onToggle={() => setPaused((v) => !v)}
              controls={canvasId}
              className="border-text-on-ink/30! bg-ink-950/70 text-text-on-ink! hover:border-text-on-ink/60!"
            />
          </div>
        )}
      </div>
    </div>
  );
}
