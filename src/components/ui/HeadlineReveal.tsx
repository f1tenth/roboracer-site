import { Fragment, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE_IN_OUT_QUART, MOTION_OK_QUERY, gsap, useGSAP } from "../../lib/motion";

type HeadlineRevealProps = {
  as?: "h1" | "h2";
  /** Authored line breaks: each entry renders as one block line. */
  lines: string[];
  className?: string;
};

// Timeline units (arbitrary; scrub maps them onto the pin distance). Words
// finish assembling at (WORD_DURATION + WORD_SPREAD) / PIN_TOTAL = 67% of the
// pin and hold, fully assembled, to the end.
const PIN_TOTAL = 100;
const WORD_DURATION = 22;
const WORD_SPREAD = 45;

/**
 * The page's one loud moment: a display headline pinned (CSS sticky over a
 * ~180vh wrapper) while scroll assembles it word by word - y 80 -> 0,
 * opacity 0 -> 1, scrub 0.8 - plus a subtle whole-block scale 0.985 -> 1.
 * Reduced motion renders the static full-size headline with no pin. Screen
 * readers get the full sentence via aria-label; the word spans are hidden.
 */
export default function HeadlineReveal({ as = "h1", lines, className = "" }: HeadlineRevealProps) {
  const reduced = usePrefersReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const Tag = as;
  const sentence = lines.join(" ");

  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const words = gsap.utils.toArray<HTMLElement>(".rr-headline-word");
        if (!words.length) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
        tl.from(
          words,
          {
            y: 80,
            opacity: 0,
            duration: WORD_DURATION,
            ease: EASE_IN_OUT_QUART,
            stagger: WORD_SPREAD / Math.max(words.length - 1, 1),
          },
          0,
        ).fromTo(
          ".rr-headline-block",
          { scale: 0.985 },
          { scale: 1, duration: PIN_TOTAL, ease: "none" },
          0,
        );
      });
    },
    { scope, dependencies: [reduced, sentence], revertOnUpdate: true },
  );

  return (
    <div
      ref={scope}
      className={`relative bg-paper-50 ${reduced ? "" : "h-[180vh]"} ${className}`}
    >
      <div
        className={
          reduced ? "py-section" : "sticky top-0 flex h-svh items-center overflow-hidden"
        }
      >
        <div className="mx-auto w-full max-w-wide px-6">
          <Tag
            aria-label={sentence}
            className="font-display text-[clamp(2.6rem,9vw,9.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-text-strong"
          >
            <span aria-hidden="true" className="rr-headline-block block">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line.split(" ").map((word, wi) => (
                    <Fragment key={`${word}-${wi}`}>
                      {wi > 0 && " "}
                      <span className="rr-headline-word inline-block">{word}</span>
                    </Fragment>
                  ))}
                </span>
              ))}
            </span>
          </Tag>
        </div>
      </div>
    </div>
  );
}
