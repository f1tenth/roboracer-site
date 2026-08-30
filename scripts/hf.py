#!/usr/bin/env python3
"""Budget-enforcing wrapper around the Higgsfield CLI (called through scripts/hf.sh).

Rules it enforces (Cedric, 2026-08-30):
  * `higgsfield generate cost` runs before every job; the running total lives in the ledger.
  * No single job over PER_JOB_MAX credits unless HF_APPROVE_OVER_40=1 is set on that command.
  * Never past CAP_TOTAL. Unattended (.overnight/state.json phase == "unattended"), never past
    UNATTENDED_CEILING: that is the "stop and check in at 200" point.
  * The account balance is the truth: after every job the balance is re-read and
    spent = balance_start - balance_now. Estimates only fill in when the balance call fails.

Exit codes: 0 ok, 2 refused by budget, 3 could not parse the CLI output (fix parse_* below and
re-run; the raw output is saved next to the job), 4 job failed, 5 auth expired (do not retry,
log it, continue without generation), 6 CLI missing.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

def repo_root() -> Path:
    """Anchor every path to the repo root so a stray `cd` cannot start a fresh, empty ledger."""
    try:
        top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, timeout=10)
        if top.returncode == 0 and top.stdout.strip():
            return Path(top.stdout.strip())
    except Exception:
        pass
    return Path.cwd()


ROOT = repo_root()
LEDGER = ROOT / os.environ.get("HF_LEDGER", "docs/hero-lab/budget.json")
OUT = ROOT / os.environ.get("HF_OUT", "_harvest/higgsfield")
STATE = ROOT / os.environ.get("HF_STATE", ".overnight/state.json")
HF = os.environ.get("HF_BIN", "higgsfield")
DEFAULTS = {"cap_total": 250, "unattended_ceiling": 200, "per_job_max": 40}
MEDIA_EXT = (".mp4", ".webm", ".mov", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".glb")


# ----------------------------------------------------------------------------- helpers
def now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n")
    os.replace(tmp, path)


def ledger() -> dict:
    data = load_json(LEDGER, {})
    for k, v in DEFAULTS.items():
        data.setdefault(k, v)
    data.setdefault("balance_start", None)
    data.setdefault("balance_now", None)
    data.setdefault("spent_est", 0)
    data.setdefault("est_since_balance", 0)
    data.setdefault("jobs", [])
    data.setdefault("refusals", [])
    return data


def phase() -> str:
    return load_json(STATE, {}).get("phase", "attended")


def run(args: list[str], timeout: int | None = None) -> tuple[int, str, str]:
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    except FileNotFoundError:
        print(f"hf: `{HF}` not found on PATH. Install: npm i -g @higgsfield/cli", file=sys.stderr)
        sys.exit(6)
    except subprocess.TimeoutExpired:
        return 124, "", "timeout"
    return p.returncode, p.stdout, p.stderr


def auth_expired(text: str) -> bool:
    t = text.lower()
    return re.search(r"session expired|not authenticated|unauthenticated|\bhttp 401\b|status(?:_code)?\s*[:=]\s*401\b", t) is not None


def find_numbers(obj, key_re: re.Pattern, out: list) -> None:
    """Depth-first: collect numeric values whose key matches key_re."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (int, float)) and not isinstance(v, bool) and key_re.search(str(k)):
                out.append(float(v))
            elif isinstance(v, str) and key_re.search(str(k)):
                m = re.search(r"-?\d+(?:\.\d+)?", v)
                if m:
                    out.append(float(m.group()))
            find_numbers(v, key_re, out)
    elif isinstance(obj, list):
        for v in obj:
            find_numbers(v, key_re, out)


def find_strings(obj, out: list, key_hint: re.Pattern | None = None, skip: tuple[str, ...] = ()) -> None:
    """Depth-first: collect string values whose key matches key_hint; never descend into `skip` keys."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if str(k) in skip:
                continue
            if isinstance(v, str) and (key_hint is None or key_hint.search(str(k))):
                out.append(v)
            find_strings(v, out, key_hint, skip)
    elif isinstance(obj, list):
        for v in obj:
            find_strings(v, out, key_hint, skip)


# The job JSON echoes the request under `params` (input_images[].url and the like): those are the
# uploaded references, not results. Seen 2026-08-30 on the first still: nine refs re-downloaded as
# result-2..10 and `result.jpg` was a copy of ref-01.
INPUT_KEYS = ("params", "input_image", "input_images", "image_references", "start_image", "end_image",
              "video_references", "audio_references", "references", "request")


def parse_json_loose(text: str):
    """The CLI prints JSON with --json; tolerate a preamble or trailing log lines."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    for opener, closer in (("{", "}"), ("[", "]")):
        i, j = text.find(opener), text.rfind(closer)
        if i != -1 and j > i:
            try:
                return json.loads(text[i : j + 1])
            except json.JSONDecodeError:
                continue
    return None


