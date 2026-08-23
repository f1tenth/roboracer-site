// Pure figure resolution for the research page (no React): which files a
// paper can show, in the order they are tried. Every entry carries the
// nominal size so an aspect-locked box never shifts while a file loads.
import type { Publication } from "../../lib/data";

export type FigureSource = { src: string; width: number; height: number };

function resolve(path: string): string {
  return path.startsWith("/") ? path : `${import.meta.env.BASE_URL}${path}`;
}

/** Card thumbnail (1200x750) first, then the wider carousel figure. Empty
 * when the paper has neither, which is the generated tile's case. */
export function figureChain(p: Publication): FigureSource[] {
  const out: FigureSource[] = [];
  if (p.thumbnail) out.push({ src: resolve(p.thumbnail), width: 1200, height: 750 });
  if (p.figure) out.push({ src: resolve(p.figure), width: 1600, height: 1000 });
  return out;
}
