import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  /** primary = THE one solid violet CTA of its viewport (accent-as-fill is
   * rationed to one per viewport; everything else is hairline or underline). */
  variant?: ButtonVariant;
  size?: ButtonSize;
  on?: "paper" | "ink";
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-6 py-3 text-body",
  lg: "px-8 py-4 text-body",
};

function classesFor(variant: ButtonVariant, on: "paper" | "ink"): string {
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

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", on = "paper", className = "", children, ...rest } = props;
  const cls = `${classesFor(variant, on)} ${SIZE[size]} ${className}`;

  if (typeof props.href === "string") {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
    if (external) {
      return (
        <a href={href} className={cls} {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={cls} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonRest.type ?? "button"} className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
