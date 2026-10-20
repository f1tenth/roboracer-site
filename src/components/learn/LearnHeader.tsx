import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { CoursePhoto } from "../../lib/data";
import Section from "../ui/Section";
import { LINK, TAP } from "./learnStyles";

export type Crumb = { label: string; href?: string; current?: boolean };

type LearnHeaderProps = {
  id: string;
  crumbs: Crumb[];
  /** A string on the no-such-course page; the catalog passes one phrase
   * wrapped in the gradient. */
  title: ReactNode;
  lead?: ReactNode;
  /** The buttons: one primary, one ghost. */
  actions?: ReactNode;
  /** A photo under the copy: the top becomes a full-width ink band with a
   * scrim, the copy in on-ink colours (actions should pass on="ink"). */
  media?: CoursePhoto;
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
 * A courses page top. Without `media` (the no-such-course page) it is on
 * paper like /research: a mono crumb trail with the 4px ink marker, the one
 * h1, a lead under 60ch and the actions; on a phone it starts a rem under the
 * bar, like the /research and /about heroes. The course pages and teach draw
 * their own photo tops.
 *
 * With `media` (the catalog): a full-width ink band with a site photo. Below
 * lg the photo fills the band under an 80% scrim (the copy covers it); from
 * lg it fills the right 62% and fades into the ink under the copy, as the
 * teach header does, so the photo's subject sits clear of the text whatever
 * the frame. `overlap` rides the band's bottom edge. The photo is the page's
 * largest paint, so it loads eagerly with a high fetch priority.
 */
export default function LearnHeader({ id, crumbs, title, lead, actions, media, overlap }: LearnHeaderProps) {
  if (media) {
    return (
      <Section width="bleed" className="py-0!" aria-labelledby={id}>
        <div className="relative isolate overflow-hidden bg-ink-950">
          <div className="absolute inset-0 -z-10 lg:left-auto lg:w-[62%]">
            <img
              src={`${import.meta.env.BASE_URL}${media.src.replace(/^\//, "")}`}
              alt={media.alt}
              width={media.width}
              height={media.height}
              fetchPriority="high"
              decoding="async"
              style={media.position ? { objectPosition: media.position } : undefined}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-ink-950/80 lg:bg-transparent lg:bg-linear-to-r lg:from-ink-950 lg:via-ink-950/45 lg:via-35% lg:to-ink-950/5"
            />
          </div>
          <div
            className={`mx-auto max-w-page px-6 pt-10 md:pt-16 lg:pt-20 ${
              overlap ? "pb-20 md:pb-24 xl:pb-28" : "pb-14 md:pb-20"
            }`}
          >
            <div className="max-w-[60rem]">
              <Crumbs crumbs={crumbs} onInk />
              <h1 id={id} className="max-w-[20ch] font-display text-display-xl font-semibold text-text-on-ink">
                {title}
              </h1>
              {lead && <p className="mt-6 max-w-[52ch] text-lead text-text-on-ink">{lead}</p>}
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
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-10">
        <div className="lg:col-span-10">
          <Crumbs crumbs={crumbs} onInk={false} />
          <h1 id={id} className="max-w-[18ch] font-display text-display-xl font-semibold text-text-strong">
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-[60ch] text-lead text-text-body">{lead}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div>}
        </div>
      </div>
    </Section>
  );
}
