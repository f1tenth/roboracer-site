import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP, useDesktop, DESKTOP_QUERY, MOTION_OK_QUERY } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { Going3DFile } from "../../lib/data";

type Frames = Going3DFile["car"]["frames"];
type FrameSet = Frames["sets"][number];

function frameSrc(f: Frames, set: FrameSet, i: number): string {
  return `${set.base}${String(i).padStart(f.digits, "0")}${f.ext}`;
}

/** The smallest set that is sharp here: the CSS width the turntable gets on
 * this screen, times the pixel density (capped at 2). A 1x laptop and most
 * phones get the small set; a retina laptop the large one. Chosen once. */
function pickSet(f: Frames): FrameSet {
  const sets = [...f.sets].sort((a, b) => a.width - b.width);
  const css = Math.min(f.display_width, window.innerWidth);
  const need = css * Math.min(window.devicePixelRatio || 1, 2);
  return sets.find((s) => s.width >= need * 0.9) ?? sets[sets.length - 1];
}

/** The camera angle of frame i relative to the face-on view, e.g. "−50°", "0°", "+24°". */
function angleLabel(f: Frames, i: number): string {
  const a = f.angle_start + i * f.degrees_per_frame;
  return `${a > 0 ? "+" : a < 0 ? "−" : ""}${Math.abs(a)}°`;
}

/** Load order: a coarse pass over the whole turn first (every 8th frame), then
 * finer passes, so a nearby frame is ready wherever the reader scrolls to. */
