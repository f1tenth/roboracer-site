import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  /** Matches the enclosing Section variant for text colors. */
  on?: "ink" | "paper";
  id?: string;
};

/** The sanctioned section-top layout: eyebrow + display-m title + lead + action. */
export default function SectionHeader({
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
        {eyebrow && (
          <p className={`eyebrow mb-3 ${ink ? "text-rr-magenta" : "text-text-muted"}`}>{eyebrow}</p>
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
