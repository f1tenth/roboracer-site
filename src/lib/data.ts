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
  /** The race's own site. After the registration deadline it replaces
   * "Register your team" as the spotlight's primary button. */
  site_url?: string;
};

export type PastRace = {
  name: string;
  url: string;
  /** Wayback capture, set when the original site no longer answers. */
  archive?: string;
};

export type Partner = {
  name: string;
  website: string;
  image: string;
  /** Ribbon rest state: the tinted logo (scripts/partner-tint.py, landing v5). */
  image_rest?: string;
  /** Ribbon hover / focus state: the colour logo at the same size. */
  image_hover?: string;
  /** Pixel size of image_rest and image_hover (the trimmed WebPs; `image`,
   * the untrimmed original, has its own). Every <img> of the logo takes its
   * width from this aspect at its fixed height (logoAttrs). Re-read after
   * scripts/partner-tint.py or scripts/partner-trim.py rewrites the files. */
  width: number;
  height: number;
  /** Kind of institution, for the About wall's groups. Absent on older
   * records, which fall back to one ungrouped wall. */
  category?: "university" | "industry" | "organization" | "other";
};

/** Numeric width and height for a partner logo drawn at a fixed height, so
 * the box is right before the file arrives (and "width" is never "auto"). */
export const logoAttrs = (p: Partner, height: number) => ({
  width: p.width > 0 && p.height > 0 ? Math.round((height * p.width) / p.height) : height,
  height,
});

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
  /** Review bookkeeping only; nothing renders it (Cedric, 2026-09-25). */
  status: "verify" | "published";
  source?: string;
  /** Square team photo under public/media/team/ (media curator). */
  photo?: string;
};

/** An image in a spinoff feature (public/media/spinoffs). Every one has a
 * provenance row in docs/ASSET_MANIFEST.md; `source` repeats it for review
 * and is not rendered. */
export type SpinoffImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  source?: string;
};

/** One thing that grew out of the car: a company, a product, a team or an
 * initiative (public/data/spinoffs.json, About section "Spinoffs"). `what`
 * and `origin` are our own sentences drafted from the first-party pages in
 * `source` / `evidence`; an `origin` starting with TODO(content) is a question
 * for Cedric and is not rendered (the entry still is). A missing `logo`,
 * `car` or `preview` drops that slot from the feature. */
export type Spinoff = {
  name: string;
  kind: "company" | "product" | "team" | "initiative";
  /** Shown instead of `kind` when the plain kind would mislead ("nonprofit"). */
  label?: string;
  what: string;
  origin: string | null;
  since: number | null;
  /** The homepage: the preview window links here. */
  url: string;
  /** The company's own mark, shown beside the name. */
  logo?: SpinoffImage | null;
  /** The company's car: the feature's main visual, linking to its page. */
  car?: (SpinoffImage & { name: string; url: string }) | null;
  /** Our own 1280x800 capture of the homepage, framed as a browser window. */
  preview?: SpinoffImage | null;
  /** Review state in the JSON only; nothing on the page shows it. */
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
  /** Wayback capture of `url`, linked instead of it when url_status is archive. */
  archive?: string;
  /** live = answered 200 when last checked; archive = the original site is
   * gone and the timeline links `archive`; none = no page to link. */
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

/** How long a JSON read may take, headers and body, before it counts as
 * failed. A request that never answered used to leave a block on its
 * placeholder for good (the Start here row invisible, /news and /about on
 * their skeletons); after this the caller's failure path runs instead. */
export const READ_TIMEOUT_MS = 8000;

/**
 * fetch + JSON, given up after READ_TIMEOUT_MS through an AbortController.
 * An HTTP error, a malformed body and the timeout all reject. `signal`
 * aborts it early (a section unmounting); `cache` goes through to fetch.
 */
export async function fetchJson<T>(
  url: string,
  { signal, cache }: { signal?: AbortSignal; cache?: RequestCache } = {},
): Promise<T> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), READ_TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  if (signal?.aborted) ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

