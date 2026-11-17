import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import type { DocsSession, LearnDocsFile } from "../../lib/data";
import { DocPage, DocHeader, DocSection, Glance } from "../../components/learn/docs/DocParts";
import {
  KIND_TAG,
  ROOT,
  fmtDate,
  fmtDay,
  labsOf,
  numberedLectures,
  sessionsOf,
} from "../../components/learn/docs/docsFormat";
import { LINK, pad2 } from "../../components/learn/learnStyles";

const TOC = [
  { id: "mod-lectures", label: "Week by week" },
  { id: "mod-labs", label: "Labs" },
];

function SessionRow({ s }: { s: DocsSession }) {
  const lecture = s.lecture !== null;
  const live = !!s.href;
  const tag = KIND_TAG[s.kind];
  const extras = [s.tutorial, s.out && `Out: ${s.out}`, s.due && `Due: ${s.due}`].filter(Boolean) as string[];

  const body = (
    <>
      <span
        className={`font-mono tabular-nums ${
          lecture ? "text-display-s font-semibold text-text-strong" : "text-small text-text-muted"
        }`}
      >
        {lecture ? pad2(s.lecture as number) : "·"}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`${lecture ? "text-lead font-semibold text-text-strong" : "text-body text-text-body"} ${
              live ? "underline decoration-ink-950/25 underline-offset-4 group-hover:decoration-rr-violet group-hover:decoration-2" : ""
            }`}
          >
            {s.title}
          </span>
          {tag && (
            <span className="rounded-pill border border-ink-950/20 px-2 py-0.5 font-mono text-eyebrow text-text-muted">
              {tag}
            </span>
          )}
        </span>
        {extras.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-small text-text-body">
            {extras.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </span>
        )}
        {s.materials.length > 0 && (
          <span className="mt-1.5 block font-mono text-small text-text-muted">{s.materials.join(" · ")}</span>
        )}
      </span>
      <span className="text-right font-mono text-small text-text-muted">
        {fmtDate(s.date)}
        <span className={`mt-1 block ${live ? "font-semibold text-rr-violet-deep" : ""}`}>
          {live ? "Open →" : ""}
        </span>
      </span>
    </>
  );

  const grid = "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-6";
  return live ? (
    <Link
      to={s.href as string}
      className={`group ${grid} -mx-4 rounded-media px-4 transition-colors hover:bg-paper-100`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${grid} ${lecture ? "" : "opacity-100"}`}>{body}</div>
  );
}

export default function LearnModule() {
  const docs = useOutletContext<LearnDocsFile>();
  const { moduleSlug } = useParams();
  const mod = docs.outline.find((m) => m.slug === moduleSlug);
  if (!mod || mod.id !== "A") return <Navigate to={ROOT} replace />;

  const sessions = sessionsOf(docs, mod.id);
  const lectures = numberedLectures(sessions);
  const labs = labsOf(docs, sessions);
  const first = sessions[0]?.date;
  const last = sessions[sessions.length - 1]?.date;

  return (
    <DocPage toc={TOC}>
      <DocHeader
        crumbs={[{ label: "Learn", href: ROOT }, { label: `Module ${mod.id}` }]}
        title={
          <>
            <span className="mb-5 block w-14">
              <span className="flex h-14 w-14 items-center justify-center rounded-btn border border-ink-950/15 bg-paper-50 font-mono text-display-s font-semibold text-text-strong">
                {mod.id}
              </span>
              <span aria-hidden="true" className="mt-1.5 block h-0.5 w-14 bg-gradient-scale" />
            </span>
            {mod.title}
          </>
        }
        lead="The first module covers what you need to understand and control the RoboRacer autonomous vehicle system: ROS 2, the simulator, the car itself, and your first reactive controllers."
      >
        <Glance
          items={[
            { label: "Lectures", value: String(lectures.length) },
            { label: "Labs", value: labs.length ? `${labs.length} (Lab ${labs[0].number} to ${labs[labs.length - 1].number})` : "None" },
            { label: "Runs", value: first && last ? `${fmtDay(first)} to ${fmtDay(last)}` : "" },
          ]}
        />
      </DocHeader>

      <DocSection
        id="mod-lectures"
        title="Week by week"
        lead="Lectures are numbered; tutorials and recitations sit between them."
      >
        <ol className="divide-y divide-ink-950/10 border-y border-ink-950/10">
          {sessions.map((s) => (
            <li key={`${s.date}-${s.title}`}>
              <SessionRow s={s} />
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="mod-labs" title="Labs" lead="Handed out in class, done outside it.">
        <ul className="divide-y divide-ink-950/10 border-y border-ink-950/10">
          {labs.map((l) => (
            <li key={l.number} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
              <span className="font-mono text-small font-semibold text-text-strong">Lab {l.number}</span>
              <Link to={`${ROOT}/doc/assignments/labs/lab${l.number}`} className={`${LINK} text-body font-semibold`}>
                {l.optional ? "Optional: " : ""}
                {l.title}
              </Link>
              <span className="col-start-2 font-mono text-small text-text-muted sm:col-start-3 sm:text-right">
                Out {fmtDay(l.out)}
                {l.due ? ` · Due ${fmtDay(l.due)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </DocSection>
    </DocPage>
  );
}
