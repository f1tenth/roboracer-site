import type { ReactNode } from "react";

/** Room a hash landing (a #link to the h2's id) leaves above the heading:
 * the fixed nav bar plus 1rem, as /research's UNDER_NAV, and with an eyebrow
 * that line and its mb-4 as well, so "04 / Spinoffs" is not cut by the bar.
 * Read by useScrollToHash and by native anchor jumps alike. */
const UNDER_NAV = "scroll-mt-[calc(var(--spacing-nav)+1rem)]";
const UNDER_NAV_EYEBROW =
  "scroll-mt-[calc(var(--spacing-nav)+2rem+var(--text-small)*var(--text-small--line-height))]";

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
  /** Override the default bottom margin where a section owns its own rhythm
   * (the partner ribbons sit tight under the map counters). */
  className?: string;
};

/**
 * Section top: numbered mono eyebrow ("01 / Next race") with a 4px ink
 * index marker, tight display title, optional lead and right-aligned action.
 * Below desktop the gap under it is 2rem, not 3rem, and the action takes the
 * full row under md (the /research search box fills the column).
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
  className = "",
}: SectionHeaderProps) {
  const ink = on === "ink";
  const titleSize = size === "s" ? "text-lead font-semibold" : "text-display-m font-semibold";
  return (
    <header className={`${size === "s" ? "mb-8" : "mb-8 desktop:mb-12"} flex flex-wrap items-end justify-between gap-6 ${className}`}>
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
          className={`font-display ${titleSize} ${ink ? "text-text-on-ink" : "text-text-strong"} ${index || eyebrow ? UNDER_NAV_EYEBROW : UNDER_NAV}`}
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
      {action && <div className="min-w-0 max-w-full max-md:w-full">{action}</div>}
    </header>
  );
}
