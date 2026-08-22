---
name: discover-papers
description: Find new publications that use or cite RoboRacer/F1TENTH (OpenAlex and Semantic Scholar, no Scholar scraping), write them as candidates for review, and open a PR. Use for the weekly sweep or when someone asks "any new papers?". Accepting a candidate is done with /add-paper or by flipping its status after review.
argument-hint: "[--days 45] [--dry-run]"
allowed-tools: Bash(python3 *), Bash(git *), Bash(gh pr *), Read, Edit
---

# /discover-papers

1. Run `python3 scripts/discover_papers.py $ARGUMENTS` (defaults: last 45 days, max 40 candidates, min relevance 2). It writes `data/publications.candidates.json` and `docs/publications-candidates.md`. With `--dry-run` it only prints.
2. Read `docs/publications-candidates.md`. For each candidate decide: clearly about RoboRacer/F1TENTH (title or abstract says so, or it cites the platform paper) versus noise (a different "F1" meaning, unrelated racing, duplicate of an existing item with a slightly different title). Move noise ids to `data/publications.rejected.json` (`{"keys": ["title:<normalized title>", ...]}`; use the dedupe keys printed by `python3 -c "import sys; sys.path.insert(0,'scripts'); import pubs_lib as L, json; ..."` or simply the `doi:`/`arxiv:`/`title:` form) so they never come back.
3. For the survivors, correct tags if obviously wrong, then either: (a) leave them as candidates in the PR for Cedric/Rahul to skim, or (b) if the user says "accept all", run `python3 scripts/resolve_paper.py "<doi or arxiv>" --add --tags ...` for each (the resolver enriches metadata) and remove them from the candidates file.
4. Branch `content/papers-<YYYY-MM-DD>`, commit `data/publications.candidates.json`, `data/publications.rejected.json`, `docs/publications-candidates.md`, and `public/data/publications.json` if anything was accepted. `npm run build` must pass if the public file changed. Push, `gh pr create` with the markdown summary as the body, label `content`. Do not merge.
5. Report counts: found, rejected as noise, accepted, left as candidates, and the PR URL.

Notes: Semantic Scholar without an API key is rate limited (around 1 request/s shared); the script sleeps between pages. If it returns nothing, retry later or set `S2_API_KEY`. OpenAlex needs no key. Google Scholar has no API and forbids scraping, which is why the site links out to it instead of mirroring it.
