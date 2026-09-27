import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Section from "../ui/Section";
import { LINK, TAP } from "./learnStyles";

export type Crumb = { label: string; href?: string; current?: boolean };

type LearnHeaderProps = {
  id: string;
  crumbs: Crumb[];
  title: string;
  lead?: ReactNode;
  /** A mono line under the lead (the course page's weeks, modules, labs). */
  meta?: ReactNode;
  /** The buttons: one primary, one ghost. */
  actions?: ReactNode;
  /** The right-hand column from md (the catalog's ledger). */
  aside?: ReactNode;
};

/**
 * The page top the three course pages share, on paper like /research: a mono
 * crumb trail with the 4px ink marker, the one h1, a lead under 60ch, the
 * actions, and an optional ledger beside it from lg (under it before). On a phone it starts a rem
 * under the bar, like the /research and /about heroes.
 */
export default function LearnHeader({ id, crumbs, title, lead, meta, actions, aside }: LearnHeaderProps) {
  return (
    <Section width="page" className="compact:pt-4" aria-labelledby={id}>
      {/* The split waits for lg: at 768 a five-column ledger squeezed
          "3,500+" into "90+" (the numbers stack under the copy until then). */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-10">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-1 shrink-0 bg-ink-950" />
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small text-text-muted">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {c.href ? (
                    <Link to={c.href} className={`${LINK} decoration-ink-950/20 ${TAP}`}>
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current={c.current ? "page" : undefined}>{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 id={id} className="max-w-[18ch] font-display text-display-xl font-semibold text-text-strong">
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-[60ch] text-lead text-text-body">{lead}</p>}
          {meta && <div className="mt-5">{meta}</div>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div>}
        </div>
        {aside && <div className="lg:col-span-5 lg:col-start-8">{aside}</div>}
      </div>
    </Section>
  );
}
