import type { Publication } from "../../lib/data";
import { authorLine, paperExtras, paperHref, scholarSearchUrl, typeLabel } from "../../lib/publications";

// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";
const MONO = "font-mono text-eyebrow tracking-normal text-text-muted";

/**
 * One paper in the all-curated list: title (a link wherever the record has
 * a resolvable one), authors, a mono venue and topic line, and the
 * secondary links on the right. A paper with no reachable record renders as
 * plain text with a mono "no link on file" tag and a Scholar search, so the
 * row is never a dead end.
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
    <li className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        <h4 className="font-display text-body font-semibold leading-snug text-text-strong">
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
