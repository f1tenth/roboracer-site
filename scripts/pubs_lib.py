#!/usr/bin/env python3
"""Shared helpers for the roboracer.ai publications tooling.

Used by migrate-bibtex.py, resolve_paper.py, discover_papers.py and validate-publications.py.
Standard library only, so it runs anywhere (Claude Code, GitHub Actions, a laptop).
"""
from __future__ import annotations

import datetime as _dt
import json
import re
import unicodedata
from pathlib import Path

DATA_FILE = Path("public/data/publications.json")
SCHEMA_FILE = Path("data/publications.schema.json")
SCHOLAR_QUERY_URL = (
    "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG="
)

# Controlled vocabulary. Keep ids stable; labels can change.
TAGS = [
    {"id": "reinforcement-learning", "label": "Reinforcement learning", "scholar_query": "reinforcement learning"},
    {"id": "planning", "label": "Planning", "scholar_query": "planning"},
    {"id": "raceline-optimization", "label": "Raceline optimization", "scholar_query": "raceline OR \"minimum curvature\" OR \"minimum time\""},
    {"id": "control-mpc", "label": "Control and MPC", "scholar_query": "\"model predictive control\" OR MPC OR MPPI"},
    {"id": "perception-estimation", "label": "Perception and state estimation", "scholar_query": "localization OR SLAM OR perception OR \"state estimation\""},
    {"id": "sim-to-real", "label": "Sim-to-real and simulation", "scholar_query": "simulation OR sim-to-real OR \"digital twin\""},
    {"id": "multi-agent", "label": "Multi-agent and racing strategy", "scholar_query": "overtaking OR \"head-to-head\" OR multi-agent"},
    {"id": "safety", "label": "Safety and verification", "scholar_query": "safety OR \"control barrier\" OR verification"},
    {"id": "systems-platform", "label": "Systems and platform", "scholar_query": "platform OR hardware OR ROS"},
    {"id": "education", "label": "Education", "scholar_query": "education OR course OR teaching"},
]
TAG_IDS = {t["id"] for t in TAGS}

# Keyword rules (lowercased substring match on title + abstract + venue). Order matters only for ties.
_RULES: list[tuple[str, list[str]]] = [
    ("reinforcement-learning", ["reinforcement learning", " rl ", "policy gradient", "ppo", "sac ", "deep q", "imitation learning", "learning-based policy", "residual policy"]),
    ("raceline-optimization", ["raceline", "race line", "minimum curvature", "minimum time", "minimum-time", "trajectory optimization", "optimal trajectory", "lap time"]),
    ("control-mpc", ["model predictive", "mpc", "mppi", "pure pursuit", "stanley", "lqr", "feedback control", "tracking control", "controller"]),
    ("planning", ["motion planning", "path planning", "planner", "rrt", "lattice", "graph search", "sampling-based", "follow the gap", "local planning"]),
    ("perception-estimation", ["localization", "slam", "particle filter", "state estimation", "kalman", "lidar", "camera", "perception", "odometry", "mapping"]),
    ("sim-to-real", ["sim-to-real", "sim2real", "simulation", "simulator", "digital twin", "gym", "domain randomization", "transfer"]),
    ("multi-agent", ["multi-agent", "multiagent", "overtaking", "head-to-head", "opponent", "adversarial racing", "game-theoretic", "game theoretic", "interaction"]),
    ("safety", ["safety", "safe ", "barrier function", "reachability", "verification", "runtime assurance", "shield", "collision avoidance"]),
    ("systems-platform", ["platform", "testbed", "hardware", "ros", "middleware", "open-source", "open source", "architecture", "benchmark", "dataset"]),
    ("education", ["education", "course", "teaching", "curriculum", "students", "classroom", "competition-based learning", "tutorial"]),
]


def today() -> str:
    return _dt.date.today().isoformat()


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def slugify(s: str, max_len: int = 60) -> str:
    s = strip_accents(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:max_len].rstrip("-")


def make_id(authors: list[str], year: int | str, title: str) -> str:
    first = (authors[0] if authors else "unknown").replace("'", "").replace("\u2019", "")
    # "Last, First" or "First Last" -> last name
    last = first.split(",")[0].strip() if "," in first else first.strip().split(" ")[-1]
    words = [w for w in re.findall(r"[A-Za-z0-9]+", strip_accents(title)) if w.lower() not in {"a", "an", "the", "of", "for", "on", "in", "and", "to", "with", "towards", "toward"}]
    first_word = words[0] if words else "paper"
    return slugify(f"{last}-{year}-{first_word}")


def norm_title(t: str) -> str:
    t = strip_accents(t).lower()
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def norm_doi(d: str | None) -> str | None:
    if not d:
        return None
    d = d.strip()
    d = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", d, flags=re.I)
    d = re.sub(r"^doi:\s*", "", d, flags=re.I)
    return d.lower() or None


