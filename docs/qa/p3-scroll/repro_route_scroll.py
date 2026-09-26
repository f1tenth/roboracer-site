"""Route-change scroll reproduction (Cedric, 2026-09-25).

"When we switch pages it doesn't start from the beginning of scrolling."

Per profile (mouse at 1536x730 with Lenis, reduced motion, touch at 390x844):
scroll the landing to ~50%, open /about, /research, /race, /news from the nav
(the phone menu on touch), then Back, then Forward; a click from a scrolled
/about to /; a click while a Lenis glide is still moving; Back from a
scrolled /about. A recorder samples window.scrollY on every animation frame;
the route has committed once document.title changes (Layout sets it in the
same commit that resets the scroll), and every frame after that must read 0.
Hash targets must land on their element: "Start here" (/#start) from a
scrolled /about, full loads of /#start and /rules#kill-switch. Back/Forward
inside one page (a rulebook anchor, the landing's "Start here") must return
exactly where each entry was left, and Lenis must still smooth-scroll the
landing after a round trip.

Usage: python3 repro_route_scroll.py [base_url] [profiles]
       (defaults: http://localhost:4183 mouse,reduced,touch)
"""
import json
import os
import sys
import tempfile
import time

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4183"
SAMPLES_MS = [0, 100, 500, 1500]
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

PROFILES = {
    "mouse": dict(viewport={"width": 1536, "height": 730}),
    "reduced": dict(viewport={"width": 1536, "height": 730}, reduced_motion="reduce"),
    "touch": dict(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, device_scale_factor=2),
}

STATE_JS = """() => {
  const d = document.documentElement;
  const max = Math.max(1, d.scrollHeight - innerHeight);
  return {path: location.pathname + location.hash, y: Math.round(scrollY),
          top: Math.round(d.scrollTop), h: d.scrollHeight, pct: +(scrollY / max * 100).toFixed(1),
          lenis: d.classList.contains('lenis')};
}"""


def state(page):
    return page.evaluate(STATE_JS)


def settle_scroll(page, frac):
    """Scroll to frac of the page height the way the reader would (Lenis synced)."""
    page.evaluate("f => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f)", frac)
    time.sleep(0.4)
    page.mouse.move(700, 400)
    page.mouse.wheel(0, 1)
    time.sleep(1.0)
    return state(page)


RECORDER_JS = """() => {
  // One sample per animation frame: what the reader actually sees. The route
  // has committed once document.title changes (Layout sets it in the same
  // layout effect that resets the scroll).
  const title0 = document.title;
  const t0 = performance.now();
  const frames = [];
  let stop = false;
  const tick = () => {
    frames.push({t: Math.round(performance.now() - t0), y: Math.round(scrollY), path: location.pathname + location.hash,
                 committed: document.title !== title0, h: document.documentElement.scrollHeight});
    if (!stop && performance.now() - t0 < 6000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__rec = {frames, end: () => { stop = true; return frames; }};
}"""


def sample_after(page, action, want_path, settle=1.8):
    """Run action; sample scrollY every frame from the first frame after the new
    route committed (title changed) and report it at +0/+100/+500/+1500 ms."""
    page.evaluate(RECORDER_JS)
    action()
    page.wait_for_function("p => location.pathname === p", arg=want_path, timeout=15000)
    page.wait_for_function("() => window.__rec.frames.some(f => f.committed)", timeout=15000)
    time.sleep(settle)
    frames = page.evaluate("() => window.__rec.end()")
    first = next(i for i, fr in enumerate(frames) if fr["committed"])
    c0 = frames[first]["t"]
    after = frames[first:]
    out = []
    for ms in SAMPLES_MS:
        fr = next((fr for fr in after if fr["t"] - c0 >= ms), after[-1])
        out.append(dict(fr, t=ms, pct=round(fr["y"] / max(1, fr["h"] - 730) * 100, 1), lenis=None))
    s = state(page)
    out[-1]["lenis"] = s["lenis"]
    out[-1]["pct"] = s["pct"]
    ys_all = [fr["y"] for fr in after]
    return {"route_ms": c0, "samples": out, "frames_after": len(after), "min_y": min(ys_all), "max_y": max(ys_all), "final": s}


def nav_click(page, href, profile):
    if profile == "touch":
        # Phone: open the menu and tap the link inside it.
        def act():
            page.locator("button[aria-controls]").first.click()
            page.locator(f".mobile-menu a[href='{href}']").first.click()
        return act
    return lambda: page.locator(f".nav-links a[href='{href}']").first.click()


def verdict(res, expect=0, tol=2):
    ys = [s["y"] for s in res["samples"]]
    # Every frame after the commit, not only the four samples.
    ok = abs(res["min_y"] - expect) <= tol and abs(res["max_y"] - expect) <= tol and abs(res["final"]["y"] - expect) <= tol
    return ("OK " if ok else "BAD") + " ys=" + ",".join(str(y) for y in ys) + f" (all frames {res['min_y']}..{res['max_y']}, final {res['final']['y']})"


