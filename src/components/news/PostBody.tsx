import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Token, Tokens } from "marked";
import PauseToggle from "../ui/PauseToggle";
import { YouTubePlayer } from "../ui/YouTubeFacade";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { LINK, UNDER_NAV } from "../learn/learnStyles";
import type { PostBlock, PostFigure, PostMedia } from "./postData";

const CODE_CHIP = "rounded-[0.25rem] bg-paper-100 px-[0.35em] py-[0.1em] font-mono text-[0.9em] text-text-strong";
const CAPTION = "mt-3 font-mono text-small text-text-muted";
const FRAME = "overflow-hidden rounded-media border border-ink-950/10";
/** Narrow media (a portrait photo, a phone clip, a small map) never grows
 * past this, so it does not fill a screen and a half of a laptop. */
const NARROW_REM = 24;

/** A link in the text: a site path navigates in place, anything else opens
 * in a new tab, a mailto stays a plain link. */
function ProseLink({ href, children }: { href: string; children: ReactNode }) {
  // A post can come from outside the project (the post writer, /news/write).
  // scripts/publish-post.mjs refuses any other kind of address before a post
  // is published; this is the same rule at the last step, so a link that is
  // not a site path, a web address or an email is shown as plain text and
  // can never run as script.
  if (!/^(\/(?!\/)|https?:\/\/|mailto:)/i.test(href)) return <>{children}</>;
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link to={href} className={LINK}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={`${LINK} break-words`}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
    </a>
  );
}

/** Inline Markdown as React nodes. The lexer's text is plain (it escapes
 * nothing), so React's own escaping is the only one applied; raw HTML in the
 * source is dropped rather than injected. */
function inline(tokens: Token[] | undefined): ReactNode[] {
  return (tokens ?? []).map((token, i) => {
    switch (token.type) {
      case "text": {
        const text = token as Tokens.Text;
        return text.tokens ? <span key={i}>{inline(text.tokens)}</span> : text.text;
      }
      case "escape":
        return (token as Tokens.Escape).text;
      case "strong":
        return (
          <strong key={i} className="font-semibold text-text-strong">
            {inline((token as Tokens.Strong).tokens)}
          </strong>
        );
      case "em":
        return <em key={i}>{inline((token as Tokens.Em).tokens)}</em>;
      case "del":
        return <del key={i}>{inline((token as Tokens.Del).tokens)}</del>;
      case "codespan":
        return (
          <code key={i} className={CODE_CHIP}>
            {(token as Tokens.Codespan).text}
          </code>
        );
      case "br":
        return <br key={i} />;
      case "link": {
        const link = token as Tokens.Link;
        return (
          <ProseLink key={i} href={link.href}>
            {inline(link.tokens)}
          </ProseLink>
        );
      }
      default:
        return null;
    }
  });
}

/** A fenced block on ink, with the one thing a reader does with a command:
 * copy it. Comment lines step back so the commands read first. */
