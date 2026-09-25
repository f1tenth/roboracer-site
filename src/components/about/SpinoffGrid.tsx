import Reveal from "../ui/Reveal";
import VerifyTag from "./VerifyTag";
import type { Spinoff } from "../../lib/data";

type SpinoffGridProps = {
  spinoffs: Spinoff[];
};

const LINK =
  "underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/** A 2.75rem hit area on touch screens, taken back by the negative margin so
 * the heading does not move (mobile pass, ABOUT-07). */
const TAP = "coarse:-my-3 coarse:py-3";

/** Logo box height when an entry has a manifest-cleared logo (none do yet). */
const LOGO_H = 40;

/** An origin still waiting on Cedric reads "TODO(content): ..." in the JSON;
 * the card leaves the line out rather than print the question. */
const shown = (text: string | null) => (text && !text.startsWith("TODO(content)") ? text : null);

/** Empty ruled cells that finish the last row: two across from sm, three from
 * lg (a phone is one column and never needs one). Same trick as PeopleGroup,
 * so the hairline grid always ends on a closed rule. */
function fillers(n: number) {
  return [
    ...Array.from({ length: (2 - (n % 2)) % 2 }, (_, i) => ({
      key: `s${i}`,
      visibility: "hidden sm:block lg:hidden",
    })),
    ...Array.from({ length: (3 - (n % 3)) % 3 }, (_, i) => ({
      key: `l${i}`,
      visibility: "hidden lg:block",
    })),
  ];
}

function SpinoffCard({ spinoff }: { spinoff: Spinoff }) {
  const { name, kind, label, what, since, url, logo, status } = spinoff;
  const origin = shown(spinoff.origin);
  return (
    <article className="flex h-full min-w-0 flex-col bg-paper-50 p-5 sm:p-6">
      <p className="flex items-baseline justify-between gap-4 font-mono text-eyebrow tracking-normal text-text-muted">
        <span>{label ?? kind}</span>
        {since && <span className="tabular-nums">since {since}</span>}
      </p>
      {/* The name is the link, as on the people cards. No logo has cleared
          the asset manifest yet, so every entry is a wordmark in the display
          face; a logo, once cleared, takes the same slot. */}
      <h3 className="mt-6 font-display text-display-s font-semibold text-text-strong">
        <a href={url} target="_blank" rel="noopener noreferrer" className={`inline-block max-w-full ${TAP} ${LINK}`}>
          {logo ? (
            <img
              src={`${import.meta.env.BASE_URL}${logo.replace(/^\//, "")}`}
              alt={name}
              height={LOGO_H}
              width="auto"
              loading="lazy"
              decoding="async"
              className="h-10 w-auto max-w-full object-contain"
            />
          ) : (
            name
          )}
          {/* A no-break space: the arrow never wraps onto a line alone. */}
          <span aria-hidden="true" className="text-body text-text-muted">
            &nbsp;&#8599;
          </span>
        </a>
      </h3>
      <p className="mt-3 max-w-[48ch] text-body text-text-body">{what}</p>
      {origin && (
        <div className="mt-5 border-t border-ink-950/10 pt-4">
          <p className="font-mono text-eyebrow tracking-normal text-text-muted">origin</p>
          <p className="mt-1.5 max-w-[48ch] text-small text-text-body">{origin}</p>
        </div>
      )}
      {/* The verify tag alone, as on the team cards; the sources stay in
          the JSON for review. */}
      {status === "verify" && (
        <p className="mt-auto pt-6">
          <VerifyTag />
        </p>
      )}
    </article>
  );
}

/**
 * The spinoff cards on /about: what grew out of the car, from
 * public/data/spinoffs.json `entries` (the `candidates` there wait for
 * Cedric). One hairline grid in the people-card language: kind and year in
 * mono, the name as a display wordmark and link, one sentence on what it is,
 * one on where it came from, then the verify tag.
 */
export default function SpinoffGrid({ spinoffs }: SpinoffGridProps) {
  if (spinoffs.length === 0) return null;
  return (
    <Reveal
      stagger
      className="grid overflow-hidden rounded-card border border-ink-950/10 sm:grid-cols-2 lg:grid-cols-3"
    >
      {spinoffs.map((s) => (
        <div key={s.name} className="-mt-px -ml-px min-w-0 border-t border-l border-ink-950/10">
          <SpinoffCard spinoff={s} />
        </div>
      ))}
      {fillers(spinoffs.length).map((f) => (
        <div
          key={f.key}
          aria-hidden="true"
          className={`-mt-px -ml-px border-t border-l border-ink-950/10 bg-paper-50 ${f.visibility}`}
        />
      ))}
    </Reveal>
  );
}
