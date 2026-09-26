"""p3-fixes-2 L4: which research row files a phone and a laptop fetch.

usage: python3 verify_rows.py [BASE]   (default http://localhost:4192)

Loads /research at 390x844 (DPR 3) and 1536x730, records every
/media/research/ response with its size on load, then after walking the
page to the bottom, and reads each row plate's currentSrc.
"""
import sys
import time

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4192"
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]


def run(p, name, ctx_opts):
    browser = p.chromium.launch(args=ARGS)
    ctx = browser.new_context(**ctx_opts)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    # Sizes from the resource timing entries (encoded bodies), not the
    # response bodies: reading every body held the run past its budget.
    fetched = lambda: page.evaluate("""() => Object.fromEntries(performance.getEntriesByType('resource')
        .filter(e => e.name.includes('/media/research/'))
        .map(e => [e.name.split('/media/research/')[1], e.encodedBodySize || e.transferSize]))""")
    page.goto(BASE + "/research", wait_until="load")
    time.sleep(3)
    on_load = fetched()
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        y += 700
        page.evaluate(f"scrollTo(0,{y})")
        page.mouse.wheel(0, 1)
        time.sleep(0.15)
        h = page.evaluate("document.documentElement.scrollHeight")
    time.sleep(2)
    got = fetched()
    plates = page.evaluate("""() => [...document.querySelectorAll('li picture img')].map(i => ({
        src: (i.currentSrc || '').split('/').pop(), w: i.getAttribute('width'), h: i.getAttribute('height'),
        lazy: i.loading, cssW: Math.round(i.getBoundingClientRect().width)}))""")
    large = [q for q in plates if q["src"] and "-row-320" not in q["src"]]
    kb = lambda d: round(sum(v for v in d.values() if v > 0) / 1024)
    print(f"{name}: on load {len(on_load)} research files, {kb(on_load)} KB; after walk {len(got)} files, {kb(got)} KB", flush=True)
    print(f"{name}: {len(plates)} row plates, {sum(1 for q in plates if q['src'])} loaded, "
          f"{len(large)} drawn from a card-size file; all lazy={all(q['lazy']=='lazy' for q in plates)}; "
          f"all 320x200 attrs={all(q['w']=='320' and q['h']=='200' for q in plates)}; plate css width {plates[0]['cssW'] if plates else '-'}", flush=True)
    for q in large[:20]:
        print(f"  {q['src']}", flush=True)
    print(f"{name}: console errors {errors[:3]}", flush=True)
    browser.close()


with sync_playwright() as p:
    run(p, "390x844@3", dict(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True))
    run(p, "1536x730", dict(viewport={"width": 1536, "height": 730}))
