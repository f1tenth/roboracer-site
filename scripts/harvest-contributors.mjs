#!/usr/bin/env node
/**
 * harvest-contributors.mjs
 *
 * Regenerates public/data/contributors.json from the GitHub API.
 *
 * Node 20 ESM, zero npm dependencies. It shells out to the `gh` CLI
 * (`node:child_process`), so it uses whatever credentials `gh auth status`
 * reports. Run it from anywhere:
 *
 *     node scripts/harvest-contributors.mjs
 *
 * Flags:
 *     --cache <dir>   cache every API response under <dir> (fast re-runs)
 *     --no-refine     skip the exact first/last-commit lookups (faster, coarser)
 *     --out <file>    write somewhere other than public/data/contributors.json
 *
 *     --include-private   ALSO harvest the org's private repos. OFF by default,
 *                         and refuses to write anywhere under public/. Its
 *                         output must never be published: it exposes private
 *                         repo names and who is working in them. It exists so
 *                         the true contributor and activity totals can be
 *                         checked against the publishable ones.
 *
 * PRIVACY: this script collects public professional profile data only --
 * login, display name, avatar, company, blog, profile URL. It never reads or
 * stores an email address, a phone number, or a location, and a hard filter
 * (stripPrivate) drops those keys even if the API starts returning them.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- config ----

const ORG = 'f1tenth';
/**
 * Contributors who are active on the project regardless of commit recency.
 *
 * Commit dates are only a proxy for activity: someone can be on the team now
 * and not have pushed to a public repo in a while. Zirui Zang is on xLAB's
 * current members page and Cedric confirmed him directly (2026-08-23), while
 * his last public commit is 2023-03-28. Without this the next harvest would
 * silently move him back to past.
 */
const ACTIVE_OVERRIDES = new Map([
  ['zzangupenn', 'xLAB current members page; confirmed by Cedric 2026-08-23'],
]);
/**
 * Anyone with a commit on or after this instant counts as active.
 *
 * Eighteen months before the 2026-08-23 run. The brief asked for eighteen
 * months and then wrote 2026-02-23, which is six; the words are the
 * requirement and the date was the slip, so the window is the full eighteen
 * (director, 2026-08-23). Changing this constant and re-running is the only
 * thing needed to move the window.
 */
const ACTIVE_SINCE = '2025-02-23T00:00:00Z';

/**
 * GitHub Classroom student-submission repos (`lab-3-wall-following-team_05`,
 * `project-opponent-prediction-mpc-team_05`, ...). They are real repos in the
 * org and their contributors are real people, so they are harvested -- but a
 * commit in one is coursework, not a contribution to the platform, so it does
 * not set `platform_contributor`.
 */
const CLASSROOM_RE = /^(lab-?\d|project-)/i;

/** Automation accounts. Never people. */
const BOT_RE = new RegExp(
  '^(' +
    [
      'dependabot', 'dependabot-preview', 'github-actions', 'github-classroom',
      'renovate', 'renovate-bot', 'allcontributors', 'imgbot', 'codecov',
      'greenkeeper', 'snyk-bot', 'stale', 'mergify', 'semantic-release-bot',
      'actions-user', 'web-flow', 'invalid-email-address', 'copilot',
      'pre-commit-ci', 'readthedocs-assistant', 'netlify',
    ].join('|') +
    ')(\\[bot\\])?$',
  'i',
);

/**
 * Deliberate identity merges: <duplicate login> -> <canonical login>.
 * Only fill this in when the evidence is unambiguous (same display name AND
 * overlapping repos, or one account publicly states it supersedes the other).
 * Each entry must carry a `why` in docs/content/contributors.report.md.
 */
const MERGE_INTO = {
  // "alias-login": "canonical-login",
};

// ------------------------------------------------------------------ cli -----

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const INCLUDE_PRIVATE = flag('--include-private');
const CACHE_DIR = value('--cache', process.env.HARVEST_CACHE_DIR || null);
const REFINE = !flag('--no-refine');
const OUT_JSON = path.resolve(value('--out', path.join(ROOT, 'public/data/contributors.json')));
const OUT_SCHEMA = path.join(path.dirname(OUT_JSON), 'contributors.schema.json');

