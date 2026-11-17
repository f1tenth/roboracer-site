import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import PostArticle, { PostCrumbs } from "../components/news/PostArticle";
import { loadPost, parsePost, type Post } from "../components/news/postData";

type Loaded = { slug: string; post: Post; markdown: string };

/** A slug with no post, or a post whose files did not answer. */
function NotHere({ failed }: { failed: boolean }) {
  return (
    <Section width="page" className="compact:pt-4" aria-labelledby="post-title">
      <PostCrumbs label="Post" />
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
 * /news/<slug>: a post hosted on the site. The post is data
 * (public/data/posts.json and the Markdown file it names); PostArticle is
 * how it looks.
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

  return <PostArticle post={post} parsed={parsed} className="pt-nav" />;
}
