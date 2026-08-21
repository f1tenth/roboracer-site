#!/usr/bin/env python3
"""Validate public/data/publications.json (and optionally the candidates file).

Usage: python3 scripts/validate-publications.py [--strict] [--file public/data/publications.json]
--strict additionally runs full JSON Schema validation if the `jsonschema` package is installed
(pip install jsonschema). Exit code 1 on any problem. Wire into npm test / CI.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pubs_lib as L  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default=str(L.DATA_FILE))
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()
    p = Path(a.file)
    if not p.exists():
        print(f"{p} does not exist (run scripts/migrate-bibtex.py first)")
        return 1
    data = json.loads(p.read_text())
    errs = L.validate(data)
    if a.strict:
        try:
            import jsonschema  # type: ignore

            schema = json.loads(L.SCHEMA_FILE.read_text())
            v = jsonschema.Draft202012Validator(schema)
            errs += [f"schema: {'/'.join(str(x) for x in e.path)}: {e.message}" for e in v.iter_errors(data)]
        except ImportError:
            print("note: pip install jsonschema for full schema validation")
    items = data.get("items", [])
    pub = [i for i in items if i.get("status") == "published"]
    feat = [i for i in pub if i.get("featured")]
    print(f"{p}: {len(items)} items, {len(pub)} published, {len(feat)} featured, {len([i for i in items if i.get('status') == 'candidate'])} candidates")
    if errs:
        print("PROBLEMS:\n  " + "\n  ".join(errs))
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
