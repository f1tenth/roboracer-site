import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { isSitePath } from "./newsData";

type NewsAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & {
  href: string;
  children: ReactNode;
};

/** Where a news item sends the reader: a post hosted here opens in place
 * through the router, a source elsewhere opens in a new tab. */
export default function NewsAnchor({ href, children, ...rest }: NewsAnchorProps) {
  if (isSitePath(href)) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