# ----------------------------------------------------------------------------- CLI calls
def parse_cost(stdout: str, stderr: str) -> float | None:
    data = parse_json_loose(stdout)
    if data is not None:
        nums: list = []
        # Exact cost-like keys first; never a balance-like key (available/remaining/monthly/plan).
        find_numbers(data, re.compile(r"^(cost|credits|credit_cost|credits_cost|price|total|total_credits|estimated_credits|estimate|amount)$", re.I), nums)
        if not nums:
            find_numbers(data, re.compile(r"^(?!.*(balance|available|remaining|monthly|plan|limit)).*(credit|cost|price|total|amount)", re.I), nums)
        if nums:
            return max(nums)  # a total beats a per-unit field when both exist
    m = re.search(r"(\d+(?:\.\d+)?)\s*credits?", stdout + "\n" + stderr, re.I)
    return float(m.group(1)) if m else None


def estimate(job_type: str, params: list[str]) -> float:
    code, out, err = run([HF, "generate", "cost", job_type, *params, "--json"], timeout=300)
    if auth_expired(out + err):
        print("hf: auth expired during cost estimate. Run `higgsfield auth login` (Cedric). Not retrying.", file=sys.stderr)
        sys.exit(5)
    cost = parse_cost(out, err)
    if code != 0 and cost is None:
        print(f"hf: cost estimate failed (exit {code}):\n{out}\n{err}", file=sys.stderr)
        sys.exit(3)
    if cost is None:
        dump = OUT / "_debug"
        dump.mkdir(parents=True, exist_ok=True)
        (dump / f"cost-{int(time.time())}.txt").write_text(out + "\n--- stderr ---\n" + err)
        print("hf: could not find a credit figure in the cost output; raw output saved under "
              f"{dump}. Fix parse_cost() in scripts/hf.py, commit, re-run.", file=sys.stderr)
        sys.exit(3)
    return cost


def parse_balance(stdout: str) -> float | None:
    data = parse_json_loose(stdout)
    if data is None:
        m = re.search(r"(\d+(?:\.\d+)?)\s*credits?", stdout, re.I)
        return float(m.group(1)) if m else None
    nums: list = []
    for pat in (r"^(available|available_credits|credits_available|balance|credit_balance|remaining)$", r"available|balance|remaining", r"^credits?$", r"credit"):
        find_numbers(data, re.compile(pat, re.I), nums)
        if nums:
            return nums[0]
    return None


def balance() -> float | None:
    code, out, err = run([HF, "account", "status", "--json"], timeout=120)
    if auth_expired(out + err):
        return None
    return parse_balance(out) if code == 0 else None


def spent(led: dict) -> float:
    """Balance-based when the account answers; estimates accumulated since the last good read fill the gap."""
    if led.get("balance_start") is not None and led.get("balance_now") is not None:
        return float(led["balance_start"]) - float(led["balance_now"]) + float(led.get("est_since_balance", 0))
    return float(led.get("spent_est", 0))


def check(led: dict, cost: float, job_type: str, params: list[str]) -> str | None:
    """Return a refusal reason, or None when the job may run."""
    ph = phase()
    total = spent(led)
    approve = os.environ.get("HF_APPROVE_OVER_40") == "1"
    if re.search(r"upscale|topaz", job_type, re.I):
        return "upscale jobs are out of scope tonight (frames are 1600 wide at most)"
    if any(re.fullmatch(r"4k", v, re.I) for v in params):
        return "4k is never used tonight (cost, and the frame set is 1600 wide at most); use 1080p or 720p"
    if cost > led["per_job_max"] and not approve:
        return (f"single job estimate {cost:g} credits is over the {led['per_job_max']}-credit rule; "
                "needs Cedric's yes (HF_APPROVE_OVER_40=1 on this one command), otherwise pick a cheaper "
                "resolution, duration or mode")
    if cost > led["per_job_max"] and approve and ph == "unattended":
        return "HF_APPROVE_OVER_40 is not valid while unattended; only Cedric types it"
    if total + cost > led["cap_total"]:
        return f"would take the total to {total + cost:g}, past the {led['cap_total']}-credit cap"
    if ph == "unattended" and total + cost > led["unattended_ceiling"]:
        return (f"check-in point: total would reach {total + cost:g} credits, past the unattended "
                f"ceiling of {led['unattended_ceiling']}. Generation stops here; continue the build "
                "with the takes on disk and say so in the report")
    return None


