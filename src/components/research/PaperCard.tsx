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
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 coarse:inline-flex coarse:min-h-11 coarse:items-center";

/**
 * Featured publication card, paper only. Every card carries a picture: the
 * paper's own figure where one could be extracted, otherwise the generated
 * venue tile (Cedric, pages v2: "all curated publications need one picture
 * by them, it can be small" - never an empty frame). A paper with no
 * resolvable link renders as plain text with a mono tag and a Scholar
 * search, so the card is still an entry point.
 *
 * One shape at every size: the figure across the top at the card's full
 * width, the text under it. The mobile pass (2026-09-25) had turned the card
 * into a row with a 5rem thumb on phones; Cedric asked the same day for the
 * larger picture with the paper info below it. The page keeps the length
 * down instead by showing four featured cards on a phone and folding the
 * rest. On a phone (`compact:`) the topics join the mono venue line rather
 * than stacking as pills.
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
        <div className="flex flex-1 flex-col gap-3 p-6 compact:gap-2 compact:p-5">
          <h3 className="font-display font-semibold leading-snug text-text-strong compact:text-lead">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={TITLE_LINK}>
                {publication.title}
              </a>
            ) : (
              publication.title
            )}
          </h3>
          <p className="text-small text-text-body">{authorLine(publication.authors)}</p>
          {/* On a phone the topics join this line, in the list rows' mono:
              three pills wrap to three lines there. */}
          <p className="font-mono text-small text-text-muted compact:text-eyebrow compact:tracking-normal">
            {publication.venue_short?.trim() || publication.venue}
            {publication.year ? ` · ${publication.year}` : ""}
            {publication.tags.length > 0 && (
              <span className="desktop:hidden"> · {publication.tags.map((t) => tagLabels[t] ?? t).join(", ")}</span>
            )}
          </p>
          {!href && (
            <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 coarse:-my-3 ${MONO}`}>
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
            <ul className="mt-auto flex flex-wrap gap-2 pt-2 compact:hidden">
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
      <p className={`${MONO} ${img ? "" : "compact:hidden"}`} aria-hidden={img ? undefined : true}>
        {img ? figureCredit(publication.authors) : "\u00a0"}
      </p>
    </article>
  );
}
