import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type TagFilterProps = {
  tags: { id: string; label: string }[];
  selected: string | null;
  onChange: (id: string | null) => void;
  label: string;
  on?: "ink" | "paper";
};

/** Keyboard-accessible filter chips. Buttons with aria-pressed; "All"
 * clears the filter. Pressed = inverted (solid ink on paper, solid paper on
 * ink): the accent contract keeps magenta and violet off text and fills.
 *
 * Below sm the chips are one row that scrolls sideways instead of an
 * eight-row wall (mobile pass, RESEARCH-03): it runs to the screen edges
 * (the parent's 1.5rem gutter), fades out under them, snaps chips to the
 * gutter and scrolls the pressed chip into view. Tab still walks every chip
 * and the browser brings a focused one into view. Chips are 2.75rem tall on
 * touch screens only (coarse:), so the mouse layout never moves. */
export default function TagFilter({ tags, selected, onChange, label, on = "paper" }: TagFilterProps) {
  const ink = on === "ink";
  const reduced = usePrefersReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);

  // Keep the pressed chip on screen when the row scrolls (phones only: on a
  // wrapped row there is nothing to scroll). Never scrollIntoView, which
  // would move the page as well.
  useEffect(() => {
    const row = rowRef.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const chip = row.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!chip) return;
    const r = row.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const gutter = 24;
    if (c.left >= r.left + gutter && c.right <= r.right - gutter) return;
    row.scrollTo({
      left: row.scrollLeft + (c.left - r.left) - (r.width - c.width) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [selected, tags, reduced]);

  const base =
    "rounded-pill px-4 py-2 text-small font-semibold transition-colors duration-[var(--duration-fast)] coarse:min-h-11 max-sm:shrink-0 max-sm:snap-start max-sm:whitespace-nowrap";
  const idle = ink
    ? "border border-ink-700 text-text-on-ink-muted hover:border-text-on-ink-muted hover:text-text-on-ink"
    : "border border-paper-200 text-text-body hover:border-text-muted";
  const active = ink
    ? "border border-text-on-ink bg-text-on-ink text-ink-950"
    : "border border-ink-950 bg-ink-950 text-text-on-ink";
  return (
    <div
      ref={rowRef}
      role="group"
      aria-label={label}
      className="flex flex-wrap gap-2 max-sm:-mx-6 max-sm:snap-x max-sm:snap-proximity max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:-my-1 max-sm:px-6 max-sm:py-1 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)] max-sm:[scroll-padding-inline:1.5rem] max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onChange(null)}
        className={`${base} ${selected === null ? active : idle}`}
      >
        All
      </button>
      {tags.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={selected === t.id}
          onClick={() => onChange(selected === t.id ? null : t.id)}
          className={`${base} ${selected === t.id ? active : idle}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
