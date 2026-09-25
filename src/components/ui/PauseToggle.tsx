type PauseToggleProps = {
  paused: boolean;
  onToggle: () => void;
  /** Id of the strip group it pauses. */
  controls: string;
  className?: string;
};

/**
 * The touch stand-in for "pause on hover" on a moving strip (WCAG 2.2.2,
 * mobile pass LANDING-14): a 2.75rem mono control that reads "Pause" while
 * the strip moves and "Play" once it holds still. The strip group carries
 * `data-marquee-paused`, which the unlayered marquee rule in index.css
 * respects. Shown on touch screens only (coarse:), where hover never
 * happens; a mouse still pauses a strip by hovering it. The label itself
 * changes, so the button is a plain button rather than an aria-pressed
 * toggle (a pressed "Play" would read as playing).
 */
export default function PauseToggle({ paused, onToggle, controls, className = "" }: PauseToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-controls={controls}
      className={`hidden min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-card border border-ink-950/15 px-3 font-mono text-small text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30 coarse:inline-flex ${className}`}
    >
      {paused ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4.5 2.5v9l7-4.5-7-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4.75 2.5v9M9.25 2.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {paused ? "Play" : "Pause"}
    </button>
  );
}
