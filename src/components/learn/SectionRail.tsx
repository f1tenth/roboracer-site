import { useEffect, useRef, useState, type MouseEvent } from "react";
import { REDUCED_MOTION_QUERY } from "../../lib/motion";

export type RailItem = {
  /** The section heading's id (SectionHeader `id`); its <section> is found by aria-labelledby. */
  id: string;
  index: string;
  label: string;
};

/**
 * A sense of place on the long teach page (COURSES_INTERACTIVITY.md item 7):
 * from lg a slim bar under the nav lists the page's sections with their mono
 * numbers; the one under the reading line carries the 4px index marker in
 * violet and the nav's 2px underline. Hidden below lg, where the page is one
 * column and the section eyebrows do the job. The current section comes from
 * an IntersectionObserver on a band at a third of the window, so nothing runs
 * on scroll. A click scrolls the section's header in under the bar (smooth
 * unless the reader asked for reduced motion) and moves focus to its heading;
 * the URL is left alone, so the plan builder's ?modules= stays as it is.
 */
export default function SectionRail({ items, label }: { items: RailItem[]; label: string }) {
  const [current, setCurrent] = useState<string | null>(null);
  const railRef = useRef<HTMLElement>(null);
  // A string, so the page re-rendering with a new array (every builder tick)
  // does not tear the observer down.
  const ids = items.map((i) => i.id).join(" ");

  useEffect(() => {
    const order = ids.split(" ");
    const sections = order
      .map((id) => document.querySelector<HTMLElement>(`section[aria-labelledby="${id}"]`))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.getAttribute("aria-labelledby") ?? "";
          if (e.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = order.find((id) => visible.has(id));
        // Above the first section (the photo header) nothing is current;
        // between the last and the footer the last one stays.
        if (first) setCurrent(first);
        else if (sections[0] && sections[0].getBoundingClientRect().top > window.innerHeight * 0.33) setCurrent(null);
      },
      { rootMargin: "-33% 0px -62% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    e.preventDefault();
    const target = heading.closest("header") ?? heading;
    const under = railRef.current?.getBoundingClientRect().bottom ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - under - 24;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    setCurrent(id);
  };

  return (
    <nav
      ref={railRef}
      aria-label={label}
      className="sticky top-nav z-30 hidden h-[var(--rail-h)] border-b border-ink-950/10 bg-paper-50/95 lg:block"
    >
      <ol className="mx-auto flex h-full max-w-page items-stretch gap-x-6 overflow-x-auto px-6 [scrollbar-width:none] xl:gap-x-9">
        {items.map((it) => {
          const on = it.id === current;
          return (
            <li key={it.id} className="flex">
              <a
                href={`#${it.id}`}
                onClick={(e) => go(e, it.id)}
                aria-current={on ? "location" : undefined}
                className={`flex items-center gap-2 border-b-2 pt-0.5 font-mono text-small whitespace-nowrap transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
                  on ? "border-rr-violet text-rr-violet-deep" : "border-transparent text-text-body hover:text-text-strong"
                }`}
              >
                <span aria-hidden="true" className={`h-1 w-1 shrink-0 ${on ? "bg-rr-violet" : "bg-ink-950/25"}`} />
                <span className="tabular-nums">{it.index}</span>
                <span>{it.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
