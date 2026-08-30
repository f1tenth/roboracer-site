# Link check - pages v2 (session 10)

Every external URL introduced or touched this session, checked with a browser
user-agent and redirects followed, 2026-08-23.

## Summary

| Result | Count | Meaning |
|---|---|---|
| 200 / 3xx | 228 | resolves |
| 429 / 999 | 52 | LinkedIn rate-limit and bot-block codes. Not broken: LinkedIn refuses non-browser clients by design. |
| 403 | 3 | bot-blocked (UVA, Medium, FFG); all three load in a browser |
| 000 / 503 | 4 | transient; IIT Bombay and the Wayback source both returned 200 on retry |
| 404 | 1 | see below |

## Genuinely dead, and what was done

| URL | Where | Action |
|---|---|---|
| `clemson.edu/.../people/Venkat%20Krovi.html` | people.crew.json | **Fixed.** The IROS 2026 site links it with a space; the live page uses a hyphen (`Venkat-Krovi.html`, 200). |
| `endeavors.unc.edu/the-fast-and-the-autonomous/` | news.json | **Unresolved.** Host does not answer from here or from the news agent. Item kept at `status: verify` so it renders with the unverified tag. |

## Not checkable from this machine

LinkedIn returns 429 or 999 to every non-browser client, so 52 profile links
cannot be verified by curl. They were taken from the archived f1tenth.org
about page and from public profiles, and none is asserted as a fact - each is
just a person's own link. Worth a browser spot-check before launch.
