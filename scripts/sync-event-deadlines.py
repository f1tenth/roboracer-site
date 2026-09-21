#!/usr/bin/env python3
"""Pull each competition's registration deadline off its own race site.

Cedric, 2026-08-23: the IROS deadline moved from September 12th to the 9th and
the site said so days before we did. Every competition runs its own site, and
that site is the source of truth for its own dates - so read it rather than
retype it, and make adding the next competition a one-line job.

To add a competition: give its entry in public/data/upcoming_events.json a
`register_url` (or a `timeline_url` if the dates live on a different page).
Nothing else. The parser looks, in order, for

  1. an explicit `<!-- TL_REG_CLOSE_DATE -->...<!-- /TL_REG_CLOSE_DATE -->`
     marker, which the RoboRacer race-site template already emits, or
  2. a table row whose text contains "Registration Closes".

Struck-through dates inside either are ignored: a moved deadline is published
as `<s>September 12th</s> September 9th`, and the live date is the one that is
not struck out. That single rule is why this is worth a script.

Usage: sync-event-deadlines.py [--write] [--file public/data/upcoming_events.json]
Without --write it only reports, which is what CI should run.
"""
import argparse, datetime as dt, json, pathlib, re, sys, urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
MONTHS = ("january february march april may june july august september october "
          "november december").split()
DATE_RE = re.compile(
    r"\b(" + "|".join(MONTHS) + r"|" + "|".join(m[:3] for m in MONTHS) + r")\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b",
    re.I,
)
MARKER = re.compile(r"<!--\s*TL_REG_CLOSE_DATE\s*-->(.*?)<!--\s*/TL_REG_CLOSE_DATE\s*-->", re.S | re.I)
STRUCK = re.compile(r"<(s|del|strike)\b.*?</\1>|<span[^>]*line-through[^>]*>.*?</span>", re.S | re.I)
TAGS = re.compile(r"<[^>]+>")


def fetch(url: str, timeout: int = 25) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def deadline_from(html: str):
    """The live registration-close date, or None. Struck-through text is dropped
    first, so a superseded date can never win."""
    blocks = [m.group(1) for m in MARKER.finditer(html)]
    if not blocks:
        for row in re.findall(r"<tr\b.*?</tr>", html, re.S | re.I):
            if re.search(r"registration\s+closes", TAGS.sub(" ", row), re.I):
                blocks.append(row)
    for block in blocks:
        text = TAGS.sub(" ", STRUCK.sub(" ", block))
        m = DATE_RE.search(text)
        if m:
            return m.group(0).strip()
    return None


def parse_date(phrase: str, year: int):
    """("September 9th", 2026) -> (date, "September 9, 2026"), or (None, None)."""
    m = DATE_RE.search(phrase)
    if not m:
        return None, None
    name, day = m.group(1).lower().rstrip("."), int(m.group(2))
    month = next((i for i, mo in enumerate(MONTHS) if mo.startswith(name[:3])), None)
    if month is None:
        return None, None
    try:
        d = dt.date(year, month + 1, day)
    except ValueError:
        return None, None
    return d, f"{MONTHS[month].capitalize()} {day}, {year}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default="public/data/upcoming_events.json")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    path = pathlib.Path(a.file)
    events = json.loads(path.read_text())
    changed, checked, problems = 0, 0, 0

    for e in events:
        url = e.get("timeline_url") or e.get("register_url")
        name = e.get("short_name") or e.get("title", "?")
        if not url:
            print(f"  {name}: no register_url, skipped")
            continue
        checked += 1
        try:
            found = deadline_from(fetch(url))
        except Exception as ex:
            print(f"  {name}: FETCH FAILED ({type(ex).__name__}) {url}")
            problems += 1
            continue
        if not found:
            print(f"  {name}: no registration-close date found on {url}")
            problems += 1
            continue
        year = int((e.get("starts_at") or "")[:4] or dt.date.today().year)
        parsed, pretty = parse_date(found, year)
        if not parsed:
            print(f"  {name}: could not parse {found!r}")
            problems += 1
            continue
        iso = parsed.isoformat()
        # The site gives a day, not an hour. Keep whatever time-of-day and offset
        # the record already carries; only the calendar date is being synced.
        old_at = e.get("registration_deadline_at") or ""
        tail = old_at[10:] or "T23:59:00-04:00"
        if e.get("registration_deadline") != pretty or old_at[:10] != iso:
            print(f"  {name}: {e.get('registration_deadline')!r} -> {pretty!r}  ({old_at[:10] or '-'} -> {iso})")
            e["registration_deadline"] = pretty
            e["registration_deadline_at"] = iso + tail
            changed += 1
        else:
            print(f"  {name}: unchanged ({pretty})")

    print(f"checked {checked}, changed {changed}, problems {problems}")
    if changed and a.write:
        tmp = path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n")
        tmp.replace(path)
        print(f"wrote {path}")
    elif changed:
        print("run again with --write to apply")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
