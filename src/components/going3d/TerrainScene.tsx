import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGSAP, useDesktop, DESKTOP_QUERY, MOTION_OK_QUERY } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/* ---------------------------------------------------------------------------
 * The scene: a track and the floor grid around it, in 3D, drawn on a canvas
 * with a plain perspective camera (no three.js on this page).
 *
 * The trick behind "2D": a flat world seen exactly edge-on, from its own
 * height, collapses into one line. So at p = 0 the camera sits on the floor
 * and the whole track and grid read as a single line across the screen. As p
 * grows the camera rises and tilts down (the line opens into a plane running
 * to the horizon), then bumps grow out of the track and the camera drifts.
 * ------------------------------------------------------------------------- */

const N = 600;            // track samples
const WIDTH = 1.8;        // track width
const ROLLER = 0.45;      // tallest roller at full height
const BANK_MAX = 0.5;     // ~29 degrees through the middle of the turn
const GRID = { x0: -90, x1: 90, z0: -80, z1: 120, step: 3 };
const NEAR = 0.2;         // near clipping plane, metres in front of the camera

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

/** The full scene for the chapter at progress p. */
function draw(canvas: HTMLCanvasElement, p: number) {
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
  /** A line, cut at the near plane so nothing behind the camera is drawn. */
  const line = (q0: Pt, q1: Pt) => {
    let a0 = v(q0), a1 = v(q1);
    if (a0.d <= NEAR && a1.d <= NEAR) return null;
    if (a0.d <= NEAR || a1.d <= NEAR) {
      const t = (NEAR - a0.d) / (a1.d - a0.d);
      const m = { x: a0.x + t * (a1.x - a0.x), y: a0.y + t * (a1.y - a0.y), d: NEAR };
      if (a0.d <= NEAR) a0 = m; else a1 = m;
    }
    return [screen(a0), screen(a1)] as const;
  };
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

  // Floor grid, in violet; it bunches into a brighter band towards the horizon.
  ctx.strokeStyle = tint([238, 240, 247, 0.12], [167, 139, 250, 0.2]);
  ctx.beginPath();
  for (let gx = GRID.x0; gx <= GRID.x1; gx += GRID.step) {
    const s = line({ x: gx, y: 0, z: GRID.z0 }, { x: gx, y: 0, z: GRID.z1 });
    if (s) { ctx.moveTo(s[0].sx, s[0].sy); ctx.lineTo(s[1].sx, s[1].sy); }
  }
  for (let gz = GRID.z0; gz <= GRID.z1; gz += GRID.step) {
    const s = line({ x: GRID.x0, y: 0, z: gz }, { x: GRID.x1, y: 0, z: gz });
    if (s) { ctx.moveTo(s[0].sx, s[0].sy); ctx.lineTo(s[1].sx, s[1].sy); }
  }
  ctx.stroke();

  const { L, R, C } = track(b);
  const VL = L.map(v), VR = R.map(v);
  const SL = VL.map((k) => (k.d > NEAR ? screen(k) : null));
  const SR = VR.map((k) => (k.d > NEAR ? screen(k) : null));

  // Supports under any edge that is off the floor.
  if (b > 0.01) {
    ctx.strokeStyle = `rgba(0,209,218,${0.45 * b})`;
    ctx.beginPath();
    for (let i = 0; i <= N; i += 6) {
      for (const e of [L[i], R[i]]) {
        if (e.y < 0.05) continue;
        const s = line(e, { x: e.x, y: 0, z: e.z });
        if (s) { ctx.moveTo(s[0].sx, s[0].sy); ctx.lineTo(s[1].sx, s[1].sy); }
      }
    }
    ctx.stroke();
  }

  // Track surface, farthest pieces first, lit by the slope along it and the bank across it.
  const order: number[] = [];
  for (let i = 0; i < N; i++) if (SL[i] && SR[i] && SL[i + 1] && SR[i + 1]) order.push(i);
  order.sort((i, j) => VL[j].d + VR[j].d - (VL[i].d + VR[i].d));
  for (const i of order) {
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
    for (const S of [SL, SR]) {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= N; i++) {
        const q = S[i];
        if (!q) { pen = false; continue; }
        if (pen) ctx.lineTo(q.sx, q.sy); else ctx.moveTo(q.sx, q.sy);
        pen = true;
      }
      ctx.stroke();
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

/** The finished track as a mark: the chapter's final view (the same camera),
 * outline only, coloured along its length in the logo gradient, scaled to
 * fit its box. */
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
  /** "pinned": the full-screen chapter (pins on desktop, scrubbed). "inline": the finished track as a small mark, like a logo. */
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

  /** Paint the scene and the label for progress p (0 = 2D, 1 = 3D). */
  const renderRef = useRef((p: number) => {
    void p;
  });
  renderRef.current = (p: number) => {
    progressRef.current = p;
    const c = canvasRef.current;
    if (c) {
      if (variant === "inline") drawMark(c);
      else draw(c, p);
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
  };

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

  const canvas = <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;

  if (variant === "inline") {
    return (
      <div ref={wrapRef} className={className}>
        <div ref={stageRef} className="relative aspect-[5/2] w-full max-w-[26rem]">
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
        {/* Keeps the copy readable where the far grid and track run behind it. */}
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
      </div>
    </div>
  );
}