const loadJson = <T>(name: string): Promise<T> => fetchJson<T>(`${import.meta.env.BASE_URL}data/${name}`);

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
export const loadSpinoffs = () => loadJson<SpinoffsFile>("spinoffs.json");


/** One way in's picture. The landing's phone rows show `thumb`; its tiles
 * (from `desktop:`) show `src` in a 16/10 frame and play `video` over it. */
export type PathMedia = {
  /** 480x300 (16/10) still for the phone rows' small inline image. */
  thumb: string;
  /** Full-size still: the clip's poster, or the photo itself. */
  src: string;
  width: number;
  height: number;
  /** Muted loop for the tile, played only in view and never under reduced
   * motion. */
  video?: string;
  alt: string;
  /** What the picture shows and where it was taken, and `credit`: kept for
   * the record; never rendered (docs/HANDOFF.md section 6). */
  caption?: string;
  credit?: string;
};

/** public/data/paths.json: the ways in that the landing's "Start here" lists
 * (ui/StartHere), plus the two learning tracks the Build and
 * Learn rebuild will render (docs/LEARN_TERRAIN.md). */
export type EntryPath = {
  id: string;
  /** Two-digit index shown in mono beside the label. */
  n: string;
  /** The section's name: "Build". */
  label: string;
  /** One plain sentence under the label. */
  line: string;
  /** Internal route, `/#anchor`, external URL or mailto. */
  href: string;
  /** Verb + object: "Build the car". */
  linkText: string;
  media?: PathMedia;
  /** Personas from the roboracer-audiences skill this path serves. */
  for?: string[];
  /** The track (below) that the path's destination starts. */
  track?: string;
  todo?: string;
};

export type TrackLink = { label: string; href: string };

export type TrackStep = {
  n: string;
  /** Stage id within the track (get-running: sim, build, system). */
  stage?: string;
  title: string;
  body: string;
  href: string;
  links?: TrackLink[];
  note?: string;
};

export type LearningTrack = {
  id: string;
  title: string;
  summary: string;
  /** The site route that hosts the track today. */
  home: string;
  stages?: { id: string; title: string }[];
  /** A figure quoted from the docs; `status: "verify"` until Cedric confirms
   * it may appear on the site. */
  estimate?: { text: string; source: string; status: "verify" | "published" };
  /** Course plans by length, quoted from the course's Start Here page. */
  plans?: {
    source: string;
    options: { weeks: number; modules: string[]; labs: number[]; outcome: string }[];
  };
  steps: TrackStep[];
  help?: TrackLink[];
  materials?: TrackLink[];
};

export type PathsFile = {
  checked: string;
  paths: EntryPath[];
  tracks: LearningTrack[];
};

export const loadPaths = () => loadJson<PathsFile>("paths.json");

/* public/data/courses.json: the course catalog (/learn/courses), one course
 * page per plan or offering (/learn/courses/:id) and the instructors page
 * (/learn/teach). Ported from Dhyey Shah's LMS mock; what was kept, rewritten
 * and dropped is in docs/learn/COURSES_CONTENT.md. Any string starting with
 * TODO(content) is a question for Cedric and is never rendered. */

export type CourseLink = { label: string; href: string };

/** A section head: small kicker, 2 to 5 word title, one-sentence lead. */
export type CourseHeading = { kicker?: string; title: string; lead?: string };

export type CourseImage = { src: string; width: number; height: number; alt: string };

export type CourseHero = {
  eyebrow: string;
  title: string;
  lead: string;
  primary: CourseLink;
  secondary: CourseLink;
};

