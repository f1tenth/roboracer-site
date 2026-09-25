import { monogram, type Person } from "./people";
import VerifyTag from "./VerifyTag";

type PersonCardProps = {
  person: Person;
  /** Past crew: the tile shrinks and the type steps down one size. */
  compact?: boolean;
};

/**
 * One person as a hairline cell: a square photo or a mono monogram tile, the
 * name (which is the link to that person's source page, Cedric 2026-08-23),
 * the role and affiliation when a public page gives them, the role inside the
 * project when the archive gives one, and a mono `verify` tag wherever nothing
 * public confirms it. A card with neither photo nor role still fills its cell:
 * the monogram is the picture and the name is the content, so nothing reads as
 * missing.
 *
 * On a phone (`compact:`, the media variant, not the prop) a full-size card
 * turns sideways: the portrait at 5rem on the left, the text beside it, the
 * same hairline cell (ABOUT-02). Past crew tiles keep the photo on top.
 */
export default function PersonCard({ person, compact = false }: PersonCardProps) {
  const { name, role, project_role, project_role_verify, affiliation, photo, link, note, status } =
    person;
  const nameClass = `font-display font-semibold text-text-strong ${compact ? "text-small" : "text-body"}`;
  const row = !compact;

  return (
    <article
      className={`flex h-full min-w-0 flex-col bg-paper-50 ${
        row ? "compact:flex-row compact:items-start compact:gap-4 compact:p-4" : ""
      }`}
    >
      <div className={`relative aspect-square bg-paper-100 ${row ? "compact:w-20 compact:shrink-0" : ""}`}>
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
              compact ? "text-lead" : "text-display-m compact:text-lead"
            }`}
          >
            {monogram(name)}
          </span>
        )}
      </div>
      <div
        className={`flex min-w-0 grow flex-col gap-1.5 ${compact ? "p-3 sm:p-4" : "p-4 sm:p-5 compact:p-0"}`}
      >
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${nameClass} w-fit underline decoration-ink-950/25 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-rr-violet hover:decoration-2`}
          >
            {name}
            <span aria-hidden="true"> &#8599;</span>
          </a>
        ) : (
          <p className={`${nameClass} [overflow-wrap:anywhere]`}>{name}</p>
        )}
        {role && <p className="text-small text-text-body">{role}</p>}
        {affiliation && (
          <p className="font-mono text-eyebrow tracking-normal text-text-muted">{affiliation}</p>
        )}
        {note && <p className="text-small text-text-body">{note}</p>}
        {project_role && (
          <p className="flex flex-wrap items-center gap-1.5 font-mono text-eyebrow tracking-normal text-text-strong">
            <span className="min-w-0 [overflow-wrap:anywhere]">{project_role}</span>
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
