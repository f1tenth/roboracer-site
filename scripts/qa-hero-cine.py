#!/usr/bin/env python3
"""QA captures and measurements for the cinematic hero (docs/plans/hero-cinematic-v1.md section 10).

  /home/cedric/.venvs/ml/bin/python3 scripts/qa-hero-cine.py --url http://localhost:PORT/ --out docs/qa/hero-cinematic

Per viewport (1440x900, 768x1024, 390x844): CDP viewport captures of the pinned chapter at
p = 0, 0.30, 0.55, 0.80, 1.00 and at scroll-out q = 0.4 (window.scrollTo, page.mouse.wheel(0, 1),
a settle, then Page.captureScreenshot), the state read off the DOM at each stop (frame index, loader
phase, painted/skipped draws, headline unit opacity, block transform, footage filter, nav alpha),
console errors, page errors, failed requests and 4xx/5xx responses. Then at 1440: a reduced-motion
context (poster + static headline, no canvas, no frame requests), /?hero=classic (the old hero), axe
on / (serious and critical, with the hero subset), and a 6 s scripted scroll through the chapter
with rAF frame times and the drawer's painted/skipped counts (software GL: record only).

Everything lands in <out>/run.json; the PNGs are git-ignored (docs/qa/**/*.png). Run against the
dev server (scripts/rr.sh dev --port 0) or a build made with VITE_MEDIA_BASE= (see contract 1.7).
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import statistics
import time

from playwright.sync_api import sync_playwright

VIEWPORTS = {"1440": (1440, 900), "768": (768, 1024), "390": (390, 844)}
P_STEPS = [0.0, 0.30, 0.55, 0.80, 1.00]
Q_STEPS = [0.4]
GL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

STATE_JS = """() => {
  const ch = document.querySelector('[data-hero-chapter]');
  const nav = document.querySelector('nav');
  const h = window.__heroCine;
  const canvas = ch ? ch.querySelector('canvas') : null;
  const layer = canvas ? canvas.parentElement : null;
  const block = ch ? ch.querySelector('.rr-hero-block') : null;
  const desc = ch ? ch.querySelector('.rr-hero-desc') : null;
  const cap = ch ? ch.querySelector('.rr-hero-caption') : null;
  const line = (i) => {
    const el = ch ? ch.querySelectorAll('.rr-hero-line')[i] : null;
    if (!el) return null;
    const units = Array.from(el.querySelectorAll('.rr-hero-unit'));
    const u = units.length ? units[units.length - 1] : el;
    const cs = getComputedStyle(u);
    return { opacity: +(+cs.opacity).toFixed(3), transform: cs.transform };
  };
  return {
    scrollY: Math.round(window.scrollY),
    chapterTop: ch ? Math.round(ch.getBoundingClientRect().top + window.scrollY) : null,
    chapterHeight: ch ? ch.offsetHeight : null,
    variant: ch ? ch.getAttribute('data-hero-cine') : null,
    hasVideo: !!(ch && ch.querySelector('video')),
    hasCanvas: !!canvas,
    frame: h ? +h.proxy.f.toFixed(2) : null,
    loaderPhase: h ? h.loader.phase : null,
    loaded: h ? h.loader.loaded : null,
    failed: h ? h.loader.failed : null,
    count: h ? h.set.count : null,
    setBase: h ? h.set.base : null,
    painted: h ? h.drawer.painted : null,
    skipped: h ? h.drawer.skipped : null,
    canvasReady: !!(canvas && canvas.dataset.ready === 'true'),
    canvasOpacity: canvas ? +getComputedStyle(canvas).opacity : null,
    canvasSize: canvas ? [canvas.width, canvas.height] : null,
    lines: [line(0), line(1), line(2)],
    blockTransform: block ? getComputedStyle(block).transform : null,
    blockOpacity: block ? +(+getComputedStyle(block).opacity).toFixed(3) : null,
    layerFilter: layer ? getComputedStyle(layer).filter : null,
    layerTransform: layer ? getComputedStyle(layer).transform : null,
    descOpacity: desc ? +(+getComputedStyle(desc).opacity).toFixed(3) : null,
    captionOpacity: cap ? +(+getComputedStyle(cap).opacity).toFixed(3) : null,
    navAlpha: nav ? nav.style.getPropertyValue('--nav-alpha') : null,
    cores: navigator.hardwareConcurrency,
    h1: document.querySelectorAll('h1').length,
  };
}"""

TIMING_JS = """async ({top, H, vh, seconds}) => {
  const h = window.__heroCine;
  const p0 = h ? h.drawer.painted : 0, s0 = h ? h.drawer.skipped : 0;
  window.scrollTo(0, top);
  await new Promise(r => setTimeout(r, 300));
  const times = [];
  return await new Promise(resolve => {
    let last = performance.now(); const start = last;
    const step = (now) => {
      times.push(now - last); last = now;
      const t = Math.min(1, (now - start) / (seconds * 1000));
      window.scrollTo(0, top + t * (H - vh));
      if (t < 1) requestAnimationFrame(step);
      else resolve({ frames: times.length, times, painted: (h ? h.drawer.painted : 0) - p0, skipped: (h ? h.drawer.skipped : 0) - s0, frameEnd: h ? +h.proxy.f.toFixed(1) : null });
    };
    requestAnimationFrame(step);
  });
}"""


def save_png(cdp, path: str) -> None:
    data = cdp.send("Page.captureScreenshot", {"format": "png"})["data"]
    tmp = path + ".tmp"
    with open(tmp, "wb") as f:
        f.write(base64.b64decode(data))
    os.replace(tmp, path)


def scroll_to(page, y: float, settle_ms: int) -> None:
    page.evaluate("y => window.scrollTo(0, y)", y)
    page.mouse.wheel(0, 1)
    page.wait_for_timeout(settle_ms)


def attach_listeners(page):
    log = {"console": [], "page_errors": [], "failed_requests": [], "bad_responses": [], "frame_requests": []}
    page.on("console", lambda m: log["console"].append({"type": m.type, "text": m.text[:300]}))
    page.on("pageerror", lambda e: log["page_errors"].append(str(e)[:300]))
    page.on("requestfailed", lambda r: log["failed_requests"].append({"url": r.url[-120:], "error": str(r.failure)[:120]}))
    page.on("response", lambda r: log["bad_responses"].append({"url": r.url[-120:], "status": r.status}) if r.status >= 400 else None)
    page.on("request", lambda r: log["frame_requests"].append(r.url[-60:]) if "/media/hero-cine/" in r.url else None)
    return log


def wait_for_frames(page, seconds: float) -> dict:
    t0 = time.time()
    st = page.evaluate(STATE_JS)
    while time.time() - t0 < seconds:
        st = page.evaluate(STATE_JS)
        if st["loaderPhase"] == "done" or (st["loaderPhase"] is None and st["canvasReady"]):
            break
        if st["variant"] != "film":
            break
        page.wait_for_timeout(500)
    st["waited_s"] = round(time.time() - t0, 1)
    # The idle glide fires about 2 s after the coarse pass and scrolls to p 0.55 over ~3 s; a walk
    # that starts mid-glide fights it (and Lenis then finishes the glide's own smoothing under
    # the first stops). Wait until the page has been still for a second before touching scroll.
    last = page.evaluate("Math.round(window.scrollY)")
    still_since = time.time()
    t1 = time.time()
    while time.time() - t1 < 15:
        page.wait_for_timeout(250)
        y = page.evaluate("Math.round(window.scrollY)")
        if y != last:
            last, still_since = y, time.time()
        elif time.time() - still_since >= 1.0:
            break
    st["glide_end_scrollY"] = last
    return st


def run_viewport(browser, url: str, out: str, name: str, w: int, h: int, settle_ms: int, wait_s: float) -> dict:
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = ctx.new_page()
    log = attach_listeners(page)
    page.goto(url, wait_until="load")
    page.wait_for_selector("[data-hero-chapter]", timeout=30000)
    st = wait_for_frames(page, wait_s)
    cdp = ctx.new_cdp_session(page)
    top, H = st["chapterTop"], st["chapterHeight"]
    shots = []
    for p in P_STEPS:
        scroll_to(page, top + p * (H - h), settle_ms)
        s = page.evaluate(STATE_JS)
        path = os.path.join(out, f"{name}-p{int(round(p * 100)):03d}.png")
        save_png(cdp, path)
        shots.append({"p": p, "file": os.path.basename(path), **s})
    for q in Q_STEPS:
        scroll_to(page, top + (H - h) + q * h, settle_ms)
        s = page.evaluate(STATE_JS)
        path = os.path.join(out, f"{name}-q{int(round(q * 100)):03d}.png")
        save_png(cdp, path)
        shots.append({"q": q, "file": os.path.basename(path), **s})
    result = {
        "viewport": [w, h],
        "after_load": {k: st.get(k) for k in ("variant", "loaderPhase", "loaded", "failed", "count", "setBase", "canvasReady", "canvasSize", "cores", "h1", "waited_s", "chapterHeight")},
        "shots": shots,
        "console_errors": [m for m in log["console"] if m["type"] == "error"],
        "console_warnings": [m for m in log["console"] if m["type"] == "warning"],
        "page_errors": log["page_errors"],
        "failed_requests": log["failed_requests"],
        "bad_responses": log["bad_responses"],
        "frame_requests": len(log["frame_requests"]),
    }
    ctx.close()
    return result


def run_reduced(browser, url: str, out: str, w: int, h: int, settle_ms: int) -> dict:
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
    page = ctx.new_page()
    log = attach_listeners(page)
    page.goto(url, wait_until="load")
    page.wait_for_selector("[data-hero-chapter]", timeout=30000)
    page.wait_for_timeout(2500)
    cdp = ctx.new_cdp_session(page)
    st = page.evaluate(STATE_JS)
    save_png(cdp, os.path.join(out, f"reduced-motion-{w}-top.png"))
    scroll_to(page, h, settle_ms)
    save_png(cdp, os.path.join(out, f"reduced-motion-{w}-1vh.png"))
    frames = [u for u in log["frame_requests"] if "/d/f_" in u or "/m/f_" in u]
    result = {
        "viewport": [w, h],
        "variant": st["variant"],
        "hasCanvas": st["hasCanvas"],
        "hasVideo": st["hasVideo"],
        "h1": st["h1"],
        "hero_cine_requests": log["frame_requests"],
        "frame_file_requests": len(frames),
        "console_errors": [m for m in log["console"] if m["type"] == "error"],
        "page_errors": log["page_errors"],
        "bad_responses": log["bad_responses"],
    }
    ctx.close()
    return result


def run_classic(browser, url: str, out: str, w: int, h: int) -> dict:
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = ctx.new_page()
    log = attach_listeners(page)
    sep = "&" if "?" in url else "?"
    page.goto(f"{url}{sep}hero=classic", wait_until="load")
    page.wait_for_selector("[data-hero-chapter]", timeout=30000)
    page.wait_for_timeout(2000)
    cdp = ctx.new_cdp_session(page)
    st = page.evaluate(STATE_JS)
    save_png(cdp, os.path.join(out, f"classic-{w}-top.png"))
    result = {"variant": st["variant"], "hasVideo": st["hasVideo"], "hasCanvas": st["hasCanvas"], "h1": st["h1"],
              "chapterHeight": st["chapterHeight"], "console_errors": [m for m in log["console"] if m["type"] == "error"],
              "page_errors": log["page_errors"]}
    ctx.close()
    return result


def run_axe(browser, url: str, w: int, h: int, settle_ms: int) -> dict:
    from axe_playwright_python.sync_playwright import Axe

    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = ctx.new_page()
    page.goto(url, wait_until="load")
    page.wait_for_selector("[data-hero-chapter]", timeout=30000)
    st = wait_for_frames(page, 20)
    top, H = st["chapterTop"], st["chapterHeight"]
    scroll_to(page, top + 0.9 * (H - h), settle_ms)  # the headline standing, the hold
    res = Axe().run(page)
    data = res.response if hasattr(res, "response") else res
    violations = data.get("violations", []) if isinstance(data, dict) else []
    rows = []
    for v in violations:
        nodes = v.get("nodes", [])
        hero_nodes = [n for n in nodes if any("data-hero-chapter" in str(t) or "rr-hero" in str(t) for t in n.get("target", []))]
        rows.append({"id": v.get("id"), "impact": v.get("impact"), "help": v.get("help"), "nodes": len(nodes),
                     "hero_nodes": len(hero_nodes), "targets": [n.get("target") for n in nodes[:6]]})
    # Hero subset by DOM containment (targets are selectors; resolve in the page).
    hero_hits = []
    for v in violations:
        for n in v.get("nodes", []):
            for t in n.get("target", []):
                sel = t if isinstance(t, str) else (t[0] if t else "")
                try:
                    inside = page.evaluate("s => { const el = document.querySelector(s); return !!(el && el.closest('[data-hero-chapter]')); }", sel)
                except Exception:
                    inside = False
                if inside:
                    hero_hits.append({"id": v.get("id"), "impact": v.get("impact"), "target": sel})
    ctx.close()
    return {"violations": rows, "serious_or_critical": [r for r in rows if r["impact"] in ("serious", "critical")], "hero_hits": hero_hits}


def run_timing(browser, url: str, w: int, h: int, seconds: float) -> dict:
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = ctx.new_page()
    page.goto(url, wait_until="load")
    page.wait_for_selector("[data-hero-chapter]", timeout=30000)
    st = wait_for_frames(page, 40)
    top, H = st["chapterTop"], st["chapterHeight"]
    r = page.evaluate(TIMING_JS, {"top": top, "H": H, "vh": h, "seconds": seconds})
    times = r["times"][1:] or [0.0]
    times_sorted = sorted(times)
    result = {
        "seconds": seconds, "frames": r["frames"], "painted": r["painted"], "skipped": r["skipped"], "frameEnd": r["frameEnd"],
        "loaderPhase": st["loaderPhase"], "loaded": st["loaded"], "count": st["count"],
        "ms_mean": round(statistics.fmean(times), 1), "ms_median": round(statistics.median(times), 1),
        "ms_p95": round(times_sorted[int(0.95 * (len(times_sorted) - 1))], 1), "ms_max": round(max(times), 1),
        "fps_equiv": round(1000 / statistics.fmean(times), 1) if statistics.fmean(times) > 0 else None,
    }
    ctx.close()
    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--out", default="docs/qa/hero-cinematic")
    ap.add_argument("--settle", type=int, default=600, help="ms after scrollTo + wheel nudge (contract: 600)")
    ap.add_argument("--wait-frames", type=float, default=60, help="seconds to wait for the frame set to finish loading")
    ap.add_argument("--viewports", default="1440,768,390")
    ap.add_argument("--skip-axe", action="store_true")
    ap.add_argument("--skip-timing", action="store_true")
    ap.add_argument("--skip-static", action="store_true")
    ap.add_argument("--timing-seconds", type=float, default=6)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    run = {"url": args.url, "started": time.strftime("%Y-%m-%d %H:%M:%S"), "settle_ms": args.settle, "gl_args": GL_ARGS, "viewports": {}}
    with sync_playwright() as p:
        browser = p.chromium.launch(args=GL_ARGS)
        for name in args.viewports.split(","):
            w, h = VIEWPORTS[name]
            print(f"[{name}] walk", flush=True)
            run["viewports"][name] = run_viewport(browser, args.url, args.out, name, w, h, args.settle, args.wait_frames)
        if not args.skip_static:
            print("[1440] reduced motion", flush=True)
            run["reduced_motion"] = run_reduced(browser, args.url, args.out, 1440, 900, args.settle)
            print("[1440] classic", flush=True)
            run["classic"] = run_classic(browser, args.url, args.out, 1440, 900)
        if not args.skip_axe:
            print("[1440] axe", flush=True)
            run["axe"] = run_axe(browser, args.url, 1440, 900, args.settle)
        if not args.skip_timing:
            print("[1440] timing", flush=True)
            run["timing"] = run_timing(browser, args.url, 1440, 900, args.timing_seconds)
        browser.close()
    run["finished"] = time.strftime("%Y-%m-%d %H:%M:%S")
    tmp = os.path.join(args.out, "run.json.tmp")
    with open(tmp, "w") as f:
        json.dump(run, f, indent=1)
    os.replace(tmp, os.path.join(args.out, "run.json"))
    # One-screen summary.
    for name, v in run["viewports"].items():
        al = v["after_load"]
        print(f"{name}: variant={al['variant']} phase={al['loaderPhase']} loaded={al['loaded']}/{al['count']} failed={al['failed']} "
              f"errors={len(v['console_errors'])} pageErrors={len(v['page_errors'])} bad={len(v['bad_responses'])} h1={al['h1']} chapter={al['chapterHeight']}")
        for s in v["shots"]:
            key = f"p={s['p']}" if "p" in s else f"q={s['q']}"
            ops = [ln["opacity"] if ln else None for ln in s["lines"]]
            print(f"   {key:7s} frame={s['frame']} lines={ops} block={s['blockOpacity']} desc={s['descOpacity']} filter={s['layerFilter']} nav={s['navAlpha']}")
    if "reduced_motion" in run:
        r = run["reduced_motion"]
        print(f"reduced: variant={r['variant']} canvas={r['hasCanvas']} video={r['hasVideo']} frameFiles={r['frame_file_requests']} heroCineRequests={r['hero_cine_requests']} errors={len(r['console_errors'])}")
    if "classic" in run:
        c = run["classic"]
        print(f"classic: variant={c['variant']} video={c['hasVideo']} canvas={c['hasCanvas']} chapter={c['chapterHeight']} errors={len(c['console_errors'])}")
    if "axe" in run:
        a = run["axe"]
        print(f"axe: {len(a['violations'])} violations, {len(a['serious_or_critical'])} serious/critical, hero hits {len(a['hero_hits'])}")
        for r in a["serious_or_critical"]:
            print(f"   {r['impact']} {r['id']} nodes={r['nodes']} heroNodes={r['hero_nodes']} {r['targets'][:2]}")
    if "timing" in run:
        t = run["timing"]
        print(f"timing: {t['frames']} rAF frames in {t['seconds']} s, mean {t['ms_mean']} ms, median {t['ms_median']} ms, p95 {t['ms_p95']} ms, max {t['ms_max']} ms; painted {t['painted']} skipped {t['skipped']} frameEnd {t['frameEnd']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
