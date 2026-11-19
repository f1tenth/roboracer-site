import { Link, useOutletContext } from "react-router-dom";
import type { DocsSheetLink, DocsSession, LearnDocsFile } from "../../lib/data";
import { DocPage, DocHeader, DocSection } from "../../components/learn/docs/DocParts";
import { KIND_TAG, ROOT, entriesOf, entryHref, fmtDate, sessionsOf } from "../../components/learn/docs/docsFormat";
import { LINK, pad2 } from "../../components/learn/learnStyles";

const TOC = [{ id: "sched-all", label: "Full schedule" }];

const TD =
  "px-4 py-3 align-top max-md:flex max-md:gap-4 max-md:px-0 max-md:py-1 max-md:before:w-20 max-md:before:shrink-0 max-md:before:font-mono max-md:before:text-small max-md:before:text-text-muted max-md:before:content-[attr(data-label)] max-md:empty:hidden";

/** Slides, video, notebook and repo links the sheet gives a session. */
function Chips({ links }: { links: DocsSheetLink[] }) {
  if (links.length === 0) return null;
  return (
    <span className="mt-1.5 flex flex-wrap gap-1.5">
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-6 items-center rounded-pill border border-ink-950/15 px-2.5 font-mono text-eyebrow text-text-strong transition-colors hover:border-rr-violet hover:text-rr-violet-deep coarse:min-h-9"
        >
          {l.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </span>
  );
}

/** A schedule cell: each entry a link where the docs have a page for it. */
function Entries({ docs, cell }: { docs: LearnDocsFile; cell: string }) {
  return (
    <>
      {entriesOf(cell).map((t) => {
        const href = entryHref(docs, t);
        return (
          <span key={t} className="block">
            {href ? (
              <Link to={href} className={LINK}>
                {t}
              </Link>
            ) : (
              t
            )}
          </span>
        );
      })}
    </>
  );
}

function Row({ docs, s }: { docs: LearnDocsFile; s: DocsSession }) {
  const tag = KIND_TAG[s.kind];
  const quiet = s.kind === "break" || s.kind === "office-hours";
  const href = s.href ?? entryHref(docs, s.title);
  return (
    <tr
      className={`sched-row border-b border-ink-950/10 last:border-b-0 max-md:block max-md:px-4 max-md:py-4 ${
        s.kind === "race" ? "sched-row--race" : ""
      } ${quiet ? "text-text-muted" : ""}`}
    >
      <td data-label="Date" className={`${TD} whitespace-nowrap font-mono text-small md:w-32`}>
        {fmtDate(s.date)}
      </td>
      <td data-label="Lecture" className={`${TD} font-mono text-small tabular-nums md:w-14`}>
        {s.lecture !== null ? pad2(s.lecture) : ""}
      </td>
      <td data-label="Session" className={`${TD} md:w-[32%]`}>
        <div className="min-w-0">
        {tag && (
          <span className="mr-2 inline-block rounded-pill border border-ink-950/20 px-2 py-0.5 font-mono text-eyebrow text-text-muted">
            {tag}
          </span>
        )}
        {href ? (
          <Link to={href} className={`${LINK} font-semibold`}>
            {s.title}
          </Link>
        ) : (
          <span className={quiet ? "" : "font-semibold text-text-strong"}>{s.title}</span>
        )}
        <Chips links={s.links} />
        {s.note && <span className="mt-1 block text-small text-text-muted">{s.note}</span>}
        </div>
      </td>
      <td data-label="Tutorial" className={`${TD} text-small`}>
        {s.tutorials.map((t) => (
          <span key={t.text} className="mb-2 block last:mb-0">
            {t.text}
            <Chips links={t.links} />
          </span>
        ))}
      </td>
      <td data-label="Lab out" className={`${TD} text-small`}>
        <Entries docs={docs} cell={s.out} />
      </td>
      <td data-label="Due" className={`${TD} text-small`}>
        <Entries docs={docs} cell={s.due} />
      </td>
    </tr>
  );
}

export default function LearnSchedule() {
  const docs = useOutletContext<LearnDocsFile>();

  return (
    <DocPage toc={TOC}>
      <DocHeader
        crumbs={[{ label: "Learn", href: ROOT }, { label: "Schedule" }]}
        title="Schedule"
        lead="Every session of the Fall 2026 course in one place, with links to its lecture, tutorial and lab. Each module has its own colour."
      >
        <nav aria-label="Jump to a module" className="mt-8 flex flex-wrap gap-2">
          {docs.outline.map((m) => (
            <a
              key={m.id}
              href={`#sched-${m.slug}`}
              className={`sched-${m.id} inline-flex min-h-9 items-center gap-2 rounded-pill border border-ink-950/15 py-1 pl-1 pr-4 text-small font-semibold text-text-strong transition-colors hover:border-rr-violet coarse:min-h-11`}
            >
              <span className="sched-chip !h-7 !w-7 !rounded-full text-small">{m.id}</span>
              <span className="hidden sm:inline">{m.short}</span>
            </a>
          ))}
        </nav>
      </DocHeader>

      <DocSection id="sched-all" title="Full schedule" lead="Lecture titles, tutorials and labs link to their pages where the docs have one.">
        <div className="space-y-10">
          {docs.outline.map((m) => (
            <section
              key={m.id}
              id={`sched-${m.slug}`}
              aria-labelledby={`sched-h-${m.id}`}
              className={`sched-${m.id} sched-mod scroll-mt-[calc(var(--spacing-nav)+1rem)]`}
            >
              <div className="sched-mod__head">
                <span className="sched-chip" aria-hidden="true">
                  {m.id}
                </span>
                <h3 id={`sched-h-${m.id}`} className="font-display text-lead font-semibold text-text-strong">
                  <span className="mr-3 text-small font-medium text-text-muted">Module {m.id}</span>
                  {m.id === "A" ? (
                    <Link to={`${ROOT}/module-a`} className={LINK}>
                      {m.title}
                    </Link>
                  ) : (
                    m.title
                  )}
                </h3>
              </div>
              <table className="w-full border-collapse text-left text-body max-md:block">
                <caption className="sr-only">{`Module ${m.id}: ${m.title}`}</caption>
                <thead className="max-md:sr-only">
                  <tr className="border-b border-ink-950/15 bg-paper-100 font-mono text-small text-text-muted">
                    <th scope="col" className="px-4 py-2 font-medium">Date</th>
                    <th scope="col" className="px-4 py-2 font-medium">Lecture</th>
                    <th scope="col" className="px-4 py-2 font-medium">Session</th>
                    <th scope="col" className="px-4 py-2 font-medium">Tutorial</th>
                    <th scope="col" className="px-4 py-2 font-medium">Lab out</th>
                    <th scope="col" className="px-4 py-2 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="max-md:block">
                  {sessionsOf(docs, m.id).map((s) => (
                    <Row key={`${s.date}-${s.title}`} docs={docs} s={s} />
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <p className="mt-8 font-mono text-small text-text-muted">{docs.schedule_note}</p>
      </DocSection>
    </DocPage>
  );
}
