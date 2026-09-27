import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LINK, isExternal } from "./learnStyles";

/** Stroke arrow in the link's colour: right for a page on this site, up and
 * out for anything that leaves it (StartHere's pair). */
export function Arrow({ out }: { out: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="ml-1.5 inline-block h-[0.75em] w-[0.75em] shrink-0 align-[-0.05em]"
    >
      <path
        d={out ? "M4.5 11.5l7-7M6 4.5h5.5V10" : "M2.5 8h11M9 3.5 13.5 8 9 12.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The chevron every fold on the course pages turns (the /research fold). */
export function FoldChevron() {
  return (
    <span
      aria-hidden="true"
      className="inline-block font-display text-display-s leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90 motion-reduce:transition-none"
    >
      &#8250;
    </span>
  );
}

/** An ink stroke tick for "What you'll learn" (never an emoji). */
export function CheckMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="mt-[0.3em] h-[1em] w-[1em] shrink-0 text-text-strong"
    >
      <path d="M2.5 8.5 6.5 12.5 13.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type LearnLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Draw the arrow after the label (default). */
  arrow?: boolean;
};

/**
 * A text link on the course pages. A route on this site is a router Link; a
 * web address opens in a new tab (the /research and /learn convention) and
 * says so to a screen reader; a mailto opens the mail client. The last word
 * and the arrow never part across a line break.
 */
export default function LearnLink({ href, children, className = "", arrow = true }: LearnLinkProps) {
  const out = isExternal(href);
  const web = out && !href.startsWith("mailto:");
  const label =
    arrow && typeof children === "string" ? (
      <>
        {children.slice(0, children.lastIndexOf(" ") + 1)}
        <span className="whitespace-nowrap">
          {children.slice(children.lastIndexOf(" ") + 1)}
          <Arrow out={out} />
        </span>
      </>
    ) : (
      <>
        {children}
        {arrow && <Arrow out={out} />}
      </>
    );
  const cls = `${LINK} ${className}`;
  if (!out) {
    return (
      <Link to={href} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {label}
      {web && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/** Plain copy with one address in it turned into a mailto link (the FAQ
 * answers name contact@roboracer.ai in their text). */
export function WithEmail({ text, email }: { text: string; email: string }) {
  const at = text.indexOf(email);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <a href={`mailto:${email}`} className={LINK}>
        {email}
      </a>
      {text.slice(at + email.length)}
    </>
  );
}
