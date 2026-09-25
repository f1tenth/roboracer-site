import type { ReactNode } from "react";
import Reveal from "../ui/Reveal";
import PersonCard from "./PersonCard";
import type { Person } from "./people";

type PeopleGroupProps = {
  id: string;
  title: string;
  /** One line of context, plus the count in mono on the right. */
  lead?: ReactNode;
  people: Person[];
  /** Past crew: six to a row, smaller tiles. */
  compact?: boolean;
};

/** The grid classes and, for each column count they produce, the classes that
 * show that count's filler cells only where it is in force (the tiers never
 * overlap, so their order in the stylesheet does not matter).
 *
 * Wide groups (faculty, developers): on a phone, in either orientation
 * (`compact:`), a person is a row - the portrait at 5rem beside the text - one
 * to a line below sm, two from sm, three from lg on a short wide window; with
 * the photo on top they were 13 phone screens of portraits, and at 844x390
 * every card was taller than the window (mobile pass, ABOUT-02). The desktop
 * grid (3 from 768, 4 from lg) is unchanged.
 *
 * Past crew doubles up at lg (Cedric, 2026-08-23: half the tile, so a reader
 * reaches the partners without scrolling through fifty portraits). Below lg
 * no tile is narrower than 6.25rem, the width at which the longest surname
 * and its arrow still fit whole at the eyebrow size (PersonCard, ABOUT-01):
 * three across on a phone, two under 360 px, five from sm and seven from md
 * (seven at 640-767 made 84-100 px tiles and broke seven names mid-word). */
const GRID = {
  wide: {
    cols: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 compact:sm:grid-cols-2 compact:lg:grid-cols-3",
    tiers: [
      { cols: 2, show: "hidden compact:sm:max-lg:block" },
      { cols: 3, show: "hidden compact:lg:block" },
      { cols: 3, show: "hidden desktop:max-lg:block" },
      { cols: 4, show: "hidden desktop:lg:block" },
    ],
  },
  compact: {
    cols: "grid-cols-3 max-[22.5rem]:grid-cols-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-12",
    tiers: [
      { cols: 2, show: "hidden max-[22.5rem]:block" },
      { cols: 3, show: "hidden min-[22.5rem]:max-sm:block" },
      { cols: 5, show: "hidden sm:max-md:block" },
      { cols: 7, show: "hidden md:max-lg:block" },
      { cols: 12, show: "hidden lg:block" },
    ],
  },
} as const;

/** How many empty cells complete the last row at a given column count. */
const fillCount = (n: number, perRow: number) => (perRow - (n % perRow)) % perRow;

/**
 * One of the four people groups. The heading is an h3 under the section's h2,
 * the count sits in mono beside it, and the cards share one hairline grid.
 * The last row is padded with empty ruled cells - one set per breakpoint,
 * since the column count changes - so a group whose size is not a multiple of
 * the row length ends on a finished rule instead of a ragged gap.
 */
export default function PeopleGroup({ id, title, lead, people, compact = false }: PeopleGroupProps) {
  if (people.length === 0) return null;
  const { cols, tiers } = compact ? GRID.compact : GRID.wide;
  const fillers: { key: string; visibility: string }[] = tiers.flatMap((tier, t) =>
    Array.from({ length: fillCount(people.length, tier.cols) }, (_, i) => ({
      key: `${t}-${i}`,
      visibility: tier.show,
    })),
  );

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-950/10 pb-3">
        <h3 id={id} className="font-display text-lead font-semibold text-text-strong">
          {title}
        </h3>
        <p className="font-mono text-eyebrow tracking-normal text-text-muted">
          {people.length} {people.length === 1 ? "person" : "people"}
        </p>
      </div>
      {lead && <p className="mt-4 max-w-[68ch] text-body text-text-body">{lead}</p>}
      <Reveal stagger className={`mt-8 grid overflow-hidden rounded-card border border-ink-950/10 ${cols}`}>
        {people.map((p) => (
          <div key={p.name} className="-mt-px -ml-px min-w-0 border-t border-l border-ink-950/10">
            <PersonCard person={p} compact={compact} />
          </div>
        ))}
        {fillers.map((f) => (
          <div
            key={f.key}
            aria-hidden="true"
            className={`-mt-px -ml-px border-t border-l border-ink-950/10 bg-paper-50 ${f.visibility}`}
          />
        ))}
      </Reveal>
    </div>
  );
}
