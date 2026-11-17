// Whether a reader has closed the "Write your own post" note on /news. Kept
// in this browser so a closed note stays closed on the next visit; a browser
// that refuses storage simply sees the note again.

const KEY = "rr-write-nudge";

export function nudgeWasClosed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "closed";
  } catch {
    return false;
  }
}

export function rememberNudgeClosed(): void {
  try {
    window.localStorage.setItem(KEY, "closed");
  } catch {
    // Private windows and blocked storage: the note is closed for this visit.
  }
}