if (INCLUDE_PRIVATE && (!argv.includes('--out') || /(^|\/)public\//.test(OUT_JSON))) {
  process.stderr.write(
    '--include-private produces data that must NOT be published. Re-run with an ' +
      'explicit --out <file> pointing outside public/.\n',
  );
  process.exit(2);
}

if (CACHE_DIR) mkdirSync(CACHE_DIR, { recursive: true });

const log = (...a) => process.stderr.write(a.join(' ') + '\n');

// ------------------------------------------------------------- gh helper ----

let apiCalls = 0;
let privateRepoCount = 0;

/** Run `gh api <args>`; returns { status, headers, body }. */
function ghRaw(endpoint, { headers = false } = {}) {
  const args = ['api'];
  if (headers) args.push('-i');
  args.push('-H', 'Accept: application/vnd.github+json', endpoint);
  apiCalls += 1;
  try {
    const out = execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    return { status: 200, raw: out };
  } catch (err) {
    const raw = `${err.stdout || ''}${err.stderr || ''}`;
    let status = 0;
    const m = raw.match(/HTTP (\d{3})/);
    if (m) status = Number(m[1]);
    else if (/\bNot Found\b/.test(raw)) status = 404;
    else if (/rate limit|abuse|secondary/i.test(raw)) status = 429;
    return { status: status || 500, raw, error: raw.trim().split('\n').slice(0, 2).join(' ') };
  }
}

const sleep = (ms) => {
  // Node 20: synchronous sleep without pulling in a dependency.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

const cacheKey = (s) => createHash('sha1').update(s).digest('hex').slice(0, 24);

/** null, [], or {} -- i.e. "no data", including GitHub's 202 stats placeholder. */
const isEmptyish = (v) =>
  v === null ||
  v === undefined ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

/**
 * GET one endpoint as JSON. Retries 202 (stats still computing) and
 * secondary-rate-limit responses. Returns null on 404/empty.
 */
function gh(endpoint, { retry202 = 0, allow404 = true } = {}) {
  const cf = CACHE_DIR ? path.join(CACHE_DIR, `${cacheKey(endpoint)}.json`) : null;
  if (cf && existsSync(cf)) {
    const cached = JSON.parse(readFileSync(cf, 'utf8'));
    return cached.v;
  }
  let attempt = 0;
  for (;;) {
    const res = ghRaw(endpoint);
    if (res.status === 200) {
      let parsed;
      try {
        parsed = res.raw.trim() ? JSON.parse(res.raw) : null;
      } catch {
        parsed = null;
      }
      // gh exits 0 on a 202 from the stats endpoints; the body is `{}` (an
      // empty OBJECT, not an empty string and not an empty array), which is
      // why this check cannot just test for null.
      if (isEmptyish(parsed) && attempt < retry202) {
        attempt += 1;
        log(`    stats not ready, retry ${attempt}/${retry202} ...`);
        sleep(3000 * attempt);
        continue;
      }
      // Never cache an emptyish value: a 202 "stats still computing" looks
      // exactly like one and would poison the cache for every later run.
      if (cf && !isEmptyish(parsed)) writeFileSync(cf, JSON.stringify({ v: parsed }));
      return parsed;
    }
    if (res.status === 202 && attempt < retry202) {
      attempt += 1;
      log(`    202 computing, retry ${attempt}/${retry202} ...`);
      sleep(3000 * attempt);
      continue;
    }
    if (res.status === 429 && attempt < 5) {
      attempt += 1;
      log(`    rate limited, backing off ${10 * attempt}s ...`);
      sleep(10000 * attempt);
      continue;
    }
    if (res.status === 404 || res.status === 409 || res.status === 451) {
      if (!allow404) throw new Error(`${endpoint}: HTTP ${res.status}`);
      return null;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `GitHub auth/permission failure on ${endpoint} (HTTP ${res.status}). ` +
          `Check \`gh auth status\`. Refusing to write a partial harvest.\n${res.error}`,
      );
    }
    throw new Error(`${endpoint}: HTTP ${res.status} ${res.error || ''}`);
  }
}

/** GET a paginated list endpoint, concatenated. */
function ghList(endpoint, { max = Infinity } = {}) {
  const out = [];
  for (let page = 1; page <= 20; page += 1) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const chunk = gh(`${endpoint}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    out.push(...chunk);
    if (chunk.length < 100 || out.length >= max) break;
  }
  return out;
}

// --------------------------------------------------------------- helpers ----

/** Logins dropped as automation, for the report. */
const botsSeen = new Set();

function isBot(user) {
  if (!user || !user.login) return true;
  const bot = user.type === 'Bot' || user.login.endsWith('[bot]') || BOT_RE.test(user.login);
  if (bot) botsSeen.add(user.login);
  return bot;
}

const day = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);

/** Drop anything that is not public professional data. */
function stripPrivate(profile) {
  const { login, name, avatar_url, company, blog, html_url } = profile || {};
  const clean = (v) => {
    const s = typeof v === 'string' ? v.trim() : '';
    return s ? s : null;
  };
  return {
    login,
    name: clean(name),
    avatar_url: clean(avatar_url),
    profile_url: clean(html_url) || (login ? `https://github.com/${login}` : null),
    company: clean(company),
    blog: clean(blog),
  };
}

// ------------------------------------------------------------- harvesting ---

/** Every repo in the org, classified. */
function listRepos() {
  // NB: do NOT add `sort=full_name` here -- GitHub silently caps that variant
  // of the endpoint at a single short page (49 of 203 repos, then empties).
  const all = ghList(`orgs/${ORG}/repos`);
  // PUBLIC REPOS ONLY. A token with `repo` scope and org membership also sees
  // the org's private repos (as of 2026-08-23: 154 of 203, almost all of them
  // GitHub Classroom student-submission repos). Names and commit counts drawn
  // from a private repo must never be published on roboracer.ai, so they are
  // dropped here rather than filtered downstream.
  const repos = all
    .filter((r) => INCLUDE_PRIVATE || !r.private)
    .sort((a, b) => a.name.localeCompare(b.name));
  privateRepoCount = INCLUDE_PRIVATE ? 0 : all.length - repos.length;
  return repos.map((r) => ({
    name: r.name,
    fork: r.fork,
    archived: r.archived,
    created_at: r.created_at,
    default_branch: r.default_branch,
    classroom: CLASSROOM_RE.test(r.name),
  }));
}

/**
 * Contributions to a normal (non-fork) repo, from the stats endpoint: one call
 * gives every contributor with per-week commit counts. Week timestamps are
 * UTC Sunday week-starts; exact dates are recovered later by refineDates().
 */
function statsContributions(repo) {
  const stats = gh(`repos/${ORG}/${repo}/stats/contributors`, { retry202: 5 });
  // null == GitHub never finished computing the stats (repeated 202s). That is
  // not the same as "nobody has committed", so fall back to walking the commit
  // list rather than silently reporting an empty repo. (`vesc-release` sits
  // here permanently: its one commit has an unlinked author, so GitHub has
  // nothing to compute and returns 202 forever.)
  if (!Array.isArray(stats)) return null;
  const rows = [];
  for (const entry of stats) {
    if (!entry || !entry.author || isBot(entry.author)) continue;
    const weeks = (entry.weeks || []).filter((w) => w.c > 0);
    if (weeks.length === 0) continue;
    rows.push({
      login: entry.author.login,
      commits: entry.total,
      first: new Date(Math.min(...weeks.map((w) => w.w)) * 1000).toISOString(),
      last: new Date(Math.max(...weeks.map((w) => w.w)) * 1000).toISOString(),
      exact: false,
    });
  }
  return rows;
}

/**
 * Contributions to a fork. A commit only counts when it is BOTH ahead of the
 * parent AND authored on or after the fork was created. Both halves are
 * needed: `f1tenth/edx-platform` tracks an Open edX release branch that
 * upstream has since deleted, so comparing it against `openedx:master` reports
 * 29 commits ahead -- but 25 of those are upstream release engineering from
 * before the fork existed, by 10 Open edX developers who never worked on
 * RoboRacer. The date floor cuts them and leaves the 4 genuinely original
 * commits. Falls back to "commits on our default branch since the fork was
 * created" when the parent branch is gone entirely.
 */
/** Last-resort contributor count: walk the default branch commit by commit. */
function commitWalkContributions(repo) {
  const commits = ghList(`repos/${ORG}/${repo.name}/commits?sha=${encodeURIComponent(repo.default_branch)}`);
  const by = new Map();
  for (const c of commits) {
    if (!c || !c.author || isBot(c.author)) continue;
    const date = (c.commit && c.commit.author && c.commit.author.date) || null;
    if (!date) continue;
    const cur = by.get(c.author.login) || { login: c.author.login, commits: 0, first: date, last: date, exact: true };
    cur.commits += 1;
    if (date < cur.first) cur.first = date;
    if (date > cur.last) cur.last = date;
    by.set(c.author.login, cur);
  }
  return [...by.values()];
}

function forkContributions(repo) {
  const meta = gh(`repos/${ORG}/${repo.name}`);
  const parent = meta && meta.parent;
  let commits = null;
  let strategy = 'none';

  if (parent) {
    const base = `${parent.owner.login}:${parent.default_branch}`;
    const head = repo.default_branch;
    const cmp = gh(`repos/${ORG}/${repo.name}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}?per_page=1`);
    if (cmp && typeof cmp.ahead_by === 'number') {
      strategy = `compare ${base}...${head} (ahead_by=${cmp.ahead_by})`;
      if (cmp.ahead_by === 0) return { rows: [], strategy, ahead: 0 };
      commits = [];
      for (let page = 1; page <= 20; page += 1) {
        const c = gh(`repos/${ORG}/${repo.name}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}?per_page=250&page=${page}`);
        const batch = (c && c.commits) || [];
        commits.push(...batch);
        if (batch.length < 250) break;
      }
    }
  }

  if (commits === null) {
    strategy = `commits since fork creation ${repo.created_at}`;
    commits = ghList(`repos/${ORG}/${repo.name}/commits?sha=${encodeURIComponent(repo.default_branch)}&since=${repo.created_at}`);
  }

  const by = new Map();
  let predatingFork = 0;
  for (const c of commits) {
    if (!c || !c.author || isBot(c.author)) continue;
    const date = (c.commit && c.commit.author && c.commit.author.date) || null;
    if (!date) continue;
    // Cannot be original to this org: it existed before the fork did.
    if (repo.created_at && date < repo.created_at) { predatingFork += 1; continue; }
    const cur = by.get(c.author.login) || { login: c.author.login, commits: 0, first: date, last: date, exact: true };
    cur.commits += 1;
    if (date < cur.first) cur.first = date;
    if (date > cur.last) cur.last = date;
    by.set(c.author.login, cur);
  }
  const rows = [...by.values()];
  return {
    rows,
    strategy: predatingFork
      ? `${strategy}; dropped ${predatingFork} commit(s) predating the fork`
      : strategy,
    // Attributable original commits -- commits whose author GitHub could not
    // link to an account are counted by neither this nor any contributor.
    ahead: rows.reduce((sum, r) => sum + r.commits, 0),
  };
}

/**
 * Turn a week-bucket date into a real commit date. One extra call for the
 * newest commit, two for the oldest (the last page of the author's commit
 * list). Only ever run on the single repo that produced a contributor's
 * extreme, so it costs ~3 calls per person, not per person per repo.
 */
/**
 * The name a contributor signs their commits with, used only when their GitHub
 * profile has no display name. This is not invention: it is the name already
 * published in the repo's own history. Junk that git records by default
 * (machine names, bare logins, email addresses) is rejected rather than shown.
 */
function commitAuthorNames(repo, login) {
  const c = gh(`repos/${ORG}/${repo}/commits?author=${encodeURIComponent(login)}&per_page=30`);
  if (!Array.isArray(c)) return [];
  const usable = (raw) => {
    if (typeof raw !== 'string') return null;
    const n = raw.trim();
    if (n.length < 2 || n.length > 60) return null;
    // A bare login, a machine name (DESKTOP-XXX\user), or an email is not a
    // name anybody chose to be known by. Leave those null.
    if (n.toLowerCase() === login.toLowerCase()) return null;
    if (/[\\/@<>]/.test(n)) return null;
    if (!/[A-Za-z]/.test(n)) return null;
    return n;
  };
  return c.map((x) => usable(x && x.commit && x.commit.author && x.commit.author.name)).filter(Boolean);
}

function exactCommitDate(repo, login, which) {
  const endpoint = `repos/${ORG}/${repo}/commits?author=${encodeURIComponent(login)}&per_page=1`;
  if (which === 'last') {
    const c = gh(endpoint);
    return Array.isArray(c) && c[0] ? c[0].commit.author.date : null;
  }
  const res = ghRaw(endpoint, { headers: true });
  if (res.status !== 200) return null;
  const link = (res.raw.match(/^link:\s*(.+)$/im) || [])[1] || '';
  const lastPage = (link.match(/[?&]page=(\d+)>;\s*rel="last"/) || [])[1];
  const c = gh(lastPage ? `${endpoint}&page=${lastPage}` : endpoint);
  return Array.isArray(c) && c[0] ? c[0].commit.author.date : null;
}

// ------------------------------------------------------ schema + validate ---

const SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://roboracer.ai/data/contributors.schema.json',
  title: 'RoboRacer contributors',
  description:
    'Public GitHub contributors to the RoboRacer (f1tenth) organisation. Public professional profile data only: no email addresses, no phone numbers, no locations, nothing from a personal-life source.',
  type: 'object',
  additionalProperties: false,
  required: ['generated_at', 'source', 'orgs', 'active_since', 'stats', 'contributors'],
  properties: {
    generated_at: { type: 'string', format: 'date-time' },
    source: { type: 'string', enum: ['github'] },
    orgs: { type: 'array', minItems: 1, items: { type: 'string' } },
    active_since: {
      type: 'string',
      format: 'date-time',
      description: 'A contributor is active when last_commit is on or after this instant.',
    },
    stats: {
      type: 'object',
      additionalProperties: false,
      required: ['repos_scanned', 'private_repos_excluded', 'repos_with_commits', 'classroom_repos', 'contributors', 'active', 'past', 'platform_contributors'],
      properties: {
        repos_scanned: {
          type: 'integer',
          minimum: 0,
          description: 'Public repos in the org. Private repos are never harvested.',
        },
        private_repos_excluded: { type: 'integer', minimum: 0 },
        repos_with_commits: { type: 'integer', minimum: 0 },
        classroom_repos: { type: 'integer', minimum: 0 },
        contributors: { type: 'integer', minimum: 0 },
        active: { type: 'integer', minimum: 0 },
        past: { type: 'integer', minimum: 0 },
        platform_contributors: { type: 'integer', minimum: 0 },
      },
    },
    contributors: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'login', 'name', 'name_source', 'avatar_url', 'profile_url', 'company', 'blog',
          'commits', 'commits_platform', 'first_commit', 'last_commit',
          'active', 'platform_contributor', 'repos',
        ],
        properties: {
          login: { type: 'string', minLength: 1 },
          name: { type: ['string', 'null'] },
          name_source: {
            type: ['string', 'null'],
            enum: ['github_profile', 'commit_author', null],
            description: 'Where `name` came from. commit_author = the profile has no display name, so the name they sign commits with is used.',
          },
          avatar_url: { type: ['string', 'null'] },
          profile_url: { type: 'string' },
          company: { type: ['string', 'null'] },
          blog: { type: ['string', 'null'] },
          commits: { type: 'integer', minimum: 1 },
          commits_platform: {
            type: 'integer',
            minimum: 0,
            description: 'Commits outside GitHub Classroom student-submission repos.',
          },
          first_commit: { type: 'string', format: 'date' },
          last_commit: { type: 'string', format: 'date' },
          active: { type: 'boolean' },
          platform_contributor: {
            type: 'boolean',
            description: 'True when commits_platform > 0, i.e. this person touched the platform itself, not only a course-lab submission.',
          },
          aliases: {
            type: 'array',
            description: 'Other GitHub logins merged into this entry.',
            items: { type: 'string' },
          },
          repos: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'commits', 'classroom'],
              properties: {
                name: { type: 'string' },
                commits: { type: 'integer', minimum: 1 },
                classroom: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
};

/** Minimal JSON Schema validator: the subset SCHEMA actually uses. */
function validate(node, schema, pointer = '#', errors = []) {
  const fail = (msg) => errors.push(`${pointer}: ${msg}`);
  const types = [].concat(schema.type || []);
  if (types.length) {
    const actual =
      node === null ? 'null'
      : Array.isArray(node) ? 'array'
      : Number.isInteger(node) ? 'integer'
      : typeof node === 'number' ? 'number'
      : typeof node;
    const ok = types.some((t) => t === actual || (t === 'number' && actual === 'integer'));
    if (!ok) {
      fail(`expected ${types.join('|')}, got ${actual}`);
      return errors;
    }
  }
  if (schema.enum && !schema.enum.includes(node)) fail(`${JSON.stringify(node)} not in enum`);
  if (typeof node === 'string') {
    if (schema.minLength != null && node.length < schema.minLength) fail('too short');
    if (schema.format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(node)) fail(`not a date: ${node}`);
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(node))) fail(`not a date-time: ${node}`);
  }
  if (typeof node === 'number' && schema.minimum != null && node < schema.minimum) fail('below minimum');
  if (Array.isArray(node)) {
    if (schema.minItems != null && node.length < schema.minItems) fail('too few items');
    if (schema.items) node.forEach((v, i) => validate(v, schema.items, `${pointer}/${i}`, errors));
  }
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const key of schema.required || []) {
      if (!(key in node)) fail(`missing required property "${key}"`);
    }
    for (const [key, v] of Object.entries(node)) {
      const sub = (schema.properties || {})[key];
      if (!sub) {
        if (schema.additionalProperties === false) fail(`unexpected property "${key}"`);
        continue;
      }
      validate(v, sub, `${pointer}/${key}`, errors);
    }
  }
  return errors;
}

