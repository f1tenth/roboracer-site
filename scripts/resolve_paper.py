#!/usr/bin/env python3
"""Resolve a paper reference into a draft item for public/data/publications.json.

Usage:
  python3 scripts/resolve_paper.py "<doi | arxiv id | url | path/to/file.pdf>" [--json] [--add] [--featured] [--tags a,b]

Without --add it prints a draft (human readable, or JSON with --json) and a dedupe verdict.
With --add it appends the item (status=published) to public/data/publications.json after dedupe.

Resolution order:
  DOI        -> Crossref (authoritative) then OpenAlex (abstract, OA pdf, citations)
  arXiv id   -> arXiv Atom API, then Semantic Scholar for DOI/venue if published elsewhere
  URL        -> extract DOI or arXiv id from the URL; otherwise fetch the page and look for
                citation_doi / citation_arxiv_id / citation_title meta tags, then resolve
  PDF (path) -> extract text of the first 2 pages (pypdf if installed, else pdftotext),
                find DOI / arXiv id; otherwise use the first long line as a title and query
                Crossref bibliographic search (top hit, flagged "confirm")
Standard library plus optional pypdf. Network calls have a 20 s timeout and a polite User-Agent.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pubs_lib as L  # noqa: E402

UA = "roboracer-site-publications/1.0 (mailto:contact@roboracer.ai)"
DOI_RE = re.compile(r"\b(10\.\d{4,9}/[^\s\"'<>]+)", re.I)
ARXIV_RE = re.compile(r"(?:arxiv\.org/(?:abs|pdf)/|arXiv:\s*)(\d{4}\.\d{4,5})(v\d+)?", re.I)
ARXIV_BARE_RE = re.compile(r"^\d{4}\.\d{4,5}(v\d+)?$")


def get(url: str, headers: dict | None = None, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def get_json(url: str) -> dict | None:
    try:
        return json.loads(get(url, {"Accept": "application/json"}))
    except Exception as e:  # noqa: BLE001
        print(f"  note: {url.split('?')[0]} failed: {e}", file=sys.stderr)
        return None


def from_crossref(doi: str) -> dict | None:
    d = get_json(f"https://api.crossref.org/works/{urllib.parse.quote(doi, safe='')}")
    if not d or "message" not in d:
        return None
    m = d["message"]
    authors = [" ".join(x for x in (a.get("given"), a.get("family")) if x) or a.get("name", "") for a in m.get("author", [])]
    year = None
    for k in ("published-print", "published-online", "issued", "created"):
        parts = (m.get(k) or {}).get("date-parts") or [[None]]
        if parts and parts[0] and parts[0][0]:
            year = parts[0][0]
            break
    ctype = m.get("type", "")
    ptype = "journal" if "journal" in ctype else "conference" if "proceedings" in ctype else "other"
    return {
        "title": " ".join(m.get("title") or []).strip(),
        "authors": authors,
        "year": year,
        "venue": " ".join(m.get("container-title") or m.get("event", {}).get("name", "") and [m["event"]["name"]] or []).strip(),
        "type": ptype,
        "doi": L.norm_doi(m.get("DOI")),
        "url": m.get("URL"),
        "abstract": re.sub(r"<[^>]+>", "", m.get("abstract", "")).strip() or None,
        "source": "crossref",
    }


def from_openalex(doi: str | None = None, arxiv: str | None = None, title: str | None = None) -> dict | None:
    if doi:
        d = get_json(f"https://api.openalex.org/works/https://doi.org/{urllib.parse.quote(doi, safe='/')}?mailto=contact@roboracer.ai")
    elif title:
        d = get_json(f"https://api.openalex.org/works?search={urllib.parse.quote(title)}&per-page=1&mailto=contact@roboracer.ai")
        d = (d or {}).get("results", [None])[0]
    else:
        return None
    if not d or "title" not in d:
        return None
    abstract = None
    inv = d.get("abstract_inverted_index")
    if inv:
        words: dict[int, str] = {}
        for w, positions in inv.items():
            for p in positions:
                words[p] = w
        abstract = " ".join(words[i] for i in sorted(words))
    loc = d.get("primary_location") or {}
    return {
        "title": d.get("title"),
        "authors": [a["author"]["display_name"] for a in d.get("authorships", []) if a.get("author")],
        "year": d.get("publication_year"),
        "venue": (loc.get("source") or {}).get("display_name"),
        "doi": L.norm_doi(d.get("doi")),
        "url": d.get("doi") or loc.get("landing_page_url"),
        "pdf": (d.get("open_access") or {}).get("oa_url"),
        "abstract": abstract,
        "citations": d.get("cited_by_count"),
        "institutions": sorted({i["display_name"] for a in d.get("authorships", []) for i in a.get("institutions", [])}),
        "source": "openalex",
    }


def from_arxiv(aid: str) -> dict | None:
    try:
        xml = get(f"http://export.arxiv.org/api/query?id_list={aid}")
    except Exception as e:  # noqa: BLE001
        print(f"  note: arXiv API failed: {e}", file=sys.stderr)
        return None
    ns = {"a": "http://www.w3.org/2005/Atom", "ar": "http://arxiv.org/schemas/atom"}
    root = ET.fromstring(xml)
    e = root.find("a:entry", ns)
    if e is None or e.find("a:title", ns) is None:
        return None
    title = re.sub(r"\s+", " ", e.findtext("a:title", "", ns)).strip()
    if title.lower().startswith("error"):
        return None
    doi_el = e.find("ar:doi", ns)
    journal = e.findtext("ar:journal_ref", "", ns)
    return {
        "title": title,
        "authors": [a.findtext("a:name", "", ns) for a in e.findall("a:author", ns)],
        "year": int(e.findtext("a:published", "0000", ns)[:4]),
        "venue": journal or "arXiv preprint",
        "type": "conference" if journal else "preprint",
        "arxiv": aid,
        "doi": L.norm_doi(doi_el.text) if doi_el is not None else None,
        "url": f"https://arxiv.org/abs/{aid}",
        "pdf": f"https://arxiv.org/pdf/{aid}",
        "abstract": re.sub(r"\s+", " ", e.findtext("a:summary", "", ns)).strip(),
        "source": "arxiv",
    }


def from_semanticscholar(doi: str | None = None, arxiv: str | None = None) -> dict | None:
    key = f"DOI:{doi}" if doi else f"arXiv:{arxiv}" if arxiv else None
    if not key:
        return None
    fields = "title,year,authors,venue,externalIds,openAccessPdf,url,citationCount,abstract,publicationTypes"
    d = get_json(f"https://api.semanticscholar.org/graph/v1/paper/{urllib.parse.quote(key, safe=':')}?fields={fields}")
    if not d or "title" not in d:
        return None
    ext = d.get("externalIds") or {}
    return {
        "title": d.get("title"),
        "authors": [a["name"] for a in d.get("authors", [])],
        "year": d.get("year"),
        "venue": d.get("venue") or None,
        "doi": L.norm_doi(ext.get("DOI")),
        "arxiv": L.norm_arxiv(ext.get("ArXiv")),
        "url": d.get("url"),
        "pdf": (d.get("openAccessPdf") or {}).get("url"),
        "abstract": d.get("abstract"),
        "citations": d.get("citationCount"),
        "source": "semanticscholar",
    }


def pdf_text(path: Path, pages: int = 2) -> str:
    try:
        from pypdf import PdfReader  # type: ignore

        r = PdfReader(str(path))
        return "\n".join((r.pages[i].extract_text() or "") for i in range(min(pages, len(r.pages))))
    except Exception:  # noqa: BLE001
        try:
            return subprocess.run(["pdftotext", "-l", str(pages), str(path), "-"], capture_output=True, text=True, timeout=60).stdout
        except Exception as e:  # noqa: BLE001
            print(f"  note: cannot read PDF ({e}); install pypdf (pip install pypdf) or poppler", file=sys.stderr)
            return ""


def guess_title_from_text(text: str) -> str | None:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    for ln in lines[:15]:
        if 20 <= len(ln) <= 200 and not re.search(r"@|http|university|department|abstract|arxiv|\d{4}", ln, re.I):
            return ln
    return None


def from_page_meta(url: str) -> dict | None:
    try:
        html = get(url).decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"  note: could not fetch {url}: {e}", file=sys.stderr)
        return None
    meta = {}
    for m in re.finditer(r'<meta\s+[^>]*name=["\'](citation_[a-z_]+|dc\.identifier)["\'][^>]*content=["\']([^"\']+)["\']', html, re.I):
        meta.setdefault(m.group(1).lower(), m.group(2))
    doi = L.norm_doi(meta.get("citation_doi") or (DOI_RE.search(meta.get("dc.identifier", "")) or [None, None])[1] if meta.get("dc.identifier") else None)
    arxiv = L.norm_arxiv(meta.get("citation_arxiv_id", ""))
    if doi or arxiv:
        return {"doi": doi, "arxiv": arxiv}
    if meta.get("citation_title"):
        return {"title": meta["citation_title"], "confirm": True}
    m = DOI_RE.search(html)
    return {"doi": L.norm_doi(m.group(1).rstrip(".,;)"))} if m else None


def merge(*sources: dict | None) -> dict:
    out: dict = {}
    for s in sources:
        if not s:
            continue
        for k, v in s.items():
            if v in (None, "", [], {}):
                continue
            if k not in out or (k == "abstract" and len(str(v)) > len(str(out[k]))):
                out[k] = v
    return out


def resolve(ref: str) -> tuple[dict, list[str]]:
    notes: list[str] = []
    ref = ref.strip()
    doi = arxiv = title = None
    p = Path(ref)
    if p.suffix.lower() == ".pdf" and p.exists():
        txt = pdf_text(p)
        m = DOI_RE.search(txt)
        doi = L.norm_doi(m.group(1).rstrip(".,;)")) if m else None
        m2 = ARXIV_RE.search(txt) or re.search(r"\b(\d{4}\.\d{4,5})(v\d+)?\b", txt[:2000])
        arxiv = L.norm_arxiv(m2.group(1)) if m2 else None
        if not doi and not arxiv:
            title = guess_title_from_text(txt)
            notes.append(f"no DOI/arXiv in PDF; using title guess: {title!r} (confirm)")
    elif ARXIV_BARE_RE.match(ref):
        arxiv = L.norm_arxiv(ref)
    elif DOI_RE.match(ref) or ref.lower().startswith("doi:"):
        doi = L.norm_doi(ref)
    elif ref.startswith("http"):
        m = ARXIV_RE.search(ref)
        if m:
            arxiv = m.group(1)
        else:
            m = DOI_RE.search(urllib.parse.unquote(ref))
            if m:
                doi = L.norm_doi(m.group(1).rstrip(".,;)"))
            else:
                meta = from_page_meta(ref) or {}
                doi, arxiv, title = meta.get("doi"), meta.get("arxiv"), meta.get("title")
                if meta.get("confirm"):
                    notes.append("resolved via page title only (confirm)")
    else:
        title = ref
        notes.append("treated input as a title search (confirm)")

    cr = oa = ax = s2 = None
    if doi:
        cr = from_crossref(doi)
        oa = from_openalex(doi=doi)
        s2 = from_semanticscholar(doi=doi)
    if arxiv:
        ax = from_arxiv(arxiv)
        if ax and ax.get("doi") and not cr:
            cr = from_crossref(ax["doi"])
            oa = from_openalex(doi=ax["doi"])
        s2 = s2 or from_semanticscholar(arxiv=arxiv)
    if not (cr or oa or ax or s2) and title:
        oa = from_openalex(title=title)
        if oa and oa.get("doi"):
            cr = from_crossref(oa["doi"])
            s2 = from_semanticscholar(doi=oa["doi"])
        notes.append("matched by title search, verify it is the right paper")

    m = merge(cr, ax, oa, s2)
    if not m.get("title"):
        raise SystemExit("could not resolve this reference; paste the DOI or arXiv id, or give the title with --title")
    venue = m.get("venue") or ("arXiv preprint" if m.get("arxiv") else "")
    item = {
        "id": L.make_id(m.get("authors") or ["Unknown"], m.get("year") or 0, m["title"]),
        "title": m["title"],
        "authors": m.get("authors") or ["Unknown"],
        "year": int(m.get("year") or 0),
        "venue": venue,
        "venue_short": L.venue_short(venue),
        "type": m.get("type") or ("preprint" if venue.lower().startswith("arxiv") else "conference"),
        "tags": L.suggest_tags(m["title"], m.get("abstract", ""), venue),
        "featured": False,
        "status": "published",
        "added": L.today(),
        "source": "manual",
    }
    for k in ("doi", "arxiv", "url", "pdf", "abstract", "citations", "institutions"):
        if m.get(k):
            item[k] = m[k]
    if item.get("abstract"):
        item["abstract"] = item["abstract"][:2000]
    if not item.get("url"):
        item["url"] = f"https://doi.org/{item['doi']}" if item.get("doi") else f"https://arxiv.org/abs/{item['arxiv']}" if item.get("arxiv") else None
        if not item["url"]:
            del item["url"]
    return item, notes


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--add", action="store_true")
    ap.add_argument("--featured", action="store_true")
    ap.add_argument("--tags", help="comma-separated tag ids to override the suggestion")
    ap.add_argument("--summary", help="one-sentence card summary")
    ap.add_argument("--data", default=str(L.DATA_FILE))
    a = ap.parse_args()

    item, notes = resolve(a.ref)
    if a.tags:
        item["tags"] = [t.strip() for t in a.tags.split(",") if t.strip()]
    if a.featured:
        item["featured"] = True
    if a.summary:
        item["summary"] = a.summary[:280]

    data = L.load_data(Path(a.data))
    dupes = [it["id"] for it in data["items"] if L.dedupe_keys(it) & L.dedupe_keys(item)]
    unknown = [t for t in item["tags"] if t not in {t["id"] for t in data["tags"]}]

    if a.json:
        print(json.dumps({"item": item, "notes": notes, "duplicates": dupes, "unknown_tags": unknown}, indent=2, ensure_ascii=False))
    else:
        print(f"\nTitle:   {item['title']}\nAuthors: {', '.join(item['authors'])}\nYear:    {item['year']}   Venue: {item['venue']} ({item['venue_short']})")
        print(f"DOI:     {item.get('doi', '-')}   arXiv: {item.get('arxiv', '-')}\nURL:     {item.get('url', '-')}\nPDF:     {item.get('pdf', '-')}")
        print(f"Tags:    {', '.join(item['tags'])}   (suggested, override with --tags)\nId:      {item['id']}")
        for n in notes:
            print(f"NOTE:    {n}")
        if dupes:
            print(f"DUPLICATE of existing item(s): {', '.join(dupes)}")
        if unknown:
            print(f"UNKNOWN TAGS: {unknown}")

    if a.add:
        if dupes:
            print("not added: duplicate", file=sys.stderr)
            return 2
        if unknown:
            print("not added: unknown tags", file=sys.stderr)
            return 2
        base, n = item["id"], 2
        ids = {it["id"] for it in data["items"]}
        while item["id"] in ids:
            item["id"] = f"{base}-{n}"
            n += 1
        data["items"].append(item)
        errs = L.validate(data)
        if errs:
            print("validation failed:\n  " + "\n  ".join(errs), file=sys.stderr)
            return 1
        L.save_data(data, Path(a.data))
        print(f"added {item['id']} to {a.data}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
