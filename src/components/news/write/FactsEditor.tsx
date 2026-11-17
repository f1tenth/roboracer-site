import type { DraftFact } from "./types";

const MAX_ROWS = 4;
const FIELD =
  "w-full min-w-0 border-b border-dashed border-ink-950/20 bg-transparent py-1 text-small text-text-strong placeholder:text-text-muted/70 focus:border-solid focus:border-rr-violet focus:outline-none coarse:min-h-11";

const HINTS: DraftFact[] = [
  { label: "Code", value: "github.com/your-team/project", href: "https://github.com/..." },
  { label: "Paper", value: "Title or venue", href: "https://..." },
  { label: "License", value: "MIT", href: "" },
  { label: "Team", value: "Your team's page", href: "https://..." },
];

/**
 * The card in the post's margin: up to four facts a reader may want at hand
 * while reading (where the code is, the paper, the license), each with an
 * optional link. Optional as a whole; a row left empty is not sent.
 */
export default function FactsEditor({ facts, onChange }: { facts: DraftFact[]; onChange: (facts: DraftFact[]) => void }) {
  const set = (i: number, patch: Partial<DraftFact>) => onChange(facts.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <section id="post-facts" aria-labelledby="post-facts-title" className="rule-card scroll-mt-[calc(var(--spacing-nav)+8rem)] p-5 pt-6">
      <h2 id="post-facts-title" className="font-display text-[1.0625rem] font-semibold text-text-strong">
        Links card
      </h2>
      <p className="mt-1 text-small text-text-muted">Optional. Shown beside the text on wide screens: your code, paper, license.</p>

      {facts.length > 0 && (
        <ol className="mt-4 grid gap-5">
          {facts.map((fact, i) => (
            <li key={i} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <input
                  type="text"
                  value={fact.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  aria-label={`Row ${i + 1}: label`}
                  placeholder={HINTS[i % HINTS.length].label}
                  maxLength={40}
                  autoComplete="off"
                  className={`${FIELD} text-text-muted`}
                />
                <button
                  type="button"
                  onClick={() => onChange(facts.filter((_, j) => j !== i))}
                  aria-label={`Remove row ${i + 1}`}
                  className="rr-text-button shrink-0 font-mono text-small coarse:min-h-11"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={fact.value}
                onChange={(e) => set(i, { value: e.target.value })}
                aria-label={`Row ${i + 1}: value`}
                placeholder={HINTS[i % HINTS.length].value}
                maxLength={120}
                autoComplete="off"
                className={`${FIELD} text-body font-semibold`}
              />
              <input
                type="text"
                inputMode="url"
                value={fact.href}
                onChange={(e) => set(i, { href: e.target.value })}
                aria-label={`Row ${i + 1}: link (optional)`}
                placeholder={HINTS[i % HINTS.length].href || "Link (optional)"}
                maxLength={500}
                autoComplete="off"
                className={`${FIELD} font-mono`}
              />
            </li>
          ))}
        </ol>
      )}

      {facts.length < MAX_ROWS && (
        <button
          type="button"
          onClick={() => onChange([...facts, { label: "", value: "", href: "" }])}
          className="mt-4 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-btn border border-ink-950/20 px-3 text-small font-semibold text-text-strong hover:border-rr-violet coarse:min-h-11"
        >
          <span aria-hidden="true" className="text-rr-violet">
            +
          </span>
          Add a row
        </button>
      )}
    </section>
  );
}
