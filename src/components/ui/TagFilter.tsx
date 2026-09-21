type TagFilterProps = {
  tags: { id: string; label: string }[];
  selected: string | null;
  onChange: (id: string | null) => void;
  label: string;
  on?: "ink" | "paper";
};

/** Keyboard-accessible filter chips. Buttons with aria-pressed; "All"
 * clears the filter. Pressed = inverted (solid ink on paper, solid paper on
 * ink): the accent contract keeps magenta and violet off text and fills. */
export default function TagFilter({ tags, selected, onChange, label, on = "paper" }: TagFilterProps) {
  const ink = on === "ink";
  const base = "rounded-pill px-4 py-2 text-small font-semibold transition-colors duration-[var(--duration-fast)]";
  const idle = ink
    ? "border border-ink-700 text-text-on-ink-muted hover:border-text-on-ink-muted hover:text-text-on-ink"
    : "border border-paper-200 text-text-body hover:border-text-muted";
  const active = ink
    ? "border border-text-on-ink bg-text-on-ink text-ink-950"
    : "border border-ink-950 bg-ink-950 text-text-on-ink";
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
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
