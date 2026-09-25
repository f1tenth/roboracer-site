const WORDS = [
  "None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
  "Nineteen", "Twenty",
];

/** A count that opens a sentence, spelled out ("Eleven papers ..."), so copy
 * that states how many things follow is computed from the data rather than
 * written by hand. Above twenty it falls back to digits. */
export const countWord = (n: number): string => WORDS[n] ?? String(n);
