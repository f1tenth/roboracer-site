import { useEffect, useState, type MouseEvent } from "react";
import { REDUCED_MOTION_QUERY } from "../../../lib/motion";

export type TocItem = { id: string; label: string };

/**
 * "On this page": from xl a slim column beside the text lists the page's
 * sections; the one under the reading line (an IntersectionObserver band near
 * the top of the window, so nothing runs on scroll) carries the violet
 * marker. Hidden below xl, where the page is one column and the section
 * numbers do the job. A click scrolls the heading in under the nav and moves
 * focus to it.
 */
export default function DocsToc({ items }: { items: TocItem[] }) {
  const [current, setCurrent] = useState<string | null>(items[0]?.id ?? null);
  const ids = items.map((i) => i.id).join(" ");

  useEffect(() => {
    const order = ids.split(" ");
    const els = order.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setCurrent(first);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    e.preventDefault();
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    heading.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    setCurrent(id);
  };

  if (items.length < 2) return null;
  return (
    <nav
      aria-label="On this page"
      className="sticky top-[calc(var(--spacing-nav)+1.5rem)] hidden self-start xl:block"
    >
      <p className="mb-3 text-eyebrow font-semibold uppercase tracking-[0.12em] text-text-muted">On this page</p>
      <ol className="border-l border-ink-950/10">
        {items.map((it) => {
          const on = it.id === current;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => go(e, it.id)}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-small transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
                  on
                    ? "border-rr-violet font-semibold text-text-strong"
                    : "border-transparent text-text-body hover:text-text-strong"
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
