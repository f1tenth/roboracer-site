import { useMemo, useState } from "react";
import type { Publication } from "../../lib/data";
import {
  authorLine,
  figureCredit,
  paperHref,
  scholarSearchUrl,
  shortTitle,
} from "../../lib/publications";
import { figureChain } from "./figures";
import VenueTile from "./VenueTile";

const FRAME =
  "rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";
// Site-wide link contract (landing-v2): ink text, underline only, violet on hover.
const TITLE_LINK = "underline-offset-4 hover:underline hover:decoration-rr-violet hover:decoration-2";
const MONO = "font-mono text-eyebrow tracking-normal text-text-muted";
const MONO_LINK =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/**
 * Featured publication card, paper only. Every card carries a picture: the
 * paper's own figure where one could be extracted, otherwise the generated
 * venue tile (Cedric, pages v2: "all curated publications need one picture
 * by them, it can be small" - never an empty frame). A paper with no
 * resolvable link renders as plain text with a mono tag and a Scholar
 * search, so the card is still an entry point.
 */
export default function PaperCard({
  publication,
  tagLabels = {},
}: {
  publication: Publication;
  tagLabels?: Record<string, string>;
}) {
  const href = paperHref(publication);
  const sources = useMemo(() => figureChain(publication), [publication]);
  const [failed, setFailed] = useState(0);
  const img = sources[failed];

  const figure = img ? (
    <img
      key={img.src}
      src={img.src}
      alt={`Figure from ${shortTitle(publication.title)}`}
      width={img.width}
      height={img.height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed((f) => f + 1)}
      className="block h-full w-full object-cover"
    />
  ) : (
    <VenueTile publication={publication} />
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
        <div className="flex flex-1 flex-col gap-3 p-6">
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
          {!href && (
            <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${MONO}`}>
              <span>no link on file</span>
              <a
                href={scholarSearchUrl(publication.title)}
                target="_blank"
                rel="noopener noreferrer"
                className={MONO_LINK}
              >
                find on Scholar
              </a>
            </p>
          )}
          {publication.tags.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-2 pt-2">
              {publication.tags.map((t) => (
                <li key={t} className={`rounded-pill border border-ink-950/10 px-2.5 py-1 ${MONO}`}>
                  {tagLabels[t] ?? t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* A generated tile has nobody to credit; the row keeps its height so
          every card in a grid row ends on the same line. */}
      <p className={MONO} aria-hidden={img ? undefined : true}>
        {img ? figureCredit(publication.authors) : "\u00a0"}
      </p>
    </article>
  );
}
