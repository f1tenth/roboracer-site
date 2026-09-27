import type { CSSProperties } from "react";
import type { CourseFeature } from "../../lib/data";
import Reveal from "../ui/Reveal";
import { pad2, visibleFeatures } from "./learnStyles";

type FeatureListProps = {
  features: CourseFeature[];
  page: "catalog" | "teach";
  /** meta.lms_url: the `platform` features render only once it is set. */
  lmsUrl: string | null;
};

/**
 * The one feature list, on the catalog (04) and the teach page (02): two
 * columns of hairline-ruled rows, a mono number, the name and one sentence.
 * A spec sheet, not a grid of icon cards. The grid fills column by column
 * (its row count is set from the data), so 01, 02, 03 read down the first
 * column at two columns and in order at one.
 */
export default function FeatureList({ features, page, lmsUrl }: FeatureListProps) {
  const shown = visibleFeatures(features, lmsUrl).filter((f) => f.pages.includes(page));
  if (shown.length === 0) return null;
  const perColumn = Math.ceil(shown.length / 2);
  const rows = { "--rows": perColumn } as CSSProperties;
  return (
    <Reveal>
      <ol
        style={rows}
        className="grid md:grid-flow-col md:grid-cols-2 md:grid-rows-[repeat(var(--rows),auto)] md:gap-x-10 lg:gap-x-16"
      >
        {shown.map((f, i) => (
          <li
            key={f.id}
            // A rule under every row, and over the first row of each column.
            className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-ink-950/10 py-5 md:py-6 ${
              i === 0 ? "border-t" : i === perColumn ? "md:border-t" : ""
            }`}
          >
            <span className="pt-[0.2em] font-mono text-small tabular-nums text-text-muted">{pad2(i + 1)}</span>
            <p className="max-w-[56ch] text-body text-text-body">
              <span className="font-semibold text-text-strong">{f.title}.</span> {f.body}
            </p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
