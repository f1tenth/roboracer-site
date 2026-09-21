import { useEffect, useRef, useState } from "react";
import type { NewsEmbed } from "./newsData";

/**
 * A LinkedIn post embedded in the page. The poster (our own copy of the post's
 * first slide) ships with the page and holds the space; LinkedIn's frame only
 * mounts once the reader is near it, so nothing loads from linkedin.com for a
 * visitor who never scrolls this far. If the frame is blocked the poster and
 * the link under it still carry the story.
 */
export default function LinkedInEmbed({ embed, href }: { embed: NewsEmbed; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const poster = embed.poster;

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
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={loaded ? -1 : undefined}
          aria-hidden={loaded || undefined}
          className="absolute inset-0 block"
        >
          <img
            src={`${import.meta.env.BASE_URL}${poster.src.replace(/^\//, "")}`}
            alt={poster.alt}
            width={poster.width}
            height={poster.height}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </a>
        {near && (
          <iframe
            src={embed.src}
            title={embed.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            referrerPolicy="strict-origin-when-cross-origin"
            className={`absolute inset-0 h-full w-full border-0 bg-paper-50 transition-opacity duration-[var(--duration-base)] motion-reduce:transition-none ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </div>
  );
}
