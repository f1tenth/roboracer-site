# public/data/upcoming_events.json copy pass

Descriptions only; dates, fees, venues, names and URLs are out of scope. The
visible text fields that are not names or dates are `dates_secondary` and
`image_alt` (the season chain on /race). The `title` fields are the official
competition names.

| Location | Before | After | Rule broken |
|---|---|---|---|
| IROS 2026, `image_alt` | Cars on the IROS 2026 track in Pittsburgh, seen from above | The ICRA 2026 Master Cup track in Vienna, seen from above and from the bridge, with the track map | alt text was wrong: the image (`race-iros2026-hero-poster.webp`) is a frame of Ezio Bartocci's ICRA 2026 video with "Master Cup @ ICRA 2026" printed on it, and the IROS track has not been built yet. The new alt matches the one Race.tsx and Landing.tsx already use for the same frame |

For the race page owner and Cedric: the IROS 2026 card in the season chain
shows an ICRA 2026 picture. The alt now says so. Whether the card should carry
that picture is a layout call, not a copy one.

Left alone: `dates_secondary` "Check-in and practice September 27" (Cedric's
final wording per the content skill) and the IFAC `image_alt`, which matches
its photo.

Count: 3 strings reviewed (`dates_secondary`, two `image_alt`), 1 changed,
2 left.