// ---------------------------------------------------------- atomic write ----

function writeAtomic(file, text) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

// ------------------------------------------------------------------ main ----

function main() {
  // Fail fast and loudly rather than half-harvesting.
  const me = gh('user', { allow404: false });
  if (!me || !me.login) throw new Error('gh is not authenticated (`gh api user` returned nothing).');
  log(`authenticated as ${me.login}`);

  const repos = listRepos();
  log(
    INCLUDE_PRIVATE
      ? `${repos.length} repos in ${ORG} INCLUDING PRIVATE ONES -- do not publish this output`
      : `${repos.length} public repos in ${ORG} (${privateRepoCount} private repos excluded)`,
  );

  /** login -> { repos: Map<name,{commits,classroom}>, first, last, exactFirst, exactLast, firstRepo, lastRepo } */
  const people = new Map();
  const notes = { forks: [], skipped: [], empty: [], stats_unavailable: [] };

  const add = (repo, row) => {
    const login = MERGE_INTO[row.login] || row.login;
    let p = people.get(login);
    if (!p) {
      p = { login, aliases: new Set(), repos: new Map(), first: row.first, last: row.last, firstRepo: repo.name, lastRepo: repo.name, exactFirst: row.exact, exactLast: row.exact };
      people.set(login, p);
    }
    if (login !== row.login) p.aliases.add(row.login);
    const cur = p.repos.get(repo.name) || { commits: 0, classroom: repo.classroom };
    cur.commits += row.commits;
    p.repos.set(repo.name, cur);
    if (row.first < p.first) { p.first = row.first; p.firstRepo = repo.name; p.exactFirst = row.exact; }
    if (row.last > p.last) { p.last = row.last; p.lastRepo = repo.name; p.exactLast = row.exact; }
  };

  repos.forEach((repo, i) => {
    log(`[${i + 1}/${repos.length}] ${repo.name}${repo.fork ? ' (fork)' : ''}${repo.classroom ? ' (classroom)' : ''}`);
    try {
      if (repo.fork) {
        const { rows, strategy, ahead } = forkContributions(repo);
        notes.forks.push({ name: repo.name, strategy, original_commits: ahead, contributors: rows.length });
        if (rows.length === 0) notes.skipped.push(`${repo.name} (fork, no original commits: ${strategy})`);
        if (ahead === 0) notes.empty.push(repo.name);
        rows.forEach((r) => add(repo, r));
      } else {
        let rows = statsContributions(repo.name);
        if (rows === null) {
          log(`    .. stats unavailable for ${repo.name}, walking the commit list`);
          notes.stats_unavailable.push(repo.name);
          rows = commitWalkContributions(repo);
        }
        {
          if (rows.length === 0) notes.empty.push(repo.name);
          rows.forEach((r) => add(repo, r));
        }
      }
    } catch (err) {
      if (/auth\/permission/.test(err.message)) throw err;
      log(`    !! ${err.message}`);
      notes.skipped.push(`${repo.name} (error: ${err.message.slice(0, 120)})`);
    }
  });

  // Exact dates for the two endpoints of each person's timeline.
  if (REFINE) {
    log(`refining exact first/last commit dates for ${people.size} contributors ...`);
    for (const p of people.values()) {
      try {
        if (!p.exactLast) {
          const d = exactCommitDate(p.lastRepo, p.login, 'last');
          if (d && d > p.last) p.last = d;
        }
        if (!p.exactFirst) {
          const d = exactCommitDate(p.firstRepo, p.login, 'first');
          if (d && d < p.first) p.first = d;
        }
      } catch (err) {
        log(`    !! date refine ${p.login}: ${err.message.slice(0, 100)}`);
      }
    }
  }

  // Profiles.
  log(`fetching ${people.size} public profiles ...`);
  const contributors = [];
  for (const p of people.values()) {
    const profile = gh(`users/${encodeURIComponent(p.login)}`) || { login: p.login };
    if (isBot(profile)) continue;
    const repoList = [...p.repos.entries()]
      .map(([name, v]) => ({ name, commits: v.commits, classroom: v.classroom }))
      .sort((a, b) => b.commits - a.commits || a.name.localeCompare(b.name));
    const commits = repoList.reduce((s, r) => s + r.commits, 0);
    const commitsPlatform = repoList.filter((r) => !r.classroom).reduce((s, r) => s + r.commits, 0);
    const base = stripPrivate(profile);
    let nameSource = base.name ? 'github_profile' : null;
    if (!base.name) {
      // Scan every repo they touched: git's default author name is often just
      // the login in one repo and the person's real name in another. Take the
      // name they used most often.
      const tally = new Map();
      for (const r of repoList) {
        for (const n of commitAuthorNames(r.name, p.login)) {
          tally.set(n, (tally.get(n) || 0) + 1);
        }
      }
      const best = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      if (best) { base.name = best[0]; nameSource = 'commit_author'; }
    }
    const entry = {
      ...base,
      name_source: nameSource,
      commits,
      commits_platform: commitsPlatform,
      first_commit: day(p.first),
      last_commit: day(p.last),
      active: p.last >= ACTIVE_SINCE || ACTIVE_OVERRIDES.has(p.login),
      platform_contributor: commitsPlatform > 0,
      repos: repoList,
    };
    if (p.aliases.size) entry.aliases = [...p.aliases].sort();
    contributors.push(entry);
  }

  contributors.sort(
    (a, b) => b.commits - a.commits || a.login.toLowerCase().localeCompare(b.login.toLowerCase()),
  );

  const active = contributors.filter((c) => c.active).length;
  const data = {
    generated_at: new Date().toISOString(),
    source: 'github',
    orgs: [ORG],
    active_since: ACTIVE_SINCE,
    stats: {
      repos_scanned: repos.length,
      private_repos_excluded: privateRepoCount,
      repos_with_commits: new Set(contributors.flatMap((c) => c.repos.map((r) => r.name))).size,
      classroom_repos: repos.filter((r) => r.classroom).length,
      contributors: contributors.length,
      active,
      past: contributors.length - active,
      platform_contributors: contributors.filter((c) => c.platform_contributor).length,
    },
    contributors,
  };

  const errors = validate(data, SCHEMA);
  if (errors.length) {
    log('SCHEMA VALIDATION FAILED:');
    errors.slice(0, 40).forEach((e) => log('  ' + e));
    process.exit(1);
  }

  writeAtomic(OUT_SCHEMA, JSON.stringify(SCHEMA, null, 2) + '\n');
  writeAtomic(OUT_JSON, JSON.stringify(data, null, 2) + '\n');

  notes.bots_excluded = [...botsSeen].sort();
  if (process.env.HARVEST_NOTES) writeAtomic(process.env.HARVEST_NOTES, JSON.stringify(notes, null, 2) + '\n');

  console.log(
    `contributors.json: ${contributors.length} contributors ` +
      `(${active} active since ${ACTIVE_SINCE.slice(0, 10)}, ${contributors.length - active} past, ` +
      `${data.stats.platform_contributors} outside course labs) from ${repos.length} public ${ORG} repos ` +
      `(${privateRepoCount} private excluded), ` +
      `${apiCalls} API calls, schema OK -> ${path.relative(ROOT, OUT_JSON)}`,
  );
}

try {
  main();
} catch (err) {
  log(`\nHARVEST ABORTED: ${err.message}`);
  process.exit(1);
}
