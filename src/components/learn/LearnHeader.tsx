import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Section from "../ui/Section";
import { LINK, TAP } from "./learnStyles";

export type Crumb = { label: string; href?: string; current?: boolean };

/** A site photo behind the page top (the catalog's). */
export type HeaderMedia = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, to keep the photo's subject clear of the copy. */
  position?: string;
};

type LearnHeaderProps = {
  id: string;
  crumbs: Crumb[];
  /** A string on the course and teach pages; the catalog passes one phrase
   * wrapped in the gradient. */
  title: ReactNode;
  lead?: ReactNode;
  /** A mono line under the lead (the course page's weeks, modules, labs). */
  meta?: ReactNode;
  /** The buttons: one primary, one ghost. */
  actions?: ReactNode;
  /** The right-hand column from md (the catalog's ledger). */
  aside?: ReactNode;
  /** A photo under the copy: the top becomes a full-width ink band with a
   * scrim, the copy in on-ink colours (actions should pass on="ink"). */
  media?: HeaderMedia;
  /** With `media`: a row that overlaps the band's bottom edge (the catalog's
   * stat tiles). */
  overlap?: ReactNode;
};

function Crumbs({ crumbs, onInk }: { crumbs: Crumb[]; onInk: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2">
      <span aria-hidden="true" className={`h-1 w-1 shrink-0 ${onInk ? "bg-text-on-ink" : "bg-ink-950"}`} />
      <ol
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small ${
          onInk ? "text-text-on-ink-muted" : "text-text-muted"
        }`}
      >
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href ? (
              <Link
                to={c.href}
                className={
                  onInk
                    ? `text-text-on-ink underline decoration-text-on-ink/30 underline-offset-4 hover:decoration-rr-magenta-bright hover:decoration-2 focus-visible:outline-text-on-ink ${TAP}`
                    : `${LINK} decoration-ink-950/20 ${TAP}`
                }
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current={c.current ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The page top the three course pages share, on paper like /research: a mono
 * crumb trail with the 4px ink marker, the one h1, a lead under 60ch, the
 * actions, and an optional ledger beside it from lg (under it before). On a phone it starts a rem
 * under the bar, like the /research and /about heroes.
 *
 * With `media` (the catalog): a full-width ink band with a site photo under
 * a scrim (solid enough on a phone, where the copy covers the photo; a left
 * to right fade from md, where the copy sits left and the photo's subject
 * right), and `overlap` riding its bottom edge. The photo is the page's
 * largest paint, so it loads eagerly with a high fetch priority.
 */
export default function LearnHeader({ id, crumbs, title, lead, meta, actions, aside, media, overlap }: LearnHeaderProps) {
  if (media) {
    return (
      <Section width="bleed" className="py-0!" aria-labelledby={id}>
        <div className="relative isolate overflow-hidden bg-ink-950">
          <img
            src={`${import.meta.env.BASE_URL}${media.src.replace(/^\//, "")}`}
            alt={media.alt}
            width={media.width}
            height={media.height}
            fetchPriority="high"
            decoding="async"
            style={media.position ? { objectPosition: media.position } : undefined}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-ink-950/80 md:bg-transparent md:bg-linear-to-r md:from-ink-950/95 md:from-25% md:via-ink-950/80 md:via-50% md:to-ink-950/25"
          />
          <div
            className={`mx-auto max-w-page px-6 pt-10 md:pt-16 lg:pt-20 ${
              overlap ? "pb-20 md:pb-24 xl:pb-28" : "pb-14 md:pb-20"
            }`}
          >
            <div className="max-w-[46rem]">
              <Crumbs crumbs={crumbs} onInk />
              <h1 id={id} className="max-w-[20ch] font-display text-display-xl font-semibold text-text-on-ink">
                {title}
              </h1>
              {lead && <p className="mt-6 max-w-[52ch] text-lead text-text-on-ink">{lead}</p>}
              {meta && <div className="mt-5">{meta}</div>}
              {actions && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div>}
            </div>
          </div>
        </div>
        {overlap && <div className="relative mx-auto -mt-10 max-w-page px-6 md:-mt-12">{overlap}</div>}
      </Section>
    );
  }

  return (
    <Section width="page" className="compact:pt-4" aria-labelledby={id}>
      {/* The split waits for lg: at 768 a five-column ledger squeezed
          "3,500+" into "90+" (the numbers stack under the copy until then). */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-10">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
          <Crumbs crumbs={crumbs} onInk={false} />
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