def download(urls: list[str], dest: Path) -> list[str]:
    files: list[str] = []
    for n, u in enumerate(urls, 1):
        ext = next((e for e in MEDIA_EXT if u.lower().split("?")[0].endswith(e)), "")
        if not ext:
            ext = ".mp4" if "video" in u.lower() else ".bin"
        target = dest / f"result-{n}{ext}"
        code, _, err = run(["curl", "-sSL", "--retry", "3", "-o", str(target), u], timeout=900)
        if code == 0 and target.exists() and target.stat().st_size > 0:
            files.append(str(target))
        else:
            print(f"hf: download failed for {u}: {err}", file=sys.stderr)
    # Convenience names: result.mp4 / result.png for the first of each kind.
    for f in files:
        p = Path(f)
        alias = dest / ("result" + p.suffix)
        if not alias.exists():
            shutil.copyfile(p, alias)
    return files


def create(job_type: str, params: list[str], cost: float) -> int:
    led = ledger()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    prompt = ""
    if "--prompt" in params:
        prompt = params[params.index("--prompt") + 1]
    slug = re.sub(r"[^a-z0-9]+", "-", prompt.lower())[:40].strip("-") or "job"
    dest = OUT / f"{stamp}-{job_type}-{slug}"
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "request.json").write_text(json.dumps(
        {"ts": now(), "job_type": job_type, "params": params, "estimate": cost, "phase": phase()}, indent=2))

    # Pending row first: if the tool call is killed mid-wait the credits are still spent and logged.
    led["jobs"].append({"ts": now(), "job_type": job_type, "params": params, "estimate": cost, "status": "pending",
                        "job_id": None, "dir": str(dest), "files": [], "balance_after": None, "phase": phase()})
    led["spent_est"] = float(led.get("spent_est", 0)) + cost
    led["est_since_balance"] = float(led.get("est_since_balance", 0)) + cost
    save_json(LEDGER, led)
    args = [HF, "generate", "create", job_type, *params, "--wait", "--wait-timeout", "25m",
            "--wait-interval", "5s", "--json"]
    print(f"hf: creating {job_type} (estimate {cost:g} credits) -> {dest}")
    code, out, err = run(args, timeout=1800)
    (dest / "create.stdout.txt").write_text(out)
    (dest / "create.stderr.txt").write_text(err)
    if auth_expired(out + err):
        print("hf: auth expired during the job. Not retrying. Log it and continue without generation.", file=sys.stderr)
        record(led, job_type, params, cost, dest, status="auth-expired", job_id=None, files=[])
        return 5

    data = parse_json_loose(out) or {}
    ids: list = []
    find_strings(data, ids, re.compile(r"^(id|job_id|jobId)$", re.I))
    job_id = ids[0] if ids else None
    urls: list = []
    find_strings(data, urls, re.compile(r"url|result|output|video|image|file", re.I), skip=INPUT_KEYS)
    urls = [u for u in urls if u.startswith("http") or u.startswith("file://")]
    if not urls:
        # No JSON result field: fall back to bare media URLs in the raw output.
        urls += [u for u in re.findall(r"(?:https?|file)://\S+", out + "\n" + err)
                 if any(u.lower().split("?")[0].endswith(e) for e in MEDIA_EXT) and u not in urls]
    seen: list = []
    urls = [u for u in urls if not (u in seen or seen.append(u))]
    files = download(urls, dest) if urls else []
    status = "completed" if files else ("failed" if code != 0 else ("download-failed" if urls else "no-result"))
    record(led, job_type, params, cost, dest, status=status, job_id=job_id, files=files)
    if status != "completed":
        print(f"hf: job {status} (exit {code}). See {dest}/create.stderr.txt. "
              "A plan restriction means: switch to the fallback model from docs/hero-lab/MODEL_PICK.md.",
              file=sys.stderr)
        return 4
    print(f"hf: done. files: {', '.join(files)}")
    print(f"hf: ledger spent {spent(ledger()):g} / cap {led['cap_total']} "
          f"(unattended ceiling {led['unattended_ceiling']})")
    return 0


