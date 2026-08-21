// Typed loaders for public/data/*.json. Content is data (CLAUDE.md): pages
// render from these, copy changes are JSON edits.

export type UpcomingEvent = {
  title: string;
  dates: string;
  location: string;
  url: string;
  /** Next-race spotlight fields (one entry carries spotlight: true). */
  spotlight?: boolean;
  dates_headline?: string;
  dates_secondary?: string;
  starts_at?: string;
  registration_deadline?: string;
  register_url?: string;
  rules_url?: string;
};

export type PastRace = {
  name: string;
  url: string;
};

export type Partner = {
  name: string;
  website: string;
  image: string;
};

export type NewsItem = {
  title: string;
  platform: string;
  date: string;
  description: string;
  link: string;
  image?: string;
};

export type Testimonial = {
  author: string;
  institution: string;
  image: string;
  quote: string;
};

export type TeamMember = {
  name: string;
  linkedin?: string;
  image: string;
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  venue_short?: string;
  type: string;
  tags: string[];
  featured: boolean;
  status: "published" | "hidden" | string;
  url?: string;
  doi?: string;
  added?: string;
  source?: string;
  notes?: string;
};

export type PublicationTag = {
  id: string;
  label: string;
  scholar_query?: string;
};

export type PublicationsFile = {
  version: number | string;
  updated: string;
  scholar_query_url: string;
  tags: PublicationTag[];
  items: Publication[];
};

/** id -> label map for rendering tag pills. */
export function tagLabelMap(tags: PublicationTag[]): Record<string, string> {
  return Object.fromEntries(tags.map((t) => [t.id, t.label]));
}

export type TeamHighlight = { event: string; result: string };

export type Team = {
  name: string;
  institution: string;
  country: string;
  website?: string;
  social?: string;
  logo?: string;
  since_year?: number;
  highlights?: TeamHighlight[];
  status: "verify" | "published";
  source?: string;
};

async function loadJson<T>(name: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const loadUpcomingEvents = () => loadJson<UpcomingEvent[]>("upcoming_events.json");
export const loadPastRaces = () => loadJson<PastRace[]>("past_races.json");
export const loadPartners = () => loadJson<Partner[]>("partners.json");
export const loadNews = () => loadJson<NewsItem[]>("news.json");
export const loadTestimonials = () => loadJson<Testimonial[]>("testimonies.json");
export const loadTeamDevelopers = () => loadJson<TeamMember[]>("team_developers.json");
export const loadTeamAlumni = () => loadJson<TeamMember[]>("team_alumni.json");
export const loadPublications = () => loadJson<PublicationsFile>("publications.json");
export const loadTeams = () => loadJson<Team[]>("teams.json");

