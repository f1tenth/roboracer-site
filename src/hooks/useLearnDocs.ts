import { useEffect, useState } from "react";
import { loadLearnDocs, type LearnDocsFile } from "../lib/data";

/** public/data/learn-docs.json for the /learn docs: undefined while it loads,
 * null if it failed. */
export function useLearnDocs(): LearnDocsFile | null | undefined {
  const [docs, setDocs] = useState<LearnDocsFile | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadLearnDocs()
      .then((d) => live && setDocs(d))
      .catch(() => live && setDocs(null));
    return () => {
      live = false;
    };
  }, []);
  return docs;
}
