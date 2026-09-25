/** The mono tag that marks anything a public page has not confirmed. Shared
 * by the people cards and the spinoff cards, so "unconfirmed" looks the same
 * everywhere on /about. */
export default function VerifyTag() {
  return (
    <span className="border border-ink-950/15 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
      verify
    </span>
  );
}
