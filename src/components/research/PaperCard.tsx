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
 * On a phone, in either orientation (`compact:`), the card takes the list
 * row's shape: the figure is a 5rem thumb beside the text (mobile pass,
 * 2026-09-25: seventeen full-width 16:10 cards were 11,400px, thirteen
 * screens, before the search at 390, and each one was taller than a
 * landscape phone). The generated tile cannot be read at that size, so there
 * the thumb shows the mark on paper, as the list rows do.
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
    <>
      <div className="h-full compact:hidden">
        <VenueTile publication={publication} />
      </div>
      <div aria-hidden="true" className="relative h-full desktop:hidden">
        <img
          src="/logo-square.svg"
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="absolute left-1/2 top-1/2 h-[42%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-25"
        />
      </div>
    </>
  );

  return (
    <article className="flex h-full flex-col gap-2">
      <div
        className={`flex flex-1 flex-col overflow-hidden ${FRAME} compact:flex-row compact:items-start compact:gap-4 compact:p-4`}
      >
        <div className="aspect-[16/10] border-ink-950/10 bg-paper-100 compact:w-20 compact:shrink-0 compact:overflow-hidden compact:rounded-media compact:border desktop:border-b">
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
        <div className="flex flex-1 flex-col gap-3 p-6 compact:min-w-0 compact:gap-2 compact:p-0">
          <h3 className="font-display font-semibold leading-snug text-text-strong compact:text-body">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={TITLE_LINK}>
                {publication.title}
              </a>
            ) : (
              publication.title
            )}
          </h3>
          <p className="text-small text-text-body">{authorLine(publication.authors)}</p>
          {/* On a phone the topics join this line, in the list rows' mono
              (the pills stacked one per line in the narrow column). */}
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
