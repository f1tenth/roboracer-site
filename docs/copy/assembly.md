# /assembly copy pass, phase 2

Files: `src/pages/Assembly.tsx` and the `CAR_PARTS` table in
`src/components/racecarAssemblyData.ts` (part names, products, roles, "how it
connects" notes, build-guide link labels). The callout labels on the landing's
3D car live in the same file and are counted in `docs/copy/landing.md`.

No changes. This page was written on 2026-09-24 in the voice the brief asks
for, and every line passes the eight rules:

- The roles are one short clause each, verb first where there is a verb
  ("Turns the front wheels.", "Runs your driving code.", "Measures the distance
  to the walls.", "Feeds battery power to the Jetson and LiDAR.").
- The notes say what connects to what, with the cable or the voltage ("The PPM
  cable connects it to the VESC.", "Both take 12 V from its terminals.", "It
  reads the LiDAR and commands the VESC, both over USB.").
- The page chrome is verb + object ("Open the build guide", "Reset view",
  "wire it all together") and the lead is one sentence of 12 words.

Left alone on purpose:

- Product names as given ("Traxxas Slash 4x4", "Traxxas, from the kit",
  "laser-cut", "VESC", "NVIDIA Jetson Orin", "Hokuyo UTM-30LX"), per the
  brief for this phase.
- The build-guide link labels ("Lower level chassis", "Upper level chassis",
  "Attaching the PPM cable", "Mounting the VESC", ...). They are the guide's
  own section titles, so the reader finds the same words when the link opens.
- "Nothing to build here." on the wheels: short, and the one honest note a
  part with no build step can have.
- The fallback "The 3D view did not start in this browser. The part list works
  without it." and "Loading the 3D model".

Count: 53 strings reviewed (17 in Assembly.tsx; 36 in CAR_PARTS: 8 names,
6 products, 8 roles, 7 notes, 7 guide labels), 0 changed, 53 left.
