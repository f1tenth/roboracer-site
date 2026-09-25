import type { Team } from "../../lib/data";

type TeamGridProps = {
  teams: Team[];
  on?: "paper" | "ink";
};

function initials(name: string): string {
  // Split on spaces, hyphens, and underscores so "UBM-Tom" -> "UT" and
  // "UNICORN_Racing" -> "UR" instead of a wall of identical "U" tiles.
  const segments = name.split(/[\s_-]+/).filter(Boolean);
  if (segments.length >= 2) {
    return (segments[0][0] + segments[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Featured teams as hairline cells, each with a square neutral image slot on
 * top: the team photo (object-cover) when the media curator found one, else
 * the team logo (object-contain), else mono initials. Every entry renders (Cedric, 2026-08-21: nothing hidden on
 * localhost); entries not yet "published" carry a mono "unverified" tag.
 * Results and TODO-marked institutions render as data, in mono. 10 teams =
 * two clean rows of five on desktop. Below sm each team is one row (a 5rem
 * photo left, name and result right) so ten teams are not ten screens of
 * square photos; from sm the grid runs 3, 4, then 5 across, with 4/3 photos
 * until lg (mobile pass, LANDING-09).
 */
export default function TeamGrid({ teams, on = "paper" }: TeamGridProps) {
  const ink = on === "ink";
  if (teams.length === 0) return null;
  return (
    <ul className="grid overflow-hidden rounded-card border border-ink-950/10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {teams.map((team) => {
        const best = team.highlights?.[0];
        const institution = team.institution?.startsWith("TODO(content)") ? undefined : team.institution;
        return (
          <li key={team.name} className={`min-w-0 -mt-px -ml-px border-t border-l border-ink-950/10 ${ink ? "bg-ink-900" : "bg-paper-50"}`}>
            <article className="flex h-full min-w-0 flex-col max-sm:flex-row max-sm:gap-4 max-sm:p-4">
              <div
                className={`relative aspect-square max-sm:w-20 max-sm:shrink-0 max-sm:self-start sm:max-lg:aspect-[4/3] ${ink ? "bg-ink-800" : "bg-paper-200"}`}
              >
                {team.photo ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${team.photo.replace(/^\//, "")}`}
                    alt={`${team.name} team photo`}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : team.logo ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${team.logo}`}
                    alt=""
                    width={320}
                    height={320}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain p-3 sm:p-6"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 flex items-center justify-center font-mono text-display-m ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}
                  >
                    {initials(team.name)}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 grow flex-col gap-1.5 sm:p-5">
                <h3 className={`font-display text-body font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
                  {team.name}
                </h3>
                <p className={`font-mono text-eyebrow tracking-normal ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>
                  {[institution, team.country].filter(Boolean).join(" · ") || "institution tbc"}
                </p>
                {team.status !== "published" && (
                  <p className={`font-mono text-eyebrow tracking-normal ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>
                    unverified
                  </p>
                )}
                {best && (
                  <p className={`mt-auto border-t pt-3 font-mono text-small ${ink ? "border-text-on-ink/10 text-text-on-ink-muted" : "border-ink-950/10 text-text-muted"}`}>
                    {best.result} · {best.event}
                  </p>
                )}
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block w-fit py-1 text-small font-semibold coarse:-my-2 coarse:py-3 ${
                      ink
                        ? "text-text-on-ink underline underline-offset-4 decoration-text-on-ink/30 hover:decoration-rr-violet hover:decoration-2"
                        : "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2"
                    }`}
                  >
                    Team site
                  </a>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
