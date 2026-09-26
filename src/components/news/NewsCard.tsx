import { useId, useState } from "react";
import { eventLabel, youTubePoster, type NewsItem, type NewsLinkedInEmbed } from "./newsData";
import LinkedInEmbed from "./LinkedInEmbed";
import { YouTubePlayer } from "../ui/YouTubeFacade";

// Site-wide link contract (landing-v2): ink text, underline, violet on hover.
const TITLE_LINK = "underline-offset-4 hover:decoration-rr-violet hover:decoration-2";
/** A 2.75rem hit area on touch screens for the headline link: padding on an
 * inline box grows the target without moving a line (mobile pass). */
const TITLE_TAP = "relative coarse:py-3";
const TOGGLE =
  "inline-flex items-center gap-2 font-mono text-small text-text-strong underline decoration-ink-950/25 underline-offset-4 transition-colors hover:decoration-rr-violet hover:decoration-2 coarse:min-h-11";
const FRAME =
  "group flex h-full flex-col overflow-hidden rounded-card border border-ink-950/10 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";

type NewsCardProps = {
  item: NewsItem;
  /** h3 under a section header, h4 under a year heading. */
  titleAs?: "h3" | "h4";
};

function Meta({ item }: { item: NewsItem }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-small text-text-muted">
      <time dateTime={item.date}>{item.date_display}</time>
      <span aria-hidden="true">·</span>
      <span>{item.publisher}</span>
    </p>
  );
}

function Byline({ item }: { item: NewsItem }) {
  if (!item.author && !item.affiliation) return null;
  return (
    <p className="mt-auto pt-3 font-mono text-eyebrow leading-relaxed tracking-normal text-text-muted">
      {item.author &&
        (item.author_url ? (
          <a
            href={item.author_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-text-body ${TITLE_LINK} underline decoration-ink-950/25`}
          >
            {item.author}
          </a>
        ) : (
          <span className="text-text-body">{item.author}</span>
        ))}
      {item.author && item.affiliation && <span aria-hidden="true"> · </span>}
      {item.affiliation}
    </p>
  );
}

/** The headline with its arrow glued to the last word in one no-wrap span, so
 * the arrow never starts a line alone. */
function ArrowTitle({ title }: { title: string }) {
  const cut = title.lastIndexOf(" ");
  return (
    <>
      {cut > 0 && title.slice(0, cut + 1)}
      <span className="whitespace-nowrap">
        {title.slice(cut + 1)}
        <span aria-hidden="true">&nbsp;↗</span>
      </span>
    </>
  );
}

/**
 * A card's LinkedIn post, loaded only when the reader asks for it: the button
 * mounts LinkedIn's frame inside the card, so the archive never loads dozens
 * of frames (or anything from linkedin.com) on its own. The headline link
 * still opens the post on LinkedIn for anyone who would rather go there.
 */
function PostToggle({ post, href }: { post: NewsLinkedInEmbed; href: string }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <>
      <p className="px-6 pb-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          onClick={() => setOpen((o) => !o)}
          className={TOGGLE}
        >
          {open ? "Hide the LinkedIn post" : "Show the LinkedIn post"}
          <span
            aria-hidden="true"
            className={`inline-block transition-transform duration-[var(--duration-fast)] motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
          >
            &#8250;
          </span>
        </button>
      </p>
      <div id={panel} hidden={!open} className="border-t border-ink-950/10 bg-paper-100 p-3 sm:p-6">
        {open && <LinkedInEmbed embed={post} href={href} load="now" />}
      </div>
    </>
  );
}

/**
 * One item in the feed.
 *
 * A card with a YouTube video shows its poster (the item's picture, else the
 * video's thumbnail) with a play disc where the picture goes; "Play the video"
 * under the text, or a click on the poster, swaps in the player there. The
 * poster is the mouse target, the text button the one control assistive tech
 * and the keyboard meet. Nothing loads from YouTube but the thumbnail until
 * then, and nothing ever starts by itself. With a site-hosted image it is a picture card; with
 * none it is a text card on the paper tint, which is the shape most LinkedIn
 * items take (their media is never re-hosted or hotlinked). Both carry the
 * same information: date, publisher, competition, headline, author,
 * affiliation, credit, and one link to the source.
 */
export default function NewsCard({ item, titleAs = "h3" }: NewsCardProps) {
  const Title = titleAs;
  const image = item.image;
  const post = item.embed?.provider === "linkedin" ? item.embed : null;
  const video = item.embed?.provider === "youtube" ? item.embed : (item.video ?? null);
  const [playing, setPlaying] = useState(false);
  const frame = useId();
  const pictured = Boolean(image || video);
  const tag = item.event ? eventLabel(item.event) : null;
  // A source that no longer answers is linked through its Wayback capture.
  const href = item.archive ?? item.link;

  const heading = (
    <Title
      className={`font-display font-semibold leading-snug text-text-strong ${pictured ? "" : "text-lead"}`}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${TITLE_LINK} ${TITLE_TAP} group-hover:underline`}
      >
        <ArrowTitle title={item.title} />
        {item.archive && <span className="sr-only"> (archived copy)</span>}
      </a>
    </Title>
  );

  const body = (
    <div className="flex flex-1 flex-col gap-3 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Meta item={item} />
        {tag && (
          <span className="rounded-pill border border-ink-950/15 px-2.5 py-1 font-mono text-eyebrow tracking-normal text-text-muted">
            {tag}
          </span>
        )}
      </div>
      {heading}
      {item.excerpt && <p className="text-small text-text-body">{item.excerpt}</p>}
      <Byline item={item} />
    </div>
  );

  return (
    // A picture card fills its grid row so pictures line up; a text card keeps
    // its own height instead of stretching into an empty panel.
    <article className={`flex flex-col gap-2 ${pictured ? "h-full" : "self-start"}`}>
      {/* One card surface for both kinds: on the tinted archive section a text
          card reads as a card, not as a hole where a picture should be. */}
      <div className={`${FRAME} flex-1 bg-paper-50`}>
        {video ? (
          <div
            id={frame}
            className="relative aspect-[16/10] overflow-hidden border-b border-ink-950/10 bg-ink-950"
          >
            <YouTubePlayer
              videoId={video.id}
              title={video.title}
              poster={youTubePoster(video, image)}
              playing={playing ? "click" : false}
              onPlay={() => setPlaying(true)}
              aspect="16 / 10"
              posterIsDuplicate
            />
          </div>
        ) : image && (
          <div className="aspect-[16/10] overflow-hidden border-b border-ink-950/10 bg-paper-100">
            {/* Same target as the headline, hidden from assistive tech so the
                card announces one link, not two. */}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="block h-full"
            >
              <img
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </a>
          </div>
        )}
        {body}
        {video && (
          <p className="px-6 pb-5">
            <button
              type="button"
              aria-controls={frame}
              onClick={() => setPlaying((p) => !p)}
              className={TOGGLE}
            >
              {playing ? "Close the video" : "Play the video"}
              <span aria-hidden="true">{playing ? "\u00d7" : "\u203a"}</span>
            </button>
          </p>
        )}
        {post && <PostToggle post={post} href={item.link} />}
      </div>
      {item.credit && (
        <p className="font-mono text-eyebrow leading-relaxed tracking-normal text-text-muted">
          {item.credit}
        </p>
      )}
    </article>
  );
}
