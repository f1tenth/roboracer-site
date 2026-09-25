import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPaths, type EntryPath } from "../../lib/data";
import { START_ID } from "../../lib/wayfinding";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

/** The row is drawn for four paths (Cedric: "at most four"). */
const MAX_PATHS = 4;

/**
 * Hairlines and gutters per position, so the first column's text sits on the
 * page edge like every section header above it: one column under md, a 2x2
 * grid from md, one row of four from xl. Literal strings for Tailwind.
 */
const CELL = [
  { rule: "md:border-r", pad: "md:pr-6" },
  { rule: "xl:border-r", pad: "md:pl-6 xl:pr-6" },
  { rule: "md:border-r", pad: "md:pr-6 xl:pl-6" },
  { rule: "", pad: "md:pl-6" },
] as const;

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** Stroke arrow in the label's colour: right for a page on this site, up and
 * out for anything that leaves it (a mail client, another site). */
function Arrow({ out }: { out: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-[0.55em] w-[0.55em] shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
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

function PathLink({ path, pad }: { path: EntryPath; pad: string }) {
  const out = isExternal(path.href);
  const lineId = `path-${path.id}-line`;
  // Phones: the index sits in a gutter on the label's baseline and the line
  // hangs under the label, a table-of-contents row. From md the index stacks
  // above the label.
  const className = `group grid h-full grid-cols-[2.25rem_1fr] items-baseline py-4 md:flex md:flex-col md:py-6 xl:py-8 ${pad}`;
  const body = (
    <>
      <span aria-hidden="true" className="font-mono text-small text-text-muted">
        {path.n}
      </span>
      <span className="flex items-center gap-3 font-display text-display-m font-semibold text-text-strong md:mt-2">
        {/* The site's link contract at display size: a hairline underline at
            rest that turns violet and 2px on hover or keyboard focus. */}
        <span className="underline decoration-ink-950/25 decoration-1 underline-offset-[0.14em] group-hover:decoration-rr-violet group-hover:decoration-2 group-focus-visible:decoration-rr-violet group-focus-visible:decoration-2">
          {path.label}
        </span>
        <Arrow out={out} />
      </span>
      <span id={lineId} className="col-start-2 mt-2 block max-w-[36ch] text-body text-text-body md:mt-3">
        {path.line}
      </span>
    </>
  );
  if (out) {
    const web = !path.href.startsWith("mailto:");
    return (
      <a
        href={path.href}
        aria-describedby={lineId}
        className={className}
        {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }
  return (
    <Link to={path.href} aria-describedby={lineId} className={className}>
      {body}
    </Link>
  );
}

/**
 * Landing, right under the hero: the four ways in (Cedric, 2026-09-24: "get
 * newbies or sponsors to what they want fast"). Serves the newbie and the
 * interested beginner (build, learn), the competitor (race) and the sponsor.
 * Big verb-first text links on hairlines, not cards; the nav's violet "Start
 * here" button lands here from any route (lib/wayfinding). No scroll motion:
 * the only movement is the arrow's nudge on hover, and reduced motion drops
 * that too. Content is public/data/paths.json.
 */
export default function EntryPaths() {
  const [paths, setPaths] = useState<EntryPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    loadPaths()
      .then((f) => {
        if (live) setPaths(f.paths.slice(0, MAX_PATHS));
      })
      .catch(() => {
        if (live) setPaths([]);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    // Top padding clears the fixed nav (4.5rem under lg) when the "Start
    // here" button scrolls this section to the top of the window. The bottom
    // is short: Highlights opens with its own rule and padding right after.
    <Section
      tight
      width="page"
      id={START_ID}
      aria-labelledby="start-title"
      className="pt-24! pb-12! focus:outline-none lg:pt-section-tight!"
    >
      <SectionHeader index="00" id="start-title" title="Start here" size="s" />
      {/* aria-busy until the paths arrive: the "Start here" jump waits for it
          (hooks/useScrollToHash), so nothing below shifts under the reader. */}
      <ul aria-busy={loading} className="grid border-t border-ink-950/10 md:grid-cols-2 xl:grid-cols-4">
        {paths.map((path, i) => {
          const cell = CELL[i] ?? CELL[CELL.length - 1];
          return (
            <li key={path.id} data-path={path.id} className={`border-b border-ink-950/10 ${cell.rule}`}>
              <PathLink path={path} pad={cell.pad} />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
