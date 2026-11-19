import { Link, useOutletContext } from "react-router-dom";
import type { DocsSession, LearnDocsFile } from "../../lib/data";
import { DocPage, DocHeader, DocSection, Glance } from "../../components/learn/docs/DocParts";
import {
  KIND_TAG,
  ROOT,
  fmtDate,
  sessionsOf,
} from "../../components/learn/docs/docsFormat";
import { LINK, pad2 } from "../../components/learn/learnStyles";

const TOC = [
  { id: "syl-how", label: "How it runs" },
  { id: "syl-outline", label: "Fall 2026 outline" },
];

const TD = "px-4 py-3 align-top max-md:flex max-md:gap-4 max-md:px-0 max-md:py-1 max-md:before:w-20 max-md:before:shrink-0 max-md:before:font-mono max-md:before:text-small max-md:before:text-text-muted max-md:before:content-[attr(data-label)] max-md:empty:hidden";

function Row({ s }: { s: DocsSession }) {
  const tag = KIND_TAG[s.kind];
  const live = !!s.href;
  const quiet = s.kind === "break" || s.kind === "office-hours";
  const tint = s.kind === "race" ? "bg-rr-violet/[0.07]" : "";
  return (
    <tr
      className={`border-b border-ink-950/10 max-md:block max-md:px-4 max-md:py-4 ${tint} ${quiet ? "text-text-muted" : ""}`}
    >
      <td data-label="Date" className={`${TD} whitespace-nowrap font-mono text-small md:w-36`}>
        {fmtDate(s.date)}
      </td>
      <td data-label="Lecture" className={`${TD} font-mono text-small tabular-nums md:w-16`}>
        {s.lecture !== null ? pad2(s.lecture) : ""}
      </td>
      <td data-label="Topic" className={`${TD} md:w-[34%]`}>
        {tag && (
          <span
            className={`mr-2 inline-block rounded-pill px-2 py-0.5 font-mono text-eyebrow ${
              s.kind === "race" ? "bg-rr-violet text-white" : "border border-ink-950/20 text-text-muted"
            }`}
          >
            {tag}
          </span>
        )}
        {live ? (
          <Link to={s.href as string} className={`${LINK} font-semibold`}>
            {s.title}
          </Link>
        ) : (
          <span className={quiet ? "" : "font-semibold text-text-strong"}>{s.title}</span>
        )}
        {s.materials.length > 0 && (
          <span className="mt-1 block font-mono text-small text-text-muted">{s.materials.join(" · ")}</span>
        )}
        {s.note && <span className="mt-1 block text-small text-text-muted">{s.note}</span>}
      </td>
      <td data-label="Tutorial" className={`${TD} text-small`}>
        {s.tutorial}
      </td>
      <td data-label="Out" className={`${TD} text-small`}>
        {s.out}
      </td>
      <td data-label="Due" className={`${TD} whitespace-nowrap text-small`}>
        {s.due}
      </td>
    </tr>
  );
}

export default function LearnSyllabus() {
  const docs = useOutletContext<LearnDocsFile>();
  const { syllabus, meta } = docs;

  return (
    <DocPage toc={TOC}>
      <DocHeader crumbs={[{ label: "Learn", href: ROOT }, { label: "Syllabus" }]} title="Syllabus" lead={syllabus.lead}>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-body">
          <a href={meta.sheet_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            Open the outline sheet
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={meta.sample_syllabus_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            Sample class description
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <Glance
          items={[
            { label: "Term", value: `${fmtDate(docs.schedule[0].date)} to ${fmtDate(docs.schedule[docs.schedule.length - 1].date)}` },
            { label: "Modules", value: String(docs.outline.length) },
            { label: "Races", value: String(docs.schedule.filter((s) => s.kind === "race").length) },
          ]}
        />
      </DocHeader>

      <DocSection id="syl-how" title="How the course runs" lead="Four parts work together.">
        <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {syllabus.components.map((c) => (
            <li key={c.title} className="rule-card p-5 pt-6">
              <h3 className="font-display text-lead font-semibold text-text-strong">{c.title}</h3>
              <p className="mt-2 text-body text-text-body">{c.body}</p>
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection
        id="syl-outline"
       
        title={syllabus.outline_title}
        lead={
          <>
            Every session, by module. The{" "}
            <Link to={`${ROOT}/schedule`} className={LINK}>
              full schedule
            </Link>{" "}
            adds links to each tutorial and lab.
          </>
        }
      >
        <nav aria-label="Jump to a module" className="mb-8 flex flex-wrap gap-2">
          {docs.outline.map((m) => (
            <a
              key={m.id}
              href={`#syl-${m.slug}`}
              className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-ink-950/20 px-4 text-small font-semibold text-text-strong transition-colors hover:border-rr-violet hover:text-rr-violet-deep coarse:min-h-11"
            >
              <span className="font-mono">{m.id}</span>
              <span className="hidden sm:inline">{m.short}</span>
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {docs.outline.map((m) => (
            <div key={m.id} id={`syl-${m.slug}`} className="scroll-mt-[calc(var(--spacing-nav)+1rem)]">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-display text-lead font-semibold text-text-strong">
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
              <div className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-50">
                <table className="w-full border-collapse text-left text-body max-md:block">
                  <caption className="sr-only">{`Module ${m.id}: ${m.title}`}</caption>
                  <thead className="max-md:sr-only">
                    <tr className="border-b border-ink-950/15 bg-paper-100 font-mono text-small text-text-muted">
                      <th scope="col" className="px-4 py-2 font-medium">Date</th>
                      <th scope="col" className="px-4 py-2 font-medium">Lecture</th>
                      <th scope="col" className="px-4 py-2 font-medium">Topic</th>
                      <th scope="col" className="px-4 py-2 font-medium">Tutorial</th>
                      <th scope="col" className="px-4 py-2 font-medium">Out</th>
                      <th scope="col" className="px-4 py-2 font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody className="max-md:block">
                    {sessionsOf(docs, m.id).map((s) => (
                      <Row key={`${s.date}-${s.title}`} s={s} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 font-mono text-small text-text-muted">{docs.schedule_note}</p>
      </DocSection>
    </DocPage>
  );
}
