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

export type RowFigure = FigureSource & {
  /** The same figure at card size, for the full-width phone plate. */
  large?: FigureSource;
};

/** Nominal size of a card-size file, from its name: `-fig-1600` is 1600x1000,
 * every other card file 1200x750 (all 16:10, as the row's plate). */
function cardSize(path: string): { width: number; height: number } {
  return /-1600\.webp$/.test(path) ? { width: 1600, height: 1000 } : { width: 1200, height: 750 };
}

/** The dense curated list needs its own small file: a 320x200 WebP under
 * `public/media/research/*-row-320.webp` on the `row_thumbnail` field. It is
 * deliberately separate from the featured chain above - 133 rows at card size
 * would be megabytes - and lives off the Publication type, so the JSON can
 * carry it without the featured fields changing shape. Null when no figure
 * could be extracted; the row draws the logo tile instead.
 *
 * On a phone the plate runs the column's full width, about 3x the 320 file.
 * Where the repo holds the figure the thumb was cut from (docs/media/THUMBS.md,
 * "downscaled from"), `row_thumbnail_large` names it and the phone draws that
 * instead; the others keep the 320 until a larger cut is made. */
export function rowThumb(p: Publication): RowFigure | null {
  const row = p as Publication & { row_thumbnail?: string; row_thumbnail_large?: string };
  if (!row.row_thumbnail) return null;
  const large = row.row_thumbnail_large;
  return {
    src: resolve(row.row_thumbnail),
    width: 320,
    height: 200,
    large: large ? { src: resolve(large), ...cardSize(large) } : undefined,
  };
}
