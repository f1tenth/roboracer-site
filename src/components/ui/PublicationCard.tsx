import type { Publication } from "../../lib/data";

type PublicationCardProps = {
  publication: Publication;
  tagLabels?: Record<string, string>;
};

function authorLine(authors: string[]): string {
  if (authors.length <= 3) return authors.join(", ");
  return `${authors.slice(0, 3).join(", ")} et al.`;
}

/** Hairline publication card, paper only: display title, small authors,
 * mono venue-year line, mono tag chips. */
export default function PublicationCard({ publication, tagLabels = {} }: PublicationCardProps) {
  const href = publication.url ?? (publication.doi ? `https://doi.org/${publication.doi}` : undefined);
  return (
    <article className="flex h-full flex-col gap-3 rounded-card border border-ink-950/10 bg-paper-50 p-6 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30">
      <h3 className="font-display font-semibold leading-snug text-text-strong">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
            <li key={t} className="rounded-pill border border-ink-950/10 px-2.5 py-1 font-mono text-eyebrow tracking-normal text-text-muted">
              {tagLabels[t] ?? t}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
