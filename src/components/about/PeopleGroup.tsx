import type { ReactNode } from "react";
import Reveal from "../ui/Reveal";
import PersonCard from "./PersonCard";
import PhoneFold from "./PhoneFold";
import type { Person } from "./people";

type PeopleGroupProps = {
  id: string;
  title: string;
  /** One line of context, plus the count in mono on the right. */
  lead?: ReactNode;
  people: Person[];
  /** Past crew: the dense tile grid, smaller tiles. */
  compact?: boolean;
  /** Phones below sm: only the first `fold` people show, and the rest wait
   * in one native <details> under the grid. sm and up show everyone. */
  fold?: number;
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
 * (seven at 640-767 made 84-100 px tiles and broke seven names mid-word).
 *
 * From lg the count follows the grid's own width in rem (the group is a
 * size container): as many columns as fit 8.5rem tiles, seven to twelve.
 * "Pennypacker ↗" is 6.3rem at the tile's name size plus 2rem of padding.
 * Twelve fixed columns broke names mid-word at 1024 (four with a mouse,
 * where the root size is 12 px; 33 on a touch screen, where it stays 16 px):
 * rem-based container widths give a mouse at 1024 nine columns, a landscape
 * iPad seven, and twelve from about 1260 with a mouse. The ranges are exact
 * complements, like the breakpoint tiers, so no two column rules overlap. */
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
    cols:
      "grid-cols-3 max-[22.5rem]:grid-cols-2 sm:max-md:grid-cols-5 md:max-lg:grid-cols-7 " +
      "lg:@max-[68rem]:grid-cols-7 lg:@min-[68rem]:@max-[76.5rem]:grid-cols-8 " +
      "lg:@min-[76.5rem]:@max-[85rem]:grid-cols-9 lg:@min-[85rem]:@max-[93.5rem]:grid-cols-10 " +
      "lg:@min-[93.5rem]:@max-[102rem]:grid-cols-11 lg:@min-[102rem]:grid-cols-12",
    tiers: [
      { cols: 2, show: "hidden max-[22.5rem]:block", phone: true },
      { cols: 3, show: "hidden min-[22.5rem]:max-sm:block", phone: true },
      { cols: 5, show: "hidden sm:max-md:block" },
      { cols: 7, show: "hidden md:max-lg:block" },
      { cols: 7, show: "hidden lg:@max-[68rem]:block" },
      { cols: 8, show: "hidden lg:@min-[68rem]:@max-[76.5rem]:block" },
      { cols: 9, show: "hidden lg:@min-[76.5rem]:@max-[85rem]:block" },
      { cols: 10, show: "hidden lg:@min-[85rem]:@max-[93.5rem]:block" },
      { cols: 11, show: "hidden lg:@min-[93.5rem]:@max-[102rem]:block" },
      { cols: 12, show: "hidden lg:@min-[102rem]:block" },
    ],
  },
} as const;

/** How many empty cells complete the last row at a given column count. */
const fillCount = (n: number, perRow: number) => (perRow - (n % perRow)) % perRow;

type Tier = { cols: number; show: string; phone?: boolean };

/** The filler cells for `n` people, one set per tier; `count` lets a tier
 * pad a different number (the phone tiers of a folded grid pad what shows). */
function fillersFor(tiers: readonly Tier[], count: (tier: Tier) => number) {
  return tiers.flatMap((tier, t) =>
    Array.from({ length: fillCount(count(tier), tier.cols) }, (_, i) => ({
      key: `${t}-${i}`,
      visibility: tier.show,
    })),
  );
}

function Filler({ visibility }: { visibility: string }) {
  return (
    <div
      aria-hidden="true"
      className={`-mt-px -ml-px border-t border-l border-ink-950/10 bg-paper-50 ${visibility}`}
    />
  );
}

/**
 * One of the four people groups. The heading is an h3 under the section's h2,
 * the count sits in mono beside it, and the cards share one hairline grid.
 * The last row is padded with empty ruled cells - one set per breakpoint,
 * since the column count changes - so a group whose size is not a multiple of
 * the row length ends on a finished rule instead of a ragged gap.
 *
 * With `fold`, a phone shows four rows of Past crew and the rest behind one
 * native <details>, the /research and race timeline pattern: it opens without
 * JavaScript, from the keyboard, and to find-in-page. Fifty-one tiles were
 * 4,062 px of a 10,724 px People section at 390 (ABOUT-02). The folded tiles
 * render twice, once in the full grid (hidden below sm) and once in the
 * disclosure (hidden from sm), so sm and desktop keep their one grid exactly.
 */
export default function PeopleGroup({ id, title, lead, people, compact = false, fold }: PeopleGroupProps) {
  if (people.length === 0) return null;
  const { cols, tiers } = compact ? GRID.compact : GRID.wide;
  const folded = fold !== undefined && people.length > fold ? people.slice(fold) : [];
  const phoneShown = people.length - folded.length;
  const fillers = fillersFor(tiers, (tier) => (tier.phone ? phoneShown : people.length));
  const foldFillers = fillersFor(
    tiers.filter((tier: Tier) => tier.phone),
    () => folded.length,
  );

  return (
    // A size container for the Past crew's lg column count (GRID.compact).
    <div className={compact ? "@container" : undefined}>
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
        {people.map((p, i) => (
          <div
            key={p.name}
            className={`-mt-px -ml-px min-w-0 border-t border-l border-ink-950/10 ${
              i >= phoneShown ? "max-sm:hidden" : ""
            }`}
          >
            <PersonCard person={p} compact={compact} />
          </div>
        ))}
        {fillers.map((f) => (
          <Filler key={f.key} visibility={f.visibility} />
        ))}
      </Reveal>
      {folded.length > 0 && (
        // The summary is built from the data: how many people the fold holds.
        <PhoneFold label={`${folded.length} more`}>
          <div className={`grid overflow-hidden rounded-card border border-ink-950/10 ${cols}`}>
            {folded.map((p) => (
              <div key={p.name} className="-mt-px -ml-px min-w-0 border-t border-l border-ink-950/10">
                <PersonCard person={p} compact={compact} />
              </div>
            ))}
            {foldFillers.map((f) => (
              <Filler key={f.key} visibility={f.visibility} />
            ))}
          </div>
        </PhoneFold>
      )}
    </div>
  );
}
