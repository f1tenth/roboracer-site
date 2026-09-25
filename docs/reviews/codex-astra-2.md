# Codex review 2 (gpt-6-astra), 2026-09-25, commits 95ff8d7..f2028b4 (the QA fixes)

Read-only review of the 31 fix commits. Triage by the lead: all six accepted,
scheduled as fix round 3 after the mobile branch merges (the mobile fixers were
editing HeroChapter, EntryPaths and NextRaceSpotlight at the time).

1. **[P2] [Leaderboard.tsx:158]src/components/race/Leaderboard.tsx:158** — A refresh captures the selected board before fetching, then unconditionally restores that selection and replaces the cache; switching boards during the request gets undone when it finishes. Guard the response against subsequent selection changes and merge refreshed files instead of replacing the cache.

2. **[P2] [Leaderboard.tsx:151]src/components/race/Leaderboard.tsx:151** — A successful refresh with no eligible boards leaves previous lap times displayed because only the initial read sets `"empty"`, potentially showing the previous term’s results after a reset. Clear selection, boards and files and enter the empty state on any valid empty response; retain old results only on fetch failure.

3. **[P2] [HeroChapter.tsx:368]src/components/ui/HeroChapter.tsx:368** — The 960 fallback misses stalls between clips: when the current clip ends before its successor becomes playable, the successor remains paused and never emits the playback `waiting` event that arms the timer. Time the sequencer’s pending-`canplay` wait too, downgrade the queued clip after the threshold, and cancel that timer on pause, recovery and cleanup.

4. **[P2] [EntryPaths.tsx:155]src/components/ui/EntryPaths.tsx:155** — The bundled fallback remains invisible while `loadPaths()` hangs because the fetch has no timeout; similarly unbounded requests leave `/news`’s Contribute section hidden and `/about`’s new placeholders pending. Give these reads bounded timeouts that reach their existing failure handlers, or display the bundled entry paths immediately while refreshing them.

5. **[P2] [NextRaceSpotlight.tsx:97]src/components/ui/NextRaceSpotlight.tsx:97** — Registration closure now depends on countdown state whose updates stop under reduced motion, so crossing the deadline leaves “Register your team” active while `/race`’s Enter section switches to closed. Compute registration status with a clock that updates independently of the reduced-motion countdown.

6. **[P2] [HeroChapter.tsx:473]src/components/ui/HeroChapter.tsx:473** — Pausing footage, enabling reduced motion, then disabling it restarts playback unconditionally while the retained pause state still makes the control say “Play footage.” Guard the sequencer’s initial `a.play()` with `pausedRef.current`, preserving the user’s pause across effect restarts.

Codex session ID: 01a0d906-2a97-74a2-9abf-267c3aa5a3f1
Resume in Codex: codex resume 01a0d906-2a97-74a2-9abf-267c3aa5a3f1
