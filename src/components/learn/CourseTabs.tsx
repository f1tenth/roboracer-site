import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { DURATION, MOTION_OK_QUERY, ScrollTrigger } from "../../lib/motion";

export type CourseTab = {
  /** The hash that opens the tab (#outline) and the stem of its element ids. */
  id: string;
  label: string;
  /** An ink-stroke glyph before the label (aria-hidden by the caller). */
  icon?: ReactNode;
  /** A mono count after the label: the number shows in a pill, the noun is
   * for screen readers ("Outline, 2 modules"). Only counts the data holds. */
  count?: { value: number; noun: string };
  panel: ReactNode;
};

type CourseTabsProps = {
  tabs: CourseTab[];
  /** The tablist's accessible name. */
  label: string;
};

/** The tab a URL hash names, else the first. The ids never match an element
 * on the page, so the browser has nothing to scroll to on a cold deep link. */
function fromHash(hash: string, tabs: CourseTab[]): string {
  let id = "";
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    // A malformed fragment (#%) opens the first tab rather than throwing.
  }
  return tabs.some((t) => t.id === id) ? id : tabs[0].id;
}

const tabId = (id: string) => `course-tab-${id}`;
const panelId = (id: string) => `course-panel-${id}`;

/**
 * The course page's sections as WAI-ARIA tabs (the pattern's automatic
 * activation): one panel at a time, so the page is about one screen tall
 * instead of a 3,000 px document. Arrow keys, Home and End move between tabs;
 * only the selected tab is in the Tab order (roving tabindex), and Tab from it
 * goes into its panel.
 *
 * The hash is the state a link can carry: /learn/courses/penn#outline opens
 * Outline. A cold load or a router navigation reads it; a click writes it with
 * history.replaceState, so tabs never add history entries and never scroll.
 * Nothing on the page has the tab's bare id, so the browser's own fragment
 * jump finds no target, and useRouteScroll still opens the route at its top:
 * a deep link lands with the header in view.
 *
 * From lg the tab bar sticks under the nav. Switching while it is stuck keeps
 * it where it is and shows the new panel from its top (the panels reserve a
 * window's height so a short one cannot pull the bar down). Below lg it is a
 * row that scrolls sideways and never wraps.
 */
export default function CourseTabs({ tabs, label }: CourseTabsProps) {
  const location = useLocation();
  // A click is remembered against the history entry it was made on: a new
  // navigation (another course, a link to #outline, Back to another entry)
  // reads its own hash instead. Keyed rather than reset in an effect, so the
  // first paint after a navigation already shows the right panel.
  const [picked, setPicked] = useState<{ key: string; id: string } | null>(null);
  const selected =
    picked && picked.key === location.key && tabs.some((t) => t.id === picked.id)
      ? picked.id
      : fromHash(location.hash, tabs);

  const barRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Set by a reader's choice, read once by the layout effect below. */
  const chosen = useRef<{ stuck: boolean } | null>(null);

  const choose = (id: string) => {
    if (id === selected) return;
    const bar = barRef.current;
    const panels = panelsRef.current;
    // Stuck = the panel has scrolled up under the bar (only possible from lg,
    // where the bar is sticky).
    const stuck = !!bar && !!panels && panels.getBoundingClientRect().top < bar.getBoundingClientRect().bottom - 1;
    chosen.current = { stuck };
    setPicked({ key: location.key, id });
    try {
      // Keep React Router's entry state (its key) and the search string.
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${id}`);
    } catch {
      // A sandboxed frame can refuse replaceState; the tab still switches.
    }
  };

  useLayoutEffect(() => {
    const choice = chosen.current;
    chosen.current = null;
    const bar = barRef.current;
    const panels = panelsRef.current;
    const row = rowRef.current;
    if (!choice || !bar || !panels) return;

    if (choice.stuck) {
      // Room for the bar to stay stuck whatever the new panel's length, then
      // the panel's top to the bar's bottom edge. Instant: the bar does not
      // move, only what is under it changes.
      const barBottom = bar.getBoundingClientRect().bottom;
      panels.style.minHeight = `${Math.max(0, window.innerHeight - barBottom)}px`;
      const delta = panels.getBoundingClientRect().top - barBottom;
      ScrollTrigger.getScrollFunc(window)(window.scrollY + delta);
    } else {
      panels.style.minHeight = "";
    }

    // The chosen tab fully in view inside the sideways row (390).
    const tab = tabRefs.current[tabs.findIndex((t) => t.id === selected)];
    if (row && tab && row.scrollWidth > row.clientWidth) {
      const left = tab.offsetLeft - row.offsetLeft;
      if (left < row.scrollLeft) row.scrollLeft = left;
      else if (left + tab.offsetWidth > row.scrollLeft + row.clientWidth) {
        row.scrollLeft = left + tab.offsetWidth - row.clientWidth;
      }
    }

    // The Micro pattern's opacity step on the new panel; instant under
    // reduced motion.
    const panel = document.getElementById(panelId(selected));
    if (panel && typeof panel.animate === "function" && window.matchMedia(MOTION_OK_QUERY).matches) {
      panel.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DURATION.fast * 1000,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    }
  }, [selected, tabs]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === selected);
    let next: number;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    choose(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      {/* Paper behind the stuck bar so the panel scrolls under it, not
          through it. Below lg the row bleeds to the window's edges, so a
          label cut by the edge reads as "there is more this way". */}
      <div ref={barRef} className="relative z-10 -mx-6 border-b border-ink-950/10 bg-paper-50 lg:sticky lg:top-nav lg:mx-0">
        <div
          ref={rowRef}
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="flex gap-x-1 overflow-x-auto px-6 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t, i) => {
            const on = t.id === selected;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={tabId(t.id)}
                aria-selected={on}
                aria-controls={panelId(t.id)}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(t.id)}
                className={[
                  // The nav link's 2px underline (index.css .nav-link), in
                  // violet for the current tab; the others get a violet tint
                  // and the underline scaled in on hover.
                  "group relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-btn px-3 py-3 font-mono text-small transition-colors duration-[var(--duration-fast)] md:text-body",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-rr-violet after:transition-transform after:duration-[var(--duration-fast)] after:ease-[var(--ease-out-expo)] motion-reduce:transition-none motion-reduce:after:transition-none",
                  // Inset ring: the row clips anything drawn outside a tab.
                  "focus-visible:outline-offset-[-2px]",
                  on
                    ? "bg-rr-violet/[0.07] font-semibold text-rr-violet after:scale-x-100"
                    : "text-text-muted after:scale-x-0 hover:bg-rr-violet/5 hover:text-text-strong hover:after:scale-x-100",
                ].join(" ")}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.count && (
                  <span
                    className={`rounded-pill px-2 text-small leading-5 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
                      on ? "bg-rr-violet text-white" : "bg-ink-950/[0.06] text-text-muted group-hover:bg-rr-violet/10 group-hover:text-rr-violet-deep"
                    }`}
                  >
                    {t.count.value}
                    <span className="sr-only">{` ${t.count.noun}`}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={panelsRef}>
        {tabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={panelId(t.id)}
            aria-labelledby={tabId(t.id)}
            hidden={t.id !== selected}
            // In the Tab order after its tab (the APG pattern): the first
            // stop inside a panel can be several lines down.
            tabIndex={0}
            className="pt-8 focus-visible:outline-offset-4 lg:pt-10"
          >
            {t.panel}
          </div>
        ))}
      </div>
    </div>
  );
}
