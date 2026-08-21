type TagFilterProps = {
  tags: { id: string; label: string }[];
  selected: string | null;
  onChange: (id: string | null) => void;
  label: string;
  on?: "ink" | "paper";
};

/** Keyboard-accessible filter chips. Buttons with aria-pressed; "All"
 * clears the filter. */
export default function TagFilter({ tags, selected, onChange, label, on = "paper" }: TagFilterProps) {
  const ink = on === "ink";
  const base = "rounded-pill px-4 py-2 text-small font-semibold transition-colors duration-[var(--duration-fast)]";
  const idle = ink
    ? "border border-ink-700 text-text-on-ink-muted hover:border-text-on-ink-muted hover:text-text-on-ink"
    : "border border-paper-200 text-text-body hover:border-text-muted";
  const active = ink
    ? "border border-rr-magenta bg-rr-magenta/15 text-rr-magenta-bright"
    : "border border-rr-magenta bg-rr-magenta/15 text-rr-magenta-deep";
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
