import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "../ui/buttonStyles";

/**
 * The way in to the post writer from /news: a small note in the lower right
 * corner that stays with the reader down the page until they close it
 * (Cedric, 2026-11-17: like a notification, clear, in the RoboRacer colours,
 * not in the way). The logo gradient is its top rule, the button is the
 * site's violet.
 *
 * It steps aside when the footer comes into view, whose own links sit in the
 * same corner, and it rises into place once on arrival (not at all under
 * reduced motion). Closing it is remembered by the page that renders it.
 */
export default function WriteNudge({ onClose }: { onClose: () => void }) {
  const [arrived, setArrived] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setArrived(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const shown = arrived && !atFooter;

  return (
    <aside
      aria-label="Write your own post"
      inert={atFooter}
      className={`fixed bottom-4 right-4 z-40 w-[min(21rem,calc(100vw-2rem))] transition-[opacity,translate] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] motion-reduce:transition-none sm:bottom-6 sm:right-6 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-[0.75rem] border border-ink-950/10 bg-paper-50 shadow-card-hover">
        <div
          aria-hidden="true"
          className="h-1 bg-[linear-gradient(90deg,var(--color-rr-cyan),var(--color-rr-grad-start),var(--color-rr-grad-end))]"
        />
        <div className="flex items-start gap-3.5 p-4 pr-11">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-rr-violet/10 text-rr-violet max-sm:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 4.5l3 3L7 16H4v-3z" />
              <path d="M11 6l3 3" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="font-display text-[1.125rem] font-semibold leading-snug text-text-strong">Write your own post</p>
            <p className="mt-1 text-small text-text-body">Built or raced something? Tell the community here.</p>
            <Link to="/news/write" className={`${buttonClasses("primary", "paper", "sm")} mt-3 coarse:min-h-11`}>
              Start writing
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-1.5 top-2.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-btn text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-ink-950/[0.06] hover:text-text-strong coarse:h-11 coarse:w-11"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
