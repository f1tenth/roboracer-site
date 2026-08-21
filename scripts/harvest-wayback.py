#!/usr/bin/env python3
"""Pull images (and optionally pages) of an old site from the Wayback Machine.

Usage:
  python3 scripts/harvest-wayback.py --domain f1tenth.org --out _harvest/wayback [--from 2019 --to 2024] [--pages] [--max 400]
  python3 scripts/harvest-wayback.py --snapshot https://web.archive.org/web/20240109144455/https://f1tenth.org/race.html --out _harvest/wayback

How it works: queries the CDX index for captures of the domain (images by MIME type, or a
single page's captures), downloads the latest good capture of each unique URL using the
`id_` flag (raw bytes, no Wayback toolbar injection), throttled to one request every 1.5 s,
and writes a manifest CSV with original URL, capture timestamp, size, and local path.
Standard library only. Be polite: this is a shared public service.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = "roboracer-site-asset-harvester/1.0 (contact@roboracer.ai; archival of our own former site)"
DELAY = 1.5


def fetch(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def cdx(params: dict) -> list[list[str]]:
    q = urllib.parse.urlencode({**params, "output": "json"})
    rows = fetch("https://web.archive.org/cdx/search/cdx?" + q).decode("utf-8", "replace").strip().splitlines()
    import json

    data = [json.loads(r) for r in rows if r.strip()]
    if not data:
        return []
    if isinstance(data[0], list) and data[0] and data[0][0] == "urlkey":
        return data[1:]
    return data


def local_name(original: str, ts: str) -> str:
    p = urllib.parse.urlparse(original)
    base = Path(p.path).name or "index.html"
    h = hashlib.sha1(original.encode()).hexdigest()[:8]
    return f"{ts[:8]}_{h}_{base}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain")
    ap.add_argument("--snapshot", help="a full web.archive.org/web/<ts>/<url> page URL to pull along with its images")
    ap.add_argument("--out", default="_harvest/wayback")
    ap.add_argument("--from", dest="from_year", default="2018")
    ap.add_argument("--to", dest="to_year", default="2024")
    ap.add_argument("--pages", action="store_true", help="also download HTML pages (latest capture per URL)")
    ap.add_argument("--max", type=int, default=400)
    ap.add_argument("--min-bytes", type=int, default=8000, help="skip icons and tracking pixels")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    manifest = out / "manifest.csv"
    seen = set()
    if manifest.exists():
        with manifest.open() as f:
            for row in csv.DictReader(f):
                seen.add(row["original"])
    rows_out = []

    targets: list[tuple[str, str, str]] = []  # (timestamp, original, mime)
    if a.snapshot:
        m = re.match(r"https?://web\.archive\.org/web/(\d{4,14})[a-z_]*/(.+)", a.snapshot)
        if not m:
            print("bad --snapshot URL", file=sys.stderr)
            return 2
        ts, page = m.group(1), m.group(2)
        html = fetch(f"https://web.archive.org/web/{ts}id_/{page}").decode("utf-8", "replace")
        (out / local_name(page, ts)).write_text(html)
        print(f"saved page {page} @ {ts}")
        base = page
        for src in set(re.findall(r'(?:src|href|data-src|data-background)=["\']([^"\']+\.(?:png|jpe?g|gif|webp|svg|mp4|webm))["\']', html, re.I)):
            targets.append((ts, urllib.parse.urljoin(base, src), "image"))
        for src in set(re.findall(r'url\(["\']?([^"\')]+\.(?:png|jpe?g|gif|webp))["\']?\)', html, re.I)):
            targets.append((ts, urllib.parse.urljoin(base, src), "image"))
    if a.domain:
        params = {
            "url": f"{a.domain}/*",
            "from": a.from_year,
            "to": a.to_year,
            "filter": "statuscode:200",
            "collapse": "urlkey",
            "fl": "timestamp,original,mimetype,length",
            "limit": str(a.max * 3),
        }
        rows = cdx({**params, "filter": "mimetype:image/.*"})
        time.sleep(DELAY)
        rows = [r for r in rows if r[2].startswith("image/") and int(r[3] or 0) >= a.min_bytes]
        targets += [(r[0], r[1], r[2]) for r in rows]
        if a.pages:
            time.sleep(DELAY)
            prow = cdx({**params, "filter": "mimetype:text/html"})
            targets += [(r[0], r[1], r[2]) for r in prow if "?" not in r[1]]
        print(f"cdx: {len(targets)} candidate captures for {a.domain}")

    n = 0
    for ts, original, mime in targets:
        if original in seen or n >= a.max:
            continue
        seen.add(original)
        dest = out / local_name(original, ts)
        try:
            data = fetch(f"https://web.archive.org/web/{ts}id_/{original}")
        except Exception as e:  # noqa: BLE001
            print(f"  skip {original}: {e}", file=sys.stderr)
            time.sleep(DELAY)
            continue
        if len(data) < a.min_bytes and not original.endswith((".svg", ".html")):
            time.sleep(DELAY)
            continue
        dest.write_bytes(data)
        rows_out.append({"original": original, "timestamp": ts, "mime": mime, "bytes": len(data), "local": str(dest)})
        n += 1
        print(f"  [{n}] {ts[:8]} {len(data)//1024:5d} KB  {original}")
        time.sleep(DELAY)

    new_file = not manifest.exists()
    with manifest.open("a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["original", "timestamp", "mime", "bytes", "local"])
        if new_file:
            w.writeheader()
        w.writerows(rows_out)
    print(f"downloaded {n} files -> {out} (manifest: {manifest})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
