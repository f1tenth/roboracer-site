# Frame scrubber: reference implementation

Two files. `src/lib/frameSequence.ts` is framework-free (loader + canvas drawer);
`HeroCinematic.tsx` wires it to one scrubbed GSAP timeline. Adapt to the repo's conventions
(`gsap`/`useGSAP` from `src/lib/motion.ts`, `mediaUrl`, `usePrefersReducedMotion`, the `desktop:`
variant, `EASE_IN_OUT_QUART`). Read `HeroChapter.tsx` first and keep its headline markup, static
fallback, nav-fill contract and glide.

## src/lib/frameSequence.ts

```ts
// Scroll-scrubbed frame sequence: progressive loader + cover-fit canvas drawer.
// No framework code here so it can be unit-tested and reused.

export type FrameSet = {
  /** Directory URL with a trailing slash, e.g. mediaUrl("/media/hero-cine/d/"). */
  base: string;
  count: number;
  width: number;
  height: number;
  pad?: number; // zero padding of the index in the file name (default 4)
  ext?: string; // "webp"
};

export type LoadPhase = "idle" | "coarse" | "fine" | "done";

const frameUrl = (set: FrameSet, i: number) =>
  `${set.base}f_${String(i + 1).padStart(set.pad ?? 4, "0")}.${set.ext ?? "webp"}`;

/**
 * Loads a frame set in two passes: every `stride`-th frame first (so scrubbing can start
 * within a second or two), then the rest in order. `onFrame` fires per decoded frame so the
 * caller can repaint when the frame under the cursor arrives. Decoded bitmaps live in the
 * browser's image cache; the array only holds HTMLImageElements (cheap).
 */
export class FrameLoader {
  readonly frames: (HTMLImageElement | null)[];
  phase: LoadPhase = "idle";
  private aborted = false;
  constructor(
    readonly set: FrameSet,
    private readonly opts: { stride?: number; concurrency?: number; onFrame?: (i: number) => void; onPhase?: (p: LoadPhase) => void } = {},
  ) {
    this.frames = new Array(set.count).fill(null);
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
    // decode() resolves once the bitmap is ready; a failed frame stays null and the drawer
    // falls back to the nearest loaded neighbour.
    return img
      .decode()
      .then(() => {
        if (this.aborted) return;
        this.frames[i] = img;
        this.opts.onFrame?.(i);
      })
      .catch(() => undefined);
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
    for (let i = 0; i < this.set.count; i++) (i % stride === 0 || i === this.set.count - 1 ? coarse : fine).push(i);
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
 * Cover-fit drawer. Sizes the canvas to its CSS box times devicePixelRatio (capped at 2),
 * draws one frame per animation frame at most, and anchors the crop on `focusX` (0..1) so
 * the subject stays in frame on portrait viewports.
 */
export class FrameCanvas {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private pending: HTMLImageElement | null = null;
  private last: HTMLImageElement | null = null;
  private w = 0;
  private h = 0;
  private dpr = 1;
  focusX = 0.5;
  focusY = 0.5;

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.resize();
  }

  /** Call on mount and on resize (ResizeObserver on the canvas box). */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(1, Math.round(rect.width * this.dpr));
    this.h = Math.max(1, Math.round(rect.height * this.dpr));
    if (this.canvas.width !== this.w || this.canvas.height !== this.h) {
      this.canvas.width = this.w;
      this.canvas.height = this.h;
    }
    if (this.last) this.paint(this.last);
  }

  /** Schedule a draw; coalesces to one paint per animation frame. */
  draw(img: HTMLImageElement | null) {
    if (!img) return;
    this.pending = img;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      if (this.pending) this.paint(this.pending);
      this.pending = null;
    });
  }

  private paint(img: HTMLImageElement) {
    this.last = img;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.max(this.w / iw, this.h / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (this.w - dw) * this.focusX;
    const dy = (this.h - dh) * this.focusY;
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
```

## HeroCinematic.tsx, the parts that differ from HeroChapter.tsx

