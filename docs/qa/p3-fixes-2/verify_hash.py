"""p3-fixes-2: hash landings (M1, M2) and Back/Forward on a hash entry (L2).

usage: python3 verify_hash.py [BASE]   (default http://localhost:4192)

M1: direct loads of each hash URL at 1536x730 and 390x844; after the hold the
eyebrow's top must be at or below the nav bar's bottom and the heading must be
fully inside the window. /#start must still put its section's top at y = 0.
M2: the same /about#about-spinoffs load with every /data/*.json delayed
2.5 s and scroll anchoring off (overflow-anchor: none, as Safari), final spot
must match (2.5 s and 6 s, both inside the 10 s hold; the old 4 s hold
missed the 6 s case). L2: on / click "Start here", scroll on, Back, Forward: Forward
must return to the scrolled spot, not glide back to #start.
"""
import sys
import time

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4192"
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
VIEWPORTS = {"1536": dict(width=1536, height=730), "390": dict(width=390, height=844)}
CASES = [
    ("/about#about-spinoffs", "about-spinoffs"),
    ("/about#about-start", "about-start"),
    ("/race#leaderboard", "leaderboard"),
    ("/#start", "start"),
]
NO_ANCHOR = "*{overflow-anchor:none!important}"

MEASURE = """(id) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const nav = document.querySelector('.navbar').getBoundingClientRect();
  // The eyebrow and heading: the target's own when it is a section,
  // its header's when it is the h2.
  const header = el.tagName === 'H2' ? el.closest('header') : el.querySelector('header');
  const h2 = el.tagName === 'H2' ? el : header.querySelector('h2');
  const eyebrow = header.querySelector('p');
  const r = (e) => e.getBoundingClientRect();
  return {
    y: Math.round(scrollY), navBottom: Math.round(nav.bottom), innerH: innerHeight,
    targetTop: Math.round(r(el).top), margin: getComputedStyle(el).scrollMarginTop,
    eyebrowTop: Math.round(r(eyebrow).top), h2Top: Math.round(r(h2).top), h2Bottom: Math.round(r(h2).bottom),
    focused: document.activeElement === el,
  };
}"""


def land(browser, vp, url, tid, slow=0.0, wait=5.0):
    ctx = browser.new_context(viewport=vp)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    if slow:
        page.add_init_script(
            "document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');"
            f"s.textContent='{NO_ANCHOR}';document.head.append(s)}})"
        )
        # Every /data/*.json fetch starts `slow` seconds late, all at once.
        page.add_init_script(
            "const f=window.fetch;window.fetch=(i,o)=>{const u=String(i&&i.url||i);"
            "return /\\/data\\/[^/]+\\.json/.test(u)?"
            f"new Promise(r=>setTimeout(r,{int(slow*1000)})).then(()=>f(i,o)):f(i,o)}}"
        )
    page.goto(BASE + url, wait_until="load")
    time.sleep(wait)
    m = page.evaluate(MEASURE, tid)
    ctx.close()
    return m, errors


def m1_ok(m, tid):
    if tid == "start":
        return abs(m["targetTop"]) <= 1 and m["eyebrowTop"] >= m["navBottom"]
    return m["eyebrowTop"] >= m["navBottom"] and m["h2Bottom"] <= m["innerH"]


def main():
    bad = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(args=ARGS)
        for vname, vp in VIEWPORTS.items():
            for url, tid in CASES:
                m, errors = land(browser, vp, url, tid)
                ok = m1_ok(m, tid)
                bad += not ok
                print(f"M1 {vname} {url}: {m} errors={len(errors)} {'OK' if ok else 'BAD'}", flush=True)
            for slow in (2.5, 6.0):
                m, errors = land(browser, vp, "/about#about-spinoffs", "about-spinoffs", slow=slow, wait=slow + 4.0)
                ok = m1_ok(m, "about-spinoffs")
                bad += not ok
                print(f"M2 {vname} /about#about-spinoffs json+{slow}s no-anchoring: {m} {'OK' if ok else 'BAD'}", flush=True)

        # L2
        for vname, vp in VIEWPORTS.items():
            ctx = browser.new_context(viewport=vp)
            page = ctx.new_page()
            page.goto(BASE + "/", wait_until="load")
            time.sleep(2.0)
            sel = "a.nav-primary[href='/#start']" if vname == "1536" else "a.nav-primary-bar[href='/#start']"
            page.locator(sel).first.click()
            time.sleep(2.5)
            y1 = page.evaluate("scrollY")
            page.evaluate("scrollTo(0, scrollY + 1500)")
            page.mouse.wheel(0, 1)
            time.sleep(1.0)
            y2 = page.evaluate("scrollY")
            page.go_back()
            time.sleep(1.5)
            y3 = page.evaluate("scrollY")
            # The click focused #start; start Forward from nowhere.
            page.evaluate("document.activeElement && document.activeElement.blur()")
            page.go_forward()
            samples = []
            for dt in (0.1, 0.5, 1.5):
                time.sleep(dt - (samples and [0.1, 0.5][len(samples) - 1] or 0))
                samples.append(page.evaluate("scrollY"))
            focus = page.evaluate("document.activeElement && document.activeElement.id")
            ok = abs(samples[-1] - y2) <= 2 and abs(samples[0] - y2) <= 2 and focus != "start"
            bad += not ok
            print(f"L2 {vname} / Start here {y1} -> scrolled {y2} -> back {y3} -> forward {samples} (want {y2}) focus={focus!r} {'OK' if ok else 'BAD'}", flush=True)
            ctx.close()
        browser.close()
    print("ALL OK" if not bad else f"{bad} BAD")


if __name__ == "__main__":
    main()
