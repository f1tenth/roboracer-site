import type { Publication } from "../../lib/data";

type PublicationCardProps = {
  publication: Publication;
  /** Human labels for tag ids (from publications.json "tags"). */
  tagLabels?: Record<string, string>;
};

function authorLine(authors: string[]): string {
  if (authors.length <= 3) return authors.join(", ");
  return `${authors.slice(0, 3).join(", ")} et al.`;
}

/** Paper-variant publication card: title, authors, venue, year, tag pills. */
export default function PublicationCard({ publication, tagLabels = {} }: PublicationCardProps) {
  const href = publication.url ?? (publication.doi ? `https://doi.org/${publication.doi}` : undefined);
  return (
    <article className="flex h-full flex-col gap-3 rounded-card bg-paper-50 p-6 shadow-card transition-shadow duration-[var(--duration-fast)] hover:shadow-card-hover">
      <h3 className="font-display font-semibold text-text-strong">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
            {publication.title}
          </a>
        ) : (
          publication.title
        )}
      </h3>
      <p className="text-small text-text-body">{authorLine(publication.authors)}</p>
      <p className="text-small text-text-muted">
        {publication.venue}
        {publication.year ? ` · ${publication.year}` : ""}
      </p>
      {publication.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {publication.tags.map((t) => (
            <li key={t} className="rounded-pill bg-paper-100 px-3 py-1 text-eyebrow text-text-muted">
              {tagLabels[t] ?? t}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
