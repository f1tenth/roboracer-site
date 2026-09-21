import type { ReactNode } from "react";

type EventCardProps = {
  title: string;
  dates?: string;
  location?: string;
  href: string;
  variant: "upcoming" | "past";
  on?: "paper" | "ink";
  media?: ReactNode;
};

/**
 * Hairline event card: 1px rule border, 4px radius, mono status and meta.
 * On ink it drops the panel entirely - a top rule, type, and media only.
 */
export default function EventCard({
  title,
  dates,
  location,
  href,
  variant,
  on = "paper",
  media,
}: EventCardProps) {
  const ink = on === "ink";
  const status = (
    <span
      className={`font-mono text-small ${
        variant === "upcoming" ? "text-rr-magenta-deep" : ink ? "text-text-on-ink-muted" : "text-text-muted"
      } ${ink && variant === "upcoming" ? "!text-rr-magenta-bright" : ""}`}
    >
      {variant === "upcoming" ? "upcoming" : "past"}
    </span>
  );
  const meta = [dates, location].filter(Boolean).join(" · ");
  return (
    <article
      className={
        ink
          ? "flex h-full flex-col border-t border-text-on-ink/15 pt-5"
          : "flex h-full flex-col overflow-hidden rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30"
      }
    >
      {media}
      <div className={`flex grow flex-col gap-3 ${ink ? "" : "p-6"}`}>
        {status}
        <h3 className={`font-display text-lg font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
          {title}
        </h3>
        {meta && <p className={`font-mono text-small ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>{meta}</p>}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto w-fit pt-2 text-small font-semibold underline underline-offset-4 decoration-rr-magenta hover:decoration-2 ${ink ? "text-text-on-ink" : "text-text-strong"}`}
        >
          {variant === "upcoming" ? "Details and registration" : "Event site"}
        </a>
      </div>
    </article>
  );
}
