import { fetchJson } from "../../lib/data";
import file from "./people.json";

/**
 * One person on /about. `role` and `affiliation` are only ever the words a
 * public professional page or a RoboRacer race site uses; `source` names that
 * page and `link` is where the person's name points. When no public page gives
 * a role the record carries no `role` and `status: "verify"`, and the card
 * shows no title at all - never a guessed one (CLAUDE.md rule 4).
 *
 * `project_role` is the role inside RoboRacer. Where it comes from the
 * archived f1tenth.org about page it was authored by the team but never
 * displayed (`project_role_verify`, director's ruling 2026-08-23). `status`
 * and `project_role_verify` are review bookkeeping only: nothing renders
 * them since Cedric dropped the verify tags (2026-09-25). The generator is
 * documented in docs/content/about.sources.md.
 */
export type Person = {
  name: string;
  role?: string;
  /** Role inside the project, e.g. "Race Director, IROS 2026". */
  project_role?: string;
  /** Bookkeeping: the project role came from archived page markup. Not rendered. */
  project_role_verify?: boolean;
  affiliation?: string;
  /** Square WebP under public/crew/, 400x400 unless the source was smaller. */
  photo?: string;
  /** The page the name links to. Absent = the name is plain text. */
  link?: string;
  /** URL of the page the role was read from. Kept for provenance. */
  source?: string;
  /** One extra sourced fact, e.g. the co-founder line. */
  note?: string;
  status: "sourced" | "verify";
};

export type PeopleFile = {
  note: string;
  updated: string;
  faculty: Person[];
  developers: Person[];
  past: Person[];
};

const people = file as PeopleFile;

export const FACULTY: Person[] = people.faculty;
export const DEVELOPERS: Person[] = people.developers;
export const PAST_CREW: Person[] = people.past;
export const PEOPLE_UPDATED = people.updated;

/** Monogram for a card with no photo: first letter of the first and last
 * word, so "Ravi Konkimalla" reads RK and "Tom Jose" reads TJ. */
export function monogram(name: string): string {
  const words = name.replace(/[“”"']/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** public/data/contributors.json - GitHub commit history for the f1tenth org.
 * Public professional profile data only (see contributors.schema.json). */
export type Contributor = {
  login: string;
  name: string | null;
  avatar_url: string | null;
  profile_url: string;
  company: string | null;
  commits: number;
  commits_platform: number;
  first_commit: string;
  last_commit: string;
  active: boolean;
  platform_contributor: boolean;
};

export type ContributorsFile = {
  generated_at: string;
  orgs: string[];
  active_since: string;
  stats: { contributors: number; active: number; past: number; repos_with_commits: number };
  contributors: Contributor[];
};

/** Bounded like every data read (lib/data READ_TIMEOUT_MS). */
export const loadContributors = () =>
  fetchJson<ContributorsFile>(`${import.meta.env.BASE_URL}data/contributors.json`);

/** GitHub serves any avatar size from the same URL; 80px is twice the 40px
 * the strip draws them at, and cuts each request to a few kB. */
export function avatarSrc(url: string | null, size = 80): string | undefined {
  if (!url) return undefined;
  return `${url}${url.includes("?") ? "&" : "?"}s=${size}`;
}