export type CoursesMeta = {
  /** The Open edX course platform. null until it is public: while null, hide
   * every link to it and every feature with status "platform". */
  lms_url: string | null;
  lms_url_note: string;
  contact: string;
  /** Subject line for the "Email the team" mailto. */
  teach_subject: string;
  slack_url: string;
  /** The course material itself (f1tenth-coursekit.readthedocs.io). */
  coursekit_url: string;
  start_here_url: string;
  syllabus_url: string;
  labs_url: string;
  races_url: string;
  grading_url: string;
  downloads_url: string;
  build_docs_url: string;
  leaderboard_url: string;
  license: { name: string; url: string; summary: string; source: string };
  /** Class time from the syllabus. Not student effort, which is unknown
   * (see effort_note on each plan). */
  class_time: { text: string; source: string };
  /** The coursekit's slide-request form. "broken": do not link it. */
  slide_downloads: { url: string; status: "ok" | "broken"; note: string };
};

export type CourseStat = {
  id: string;
  group: "community" | "course";
  /** Display string ("3,500+", "7"); never parse it. The "members" stat
   * mirrors community.json members_display: prefer that when it is loaded. */
  value: string;
  label: string;
  /** Where the figure comes from. Not rendered. */
  source: string;
};

/** What the course page reads from a plan or an offering. */
type CourseBase = {
  /** Route segment: /learn/courses/:id. Unique across plans and offerings. */
  id: string;
  title: string;
  /** Card body, under 25 words. */
  blurb: string;
  /** ISO dates. null = unknown: render no date line at all (not "TBA");
   * `dates_note` holds the open question. */
  starts: string | null;
  ends: string | null;
  dates_note: string;
  /** null = unknown: render no effort line. `effort_note` says why. */
  effort_hours_per_week: number | null;
  effort_note: string;
};

/** One of the three core offerings, cut from the coursekit's Start Here page. */
export type CoursePlan = CourseBase & {
  kind: "plan";
  weeks: number;
  outcome: string;
  /** outline.modules ids the plan covers, in order. */
  modules: string[];
  /** outline.labs ids the plan assigns (required labs only). */
  labs: string[];
  href: string;
  source: string;
};

/** A university that teaches the course on its own dates. */
export type CourseOffering = CourseBase & {
  kind: "offering";
  institution: string;
  short_name: string;
  /** Course number ("ESE 6150"); null when unknown. */
  code: string | null;
  code_source: string | null;
  /** plans[].id whose outline this offering follows; null when unknown. */
  plan: string | null;
  plan_source: string | null;
  logo: CourseImage;
  website: string;
  links: CourseLink[];
  /** staff[].id */
  staff: string[];
  /** Render only "published". "verify" means the mock listed it but nothing
   * confirms the university teaches the course: no card, no route. */
  status: "published" | "verify";
  note?: string;
  source: string;
};

export type OutlineItem = {
  kind: "lecture" | "tutorial";
  /** The coursekit's number. Lectures skip 14 to 16 and tutorials count on
   * their own, so it is not unique: key on href. */
  number: number;
  /** Display label: "Lecture 9 (optional)", "Lectures 23 to 25", "Tutorial 2". */
  label: string;
  title: string;
  href: string;
  optional?: boolean;
  /** The coursekit page embeds slides / a YouTube recording. */
  slides: boolean;
  video: boolean;
  /** outline.labs ids this lecture assigns. */
  labs?: string[];
};

export type OutlineModule = {
  /** "A" to "G". */
  id: string;
  title: string;
  summary: string;
  href: string;
  items: OutlineItem[];
  /** outline.labs ids, optional ones included. */
  labs: string[];
  /** outline.races ids the module ends with. */
  races: string[];
};

export type OutlineLab = {
  /** "lab-1" to "lab-9", plus "lab-5-optional" (scan matching). */
  id: string;
  number: number;
  label: string;
  title: string;
  href: string;
  /** outline.modules id. */
  module: string;
  optional?: boolean;
};

export type OutlineRace = {
  id: string;
  number: number;
  title: string;
  body: string;
  href: string;
  module: string;
};

/** The real course structure, from the coursekit (source of truth). */
export type CourseOutline = {
  source: string;
  links: CourseLink[];
  modules: OutlineModule[];
  labs: OutlineLab[];
  races: OutlineRace[];
  final_project: { title: string; body: string; weeks: number; href: string; modules: string[] };
};

