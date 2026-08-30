import { monogram, type Person } from "./people";

type PersonCardProps = {
  person: Person;
  /** Past crew: the tile shrinks and the type steps down one size. */
  compact?: boolean;
};

/** The mono tag that marks anything a public page has not confirmed. */
function VerifyTag() {
  return (
    <span className="border border-ink-950/15 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
      verify
    </span>
  );
}

/**
 * One person as a hairline cell: a square photo or a mono monogram tile, the
 * name (which is the link to that person's source page, Cedric 2026-08-23),
 * the role and affiliation when a public page gives them, the role inside the
 * project when the archive gives one, and a mono `verify` tag wherever nothing
 * public confirms it. A card with neither photo nor role still fills its cell:
 * the monogram is the picture and the name is the content, so nothing reads as
 * missing.
 */
export default function PersonCard({ person, compact = false }: PersonCardProps) {
  const { name, role, project_role, project_role_verify, affiliation, photo, link, note, status } =
    person;
  const nameClass = `font-display font-semibold text-text-strong ${compact ? "text-small" : "text-body"}`;

  return (
    <article className="flex h-full min-w-0 flex-col bg-paper-50">
      <div className="relative aspect-square bg-paper-100">
        {photo ? (
          <img
            src={`${import.meta.env.BASE_URL}${photo.replace(/^\//, "")}`}
            alt=""
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center font-mono text-text-muted ${
              compact ? "text-lead" : "text-display-m"
            }`}
          >
            {monogram(name)}
          </span>
        )}
      </div>
      <div className={`flex min-w-0 grow flex-col gap-1.5 ${compact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${nameClass} w-fit underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2`}
          >
            {name}
            <span aria-hidden="true"> &#8599;</span>
          </a>
        ) : (
          <p className={nameClass}>{name}</p>
        )}
        {role && <p className="text-small text-text-body">{role}</p>}
        {affiliation && (
          <p className="font-mono text-eyebrow tracking-normal text-text-muted">{affiliation}</p>
        )}
        {note && <p className="text-small text-text-body">{note}</p>}
        {project_role && (
          <p className="flex flex-wrap items-center gap-1.5 font-mono text-eyebrow tracking-normal text-text-strong">
            <span>{project_role}</span>
            {project_role_verify && <VerifyTag />}
          </p>
        )}
        {status === "verify" && !project_role && (
          <p className="mt-auto pt-2">
            <VerifyTag />
          </p>
        )}
      </div>
    </article>
  );
}
