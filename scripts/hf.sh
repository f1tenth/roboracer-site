#!/usr/bin/env bash
# Budget-enforcing wrapper around the Higgsfield CLI. The ONLY way this repo creates
# generation jobs (a PreToolUse hook blocks `higgsfield generate create` typed directly).
#
#   scripts/hf.sh init                                  record the starting balance
#   scripts/hf.sh status                                ledger summary + live balance
#   scripts/hf.sh --cost-only <job_type> [--flag v]...  estimate only, nothing created
#   scripts/hf.sh <job_type> [--flag v]...              estimate, check, create --wait, download, log
#   scripts/hf.sh models                                `higgsfield model list --json` cached to docs/hero-lab/models.json
#
# Env: HF_LEDGER (docs/hero-lab/budget.json), HF_OUT (_harvest/higgsfield), HF_BIN (higgsfield),
#      HF_STATE (.overnight/state.json), HF_APPROVE_OVER_40=1 (Cedric only, one command at a time).
set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
exec python3 "$HERE/hf.py" "$@"
