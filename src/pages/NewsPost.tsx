import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import DocsToc from "../components/learn/docs/DocsToc";
import PostBody from "../components/news/PostBody";
import { loadPost, parsePost, type Post } from "../components/news/postData";
import { LINK, TAP, isExternal } from "../components/learn/learnStyles";

type Loaded = { slug: string; post: Post; markdown: string };

/** The title with its accent words in the logo gradient: one display phrase
 * per page (the course pages' rule), and only if the title contains it. */
function Title({ post }: { post: Post }) {
  const accent = post.title_accent;
  const at = accent ? post.title.indexOf(accent) : -1;
  if (!accent || at < 0) return <>{post.title}</>;
  return (
    <>
      {post.title.slice(0, at)}
      <span className="text-gradient-logo -my-[0.15em] inline-block py-[0.15em]">{accent}</span>
      {post.title.slice(at + accent.length)}
    </>
  );
}

function Crumbs({ label }: { label: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small text-text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
          <Link to="/news" className={`${LINK} ${TAP} decoration-ink-950/20`}>
            News
          </Link>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </li>
      </ol>
    </nav>
  );
}

/** A slug with no post, or a post whose files did not answer. */
function NotHere({ failed }: { failed: boolean }) {
  return (
    <Section width="page" className="compact:pt-4" aria-labelledby="post-title">
      <Crumbs label="Post" />
      <h1 id="post-title" className="max-w-[18ch] font-display text-display-l font-semibold text-text-strong">
        {failed ? "This post did not load" : "There is no post here"}
      </h1>
      <p className="mt-6 max-w-[60ch] text-lead text-text-body">
        {failed ? "Reload the page to try again." : "The address may have changed."} Every post and result is on
        the news page.
      </p>
      <div className="mt-8">
        <Button href="/news" variant="secondary">
          All news
        </Button>
      </div>
    </Section>
  );
}

/**
 * /news/<slug>: a post hosted on the site, on the paper surface. The header
 * is the news lead's 7/5 split (title and byline beside the cover), then the
 * text in a centred reading column between "On this page" and a margin card
 * of the post's own links, then the author and the one solid button. The post is
 * data: public/data/posts.json and the Markdown file it names.
 */
export default function NewsPost() {
  const { slug = "" } = useParams();
  const [loaded, setLoaded] = useState<Loaded | "missing" | "error" | null>(null);

  useEffect(() => {
    let live = true;
    loadPost(slug)
      .then((found) => live && setLoaded(found ? { slug, ...found } : "missing"))
      .catch(() => live && setLoaded("error"));
    return () => {
      live = false;
    };
  }, [slug]);

  const ready = loaded !== null && typeof loaded === "object" && loaded.slug === slug ? loaded : null;
  const post = ready?.post;
  const parsed = useMemo(() => (ready ? parsePost(ready.markdown, ready.post.media) : null), [ready]);

  // Layout names the fixed routes; a post names itself once it is in.
  useEffect(() => {
    if (post) document.title = `${post.title} - RoboRacer`;
  }, [post]);

  if (loaded === "missing" || loaded === "error") {
    return (
      <div className="pt-nav">
        <NotHere failed={loaded === "error"} />
      </div>
    );
  }
  // One window of paper while the two files load, so the footer never
  // paints first and then jumps away.
  if (!post || !parsed) return <div className="min-h-[100svh] pt-nav" aria-busy="true" />;

  const { author, cover, cta } = post;
  const who = [author.role, author.affiliation].filter(Boolean).join(", ");

  return (
    <article className="pt-nav" aria-labelledby="post-title">
      <Section width="page" className="compact:pt-4 pb-10 desktop:pb-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <header className="lg:col-span-7">
            <Crumbs label={post.label} />
            <h1 id="post-title" className="max-w-[20ch] font-display text-display-l font-semibold text-text-strong">
              <Title post={post} />
            </h1>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-t border-ink-950/10 pt-6">
              <p>
                <span className="block text-body font-semibold text-text-strong">
                  By{" "}
                  {author.url ? (
                    <a href={author.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {author.name}
                    </a>
                  ) : (
                    author.name
                  )}
                </span>
                {who && <span className="mt-1 block text-small text-text-muted">{who}</span>}
              </p>
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-small text-text-muted">
                <time dateTime={post.date}>{post.date_display}</time>
                <span aria-hidden="true">·</span>
                <span>{parsed.minutes} min read</span>
              </p>
            </div>
          </header>
          {cover && (
            <figure className="lg:col-span-5">
              <div className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
                <img
                  src={cover.src}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  decoding="async"
                  fetchPriority="high"
                  className="block h-auto w-full"
                />
              </div>
              {cover.caption && (
                <figcaption className="mt-3 font-mono text-small text-text-muted">{cover.caption}</figcaption>
              )}
            </figure>
          )}
        </div>
      </Section>

      <Section width="page" rule className="pt-10 desktop:pt-14">
        {/* The reading column sits on the page's centre line: the two
            margins are equal columns, "On this page" in the left one and the
            post's links in the right one (both from xl only). */}
        <div className="grid gap-x-12 xl:grid-cols-[minmax(12.5rem,1fr)_minmax(0,46rem)_minmax(12.5rem,1fr)]">
          <DocsToc items={parsed.toc} />
          <div className="mx-auto w-full min-w-0 max-w-[46rem]">
            <PostBody blocks={parsed.blocks} />
            {post.credit && (
              <p className="mt-12 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted">
                {post.credit}
              </p>
            )}
          </div>
          {post.facts && post.facts.length > 0 && (
            <aside
              aria-label="About this project"
              className="sticky top-[calc(var(--spacing-nav)+1.5rem)] hidden w-full max-w-[19rem] self-start justify-self-end xl:block"
            >
              <dl className="rule-card grid gap-y-5 p-6 pt-7">
                {post.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-small text-text-muted">{fact.label}</dt>
                    <dd className="mt-1 break-words text-body font-semibold text-text-strong">
                      {fact.href ? (
                        <a href={fact.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                          {fact.value}
                        </a>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </Section>

      <Section width="page" edge rule tight aria-labelledby="post-author">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>Written by</span>
            </p>
            <h2 id="post-author" className="font-display text-display-m font-semibold text-text-strong">
              {author.name}
            </h2>
            {who && <p className="mt-3 max-w-[52ch] text-lead text-text-body">{who}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:col-span-5 md:justify-end">
            {cta && (
              <Button
                href={cta.href}
                {...(isExternal(cta.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {cta.label}
              </Button>
            )}
            <Button href="/news" variant="ghost">
              All news
            </Button>
          </div>
        </div>
      </Section>
    </article>
  );
}
