import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { loadDocsPage, type LearnDocsFile } from "../../lib/data";
import { DocPage, DocHeader } from "../../components/learn/docs/DocParts";
import type { TocItem } from "../../components/learn/docs/DocsToc";
import { ROOT, flatNav, moduleOfPath } from "../../components/learn/docs/docsFormat";
import { LINK } from "../../components/learn/learnStyles";

/**
 * Any docs page that is exported HTML rather than a hand-built page: module
 * indexes, lectures, tutorials, labs, races, the final project, grading and
 * support. The body is the coursekit page as is (slides and videos included),
 * restyled by .doc-prose; links inside it that stay on the site navigate
 * without a reload.
 */
export default function LearnDoc() {
  const docs = useOutletContext<LearnDocsFile>();
  const key = useParams()["*"] ?? "";
  const info = docs.pages[key];
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<{ key: string; body: string } | "error" | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    if (!info || info.native) return;
    let live = true;
    loadDocsPage(key)
      .then((body) => live && setHtml({ key, body }))
      .catch(() => live && setHtml("error"));
    return () => {
      live = false;
    };
  }, [key, info]);

  const ready = html && html !== "error" && html.key === key;
  useEffect(() => {
    if (!ready || !bodyRef.current) return;
    const heads = [...bodyRef.current.querySelectorAll<HTMLElement>("h2[id]")];
    setToc(heads.map((h) => ({ id: h.id, label: h.textContent?.trim() ?? "" })));
  }, [ready, key]);

  const { prev, next } = useMemo(() => {
    const flat = flatNav(docs);
    const i = info ? flat.findIndex((it) => it.to === info.to) : -1;
    return { prev: i > 0 ? flat[i - 1] : null, next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null };
  }, [docs, info]);

  if (!info) return <Navigate to={ROOT} replace />;
  if (info.native) return <Navigate to={info.to} replace />;

  const moduleId = moduleOfPath(info.to, docs);
  const moduleItem = docs.nav.flatMap((g) => g.items).find((i) => i.id === moduleId);
  const crumbs = [
    { label: "Learn", href: ROOT },
    ...(moduleItem ? [{ label: `Module ${moduleItem.id}`, href: moduleItem.to }] : []),
    { label: info.title },
  ];

  // A link in the body that stays on this site is a router navigation.
  const onBodyClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || a.target === "_blank") return;
    if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <DocPage toc={toc}>
      <DocHeader crumbs={crumbs} title={info.title} />
      <div ref={bodyRef} aria-busy={!ready && html !== "error"} className="min-h-[40svh] py-10">
        {html === "error" ? (
          <p className="text-body text-text-body">This page did not load. Reload to try again.</p>
        ) : ready ? (
          // The HTML is exported from the coursekit repository (docs/learn-new export), not user input.
          <div className="doc-prose" onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: html.body }} />
        ) : null}
      </div>
      {(prev || next) && (
        <nav aria-label="Previous and next" className="grid gap-4 border-t border-ink-950/10 pt-8 sm:grid-cols-2">
          {prev ? (
            <Link to={prev.to} className="rounded-media border border-ink-950/10 p-4 hover:border-rr-violet">
              <span className="block text-small text-text-muted">Previous</span>
              <span className={`${LINK} mt-1 inline-block font-semibold`}>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={next.to} className="rounded-media border border-ink-950/10 p-4 text-right hover:border-rr-violet sm:col-start-2">
              <span className="block text-small text-text-muted">Next</span>
              <span className={`${LINK} mt-1 inline-block font-semibold`}>{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </DocPage>
  );
}
