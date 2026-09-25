// Typed loaders for public/data/*.json. Content is data (CLAUDE.md): pages
// render from these, copy changes are JSON edits.

export type UpcomingEvent = {
  title: string;
  /** "IROS 2026": the headline name (the title is the official long form). */
  short_name?: string;
  dates: string;
  location: string;
  url: string;
  /** Next-race spotlight fields (one entry carries spotlight: true). */
  spotlight?: boolean;
  dates_headline?: string;
  dates_secondary?: string;
  starts_at?: string;
  /** End instant, so the season chain can compute concluded without a literal. */
  ends_at?: string;
  venue?: string;
  /** Where to watch while the race runs. */
  stream_url?: string;
  /** `unconfirmed` until someone has seen a real stream go up. */
  stream_status?: "confirmed" | "unconfirmed";
  registration_deadline?: string;
  /** The same deadline as an instant, so a countdown never parses prose. */
  registration_deadline_at?: string;
  registration_deadline_note?: string;
  register_url?: string;
  /** Where the deadlines are published, when that is not the registration page.
   * scripts/sync-event-deadlines.py reads this first. */
  timeline_url?: string;
  /** Published on the same timeline row as the registration close, so it
   * shares that date rather than being typed separately. */
  qualification_video_due?: string;
  /** The race's own picture in the season chain. Absent until there is one:
   * the chain renders its designed placeholder rather than an empty frame. */
  image?: string;
  image_alt?: string;
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
  /** Ribbon rest state: the tinted logo (scripts/partner-tint.py, landing v5). */
  image_rest?: string;
  /** Ribbon hover / focus state: the colour logo at the same size. */
  image_hover?: string;
  /** Kind of institution, for the About wall's groups. Absent on older
   * records, which fall back to one ungrouped wall. */
  category?: "university" | "industry" | "organization" | "other";
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
  arxiv?: string;
  pdf?: string;
  /** 1200x750 WebP under public/media/research/ (scripts/paper_thumbs.py). */
  thumbnail?: string;
  /** 1600 px wide WebP of one main figure, for the landing carousel
   * (scripts/paper_thumbs.py --figure n --size 1600, landing v5). */
  figure?: string;
  /** 1..8: position in the landing research carousel; absent = not featured there. */
  featured_order?: number;
  /** Verbatim abstract (arXiv or OpenAlex; source recorded in `notes`). */
  abstract?: string;
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
  /** Square team photo under public/media/team/ (media curator). */
  photo?: string;
};

/** One thing that grew out of the car: a company, a product, a team or an
 * initiative (public/data/spinoffs.json, About section "Spinoffs"). `what`
 * and `origin` are our own sentences drafted from the first-party pages in
 * `source` / `evidence`; an `origin` starting with TODO(content) is a question
 * for Cedric and is not rendered. `logo` is null unless the file has a
 * provenance row in docs/ASSET_MANIFEST.md; the card then shows a wordmark. */
export type Spinoff = {
  name: string;
  kind: "company" | "product" | "team" | "initiative";
  /** Shown instead of `kind` when the plain kind would mislead ("nonprofit"). */
  label?: string;
  what: string;
  origin: string | null;
  since: number | null;
  url: string;
  logo: string | null;
  status: "verify" | "published";
  source: string;
  /** Who named it a spinoff, when that is a person rather than a page. */
  named_by?: string;
  evidence?: { url: string; says: string }[];
  note?: string;
};

export type SpinoffsFile = {
  note: string;
  updated: string;
  /** Rendered on /about. */
  entries: Spinoff[];
  /** Proposed, not rendered, until Cedric moves one into `entries`. */
  candidates: Spinoff[];
};

export type Highlight = {
  id: string;
  type: "image" | "video";
  src: string;
  poster: string;
  caption: string;
  credit: string;
  aspect: "16/9" | "3/2";
  status: "placeholder" | "live";
  /** Event id (icra2026, iv2026, ...) and optional link to its race site. */
  event?: string;
  href?: string;
};

/** public/data/events_map.json (generated by scripts/build-world-map.mjs). */
export type MapEvent = {
  id: string;
  year: number;
  label: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  kind: "race" | "madgames" | "workshop" | "course" | string;
  status: "held" | "upcoming" | "virtual" | string;
  verified: boolean;
  number?: number;
  /** ISO date of the last day, on events that were upcoming when written. */
  ends?: string;
  source?: string;
  labelDx?: number;
  labelDy?: number;
  /** The event's own page. Absent when none ever existed. */
  url?: string;
  /** live = answered 200 when last checked; archive = a Wayback capture
   * because the original domain is dead; none = no page to link. */
  url_status?: "live" | "archive" | "none";
  url_note?: string;
};

