#!/usr/bin/env python3
"""Harvest each coursekit lecture's YouTube recording and Google Slides deck
into public/data/courses.json (outline.modules[].items[].video_id / slides_url).

Run from the repo root, isolated, with a cache directory outside the repo
(downloaded pages are untrusted data and never live next to this script):

    python3 -I docs/learn/tools/harvest_lecture_media.py --cache <scratch>/u4-pages
    python3 -I docs/learn/tools/harvest_lecture_media.py --cache <dir> --write --check-links

What it does, per outline item:
  - fetches the item's coursekit page (its `href`), once, into --cache;
  - where the item says `video: true`, takes the youtube.com/embed/<id> it
    embeds and checks the id with YouTube oEmbed (HTTP 200 and a title);
  - where the item says `slides: true`, takes the Google Slides deck it embeds
    as https://docs.google.com/presentation/d/<id> (a deck embedded from its
    "Publish to the web" copy, /d/e/2PACX-..., as .../d/e/<id>/pub) and checks
    that it opens without a Google sign-in;
  - an item whose flag is false gets nothing, even if its page embeds one; a
    flag that is true with no embed on the page is reported, never invented.

--check-links re-checks every http(s) URL in the file (the `checked` field
means "every link in the file last answered 200"), allowing the two known
exceptions documented in docs/learn/COURSES_CONTENT.md. --write saves the file
atomically (a temp file in the same directory, then a rename), so a running
Vite dev server never reads it half-written, and sets `checked` to today only
when --check-links passed. Without --write it prints what it found and changes
nothing.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DATA = Path("public/data/courses.json")
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/128.0 Safari/537.36 roboracer-site harvest"
)
PLAIN_UA = "curl/8.5.0"
YT_EMBED = re.compile(r"(?:youtube(?:-nocookie)?\.com/embed/)([A-Za-z0-9_-]{11})")
SLIDES = re.compile(r"docs\.google\.com/presentation/d/((?:e/)?[A-Za-z0-9_-]{20,})")
# Known non-200 links (COURSES_CONTENT.md, Link check): a 404 marked broken and
# never linked, and the Slack invite that answers 403 to scripts.
KNOWN_EXCEPTIONS = ("forms.gle/4UJigTa36VAMyGheA", "join.slack.com")


def fetch_final(url: str, timeout: int = 30, ua: str = UA) -> tuple[int, bytes, str]:
    """Status, body and the address it ended at after redirects."""
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Language": "en"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, b"", url
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        print(f"  ! {url}: {e}", file=sys.stderr)
        return 0, b"", url


def fetch(url: str, timeout: int = 30) -> tuple[int, bytes]:
    status, body, _ = fetch_final(url, timeout)
    return status, body


def slides_url_for(deck: str) -> str:
    base = f"https://docs.google.com/presentation/d/{deck}"
    return f"{base}/pub" if deck.startswith("e/") else base


def slides_open(url: str) -> str | None:
    """None when the deck answers 200 on docs.google.com itself; otherwise why not."""
    status, _, final = fetch_final(url)
    if status != 200:
        return f"HTTP {status}"
    if urllib.parse.urlsplit(final).netloc != "docs.google.com":
        return "asks for a Google sign-in"
    return None


def cached_page(url: str, cache: Path) -> str:
    name = hashlib.sha1(url.encode()).hexdigest()[:16] + ".html"
    path = cache / name
    if not path.exists():
        status, body = fetch(url)
        if status != 200:
            raise RuntimeError(f"{url} answered {status}")
        path.write_bytes(body)
        time.sleep(0.3)
    return path.read_text(encoding="utf-8", errors="replace")


def oembed_title(video_id: str) -> str | None:
    watch = f"https://www.youtube.com/watch?v={video_id}"
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(watch, safe="")
    status, body = fetch(url)
    if status != 200:
        return None
    try:
        title = json.loads(body).get("title")
    except ValueError:
        return None
    return title if isinstance(title, str) and title.strip() else None


def unique(seq: list[str]) -> list[str]:
    seen: list[str] = []
    for s in seq:
        if s not in seen:
            seen.append(s)
    return seen


def with_media(item: dict, video_id: str | None, slides_url: str | None) -> dict:
    """The item with the two fields placed right after `video`, old values dropped."""
    out: dict = {}
    for k, v in item.items():
        if k in ("video_id", "slides_url"):
            continue
        out[k] = v
        if k == "video":
            if video_id:
                out["video_id"] = video_id
            if slides_url:
                out["slides_url"] = slides_url
    return out


def all_urls(node, found: set[str]) -> None:
    if isinstance(node, dict):
        for v in node.values():
            all_urls(v, found)
    elif isinstance(node, list):
        for v in node:
            all_urls(v, found)
    elif isinstance(node, str) and re.fullmatch(r"https?://\S+", node):
        found.add(node)


def check_links(data: dict) -> list[tuple[str, int]]:
    urls: set[str] = set()
    all_urls(data, urls)
    bad: list[tuple[str, int]] = []
    for url in sorted(urls):
        status, _ = fetch(url)
        if status in (403, 429):
            # Some university front pages refuse a browser UA that does not
            # come with a browser's TLS handshake, and answer a plain one.
            status, _, _ = fetch_final(url, ua=PLAIN_UA)
        if status != 200 and not any(x in url for x in KNOWN_EXCEPTIONS):
            bad.append((url, status))
        time.sleep(0.15)
    print(f"links: {len(urls)} unique URLs, {len(bad)} failing (known exceptions allowed)")
    for url, status in bad:
        print(f"  FAIL {status} {url}")
    return bad


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--cache", type=Path, required=True, help="directory for downloaded pages (outside the repo)")
    ap.add_argument("--write", action="store_true", help="save courses.json")
    ap.add_argument("--check-links", action="store_true", help="re-check every URL in the file")
    args = ap.parse_args()

    args.cache.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    report = {"video": [], "slides": [], "missing": [], "extra": []}

    for module in data["outline"]["modules"]:
        items = []
        for item in module["items"]:
            if not (item.get("video") or item.get("slides")):
                items.append(with_media(item, None, None))
                continue
            page = cached_page(item["href"], args.cache)
            vids = unique(YT_EMBED.findall(page))
            decks = unique(SLIDES.findall(page))
            video_id = slides_url = None
            tag = f"{module['id']} {item['label']}"
            if item.get("video"):
                if not vids:
                    report["missing"].append(f"{tag}: video true, no YouTube embed on the page")
                else:
                    title = oembed_title(vids[0])
                    if title:
                        video_id = vids[0]
                        report["video"].append(f"{tag}: {video_id} \"{title}\"")
                    else:
                        report["missing"].append(f"{tag}: {vids[0]} failed oEmbed")
                    if len(vids) > 1:
                        report["extra"].append(f"{tag}: page embeds {len(vids)} videos {vids}; kept the first")
            elif vids:
                report["extra"].append(f"{tag}: video false but the page embeds {vids}; left out")
            if item.get("slides"):
                if not decks:
                    report["missing"].append(f"{tag}: slides true, no Google Slides deck on the page")
                else:
                    candidate = slides_url_for(decks[0])
                    why = slides_open(candidate)
                    if why is None:
                        slides_url = candidate
                        report["slides"].append(f"{tag}: {slides_url}")
                    else:
                        report["missing"].append(f"{tag}: {candidate} does not open ({why}); left out")
                    if len(decks) > 1:
                        report["extra"].append(f"{tag}: page embeds {len(decks)} decks; kept the first")
            elif decks:
                report["extra"].append(f"{tag}: slides false but the page embeds a deck; left out")
            items.append(with_media(item, video_id, slides_url))
        module["items"] = items

    for key in ("video", "slides", "missing", "extra"):
        print(f"{key}: {len(report[key])}")
        for line in report[key]:
            print(f"  {line}")

    links_ok = False
    if args.check_links:
        links_ok = not check_links(data)

    if not args.write:
        print("dry run: nothing written (pass --write)")
        return 0
    if links_ok:
        data["checked"] = dt.date.today().isoformat()
    else:
        print("checked: left as it was (pass --check-links, and every link must answer 200)")
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    fd, tmp = tempfile.mkstemp(dir=DATA.parent, prefix=".courses.", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    os.chmod(tmp, 0o644)
    os.replace(tmp, DATA)
    print(f"wrote {DATA} (checked {data['checked']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
