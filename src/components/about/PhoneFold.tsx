import type { ReactNode } from "react";

/**
 * A phone-only disclosure (below sm): one native <details> whose summary is
 * a label built from the data, behind the /research fold's chevron. It opens
 * without JavaScript, from the keyboard, and to find-in-page. The caller
 * shows the same content in place from sm, so this renders nothing there
 * (mobile pass, ABOUT-02).
 */
export default function PhoneFold({
  label,
  className = "",
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <details className={`group sm:hidden ${className}`}>
      <summary className="flex cursor-pointer list-none items-baseline gap-x-3 py-6 text-text-strong transition-colors hover:text-rr-violet [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="inline-block font-display text-display-m leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90 motion-reduce:transition-none"
        >
          &#8250;
        </span>
        <span className="font-mono text-small">{label}</span>
      </summary>
      {children}
    </details>
  );
}
