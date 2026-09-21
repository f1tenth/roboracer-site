import type { ReactNode } from "react";

export type SectionVariant = "paper" | "ink";
export type SectionWidth = "content" | "wide" | "page" | "bleed";

type SectionProps = {
  /** Paper is the default surface; ink is reserved for the hero, the car
   * chapter, and the footer (sharpen direction, 2026-08-21). */
  variant?: SectionVariant;
  width?: SectionWidth;
  tight?: boolean;
  /** Alternate surface tint: paper-100 / ink-950. */
  edge?: boolean;
  /** Hairline 12-column guides on wide sections, desktop only. */
  guides?: boolean;
  /** 1px top rule closing the section against the previous one. */
  rule?: boolean;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

const SURFACE: Record<SectionVariant, { base: string; edge: string }> = {
  paper: { base: "bg-paper-50 text-text-body", edge: "bg-paper-100 text-text-body" },
  ink: { base: "bg-ink-900 text-text-on-ink-muted", edge: "bg-ink-950 text-text-on-ink-muted" },
};

const WIDTH: Record<SectionWidth, string> = {
  content: "mx-auto max-w-content px-6",
  wide: "mx-auto max-w-wide px-6",
  /** The landing's shared container (1800px); see --container-page. */
  page: "mx-auto max-w-page px-6",
  bleed: "",
};

export default function Section({
  variant = "paper",
  width = "content",
  tight = false,
  edge = false,
  guides = false,
  rule = false,
  id,
  className = "",
  children,
  ...aria
}: SectionProps) {
  const surface = SURFACE[variant][edge ? "edge" : "base"];
  const pad = tight ? "py-section-tight" : "py-section";
  const topRule = rule ? (variant === "ink" ? "border-t border-text-on-ink/10" : "border-t border-ink-950/10") : "";
  return (
    <section
      id={id}
      data-variant={variant}
      className={`relative ${surface} ${pad} ${topRule} ${className}`}
      {...aria}
    >
      {guides && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mx-auto hidden max-w-page grid-cols-12 gap-x-6 px-6 md:grid"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={i === 0 ? "" : "border-l border-ink-950/5"} />
          ))}
        </div>
      )}
      <div className={`relative ${WIDTH[width]}`}>{children}</div>
    </section>
  );
}
