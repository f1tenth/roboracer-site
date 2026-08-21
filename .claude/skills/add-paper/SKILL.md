---
name: add-paper
description: Add a publication to roboracer.ai's research page from a DOI, arXiv id, URL, or uploaded PDF. Resolves metadata (Crossref, arXiv, OpenAlex, Semantic Scholar), dedupes, suggests topic tags, writes to public/data/publications.json, validates, builds, and opens a content PR. Use whenever someone says "add this paper", "put this publication on the site", or drops a paper link or PDF.
argument-hint: "<doi | arxiv id | url | path/to/paper.pdf> [--featured]"
allowed-tools: Bash(python3 *), Bash(scripts/rr.sh *), Bash(npm run *), Bash(git *), Bash(gh pr *), Read, Edit
---

# /add-paper

Goal: a correct, deduplicated, well-tagged entry in `public/data/publications.json` on a `content/paper-<id>` branch with a PR, in under two minutes of the user's attention.

## Current state
Branch: !`git rev-parse --abbrev-ref HEAD`
Data file: !`python3 scripts/validate-publications.py 2>&1 | tail -2`

## Steps
1. Parse the input `$ARGUMENTS`. Accept: DOI (`10.xxxx/...` or doi.org URL), arXiv id or URL, a publisher or project page URL, a local PDF path (uploaded files usually land in the working directory or `/tmp`; if the user pasted a PDF in the chat, ask for its path only if you cannot find it with `ls -t *.pdf /tmp/*.pdf`). If the input is a plain title, pass it as-is; the resolver does a title search and flags it for confirmation.
2. Resolve: `python3 scripts/resolve_paper.py "<input>" --json`. Read the draft. If the resolver prints a NOTE with "confirm", show the user the title, authors, year, venue and ask for a yes before continuing. If it says DUPLICATE, stop and report which existing item matches (offer to update that item instead, e.g. flip `featured`, add a `summary`, fix the venue).
3. Tags: the suggestion is keyword-based. Read the title and abstract yourself and correct the tags using only the vocabulary in `data/publications.schema.json` / the `tags` array of the data file (reinforcement-learning, planning, raceline-optimization, control-mpc, perception-estimation, sim-to-real, multi-agent, safety, systems-platform, education). One to three tags. Prefer the paper's main contribution over mentions.
4. Summary: write a one-sentence `summary` (max 280 chars, plain language, no em dashes, no hype) that says what the paper did and on what (e.g. "Trains a LiDAR-only RL policy in simulation and races it on a physical F1TENTH car without fine-tuning."). Ask the user only if the abstract is missing.
5. Featured: set `--featured` if the user asked, or if the paper is clearly a platform milestone (the F1TENTH platform paper, widely cited surveys, competition papers). Otherwise leave it false and mention they can feature it later. Keep featured under 30.
6. Write: `python3 scripts/resolve_paper.py "<input>" --add --tags <a,b> --summary "<text>" [--featured]`. It validates and sorts the file. Then run `python3 scripts/validate-publications.py --strict`.
7. Branch and PR: if on `main`, run `git switch -c content/paper-<id>`; commit only `public/data/publications.json` with message `content(research): add <short title> (<year>)`; `npm run build` must pass; push and `gh pr create --fill --title "content(research): add <short title>" --body` with the resolved metadata, tags, summary, and source links. Do not merge.
8. Report: title, id, tags, summary, PR link, and anything to double check (venue guessed, abstract missing, candidate duplicates with similar titles).

## Guardrails
- Never write an entry with authors `Unknown` or year 0 without confirmation from the user.
- Never invent a DOI, venue, or institution. Leave fields out rather than guess.
- If the network calls fail (offline, rate limit), say so, keep the draft in chat, and offer to retry; do not write partial entries.
- If the user wants a paper removed, set `"status": "hidden"` instead of deleting (keeps dedupe working).
- When many papers arrive at once (a list of links), process sequentially, one commit per paper on the same branch, one PR.
