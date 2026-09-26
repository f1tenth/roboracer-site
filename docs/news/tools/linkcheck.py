#!/usr/bin/env python3
"""Check every link, archive, more.href, author_url and embed src in news.json.
curl with a browser UA, follow redirects; HEAD first, GET on failure."""
import json, subprocess, sys, concurrent.futures as cf

NEWS = sys.argv[1]
OUT = sys.argv[2]
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
d = json.load(open(NEWS))
urls = {}
for it in d["items"]:
    for field in ("link", "archive", "author_url"):
        u = it.get(field)
        if u:
            urls.setdefault(u, []).append(f"{it['id']}.{field}")
    if it.get("more"):
        urls.setdefault(it["more"]["href"], []).append(f"{it['id']}.more")
    if it.get("embed"):
        urls.setdefault(it["embed"]["src"], []).append(f"{it['id']}.embed")


def check(u):
    res = []
    for method in (["-I"], []):
        cmd = ["curl", "-sS", "-L", "-o", "/dev/null", "-w", "%{http_code} %{url_effective}",
               "--max-time", "40", "-A", UA] + method + [u]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            code = r.stdout.split(" ")[0] if r.stdout else "000"
            res.append((code, r.stdout[4:], r.stderr.strip()[:120]))
            if code.startswith("2"):
                break
        except Exception as e:
            res.append(("ERR", "", str(e)[:120]))
    return u, res

rows = []
with cf.ThreadPoolExecutor(8) as ex:
    for u, res in ex.map(check, sorted(urls)):
        final = res[-1]
        rows.append({"url": u, "code": final[0], "effective": final[1], "err": final[2], "used_by": urls[u],
                     "tries": [r[0] for r in res]})
json.dump(rows, open(OUT, "w"), indent=1)
bad = [r for r in rows if not r["code"].startswith("2")]
print("checked", len(rows), "not 2xx:", len(bad))
for r in bad:
    print(r["code"], r["url"], r["used_by"], r["err"], "->", r["effective"][:120])
