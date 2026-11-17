import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useLearnDocs } from "../hooks/useLearnDocs";
import type { LearnDocsFile } from "../lib/data";
import DocsRail from "../components/learn/docs/DocsRail";

/** What every /learn-new page gets from the shell: the loaded docs data. */
export type LearnContext = LearnDocsFile;

/**
 * The course docs, rebuilt as native pages (the preview of the new /learn:
 * /learn is still the framed Sphinx docs). A course map on the left, the page
 * beside it; the pages are children of this route. Data is
 * public/data/learn-docs.json plus the exported page bodies in
 * public/data/learn-new/pages. Not indexed while it is a preview.
 */
export default function LearnNew() {
  const docs = useLearnDocs();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (docs === null) {
    return (
      <div className="mx-auto max-w-content px-6 pb-section pt-nav">
        <h1 className="mt-16 font-display text-display-m font-semibold text-text-strong">The course docs did not load</h1>
        <p className="mt-4 text-body text-text-body">
          Reload the page, or open the{" "}
          <Link to="/learn" className="underline underline-offset-4">
            current docs
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-paper-50">
      <div className="mx-auto grid max-w-page gap-x-14 px-6 pb-section pt-[calc(var(--spacing-nav)+2rem)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        {docs ? (
          <>
            <DocsRail docs={docs} />
            <div className="min-w-0 pt-8 lg:pt-0">
              <Outlet context={docs satisfies LearnContext} />
            </div>
          </>
        ) : (
          <div aria-busy="true" className="min-h-[70svh] lg:col-span-2" />
        )}
      </div>
    </div>
  );
}