def norm_arxiv(a: str | None) -> str | None:
    if not a:
        return None
    m = re.search(r"(\d{4}\.\d{4,5})(v\d+)?", a)
    return m.group(1) if m else None


def dedupe_keys(item: dict) -> set[str]:
    keys = set()
    if item.get("doi"):
        keys.add("doi:" + norm_doi(item["doi"]))
    if item.get("arxiv"):
        keys.add("arxiv:" + norm_arxiv(item["arxiv"]))
    if item.get("title"):
        keys.add("title:" + norm_title(item["title"]))
    return keys


def suggest_tags(title: str, abstract: str = "", venue: str = "") -> list[str]:
    text = f" {title} {abstract} {venue} ".lower()
    scores: dict[str, int] = {}
    for tag, kws in _RULES:
        hits = sum(text.count(k) for k in kws)
        if hits:
            scores[tag] = hits
    ranked = sorted(scores.items(), key=lambda kv: -kv[1])
    tags = [t for t, _ in ranked[:3]]
    return tags or ["systems-platform"]


def venue_short(venue: str) -> str:
    v = venue or ""
    table = [
        (r"robotics and automation letters|ra-l", "RA-L"),
        (r"international conference on robotics and automation|\bicra\b", "ICRA"),
        (r"intelligent robots and systems|\biros\b", "IROS"),
        (r"conference on decision and control|\bcdc\b", "CDC"),
        (r"intelligent vehicles symposium|\biv\b", "IV"),
        (r"intelligent transportation systems|\bitsc\b", "ITSC"),
        (r"american control conference|\bacc\b", "ACC"),
        (r"learning for dynamics|l4dc", "L4DC"),
        (r"conference on robot learning|corl", "CoRL"),
        (r"neurips|neural information processing", "NeurIPS"),
        (r"arxiv", "arXiv"),
        (r"transactions on intelligent vehicles", "T-IV"),
        (r"transactions on intelligent transportation", "T-ITS"),
        (r"field robotics", "Field Robotics"),
        (r"sensors", "Sensors"),
    ]
    for pat, short in table:
        if re.search(pat, v, re.I):
            return short
    return v[:24]


def load_data(path: Path = DATA_FILE) -> dict:
    if not path.exists():
        return {"version": 1, "updated": today(), "scholar_query_url": SCHOLAR_QUERY_URL, "tags": TAGS, "items": []}
    return json.loads(path.read_text())


def save_data(data: dict, path: Path = DATA_FILE) -> None:
    data["updated"] = today()
    data["items"].sort(key=lambda i: (-int(i.get("year", 0)), i.get("title", "").lower()))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def validate(data: dict) -> list[str]:
    """Lightweight validation without jsonschema (use validate-publications.py --strict for full schema)."""
    errors: list[str] = []
    if data.get("version") != 1:
        errors.append("version must be 1")
    tag_ids = {t["id"] for t in data.get("tags", [])}
    if not tag_ids:
        errors.append("tags vocabulary is empty")
    seen: dict[str, str] = {}
    ids: set[str] = set()
    for it in data.get("items", []):
        pid = it.get("id", "<no id>")
        for req in ("id", "title", "authors", "year", "tags", "featured", "status", "added"):
            if req not in it:
                errors.append(f"{pid}: missing {req}")
        if pid in ids:
            errors.append(f"duplicate id {pid}")
        ids.add(pid)
        if not re.match(r"^[a-z0-9-]+$", pid):
            errors.append(f"{pid}: id must be a slug")
        for t in it.get("tags", []):
            if t not in tag_ids:
                errors.append(f"{pid}: unknown tag {t}")
        if it.get("doi") and not re.match(r"^10\.\d{4,9}/\S+$", it["doi"]):
            errors.append(f"{pid}: malformed doi {it['doi']}")
        if it.get("arxiv") and not re.match(r"^\d{4}\.\d{4,5}(v\d+)?$", it["arxiv"]):
            errors.append(f"{pid}: malformed arxiv id {it['arxiv']}")
        if it.get("status") not in {"published", "candidate", "hidden"}:
            errors.append(f"{pid}: bad status {it.get('status')}")
        if it.get("summary") and len(it["summary"]) > 280:
            errors.append(f"{pid}: summary over 280 chars")
        for k in dedupe_keys(it):
            if k in seen and seen[k] != pid:
                errors.append(f"{pid}: duplicate of {seen[k]} ({k})")
            seen.setdefault(k, pid)
    featured = [i for i in data.get("items", []) if i.get("featured") and i.get("status") == "published"]
    if len(featured) > 30:
        errors.append(f"{len(featured)} featured papers; keep it to 30 or fewer so the grid stays curated")
    return errors
