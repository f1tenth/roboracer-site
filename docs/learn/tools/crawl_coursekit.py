"""Crawl the live coursekit docs: every page's article body + sidebar tree."""
import json, os, re, sys, urllib.request, urllib.parse
from bs4 import BeautifulSoup

BASE = "https://f1tenth-coursekit.readthedocs.io/en/latest/"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "roboracer-docs-export"})
    return urllib.request.urlopen(req, timeout=40).read()

seen, queue, pages = set(), ["index.html"], {}
while queue:
    p = queue.pop(0)
    if p in seen:
        continue
    seen.add(p)
    try:
        raw = get(BASE + p)
    except Exception as e:
        print("FAIL", p, e)
        continue
    open(os.path.join(OUT, p.replace("/", "__")), "wb").write(raw)
    soup = BeautifulSoup(raw, "lxml")
    pages[p] = True
    for a in soup.select(".wy-menu-vertical a.reference.internal, [itemprop=articleBody] a.reference.internal"):
        h = a.get("href", "")
        if h.startswith("#") or not h:
            continue
        u = urllib.parse.urljoin(BASE + p, h)
        if not u.startswith(BASE):
            continue
        u = u[len(BASE):].split("#")[0]
        if u.endswith(".html") and u not in seen:
            queue.append(u)
print(len(pages))
for p in sorted(pages):
    print(p)