def run_profile(p, name, opts, log):
    browser = p.chromium.launch(args=ARGS)
    ctx = browser.new_context(**opts)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))

    def rec(case, before, res, expect=0):
        v = verdict(res, expect)
        line = f"[{name}] {case}: before={before['path']} y={before['y']} ({before['pct']}%) h={before['h']} -> {v}"
        last = res["samples"][-1]
        line += f" | after h={res['final']['h']} pct={res['final']['pct']}% lenis={last['lenis']} commit={res['route_ms']}ms"
        print(line, flush=True)
        log.append({"profile": name, "case": case, "before": before, "result": res, "verdict": v})

    for target in ["/about", "/research", "/race", "/news"]:
        page.goto(BASE + "/", wait_until="load")
        time.sleep(1.5)
        before = settle_scroll(page, 0.5)
        res = sample_after(page, nav_click(page, target, name), target)
        rec(f"/ -> {target} (nav click)", before, res)
        # Back to the landing.
        before = state(page)
        res = sample_after(page, lambda: page.go_back(), "/")
        rec(f"{target} -> / (back)", before, res)
        # Forward again.
        before = state(page)
        res = sample_after(page, lambda: page.go_forward(), target)
        rec(f"/ -> {target} (forward)", before, res)

    # Scrolled /about -> / via the logo.
    page.goto(BASE + "/about", wait_until="load")
    time.sleep(1.0)
    before = settle_scroll(page, 0.6)
    res = sample_after(page, lambda: page.locator("a.nav-logo").first.click(), "/")
    rec("/about -> / (logo click)", before, res)
    # ...and on to /research from the landing scrolled again (second landing mount).
    before = settle_scroll(page, 0.5)
    res = sample_after(page, nav_click(page, "/research", name), "/research")
    rec("/ (2nd mount) -> /research (nav click)", before, res)

    # Click while the page is still moving: a wheel flick on the landing (Lenis
    # glide in flight under a mouse) and a click ~150 ms later.
    for target in ["/about", "/research"]:
        # Visit the target first so its chunk is loaded and the click commits
        # while the glide is still running, then come back via the logo.
        page.goto(BASE + target, wait_until="load")
        time.sleep(1.0)
        sample_after(page, lambda: page.locator("a.nav-logo").first.click(), "/", settle=1.5)
        settle_scroll(page, 0.3)
        page.mouse.move(700, 400)
        page.mouse.wheel(0, 1500)
        time.sleep(0.15)
        before = state(page)
        # A DOM click, so the navigation lands while the glide is still moving
        # (Playwright's own click waits for the bar to stop moving first).
        sel = f".mobile-menu a[href='{target}']" if name == "touch" else f".nav-links a[href='{target}']"
        if name == "touch":
            page.locator("button[aria-controls]").first.click()
        res = sample_after(page, lambda: page.evaluate("s => document.querySelector(s).click()", sel), target)
        rec(f"/ -> {target} (nav click during a scroll glide)", before, res)

    # Back after scrolling the destination page: /about scrolled, back to /.
    page.goto(BASE + "/", wait_until="load")
    time.sleep(1.5)
    settle_scroll(page, 0.5)
    sample_after(page, nav_click(page, "/about", name), "/about")
    before = settle_scroll(page, 0.4)
    res = sample_after(page, lambda: page.go_back(), "/")
    rec("/about (scrolled 40%) -> / (back)", before, res)

    def hash_check(case, tgt_id):
        # The target's top must sit at the viewport top, or at its scroll-margin.
        r = page.evaluate("""id => { const e = document.getElementById(id); if (!e) return null;
            return {top: Math.round(e.getBoundingClientRect().top + scrollY), vtop: Math.round(e.getBoundingClientRect().top),
                    margin: parseFloat(getComputedStyle(e).scrollMarginTop) || 0}; }""", tgt_id)
        y = state(page)["y"]
        tgt = r and r["top"]
        ok = r is not None and -2 <= r["vtop"] <= r["margin"] + 2
        print(f"[{name}] {case}: y={y} target={tgt} vtop={r and r['vtop']} scroll-margin={r and r['margin']} " + ("OK" if ok else "BAD"), flush=True)
        log.append({"profile": name, "case": case, "y": y, "target": tgt, "ok": ok})

    # The nav's "Start here" (/#start) from a scrolled /about: must land on #start.
    page.goto(BASE + "/about", wait_until="load")
    time.sleep(1.0)
    settle_scroll(page, 0.5)
    start_sel = "a.nav-primary[href='/#start']" if name != "touch" else "a.nav-primary-bar[href='/#start']"
    sample_after(page, lambda: page.locator(start_sel).first.click(), "/")
    time.sleep(1.5)
    hash_check("/about (scrolled) -> /#start (Start here click)", "start")

    # Deep links on a full load (the browser or the page's own handler).
    for url, tgt_id in [("/#start", "start"), ("/rules#kill-switch", "kill-switch")]:
        page.goto(BASE + url, wait_until="load")
        time.sleep(3.0)
        hash_check(f"full load {url}", tgt_id)

    # Back/Forward inside one page must return exactly where the entry was
    # left (the browser did this before scroll restoration went manual).
    page.goto(BASE + "/rules", wait_until="load")
    time.sleep(2.0)
    page.evaluate("() => window.scrollTo(0, 5000)")
    time.sleep(0.4)
    page.mouse.move(700, 300)
    page.mouse.wheel(0, 1)
    time.sleep(1.0)
    href = page.evaluate("""() => { const a = [...document.querySelectorAll('main a[href^="#"]')].find(a => !a.closest('.rules-contents')
        && a.getBoundingClientRect().top > 100 && a.getBoundingClientRect().bottom < innerHeight); if (!a) return null; window.__a = a; return a.getAttribute('href'); }""")
    if href:
        y0 = state(page)["y"]
        # A real click or tap: a DOM el.click() on an in-page anchor does not
        # reliably make headless Chromium jump to the fragment (base as well).
        r = page.evaluate("() => { const b = window.__a.getBoundingClientRect(); return [b.left + 2, b.top + b.height / 2]; }")
        if name == "touch":
            page.touchscreen.tap(r[0], r[1])
        else:
            page.mouse.click(r[0], r[1])
        time.sleep(1.2)
        y1 = state(page)["y"]
        page.go_back()
        time.sleep(1.5)
        y2 = state(page)["y"]
        page.go_forward()
        time.sleep(1.5)
        y3 = state(page)["y"]
        ok = abs(y2 - y0) <= 2 and abs(y3 - y1) <= 2 and abs(y1 - y0) > 50
        print(f"[{name}] /rules in-text anchor {href}: at {y0} -> {y1}; back -> {y2} (want {y0}); forward -> {y3} (want {y1}) " + ("OK" if ok else "BAD"), flush=True)
        log.append({"profile": name, "case": "rules anchor back/forward", "ys": [y0, y1, y2, y3], "ok": ok})

    page.goto(BASE + "/", wait_until="load")
    time.sleep(2.0)
    y0 = state(page)["y"]
    start_sel = "a.nav-primary[href='/#start']" if name != "touch" else "a.nav-primary-bar[href='/#start']"
    page.locator(start_sel).first.click()
    time.sleep(2.0)
    y1 = state(page)["y"]
    page.go_back()
    time.sleep(1.5)
    y2 = state(page)["y"]
    page.go_forward()
    time.sleep(2.0)
    y3 = state(page)["y"]
    ok = abs(y2 - y0) <= 2 and abs(y3 - y1) <= 2 and abs(y1 - y0) > 50
    print(f"[{name}] / Start here: at {y0} -> {y1}; back -> {y2} (want {y0}); forward -> {y3} (want {y1}) " + ("OK" if ok else "BAD"), flush=True)
    log.append({"profile": name, "case": "landing Start here back/forward", "ys": [y0, y1, y2, y3], "ok": ok})

    # Lenis still smooth on the landing after returning (mouse profile only).
    if name == "mouse":
        page.goto(BASE + "/about", wait_until="load")
        time.sleep(0.8)
        page.locator("a.nav-logo").first.click()
        page.wait_for_function("() => location.pathname === '/'")
        time.sleep(1.5)
        page.mouse.move(700, 400)
        y0 = state(page)["y"]
        page.mouse.wheel(0, 600)
        time.sleep(0.05)
        y_mid = state(page)["y"]
        time.sleep(1.5)
        s = state(page)
        smooth = s["lenis"] and y0 < y_mid < s["y"]
        line = f"[{name}] Lenis after /about -> /: y0={y0} y@50ms={y_mid} y@1.5s={s['y']} lenis-class={s['lenis']} " + ("OK (smooth)" if smooth else "CHECK")
        print(line, flush=True)
        log.append({"profile": name, "case": "lenis-after-return", "y0": y0, "y_mid": y_mid, "y_end": s["y"], "lenis": s["lenis"]})

    if errors:
        print(f"[{name}] console errors: {errors[:5]}", flush=True)
    log.append({"profile": name, "console_errors": errors})
    browser.close()


def main():
    log = []
    only = sys.argv[2].split(",") if len(sys.argv) > 2 else list(PROFILES)
    with sync_playwright() as p:
        for name in only:
            run_profile(p, name, PROFILES[name], log)
    # Full per-frame detail of the last run, outside the repo.
    out = os.path.join(tempfile.gettempdir(), "repro_route_scroll.last.json")
    with open(out, "w") as f:
        json.dump(log, f, indent=1)


if __name__ == "__main__":
    main()
