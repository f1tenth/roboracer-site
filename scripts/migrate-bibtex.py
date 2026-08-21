#!/usr/bin/env python3
"""Migrate the f1tenth/roborace_publications BibTeX into public/data/publications.json.

Usage:
  python3 scripts/migrate-bibtex.py [--bib path/to/pub.bibtex] [--out public/data/publications.json] [--dry-run]

If --bib is omitted the file is downloaded from
https://raw.githubusercontent.com/f1tenth/roborace_publications/main/pub.bibtex

Standard library only. The BibTeX parser is deliberately small: it handles the entry
shapes present in that file (brace or quote delimited fields, nested braces, LaTeX accents).
Review the output: tags are rule-based suggestions and every item is marked featured=false.
"""
from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pubs_lib as L  # noqa: E402

BIB_URL = "https://raw.githubusercontent.com/f1tenth/roborace_publications/main/pub.bibtex"

LATEX = [
    (r"\\'\{?([aeiouyAEIOUY])\}?", lambda m: m.group(1) + "\u0301"),
    (r"\\`\{?([aeiouAEIOU])\}?", lambda m: m.group(1) + "\u0300"),
    (r'\\"\{?([aeiouAEIOU])\}?', lambda m: m.group(1) + "\u0308"),
    (r"\\\^\{?([aeiouAEIOU])\}?", lambda m: m.group(1) + "\u0302"),
    (r"\\~\{?([anoANO])\}?", lambda m: m.group(1) + "\u0303"),
    (r"\\H\{?([oOuU])\}?", lambda m: m.group(1) + "\u030b"),
    (r"\\v\{?([cCsSzZrRnNeE])\}?", lambda m: m.group(1) + "\u030c"),
    (r"\\c\{?([cC])\}?", lambda m: m.group(1) + "\u0327"),
    (r"\\ss\b", lambda m: "ß"),
    (r"\\o\b", lambda m: "ø"),
    (r"\\O\b", lambda m: "Ø"),
    (r"\\ae\b", lambda m: "æ"),
    (r"\\l\b", lambda m: "ł"),
    (r"\\&", lambda m: "&"),
    (r"\\%", lambda m: "%"),
    (r"\\_", lambda m: "_"),
    (r"--", lambda m: "-"),
]


def delatex(s: str) -> str:
    import unicodedata
    for pat, fn in LATEX:
        s = re.sub(pat, fn, s)
    s = unicodedata.normalize("NFC", s)
    s = s.replace("{", "").replace("}", "")
    return re.sub(r"\s+", " ", s).strip()


def split_entries(text: str) -> list[tuple[str, str, str]]:
    """Yield (type, key, body) for each @type{key, body} with balanced braces."""
    out = []
    i = 0
    n = len(text)
    while True:
        at = text.find("@", i)
        if at < 0:
            break
        m = re.match(r"@(\w+)\s*\{", text[at:])
        if not m:
            i = at + 1
            continue
        typ = m.group(1).lower()
        j = at + m.end()  # after '{'
        depth = 1
        k = j
        while k < n and depth:
            c = text[k]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            k += 1
        body = text[j:k - 1]
        key, _, fields = body.partition(",")
        if typ not in {"comment", "string", "preamble"}:
            out.append((typ, key.strip(), fields))
        i = k
    return out


def parse_fields(body: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    i = 0
    n = len(body)
    while i < n:
        m = re.compile(r"\s*(\w+)\s*=\s*").match(body, i)
        if not m:
            i += 1
            continue
        name = m.group(1).lower()
        i = m.end()
        if i >= n:
            break
        if body[i] == "{":
            depth = 1
            j = i + 1
            while j < n and depth:
                if body[j] == "{":
                    depth += 1
                elif body[j] == "}":
                    depth -= 1
                j += 1
            val = body[i + 1:j - 1]
            i = j
        elif body[i] == '"':
            j = i + 1
            while j < n and body[j] != '"':
                j += 1
            val = body[i + 1:j]
            i = j + 1
        else:
            j = i
            while j < n and body[j] not in ",\n":
                j += 1
            val = body[i:j]
            i = j
        fields[name] = val.strip()
        # skip to next comma
        while i < n and body[i] != ",":
            i += 1
        i += 1
    return fields


def parse_authors(raw: str) -> list[str]:
    parts = re.split(r"\s+and\s+", raw)
    out = []
    for p in parts:
        p = delatex(p)
        if "," in p:
            last, first = [x.strip() for x in p.split(",", 1)]
            p = f"{first} {last}".strip()
        if p:
            out.append(p)
    return out


def entry_to_item(typ: str, key: str, f: dict[str, str]) -> dict:
    title = delatex(f.get("title", ""))
    authors = parse_authors(f.get("author", "")) or ["Unknown"]
    year = int(re.search(r"\d{4}", f.get("year", "0")).group(0)) if re.search(r"\d{4}", f.get("year", "")) else 0
    venue = delatex(f.get("journal") or f.get("booktitle") or f.get("school") or f.get("institution") or f.get("publisher") or "")
    doi = L.norm_doi(f.get("doi"))
    arxiv = L.norm_arxiv(f.get("eprint") or f.get("arxivid") or "")
    url = f.get("url") or (f"https://doi.org/{doi}" if doi else None) or (f"https://arxiv.org/abs/{arxiv}" if arxiv else None)
    if not venue and arxiv:
        venue = "arXiv preprint"
    type_map = {"article": "journal", "inproceedings": "conference", "incollection": "conference", "misc": "preprint", "phdthesis": "thesis", "mastersthesis": "thesis", "techreport": "report"}
    item = {
        "id": L.make_id(authors, year, title),
        "title": title,
        "authors": authors,
        "year": year,
        "venue": venue,
        "venue_short": L.venue_short(venue),
        "type": type_map.get(typ, "other"),
        "tags": L.suggest_tags(title, delatex(f.get("abstract", "")), venue),
        "featured": False,
        "status": "published",
        "added": L.today(),
        "source": "bibtex-migration",
        "notes": f"bibtex key {key}",
    }
    if doi:
        item["doi"] = doi
    if arxiv:
        item["arxiv"] = arxiv
    if url:
        item["url"] = url
    if f.get("abstract"):
        item["abstract"] = delatex(f["abstract"])[:2000]
    return item


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bib")
    ap.add_argument("--out", default=str(L.DATA_FILE))
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    text = Path(a.bib).read_text(encoding="utf-8", errors="replace") if a.bib else urllib.request.urlopen(BIB_URL, timeout=30).read().decode("utf-8", "replace")
    entries = split_entries(text)
    data = L.load_data(Path(a.out))
    existing = {k for it in data["items"] for k in L.dedupe_keys(it)}
    ids = {it["id"] for it in data["items"]}
    added, skipped = 0, 0
    for typ, key, body in entries:
        item = entry_to_item(typ, key, parse_fields(body))
        if L.dedupe_keys(item) & existing:
            skipped += 1
            continue
        base = item["id"]
        n = 2
        while item["id"] in ids:
            item["id"] = f"{base}-{n}"
            n += 1
        ids.add(item["id"])
        existing |= L.dedupe_keys(item)
        data["items"].append(item)
        added += 1
    errs = L.validate(data)
    print(f"entries parsed: {len(entries)}, added: {added}, skipped as duplicates: {skipped}, total items: {len(data['items'])}")
    if errs:
        print("validation problems:\n  " + "\n  ".join(errs))
    if a.dry_run:
        return 0
    L.save_data(data, Path(a.out))
    print(f"wrote {a.out}")
    return 1 if errs else 0


if __name__ == "__main__":
    raise SystemExit(main())
