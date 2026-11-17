"""Turn the crawled coursekit pages into learn-new fragments, images and nav."""
import glob, json, os, re, sys, urllib.parse, urllib.request
from bs4 import BeautifulSoup, NavigableString

RAW, REPO = sys.argv[1], sys.argv[2]
BASE = "https://f1tenth-coursekit.readthedocs.io/en/latest/"
OUTD = os.path.join(REPO, "public", "data", "learn-new")
IMGD = os.path.join(REPO, "public", "learn-new", "img")
os.makedirs(os.path.join(OUTD, "pages"), exist_ok=True)
os.makedirs(IMGD, exist_ok=True)

ROOT = "/learn-new"
SPECIAL = {
    "index": ROOT,
    "introduction/overview": ROOT,
    "introduction/syllabus": f"{ROOT}/syllabus",
    "lectures/ModuleA/index": f"{ROOT}/module-a",
    "lectures/ModuleA/lecture01": f"{ROOT}/module-a/lecture-1",
}
NATIVE = set(SPECIAL)


def route(key):
    return SPECIAL.get(key, f"{ROOT}/doc/{key}")


def key_of(href, page_key):
    """Absolute docs key for a relative .html href, or None."""
    u = urllib.parse.urljoin(BASE + page_key + ".html", href)
    if not u.startswith(BASE):
        return None, None
    rest = u[len(BASE):]
    path, _, frag = rest.partition("#")
    if not path.endswith(".html"):
        return None, None
    return path[:-5], frag


# ---- renaming -----------------------------------------------------------
NAME = re.compile(r"(?<![\w/.-])(?:F1TENTH|F1Tenth|F1tenth|f1tenth)(?![\w/.-]|_)")


def rename(s):
    return NAME.sub("RoboRacer", s)


def rename_tree(root):
    for t in list(root.find_all(string=True)):
        if t.find_parent(["code", "pre", "script", "style"]):
            continue
        if isinstance(t, NavigableString) and NAME.search(str(t)):
            t.replace_with(rename(str(t)))


# ---- images -------------------------------------------------------------
img_done = {}


