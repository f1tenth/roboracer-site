import { eventLabel, type NewsItem } from "./newsData";
import LinkedInEmbed from "./LinkedInEmbed";

const TITLE_LINK = "underline-offset-4 hover:decoration-rr-violet hover:decoration-2";
// Standalone action links are 2.75rem hit areas on touch screens (the text
// stays centred in them; the rows around them take the growth back).
const TAP = "coarse:inline-flex coarse:min-h-11 coarse:items-center";

const ACTION: Record<string, string> = {
  post: "Read the post",
  article: "Read the article",
  video: "Watch the video",
  podcast: "Listen to the episode",
  announcement: "Read the announcement",
};

/**
 * The lead story, given the room a lead gets in print: a 7/5 split with the
 * picture on the left. An announcement with no picture keeps the same weight
 * as a ruled panel, headline left and the detail beside it, so the top of the
 * page never depends on whether a source gave us an image. An item that
 * carries an `embed` shows the post itself in the narrow column instead, with
 * the headline, the numbers and the links in the wide one.
 */
export default function NewsLead({ item }: { item: NewsItem }) {
  const image = item.image;
  const tag = item.event ? eventLabel(item.event) : null;
  const who = [item.author, item.affiliation].filter(Boolean).join(" · ");

  const meta = (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-small text-text-muted">
      <time dateTime={item.date}>{item.date_display}</time>
      <span aria-hidden="true">·</span>
      <span>{item.publisher}</span>
      {tag && (
        <span className="rounded-pill border border-ink-950/15 px-2.5 py-1 text-eyebrow tracking-normal">
          {tag}
        </span>
      )}
    </p>
  );

  const heading = (
    <h2
      className={`font-display font-semibold leading-tight text-text-strong ${
        image ? "mt-4 text-display-m" : "mt-5 text-display-m"
      }`}
    >
      <a href={item.link} target="_blank" rel="noopener noreferrer" className={TITLE_LINK}>
        {item.title}
      </a>
    </h2>
  );

  const action = (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-small font-semibold text-text-strong underline underline-offset-4 decoration-rr-magenta hover:decoration-2 ${TAP}`}
    >
      {ACTION[item.kind] ?? "Read the source"} on {item.publisher} ↗
    </a>
  );

  if (item.embed) {
    return (
      // Splits at lg, not md: LinkedIn's frame is unreadable below about 340px
      // and five columns of a tablet are 270.
      <article className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="lg:col-span-7">
          {meta}
          {heading}
          {item.excerpt && <p className="mt-5 max-w-[56ch] text-lead text-text-body">{item.excerpt}</p>}
          {item.stats && item.stats.length > 0 && (
            <dl className="mt-8 grid max-w-[36rem] grid-cols-3 gap-x-6 border-t border-ink-950/10 pt-6">
              {item.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 font-mono text-small text-text-muted">{s.label}</dt>
                  <dd className="font-display text-display-m font-semibold tabular-nums text-text-strong">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {who && <p className="mt-8 font-mono text-small text-text-muted">{who}</p>}
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 coarse:mt-1 coarse:gap-y-0">
            {action}
            {item.more && (
              <a
                href={item.more.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-small font-semibold text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2 ${TAP}`}
              >
                {item.more.label} ↗
              </a>
            )}
          </p>
        </div>
        <div className="lg:col-span-5">
          <LinkedInEmbed embed={item.embed} href={item.link} />
        </div>
      </article>
    );
  }

  if (!image) {
    return (
      <article className="rounded-card border border-ink-950/10 bg-paper-100 p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            {meta}
            {heading}
          </div>
          <div className="flex flex-col gap-4 md:col-span-5 md:justify-end">
            {item.excerpt && <p className="max-w-[52ch] text-lead text-text-body">{item.excerpt}</p>}
            {who && <p className="font-mono text-small text-text-muted">{who}</p>}
            <p className="coarse:-my-3">{action}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
      <figure className="md:col-span-7">
        <div className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="block aspect-[3/2] w-full object-cover"
          />
        </div>
        {item.credit && (
          <figcaption className="mt-2 font-mono text-small text-text-muted">{item.credit}</figcaption>
        )}
      </figure>
      <div className="md:col-span-5">
        {meta}
        {heading}
        {item.excerpt && <p className="mt-4 max-w-[52ch] text-lead text-text-body">{item.excerpt}</p>}
        {who && <p className="mt-4 font-mono text-small text-text-muted">{who}</p>}
        <p className="mt-6 coarse:mt-3">{action}</p>
      </div>
    </article>
  );
}