export type CourseFaq = {
  id: string;
  q: string;
  a: string;
  /** Open question about the answer. Not rendered. */
  note?: string;
};

/** One list for both pages: `pages` says where a feature appears. */
export type CourseFeature = {
  id: string;
  title: string;
  /** Pill text, used by teach.hero.pills. */
  short: string;
  body: string;
  /** available: true on the course site today, render it. platform: true
   * once the Open edX platform is public, render only when meta.lms_url is
   * set. verify: a promise from the mock with no source, never render. */
  status: "available" | "platform" | "verify";
  pages: ("catalog" | "teach")[];
  note?: string;
  source: string;
};

export type CourseStaff = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  project_role: string;
  photo: CourseImage;
  bio: string;
  link: string;
  source: string;
};

export type CoursesFile = {
  version: number;
  updated: string;
  /** Date every link in the file last answered 200. */
  checked: string;
  note: string;
  meta: CoursesMeta;
  /** Page copy for /learn/courses. */
  catalog: {
    hero: CourseHero;
    courses_heading: CourseHeading;
    offerings_heading: CourseHeading;
    features_heading: CourseHeading;
  };
  /** Page copy for /learn/courses/:id, shared by every plan and offering. */
  course: {
    about_heading: string;
    about: string[];
    about_source: string;
    learn_heading: string;
    prerequisites_heading: string;
    outline_heading: string;
    staff_heading: string;
    faq_heading: string;
    open_material: CourseLink;
    ask: CourseLink;
  };
  stats: CourseStat[];
  plans: CoursePlan[];
  offerings: CourseOffering[];
  outline: CourseOutline;
  /** "What you'll learn". A course page lists the items whose module it covers. */
  learn: { text: string; module: string }[];
  prerequisites: { lead: string; items: string[]; not_covered: string[]; source: string };
  staff: CourseStaff[];
  /** Student logistics, on every course page. */
  faq: CourseFaq[];
  features: CourseFeature[];
  /** Page copy and content for /learn/teach. */
  teach: {
    hero: CourseHero & {
      /** features[].id, rendered with their `short` text (respect `status`). */
      pills: string[];
    };
    how_it_works: CourseHeading & {
      steps: { n: number; title: string; body: string }[];
      portals: { id: string; tag: string; title: string; body: string }[];
    };
    /** Heading for the features list (features with "teach" in `pages`). */
    features: CourseHeading;
    /** Heading only: the table itself comes from lectureSelection(). */
    lecture_selection: CourseHeading & { source: string };
    steps: CourseHeading & {
      items: {
        n: number;
        title: string;
        lead: string;
        checklist: string[];
        tip: string;
        links: CourseLink[];
      }[];
    };
    recording: CourseHeading & { tips: { id: string; title: string; body: string }[] };
    resources: CourseHeading & { items: { id: string; title: string; body: string; href: string }[] };
    faq_heading: string;
    faq: CourseFaq[];
    contact: CourseHeading & CourseLink;
  };
};

export const loadCourses = () => loadJson<CoursesFile>("courses.json");

/** A plan or a published offering by route id; undefined for unknown ids and
 * for offerings still marked "verify". */
export function findCourse(c: CoursesFile, id: string): CoursePlan | CourseOffering | undefined {
  return c.plans.find((p) => p.id === id) ?? c.offerings.find((o) => o.id === id && o.status === "published");
}

/** The teach page's "Choose your lectures" table, derived from `plans` and
 * `outline` so it can never disagree with them: one row per module, its
 * required labs, and which plans (by id) include it. */
export function lectureSelection(c: CoursesFile) {
  return c.outline.modules.map((m) => ({
    module: m,
    labs: c.outline.labs.filter((l) => l.module === m.id && !l.optional),
    plans: c.plans.filter((p) => p.modules.includes(m.id)).map((p) => p.id),
  }));
}
