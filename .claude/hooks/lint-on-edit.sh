#!/usr/bin/env bash
# PostToolUse: run eslint --fix on the edited TS/TSX file so style drift never reaches a PR.
INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null)
case "$FILE" in
  *.ts|*.tsx)
    if [ -f "$FILE" ] && [ -d "${CLAUDE_PROJECT_DIR:-.}/node_modules" ]; then
      (cd "${CLAUDE_PROJECT_DIR:-.}" && npx eslint --fix --no-warn-ignored "$FILE" >/dev/null 2>&1) || echo "eslint reported problems in $FILE (run npm run lint)" >&2
    fi
    ;;
esac
exit 0
