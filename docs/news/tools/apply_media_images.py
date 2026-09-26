"""Write docs/news/MEDIA_IMAGES.json into public/data/news.json.

For every item id in the map, set `image` = {src, width, height, alt} and add
the image credit to `credit` when it is not there yet. Items that already have
an image are left alone unless --force. Dry run by default; --write saves.
Formatting matches the file (indent 2, non-ASCII kept)."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
NEWS = os.path.join(ROOT, "public/data/news.json")
MAP = os.path.join(ROOT, "docs/news/MEDIA_IMAGES.json")
write = "--write" in sys.argv
force = "--force" in sys.argv
news = json.load(open(NEWS, encoding="utf-8"))
media = json.load(open(MAP, encoding="utf-8"))
by_id = {it["id"]: it for it in news["items"]}
changed, skipped, missing = [], [], []
for iid, img in media.items():
    if iid == "skipped":
        continue
    it = by_id.get(iid)
    if it is None:
        missing.append(iid); continue
    if it.get("image") and not force:
        skipped.append(iid); continue
    it["image"] = {"src": img["src"], "width": img["width"], "height": img["height"], "alt": img["alt"]}
    credit = img.get("credit")
    if credit and credit not in (it.get("credit") or ""):
        it["credit"] = f"{it['credit']} · {credit}" if it.get("credit") else credit
    changed.append(iid)
print(f"changed {len(changed)}: {changed}\nskipped (had image) {len(skipped)}: {skipped}\nmissing ids {len(missing)}: {missing}")
if write:
    tmp = NEWS + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(news, f, indent=2, ensure_ascii=False); f.write("\n")
    os.replace(tmp, NEWS); print("written")
