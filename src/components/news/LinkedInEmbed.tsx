import { useEffect, useRef, useState } from "react";
import type { NewsEmbed } from "./newsData";

/**
 * A LinkedIn post embedded in the page. The poster (our own copy of the post's
 * first slide) ships with the page and holds the space; LinkedIn's frame only
 * mounts once the reader is near it, so nothing loads from linkedin.com for a
 * visitor who never scrolls this far. If the frame is blocked the poster and
 * the link under it still carry the story.
 *
 * `load` is not proof that the post arrived: a frame that a content blocker,
 * tracking protection or the network kills still fires it, on the browser's
 * error page (mobile pass, 2026-09-25: that left a blank 342x692 box with the
 * poster link hidden from everyone). So the frame stays invisible and inert
 * over the poster until LinkedIn's own document is seen in it. A cross-origin
 * frame still reports how many frames it holds; LinkedIn's embed page adds
 * its own on load (measured: within two seconds of mounting, even with its
 * anti-bot and captcha hosts blocked), an error page adds none. Until then,
 * or for good if the check never passes, the poster is the post: the whole
 * slide, focusable, and a tap opens the post on LinkedIn.
 *
 * Only our own organisation's posts carry a poster. A post by anyone else
 * holds the space with its title and a link to LinkedIn instead, set on the
 * same paper, so a blocked frame still leaves a way to the post.
 *
 * `load`: "near" (the lead story) mounts the frame as the reader approaches;
 * "now" mounts it at once, for a card that renders this only after the reader
 * asked for the post (click to load: nothing from linkedin.com before that).
 */
export default function LinkedInEmbed({
  embed,
  href,
  load = "near",
}: {
  embed: NewsEmbed;
  href: string;
  load?: "near" | "now";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(load === "now");
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);
  const poster = embed.poster;

  useEffect(() => {
    if (!loaded || live) return;
    const check = () => {
      if ((frameRef.current?.contentWindow?.length ?? 0) > 0) setLive(true);
    };
    check();
    const poll = window.setInterval(check, 250);
    const stop = window.setTimeout(() => window.clearInterval(poll), 10000);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, [loaded, live]);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    // LinkedIn's frame cannot report its height across origins, and it grows
    // taller as it narrows (the caption wraps, the image block does not
    // shrink). Measured for an image post with a one-line caption: 608px at
    // 544 wide, 629 at 420 to 496, 653 at 380, 688 at 340. The steps follow
    // the frame's own width, not the viewport's; a longer post scrolls inside.
    <div ref={ref} className="@container mx-auto w-full max-w-[34rem]">
      <div className="relative h-[43.25rem] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 @min-[23.75rem]:h-[41rem] @min-[26rem]:h-[39.5rem] @min-[34rem]:h-[38.25rem]">
        {/* The whole slide at the top of the box: contain, not cover (the
            4:5 slide cropped to the box's 1:2 lost a fifth of each side,
            headline included). Out of the tab order only once the post itself
            covers it. */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={live ? -1 : undefined}
          aria-hidden={live || undefined}
          className={`absolute inset-0 focus-visible:-outline-offset-4 ${
            poster ? "block" : "flex flex-col items-center justify-start gap-3 px-8 pt-16 text-center"
          }`}
        >
          {poster ? (
            <img
              src={`${import.meta.env.BASE_URL}${poster.src.replace(/^\//, "")}`}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              decoding="async"
              className="h-full w-full object-contain object-top"
            />
          ) : (
            <>
              <span className="font-mono text-small text-text-muted">LinkedIn</span>
              <span className="max-w-[26ch] font-display text-lead font-semibold leading-snug text-text-strong">
                {embed.title}
              </span>
              <span className="text-small font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4">
                Open the post on LinkedIn ↗
              </span>
            </>
          )}
        </a>
        {near && (
          <iframe
            ref={frameRef}
            src={embed.src}
            title={embed.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            inert={!live}
            referrerPolicy="strict-origin-when-cross-origin"
            className={`absolute inset-0 h-full w-full border-0 bg-transparent transition-opacity duration-[var(--duration-base)] motion-reduce:transition-none ${
              live ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </div>
  );
}
