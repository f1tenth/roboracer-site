import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { marked, type Tokens } from "marked";

import "./rules.css";

const SOURCE_URL = "https://github.com/f1tenth/roboracer_rules/blob/dev-2026/rules_v3.md";

const slug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * public/rules.md as it is written. The file is a verbatim copy of
 * rules_v3.md on the dev-2026 branch of f1tenth/roboracer_rules
 * (scripts/check-rules-drift.mjs compares the two and can refresh the copy).
 *
 * The document carries its own contents list and its own `<a id>` anchors, so
 * the page adds no table of contents. A heading only gets an id the document
 * has not already declared, and a repeated heading ("Evaluation") gets a
 * numeric suffix, so no id appears twice. Section numbers come from CSS
 * counters in rules.css, the way the ruleset's own stylesheet does it.
 *
 * The document's own contents list (a list made only of in-page links) gets
 * a class, so rules.css can give its links a touch-sized row; if the upstream
 * file ever changes shape the list simply keeps the plain style.
 */
function render(markdown: string): string {
  const used = new Set([...markdown.matchAll(/<a id="([^"]+)"><\/a>/g)].map((m) => m[1]));
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
    const base = slug(tokens.map((t) => t.raw).join(""));
    const inner = this.parser.parseInline(tokens);
    // Declared by the document itself, right under this heading.
    if (depth === 2 && used.has(base)) return `<h${depth}>${inner}</h${depth}>`;
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    return `<h${depth} id="${id}">${inner}</h${depth}>`;
  };
  const html = marked.parse(markdown, { renderer, async: false });
  return html.replace(
    /<ul>\n((?:<li><a href="#[^"]+">[^<]*<\/a><\/li>\n)+)<\/ul>/,
    '<ul class="rules-contents">\n$1</ul>',
  );
}

export default function Rules() {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // A deep link (/rules#kill-switch) arrives before the document does. Once
  // it has rendered, bring the target in with scrollIntoView, which honours
  // the anchors' scroll-margin in rules.css (Safari does not retry the
  // fragment after async content; Chromium does). Arrival only: later jumps
  // inside the document are the browser's own.
  const { hash } = useLocation();
  const arrivalHash = useRef(hash);

  useEffect(() => {
    const target = arrivalHash.current;
    if (html === null || !target) return;
    arrivalHash.current = "";
    document.getElementById(decodeURIComponent(target.slice(1)))?.scrollIntoView({ block: "start" });
  }, [html]);

  useEffect(() => {
    let live = true;
    fetch(`${import.meta.env.BASE_URL}rules.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`rules.md: ${res.status}`);
        return res.text();
      })
      .then((md) => live && setHtml(render(md)))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="rules flex flex-col gap-5 px-6 py-20 pt-[calc(var(--spacing-nav)+1rem)] md:px-8 lg:px-16 lg:pt-[calc(var(--spacing-nav)+1.25rem)] xl:px-24 2xl:px-32">
      <p className="rules-source">
        The general rules for in-person competitions, from the{" "}
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
          official rules repository
        </a>
        . Each competition adds its own rules on its own site. <mark>Marked text</mark> is new or
        changed in this draft.
      </p>
      {failed ? (
        <p>
          The rules did not load. Read them in the{" "}
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
            rules repository
          </a>
          .
        </p>
      ) : html === null ? (
        <p>Loading the rules.</p>
      ) : (
        <div className="rules-body" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}
