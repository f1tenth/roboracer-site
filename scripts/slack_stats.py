#!/usr/bin/env python3
"""Refresh public/data/community.json from the RoboRacer Slack workspace.

Counts active human members, distinct time zones, and continents (first segment of the
IANA tz id, e.g. "America/New_York" -> "America"). Needs a bot token with the users:read
scope (Slack app -> OAuth & Permissions -> Bot Token Scopes -> users:read -> install to
workspace; Ayagoz is workspace admin).

Usage:
  SLACK_BOT_TOKEN=xoxb-... python3 scripts/slack_stats.py            # writes the file
  SLACK_BOT_TOKEN=xoxb-... python3 scripts/slack_stats.py --dry-run  # prints only

Without a token the script exits 0 and leaves the file untouched, so the workflow never
fails a build; the seed values (source: manual) keep rendering.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path("public/data/community.json")
API = "https://slack.com/api/users.list"
# Slack reports "Antarctica" and "Etc/*" ids for a few accounts; they are not continents
# the page should count.
CONTINENTS = {"Africa", "America", "Asia", "Australia", "Europe", "Pacific", "Atlantic", "Indian"}
# Pacific/Atlantic/Indian are ocean zones (islands); fold them into a sensible continent
# count by keeping them distinct but excluding Etc and Antarctica.


def fetch_all(token: str) -> list[dict]:
    members: list[dict] = []
    cursor = ""
    while True:
        q = urllib.parse.urlencode({"limit": 200, **({"cursor": cursor} if cursor else {})})
        req = urllib.request.Request(f"{API}?{q}", headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
        if not data.get("ok"):
            raise SystemExit(f"slack error: {data.get('error')}")
        members.extend(data.get("members", []))
        cursor = data.get("response_metadata", {}).get("next_cursor", "")
        if not cursor:
            return members
        time.sleep(1.2)  # users.list is Tier 2 (20+/min)


def summarize(members: list[dict]) -> dict:
    humans = [
        m
        for m in members
        if not m.get("deleted") and not m.get("is_bot") and m.get("id") != "USLACKBOT"
    ]
    tzs = {m.get("tz") for m in humans if m.get("tz")}
    continents = {t.split("/")[0] for t in tzs} - {"Etc", "Antarctica"}
    n = len(humans)
    # Display rounds DOWN to the nearest hundred and appends "+", so the page never claims
    # more than the real count.
    floor100 = (n // 100) * 100
    return {
        "members": n,
        "members_display": f"{floor100:,}+" if n >= 100 else str(n),
        "timezones": len(tzs),
        "continents": len(continents),
        "updated": dt.date.today().isoformat(),
        "source": "slack users.list",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    token = os.environ.get("SLACK_BOT_TOKEN")
    if not token:
        print("SLACK_BOT_TOKEN not set; leaving community.json untouched", file=sys.stderr)
        return 0
    stats = summarize(fetch_all(token))
    print(json.dumps(stats, indent=2))
    if args.dry_run:
        return 0
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(stats, indent=2) + "\n")
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
