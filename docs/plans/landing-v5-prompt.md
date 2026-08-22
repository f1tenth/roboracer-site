/taskmap Session 8, landing v5: Cedric's final touches on landing v4. Contract: docs/plans/landing-v5.md (read it whole; it names the spec files in docs/design/ and the ownership table). Branch revamp/integration at HEAD.

You are the director (this session: Fable, effort max). Register the map as: milestones = director pre-work, A media-curator, B map, C1 papers, C2 carousel, integration + QA; chunks = the contract sections; steps = the concrete changes. Cedric watches http://localhost:4242 and may leave feedback or add tasks there while you run; read the inbox at each checkpoint (after each stream's first round, before QA, before the report). Blocked nodes only when a human answer is truly required; otherwise decide, note it in the step, and list it in the final report. The site dev server is Cedric's own Vite on 5173; never start one on 4242.

Order: section 1 pre-work (data.ts fields, run scripts/partner-tint.py, commit) -> branch four worktrees -> run A, B, C1, C2 in parallel as page-builder / media-curator subagents on Fable, effort high, each given only its contract section, its spec file, CLAUDE.md and its owned files -> two review rounds per stream, then merge A, B, C1, C2 in that order -> your own section 6 items on Landing.tsx and the other director files -> fill section 9 -> one /qa-page landing -> report.

Cost rules from section 0 are binding: no /impeccable, no superpowers planning, capture caps, no media files into context, never git add -A from a worktree. Commits: includeCoAuthoredBy false, no Co-Authored-By trailers, no AI attribution anywhere.

Report at the end, short: per stream what shipped, what is left with the reason, the decisions you made without asking, the section 9 numbers, and the three captures Cedric should look at first.
