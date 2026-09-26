#!/usr/bin/env python3
"""QA /news on the p3-news-merge preview (port 4188): per viewport, a stitched
walk, the lead with its embed, the archive head (chips + first row), a fold
closed and open, a card's LinkedIn post loaded by click; console errors,
failed requests, linkedin.com requests before any click, horizontal overflow
(default and with every fold open), every <img> width/height/alt, a keyboard
walk, axe at 1536 and 390 (default and expanded), reduced motion."""
import base64, io, json, sys, time
from PIL import Image
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4188"
OUT = sys.argv[1]
AXE = "/home/cedric/.venvs/ml/lib/python3.12/site-packages/axe_playwright_python/axe.min.js"
VIEWPORTS = [(1536, 730), (1366, 650), (768, 1024), (390, 844), (844, 390)]
report = {}


def shot(page, cdp, name):
    data = cdp.send("Page.captureScreenshot", {"format": "png"})["data"]
    im = Image.open(io.BytesIO(base64.b64decode(data)))
    im.save(f"{OUT}/{name}.png")
    return im


def settle(page, y, wait=0.8):
    page.evaluate(f"window.scrollTo(0, {y})")
    page.mouse.wheel(0, 1)
    time.sleep(wait)


def to_el(page, selector, offset):
    y = page.evaluate(f"(() => {{ const e = document.querySelector({json.dumps(selector)}); return e ? e.getBoundingClientRect().top + window.scrollY : null }})()")
    if y is None:
        return False
    settle(page, max(0, y - offset))
    return True


def walk(page, cdp, name, w, h):
    total = page.evaluate("document.documentElement.scrollHeight")
    tiles, y = [], 0
    while y < total and len(tiles) < 60:
        settle(page, y, 0.6)
        actual = page.evaluate("window.scrollY")
        data = cdp.send("Page.captureScreenshot", {"format": "png"})["data"]
        tiles.append((actual, Image.open(io.BytesIO(base64.b64decode(data)))))
        if actual + h >= total:
            break
        y += h
    sheet = Image.new("RGB", (tiles[0][1].width, int(min(total, tiles[-1][0] + h))), "white")
    for yy, im in tiles:
        sheet.paste(im, (0, int(yy)))
    sheet.save(f"{OUT}/{name}.png")
    small = sheet.copy()
    small.thumbnail((900, 100000))
    small.save(f"{OUT}/{name}-small.jpg", quality=70)
    return total


OVERFLOW_JS = """() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      // ignore children of a horizontal scroller (the chip row)
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (['auto','scroll','hidden','clip'].includes(cs.overflowX)) { clipped = true; break; }
        p = p.parentElement;
      }
      if (!clipped) out.push((el.tagName + '.' + (el.className && el.className.baseVal === undefined ? el.className : '')).slice(0, 90) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
  }
  return { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, offenders: out.slice(0, 10) };
}"""

IMG_JS = """() => [...document.images].map(i => ({
  src: i.getAttribute('src'), alt: i.hasAttribute('alt') ? i.getAttribute('alt') : null,
  width: i.getAttribute('width'), height: i.getAttribute('height'), loading: i.getAttribute('loading'),
  complete: i.complete, natural: i.naturalWidth,
  decorative_in_hidden_link: !!i.closest('[aria-hidden="true"]') }))"""

AXE_JS = """async () => { const r = await axe.run(document, {resultTypes:['violations']});
  return r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length,
    sample: v.nodes.slice(0, 3).map(n => n.target.join(' '))})) }"""

KEY_JS = """() => { const a = document.activeElement; if (!a || a === document.body) return null;
  const cs = getComputedStyle(a); const r = a.getBoundingClientRect();
  return { tag: a.tagName, text: (a.innerText || a.getAttribute('aria-label') || a.title || '').trim().slice(0, 60),
    expanded: a.getAttribute('aria-expanded'), inFooter: !!a.closest('footer'),
    inArchive: !!a.closest('#all-news') || !!a.closest('section[aria-labelledby="all-news"]'),
    outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow !== 'none',
    onscreen: r.bottom > 0 && r.top < innerHeight && r.width > 0 } }"""


def open_all_folds(page):
    page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)")
    time.sleep(0.5)


def close_all_folds(page):
    page.evaluate("document.querySelectorAll('details').forEach(d => d.open = false)")
    time.sleep(0.3)


