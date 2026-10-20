import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import type { JoinYouTube } from "../../lib/data";
import MediaFrame from "./MediaFrame";
import PauseToggle from "./PauseToggle";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { DESKTOP_QUERY } from "../../lib/motion";

/** Self-start only with a mouse on a desktop-sized window: on a phone or a
 * tablet the player (its script and a stream) is a data and battery cost
 * the reader did not ask for, and the poster with its play disc is already a
 * good facade (mobile pass, ABOUT-06). */
const AUTO_START_QUERY = `(pointer: fine) and ${DESKTOP_QUERY}`;

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

/** A 2.75rem hit area on touch screens that leaves the line box alone (the
 * padding is taken back by the negative margin). */
const TAP = "coarse:inline-block coarse:-my-3 coarse:py-3";

const LINK =
  "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/**
 * The card's box while the data naming the video loads: the same border, the
 * same 16:9 frame and the two footer lines, drawn empty, so what sits below
 * does not move when the facade arrives (QA polish-2: the About hero grew
 * 912 px under the reader).
 */
export function YouTubeFacadeSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-full flex-col overflow-hidden rounded-card border border-ink-950/10 bg-paper-50 ${className}`}
    >
      <div className="aspect-video border-b border-ink-950/10 bg-ink-950" />
      <div className="invisible flex flex-1 flex-col gap-3 p-6">
        <p className="font-mono text-small">&nbsp;</p>
        <p className="mt-auto pt-1 text-small">&nbsp;</p>
      </div>
    </div>
  );
}

/** Where the privacy-enhanced player lives: the iframe's origin, and the only
 * origin `YouTubeLoop` posts commands to or reads messages from. */
const YT_ORIGIN = "https://www.youtube-nocookie.com";

type EmbedOptions = {
  mute?: boolean;
  playlistId?: string;
  /** Play the one video over and over (YouTube needs it named as its own playlist). */
  loop?: boolean;
  /** false hides YouTube's control bar; the page then draws its own. */
  controls?: boolean;
  /** Accept IFrame API commands over postMessage (`YouTubeLoop`). */
  jsApi?: boolean;
};

/** The privacy-enhanced player URL. It is only ever built once the reader
 * asked for the video (a click) or, on the About page, once a reader without
 * reduced motion is looking at it; a self-started player is muted. */
function youTubeEmbedUrl(videoId: string, { mute = false, playlistId, loop = false, controls = true, jsApi = false }: EmbedOptions = {}) {
  // `origin` keeps the player's postMessage handshake quiet in the console.
  const origin = typeof window === "undefined" ? "" : `&origin=${encodeURIComponent(window.location.origin)}`;
  const list = playlistId ? `&list=${playlistId}` : "";
  const repeat = loop ? `&loop=1&playlist=${videoId}` : "";
  const bar = controls ? "" : "&controls=0";
  const api = jsApi ? "&enablejsapi=1" : "";
  return `${YT_ORIGIN}/embed/${videoId}?autoplay=1${mute ? "&mute=1" : ""}&playsinline=1&rel=0${list}${repeat}${bar}${api}${origin}`;
}

type YouTubePlayerProps = {
  videoId: string;
  playlistId?: string;
  /** The video's own title: the iframe's accessible name. */
  title: string;
  poster: { src: string; width: number; height: number };
  /** false: the poster and its play disc; "auto" plays muted; "click" with sound. */
  playing: false | "auto" | "click";
  onPlay: () => void;
  /** CSS aspect ratio of the poster box (the parent sizes the frame). */
  aspect?: string;
  /** The news card also has a text button that starts the video; the poster is
   * then a second mouse target only, out of the tab order and hidden from
   * assistive tech so the card announces one control, not two. */
  posterIsDuplicate?: boolean;
  /** The poster becomes a link to this page (new tab) instead of a play
   * button: `YouTubeLoop`'s fallback once the embed has failed. */
  posterHref?: string;
  /** Embed options for `YouTubeLoop`: loop, YouTube's own controls, the API. */
  embed?: Omit<EmbedOptions, "mute" | "playlistId">;
  iframeRef?: Ref<HTMLIFrameElement>;
  onFrameLoad?: () => void;
};

/**
 * The frame alone: a poster with a play disc until `playing`, then the
 * player. It fills its positioned parent. Used by the facade below and by the
 * news cards, which own the state because a text button beside the frame
 * starts it too.
 */
export function YouTubePlayer({
  videoId,
  playlistId,
  title,
  poster,
  playing,
  onPlay,
  aspect = "16 / 9",
  posterIsDuplicate = false,
  posterHref,
  embed,
  iframeRef,
  onFrameLoad,
}: YouTubePlayerProps) {
  // YouTube's 4:3 thumbnails (sddefault, hqdefault) letterbox a 16:9 video in
  // black bars; zoomed just enough, a 16:10 or 16:9 box shows the picture only.
  const letterboxed = poster.src.includes("i.ytimg.com") && poster.width / poster.height < 1.5;
  if (playing) {
    return (
      // `allow` (not the legacy allowfullscreen attribute) grants fullscreen;
      // "autoplay" also lets a click on the page itself unmute the player.
      <iframe
        ref={iframeRef}
        onLoad={onFrameLoad}
        className="absolute inset-0 h-full w-full"
        src={youTubeEmbedUrl(videoId, { mute: playing === "auto", playlistId, ...embed })}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  const face = (
    <>
      <MediaFrame
        src={poster.src}
        alt=""
        width={poster.width}
        height={poster.height}
        aspect={aspect}
        radius="none"
        className={letterboxed ? "h-full scale-[1.12]" : "h-full"}
      />
      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-950/10 bg-paper-50/90 text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover/play:bg-paper-50 group-focus-visible/play:bg-paper-50">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M5.5 3.2v11.6L15 9 5.5 3.2Z" />
          </svg>
        </span>
      </span>
    </>
  );
  if (posterHref) {
    return (
      <a
        href={posterHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch "${title}" on YouTube (opens in a new tab)`}
        className="group/play absolute inset-0 block h-full w-full"
      >
        {face}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={posterIsDuplicate ? undefined : `Play "${title}" on YouTube`}
      aria-hidden={posterIsDuplicate || undefined}
      tabIndex={posterIsDuplicate ? -1 : undefined}
      className="group/play absolute inset-0 block h-full w-full cursor-pointer text-left"
    >
      {face}
    </button>
  );
}

