import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { DocsNavItem, LearnDocsFile } from "../../../lib/data";
import { moduleOfPath } from "./docsFormat";

const EYEBROW = "mb-2 px-3 text-eyebrow font-semibold uppercase tracking-[0.12em] text-text-muted";
const ROW =
  "flex items-baseline gap-3 rounded-btn px-3 py-1.5 text-small transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none";
const ROW_ON = "bg-rr-violet/10 font-semibold text-rr-violet-deep";
const ROW_OFF = "text-text-body hover:bg-paper-100 hover:text-text-strong";
const CHIP =
  "flex h-9 min-w-9 items-center justify-center rounded-btn border text-small font-semibold transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none";

const matches = (it: DocsNavItem, pathname: string, folder: boolean) =>
  it.to === "/learn-new"
    ? pathname === it.to
    : pathname === it.to || (folder && it.to.endsWith("/index") && pathname.startsWith(it.to.slice(0, -"index".length)));

function Row({ it, pathname, folder }: { it: DocsNavItem; pathname: string; folder?: boolean }) {
  const active = matches(it, pathname, !!folder);
  return (
    <Link to={it.to} aria-current={active ? "page" : undefined} className={`${ROW} ${active ? ROW_ON : ROW_OFF}`}>
      {it.title}
    </Link>
  );
}

/** One lecture (or tutorial) of the open module: its number, then its name. */
function LectureRow({ it, pathname, sub }: { it: DocsNavItem; pathname: string; sub?: boolean }) {
  const active = pathname === it.to;
  const label = it.kind === "tutorial" ? `T${it.num}` : it.num;
  return (
    <Link
      to={it.to}
      aria-current={active ? "page" : undefined}
      className={`${ROW} ${sub ? "ml-6 py-1" : ""} ${active ? ROW_ON : ROW_OFF}`}
    >
      <span
        aria-hidden="true"
        className={`w-6 shrink-0 text-right text-eyebrow font-bold tabular-nums ${active ? "text-rr-violet-deep" : "text-text-muted"}`}
      >
        {label}
      </span>
      <span>
        <span className="sr-only">{it.kind === "tutorial" ? `Tutorial ${it.num}: ` : `Lecture ${it.num}: `}</span>
        {it.title}
        {it.optional && <span className="text-text-muted"> (optional)</span>}
      </span>
    </Link>
  );
}

/**
 * The side panel. The docs' own groups run down it as plain links. Modules are
 * a row of letter chips; the module you are in (Module A when you are not in
 * one) lists its lectures and tutorials by name right under the chips, always
 * visible, nothing to open. Below lg it sits behind a "Course menu" button.
 */
export default function DocsRail({ docs }: { docs: LearnDocsFile }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const inModule = moduleOfPath(pathname, docs);
  const selected = inModule ?? "A";

  return (
    <nav
      aria-label="Course docs"
      className="lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)] lg:max-h-[calc(100svh-var(--spacing-nav)-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="docs-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center justify-between rounded-btn border border-ink-950/20 px-4 text-small font-semibold text-text-strong lg:hidden"
      >
        Course menu
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      <div id="docs-menu" className={`${open ? "mt-4 block" : "hidden"} space-y-6 lg:mt-0 lg:block`}>
        {docs.nav.map((g) => {
          if (g.group !== "Modules") {
            return (
              <div key={g.group}>
                <p className={EYEBROW}>{g.group}</p>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <Row it={it} pathname={pathname} folder={g.group === "Assignments"} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          const mod = g.items.find((m) => m.id === selected) ?? g.items[0];
          return (
            <div key={g.group}>
              <p className={EYEBROW}>{g.group}</p>
              <ul className="mb-4 flex flex-wrap gap-1.5 px-3">
                {g.items.map((m) => {
                  const on = m.id === mod.id;
                  return (
                    <li key={m.id}>
                      <Link
                        to={m.to}
                        aria-label={`Module ${m.id}: ${m.title}`}
                        aria-current={pathname === m.to ? "page" : undefined}
                        className={`${CHIP} ${
                          on
                            ? "border-rr-violet bg-rr-violet text-white"
                            : "border-ink-950/15 text-text-strong hover:border-rr-violet hover:text-rr-violet-deep"
                        }`}
                      >
                        {m.id}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                to={mod.to}
                aria-current={pathname === mod.to ? "page" : undefined}
                className={`${ROW} ${pathname === mod.to ? ROW_ON : "font-semibold text-text-strong hover:bg-paper-100"}`}
              >
                Module {mod.id}: {mod.title}
              </Link>
              <ul aria-label={`Module ${mod.id} lectures`} className="mt-0.5 space-y-0.5 border-l border-ink-950/10 ml-5">
                {mod.children?.map((c) => (
                  <li key={c.to}>
                    <LectureRow it={c} pathname={pathname} />
                    {c.children && c.children.length > 0 && (
                      <ul className="space-y-0.5">
                        {c.children.map((t) => (
                          <li key={t.to}>
                            <LectureRow it={t} pathname={pathname} sub />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
