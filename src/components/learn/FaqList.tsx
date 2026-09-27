import type { CourseFaq } from "../../lib/data";
import { FoldChevron, WithEmail } from "./LearnLink";
import { FOLD_SUMMARY } from "./learnStyles";

type FaqListProps = {
  items: CourseFaq[];
  /** meta.contact: named in some answers, linked where it appears. */
  email: string;
};

/**
 * Questions as native <details> (the /research fold): each opens from the
 * keyboard and without JavaScript, find-in-page reaches a closed answer, and
 * a screen reader announces it expanded or collapsed. `note` fields are
 * questions for Cedric and never render.
 */
export default function FaqList({ items, email }: FaqListProps) {
  return (
    <div className="border-t border-ink-950/10">
      {items.map((f) => (
        <details key={f.id} className="group border-b border-ink-950/10">
          <summary className={`${FOLD_SUMMARY} justify-between`}>
            <span className="max-w-[60ch] font-display text-lead font-semibold">{f.q}</span>
            <FoldChevron />
          </summary>
          <p className="max-w-[62ch] pb-6 text-body text-text-body">
            <WithEmail text={f.a} email={email} />
          </p>
        </details>
      ))}
    </div>
  );
}
