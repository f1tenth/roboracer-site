import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UNDER_NAV, LINK } from "../learnStyles";
import DocsToc, { type TocItem } from "./DocsToc";

export type DocCrumb = { label: string; href?: string };

/** The reading frame every docs page shares: the page's text, then the
 * "On this page" column beside it from xl. */
export function DocPage({ toc, children }: { toc: TocItem[]; children: ReactNode }) {
  return (
    <div className="grid gap-x-12 xl:grid-cols-[minmax(0,1fr)_12.5rem]">
      <div className="min-w-0">{children}</div>
      <DocsToc items={toc} />
    </div>
  );
}

/** Page top: mono breadcrumb with the 4px ink marker, the one h1, a lead. */
export function DocHeader({
  crumbs,
  title,
  lead,
  children,
}: {
  crumbs: DocCrumb[];
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-ink-950/10 pb-10 desktop:pb-14">
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-muted">
          {crumbs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? (
                <Link to={c.href} className={`${LINK} decoration-ink-950/20`}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="font-display text-display-l font-semibold text-text-strong">{title}</h1>
      {lead && <p className="mt-6 max-w-[80ch] text-lead text-text-body">{lead}</p>}
      {children}
    </header>
  );
}

/** A numbered section: mono index, display-s heading, hairline below. */
export function DocSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-b border-ink-950/10 py-10 last:border-b-0 desktop:py-14">
      <h2 id={id} className={`font-display text-display-s font-semibold text-text-strong ${UNDER_NAV}`}>
        {title}
      </h2>
      {lead && <p className="mt-3 max-w-[62ch] text-body text-text-body">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** A 16:9 embed (YouTube or Google Slides), lazy, with a caption row. */
export function Embed({ src, title, caption }: { src: string; title: string; caption?: ReactNode }) {
  return (
    <figure>
      <div className="aspect-video w-full overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="h-full w-full border-none"
        />
      </div>
      {caption && <figcaption className="mt-3 text-small text-text-muted">{caption}</figcaption>}
    </figure>
  );
}

/** The facts of a page in one bordered row, under a thin logo-gradient rule. */
export function Glance({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="rule-card mt-10">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 p-6 pt-7 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {items.map((it) => (
          <div key={it.label}>
            <dt className="text-small text-text-muted">{it.label}</dt>
            <dd className="mt-1 text-body font-semibold text-text-strong">{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
