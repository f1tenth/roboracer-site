import Reveal from "../ui/Reveal";
import { avatarSrc, monogram, type Contributor } from "./people";

type ContributorStripProps = {
  contributors: Contributor[];
  emptyLabel: string;
};

/**
 * Contributors are compact by design (not full cards): a 40px avatar, the
 * GitHub handle, and a link to the profile. The monogram sits behind the
 * avatar, so a blocked or offline avatar leaves a tile rather than a broken
 * image. Avatars are GitHub's own, requested at 80px (2x) with an explicit
 * box, so the wrapped rows never shift as they load.
 */
export default function ContributorStrip({ contributors, emptyLabel }: ContributorStripProps) {
  if (contributors.length === 0) {
    return <p className="mt-6 font-mono text-small text-text-muted">{emptyLabel}</p>;
  }
  return (
    // One block, not one chip at a time: thirty-six chips at the 60ms stagger
    // would take two seconds to finish arriving.
    <Reveal as="ul" className="mt-6 flex flex-wrap gap-2">
      {contributors.map((c) => (
        <li key={c.login} className="min-w-0">
          <a
            href={c.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-btn border border-ink-950/10 bg-paper-50 py-1.5 pr-3 pl-1.5 transition-colors duration-[var(--duration-fast)] hover:border-rr-violet"
          >
            <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-btn bg-paper-200">
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center font-mono text-eyebrow tracking-normal text-text-muted"
              >
                {monogram(c.name ?? c.login)}
              </span>
              {c.avatar_url && (
                <img
                  src={avatarSrc(c.avatar_url)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </span>
            <span className="min-w-0 font-mono text-small text-text-strong">{c.login}</span>
          </a>
        </li>
      ))}
    </Reveal>
  );
}
