import type { DraftFact } from "./types";

const MAX_ROWS = 4;
const FIELD =
  "w-full min-w-0 border-b border-ink-950/20 bg-transparent py-1 text-small text-text-strong placeholder:text-text-muted/70 focus:border-rr-violet focus:outline-none coarse:min-h-11";
const LABEL = "font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted";

/** The first row of the card on the AuRoRus post (public/data/posts.json),
 * as the example. */
const EXAMPLE = { label: "Code", value: "github.com/Noce99/AuRoRus", href: "https://github.com/Noce99/AuRoRus" };

/**
 * The card in the post's margin: up to four links or facts a reader may
 * want at hand while reading (where the code is, the paper, the license).
 * Each row is three fields, named for what they are (Cedric, 2026-11-17):
 * the Link title above, the Link display a reader sees and presses, and the
 * Link it opens. The AuRoRus post's own card is shown as the example, with
 * the same three names against it. Optional as a whole; a row left empty is
 * not sent, and a row with no Link is shown as plain text.
 */
export default function FactsEditor({ facts, onChange }: { facts: DraftFact[]; onChange: (facts: DraftFact[]) => void }) {
  const set = (i: number, patch: Partial<DraftFact>) => onChange(facts.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <section id="post-facts" aria-labelledby="post-facts-title" className="rule-card scroll-mt-[calc(var(--spacing-nav)+8rem)] p-5 pt-6">
      <h2 id="post-facts-title" className="font-display text-[1.0625rem] font-semibold text-text-strong">
        Links card
      </h2>
      <p className="mt-1 text-small text-text-muted">
        Optional. Up to four links shown beside your text on wide screens: your code, your paper, your team.
      </p>

      {/* How a link reads on the post, then the three fields behind it. */}
      <div className="mt-4 rounded-media bg-rr-violet/[0.05] p-4">
        <p className={LABEL}>
          Example, from the{" "}
          <a href="/news/aurorus" target="_blank" rel="noopener noreferrer" className="rr-text-button normal-case tracking-normal coarse:-my-4 coarse:inline-block coarse:py-4">
            AuRoRus post
          </a>
        </p>
        <div className="mt-3 rounded-btn border border-ink-950/10 bg-paper-50 px-3.5 py-3">
          <p className="text-small text-text-muted">{EXAMPLE.label}</p>
          <p className="mt-0.5 break-words text-body font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4">
            {EXAMPLE.value}
          </p>
        </div>
        <dl className="mt-3 grid gap-2">
          <div>
            <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-rr-violet">Link title</dt>
            <dd className="text-small text-text-strong">{EXAMPLE.label}</dd>
          </div>
          <div>
            <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-rr-violet">Link display</dt>
            <dd className="break-words text-small text-text-strong">{EXAMPLE.value}</dd>
          </div>
          <div>
            <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-rr-violet">Link</dt>
            <dd className="break-all font-mono text-small text-text-strong">{EXAMPLE.href}</dd>
          </div>
        </dl>
        <p className="mt-3 text-small text-text-muted">Leave Link empty for a fact that goes nowhere, like a license.</p>
      </div>

      {facts.length > 0 && (
        <ol className="mt-5 grid gap-5">
          {facts.map((fact, i) => (
            <li key={i} className="grid gap-3 border-t border-ink-950/10 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-small text-text-strong">Link {i + 1}</p>
                <button
                  type="button"
                  onClick={() => onChange(facts.filter((_, j) => j !== i))}
                  aria-label={`Remove link ${i + 1}`}
                  className="rr-text-button shrink-0 font-mono text-small coarse:min-h-11"
                >
                  Remove
                </button>
              </div>
              <label className="grid gap-0.5">
                <span className={LABEL}>Link title</span>
                <input
                  type="text"
                  value={fact.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  placeholder="Code"
                  maxLength={40}
                  autoComplete="off"
                  className={FIELD}
                />
              </label>
              <label className="grid gap-0.5">
                <span className={LABEL}>Link display</span>
                <input
                  type="text"
                  value={fact.value}
                  onChange={(e) => set(i, { value: e.target.value })}
                  placeholder="github.com/your-team/project"
                  maxLength={120}
                  autoComplete="off"
                  className={`${FIELD} font-semibold`}
                />
              </label>
              <label className="grid gap-0.5">
                <span className={LABEL}>Link</span>
                <input
                  type="text"
                  inputMode="url"
                  value={fact.href}
                  onChange={(e) => set(i, { href: e.target.value })}
                  placeholder="https://github.com/your-team/project"
                  maxLength={500}
                  autoComplete="off"
                  className={`${FIELD} font-mono`}
                />
              </label>
            </li>
          ))}
        </ol>
      )}

      {facts.length < MAX_ROWS && (
        <button
          type="button"
          onClick={() => onChange([...facts, { label: "", value: "", href: "" }])}
          className="mt-5 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-btn border border-ink-950/20 px-3 text-small font-semibold text-text-strong hover:border-rr-violet coarse:min-h-11"
        >
          <span aria-hidden="true" className="text-rr-violet">
            +
          </span>
          {facts.length === 0 ? "Add a link" : "Add another link"}
        </button>
      )}
    </section>
  );
}
