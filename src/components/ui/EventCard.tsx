import type { ReactNode } from "react";

type EventCardProps = {
  title: string;
  dates?: string;
  location?: string;
  href: string;
  variant: "upcoming" | "past";
  on?: "ink" | "paper";
  /** Optional media slot (MediaFrame); cards render fine without one. */
  media?: ReactNode;
};

const CHIP: Record<EventCardProps["variant"], { label: string; cls: string }> = {
  upcoming: { label: "Upcoming", cls: "bg-rr-magenta/15 text-rr-magenta-bright" },
  past: { label: "Past", cls: "bg-ink-700/40 text-text-on-ink-muted" },
};

/** Event card with a status chip; ink variant elevates by surface + border,
 * paper variant by shadow, per docs/DESIGN.md elevation rules. */
export default function EventCard({
  title,
  dates,
  location,
  href,
  variant,
  on = "ink",
  media,
}: EventCardProps) {
  const ink = on === "ink";
  const chip = CHIP[variant];
  const chipCls = ink
    ? chip.cls
    : variant === "upcoming"
      ? "bg-rr-magenta/15 text-rr-magenta-deep"
      : "bg-paper-200 text-text-muted";
  return (
    <article
      className={
        ink
          ? "flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-800"
          : "flex h-full flex-col overflow-hidden rounded-card bg-paper-50 shadow-card transition-shadow duration-[var(--duration-fast)] hover:shadow-card-hover"
      }
    >
      {media}
      <div className="flex grow flex-col gap-3 p-6">
        <span className={`eyebrow w-fit rounded-pill px-3 py-1.5 ${chipCls}`}>{chip.label}</span>
        <h3 className={`font-display text-lg font-semibold ${ink ? "text-text-on-ink" : "text-text-strong"}`}>
          {title}
        </h3>
        <p className={`text-small ${ink ? "text-text-on-ink-muted" : "text-text-muted"}`}>
          {[dates, location].filter(Boolean).join(" · ")}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`mt-auto w-fit text-small font-semibold underline underline-offset-4 decoration-rr-magenta hover:decoration-2 ${ink ? "text-text-on-ink" : "text-text-strong"}`}
        >
          {variant === "upcoming" ? "Details and registration" : "Event site"}
        </a>
      </div>
    </article>
  );
}
