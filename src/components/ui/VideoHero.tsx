import type { ReactNode } from "react";
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
  headline: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  video: HeroVideoSources;
  /** Credit line, e.g. "Footage: RoboRacer at IV 2026". */
  credit?: string;
};

/**
 * Full-bleed ink hero: poster-first muted loop, one display-xl h1, scrim for
 * AA contrast, scroll cue. Reduced motion renders the poster image instead
 * of the video (media skill markup convention).
 */
export default function VideoHero({ headline, lead, actions, video, credit }: VideoHeroProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-ink-950 text-text-on-ink">
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
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/15"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-content px-6 pb-24 pt-40">
        <h1 className="max-w-4xl font-display text-display-xl font-semibold text-text-on-ink">
          {headline}
        </h1>
        {lead && <p className="mt-6 max-w-[60ch] text-lead text-text-on-ink-muted">{lead}</p>}
        {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
        {credit && <p className="mt-8 font-mono text-eyebrow tracking-normal text-text-on-ink-muted">{credit}</p>}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="rr-scroll-cue h-10 w-6 rounded-pill border border-text-on-ink-muted/60">
          <div className="mx-auto mt-2 h-2 w-0.5 rounded-pill bg-text-on-ink" />
        </div>
      </div>
    </section>
  );
}
