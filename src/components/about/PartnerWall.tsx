import Reveal from "../ui/Reveal";
import { logoAttrs, type Partner } from "../../lib/data";

type PartnerWallProps = {
  partners: Partner[];
};

/** Group order and headings. `category` is on every record in partners.json;
 * anything without one falls into a single trailing group. */
const GROUPS: { key: NonNullable<Partner["category"]>; title: string }[] = [
  { key: "university", title: "Universities" },
  { key: "industry", title: "Industry" },
  { key: "organization", title: "Organizations" },
  { key: "other", title: "Other" },
];

/** Logo box: 48px on a phone, 80px from md. The landing ribbon draws its logos
 * at 72px, and the wall must never render a partner smaller than the ribbon it
 * replaces (Cedric, 2026-08-23: "clear and big"). */
const BOX = "flex h-12 items-center justify-center md:h-20";
const LOGO_H = 80;

/** A grid, not flex-wrap: 80 logos only read as a wall when they line up in
 * columns. Eight across on a wide desktop, three on a phone. */
const GRID =
  "mt-8 grid grid-cols-3 gap-x-6 gap-y-9 sm:grid-cols-4 md:grid-cols-6 md:gap-x-8 md:gap-y-12 xl:grid-cols-8";

function LogoGrid({ partners }: { partners: Partner[] }) {
  return (
    // The grid reveals as one block, not logo by logo: a 60ms stagger over
    // sixty-five logos is a four-second tail, and the last third of the group
    // sits at opacity 0 long after the reader has arrived.
    <Reveal as="ul" className={GRID}>
      {[...partners]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => (
          <li key={p.name} className="min-w-0">
            <a
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BOX} opacity-85 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100`}
            >
              <img
                /* The colour WebP (scripts/partner-tint.py) at a fifth of the
                   PNG original's bytes; `image` is the fallback where the tint
                   script has not run for that logo. */
                src={`${import.meta.env.BASE_URL}${(p.image_hover ?? p.image).replace(/^\//, "")}`}
                alt={p.name}
                {...logoAttrs(p, LOGO_H)}
                loading="lazy"
                decoding="async"
                className="max-h-full w-auto max-w-full object-contain"
              />
            </a>
          </li>
        ))}
    </Reveal>
  );
}

function GroupHeader({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-950/10 pb-3">
      <h3 id={id} className="font-display text-lead font-semibold text-text-strong">
        {title}
      </h3>
      <p className="font-mono text-eyebrow tracking-normal tabular-nums text-text-muted">{count}</p>
    </div>
  );
}

/**
 * The partner wall: every institution that runs RoboRacer, grouped by what it
 * is, alphabetical inside each group, untiered (partners use the platform;
 * sponsors are a separate block and there are none yet). It is deliberately
 * static and large rather than the landing's moving ribbon - a marquee shows
 * five logos at a time, which says "there are a lot" but never answers "is my
 * university on this list", the question About exists to answer (Cedric,
 * 2026-08-23). Logos are lazy inside a fixed-height box, so nothing shifts as
 * they arrive.
 */
export default function PartnerWall({ partners }: PartnerWallProps) {
  if (partners.length === 0) return null;
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: partners.filter((p) => p.category === g.key),
  })).filter((g) => g.items.length > 0);
  const ungrouped = partners.filter((p) => !p.category);

  if (grouped.length === 0) {
    return <LogoGrid partners={partners} />;
  }

  return (
    <div className="flex flex-col gap-14">
      {grouped.map((g) => (
        <section key={g.key} aria-labelledby={`partners-${g.key}`}>
          <GroupHeader id={`partners-${g.key}`} title={g.title} count={g.items.length} />
          <LogoGrid partners={g.items} />
        </section>
      ))}
      {ungrouped.length > 0 && (
        <section aria-labelledby="partners-uncategorized">
          <GroupHeader
            id="partners-uncategorized"
            title="Also using the platform"
            count={ungrouped.length}
          />
          <LogoGrid partners={ungrouped} />
        </section>
      )}
    </div>
  );
}
