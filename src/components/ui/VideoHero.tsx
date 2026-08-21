import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export type HeroVideoSources = {
  mp4_1920: string;
  mp4_960: string;
  webm_1920?: string;
  poster: string;
  width: number;
  height: number;
};

type VideoHeroProps = {
  video: HeroVideoSources;
  className?: string;
};

/**
 * Full-bleed video hero: footage and nothing else (neobotics pattern,
 * 2026-08-21). No headline, no CTAs, no scrim block - the page h1 lives in
 * the section below. Ships a WCAG 2.2.2 pause control (revealed on hover or
 * focus, always tabbable) and a one-shot idle scroll cue that appears after
 * 10 s without scrolling. Reduced motion renders the poster image only.
 */
export default function VideoHero({ video, className = "" }: VideoHeroProps) {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  // Idle cue: "idle" until the 10 s timer fires; any scroll before that
  // cancels it forever; the first scroll after it shows fades it out
  // permanently (state, not just opacity).
  const [cue, setCue] = useState<"idle" | "visible" | "hidden">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCue((s) => (s === "idle" ? "visible" : s));
    }, 10_000);
    const onScroll = () => {
      window.clearTimeout(timer);
      setCue("hidden");
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  return (
    <section
      aria-label="Race footage"
      className={`group relative min-h-svh overflow-hidden bg-ink-950 text-text-on-ink ${className}`}
    >
      {reduced ? (
        <img
          src={video.poster}
          alt=""
          width={video.width}
          height={video.height}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-hidden="true"
        >
          {video.webm_1920 && (
            <source src={video.webm_1920} type="video/webm" media="(min-width: 768px)" />
          )}
          <source src={video.mp4_1920} type="video/mp4" media="(min-width: 768px)" />
          <source src={video.mp4_960} type="video/mp4" />
        </video>
      )}

      {/* The section is min-h-svh but starts one nav-offset below the top of
          the viewport (pages add pt-[68px] md:pt-[85px]), so anything anchored
          to the section bottom sits below the fold at rest. The cue, the
          pause control, and the darkening band are raised by that offset so
          they are visible before the first scroll. */}
      {/* Faint bottom darkening only - enough contrast for the cue and the
          pause control, never a headline scrim. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[68px] h-[15%] bg-gradient-to-t from-ink-950/50 to-transparent md:bottom-[85px]"
      />

      {!reduced && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-pressed={paused}
          aria-label={paused ? "Play footage" : "Pause footage"}
          className={`absolute bottom-[calc(68px+1.5rem)] right-6 z-10 flex h-10 w-10 items-center justify-center rounded-btn border border-text-on-ink/30 bg-ink-950/40 text-text-on-ink transition-opacity duration-[var(--duration-fast)] focus-visible:opacity-100 focus-visible:outline-text-on-ink md:bottom-[calc(85px+1.5rem)] ${
            paused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M4.5 2.5v9l7-4.5-7-4.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M4.75 2.5v9M9.25 2.5v9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}

      {/* Idle cue is motion choreography; under reduced motion the hero is a
          static poster and gets no cue at all (director, 2026-08-21). */}
      {!reduced && (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-[calc(68px+1.75rem)] z-10 flex flex-col items-center gap-2 transition-opacity duration-[var(--duration-base)] md:bottom-[calc(85px+1.75rem)] ${
          cue === "visible" ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-mono text-eyebrow tracking-[0.18em] text-text-on-ink/90">scroll</span>
        <svg
          className={cue === "visible" ? "rr-scroll-cue" : undefined}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 2.5v10.5m0 0 4.25-4.25M8 13 3.75 8.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      )}
    </section>
  );
}
