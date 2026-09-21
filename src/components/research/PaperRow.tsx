import { useMemo, useState } from "react";
import type { Publication } from "../../lib/data";
import { authorLine, paperExtras, paperHref, scholarSearchUrl, typeLabel } from "../../lib/publications";
import { rowThumb } from "./figures";

// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";
const MONO = "font-mono text-eyebrow tracking-normal text-text-muted";

/**
 * The picture beside a row (Cedric, pages v2: every curated paper carries one,
 * "if they don't have a figure put a placeholder roboracer").
 *
 * Same hairline frame and 16:10 plate as the featured cards, at a fraction of
 * the size. Where no figure could be pulled from the paper's own open-access
 * PDF it falls back to the mark on paper, exactly like the race timeline's
 * empty photo tile - a mini VenueTile was tried and rejected: its display-size
 * venue token and column guides are illegible in a 112 px box, and the list
 * needs the placeholders to read as one quiet repeated shape, not as 100
 * different typographic tiles.
 *
 * Decorative in both states: the title, venue and year sit next to it in text,
 * so an alt would only make the list read twice.
 */
function RowThumb({ publication }: { publication: Publication }) {
  const figure = useMemo(() => rowThumb(publication), [publication]);
  const [failed, setFailed] = useState(false);
  const show = figure && !failed;
  return (
    <div className="w-[7.5rem] shrink-0 overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 sm:w-[10.5rem] md:w-[14rem] lg:w-[20rem]">
      <div className="relative aspect-[16/10]">
        {show ? (
          <img
            src={figure.src}
            alt=""
            aria-hidden="true"
            width={figure.width}
            height={figure.height}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src="/logo-square.svg"
            alt=""
            aria-hidden="true"
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            className="absolute left-1/2 top-1/2 h-[42%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-25"
          />
        )}
      </div>
    </div>
  );
}

/**
 * One paper in the all-curated list: a small figure, the title (a link
 * wherever the record has a resolvable one), authors, a mono venue and topic
 * line, and the secondary links on the right. A paper with no reachable record
 * renders as plain text with a mono "no link on file" tag and a Scholar
 * search, so the row is never a dead end.
 */
export default function PaperRow({
  publication: p,
  tagLabels,
}: {
  publication: Publication;
  tagLabels: Record<string, string>;
}) {
  const href = paperHref(p);
  const extras = paperExtras(p);
  return (
    <li className="grid gap-3 py-7 md:grid-cols-[1fr_auto] md:gap-8">
      <div className="flex items-start gap-4 md:gap-5">
        <RowThumb publication={p} />
        <div className="min-w-0">
          <h4 className="font-display text-lead font-semibold leading-snug text-text-strong">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h4>
          <p className="mt-1 text-small text-text-body">{authorLine(p.authors)}</p>
          <p className={`mt-1 ${MONO}`}>
            {p.venue_short?.trim() || p.venue || typeLabel(p)}
            {p.tags.length > 0 ? ` · ${p.tags.map((t) => tagLabels[t] ?? t).join(", ")}` : ""}
          </p>
        </div>
      </div>
      {href ? (
        extras.length > 0 && (
          <ul className="flex gap-4 font-mono text-small md:justify-end" aria-label="Links">
            {extras.map((x) => (
              <li key={x.label}>
                <a
                  href={x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${x.label}: ${p.title}`}
                  className={`text-text-strong ${LINK}`}
                >
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 md:justify-end ${MONO}`}>
          <span>no link on file</span>
          <a
            href={scholarSearchUrl(p.title)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Find on Google Scholar: ${p.title}`}
            className={`text-text-strong ${LINK}`}
          >
            find on Scholar
          </a>
        </p>
      )}
    </li>
  );
}
