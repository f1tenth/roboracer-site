import { useMemo } from "react";
import PostArticle from "../PostArticle";
import { parsePost } from "../postData";
import { allImages, imageUrl } from "./imageRegistry";
import { buildPost } from "./package";
import type { Draft } from "./types";

/**
 * The draft as the published post. Not a likeness: the draft is turned into
 * the same Markdown and the same posts.json entry the package will carry,
 * and rendered by the page that renders published posts (PostArticle). The
 * only difference is where the pictures come from: this browser, since
 * nothing has been sent anywhere yet.
 */
export default function PostPreview({ draft }: { draft: Pick<Draft, "meta" | "doc"> }) {
  const view = useMemo(() => {
    const built = buildPost(draft, allImages());
    const local = new Map<string, string>();
    for (const [id, published] of Object.entries(built.paths)) {
      const url = imageUrl(id);
      if (url) local.set(published.path, url);
    }
    const parsed = parsePost(built.markdown, built.post.media);
    const blocks = parsed.blocks.map((block) =>
      block.type === "figures"
        ? { ...block, items: block.items.map((figure) => ({ ...figure, src: local.get(figure.src) ?? figure.src })) }
        : block,
    );
    const post = {
      ...built.post,
      title: built.post.title || "Your headline",
      author: { ...built.post.author, name: built.post.author.name || "Your name" },
      cover: built.post.cover ? { ...built.post.cover, src: local.get(built.post.cover.src) ?? built.post.cover.src } : null,
    };
    return { post, parsed: { ...parsed, blocks } };
  }, [draft]);

  return <PostArticle post={view.post} parsed={view.parsed} />;
}
