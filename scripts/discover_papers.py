#!/usr/bin/env python3
"""Discover new publications that use or cite the RoboRacer / F1TENTH platform.

Sources (all free, no scraping of Google Scholar):
  * OpenAlex works search: f1tenth, "f1/10", roboracer  (title + abstract + fulltext)
  * Semantic Scholar paper search for the same terms
  * Semantic Scholar citations of the F1TENTH platform paper (O'Kelly et al., PMLR 2020)

Output: data/publications.candidates.json (items with status "candidate") and
docs/publications-candidates.md (a reviewable summary). Items already present in
public/data/publications.json, already in the candidates file, or listed in
data/publications.rejected.json are skipped.

Usage:
  python3 scripts/discover_papers.py [--days 45] [--max 40] [--dry-run]
  S2_API_KEY=... python3 scripts/discover_papers.py   # optional, raises S2 rate limits

Run weekly by .github/workflows/discover-papers.yml, or by hand with /discover-papers.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pubs_lib as L  # noqa: E402

UA = "roboracer-site-publications/1.0 (mailto:contact@roboracer.ai)"
CANDIDATES = Path("data/publications.candidates.json")
REJECTED = Path("data/publications.rejected.json")
CACHE = Path("data/.discover-cache.json")
SUMMARY = Path("docs/publications-candidates.md")
TERMS = ["f1tenth", '"f1/10"', "roboracer"]
PLATFORM_PAPER_TITLE = "F1TENTH: An Open-source Evaluation Environment for Continuous Control and Reinforcement Learning"
KEYWORDS = ("f1tenth", "f1/10", "f1 tenth", "roboracer", "robo racer")


def get_json(url: str, headers: dict | None = None, retries: int = 3) -> dict | None:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", **(headers or {})})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except Exception as e:  # noqa: BLE001
            wait = 2 ** attempt
            print(f"  retry in {wait}s: {url.split('?')[0]} -> {e}", file=sys.stderr)
            time.sleep(wait)
    return None


def s2_headers() -> dict:
    key = os.environ.get("S2_API_KEY")
    return {"x-api-key": key} if key else {}


def openalex_search(since: str) -> list[dict]:
    out: list[dict] = []
    query = " OR ".join(TERMS)
    cursor = "*"
    while cursor:
        url = ("https://api.openalex.org/works?search=" + urllib.parse.quote(query)
               + f"&filter=from_publication_date:{since}&per-page=100&cursor={cursor}&mailto=contact@roboracer.ai")
        d = get_json(url)
        if not d:
            break
        for w in d.get("results", []):
            out.append(openalex_to_item(w))
        cursor = (d.get("meta") or {}).get("next_cursor")
        time.sleep(0.3)
    return out


def openalex_to_item(w: dict) -> dict:
    abstract = ""
    inv = w.get("abstract_inverted_index")
    if inv:
        pos: dict[int, str] = {}
        for word, ps in inv.items():
            for p in ps:
                pos[p] = word
        abstract = " ".join(pos[i] for i in sorted(pos))
    loc = w.get("primary_location") or {}
    venue = (loc.get("source") or {}).get("display_name") or ""
    authors = [a["author"]["display_name"] for a in w.get("authorships", []) if a.get("author")]
    return {
        "title": w.get("title") or "",
        "authors": authors or ["Unknown"],
        "year": w.get("publication_year") or 0,
        "venue": venue,
        "doi": L.norm_doi(w.get("doi")),
        "url": w.get("doi") or loc.get("landing_page_url"),
        "pdf": (w.get("open_access") or {}).get("oa_url"),
        "abstract": abstract[:2000],
        "citations": w.get("cited_by_count", 0),
        "institutions": sorted({i["display_name"] for a in w.get("authorships", []) for i in a.get("institutions", [])}),
        "source": "openalex",
        "type": "journal" if w.get("type") == "article" and venue and "arxiv" not in venue.lower() else "preprint" if "arxiv" in venue.lower() else "conference",
    }


def s2_search(term: str, year_from: int) -> list[dict]:
    out: list[dict] = []
    fields = "title,year,authors,venue,externalIds,openAccessPdf,url,citationCount,abstract"
    offset = 0
    while offset < 300:
        url = (f"https://api.semanticscholar.org/graph/v1/paper/search?query={urllib.parse.quote(term)}"
               f"&year={year_from}-&fields={fields}&limit=100&offset={offset}")
        d = get_json(url, s2_headers())
        if not d or not d.get("data"):
            break
        out.extend(s2_to_item(p) for p in d["data"])
        if "next" not in d:
            break
        offset = d["next"]
        time.sleep(1.1)
    return out


def s2_citations(paper_id: str, limit: int = 1000) -> list[dict]:
    out: list[dict] = []
    fields = "title,year,authors,venue,externalIds,openAccessPdf,url,citationCount,abstract"
    offset = 0
    while offset < limit:
        url = f"https://api.semanticscholar.org/graph/v1/paper/{paper_id}/citations?fields={fields}&limit=100&offset={offset}"
        d = get_json(url, s2_headers())
        if not d or not d.get("data"):
            break
        for c in d["data"]:
            it = s2_to_item(c.get("citingPaper") or {})
            it["cites_platform_paper"] = True
            out.append(it)
        if "next" not in d:
            break
        offset = d["next"]
        time.sleep(1.1)
    return out


def s2_to_item(p: dict) -> dict:
    ext = p.get("externalIds") or {}
    venue = p.get("venue") or ""
    return {
        "title": p.get("title") or "",
        "authors": [a["name"] for a in p.get("authors", [])] or ["Unknown"],
        "year": p.get("year") or 0,
        "venue": venue,
        "doi": L.norm_doi(ext.get("DOI")),
        "arxiv": L.norm_arxiv(ext.get("ArXiv")),
        "url": p.get("url"),
        "pdf": (p.get("openAccessPdf") or {}).get("url"),
        "abstract": (p.get("abstract") or "")[:2000],
        "citations": p.get("citationCount", 0),
        "source": "semanticscholar",
        "type": "preprint" if "arxiv" in venue.lower() or (not venue and ext.get("ArXiv")) else "conference",
    }


def platform_paper_id(cache: dict) -> str | None:
    if cache.get("platform_paper_id"):
        return cache["platform_paper_id"]
    d = get_json("https://api.semanticscholar.org/graph/v1/paper/search?query=" + urllib.parse.quote(PLATFORM_PAPER_TITLE) + "&fields=title,year&limit=3", s2_headers())
    for p in (d or {}).get("data", []):
        if "f1tenth" in (p.get("title") or "").lower():
            cache["platform_paper_id"] = p["paperId"]
            return p["paperId"]
    return None


def relevance(it: dict) -> int:
    t = (it.get("title") or "").lower()
    a = (it.get("abstract") or "").lower()
    score = 0
    if any(k in t for k in KEYWORDS):
        score += 3
    if any(k in a for k in KEYWORDS):
        score += 2
    if it.get("cites_platform_paper"):
        score += 2
    if any(k in t for k in ("autonomous racing", "racing", "head-to-head", "raceline", "1/10", "scale vehicle")):
        score += 1
    return score


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=45)
    ap.add_argument("--max", type=int, default=40)
    ap.add_argument("--min-score", type=int, default=2)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    since = (dt.date.today() - dt.timedelta(days=a.days)).isoformat()
    year_from = int(since[:4])
    data = L.load_data()
    cands = json.loads(CANDIDATES.read_text()) if CANDIDATES.exists() else {"version": 1, "updated": L.today(), "items": []}
    rejected = json.loads(REJECTED.read_text()) if REJECTED.exists() else {"keys": []}
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}

    known: set[str] = set(rejected.get("keys", []))
    for it in data["items"] + cands["items"]:
        known |= L.dedupe_keys(it)

    print(f"searching since {since} ...")
    found: list[dict] = []
    found += openalex_search(since)
    print(f"  openalex: {len(found)}")
    for term in ("f1tenth", "roboracer"):
        r = s2_search(term, year_from)
        print(f"  semantic scholar '{term}': {len(r)}")
        found += r
    pid = platform_paper_id(cache)
    if pid:
        last_seen = cache.get("citations_seen", 0)
        cites = s2_citations(pid)
        cache["citations_seen"] = max(last_seen, len(cites))
        cites = [c for c in cites if (c.get("year") or 0) >= year_from]
        print(f"  citations of the platform paper since {year_from}: {len(cites)}")
        found += cites

    # merge duplicates across sources, keep the richest record
    merged: dict[str, dict] = {}
    for it in found:
        if not it.get("title"):
            continue
        keys = L.dedupe_keys(it)
        hit = next((k for k in keys if k in merged), None)
        if hit:
            base = merged[hit]
            for k, v in it.items():
                if v and not base.get(k):
                    base[k] = v
            base["cites_platform_paper"] = base.get("cites_platform_paper") or it.get("cites_platform_paper", False)
            for k in keys:
                merged[k] = base
        else:
            for k in keys:
                merged[k] = it

    unique = {id(v): v for v in merged.values()}.values()
    new = [it for it in unique if not (L.dedupe_keys(it) & known) and (it.get("year") or 0) >= year_from]
    scored = sorted(((relevance(it), it) for it in new), key=lambda x: (-x[0], -(x[1].get("citations") or 0)))
    scored = [(s, it) for s, it in scored if s >= a.min_score][: a.max]
    print(f"new candidates: {len(scored)}")

    ids = {it["id"] for it in data["items"] + cands["items"]}
    added = []
    for score, it in scored:
        item = {
            "id": L.make_id(it["authors"], it["year"], it["title"]),
            "title": it["title"],
            "authors": it["authors"],
            "year": int(it["year"]),
            "venue": it.get("venue") or ("arXiv preprint" if it.get("arxiv") else ""),
            "venue_short": L.venue_short(it.get("venue") or ("arXiv" if it.get("arxiv") else "")),
            "type": it.get("type", "other"),
            "tags": L.suggest_tags(it["title"], it.get("abstract", ""), it.get("venue", "")),
            "featured": False,
            "status": "candidate",
            "added": L.today(),
            "source": it.get("source", "openalex"),
            "notes": f"relevance score {score}" + (", cites the F1TENTH platform paper" if it.get("cites_platform_paper") else ""),
        }
        for k in ("doi", "arxiv", "url", "pdf", "abstract", "citations", "institutions"):
            if it.get(k):
                item[k] = it[k]
        base, n = item["id"], 2
        while item["id"] in ids:
            item["id"] = f"{base}-{n}"
            n += 1
        ids.add(item["id"])
        cands["items"].append(item)
        added.append(item)

    if a.dry_run:
        for it in added:
            print(f"  [{it['notes']}] {it['year']} {it['title']} ({it.get('venue_short')})")
        return 0

    cands["updated"] = L.today()
    CANDIDATES.parent.mkdir(parents=True, exist_ok=True)
    CANDIDATES.write_text(json.dumps(cands, indent=2, ensure_ascii=False) + "\n")
    CACHE.write_text(json.dumps(cache, indent=2) + "\n")
    SUMMARY.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"# Publication candidates ({L.today()})", "", f"{len(added)} new candidate(s) since {since}. Review with `/add-paper` (accept) or add the id to `data/publications.rejected.json` (reject).", ""]
    for it in added:
        link = it.get("url") or (f"https://doi.org/{it['doi']}" if it.get("doi") else "")
        lines.append(f"- **{it['title']}** ({it['year']}, {it.get('venue_short') or it.get('venue') or 'venue unknown'}) by {', '.join(it['authors'][:3])}{' et al.' if len(it['authors']) > 3 else ''}. Tags: {', '.join(it['tags'])}. {it['notes']}. {link}")
    SUMMARY.write_text("\n".join(lines) + "\n")
    print(f"wrote {CANDIDATES} and {SUMMARY}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
