#!/usr/bin/env python3
"""QA /news on the p3-news-merge dev server: stitched CDP walks at each
viewport, page heights, console errors, network calls to linkedin.com before
and after a click-to-load, axe, reduced motion."""
import base64, io, json, sys, time
from PIL import Image
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4188"
OUT = sys.argv[1]
VIEWPORTS = [(1536, 730), (1366, 650), (1920, 1080), (768, 1024), (390, 844), (844, 390)]
AXE = "/home/cedric/.venvs/ml/lib/python3.12/site-packages/axe_playwright_python/axe.min.js"
report = {}


def cdp_shot(page, cdp):
    data = cdp.send("Page.captureScreenshot", {"format": "png"})["data"]
    return Image.open(io.BytesIO(base64.b64decode(data)))


def settle(page, y):
    page.evaluate(f"window.scrollTo(0, {y})")
    page.mouse.wheel(0, 1)
    time.sleep(0.8)


def walk(page, cdp, name, w, h, max_tiles=40):
    total = page.evaluate("document.documentElement.scrollHeight")
    tiles = []
    y = 0
    while y < total and len(tiles) < max_tiles:
        settle(page, y)
        actual = page.evaluate("window.scrollY")
        tiles.append((actual, cdp_shot(page, cdp)))
        if actual + h >= total:
            break
        y += h
    dpr = tiles[0][1].width / w
    sheet = Image.new("RGB", (tiles[0][1].width, int(min(total, tiles[-1][0] + h) * dpr)), "white")
    for yy, im in tiles:
        sheet.paste(im, (0, int(yy * dpr)))
    sheet.save(f"{OUT}/news-{w}x{h}-full.png")
    # a light copy for quick viewing
    small = sheet.copy()
    small.thumbnail((900, 100000))
    small.save(f"{OUT}/news-{w}x{h}-full-small.jpg", quality=70)
    return total


with sync_playwright() as p:
    browser = p.chromium.launch()
    for (w, h) in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                  has_touch=w < 900, is_mobile=w < 700)
        page = ctx.new_page()
        errors, li_requests = [], []
        page.on("console", lambda m: errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("request", lambda r: li_requests.append(r.url) if "linkedin.com" in r.url else None)
        page.goto(f"{BASE}/news", wait_until="networkidle")
        page.wait_for_selector("#all-news", timeout=15000)
        time.sleep(1.5)
        cdp = page.context.new_cdp_session(page)
        # top of page
        settle(page, 0)
        cdp_shot(page, cdp).save(f"{OUT}/news-{w}x{h}-top.png")
        # the archive head
        top_archive = page.evaluate("document.getElementById('all-news').getBoundingClientRect().top + window.scrollY")
        settle(page, max(0, top_archive - 120))
        cdp_shot(page, cdp).save(f"{OUT}/news-{w}x{h}-archive.png")
        total = walk(page, cdp, "full", w, h)
        years = page.evaluate("""[...document.querySelectorAll('section[aria-labelledby^="news-year-"]')].map(s => ({
            year: s.querySelector('h3').textContent,
            shown: s.querySelectorAll(':scope > div.grid > article, :scope > div > article').length,
            folded: s.querySelector('details') ? s.querySelector('details summary').textContent.trim() : null }))""")
        chips = page.evaluate("[...document.querySelectorAll('[aria-label=\"Filter news by competition\"] button')].map(b=>b.textContent)")
        h1 = page.evaluate("document.querySelectorAll('h1').length")
        imgs_no_alt = page.evaluate("[...document.images].filter(i => !i.hasAttribute('alt')).map(i=>i.src)")
        imgs_no_dims = page.evaluate("[...document.images].filter(i => !i.getAttribute('width') || !i.getAttribute('height')).map(i=>i.src)")
        before_click = len([u for u in li_requests if "/embed/feed/update/" in u])
        # click-to-load: the first card toggle
        clicked = None
        btn = page.locator("button[aria-expanded]", has_text="Show the LinkedIn post").first
        if btn.count():
            btn.scroll_into_view_if_needed()
            btn.click()
            time.sleep(4)
            clicked = {
                "expanded": btn.get_attribute("aria-expanded"),
                "frames_in_cards": page.evaluate("document.querySelectorAll('article iframe').length"),
                "embed_requests_after": len([u for u in li_requests if "/embed/feed/update/" in u]),
            }
            y = page.evaluate("window.scrollY")
            cdp_shot(page, cdp).save(f"{OUT}/news-{w}x{h}-card-embed.png")
        # open a fold
        fold = page.locator("details summary").first
        fold_info = None
        if fold.count():
            fold.scroll_into_view_if_needed()
            fold.click()
            time.sleep(1)
            fold_info = page.evaluate("document.querySelector('details').open")
            cdp_shot(page, cdp).save(f"{OUT}/news-{w}x{h}-fold-open.png")
        # axe (serious/critical) on the page as it stands
        axe_res = None
        if w in (1536, 390):
            page.add_script_tag(path=AXE)
            axe_res = page.evaluate("""async () => { const r = await axe.run(document, {resultTypes:['violations']});
                return r.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => ({id:v.id, impact:v.impact, n:v.nodes.length, sample:v.nodes.slice(0,3).map(n=>n.target.join(' '))})) }""")
        report[f"{w}x{h}"] = {"height": total, "years": years, "chips": chips, "h1": h1,
                               "imgs_no_alt": imgs_no_alt, "imgs_no_dims": imgs_no_dims,
                               "embed_requests_before_click": before_click, "click": clicked,
                               "fold_opened": fold_info, "console_errors": errors, "axe": axe_res}
        ctx.close()
    # reduced motion at 390
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", has_touch=True, is_mobile=True)
    page = ctx.new_page()
    errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    page.goto(f"{BASE}/news", wait_until="networkidle")
    page.wait_for_selector("#all-news")
    time.sleep(1)
    cdp = page.context.new_cdp_session(page)
    top_archive = page.evaluate("document.getElementById('all-news').getBoundingClientRect().top + window.scrollY")
    settle(page, top_archive)
    cdp_shot(page, cdp).save(f"{OUT}/news-390x844-reduced-archive.png")
    hidden = page.evaluate("""[...document.querySelectorAll('section[aria-labelledby^="news-year-"] article')].filter(a => {
        const r = a.getBoundingClientRect(); const cs = getComputedStyle(a.parentElement);
        return r.height > 0 && parseFloat(getComputedStyle(a).opacity) < 0.99 }).length""")
    report["reduced_390"] = {"console_errors": errs, "cards_not_fully_opaque": hidden}
    ctx.close()
    # JS disabled: what shows
    ctx = browser.new_context(viewport={"width": 1366, "height": 650}, java_script_enabled=False)
    page = ctx.new_page()
    page.goto(f"{BASE}/news")
    time.sleep(1)
    report["js_disabled_text"] = page.evaluate("document.body.innerText.slice(0,300)")
    ctx.close()
    browser.close()

json.dump(report, open(f"{OUT}/report.json", "w"), indent=1)
print(json.dumps(report, indent=1)[:6000])