def fetch_img(src, page_key):
    u = urllib.parse.urljoin(BASE + page_key + ".html", src)
    if u in img_done:
        return img_done[u]
    rel = u.split("/_images/", 1)[1] if "/_images/" in u else os.path.basename(u)
    dest = os.path.join(IMGD, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if not os.path.exists(dest):
        req = urllib.request.Request(u, headers={"User-Agent": "roboracer-docs-export"})
        open(dest, "wb").write(urllib.request.urlopen(req, timeout=60).read())
    if os.path.getsize(dest) > 1_500_000:
        # Repo rule: no binary over 1.5 MB. Keep the file where the docs host it.
        os.remove(dest)
        img_done[u] = BASE + "_images/" + rel
    else:
        img_done[u] = f"{ROOT}/img/{rel}"
    return img_done[u]


def clean_title(t):
    return rename(re.sub(r"[\s]+$", "", t.replace("\xb6", "")).strip())


def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def make_block(soup, label, nodes, media=False):
    div = soup.new_tag("div")
    div["class"] = "doc-block" + (" doc-block--media" if media else "")
    h = soup.new_tag("h2")
    h["class"] = "doc-block-label"
    h["id"] = slug(label)
    h.string = label
    body = soup.new_tag("div")
    body["class"] = "doc-block-body"
    for n in nodes:
        body.append(n.extract() if hasattr(n, "extract") else n)
    div.append(h)
    div.append(body)
    return div


def make_blocks(art, soup):
    """The lecture template (bold labels as definition lists, or a bold line
    followed by an indented embed) becomes boxed sections; embeds go on dark panels."""
    # definition lists: one block per term / description pair
    for dl in list(art.find_all("dl")):
        if dl.find_parent("dl") is not None or dl.find_parent(class_="doc-block"):
            continue
        blocks, prev_overview = [], None
        for dt in dl.find_all("dt", recursive=False):
            label = dt.get_text(" ", strip=True).rstrip(":").strip()
            dd = dt.find_next_sibling("dd")
            if dd is None:
                continue
            nodes = list(dd.children)
            blk = make_block(soup, label, nodes)
            blocks.append(blk)
            if label.lower().startswith("overview"):
                prev_overview = blk
        if not blocks:
            continue
        # stray list right after an "Overview" list belongs to the overview
        if prev_overview is not None:
            nxt = dl.find_next_sibling()
            while nxt is not None and nxt.name in ("ol", "ul"):
                n2 = nxt.find_next_sibling()
                prev_overview.find(class_="doc-block-body").append(nxt.extract())
                nxt = n2
        for b in blocks:
            dl.insert_before(b)
        dl.decompose()
    # "Slides:" / "Video:" lines followed by an indented embed
    for p in list(art.find_all("p")):
        strong = p.find("strong", recursive=False)
        txt = p.get_text(" ", strip=True)
        if strong is None or not txt.endswith(":") or txt != strong.get_text(" ", strip=True):
            continue
        nxt = p.find_next_sibling()
        if nxt is None or nxt.name != "blockquote":
            continue
        media = nxt.find("iframe") is not None
        blk = make_block(soup, txt.rstrip(":").strip(), list(nxt.children), media=media)
        p.insert_before(blk)
        nxt.decompose()
        p.decompose()


pages = {}
for f in sorted(glob.glob(os.path.join(RAW, "*.html"))):
    key = os.path.basename(f)[:-5].replace("__", "/")
    soup = BeautifulSoup(open(f, "rb").read(), "lxml")
    art = soup.select_one("[itemprop=articleBody]")
    h1 = art.find("h1")
    title = clean_title(h1.get_text())
    if key == "index":
        continue
    module = None
    m = re.match(r"lectures/Module([A-G])/", key)
    if m:
        module = m.group(1)
    pages[key] = {"title": title, "to": route(key), "module": module, "native": key in NATIVE}
    if key in NATIVE or key == "press/logos":
        continue

    # headings get ids from their section so the page TOC can jump
    for sec in art.select("div.section[id]"):
        h = sec.find(["h2", "h3"], recursive=False)
        if h is not None and not h.get("id"):
            h["id"] = sec["id"]
    for a in art.select("a.headerlink"):
        a.decompose()
    h1.decompose()
    for s in art.find_all(["script", "style"]):
        s.decompose()

    # links
    for a in art.find_all("a", href=True):
        href = a["href"]
        if href.startswith("#"):
            if href.startswith("#doc-"):
                del a["href"]
            continue
        if re.match(r"https?://(www\.)?roboracer\.ai/learn/courses", href):
            a["href"] = "/learn/courses"
            continue
        if re.match(r"https?:|mailto:", href):
            a["target"] = "_blank"
            a["rel"] = "noopener noreferrer"
            continue
        k, frag = key_of(href, key)
        if k is None:
            continue
        a["href"] = route(k) + ("#" + frag if frag and not frag.startswith("doc-") else "")
    # images
    for im in art.find_all("img"):
        im["src"] = fetch_img(im["src"], key)
        im["loading"] = "lazy"
        im["decoding"] = "async"
        if not im.get("alt") or re.search(r"\.(png|gif|jpe?g)$", im["alt"], re.I) or im["alt"].startswith(".."):
            im["alt"] = f"Figure from {title}"
        for att in ("width", "height"):
            if im.has_attr(att) and not str(im[att]).isdigit():
                del im[att]
    # embeds
    for fr in art.find_all("iframe"):
        for att in ("width", "height", "frameborder", "mozallowfullscreen", "webkitallowfullscreen"):
            if fr.has_attr(att):
                del fr[att]
        fr["loading"] = "lazy"
        if not fr.get("title"):
            fr["title"] = "Slides" if "docs.google.com" in fr.get("src", "") else "Embedded content"
        fr["allowfullscreen"] = ""
    rename_tree(art)
    make_blocks(art, soup)

    out = os.path.join(OUTD, "pages", key + ".html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    inner = "".join(str(c) for c in art.find("div", class_="section").children) if art.find("div", class_="section") else art.decode_contents()
    open(out, "w", encoding="utf8").write(inner)

# ---- navigation tree from the sidebar -------------------------------------
side = BeautifulSoup(open(os.path.join(RAW, "lectures__ModuleB__index.html"), "rb").read(), "lxml").select_one(".wy-menu-vertical")


def walk(ul, page_key="lectures/ModuleB/index"):
    items = []
    for li in ul.find_all("li", recursive=False):
        a = li.find("a", recursive=False)
        if a is None:
            continue
        href = a["href"]
        title = clean_title(a.get_text())
        if re.match(r"https?:", href):
            if "roboracer.ai/learn/courses" in href:
                to = "/learn/courses"
            else:
                to = href
        else:
            k, _ = key_of(href, page_key)
            to = route(k) if k else href
        it = {"title": title, "to": to}
        sub = li.find("ul", recursive=False)
        if sub is not None:
            it["children"] = walk(sub, page_key)
        items.append(it)
    return items


groups = []
for cap in side.find_all("p", class_="caption"):
    ul = cap.find_next_sibling("ul")
    groups.append({"group": clean_title(cap.get_text()), "items": walk(ul)})

json.dump({"pages": pages, "nav": groups}, open(os.path.join(OUTD, "_export.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)
print(len(pages), "pages", len(img_done), "images")
for g in groups:
    print(g["group"], [i["title"] for i in g["items"]][:12])