```tsx
// Frame set choice: desktop from 768px up, else mobile (same query as the video sources today).
const wide = window.matchMedia(WIDE_QUERY).matches;
const set = wide ? frames.desktop : frames.mobile;

// Progress -> frame index. The film runs from SCRUB_START to SCRUB_END of the pin.
const S = { scrubStart: 0.05, scrubEnd: 0.8 };
const frameAt = (p: number) => {
  const t = (p - S.scrubStart) / (S.scrubEnd - S.scrubStart);
  return Math.max(0, Math.min(1, t)) * (set.count - 1);
};

useGSAP(() => {
  if (isStatic) return;
  const canvasEl = canvasRef.current!;
  const drawer = new FrameCanvas(canvasEl);
  drawer.focusX = focusX;
  const loader = new FrameLoader(set, {
    stride: 6,
    concurrency: 6,
    // Repaint when the frame nearest the cursor arrives (the coarse pass draws a neighbour first).
    onFrame: (i) => { if (Math.abs(i - proxy.f) < 3) drawer.draw(loader.nearest(proxy.f)); },
    onPhase: (ph) => { if (ph === "fine") { setReady(true); scheduleGlide(); } }, // coarse pass complete
  });
  const proxy = { f: 0 };
  const ro = new ResizeObserver(() => drawer.resize());
  ro.observe(canvasEl);

  // Start loading after the page is interactive; the poster is the LCP element.
  const kick = () => void loader.start();
  if (document.readyState === "complete") kick(); else window.addEventListener("load", kick, { once: true });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true,
      onToggle: (self) => gsap.set(animated, { willChange: self.isActive ? "transform" : "auto" }) },
  });
  // The film: a proxy tween whose onUpdate paints. Duration = the scrub window in p.
  tl.to(proxy, {
    f: set.count - 1, duration: S.scrubEnd - S.scrubStart,
    onUpdate: () => drawer.draw(loader.nearest(proxy.f)),
  }, S.scrubStart);
  // ...headline units at BEATS, block scale, canvas filter (brightness/saturate) as in HeroChapter,
  // description, hold; the scroll-out timeline is copied from HeroChapter unchanged
  // (fade 0.22-0.62, brightness to 0.12).

  return () => { loader.abort(); ro.disconnect(); drawer.destroy(); };
}, { scope, dependencies: [isStatic, sentence, set.base], revertOnUpdate: true });
```

Notes that matter:

- The proxy tween is what makes progress deterministic: `frameAt` is not used by GSAP, it is
  the same mapping written for tests and for the glide target (`GLIDE_TARGET_P` -> frames
  covered -> duration = frames / 24).
- Draw only the nearest loaded frame; never await a network fetch inside `onUpdate`.
- `scrub: 0.8` smooths wheel steps into motion; lower to 0.5 if the film lags the words.
- The canvas gets the CSS `filter` tween (brightness, saturate), the same way the video layer
  does in `HeroChapter`; `blur` stays 0 (measured too expensive in v4).
- The poster `<img>` sits under the canvas; the canvas fades in (`opacity` transition 200 ms)
  when the coarse pass completes, so a slow connection still shows the locked frame and the
  headline schedule keeps running.
- Under reduced motion or `isWeakDevice()` return the static layout copied from
  `HeroChapter`: no canvas mounted, no loader created, nothing fetched.
- Memory: 160 frames at 1600x900 decode to about 5.8 MB each; the browser evicts and re-decodes
  from its cache as needed (a few ms per frame). Do not hold `ImageBitmap`s for the whole set.
- Test the loader in isolation (Node + jsdom is not needed: a small Playwright script that
  scrolls to p = 0.3 and reads `canvas.toDataURL()` twice, before and after `fine`, proves the
  repaint path).
- Capture method for QA: CDP screenshots after `window.scrollTo(top + p * (H - vh))`,
  `page.mouse.wheel(0, 1)`, 600 ms settle (Lenis + ScrollTrigger sync), as `docs/HANDOFF.md` says.
