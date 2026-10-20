import type { CourseFaq } from "../../lib/data";
import { FoldChevron, WithEmail } from "./LearnLink";
import { FOLD_SUMMARY } from "./learnStyles";

type FaqListProps = {
  items: CourseFaq[];
  /** meta.contact: named in some answers, linked where it appears. */
  email: string;
  /** Each question as its own card (the course page's Logistics tab): a
   * hairline box that warms to violet on hover and stays violet while open.
   * Off, the ruled list /learn/teach has always used. */
  cards?: boolean;
};

/**
 * Questions as native <details> (the /research fold): each opens from the
 * keyboard and without JavaScript, find-in-page reaches a closed answer, and
 * a screen reader announces it expanded or collapsed. `note` fields are
 * questions for Cedric and never render.
 */
export default function FaqList({ items, email, cards = false }: FaqListProps) {
  if (cards) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((f) => (
          <details
            key={f.id}
            className="group rounded-card border border-ink-950/10 bg-paper-50 px-5 transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] hover:border-rr-violet/40 hover:shadow-card open:border-rr-violet/60 open:bg-rr-violet/[0.04] motion-reduce:transition-none"
          >
            <summary className={`${FOLD_SUMMARY} items-center justify-between py-4`}>
              <span className="max-w-[60ch] font-display text-lead font-semibold">{f.q}</span>
              <span className="text-rr-violet">
                <FoldChevron />
              </span>
            </summary>
            <p className="max-w-[62ch] pb-5 text-body text-text-body">
              <WithEmail text={f.a} email={email} />
            </p>
          </details>
        ))}
      </div>
    );
  }
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
