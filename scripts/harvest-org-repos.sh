#!/usr/bin/env bash
# Clone candidate website/race-site repos from the f1tenth GitHub org into _harvest/repos (shallow).
# Needs: gh (authenticated with org access). Usage: scripts/harvest-org-repos.sh [org]
set -euo pipefail
ORG=${1:-f1tenth}; OUT=_harvest/repos; mkdir -p "$OUT"
gh repo list "$ORG" --limit 400 --json name,url,isPrivate,isArchived,updatedAt,description > "$OUT/_repos.json"
python3 - "$OUT" <<'PY'
import json,sys,re,subprocess,os
out=sys.argv[1]; repos=json.load(open(f"{out}/_repos.json"))
pat=re.compile(r"site|web|race|\.github\.io|roboracer|f1tenth\.org|homepage|landing|www", re.I)
cands=[r for r in repos if pat.search(r["name"]) or pat.search(r.get("description") or "")]
print(f"{len(repos)} repos in org, {len(cands)} candidates:")
for r in cands:
    print(f"  {r['name']:40s} private={r['isPrivate']} archived={r['isArchived']} updated={r['updatedAt'][:10]}  {r.get('description') or ''}")
    dest=os.path.join(out,r['name'])
    if not os.path.isdir(dest):
        subprocess.run(["gh","repo","clone",r["url"],dest,"--","--depth","1","--quiet"],check=False)
PY
echo; echo "image/asset folders found:"; find "$OUT" -maxdepth 3 -type d \( -iname 'img' -o -iname 'images' -o -iname 'assets' -o -iname 'static' -o -iname 'media' -o -iname 'sponsors' -o -iname 'partners' \) -not -path '*/node_modules/*' | sed 's/^/  /'
