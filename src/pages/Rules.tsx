"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

import "./rules.css";

export default function MarkdownViewer() {
    const [markdownContent, setMarkdownContent] = useState<string>("Loading...");
    const [tableOfContents, setTableOfContents] = useState<string>("");

    useEffect(() => {
        async function fetchMarkdown() {
            try {
                const response = await fetch("/rules.md");
                if (!response.ok) throw new Error("Failed to fetch Markdown");

                const markdown = await response.text();
                const tocData: string[] = [];

                const renderer = new marked.Renderer();

                renderer.heading = ({ tokens, depth }) => {
                    const text = tokens.map(token => token.raw).join('');
                    const level = depth;
                    const anchor = text.toLowerCase().replace(/\s+/g, "-");
                    tocData.push(`<li><a href="#${anchor}">${text}</a></li>`);
                    return `<h${level} id="${anchor}">${text}</h${level}>`;
                };

                const parsedMarkdown = await marked(markdown, { renderer });

                setTableOfContents(`<ul>${tocData.join("")}</ul>`);
                setMarkdownContent(parsedMarkdown);
            } catch (error) {
                setMarkdownContent("<p>Failed to load Markdown.</p>");
                console.error(error);
            }
        }

        fetchMarkdown();
    }, []);

    return (
        <div className="rules responsive-padding flex flex-col gap-5 py-20">
            <nav dangerouslySetInnerHTML={{ __html: tableOfContents }} className="toc" />
            <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
        </div>
    );
}