function CodeBlock({ text, lang }: { text: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const shell = lang === "sh" || lang === "bash" || lang === "shell" || lang === "console";
  const label = shell ? "Terminal" : lang || "Code";

  const copy = () => {
    void navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  };

  return (
    <div className="mt-6 overflow-hidden rounded-media bg-ink-900 text-text-on-ink">
      <div className="flex items-center justify-between gap-4 border-b border-text-on-ink/10 px-4 py-1.5">
        <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-on-ink-muted">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-8 cursor-pointer items-center font-mono text-small text-text-on-ink underline decoration-text-on-ink/30 underline-offset-4 hover:decoration-rr-violet hover:decoration-2 focus-visible:outline-text-on-ink coarse:min-h-11"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <span role="status" className="sr-only">
          {copied ? "Copied to the clipboard" : ""}
        </span>
      </div>
      {/* Focusable: a block wider than a phone scrolls sideways, and a
          keyboard has to be able to reach it to do that. */}
      <pre tabIndex={0} role="group" aria-label={shell ? "Terminal commands" : "Code"} className="overflow-x-auto p-4 font-mono text-small leading-relaxed focus-visible:outline-text-on-ink">
        <code>
          {text.split("\n").map((line, i) => (
            <span key={i} className={shell && line.trimStart().startsWith("#") ? "text-text-on-ink-muted" : undefined}>
              {line}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/**
 * A silent loop (the author's GIFs, re-encoded as video at a tenth of the
 * size). Nothing downloads until the clip nears the screen; it plays while
 * it is in view and holds still off screen. Under reduced motion it stays on
 * its poster until the reader presses Play. The control sits beside the
 * caption, at every pointer: a clip longer than five seconds must be
 * pausable (WCAG 2.2.2).
 */
function Clip({ figure, media, caption }: { figure: PostFigure; media: PostMedia; caption: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const id = useId();
  /** The reader's own choice once they press the control; before that the
   * clip follows the motion preference. */
  const [choice, setChoice] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const wanted = choice ?? !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (wanted && inView) void el.play().catch(() => undefined);
    else el.pause();
  }, [wanted, inView]);

  return (
    <>
      <div className={`${FRAME} bg-ink-950`}>
        <video
          ref={ref}
          id={id}
          muted
          loop
          playsInline
          preload="none"
          poster={media.poster}
          width={media.width}
          height={media.height}
          aria-label={figure.alt}
          className="block h-auto w-full"
        >
          <source src={figure.src} type="video/mp4" />
        </video>
      </div>
      <figcaption className="mt-3 flex items-start justify-between gap-4">
        <span className="min-w-0 pt-1 font-mono text-small text-text-muted">{caption}</span>
        <PauseToggle always paused={!wanted} onToggle={() => setChoice(!wanted)} controls={id} className="-mt-1" />
      </figcaption>
    </>
  );
}

/** A YouTube video in the text: its thumbnail until the reader presses play
 * (nothing else loads from YouTube before that), then the privacy-enhanced
 * player in the same box. */
function Video({ figure, media }: { figure: PostFigure; media: PostMedia }) {
  const [playing, setPlaying] = useState(false);
  if (!media.video_id) return null;
  const aspect = `${media.width} / ${media.height}`;
  return (
    <div className={`${FRAME} relative bg-ink-950`} style={{ aspectRatio: aspect }}>
      <YouTubePlayer
        videoId={media.video_id}
        title={figure.alt}
        poster={{ src: media.poster ?? "", width: media.width, height: media.height }}
        playing={playing ? "click" : false}
        onPlay={() => setPlaying(true)}
        aspect={aspect}
      />
    </div>
  );
}

function Still({ figure, media }: { figure: PostFigure; media: PostMedia }) {
  return (
    <img
      src={figure.src}
      alt={figure.alt}
      width={media.width}
      height={media.height}
      loading="lazy"
      decoding="async"
      className={`block h-auto w-full ${media.frame === false ? "" : `${FRAME} bg-paper-100`}`}
    />
  );
}

function Figure({ figure, paired }: { figure: PostFigure; paired: boolean }) {
  const media = figure.media;
  const caption = figure.caption ? inline(figure.caption) : null;
  // A file the index does not describe (a new image dropped into the text)
  // still shows, lazily, without a reserved box.
  if (!media) {
    return (
      <figure className={paired ? "" : "mt-8"}>
        <img src={figure.src} alt={figure.alt} loading="lazy" decoding="async" className={`${FRAME} block h-auto w-full`} />
        {caption && <figcaption className={CAPTION}>{caption}</figcaption>}
      </figure>
    );
  }
  // Never wider than the file itself (sized in rem, like everything here),
  // and a narrow one is capped again unless it shares its line.
  const cap = Math.min(media.width / 16, !paired && media.size === "narrow" ? NARROW_REM : Infinity);
  const style: CSSProperties = Number.isFinite(cap) ? { maxWidth: `${cap}rem` } : {};
  return (
    <figure className={`mx-auto w-full ${paired ? "" : "mt-8"}`} style={style}>
      {media.kind === "clip" ? (
        <Clip figure={figure} media={media} caption={caption} />
      ) : (
        <>
          {media.kind === "youtube" ? (
            <Video figure={figure} media={media} />
          ) : (
            <Still figure={figure} media={media} />
          )}
          {(caption || media.zoom) && (
            <figcaption className={CAPTION}>
              {caption}
              {media.zoom && (
                <>
                  {caption && " "}
                  <a href={figure.src} target="_blank" rel="noopener noreferrer" className={`${LINK} whitespace-nowrap`}>
                    Open full size
                  </a>
                </>
              )}
            </figcaption>
          )}
        </>
      )}
    </figure>
  );
}

/** One figure, or two narrow ones on a line. The pair's columns follow each
 * picture's own proportions, so a 3:4 photo and a 9:16 video come out the
 * same height; on a phone they stack. */
function Figures({ items }: { items: PostFigure[] }) {
  if (items.length < 2) return <Figure figure={items[0]} paired={false} />;
  const cols = items.map((f) => `${((f.media?.width ?? 1) / (f.media?.height ?? 1)).toFixed(4)}fr`).join(" ");
  return (
    <div
      className="mt-8 grid items-start gap-6 max-sm:mx-auto max-sm:max-w-[24rem] sm:[grid-template-columns:var(--pair-cols)]"
      style={{ "--pair-cols": cols } as CSSProperties}
    >
      {items.map((figure) => (
        <Figure key={figure.src} figure={figure} paired />
      ))}
    </div>
  );
}

function ListItems({ list }: { list: Tokens.List }) {
  return (
    <>
      {list.items.map((item, i) => (
        <li key={i} className="pl-1">
          {item.tokens.map((token, j) => (
            <Block key={j} token={token} nested />
          ))}
        </li>
      ))}
    </>
  );
}

/** Everything that is not a heading or a figure. `nested` is the inside of a
 * list item or a quote, where the first paragraph takes no top margin. */
function Block({ token, nested = false, lead = false }: { token: Token; nested?: boolean; lead?: boolean }) {
  switch (token.type) {
    case "paragraph":
      return (
        <p className={lead ? "text-lead text-text-strong" : nested ? "mt-3 first:mt-0" : "mt-5"}>
          {inline((token as Tokens.Paragraph).tokens)}
        </p>
      );
    // A tight list item's text arrives as a bare text token.
    case "text": {
      const text = token as Tokens.Text;
      return <>{text.tokens ? inline(text.tokens) : text.text}</>;
    }
    case "list": {
      const list = token as Tokens.List;
      const cls = `${nested ? "mt-2" : "mt-5"} space-y-2 pl-6 marker:text-text-muted`;
      return list.ordered ? (
        <ol start={typeof list.start === "number" ? list.start : undefined} className={`${cls} list-decimal marker:font-mono marker:text-small`}>
          <ListItems list={list} />
        </ol>
      ) : (
        <ul className={`${cls} list-disc`}>
          <ListItems list={list} />
        </ul>
      );
    }
    case "code": {
      const code = token as Tokens.Code;
      return <CodeBlock text={code.text} lang={code.lang} />;
    }
    case "table": {
      const table = token as Tokens.Table;
      return (
        // Focusable for the same reason as a code block: it can scroll.
        <div tabIndex={0} role="group" aria-label="Table" className={`${FRAME} mt-6 overflow-x-auto`}>
          <table className="w-full border-collapse text-left text-small">
            <thead>
              <tr>
                {table.header.map((cell, i) => (
                  <th key={i} scope="col" className="bg-paper-100 px-4 py-3 font-semibold text-text-strong">
                    {inline(cell.tokens)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border-t border-ink-950/10 px-4 py-3 align-top">
                      {inline(cell.tokens)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "blockquote":
      return (
        <blockquote className="mt-6 border-l-2 border-rr-violet pl-5 text-text-strong">
          {(token as Tokens.Blockquote).tokens.map((child, i) => (
            <Block key={i} token={child} nested />
          ))}
        </blockquote>
      );
    case "hr":
      return <hr className="mt-10 border-ink-950/10" />;
    default:
      return null;
  }
}

const HEADING: Record<2 | 3 | 4, string> = {
  2: `mt-14 font-display text-display-s font-semibold text-text-strong ${UNDER_NAV}`,
  3: `mt-10 font-display text-[1.25rem] font-semibold leading-snug text-text-strong ${UNDER_NAV}`,
  4: `mt-8 font-semibold text-text-strong ${UNDER_NAV}`,
};

/**
 * A post's text. The Markdown is parsed to tokens and each token becomes a
 * React element, never an HTML string: links are router links where they
 * stay on the site, the clips and the video are components with their own
 * controls, and nothing in the file can inject markup.
 */
export default function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="text-[1.0625rem] leading-[1.75] text-text-body lg:text-[1.125rem]">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = `h${block.depth}` as "h2" | "h3" | "h4";
          return (
            <Tag key={block.id} id={block.id} className={HEADING[block.depth]}>
              {inline(block.tokens)}
            </Tag>
          );
        }
        if (block.type === "figures") return <Figures key={i} items={block.items} />;
        return <Block key={i} token={block.token} lead={i === 0} />;
      })}
    </div>
  );
}
