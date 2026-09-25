# Codex review 3 (gpt-6-astra), 2026-09-25, commits f2028b4..5c0f31c (the mobile pass)

Read-only review of the mobile pass. Triage by the lead: all six accepted and
fixed in round 3 (branch revamp/p2-round3, docs/qa/polish-2-round3.md).

1. [src/pages/Rules.tsx:66]src/pages/Rules.tsx:66 — An arrival URL such as `/rules#%` throws `URIError` in the new effect, replacing the rulebook with the route error fallback. — Decode the fragment inside `try/catch` and ignore malformed fragments, as `useScrollToHash` already does.

2. [src/components/NavBar.tsx:147]src/components/NavBar.tsx:147 — The scroll lock leaves programmatic scrolling active: an existing Lenis animation continues, and opening the menu at the landing’s top does not prevent the hero’s delayed `window.scrollTo` glide. Closing the menu can therefore reveal a different scroll position. — Share the menu’s lock state with both scroll drivers; stop/resume Lenis and cancel or defer the hero glide while locked.

3. [src/components/ui/ExplodedModel.tsx:285]src/components/ui/ExplodedModel.tsx:285 — Breakpoint changes recreate the trigger without resetting its manually written explosion, callout, and photo state. If the new desktop trigger starts below the current viewport, its unchanged zero progress does not call `onUpdate`, leaving the previously exploded car and hidden photo in place before the chapter starts. — Extract a progress synchronizer, invoke it on initialization and refresh as well as updates, and restore manually owned state during cleanup.

4. [src/components/NavBar.tsx:153]src/components/NavBar.tsx:153 — The new modal handles Escape but never wraps Tab or Shift+Tab; `inert` removes background targets without keeping keyboard focus cycling inside the navigation. The panel also lacks dialog semantics. — Add a focus loop covering the bar and panel, and expose that boundary as a labelled modal dialog.

5. [src/index.css:586]src/index.css:586 — Browsers without `svh`/`lvh` support discard the menu’s sole height bound and the scrim’s sole height declaration. Combined with the new page lock, an overflowing menu leaves its lower links unreachable. — Declare `vh` fallbacks before these declarations; guard the new `svh` spacing-token overrides with `@supports` and retain usable fallback values.

6. [src/components/ui/HeroChapter.tsx:328]src/components/ui/HeroChapter.tsx:328 — The sequencer captures `DESKTOP_QUERY` once, so crossing the height boundary updates the layout and zoom while subsequent clips continue using the original encode choice. A desktop-to-compact resize therefore keeps requesting desktop files. — Evaluate the query when selecting each upcoming clip, or maintain a live media-query ref without restarting playback.

Codex session ID: 01a0d9c4-a2ab-7903-8fb4-2fe6bcb29ea5
Resume in Codex: codex resume 01a0d9c4-a2ab-7903-8fb4-2fe6bcb29ea5
