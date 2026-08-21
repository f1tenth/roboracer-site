import type { ReactNode } from "react";

export type SectionVariant = "ink" | "paper";
export type SectionWidth = "content" | "wide" | "bleed";

type SectionProps = {
  variant?: SectionVariant;
  width?: SectionWidth;
  /** Tighter padding band for supporting rows (stats, marquee). */
  tight?: boolean;
  /** Deepest surface: ink-950 / paper-100 instead of the defaults. */
  edge?: boolean;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

const SURFACE: Record<SectionVariant, { base: string; edge: string }> = {
  ink: { base: "bg-ink-900 text-text-on-ink-muted", edge: "bg-ink-950 text-text-on-ink-muted" },
  paper: { base: "bg-paper-50 text-text-body", edge: "bg-paper-100 text-text-body" },
};

const WIDTH: Record<SectionWidth, string> = {
  content: "mx-auto max-w-content px-6",
  wide: "mx-auto max-w-wide px-6",
  bleed: "",
};

/** Owns section rhythm and surface so pages never hand-roll either. */
export default function Section({
  variant = "paper",
  width = "content",
  tight = false,
  edge = false,
  id,
  className = "",
  children,
  ...aria
}: SectionProps) {
  const surface = SURFACE[variant][edge ? "edge" : "base"];
  const pad = tight ? "py-section-tight" : "py-section";
  return (
    <section id={id} data-variant={variant} className={`${surface} ${pad} ${className}`} {...aria}>
      <div className={WIDTH[width]}>{children}</div>
    </section>
  );
}
