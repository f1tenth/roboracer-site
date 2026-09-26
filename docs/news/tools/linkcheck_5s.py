#!/usr/bin/env python3
"""news.json link check per the brief: every link, archive, more.href and embed
src; curl -sI -L --max-time 5. Anything not 2xx is retried once with GET (same
5 s) so a HEAD-refusing server is told apart from a dead page."""
import json, subprocess, sys, concurrent.futures as cf
NEWS, OUT = sys.argv[1], sys.argv[2]
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
d = json.load(open(NEWS))
urls = {}
for it in d["items"]:
    for f in ("link", "archive"):
        if it.get(f): urls.setdefault(it[f], []).append(f"{it['id']}.{f}")
    if it.get("more"): urls.setdefault(it["more"]["href"], []).append(f"{it['id']}.more")
    if it.get("embed"): urls.setdefault(it["embed"]["src"], []).append(f"{it['id']}.embed")

def run(u, head):
    cmd = ["curl", "-s", "-L", "--max-time", "5", "-o", "/dev/null", "-w", "%{http_code} %{url_effective}", "-A", UA]
    if head: cmd.insert(1, "-I")
    r = subprocess.run(cmd + [u], capture_output=True, text=True)
    out = r.stdout.strip()
    code = out.split(" ")[0] if out else "000"
    return code, out[4:], r.returncode

def check(u):
    h = run(u, True)
    g = None if h[0].startswith("2") else run(u, False)
    return u, h, g

rows = []
with cf.ThreadPoolExecutor(10) as ex:
    for u, h, g in ex.map(check, sorted(urls)):
        rows.append({"url": u, "head": h[0], "head_exit": h[2], "get": g[0] if g else None,
                     "get_exit": g[2] if g else None, "effective": (g or h)[1], "used_by": urls[u]})
json.dump(rows, open(OUT, "w"), indent=1)
bad = [r for r in rows if not r["head"].startswith("2")]
print("checked", len(rows), "| HEAD not 2xx:", len(bad), "| still not 2xx on GET:", len([r for r in bad if not (r["get"] or "").startswith("2")]))
for r in bad:
    print(f"HEAD {r['head']} (exit {r['head_exit']}) GET {r['get']} (exit {r['get_exit']}) {r['url']} {r['used_by']}")