export type MapCountry = {
  iso2: string;
  name: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  why?: string;
  verified: boolean;
};

/** One Natural Earth path per country that hosted a competition or fields a
 * partner (landing v4 section 6; emitted by scripts/build-world-map.mjs). */
export type MapRegion = {
  name: string;
  held: number;
  upcoming: number;
  partner: boolean;
  verified: boolean;
  d: string;
};

export type EventsMap = {
  viewBox: [number, number, number, number];
  projection: string;
  updated: string;
  events: MapEvent[];
  countries: MapCountry[];
  regions: MapRegion[];
};

/** public/data/platform.json: the four pillars with their media panel slot. */
export type PlatformMedia = {
  type: "image" | "video";
  src: string;
  poster: string;
  caption: string;
  credit?: string;
};

export type PlatformRow = {
  id: string;
  n: string;
  title: string;
  body: string;
  href: string;
  linkText: string;
  media: PlatformMedia;
};

/** public/data/community.json (seed values; refreshed by scripts/slack_stats.py). */
export type JoinPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit?: string;
};

/** A community LinkedIn post, re-hosted as a native video (landing v4 section 8). */
export type JoinPost = {
  video: string;
  poster: string;
  width: number;
  height: number;
  author: string;
  author_url?: string;
  /** The author's own mark (e.g. /media/join/openrobotics-logo.svg), shown
   * in colour at 28 px left of the author line (landing v5 section 6.6). */
  author_logo?: string;
  post_url: string;
  credit?: string;
  /** One sentence in Cedric's words; never the post text. */
  excerpt?: string;
};

/** YouTube facade: the poster is ours; the embed loads only after a click. */
export type JoinYouTube = {
  poster: string;
  width: number;
  height: number;
  video_id: string;
  /** Set when the entry is a playlist; `video_id` is then its first video. */
  playlist_id?: string;
  title: string;
  channel: string;
  channel_url: string;
  caption: string;
};

/** One card in the About page's video library (public/data/videos.json). */
export type SiteVideo = JoinYouTube & {
  id: string;
  /** The card's headline in our words; `title` stays the video's own. */
  heading: string;
};

/** One community LinkedIn post in the Join strip (landing v5 round two):
 * a poster image (no re-hosted video), who posted it, and the link. */
export type CommunityPost = {
  id: string;
  post_url: string;
  author: string;
  author_url?: string;
  /** Institution or team, shown under the author. */
  affiliation?: string;
  /** ISO date of the post, shown as "Jun 2026". */
  date?: string;
  /** Event tag: icra2026, iv2026, ifac2026, ... */
  event?: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
  /** One sentence in Cedric's words about the post; never the post text. */
  excerpt?: string;
  credit?: string;
};

export type Community = {
  members: number;
  members_display: string;
  timezones: number;
  continents: number;
  updated: string;
  source: string;
  /** Written by the media curator (landing v4 section 9). */
  join?: {
    photo?: JoinPhoto;
    post?: JoinPost;
    youtube?: JoinYouTube;
    /** The looping "from the community" strip (media curator). */
    posts?: CommunityPost[];
  };
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
export const loadPublications = () => loadJson<PublicationsFile>("publications.json");
export const loadTeams = () => loadJson<Team[]>("teams.json");
export const loadVideos = () => loadJson<SiteVideo[]>("videos.json");
export const loadHighlights = () => loadJson<Highlight[]>("highlights.json");
/** An upcoming event whose `ends` date has passed reads as held straight away,
 * the same rule scripts/build-world-map.mjs applies at the next rebuild, so
 * "competitions held" does not wait for someone to regenerate the file. */
export const loadEventsMap = async (): Promise<EventsMap> => {
  const map = await loadJson<EventsMap>("events_map.json");
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...map,
    events: map.events.map((e) =>
      e.status === "upcoming" && e.ends && e.ends < today ? { ...e, status: "held" } : e,
    ),
  };
};
export const loadCommunity = () => loadJson<Community>("community.json");
export const loadPlatform = () => loadJson<PlatformRow[]>("platform.json");
export const loadSpinoffs = () => loadJson<SpinoffsFile>("spinoffs.json");

