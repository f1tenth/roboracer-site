#!/usr/bin/env python3
"""Make a 1200x750 WebP thumbnail for every featured paper and fill `thumbnail` in
public/data/publications.json.

Strategy per paper (first that works):
  1. arXiv HTML rendering (https://arxiv.org/html/<id>): the first <img> inside a
     <figure> (class ltx_figure / ltx_graphics). Best-looking and the figure authors
     chose first. Recorded as "arxiv-html figure 1".
  2. PDF page 1 (the paper's `pdf` field, or https://arxiv.org/pdf/<id>): rasterize with
     pdftoppm at 110 dpi and crop the top 60% (title, authors, usually the teaser figure).
     Recorded as "pdf page 1 crop".
Output: public/media/research/research-<id>-1200.webp (under 120 KB, quality stepped
down until it fits) and a row in docs/media/THUMBS.md with source and license note.

Usage: python3 scripts/paper_thumbs.py [--only id1,id2] [--force]
Needs: pdftoppm (poppler-utils), cwebp or ImageMagick `magick`, network access.
Untested against the live arXiv HTML layout as of 2026-08-21: verify the first run's
output images by eye (Read the WebP files) before committing.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

PUBS = Path("public/data/publications.json")
OUT_DIR = Path("public/media/research")
LOG = Path("docs/media/THUMBS.md")
UA = "roboracer-site-thumbs/1.0 (mailto:contact@roboracer.ai)"
MAX_BYTES = 120 * 1024
W, H = 1200, 750


def get(url: str, binary: bool = False) -> bytes | str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def arxiv_id(p: dict) -> str | None:
    a = p.get("arxiv")
    if a:
        return str(a).replace("arXiv:", "").strip()
    for field in ("url", "pdf"):
        m = re.search(r"arxiv\.org/(?:abs|pdf|html)/(\d{4}\.\d{4,5})(v\d+)?", p.get(field) or "")
        if m:
            return m.group(1)
    return None


def first_figure_url(aid: str) -> str | None:
    base = f"https://arxiv.org/html/{aid}"
    try:
        page = get(base)
    except Exception as e:  # noqa: BLE001
        print(f"  arxiv html unavailable ({e})")
        return None
    assert isinstance(page, str)
    # Figures first; fall back to any ltx_graphics image.
    for pat in (
        r'<figure[^>]*class="[^"]*ltx_figure[^"]*"[^>]*>.*?<img[^>]+src="([^"]+)"',
        r'<img[^>]+class="[^"]*ltx_graphics[^"]*"[^>]+src="([^"]+)"',
    ):
        m = re.search(pat, page, re.S)
        if m:
            src = html.unescape(m.group(1))
            if src.startswith("http"):
                return src
            return f"{base.rstrip('/')}/{src.lstrip('/')}"
    return None


def to_webp(src_path: Path, out_path: Path) -> bool:
    """Fit into a 1200x750 box (cover, center crop) and step quality down to the byte cap."""
    for q in (82, 74, 66, 58, 50):
        if shutil.which("magick"):
            cmd = [
                "magick", str(src_path), "-resize", f"{W}x{H}^", "-gravity", "center",
                "-extent", f"{W}x{H}", "-quality", str(q), str(out_path),
            ]
        else:
            cmd = ["cwebp", "-quiet", "-q", str(q), "-resize", str(W), "0", str(src_path), "-o", str(out_path)]
        if subprocess.run(cmd, capture_output=True).returncode != 0:
            return False
        if out_path.stat().st_size <= MAX_BYTES:
            return True
    return out_path.exists()


def pdf_page1(pdf_url: str, tmp: Path) -> Path | None:
    pdf = tmp / "paper.pdf"
    try:
        pdf.write_bytes(get(pdf_url, binary=True))  # type: ignore[arg-type]
    except Exception as e:  # noqa: BLE001
        print(f"  pdf unavailable ({e})")
        return None
    if subprocess.run(["pdftoppm", "-f", "1", "-l", "1", "-r", "110", "-png", str(pdf), str(tmp / "p")], capture_output=True).returncode != 0:
        return None
    pngs = sorted(tmp.glob("p*.png"))
    if not pngs:
        return None
    page = pngs[0]
    cropped = tmp / "crop.png"
    # Top 60% of the page: title block and, for most papers, the teaser figure.
    subprocess.run(["magick", str(page), "-gravity", "north", "-crop", "100%x60%+0+0", "+repage", str(cropped)], capture_output=True)
    return cropped if cropped.exists() else page


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    only = {s.strip() for s in args.only.split(",") if s.strip()}

    data = json.loads(PUBS.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for p in data["items"]:
        if not p.get("featured") or (only and p["id"] not in only):
            continue
        out = OUT_DIR / f"research-{p['id']}-1200.webp"
        if out.exists() and not args.force:
            print(f"{p['id']}: exists")
            continue
        print(f"{p['id']}: {p['title'][:70]}")
        aid = arxiv_id(p)
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            source = None
            if aid:
                fig = first_figure_url(aid)
                if fig:
                    try:
                        raw = tmp / ("fig" + Path(fig).suffix.split("?")[0])
                        raw.write_bytes(get(fig, binary=True))  # type: ignore[arg-type]
                        if to_webp(raw, out):
                            source = f"arxiv-html figure 1 ({fig})"
                    except Exception as e:  # noqa: BLE001
                        print(f"  figure fetch failed ({e})")
            if not source:
                pdf_url = p.get("pdf") or (f"https://arxiv.org/pdf/{aid}" if aid else None)
                if pdf_url:
                    page = pdf_page1(pdf_url, tmp)
                    if page and to_webp(page, out):
                        source = f"pdf page 1 crop ({pdf_url})"
            if source:
                p["thumbnail"] = f"/media/research/{out.name}"
                rows.append((p["id"], source, out.stat().st_size))
                print(f"  ok <- {source} ({out.stat().st_size // 1024} KB)")
            else:
                rows.append((p["id"], "NONE - needs a manual image", 0))
                print("  no thumbnail")

    PUBS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    with LOG.open("a") as f:
        f.write("\n| id | source | bytes | license note |\n|---|---|---|---|\n")
        for pid, src, size in rows:
            note = "arXiv non-exclusive license, displayed as a teaser with attribution" if "arxiv" in src else "page render, attribution"
            f.write(f"| {pid} | {src} | {size} | {note} |\n")
    print(f"updated {PUBS}; log in {LOG}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