function coarseToFine(count: number, first: number): number[] {
  const order = [first];
  const seen = new Set(order);
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

/** How many frames download at once. */
const PARALLEL = 4;

/** Where each of the four callouts sits around the car while it turns. */
const CORNER = [
  "left-0 top-[6%]",
  "right-0 top-[6%] text-right",
  "left-0 bottom-[12%]",
  "right-0 bottom-[12%] text-right",
];

type TurntableProps = {
  frames: Frames;
  alt: string;
  callouts: { title: string; body: string }[];
  hint: string;
  /** The section header (eyebrow, h2, lead), drawn above the stage. */
  header: ReactNode;
};

/**
 * The car turns from one front quarter, past the face, to the other (-50 to
 * +50 degrees from face-on, 2-degree steps) as the reader scrolls: an image sequence (frames baked onto the section's ink so
 * their edges vanish) drawn on a canvas by ScrollTrigger progress.
 *
 * No flicker: the canvas only ever draws a frame that has finished
 * downloading and decoding. If the frame the scroll asks for is not ready
 * yet, it draws the nearest one that is, and swaps in the right one the
 * moment it lands. All frames start loading with the page (coarse to fine,
 * a few at a time), behind the hero, so they are in by the time the reader
 * gets here. An <img> of the first frame sits under the canvas, so the stage
 * is never empty.
 *
 * desktop: pinned (sticky over 260vh); the four callouts appear one by one.
 * compact (phones, short windows): not pinned; the car turns as it scrolls
 *   past, callouts listed under it.
 * reduced motion: the face-on still, callouts listed, nothing preloaded.
 */
export default function Turntable({ frames, alt, callouts, hint, header }: TurntableProps) {
  const reduced = usePrefersReducedMotion();
  const desktop = useDesktop();
  const pinned = !reduced && desktop;
  const [set] = useState(() => pickSet(frames));
  const aspect = set.width / set.height;
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<HTMLSpanElement>(null);
  /** Decoded frames by index; null until that frame is ready to draw. */
  const readyRef = useRef<(HTMLImageElement | null)[]>([]);
  /** The frame the scroll position asks for, and the frame on the canvas. */
  const targetRef = useRef(0);
  const drawnRef = useRef(-1);

  /** Draw the target frame, or the nearest ready one; never blank the canvas. */
  const drawRef = useRef(() => {});
  drawRef.current = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const ready = readyRef.current;
    const t = targetRef.current;
    let best = -1;
    for (let d = 0; d < frames.count && best < 0; d++) {
      if (ready[t - d]) best = t - d;
      else if (ready[t + d]) best = t + d;
    }
    if (best < 0 || best === drawnRef.current) return;
    ctx.drawImage(ready[best] as HTMLImageElement, 0, 0, canvas.width, canvas.height);
    drawnRef.current = best;
  };

  // Preload every frame with the page, coarse to fine, PARALLEL at a time.
  useEffect(() => {
    if (reduced) return;
    readyRef.current = new Array(frames.count).fill(null);
    drawnRef.current = -1;
    const order = coarseToFine(frames.count, 0);
    let next = 0;
    let cancelled = false;
    const worker = async () => {
      while (!cancelled && next < order.length) {
        const i = order[next++];
        const im = new Image();
        im.decoding = "async";
        im.src = frameSrc(frames, set, i);
        try {
          await im.decode();
        } catch {
          continue;
        }
        if (cancelled) return;
        readyRef.current[i] = im;
        drawRef.current();
      }
    };
    // After the hero's own image has had its head start.
    const start = window.setTimeout(() => {
      for (let k = 0; k < PARALLEL; k++) void worker();
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [reduced, frames, set]);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const stage = stageRef.current;
      if (!wrap || !stage) return;
      const state = { f: 0 };
      const show = () => {
        const i = Math.min(frames.count - 1, Math.max(0, Math.round(state.f)));
        if (i === targetRef.current && drawnRef.current === i) return;
        targetRef.current = i;
        drawRef.current();
        if (angleRef.current) angleRef.current.textContent = angleLabel(frames, i);
      };
      const turn = { f: frames.count - 1, ease: "none", onUpdate: show };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK_QUERY, desktop: DESKTOP_QUERY }, (ctx) => {
        const { motion, desktop: wide } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        if (wide) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.6 },
          });
          tl.fromTo(state, { f: 0 }, { ...turn, duration: 1 }, 0);
          gsap.utils.toArray<HTMLElement>("[data-callout]", wrap).forEach((c, i) => {
            tl.fromTo(c, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08, ease: "none" }, 0.08 + i * 0.2);
          });
        } else {
          gsap.fromTo(state, { f: 0 }, {
            ...turn,
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.6 },
          });
        }
        return () => {
          state.f = 0;
          show();
        };
      });
    },
    { scope: wrapRef, dependencies: [frames, pinned] },
  );

  // Moving: the turn starts on frame 0. Reduced motion: the face-on still.
  const poster = reduced ? frames.still : 0;

  const callout = (c: { title: string; body: string }, i: number) => (
    <div key={c.title} data-callout className={pinned ? `absolute max-w-[15rem] ${CORNER[i % 4]}` : ""}>
      <p className="font-mono text-small text-text-on-ink-muted">{String(i + 1).padStart(2, "0")}</p>
      <p className="mt-1 font-display text-lead font-semibold text-text-on-ink">{c.title}</p>
      <p className="mt-1 text-small text-text-on-ink-muted">{c.body}</p>
    </div>
  );

  return (
    <div ref={wrapRef} className={pinned ? "relative h-[260vh]" : "relative"}>
      <div
        className={
          pinned
            ? "sticky top-0 flex h-[100svh] flex-col pb-6 pt-[calc(var(--spacing-nav)+1.5rem)]"
            : "py-section"
        }
      >
        <div className="mx-auto w-full max-w-page px-6">{header}</div>
        <div ref={stageRef} className={`mx-auto w-full max-w-page px-6 ${pinned ? "relative flex flex-1 items-center" : "mt-8"}`}>
          <div className="relative w-full">
            {/* Never past the frames' native width; pinned, also short enough to fit under the header. */}
            <div
              className="relative mx-auto"
              style={{
                maxWidth: pinned
                  ? `min(${frames.display_width / 16}rem, calc((100svh - var(--spacing-nav) - 16rem) * ${aspect}))`
                  : `${frames.display_width / 16}rem`,
              }}
            >
              <img
                src={frameSrc(frames, set, poster)}
                alt={alt}
                width={set.width}
                height={set.height}
                decoding="async"
                className="block h-auto w-full"
              />
              {!reduced && (
                <canvas
                  ref={canvasRef}
                  width={set.width}
                  height={set.height}
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full"
                />
              )}
            </div>
            {pinned && callouts.map(callout)}
          </div>
        </div>
        {!reduced && (
          <p className="mx-auto mt-2 flex w-full max-w-page items-baseline justify-between px-6 font-mono text-small text-text-on-ink-muted">
            <span ref={angleRef} aria-hidden="true">
              {angleLabel(frames, 0)}
            </span>
            <span>{hint}</span>
          </p>
        )}
        {!pinned && (
          <div className="mx-auto mt-10 grid w-full max-w-page gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {callouts.map(callout)}
          </div>
        )}
      </div>
    </div>
  );
}
