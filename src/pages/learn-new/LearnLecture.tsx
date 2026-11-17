import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import type { DocsDue, LearnDocsFile } from "../../lib/data";
import { DocPage, DocHeader, DocSection, Embed, Glance } from "../../components/learn/docs/DocParts";
import { ROOT, fmtDate, fmtDay } from "../../components/learn/docs/docsFormat";
import { LINK, isExternal } from "../../components/learn/learnStyles";

const TOC = [
  { id: "lec-overview", label: "Overview" },
  { id: "lec-watch", label: "Slides and video" },
  { id: "lec-next", label: "Next up" },
  { id: "lec-more", label: "More resources" },
];

function NextCard({ item, kind }: { item: DocsDue; kind: string }) {
  return (
    <li className="border-t-2 border-ink-950 pt-4">
      <p className="font-mono text-small text-text-muted">
        {kind} · {fmtDay(item.when)}
      </p>
      <h3 className="mt-2 font-display text-lead font-semibold text-text-strong">
        {item.label}: {item.title}
      </h3>
      <Link to={item.href} className={`${LINK} mt-3 inline-block text-body`}>
        Open {item.label}
        <span aria-hidden="true"> →</span>
      </Link>
    </li>
  );
}

export default function LearnLecture() {
  const docs = useOutletContext<LearnDocsFile>();
  const { moduleSlug, lectureId } = useParams();
  const mod = docs.outline.find((m) => m.slug === moduleSlug);
  const n = Number(/^lecture-(\d+)$/.exec(lectureId ?? "")?.[1]);
  if (!mod || mod.id !== "A" || n !== docs.lecture1.number) return <Navigate to={ROOT} replace />;

  const l = docs.lecture1;
  const session = docs.schedule.find((s) => s.lecture === n);

  return (
    <DocPage toc={TOC}>
      <DocHeader
        crumbs={[
          { label: "Learn", href: ROOT },
          { label: `Module ${mod.id}`, href: `${ROOT}/module-a` },
          { label: `Lecture ${n}` },
        ]}
        title={
          <>
            <span className="mb-3 block font-mono text-small font-medium text-text-muted">
              Module {mod.id} · Lecture {n}
            </span>
            {l.title}
          </>
        }
      >
        <Glance
          items={[
            { label: "Date", value: session ? fmtDate(session.date) : "" },
            { label: "Due that day", value: session?.due || "Nothing" },
            { label: "Tutorial", value: `${l.tutorial.label}, ${fmtDay(l.tutorial.when)}` },
            { label: "Lab", value: `${l.lab.label} out ${fmtDay(l.lab.when)}` },
          ]}
        />
      </DocHeader>

      <DocSection id="lec-overview" title="Overview">
        <div className="grid gap-10 rounded-card border border-ink-950/10 bg-paper-100 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <p className="max-w-[62ch] text-lead text-text-body">{l.overview}</p>
          <div>
            <h3 className="border-b border-ink-950/10 pb-3 font-mono text-small font-semibold text-text-strong">
              Topics covered
            </h3>
            <ul className="divide-y divide-ink-950/10">
              {l.topics.map((t) => (
                <li key={t} className="py-3 text-body text-text-body">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection id="lec-watch" title="Slides and video">
        <div className="grid gap-8">
          <Embed
            src={l.slides_embed}
            title={`Slides: ${l.title}`}
            tone="ink"
            caption={
              <>
                Slides ·{" "}
                <a href={l.slides_open} target="_blank" rel="noopener noreferrer" className={LINK}>
                  open in Google Slides
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </>
            }
          />
          <Embed src={`https://www.youtube.com/embed/${l.video_id}`} title={l.video_title} caption="Video" tone="ink" />
        </div>
      </DocSection>

      <DocSection id="lec-next" title="Next up">
        <ul className="grid gap-x-8 gap-y-8 md:grid-cols-3">
          <NextCard item={l.tutorial} kind="Tutorial" />
          <NextCard item={l.lab} kind="Assignment" />
          <li className="border-t-2 border-ink-950 pt-4">
            <p className="font-mono text-small text-text-muted">Lecture</p>
            <h3 className="mt-2 font-display text-lead font-semibold text-text-strong">
              {l.next.label}: {l.next.title}
            </h3>
            <Link to={l.next.href} className={`${LINK} mt-3 inline-block text-body`}>
              Open {l.next.label}
              <span aria-hidden="true"> →</span>
            </Link>
          </li>
        </ul>
      </DocSection>

      <DocSection id="lec-more" title="More resources">
        <ul className="divide-y divide-ink-950/10 border-y border-ink-950/10">
          {l.resources.map((r) => (
            <li key={r.href} className="py-3 text-body">
              {isExternal(r.href) ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {r.label}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link to={r.href} className={LINK}>
                  {r.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-950/10 pt-6 text-body">
          <Link to={`${ROOT}/module-a`} className={LINK}>
            ← Module {mod.id} overview
          </Link>
          <Link to={l.next.href} className={LINK}>
            {l.next.label} →
          </Link>
        </div>
      </DocSection>
    </DocPage>
  );
}
