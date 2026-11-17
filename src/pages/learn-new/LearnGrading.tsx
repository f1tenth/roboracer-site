import { useOutletContext } from "react-router-dom";
import type { DocsGradeHow, LearnDocsFile } from "../../lib/data";
import Button from "../../components/ui/Button";
import LeaderboardReplay from "../../components/race/LeaderboardReplay";
import { FALLBACK_CONFIG, replayHref } from "../../components/race/leaderboardData";
import { DocPage, DocHeader, DocSection } from "../../components/learn/docs/DocParts";
import { ROOT } from "../../components/learn/docs/docsFormat";
import { pad2 } from "../../components/learn/learnStyles";

const TOC = [
  { id: "grade-submit", label: "How a submission works" },
  { id: "grade-checks", label: "What the autograder checks" },
  { id: "grade-sim", label: "Simulator evaluations" },
  { id: "grade-rubric", label: "Rubric by lab" },
];

const HOW: Record<DocsGradeHow, string> = { auto: "Autograded", sim: "In simulation", ta: "TA-graded" };

export default function LearnGrading() {
  const docs = useOutletContext<LearnDocsFile>();
  const g = docs.grading;
  const replay = g.sim.replay;
  const replayConfig = { label: replay.label, note: replay.note, compare: replay.compare, posters: replay.posters };
  const href = replayHref({ ...FALLBACK_CONFIG, replay: replayConfig }, replay.board, replay.compare);

  return (
    <DocPage toc={TOC}>
      <DocHeader crumbs={[{ label: "Learn", href: ROOT }, { label: "Grading" }]} title={g.title} lead={g.lead} />

      <DocSection id="grade-submit" title={g.submit.title} lead={g.submit.lead}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {g.submit.steps.map((s, i) => (
              <li key={s.title} className="rule-card p-5 pt-6">
                <p className="text-small font-bold text-text-muted">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-lead font-semibold text-text-strong">{s.title}</h3>
                <p className="mt-2 text-body text-text-body">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-5">
            <figure className="rule-card p-5 pt-6">
              <figcaption className="mb-3 text-small font-bold uppercase tracking-[0.1em] text-text-muted">
                In your terminal
              </figcaption>
              <pre className="overflow-x-auto rounded-media border border-ink-950/10 bg-paper-100 p-4 font-mono text-small text-text-strong">
                <code>{g.submit.code}</code>
              </pre>
            </figure>
            <p className="text-body text-text-body">{g.submit.team_note}</p>
            <p className="text-body text-text-body">{g.submit.names_note}</p>
          </div>
        </div>
      </DocSection>

      <DocSection id="grade-checks" title={g.checks.title}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {g.checks.items.map((c) => (
            <li key={c.title} className="rule-card p-5 pt-6">
              <h3 className="font-display text-lead font-semibold text-text-strong">{c.title}</h3>
              <p className="mt-2 text-body text-text-body">{c.body}</p>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="grade-sim" title={g.sim.title} lead={g.sim.lead}>
        <ul className="grid gap-5 md:grid-cols-3">
          {g.sim.maps.map((m) => (
            <li key={m.name} className="rule-card p-5 pt-6">
              <h3 className="font-mono text-body font-semibold text-text-strong">{m.name}</h3>
              <p className="mt-2 text-small text-text-body">{m.body}</p>
            </li>
          ))}
        </ul>

        <figure className="rule-card mt-8 p-5 pt-7">
          <LeaderboardReplay replay={replayConfig} href={href} />
        </figure>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href={g.sim.board_url} variant="secondary" target="_blank" rel="noopener noreferrer">
            {g.sim.board_label} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
          <p className="max-w-[62ch] text-small text-text-muted">{g.sim.board_note}</p>
        </div>
      </DocSection>

      <DocSection id="grade-rubric" title={g.rubric.title} lead={g.rubric.lead}>
        <div className="grid gap-5">
          {g.rubric.labs.map((lab) => {
            const total = lab.items.filter((i) => !i.bonus).reduce((n, i) => n + i.points, 0);
            return (
              <section key={lab.number} aria-labelledby={`grade-lab-${lab.number}`} className="rule-card p-5 pt-6">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 id={`grade-lab-${lab.number}`} className="font-display text-lead font-semibold text-text-strong">
                    <span className="mr-3 text-small font-bold uppercase tracking-[0.1em] text-text-muted">
                      Lab {lab.number}
                    </span>
                    {lab.title}
                  </h3>
                  <p className="text-small text-text-muted">
                    {lab.team ? "Team lab · " : ""}
                    {total} points
                  </p>
                </header>
                <ul className="mt-4 divide-y divide-ink-950/10 border-t border-ink-950/10">
                  {lab.items.map((it) => (
                    <li key={it.text} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]">
                      <span className="font-mono text-body font-semibold tabular-nums text-text-strong">
                        {it.bonus ? "+" : ""}
                        {pad2(it.points)}
                      </span>
                      <span className="text-body text-text-body">
                        {it.bonus && <span className="mr-2 font-semibold text-text-strong">Bonus.</span>}
                        {it.text}
                      </span>
                      {it.how && (
                        <span className="col-start-2 text-small text-text-muted sm:col-start-3 sm:text-right">
                          {HOW[it.how]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </DocSection>
    </DocPage>
  );
}
