/** Button styling shared by Button and SocialButton. Lives outside the
 * component file so fast refresh keeps working (react-refresh/only-export-components). */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-6 py-3 text-body",
  lg: "px-8 py-4 text-body",
};

export function classesFor(variant: ButtonVariant, on: "paper" | "ink"): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-btn font-sans font-semibold transition-colors duration-[var(--duration-fast)]";
  if (variant === "primary") {
    // Solid violet, identical on ink and paper; hover only darkens the fill.
    // No glow, no shadow, no translate (accent decision 2026-08-21).
    return `${base} bg-rr-violet text-white hover:bg-rr-violet-deep${on === "ink" ? " focus-visible:outline-text-on-ink" : ""}`;
  }
  if (variant === "secondary") {
    return on === "ink"
      ? `${base} border border-text-on-ink/25 text-text-on-ink hover:border-text-on-ink/60 focus-visible:outline-text-on-ink`
      : `${base} border border-ink-950/20 text-text-strong hover:border-ink-950/50`;
  }
  // Ghost = the site-wide link contract: ink text, hairline underline, hover
  // switches only the underline to violet.
  return on === "ink"
    ? `${base} text-text-on-ink underline underline-offset-4 decoration-text-on-ink/30 hover:decoration-rr-violet hover:decoration-2 focus-visible:outline-text-on-ink`
    : `${base} text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2`;
}


/** The full class list without the element, for the rare link that must stay
 * a plain anchor (SocialButton's `soon` placeholder: href="#", aria-disabled). */
export function buttonClasses(variant: ButtonVariant, on: "paper" | "ink", size: ButtonSize): string {
  return `${classesFor(variant, on)} ${SIZE[size]}`;
}
