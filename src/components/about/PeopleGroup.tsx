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

/** Cards per row at base / sm / lg, matching the grid classes below.
 * Past crew doubles up at lg (Cedric, 2026-08-23: half the tile, so a reader
 * reaches the partners without scrolling through fifty portraits). */
const COLUMNS = {
  wide: [2, 3, 4],
  compact: [4, 7, 12],
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
  const cols = compact
    ? "grid-cols-4 sm:grid-cols-7 lg:grid-cols-12"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  const [base, sm, lg] = compact ? COLUMNS.compact : COLUMNS.wide;
  const fillers: { key: string; visibility: string }[] = [
    ...Array.from({ length: fillCount(people.length, base) }, (_, i) => ({
      key: `b${i}`,
      visibility: "sm:hidden",
    })),
    ...Array.from({ length: fillCount(people.length, sm) }, (_, i) => ({
      key: `s${i}`,
      visibility: "hidden sm:block lg:hidden",
    })),
    ...Array.from({ length: fillCount(people.length, lg) }, (_, i) => ({
      key: `l${i}`,
      visibility: "hidden lg:block",
    })),
  ];

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
