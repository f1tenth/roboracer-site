import type { ReactNode } from "react";

type SectionHeaderProps = {
  /** Two-digit section index, e.g. "01" - rendered as a mono marker. */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  on?: "paper" | "ink";
  id?: string;
};

/**
 * Section top: numbered mono eyebrow ("01 / Next race") with a 4px ink
 * index marker, tight display title, optional lead and right-aligned action.
 */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  action,
  on = "paper",
  id,
}: SectionHeaderProps) {
  const ink = on === "ink";
  return (
    <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {(index || eyebrow) && (
          <p
            className={`mb-4 flex items-center gap-2 font-mono text-small ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}
          >
            <span aria-hidden="true" className={`h-1 w-1 ${ink ? "bg-text-on-ink" : "bg-ink-950"}`} />
            {index && <span>{index}</span>}
            {index && eyebrow && <span aria-hidden="true">/</span>}
            {eyebrow && <span>{eyebrow}</span>}
          </p>
        )}
        <h2
          id={id}
          className={`font-display text-display-m font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}
        >
          {title}
        </h2>
        {lead && (
          <p className={`mt-4 max-w-[60ch] text-lead ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}>
            {lead}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
