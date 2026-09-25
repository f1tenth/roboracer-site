import { monogram, type Person } from "./people";
import VerifyTag from "./VerifyTag";

type PersonCardProps = {
  person: Person;
  /** Past crew: the tile shrinks and the type steps down one size. */
  compact?: boolean;
};

/** A 2.75rem hit area on touch screens for the name link, taken back by the
 * negative margin so the text does not move (mobile pass, ABOUT-07); `relative`
 * keeps the padding above the next line for the tap. A Past crew name can be
 * one eyebrow-size line (16.5 px), which 0.75rem either side left at 41 px;
 * the tiles take 0.875rem. */
const TAP = "relative coarse:-my-3 coarse:py-3";
const TILE_TAP = "relative coarse:-my-3.5 coarse:py-3.5";

/** Past crew tiles below lg are size containers: a tile under 7.75rem steps
 * its name down to the eyebrow size and its side padding to 0.375rem, so the
 * longest surname and its arrow ("Pennypacker ↗") fit on one line at every
 * phone width and at 768 (ABOUT-01). The grid keeps tiles at 6.25rem or more
 * (PeopleGroup). From lg the tile is untouched. */
const TILE_NAME = "max-lg:@max-[7.75rem]:text-eyebrow max-lg:@max-[7.75rem]:leading-snug max-lg:@max-[7.75rem]:tracking-normal";

/** The name with its arrow glued to the last word in one no-wrap span: the
 * arrow never starts a line alone (ABOUT-03). A no-break space alone did not
 * hold under `overflow-wrap: anywhere`. Every Past crew tile is wide enough
 * for the longest surname and its arrow, from 320 to 1920 (PeopleGroup: the
 * lg column count follows the grid's width), so the span holds everywhere. */
function LinkedName({ name }: { name: string }) {
  const cut = name.lastIndexOf(" ");
  return (
    <>
      {cut > 0 && name.slice(0, cut + 1)}
      <span className="whitespace-nowrap">
        {name.slice(cut + 1)}
        <span aria-hidden="true">&nbsp;&#8599;</span>
      </span>
    </>
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
 *
 * On a phone (`compact:`, the media variant, not the prop) a full-size card
 * turns sideways: the portrait at 5rem on the left, the text beside it, the
 * same hairline cell (ABOUT-02). Past crew tiles keep the photo on top.
 */
export default function PersonCard({ person, compact = false }: PersonCardProps) {
  const { name, role, project_role, project_role_verify, affiliation, photo, link, note, status } =
    person;
  const nameClass = `font-display font-semibold text-text-strong ${compact ? `text-small ${TILE_NAME}` : "text-body"}`;
  const row = !compact;

  return (
    <article
      className={`flex h-full min-w-0 flex-col bg-paper-50 ${
        row ? "compact:flex-row compact:items-start compact:gap-4 compact:p-4" : "@container"
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
        className={`flex min-w-0 grow flex-col gap-1.5 ${
          compact ? "px-2 py-3 max-lg:@max-[7.75rem]:px-1.5 sm:py-4 lg:p-4" : "p-4 sm:p-5 compact:p-0"
        }`}
      >
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${nameClass} ${compact ? TILE_TAP : TAP} w-fit max-w-full underline decoration-ink-950/25 underline-offset-4 [overflow-wrap:break-word] hover:decoration-rr-violet hover:decoration-2`}
          >
            <LinkedName name={name} />
          </a>
        ) : (
          <p className={`${nameClass} [overflow-wrap:break-word]`}>{name}</p>
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
