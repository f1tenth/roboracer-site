import { useEffect, useRef, useState } from "react";
import type { JoinYouTube } from "../../lib/data";
import MediaFrame from "./MediaFrame";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type YouTubeFacadeProps = {
  yt: JoinYouTube;
  /** Full-bleed band (the Join block and the About hero) rather than a card. */
  full?: boolean;
  /** Start by itself once the reader is looking at it. Off for the About
   * video library, where six players would otherwise start as they scroll by. */
  autoStart?: boolean;
  /** The card's headline (card mode only). */
  heading?: string;
  className?: string;
};

const CARD =
  "rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";

const LINK =
  "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/**
 * A YouTube video behind a click-to-load facade: the poster and a play button
 * ship, the iframe only mounts once the reader is looking at it, so no page
 * pays for YouTube's script until then. Under reduced motion it never
 * self-starts and waits for a real click. A self-started player is muted; one
 * the reader clicked plays with sound.
 *
 * Lives here rather than inside CommunityJoin because the About hero shows the
 * same reel and a second copy of this would be a second thing to keep right.
 */
export default function YouTubeFacade({
  yt,
  full = false,
  autoStart = true,
  heading,
  className = "",
}: YouTubeFacadeProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState<false | "auto" | "click">(false);
  // `origin` keeps the player's postMessage handshake quiet in the console;
  // `allow` (not the legacy allowfullscreen attribute) grants fullscreen.
  const origin = typeof window === "undefined" ? "" : `&origin=${encodeURIComponent(window.location.origin)}`;
  const list = yt.playlist_id ? `&list=${yt.playlist_id}` : "";
  const mute = playing === "auto" ? "&mute=1" : "";
  const embed = `https://www.youtube-nocookie.com/embed/${yt.video_id}?autoplay=1${mute}&playsinline=1&rel=0${list}${origin}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !autoStart || reduced || playing) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.6)) {
          setPlaying("auto");
          io.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoStart, reduced, playing]);

  return (
    <article
      ref={ref}
      className={`${
        full
          ? "relative left-1/2 w-screen -translate-x-1/2 border-y border-ink-950/10"
          : `flex h-full flex-col overflow-hidden ${CARD}`
      } ${className}`}
    >
      <div className="relative aspect-video border-b border-ink-950/10 bg-ink-950">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embed}
            title={yt.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying("click")}
            aria-label={`Play "${yt.title}" on YouTube`}
            className="group/play absolute inset-0 block h-full w-full cursor-pointer text-left"
          >
            <MediaFrame
              src={yt.poster}
              alt=""
              width={yt.width}
              height={yt.height}
              aspect="16 / 9"
              radius="none"
              className="h-full"
            />
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-950/10 bg-paper-50/90 text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover/play:bg-paper-50 group-focus-visible/play:bg-paper-50">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M5.5 3.2v11.6L15 9 5.5 3.2Z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div
        className={
          full
            ? "mx-auto flex max-w-page flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-6 py-4"
            : "flex flex-1 flex-col gap-3 p-6"
        }
      >
        {heading && !full && (
          <h3 className="font-display text-lead font-semibold text-text-strong">{heading}</h3>
        )}
        <p className="font-mono text-small text-text-muted">{yt.caption}</p>
        <p className={full ? "text-small" : "mt-auto pt-1 text-small"}>
          <a href={yt.channel_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            {yt.channel} on YouTube ↗
          </a>
        </p>
      </div>
    </article>
  );
}
