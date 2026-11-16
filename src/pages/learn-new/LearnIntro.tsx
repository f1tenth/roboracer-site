import { Link, useOutletContext } from "react-router-dom";
import type { LearnDocsFile } from "../../lib/data";
import Button from "../../components/ui/Button";
import { DocPage, DocHeader, DocSection, Embed } from "../../components/learn/docs/DocParts";
import { LINK } from "../../components/learn/learnStyles";

const TOC = [
  { id: "intro-watch", label: "Watch the introduction" },
  { id: "intro-fit", label: "Is it for you" },
  { id: "intro-community", label: "Join the community" },
];

function Checklist({ title, items, tone }: { title: string; items: string[]; tone: "yes" | "no" }) {
  return (
    <div className={`rounded-media border p-5 ${tone === "yes" ? "border-ink-950/10 bg-paper-100" : "border-ink-950/10"}`}>
      <h3 className="font-display text-lead font-semibold text-text-strong">{title}</h3>
      <ul className="mt-3 space-y-2 text-body text-text-body">
        {items.map((it) => (
          <li key={it} className="flex gap-3">
            <span aria-hidden="true" className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "yes" ? "bg-rr-violet" : "bg-ink-950/30"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LearnIntro() {
  const docs = useOutletContext<LearnDocsFile>();
  const { intro, meta } = docs;

  return (
    <DocPage toc={TOC}>
      <DocHeader crumbs={[{ label: "Learn" }, { label: "Introduction" }]} title="Introduction" lead={intro.overview}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/learn-new/module-a">Start with Module A</Button>
          <Button href="/learn-new/syllabus" variant="secondary">
            Read the syllabus
          </Button>
        </div>
      </DocHeader>

      <DocSection id="intro-watch" title="Watch the introduction">
        <div className="grid gap-8">
          <Embed src={`https://www.youtube.com/embed/${intro.video_id}`} title={intro.video_title} caption="Video" />
          <Embed src={intro.slides_embed} title={intro.slides_title} caption="Course overview slides" />
        </div>
      </DocSection>

      <DocSection id="intro-fit" title="Is it for you" lead={intro.note}>
        <div className="grid gap-5 md:grid-cols-3">
          <Checklist title="What it teaches" items={intro.teaches} tone="yes" />
          <Checklist title="Prerequisites" items={intro.prerequisites} tone="yes" />
          <Checklist title="What it is not" items={intro.not} tone="no" />
        </div>
      </DocSection>

      <DocSection id="intro-community" title="Join the community" lead={intro.community}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href={meta.slack_url} variant="secondary" target="_blank" rel="noopener noreferrer">
            Join the Slack
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
          <Link to={meta.courses_url} className={LINK}>
            Taking or teaching it? See the 4, 10 and 15 week courses
          </Link>
        </div>
        <p className="mt-8 max-w-[62ch] text-small text-text-muted">
          Course materials are licensed{" "}
          <a href={meta.license_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            {meta.license}
          </a>
          : use and modify them with attribution, not for commercial use.
        </p>
      </DocSection>
    </DocPage>
  );
}
