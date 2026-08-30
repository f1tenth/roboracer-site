import { eventLabel, type NewsItem } from "./newsData";

// Site-wide link contract (landing-v2): ink text, underline, violet on hover.
const TITLE_LINK = "underline-offset-4 hover:decoration-rr-violet hover:decoration-2";
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
      {item.status === "verify" && (
        <span className="rounded-pill border border-ink-950/15 px-2 py-0.5 text-eyebrow tracking-normal">
          unverified
        </span>
      )}
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

/**
 * One item in the feed. With a site-hosted image it is a picture card; with
 * none it is a text card on the paper tint, which is the shape most LinkedIn
 * items take (their media is never re-hosted or hotlinked). Both carry the
 * same information: date, publisher, competition, headline, author,
 * affiliation, credit, and one link to the source.
 */
export default function NewsCard({ item, titleAs = "h3" }: NewsCardProps) {
  const Title = titleAs;
  const image = item.image;
  const tag = item.event ? eventLabel(item.event) : null;

  const heading = (
    <Title
      className={`font-display font-semibold leading-snug text-text-strong ${image ? "" : "text-lead"}`}
    >
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${TITLE_LINK} group-hover:underline`}
      >
        {item.title}
        <span aria-hidden="true"> ↗</span>
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
    <article className={`flex flex-col gap-2 ${image ? "h-full" : "self-start"}`}>
      {/* One card surface for both kinds: on the tinted archive section a text
          card reads as a card, not as a hole where a picture should be. */}
      <div className={`${FRAME} flex-1 bg-paper-50`}>
        {image && (
          <div className="aspect-[16/10] overflow-hidden border-b border-ink-950/10 bg-paper-100">
            {/* Same target as the headline, hidden from assistive tech so the
                card announces one link, not two. */}
            <a
              href={item.link}
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
      </div>
      {item.credit && (
        <p className="font-mono text-eyebrow leading-relaxed tracking-normal text-text-muted">
          {item.credit}
        </p>
      )}
    </article>
  );
}
