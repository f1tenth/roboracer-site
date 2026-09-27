import type { CourseStat } from "../../lib/data";
import { MONO_NOTE } from "./learnStyles";

/**
 * One group of a page top's ledger (the /research masthead): a mono label,
 * then each figure's label over its value in violet mono. The values are the
 * file's display strings ("3,500+"), which the type says never to parse, so
 * they stand as written: the final number is the markup, with or without
 * motion.
 */
export default function Ledger({ label, stats }: { label: string; stats: CourseStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="border-t border-ink-950/10 pt-5">
      <p className={MONO_NOTE}>{label}</p>
      <dl className="mt-4 grid grid-cols-3 gap-x-6 gap-y-5">
        {stats.map((s) => (
          // A label that wraps on a phone ("recorded lectures") pushes its
          // own value down only as far as the row's: values share a baseline.
          <div key={s.id} className="flex flex-col">
            <dt className={MONO_NOTE}>{s.label}</dt>
            <dd className="mt-auto pt-1 font-mono text-display-m font-semibold tabular-nums text-rr-violet">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