/** Data Saver on: no player the reader did not ask for. */
const saveData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** How long a mounted player gets to answer the page before the poster comes
 * back as a link to YouTube (blocked embeds, extensions, a dead network). */
const HANDSHAKE_MS = 12000;

type YouTubeLoopProps = {
  videoId: string;
  /** The iframe's accessible name. */
  title: string;
  /** The video's page: the poster links there if the embed fails. */
  url: string;
  poster: { src: string; width: number; height: number };
  /** Beside the controls, under the frame: what the reader is watching. */
  caption?: ReactNode;
  className?: string;
};

/**
 * A short video that plays in place, muted and looped, like the hero clips,
 * but streamed by YouTube: the poster ships, and the player mounts once the
 * frame is in view (never at first paint). The page draws its own controls
 * under the frame, Pause and Sound, and drives the player over the IFrame
 * API's postMessage channel (no API script, no dependency); YouTube's own
 * control bar is off. The player is paused while scrolled out of view.
 *
 * Under reduced motion, with Data Saver on, or before the frame is in view,
 * the poster shows with the same play disc as the facade and nothing starts
 * until a click (which plays with sound). If the player never answers or
 * reports an error, the poster comes back as a link to the video on YouTube.
 */
export function YouTubeLoop({ videoId, title, url, poster, caption, className = "" }: YouTubeLoopProps) {
  const reduced = usePrefersReducedMotion();
  const frameId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState<false | "auto" | "click">(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  // Mount the player once a third of the frame is on screen.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || reduced || playing || failed || saveData()) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35)) {
          setPlaying("auto");
          io.disconnect();
        }
      },
      { threshold: [0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, playing, failed]);

  // Posting to the frame before YouTube's page is in it logs an origin error,
  // so every message waits for the iframe's load event.
  const post = useCallback(
    (message: Record<string, unknown>) => {
      const win = iframeRef.current?.contentWindow;
      if (!win || !loaded.current) return;
      win.postMessage(JSON.stringify({ ...message, id: frameId, channel: "widget" }), YT_ORIGIN);
    },
    [frameId],
  );
  const command = useCallback((func: string, args: unknown[] = []) => post({ event: "command", func, args }), [post]);

  // The player answers "listening" with its state, then reports every change
  // (infoDelivery: muted, playerState; onStateChange; onError).
  useEffect(() => {
    if (!playing || failed) return;
    let heard = false;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string; info?: unknown } | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : null;
      } catch {
        return;
      }
      if (!data || typeof data.event !== "string") return;
      if (!heard) {
        heard = true;
        setReady(true);
      }
      if (data.event === "onError") {
        setFailed(true);
        return;
      }
      let state: number | undefined;
      if (data.event === "onStateChange" && typeof data.info === "number") state = data.info;
      if ((data.event === "infoDelivery" || data.event === "initialDelivery") && data.info && typeof data.info === "object") {
        const info = data.info as { muted?: unknown; playerState?: unknown };
        if (typeof info.muted === "boolean") setMuted(info.muted);
        if (typeof info.playerState === "number") state = info.playerState;
      }
      // 1 playing, 2 paused. A pause while on screen came from the reader
      // (a click on the picture), so scrolling back does not undo it.
      if (state === 1) {
        setPaused(false);
        userPaused.current = false;
      } else if (state === 2) {
        setPaused(true);
        if (visible.current) userPaused.current = true;
      }
    };
    window.addEventListener("message", onMessage);
    const ask = window.setInterval(() => {
      if (heard) window.clearInterval(ask);
      else post({ event: "listening" });
    }, 250);
    const giveUp = window.setTimeout(() => {
      if (!heard) setFailed(true);
    }, HANDSHAKE_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(ask);
      window.clearTimeout(giveUp);
    };
  }, [playing, failed, post]);

  // Hold the loop still while it is off screen; resume when it is back,
  // unless the reader paused it.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !ready || failed) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      visible.current = e.isIntersecting;
      if (userPaused.current) return;
      command(e.isIntersecting ? "playVideo" : "pauseVideo");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ready, failed, command]);

  const toggleSound = () => {
    if (muted) {
      command("unMute");
      // A browser may hold a player that gains sound; ask it to keep going.
      if (!userPaused.current) command("playVideo");
    } else {
      command("mute");
    }
    setMuted(!muted);
  };
  const togglePause = () => {
    userPaused.current = !paused;
    command(paused ? "playVideo" : "pauseVideo");
    setPaused(!paused);
  };

  const live = Boolean(playing) && ready && !failed;
  return (
    <div className={`flex flex-col ${className}`}>
      <div ref={frameRef} id={frameId} className="relative aspect-video bg-ink-950">
        <YouTubePlayer
          videoId={videoId}
          title={title}
          poster={poster}
          playing={failed ? false : playing}
          onPlay={() => {
            setMuted(false);
            setPlaying("click");
          }}
          posterHref={failed ? url : undefined}
          embed={{ loop: true, controls: false, jsApi: true }}
          iframeRef={iframeRef}
          onFrameLoad={() => {
            loaded.current = true;
          }}
        />
      </div>
      {/* The controls keep their place while the poster shows (invisible,
          not absent), so nothing moves when the player arrives. */}
      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-paper-100 px-5 py-3 sm:px-6">
        <div className="min-w-0 flex-1 basis-56">{caption}</div>
        <div className={`flex shrink-0 gap-2 ${live ? "" : "invisible"}`}>
          <PauseToggle always paused={paused} onToggle={togglePause} controls={frameId} />
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-controls={frameId}
            className={`inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-card border px-3 font-mono text-small transition-colors duration-[var(--duration-fast)] ${
              muted
                ? "border-ink-950/15 text-text-strong hover:border-ink-950/30"
                : "border-ink-950 bg-ink-950 text-text-on-ink"
            }`}
          >
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5.25h2.25L7.5 2.5v9L4.25 8.75H2v-3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="m9.5 5.25 3 3.5m0-3.5-3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5.25h2.25L7.5 2.5v9L4.25 8.75H2v-3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9.75 4.75a3 3 0 0 1 0 4.5M11.25 3a5.25 5.25 0 0 1 0 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            Sound
            <span aria-hidden="true" className="opacity-70">
              {muted ? "off" : "on"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A YouTube video behind a click-to-load facade: the poster and a play button
 * ship, the iframe only mounts once the reader is looking at it, so no page
 * pays for YouTube's script until then. Under reduced motion, on a touch
 * screen and below desktop it never self-starts and waits for a real click. A self-started player is muted; one
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
  useEffect(() => {
    const el = ref.current;
    if (!el || !autoStart || reduced || playing) return;
    if (!window.matchMedia(AUTO_START_QUERY).matches) return;
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
        <YouTubePlayer
          videoId={yt.video_id}
          playlistId={yt.playlist_id}
          title={yt.title}
          poster={{ src: yt.poster, width: yt.width, height: yt.height }}
          playing={playing}
          onPlay={() => setPlaying("click")}
        />
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
          <a
            href={yt.channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${TAP} ${LINK}`}
          >
            {yt.channel} on YouTube ↗
          </a>
        </p>
      </div>
    </article>
  );
}
