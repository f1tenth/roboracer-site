import type { Team } from "../../lib/data";

type TeamGridProps = {
  teams: Team[];
  on?: "paper" | "ink";
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
 * Featured teams as hairline cards, always below the sponsors block. Every
 * entry renders (Cedric, 2026-08-21: nothing hidden on localhost); entries
 * not yet "published" carry a mono "unverified" tag. Results and TODO-marked
 * institutions render as data, in mono.
 */
export default function TeamGrid({ teams, on = "paper" }: TeamGridProps) {
  const ink = on === "ink";
  if (teams.length === 0) return null;
  return (
    <ul className="grid overflow-hidden rounded-card border border-ink-950/10 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const best = team.highlights?.[0];
        const institution = team.institution?.startsWith("TODO(content)") ? undefined : team.institution;
        return (
          <li key={team.name} className={`min-w-0 -mt-px -ml-px border-t border-l border-ink-950/10 ${ink ? "bg-ink-900" : "bg-paper-50"}`}>
            <article className="flex h-full flex-col gap-3 p-6">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-btn object-contain"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 items-center justify-center rounded-btn border font-mono text-small ${ink ? "border-text-on-ink/20 text-text-on-ink" : "border-ink-950/15 text-text-strong"}`}
                    >
                      {initials(team.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className={`font-display font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
                      {team.name}
                    </h3>
                    <p className={`font-mono text-eyebrow tracking-normal ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>
                      {[institution, team.country].filter(Boolean).join(" · ") || "institution tbc"}
                    </p>
                  </div>
                </div>
                {team.status !== "published" && (
                  <span className={`font-mono text-eyebrow tracking-normal ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>
                    unverified
                  </span>
                )}
              </div>
              {best && (
                <p className="mt-auto border-t border-ink-950/10 pt-3 font-mono text-small text-rr-magenta-deep">
                  {best.result} · {best.event}
                </p>
              )}
              {team.website && (
                <a
                  href={team.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block w-fit py-1 text-small font-semibold underline underline-offset-4 decoration-rr-magenta hover:decoration-2 ${ink ? "text-text-on-ink" : "text-text-strong"}`}
                >
                  Team site
                </a>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
