import type { ReactNode } from "react";
import { BLOCK_TITLE, UNDER_NAV } from "./learnStyles";

type BlockHeaderProps = {
  id: string;
  /** Two-digit index ("01"), the SectionHeader marker at block size. */
  index?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h2" | "h3";
};

/**
 * A block's heading inside a section column (the course page's left column):
 * the mono index with the 4px ink marker, as SectionHeader draws it, over a
 * display-s title.
 */
export default function BlockHeader({ id, index, title, lead, as: Tag = "h2" }: BlockHeaderProps) {
  return (
    <header className="mb-6">
      {index && (
        <p className="mb-3 flex items-center gap-2 font-mono text-small text-text-muted">
          <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
          <span>{index}</span>
        </p>
      )}
      <Tag id={id} className={`${BLOCK_TITLE} ${UNDER_NAV}`}>
        {title}
      </Tag>
      {lead && <p className="mt-3 max-w-[60ch] text-body text-text-body">{lead}</p>}
    </header>
  );
}
