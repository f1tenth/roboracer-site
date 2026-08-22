import type { Publication } from "../../lib/data";
import { authorLine, figureCredit, paperHref } from "../../lib/publications";

type PublicationCardProps = {
  publication: Publication;
  tagLabels?: Record<string, string>;
};

const FRAME =
  "rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";
// Site-wide link contract (landing-v2): ink text, underline only, violet on hover.
const TITLE_LINK = "underline-offset-4 hover:underline hover:decoration-rr-violet hover:decoration-2";

/** Hairline publication card, paper only: optional 16/10 figure on top when
 * `thumbnail` is set, display title, small authors, mono venue-year line,
 * mono tag chips. With a figure, a mono credit line sits under the card.
 * Without one, the card renders exactly as before. */
export default function PublicationCard({ publication, tagLabels = {} }: PublicationCardProps) {
  const href = paperHref(publication);
  const thumb = publication.thumbnail;
  const body = (
    <>
      <h3 className="font-display font-semibold leading-snug text-text-strong">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={TITLE_LINK}>
            {publication.title}
          </a>
        ) : (
          publication.title
        )}
      </h3>
      <p className="text-small text-text-body">{authorLine(publication.authors)}</p>
      <p className="font-mono text-small text-text-muted">
        {publication.venue_short?.trim() || publication.venue}
        {publication.year ? ` · ${publication.year}` : ""}
      </p>
      {publication.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {publication.tags.map((t) => (
            <li
              key={t}
              className="rounded-pill border border-ink-950/10 px-2.5 py-1 font-mono text-eyebrow tracking-normal text-text-muted"
            >
              {tagLabels[t] ?? t}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!thumb) {
    return <article className={`flex h-full flex-col gap-3 p-6 ${FRAME}`}>{body}</article>;
  }

  const src = thumb.startsWith("/") ? thumb : `${import.meta.env.BASE_URL}${thumb}`;
  const figure = (
    <img
      src={src}
      alt=""
      width={1200}
      height={750}
      loading="lazy"
      decoding="async"
      className="block h-full w-full object-cover"
    />
  );
  return (
    <article className="flex h-full flex-col gap-2">
      <div className={`flex flex-1 flex-col overflow-hidden ${FRAME}`}>
        <div className="aspect-[16/10] border-b border-ink-950/10 bg-paper-100">
          {href ? (
            // Same target as the title link, hidden from assistive tech so the
            // card announces one link, not two.
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="block h-full"
            >
              {figure}
            </a>
          ) : (
            figure
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">{body}</div>
      </div>
      <p className="font-mono text-eyebrow tracking-normal text-text-muted">{figureCredit(publication.authors)}</p>
    </article>
  );
}
