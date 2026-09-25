const DOCS_URL = "https://f1tenth-coursekit.readthedocs.io/en/latest/";

/**
 * The docs in a frame, one window tall under the fixed nav. On a phone the
 * docs' own bar stacks under ours and the frame is a small window onto a
 * large site, so a slim strip offers the same docs in a tab of their own.
 * Desktop keeps the frame alone.
 */
export default function Learn() {
  return (
    <div className="flex h-[100svh] w-full flex-col pt-nav">
      <h1 className="sr-only">Learn</h1>
      <div className="flex justify-end border-b border-paper-200 px-6 desktop:hidden">
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1 text-small font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 coarse:min-h-11"
        >
          Open the docs
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <iframe className="min-h-0 w-full flex-1 border-none" src={DOCS_URL} title="RoboRacer course material" />
    </div>
  );
}