def record(led: dict, job_type: str, params: list[str], cost: float, dest: Path, *, status: str,
           job_id, files: list[str]) -> None:
    led = ledger()  # re-read: the pending row was saved before the job ran
    bal = balance()
    if bal is not None:
        led["balance_now"] = bal
        led["est_since_balance"] = 0
        if led.get("balance_start") is None:
            led["balance_start"] = bal + (cost if status == "completed" else 0)
    row = {"ts": now(), "job_type": job_type, "params": params, "estimate": cost, "status": status,
           "job_id": job_id, "dir": str(dest), "files": files, "balance_after": bal, "phase": phase()}
    pending = [j for j in led["jobs"] if j.get("dir") == str(dest) and j.get("status") == "pending"]
    if pending:
        pending[-1].update(row)
    else:
        led["jobs"].append(row)
    save_json(LEDGER, led)


# ----------------------------------------------------------------------------- commands
def cmd_init(force: bool = False) -> int:
    led = ledger()
    if led.get("balance_start") is not None and not force:
        print(f"hf: already initialised (balance_start {led['balance_start']}); `scripts/hf.sh init --force` only with Cedric present.", file=sys.stderr)
        return 1
    if phase() == "unattended":
        print("hf: refusing to re-initialise while unattended", file=sys.stderr)
        return 1
    bal = balance()
    if bal is None:
        print("hf: could not read the balance (auth?). Run `higgsfield auth login` then `scripts/hf.sh init`.", file=sys.stderr)
        return 5
    led["balance_start"] = bal
    led["balance_now"] = bal
    if bal < led["cap_total"]:
        led["cap_total"] = int(bal)
        print(f"hf: balance {bal:g} is under the 250 cap; cap set to {led['cap_total']}")
    # Keep the 50-credit reserve below the cap for a follow-up with Cedric present.
    led["unattended_ceiling"] = min(led["unattended_ceiling"], max(0, led["cap_total"] - 50))
    save_json(LEDGER, led)
    print(f"hf: balance {bal:g} credits; cap {led['cap_total']}, unattended ceiling {led['unattended_ceiling']}, "
          f"per-job max {led['per_job_max']}. Ledger: {LEDGER}")
    return 0


def cmd_status() -> int:
    led = ledger()
    bal = balance()
    if bal is not None:
        led["balance_now"] = bal
        save_json(LEDGER, led)
    print(json.dumps({
        "phase": phase(), "balance_start": led["balance_start"], "balance_now": led["balance_now"],
        "spent": spent(led), "cap_total": led["cap_total"], "unattended_ceiling": led["unattended_ceiling"],
        "per_job_max": led["per_job_max"], "jobs": len(led["jobs"]),
        "completed": sum(1 for j in led["jobs"] if j["status"] == "completed"),
        "refusals": len(led["refusals"]),
    }, indent=2))
    return 0


def cmd_models() -> int:
    code, out, err = run([HF, "model", "list", "--json"], timeout=120)
    if code != 0:
        print(err or out, file=sys.stderr)
        return 5 if auth_expired(out + err) else 4
    Path("docs/hero-lab").mkdir(parents=True, exist_ok=True)
    Path("docs/hero-lab/models.json").write_text(out)
    print("hf: wrote docs/hero-lab/models.json")
    return 0


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(__doc__)
        return 0
    cmd = argv[0]
    if cmd == "init":
        return cmd_init(force="--force" in argv[1:])
    if cmd == "status":
        return cmd_status()
    if cmd == "models":
        return cmd_models()
    cost_only = False
    if cmd == "--cost-only":
        cost_only = True
        argv = argv[1:]
        if not argv:
            print("hf: --cost-only needs a job type", file=sys.stderr)
            return 1
    job_type, params = argv[0], argv[1:]
    if job_type.startswith("-"):
        print(f"hf: first argument must be the job type, got {job_type}", file=sys.stderr)
        return 1
    led = ledger()
    cost = estimate(job_type, params)
    print(f"hf: estimate {cost:g} credits for {job_type}; spent so far {spent(led):g}; phase {phase()}")
    if cost_only:
        return 0
    reason = check(led, cost, job_type, params)
    if reason:
        led["refusals"].append({"ts": now(), "job_type": job_type, "params": params, "estimate": cost, "reason": reason})
        save_json(LEDGER, led)
        print(f"hf: REFUSED: {reason}", file=sys.stderr)
        return 2
    return create(job_type, params, cost)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