def run_axe(page):
    page.add_script_tag(path=AXE)
    return page.evaluate(AXE_JS)


with sync_playwright() as p:
    browser = p.chromium.launch()
    for (w, h) in VIEWPORTS:
        phone = w in (390, 844)
        tag = f"{w}x{h}"
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                  has_touch=phone or w == 768, is_mobile=phone)
        page = ctx.new_page()
        errors, failed, li = [], [], []
        page.on("console", lambda m: errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: failed.append(f"{r.url} {r.failure}") if "localhost" in r.url else None)
        page.on("response", lambda r: failed.append(f"{r.status} {r.url}") if "localhost" in r.url and r.status >= 400 else None)
        page.on("request", lambda r: li.append(r.url) if "linkedin.com" in r.url else None)
        page.goto(f"{BASE}/news", wait_until="load")
        page.wait_for_selector("#all-news", timeout=15000)
        time.sleep(1.5)
        cdp = page.context.new_cdp_session(page)
        R = {}
        R["h1"] = page.evaluate("[...document.querySelectorAll('h1')].map(e => e.textContent)")
        R["overflow_default"] = page.evaluate(OVERFLOW_JS)
        settle(page, 0)
        shot(page, cdp, f"news-{tag}-top")
        # the lead and its embed
        to_el(page, "section[aria-labelledby='news-title'] article", 90)
        time.sleep(4)
        shot(page, cdp, f"news-{tag}-lead")
        R["lead"] = page.evaluate("""(() => { const a = document.querySelector("section[aria-labelledby='news-title'] article");
            const f = a && a.querySelector('iframe');
            return { title: a && a.querySelector('h2').textContent, iframe_title: f && f.title, iframe_src: f && f.src,
                     live: f ? getComputedStyle(f).opacity : null, inert: f ? f.inert : null } })()""")
        # full walk (default state)
        R["height"] = walk(page, cdp, f"news-{tag}-full", w, h)
        R["cards_iframes_before_click"] = page.evaluate("document.querySelectorAll('#all-news ~ * iframe, section[aria-labelledby=\"all-news\"] iframe').length")
        R["linkedin_embed_requests_before_click"] = sorted({u.split('?')[0] for u in li if "/embed/feed/update/" in u})
        R["years"] = page.evaluate("""[...document.querySelectorAll('section[aria-labelledby^="news-year-"]')].map(s => {
            const d = s.querySelector('details');
            return s.querySelector('h3').textContent + ': ' + s.querySelectorAll(':scope > div.grid > article').length + ' shown'
                   + (d ? ', fold "' + d.querySelector('summary').innerText.trim() + '"' : '') })""")
        R["chips"] = page.evaluate("[...document.querySelectorAll('[aria-label=\"Filter news by competition\"] button')].map(b=>b.textContent)")
        # archive head: chips and the first row (the "featured row" of the archive)
        to_el(page, "#all-news", 110 if not phone else 70)
        shot(page, cdp, f"news-{tag}-archive-head")
        # fold closed then open: the first fold (2026 on every size)
        first_fold = "section[aria-labelledby='news-year-2026'] details summary"
        to_el(page, first_fold, int(h * 0.55))
        shot(page, cdp, f"news-{tag}-fold-closed")
        page.click(first_fold)
        time.sleep(1)
        R["fold_2026_open"] = page.evaluate("document.querySelector(\"section[aria-labelledby='news-year-2026'] details\").open")
        shot(page, cdp, f"news-{tag}-fold-open")
        page.click(first_fold)
        time.sleep(0.5)
        R["fold_2026_closed_again"] = not page.evaluate("document.querySelector(\"section[aria-labelledby='news-year-2026'] details\").open")
        if phone:
            # an older year that opens closed on a phone
            to_el(page, "section[aria-labelledby='news-year-2024']", 80)
            shot(page, cdp, f"news-{tag}-2024-closed")
            page.click("section[aria-labelledby='news-year-2024'] details summary")
            time.sleep(1)
            shot(page, cdp, f"news-{tag}-2024-open")
            page.click("section[aria-labelledby='news-year-2024'] details summary")
            time.sleep(0.3)
        # a card's LinkedIn post, by click
        btn = page.locator("section[aria-labelledby='all-news'] button[aria-expanded]", has_text="Show the LinkedIn post").first
        btn.scroll_into_view_if_needed()
        page.mouse.wheel(0, 1)
        time.sleep(0.5)
        before = len({u.split('?')[0] for u in li if "/embed/feed/update/" in u})
        btn.click()
        time.sleep(5)
        info = page.evaluate("""(() => { const b = [...document.querySelectorAll("section[aria-labelledby='all-news'] button[aria-expanded='true']")][0];
            const panel = b && document.getElementById(b.getAttribute('aria-controls')); const f = panel && panel.querySelector('iframe');
            const art = b && b.closest('article');
            return { card: art && art.querySelector('h4').innerText, expanded: b && b.getAttribute('aria-expanded'),
                     label: b && b.innerText, iframe_title: f && f.title, iframe_src: f && f.src, live: f ? getComputedStyle(f).opacity : null } })()""")
        info["embed_requests_before"] = before
        info["embed_requests_after"] = len({u.split('?')[0] for u in li if "/embed/feed/update/" in u})
        R["card_embed"] = info
        page.evaluate("document.querySelector(\"section[aria-labelledby='all-news'] button[aria-expanded='true']\").closest('article').scrollIntoView({block:'start'})")
        page.evaluate(f"window.scrollBy(0, -{90 if not phone else 70})")
        page.mouse.wheel(0, 1)
        time.sleep(0.8)
        shot(page, cdp, f"news-{tag}-card-embed")
        # expanded state: every fold open + that card's post open
        open_all_folds(page)
        R["overflow_expanded"] = page.evaluate(OVERFLOW_JS)
        R["images"] = page.evaluate(IMG_JS)
        if w in (1536, 390):
            R["axe_expanded"] = run_axe(page)
        # close things, re-run axe on the default state in a fresh page below
        R["console_errors"] = list(errors)
        R["failed_local_requests"] = list(failed)
        ctx.close()

        # keyboard walk + default-state axe, fresh page
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                  has_touch=phone or w == 768, is_mobile=phone)
        page = ctx.new_page()
        kerr = []
        page.on("console", lambda m: kerr.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: kerr.append(f"pageerror: {e}"))
        page.goto(f"{BASE}/news", wait_until="load")
        page.wait_for_selector("#all-news")
        time.sleep(1.2)
        if w in (1536, 390):
            R["axe_default"] = run_axe(page)
        # tab through to the footer
        seen, no_ring = [], []
        page.evaluate("document.activeElement && document.activeElement.blur()")
        for i in range(400):
            page.keyboard.press("Tab")
            info = page.evaluate(KEY_JS)
            if not info:
                continue
            seen.append(info)
            if info["tag"] != "IFRAME" and info["outline"].startswith("none") and not info["shadow"]:
                no_ring.append(info)
            if info["inFooter"]:
                break
        summaries = [s for s in seen if s["tag"] == "SUMMARY"]
        toggles = [s for s in seen if s["tag"] == "BUTTON" and s["expanded"] is not None and "LinkedIn" in s["text"]]
        R["keyboard"] = {"tabs": len(seen), "reached_footer": bool(seen and seen[-1]["inFooter"]),
                         "summaries_reached": [s["text"] for s in summaries],
                         "summaries_in_dom": page.evaluate("document.querySelectorAll('summary').length"),
                         "post_toggles_reached": len(toggles),
                         "post_toggles_focusable_in_dom": page.evaluate("[...document.querySelectorAll('button[aria-expanded]')].filter(b => b.offsetParent && !b.closest('details:not([open])')).length"),
                         "no_visible_ring": no_ring[:8],
                         "offscreen_focus": [s for s in seen if not s["onscreen"]][:5]}
        # Enter / Space on the first summary, Enter on the first post toggle
        page.focus(first_fold)
        page.keyboard.press("Enter"); time.sleep(0.4)
        a = page.evaluate("document.querySelector(\"section[aria-labelledby='news-year-2026'] details\").open")
        page.keyboard.press("Space"); time.sleep(0.4)
        b = page.evaluate("document.querySelector(\"section[aria-labelledby='news-year-2026'] details\").open")
        tb = page.locator("section[aria-labelledby='all-news'] button[aria-expanded]", has_text="Show the LinkedIn post").first
        tb.focus()
        page.keyboard.press("Enter"); time.sleep(1.5)
        c = page.evaluate("(() => { const b = document.activeElement; const p = document.getElementById(b.getAttribute('aria-controls')); return [b.getAttribute('aria-expanded'), !!(p && p.querySelector('iframe[title]'))] })()")
        page.keyboard.press("Space"); time.sleep(0.5)
        d = page.evaluate("(() => { const b = document.activeElement; const p = document.getElementById(b.getAttribute('aria-controls')); return [b.getAttribute('aria-expanded'), !!(p && p.querySelector('iframe')), p.hidden] })()")
        R["keyboard"]["summary_enter_opens"] = a
        R["keyboard"]["summary_space_closes"] = not b
        R["keyboard"]["toggle_enter"] = c
        R["keyboard"]["toggle_space_again"] = d
        R["keyboard_console_errors"] = kerr
        ctx.close()
        report[tag] = R
        print(tag, "done", R["height"], "errors", len(R["console_errors"]), flush=True)

    # reduced motion at 390 and 1536
    for (w, h) in [(390, 844), (1536, 730)]:
        phone = w == 390
        ctx = browser.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", device_scale_factor=1,
                                  has_touch=phone, is_mobile=phone)
        page = ctx.new_page()
        errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.goto(f"{BASE}/news", wait_until="load")
        page.wait_for_selector("#all-news")
        time.sleep(1)
        cdp = page.context.new_cdp_session(page)
        # read before any scroll: nothing should wait on a scroll trigger
        faded = page.evaluate("""[...document.querySelectorAll('section[aria-labelledby^="news-year-"] article, section[aria-labelledby="news-title"] article')]
            .filter(a => a.getBoundingClientRect().height > 0)
            .filter(a => { let e = a; while (e && e !== document.body) { const cs = getComputedStyle(e);
                 if (parseFloat(cs.opacity) < 0.99 || (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)')) return true; e = e.parentElement } return false }).length""")
        to_el(page, "#all-news", 70)
        shot(page, cdp, f"news-{w}x{h}-reduced-archive")
        tb = page.locator("section[aria-labelledby='all-news'] button[aria-expanded]", has_text="Show the LinkedIn post").first
        tb.scroll_into_view_if_needed()
        tb.click(); time.sleep(3)
        trans = page.evaluate("""(() => { const b = document.querySelector("section[aria-labelledby='all-news'] button[aria-expanded='true']");
            const chev = b.querySelector('span'); const p = document.getElementById(b.getAttribute('aria-controls'));
            const f = p.querySelector('iframe'); const sum = document.querySelector('summary span[aria-hidden]');
            return { chevron: getComputedStyle(chev).transitionDuration, iframe: f ? getComputedStyle(f).transitionDuration : null,
                     fold_chevron: getComputedStyle(sum).transitionDuration,
                     html_scroll_behavior: getComputedStyle(document.documentElement).scrollBehavior,
                     lenis: document.documentElement.className } })()""")
        page.evaluate("document.querySelector(\"section[aria-labelledby='all-news'] button[aria-expanded='true']\").closest('article').scrollIntoView({block:'start'})")
        page.evaluate("window.scrollBy(0, -80)")
        time.sleep(0.6)
        shot(page, cdp, f"news-{w}x{h}-reduced-card-embed")
        report[f"reduced_{w}x{h}"] = {"articles_faded_or_moved_before_scroll": faded, "transitions": trans, "console_errors": errs}
        ctx.close()

    # a competition filter shows every match unfolded
    ctx = browser.new_context(viewport={"width": 1536, "height": 730})
    page = ctx.new_page()
    page.goto(f"{BASE}/news", wait_until="load")
    page.wait_for_selector("#all-news")
    chip = page.locator("[aria-label='Filter news by competition'] button", has_text="IROS 2024").first
    if chip.count():
        chip.click(); time.sleep(0.8)
        report["filter_iros2024"] = page.evaluate("""({ status: document.querySelector('[aria-live=polite]').innerText,
            articles: document.querySelectorAll('section[aria-labelledby^="news-year-"] article').length,
            details: document.querySelectorAll('section[aria-labelledby="all-news"] details').length })""")
    ctx.close()
    browser.close()

json.dump(report, open(f"{OUT}/report.json", "w"), indent=1)
print("written")
