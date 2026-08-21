import type { Team } from "../../lib/data";
import { visibleTeams } from "../../lib/data";

type TeamGridProps = {
  teams: Team[];
  /** Dev/styleguide only: also render status "verify" entries, badged. */
  showUnverified?: boolean;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Featured teams, always rendered below the sponsors block. A team renders
 * publicly only with status "published" (a recorded source); "verify"
 * entries appear solely when showUnverified is set, marked as unverified.
 */
export default function TeamGrid({ teams, showUnverified = false }: TeamGridProps) {
  const list = visibleTeams(teams, showUnverified);
  if (list.length === 0) return null;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((team) => {
        const best = team.highlights?.[0];
        return (
          <li key={team.name}>
            <article className="flex h-full flex-col gap-4 rounded-card border border-ink-700 bg-ink-800 p-6">
              <div className="flex items-center gap-4">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 rounded-media object-contain"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-media bg-ink-700 font-display font-semibold text-text-on-ink"
                  >
                    {initials(team.name)}
                  </span>
                )}
                <div>
                  <h3 className="font-display font-semibold text-text-on-ink">{team.name}</h3>
                  <p className="text-small text-text-on-ink-muted">
                    {[team.institution, team.country].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {best && (
                <p className="w-fit rounded-pill bg-rr-magenta/15 px-3 py-1.5 text-small font-semibold text-rr-magenta">
                  {best.result}, {best.event}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-3">
                {team.website ? (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-small font-semibold text-text-on-ink underline underline-offset-4 decoration-rr-magenta hover:decoration-2"
                  >
                    Team site
                  </a>
                ) : (
                  <span />
                )}
                {team.status !== "published" && (
                  <span className="eyebrow rounded-pill border border-ink-700 px-3 py-1.5 text-text-on-ink-muted">
                    Unverified
                  </span>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
