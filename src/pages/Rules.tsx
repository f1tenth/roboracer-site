import { useEffect, useState } from "react";
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
  return marked.parse(markdown, { renderer, async: false });
}

export default function Rules() {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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
    <div className="rules responsive-padding flex flex-col gap-5 py-20 pt-[5.5rem] md:pt-[6.5625rem]">
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
