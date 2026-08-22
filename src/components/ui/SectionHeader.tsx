import type { ReactNode } from "react";

type SectionHeaderProps = {
  /** Two-digit section index, e.g. "01" - rendered as a mono marker. */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  /** Landing v5 final touches: the section's name is the title ("Platform");
   * the former title becomes this semibold lead-size line under it. */
  subtitle?: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  on?: "paper" | "ink";
  id?: string;
  /** "m" (default) = display-m title; "s" = demoted header for sections whose
   * media is the voice: the title drops to display-s-like lead size. */
  size?: "m" | "s";
};

/**
 * Section top: numbered mono eyebrow ("01 / Next race") with a 4px ink
 * index marker, tight display title, optional lead and right-aligned action.
 */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  subtitle,
  lead,
  action,
  on = "paper",
  id,
  size = "m",
}: SectionHeaderProps) {
  const ink = on === "ink";
  const titleSize = size === "s" ? "text-lead font-semibold" : "text-display-m font-semibold";
  return (
    <header className={`${size === "s" ? "mb-8" : "mb-12"} flex flex-wrap items-end justify-between gap-6`}>
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
          className={`font-display ${titleSize} ${ink ? "text-text-on-ink" : "text-text-strong"}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-3 max-w-[40ch] font-display text-lead font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
            {subtitle}
          </p>
        )}
        {lead && (
          <p
            className={`max-w-[60ch] ${size === "s" ? "mt-2 text-body" : "mt-4 text-lead"} ${ink ? "text-text-on-ink-muted" : "text-text-body"}`}
          >
            {lead}
          </p>
        )}
      </div>
      {action && <div className="min-w-0 max-w-full">{action}</div>}
    </header>
  );
}
