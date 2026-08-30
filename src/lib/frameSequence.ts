// Scroll-scrubbed frame sequence: a progressive loader and a cover-fit canvas
// drawer, with no framework code so the pieces can be tested and reused
// (docs/plans/hero-cinematic-v1.md section 7; reference implementation in
// .claude/skills/hero-cinematic/references/frame-scrubber.md).

export type FrameSet = {
  /** Directory URL with a trailing slash, e.g. mediaUrl("/media/hero-cine/d/"). */
  base: string;
  count: number;
  width: number;
  height: number;
  /** Zero padding of the index in the file name (default 4: f_0001.webp). */
  pad?: number;
  ext?: string;
};

export type LoadPhase = "idle" | "coarse" | "fine" | "done";

export const frameUrl = (set: FrameSet, i: number): string =>
  `${set.base}f_${String(i + 1).padStart(set.pad ?? 4, "0")}.${set.ext ?? "webp"}`;

/**
 * Pin progress -> frame index. The film runs from `scrubStart` to `scrubEnd`
 * of the pin, linearly; outside that window it holds the first or the last
 * frame. Shared by the GSAP proxy tween (through the same numbers), the glide
 * duration and the QA script.
 */
export function frameAt(p: number, scrubStart: number, scrubEnd: number, count: number): number {
  if (count <= 1) return 0;
  const t = (p - scrubStart) / (scrubEnd - scrubStart);
  return Math.max(0, Math.min(1, t)) * (count - 1);
}

/**
 * Loads a frame set in two passes: every `stride`-th frame first (so scrubbing
 * can start within a second or two), then the rest in order. `onFrame` fires
 * per decoded frame so the caller can repaint when the frame under the cursor
 * arrives. Decoded bitmaps live in the browser's image cache; the array only
 * holds HTMLImageElements (cheap).
 */
export class FrameLoader {
  readonly frames: (HTMLImageElement | null)[];
  phase: LoadPhase = "idle";
  loaded = 0;
  failed = 0;
  private aborted = false;

  constructor(
    readonly set: FrameSet,
    private readonly opts: {
      stride?: number;
      concurrency?: number;
      onFrame?: (i: number) => void;
      onPhase?: (p: LoadPhase) => void;
    } = {},
  ) {
    this.frames = new Array<HTMLImageElement | null>(set.count).fill(null);
  }

  abort() {
    this.aborted = true;
  }

  private setPhase(p: LoadPhase) {
    this.phase = p;
    this.opts.onPhase?.(p);
  }

  private load(i: number): Promise<void> {
    if (this.frames[i] || this.aborted) return Promise.resolve();
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(this.set, i);
    const keep = () => {
      if (this.aborted) return;
      this.frames[i] = img;
      this.loaded += 1;
      this.opts.onFrame?.(i);
    };
    // decode() resolves once the bitmap is ready. Chrome rejects decode() for
    // an image it chose not to keep decoded (memory pressure) even though the
    // file loaded fine; that frame is still drawable, so keep it. A frame that
    // really failed stays null and the drawer falls back to the nearest
    // loaded neighbour.
    return img
      .decode()
      .then(keep)
      .catch(() => {
        if (img.complete && img.naturalWidth > 0) keep();
        else this.failed += 1;
      });
  }

  private async pool(indices: number[]) {
    const n = this.opts.concurrency ?? 6;
    let next = 0;
    const worker = async () => {
      while (next < indices.length && !this.aborted) {
        const i = indices[next++];
        await this.load(i);
      }
    };
    await Promise.all(Array.from({ length: Math.min(n, indices.length) }, worker));
  }

  /** Coarse pass, then fine pass. Resolves when everything that could load has loaded. */
  async start() {
    const stride = this.opts.stride ?? 6;
    const coarse: number[] = [];
    const fine: number[] = [];
    for (let i = 0; i < this.set.count; i++) {
      (i % stride === 0 || i === this.set.count - 1 ? coarse : fine).push(i);
    }
    this.setPhase("coarse");
    await this.pool(coarse);
    if (this.aborted) return;
    this.setPhase("fine");
    await this.pool(fine);
    if (!this.aborted) this.setPhase("done");
  }

  /** Nearest loaded frame to i (searching outward), or null when nothing has loaded yet. */
  nearest(i: number): HTMLImageElement | null {
    const n = this.frames.length;
    if (n === 0) return null;
    i = Math.max(0, Math.min(n - 1, Math.round(i)));
    if (this.frames[i]) return this.frames[i];
    for (let d = 1; d < n; d++) {
      if (i - d >= 0 && this.frames[i - d]) return this.frames[i - d];
      if (i + d < n && this.frames[i + d]) return this.frames[i + d];
    }
    return null;
  }
}

/**
 * Cover-fit drawer. Sizes the canvas to its CSS box times devicePixelRatio
 * (capped at 2), draws one frame per animation frame at most, and anchors the
 * crop on `focusX` / `focusY` (0..1) so the subject stays in frame on portrait
 * viewports. `painted` and `skipped` count draws for the QA timing record.
 */
export class FrameCanvas {
  private readonly ctx: CanvasRenderingContext2D;
  private raf = 0;
  private pending: HTMLImageElement | null = null;
  private last: HTMLImageElement | null = null;
  private w = 0;
  private h = 0;
  painted = 0;
  skipped = 0;
  focusX = 0.5;
  focusY = 0.5;

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.resize();
  }

  /** Call on mount and on resize (ResizeObserver on the canvas box). */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(1, Math.round(rect.width * dpr));
    this.h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== this.w || this.canvas.height !== this.h) {
      this.canvas.width = this.w;
      this.canvas.height = this.h;
    }
    if (this.last) this.paint(this.last, true);
  }

  /** Schedule a draw; coalesces to one paint per animation frame. */
  draw(img: HTMLImageElement | null) {
    if (!img) return;
    if (this.pending && this.pending !== img) this.skipped += 1;
    this.pending = img;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      const next = this.pending;
      this.pending = null;
      if (next) this.paint(next);
    });
  }

  private paint(img: HTMLImageElement, force = false) {
    if (!force && img === this.last) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;
    this.last = img;
    const scale = Math.max(this.w / iw, this.h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (this.w - dw) * this.focusX;
    const dy = (this.h - dh) * this.focusY;
    this.ctx.drawImage(img, dx, dy, dw, dh);
    this.painted += 1;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.pending = null;
  }
}
