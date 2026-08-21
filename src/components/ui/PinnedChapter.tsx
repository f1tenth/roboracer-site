import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK_QUERY, EASE_IN_OUT_QUART } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export type ChapterState = {
  caption: string;
  body?: string;
  node: ReactNode;
};

type PinnedChapterProps = {
  eyebrow?: string;
  title: string;
  states: ChapterState[];
  /** Total scroll length while pinned, in vh (design system: 150-250). */
  heightVh?: number;
  id?: string;
};

/**
 * Pin pattern via position:sticky (no layout hijack): the wrapper provides
 * the scroll distance, the sticky viewport crossfades the states, scrubbed
 * by ScrollTrigger. Reduced motion / no JS: states render stacked vertically
 * with captions, fully readable.
 */
export default function PinnedChapter({
  eyebrow,
  title,
  states,
  heightVh = 220,
  id,
}: PinnedChapterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap || states.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-chapter-state]", wrap);
        const captions = gsap.utils.toArray<HTMLElement>("[data-chapter-caption]", wrap);
        const tl = gsap.timeline({
          defaults: { ease: EASE_IN_OUT_QUART },
          scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.8 },
        });
        panels.forEach((panel, i) => {
          if (i === 0) return;
          tl.to(panels[i - 1], { opacity: 0, y: -16, duration: 1 }, i);
          tl.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, i);
        });
        captions.forEach((cap, i) => {
          tl.to(cap, { opacity: i === 0 ? 0.62 : 1, duration: 0.5 }, i === 0 ? 1 : i);
        });
      });
    },
    { scope: wrapRef, dependencies: [states.length] },
  );

  if (reduced) {
    return (
      <div id={id}>
        <ChapterHeader eyebrow={eyebrow} title={title} />
        <ol className="mt-12 flex flex-col gap-16">
          {states.map((s) => (
            <li key={s.caption}>
              <Caption caption={s.caption} body={s.body} />
              <div className="mt-6">{s.node}</div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div id={id} ref={wrapRef} style={{ minHeight: `${heightVh}vh` }}>
      <div className="sticky top-0 flex min-h-svh flex-col justify-center py-12">
        <ChapterHeader eyebrow={eyebrow} title={title} />
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[1fr_18rem]">
          <div className="relative min-h-[50svh]">
            {states.map((s, i) => (
              <div
                key={s.caption}
                data-chapter-state
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {s.node}
              </div>
            ))}
          </div>
          <ol className="flex flex-col gap-6">
            {states.map((s, i) => (
              <li key={s.caption} data-chapter-caption style={{ opacity: i === 0 ? 1 : 0.62 }}>
                <Caption caption={s.caption} body={s.body} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ChapterHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header>
      {eyebrow && <p className="eyebrow mb-3 text-rr-magenta">{eyebrow}</p>}
      <h2 className="font-display text-display-l font-semibold text-text-on-ink">{title}</h2>
    </header>
  );
}

function Caption({ caption, body }: { caption: string; body?: string }) {
  return (
    <div>
      <p className="font-display font-semibold text-text-on-ink">
        {caption}
      </p>
      {body && <p className="mt-1 text-small text-text-on-ink">{body}</p>}
    </div>
  );
}
