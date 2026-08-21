# Repo Audit — roboracer-site

Inspected 2026-08-20 on branch `infra/claude-harness`, HEAD `3273a8a` ("infra: Claude Code harness, publication tooling, revamp plan"), merge-base with `main` = `4ea2e09`. `feat/assembly-viewer` (commit `9bfbf2f`) inspected read-only via `git show`, not checked out.

## Summary

- 10 routes wired in `src/App.tsx`: `/`, `/about`, `/build`, `/course`, `/learn`, `/news`, `/race`, `/research`, `/rules`, `/chat`. All under one `Layout` (NavBar + Outlet + Footer), no route-level code splitting.
- `npm run lint`: **pass**, 0 errors/warnings. `npm run build`: **pass** in 7.5s, one JS chunk `dist/assets/index-BAp6Q3mR.js` 1,229.14 kB (310.75 kB gzip), Vite warns about the 500 kB chunk-size threshold.
- `public/` is 101 MB. `public/crew/` alone is 64 MB, of which 53.99 MB (59 of 76 files) is unreferenced by any JSON or component.
- 8 components in `src/components/` and 6 files in `src/pages/sections/` are dead code — never imported from a routed page.
- `public/data/publications.json` (47.8 KB, 67 items) is written by the Python pub pipeline but not read by any React code; `/research` fetches BibTeX from GitHub directly instead.
- `upcoming_events.json` has a stale entry: IV 2026 (Jun 22–25) is listed as upcoming though today is 2026-08-20.
- The `/assembly` route (F1TENTH parts viewer, R3F) exists only on unmerged branch `feat/assembly-viewer`; it is already lazy-loaded and merges cleanly (no conflicts) into both `main` and the current branch.
- Three unreferenced binaries exceed 1.5 MB in the current tree: `public/landing/f110_fpv.mp4` (13.2 MB), `public/logos/Logo_Gradient.gif` (3.8 MB), and several `public/crew/*` photos.
- Top risks: (1) 100 MB+ of dead media shipped on every deploy, (2) single unsplit 1.2 MB JS bundle with three.js/tsparticles/embla/bibtex-parser all bundled even though most are unused on any live route, (3) content staleness in `upcoming_events.json` and `news.json` (latest item Feb 2024).

---

## Routes (`src/App.tsx`)

| Route | File | Layout | Reads |
|---|---|---|---|
| `/` | `src/pages/Landing.tsx` (226 lines) | normal | `FloatingTestimonials` -> `public/data/testimonies.json`; static hero image `public/landing/hero-bg.jpg`; `public/landing/car-inside.png`; `public/logos/slack-logo.svg` |
| `/about` | `src/pages/About.tsx` (158) | normal | `public/data/team_developers.json`, `team_alumni.json`, `partners.json`; embla carousel of `public/about/*.jpg` |
| `/build` | `src/pages/Build.tsx` (11) | alt (iframe, hidden overflow) | iframe `https://f1tenth.readthedocs.io/en/main/` |
| `/course` | `src/pages/Course.tsx` (11) | alt | iframe `https://ahmadamine998.github.io/ESE6150-Website/` |
| `/learn` | `src/pages/Learn.tsx` (11) | alt | iframe `https://f1tenth-coursekit.readthedocs.io/en/latest/` |
| `/news` | `src/pages/News.tsx` (50) | normal | `public/data/news.json` |
| `/race` | `src/pages/Race.tsx` (68) | normal | `public/data/upcoming_events.json`, `past_races.json`; dead commented-out Google Calendar iframe (lines 30-31) |
| `/research` | `src/pages/Research.tsx` (125) | normal | external fetch `https://raw.githubusercontent.com/f1tenth/roborace_publications/main/pub.bibtex`, parsed with `@retorquere/bibtex-parser` — does **not** read `public/data/publications.json` |
| `/rules` | `src/pages/Rules.tsx` (50) + `src/pages/rules.css` | normal | fetches `public/rules.md`, rendered with `marked` |
| `/chat` | `src/pages/Chat.tsx` (41) | hidden (no nav/footer) | injects `<script src="https://altegolabs.com/widget.js">` (AlterEgo chat widget, site ID `cmq95bbl00003pc0plc684lw0`), plus an iframe to the same readthedocs Build URL as background |

`src/components/Layout.tsx` decides `isAltLayout` / `isHiddenRoute` by string-comparing `location.pathname` against a hardcoded list (lines 9-14) — adding a route with special chrome means editing this list, there is no per-route layout prop.

`src/pages/sections/*` (About, GettingStarted, Registration, Resources, Rules, Timeline, plus `sections/assets/*`, ~30 MB) — **not imported from anywhere**, confirmed via `grep -rln "sections/<name>" src`. Leftover from an earlier race-microsite build. Candidate for deletion once confirmed with Cedric there's nothing worth salvaging in the copy.

## Components (`src/components/`)

Live (imported by a routed page):
- `NavBar.tsx` (141) — imported by `Layout.tsx`. Links: About, Build, Learn, Race, Course, Research, News + external CTAs (AutoDRIVE simulator, Slack invite).
- `Footer.tsx` (103) — imported by `Layout.tsx`; self-hides on `/learn`, `/build`, `/course` (line 5-8, duplicates the Layout.tsx alt-route list — two sources of truth for the same concept).
- `FloatingTestimonials.tsx` (80) — imported by `Landing.tsx` only.

Dead (zero imports from any file that is itself reachable from `App.tsx`):
- `EmailSubscribeForm.tsx` (37) — Mailchimp form, never mounted anywhere.
- `PoppingParticles.tsx` (75) — wraps `@tsparticles/react`; imports `@tsparticles/slim` and `@tsparticles/engine`, neither of which is declared in `package.json` (they resolve today only because they're transitive deps of `tsparticles`/`@tsparticles/react`).
- `Model.tsx` (19) + `ModelViewer.tsx` (16) — R3F, loads `public/models/anim_2.glb` (2.6 MB) via `@react-three/drei`'s `useGLTF`. `ModelViewer` (the only exported consumer of `Model`) is itself never imported.
- `TerrainRenderer.tsx` (66) + `renderer.tsx` (86) + `Grid2D.tsx` (27) + `fbm2d.tsx` (14) — canvas-2D terrain/noise experiment (`simplex-noise`, `alea`, `gl-matrix`). Nothing imports `TerrainRenderer`.

`src/App.css` — Vite/CRA boilerplate CSS, not imported by `main.tsx` (which only imports `./index.css`). Dead file.

## Data files (`public/data/*.json`)

```ts
// news.json — 7 items, latest 2024-02-15 (stale: newest item is 2.5 years old)
interface NewsItem {
  title: string; platform: string; date: string; // free-text, not ISO
  description: string; link: string; thumbnail: string; // absolute URL
}

// partners.json — 20 items
interface Partner { name: string; website: string; image: string /* "partners/xxx.png" */ }

// past_races.json — 33 items
interface PastRace { name: string; url: string }

// team_developers.json — 8 items, team_alumni.json — 12 items
interface TeamMember { name: string; linkedin?: string; image: string /* "crew/xxx.ext" or "crew/avatar.svg" placeholder */ }
// 3 alumni entries point at the crew/avatar.svg placeholder (no real photo on file)

// testimonies.json — 8 items
interface Testimonial { author: string; institution: string; image: string; quote: string; color: string }

// upcoming_events.json — 4 items
interface UpcomingEvent { title: string; dates: string; location: string; url: string }
// STALE: item 1 "IV 2026" dates "June 22-25, 2026" — in the past relative to today 2026-08-20,
// still listed as upcoming. Items 2-4 (IFAC Aug 24-27, VTC Sep 6-9, IROS Sep 27-30) are genuinely upcoming.

// publications.json — NOT consumed by any component. Written/maintained by scripts/*.py.
interface PublicationsFile {
  version: number;
  updated: string;              // "2026-08-20"
  scholar_query_url: string;
  tags: { id: string; label: string; scholar_query: string }[]; // 10 tags
  items: {
    id: string; title: string; authors: string[]; year: number;
    venue: string; venue_short: string;
    type: "conference" | string;
    tags: string[]; featured: boolean;
    status: "published" | string;
    added: string;               // ISO date
    source: string;               // e.g. "bibtex-migration"
    notes?: string;
  }[]; // 67 items
}
```

## Assets (files over 300 KB, `find public src -size +300k`)

| File | Size | Referenced by |
|---|---|---|
| `src/pages/sections/assets/roboracer_video.gif` | 21 MB | nothing (dead `sections/` tree) |
| `public/crew/YashPant.jpg` | 14 MB | nothing (not in team_developers.json / team_alumni.json) |
| `public/landing/f110_fpv.mp4` | 13 MB | nothing — grep for `f110_fpv` across `src` and `public/data` returns 0 hits |
| `public/crew/pablo.png` | 7.1 MB | nothing |
| `public/crew/achin.jpg` | 5.9 MB | nothing |
| `public/landing/hero-bg.jpg` | 4.4 MB | `src/pages/Landing.tsx` (`HERO_CONFIG.backgroundImage`, rendered at 30% opacity) |
| `public/logos/Logo_Gradient.gif` | 3.8 MB | nothing |
| `public/crew/susan.png` | 3.8 MB | nothing |
| `public/crew/kuk.jpg` | 3.4 MB | nothing |
| `public/crew/billy.png` | 2.9 MB | `team_developers.json` (Billy Zheng) |
| `public/crew/Nagarakshith_Makam_Sreenivasulu.jpg` | 2.8 MB | nothing |
| `public/models/anim_2.glb` | 2.6 MB | only by dead `src/components/Model.tsx` |
| `public/crew/Roshan_Benefo.jpeg` | 2.2 MB | `team_alumni.json` |
| `public/crew/Raymond_Bjorkman.jpg` | 1.6 MB | nothing |
| `public/about/image-2.JPG` | 1.6 MB | `src/pages/About.tsx` carousel |
| `public/crew/thejas.JPG` | 1.5 MB | nothing |
| `public/crew/Brandon_McBride.jpg` | 1.5 MB | nothing |
| `public/about/image-3.JPG` | 1.5 MB | `src/pages/About.tsx` carousel |
| `src/pages/sections/assets/car.png` | 1.8 MB | nothing (dead) |
| `src/pages/sections/assets/f1tenth.gif` | 1.2 MB | nothing (dead) |
| `public/partners/duke.png` | 1.0 MB | nothing (not in `partners.json`) |
| (30+ more crew/partner files 300 KB – 900 KB) | — | mostly unreferenced, see below |

**Files over 1.5 MB total in the tree: 15+**, all flagged above. Under the project's "no binary over 1.5 MB enters git" rule (CLAUDE.md rule 3), every one of `roboracer_video.gif`, `YashPant.jpg`, `f110_fpv.mp4`, `pablo.png`, `achin.jpg`, `hero-bg.jpg`, `Logo_Gradient.gif`, `susan.png`, `kuk.jpg`, `billy.png`, `Nagarakshith_...jpg`, `anim_2.glb`, `Roshan_Benefo.jpeg`, `Raymond_Bjorkman.jpg`, `image-2.JPG`, `thejas.JPG`, `Brandon_McBride.jpg`, `image-3.JPG` is already in violation and pre-dates this rule; they should be resized/converted to WebP or removed, not added to as-is.

**Directory-level reference audit:**
- `public/crew/` — 76 files, 64 MB. Only 20 are referenced from `team_developers.json` + `team_alumni.json` (3 of those 20 point at the `crew/avatar.svg` placeholder, meaning the real photo is missing). **59 files / 53.99 MB are orphaned.**
- `public/partners/` — 67 files, 7.2 MB. Only 20 referenced from `partners.json`. **47 files orphaned**, including `duke.png` (1.0 MB), `unitexas.png` (372 KB), `lund.png` (340 KB).
- `public/testimonials/` — 22 files. Only images referenced by `testimonies.json`'s 8 entries are used; **17 files orphaned**.
- `public/logos/` — `Logo_Gradient.gif` (3.8 MB), `logo square with text.png` (142 KB), `logo-white.svg`, `logo-white-vector-animated.svg` (61 KB) are all unreferenced; only `logo-black-gradient.png` (NavBar), `logo-white-gradient.svg` (Footer), `slack-logo.svg` (Landing, Footer) are used. `public/logo-square.svg` (repo root, not `logos/`) is the favicon in `index.html`.
- `public/events/placeholder.png` (132 KB) — unreferenced anywhere; name suggests a leftover stub.
- `public/models/anim_2.glb` (2.6 MB) — only reachable through the dead `Model.tsx`/`ModelViewer.tsx` pair.
- `public/buttons/three-lines.svg` — unreferenced.

## Dead code

- `src/App.css` — unused (see above).
- `src/pages/sections/` (6 `.tsx` files + `assets/` subfolder, ~30 MB) — not routed, not imported.
- `src/components/EmailSubscribeForm.tsx`, `PoppingParticles.tsx`, `Model.tsx`, `ModelViewer.tsx`, `TerrainRenderer.tsx`, `renderer.tsx`, `Grid2D.tsx`, `fbm2d.tsx` — none reachable from `App.tsx`.
- `src/pages/Race.tsx:30-31` — commented-out Google Calendar iframe block.
- `public/data/publications.json` — orphaned data file relative to the live site (feeds the Python discover-papers pipeline instead; see `.claude/skills/roboracer-content`, `.claude/skills/add-paper`).

Note: `App.tsx` on this branch already has the `// import Events from "./pages/Events"` comment (line 13) but `src/pages/Events.tsx` itself has already been deleted from the tree — nothing to remove there, just the stale comment.

## Dependencies (`package.json`)

Declared but with **zero direct imports found in `src/`** (`grep -rl "from '<pkg>'" src`):
- `motion` (^12.4.2) — `framer-motion` (also ^12.4.2) is the one actually imported (`NavBar.tsx`). `motion` and `framer-motion` are the same underlying library under two package names; one is redundant.
- `three` (^0.174.0) — no direct `from "three"` import in any live file; only pulled in transitively by the dead R3F components and by `@react-three/fiber`/`drei`.
- `tsparticles` (^3.8.1) — only referenced (as `@tsparticles/react`, `@tsparticles/slim`, `@tsparticles/engine`) from the dead `PoppingParticles.tsx`.
- `@react-three/fiber`, `@react-three/drei` — only used by dead `Model.tsx`/`ModelViewer.tsx` today; will become load-bearing again once `feat/assembly-viewer` merges (see Assembly section).

Used and load-bearing: `react`, `react-dom`, `react-router-dom` (5 files), `framer-motion` (NavBar mobile menu), `embla-carousel-react` (About carousel), `@retorquere/bibtex-parser` (Research), `marked` (Rules), `@tailwindcss/vite` (vite.config.ts only, not `src/`, correct).

Undeclared-but-resolving-today transitive imports (fragile): `@tsparticles/slim`, `@tsparticles/engine` imported directly in `PoppingParticles.tsx` without being in `package.json` — works only because they ship as sub-dependencies of `tsparticles`/`@tsparticles/react`. On the `feat/assembly-viewer` branch, `RacecarAssembly.tsx` similarly imports `three-stdlib` directly without it being a declared `package.json` dependency (it resolves as a transitive dep of `@react-three/drei`).

## Build output

- `npm run lint` — **0 errors, 0 warnings** (eslint 9 flat config, `eslint .`).
- `npm run build` — **succeeds**, `tsc -b && vite build`, 475 modules transformed, 7.50s.
  ```
  dist/index.html                     0.75 kB │ gzip:   0.41 kB
  dist/assets/index-BzLbbvZ2.css     44.00 kB │ gzip:   9.64 kB
  dist/assets/index-BAp6Q3mR.js   1,229.14 kB │ gzip: 310.75 kB
  ```
  Vite warning: chunk over 500 kB after minification, suggests `dynamic import()` / `manualChunks`. There is currently **no route-level code splitting** — every page (including the iframe-only `/build`, `/course`, `/learn`) and every dependency (three.js pulled in transitively, embla, bibtex-parser) ships in the single JS chunk regardless of which route is visited.
- `node_modules` was already present; no `npm ci` was required for this audit.

## Assembly viewer (`feat/assembly-viewer`, commit `9bfbf2f`, unmerged)

Files (do not exist on `main` or this branch, read via `git show feat/assembly-viewer:<path>`): `src/pages/Assembly.tsx` (366 lines), `src/pages/assembly.css` (756 lines), `src/components/RacecarAssembly.tsx` (337 lines), `src/components/racecarAssemblyData.ts` (122 lines), `public/models/racecar/*` (7 binaries), `scripts/sync-racecar-assets.mjs` (25 lines).

### Scene graph and data model

`RacecarAssembly.tsx` exports `RacecarAssemblyCanvas`, an R3F `<Canvas>` (ACES tone mapping, shadows, `dpr={[1, 1.75]}`) containing:
- Lighting: ambient, hemisphere, one shadow-casting directional light, one accent spot light; a fog/background color `#080a0d`.
- `<group name="f1tenth_xacro_assembly" rotation={[-Math.PI/2,0,0]}>` wrapping one `<ExplodedPart>` per entry in `RACECAR_PARTS`.
- `ExplodedPart` uses `useFrame` to `lerp` each part's group position from `part.position` toward `part.position + part.explosion * explosion` (critically damped, `1 - Math.exp(-11*delta)`), so the **explosion amount is already a single float prop (`explosion: number`, 0–1) driving every part** — this is exactly the shape a scroll-driven prop needs.
- Two geometry loaders: `GlbGeometry` via `@react-three/drei`'s `useGLTF` (with `useGLTF.preload` called eagerly for all `.glb` parts at module scope, line 24-25) and `StlGeometry` via `useLoader(STLLoader, ...)` where `STLLoader` comes from `three-stdlib`.
- `CameraController` wraps `OrbitControls` (drei) with a fixed reset pose; `Html` (drei) renders part labels as DOM overlays when `explosion > 0.08`.
- `useProgress` (drei) drives a loading bar in `Assembly.tsx` until `SceneReady`'s `onReady` fires.

`racecarAssemblyData.ts` exports `RACECAR_PARTS: readonly RacecarPart[]` (7 parts: chassis, accent, lidar, 4 wheels) and the `RacecarPartId` union type. Each `RacecarPart` carries `{ id, name, description, frame, joint, asset, format: "glb"|"stl", position: [x,y,z], rotation?: [x,y,z] (radians), explosion: [x,y,z], color }`. Transforms are hand-copied from `../f1tenth_gym_ros/urdf/racecar_mesh.xacro` at scale 1.0 (comment at top of file says do not hand-edit without re-syncing from the xacro). `ASSET_ROOT` resolves to `${import.meta.env.BASE_URL}models/racecar`.

### UI controls (`Assembly.tsx`)

Reset camera, auto-rotate toggle, part-label toggle, wireframe toggle, "export for CAD" (dynamic `import("three/examples/jsm/exporters/GLTFExporter.js")`, exports the assembled, non-exploded, non-hidden scene as `.gltf` — note this uses the raw three.js examples path, not `three-stdlib`'s re-export, a second, inconsistent way of reaching the same loader family), keyboard shortcuts `E` (toggle 0/1 explosion) and `R` (reset camera), a `<input type="range">` explosion slider (0–100, mapped to `explosion: number` state 0–1), a scene-tree side panel listing all 7 parts with per-part visibility toggle and a click-to-inspect readout (frame, joint, XYZ position). No vehicle-size/scale UI — scale is fixed at "1:1" (displayed as a static stat, `<dd>1:1</dd>`).

### Wiring into `App.tsx` / `Layout.tsx`

Already correctly wired for a production merge:
```diff
+const Assembly = lazy(() => import("./pages/Assembly"));
...
+<Route path="/assembly" element={<Suspense fallback={null}><Assembly /></Suspense>} />
```
i.e. `/assembly` **is already code-split** (React.lazy + dynamic import), so it does not inflate the shared bundle measured above. `Layout.tsx` adds `/assembly` to both the `isAltLayout` (fullscreen, `overflow-hidden`) and `isHiddenRoute` (no NavBar/Footer) string-comparison lists (same pattern flagged as fragile in the Routes section above).

### Real cost

| File | Bytes |
|---|---|
| `public/models/racecar/roboracer_chassis.glb` | 706,284 |
| `public/models/racecar/roboracer_wheel_rear_left.glb` | 331,364 |
| `public/models/racecar/roboracer_wheel_front_left.glb` | 331,220 |
| `public/models/racecar/roboracer_wheel_rear_right.glb` | 314,672 |
| `public/models/racecar/roboracer_wheel_front_right.glb` | 314,576 |
| `public/models/racecar/roboracer_accent.stl` | 155,684 |
| `public/models/racecar/roboracer_lidar.glb` | 39,696 |
| **Total** | **2,193,496 bytes (~2.09 MB)** |

No single file breaches the 1.5 MB binary rule; the *route's total payload* (~2.1 MB of meshes, fetched on demand only when `/assembly` is visited, not on first paint) is still substantial for a mobile GPU/connection. Loaders pulled in: `@react-three/fiber`, `@react-three/drei` (`useGLTF`, `Html`, `OrbitControls`, `Grid`, `ContactShadows`, `useProgress`), `three-stdlib` (`STLLoader`, undeclared direct dependency — see Dependencies section), plus a dynamic `three/examples/jsm/exporters/GLTFExporter.js` import used only when the export button is clicked. None of the meshes are Draco- or meshopt-compressed.

### Proposal: landing-page `ExplodedModel` chapter reuses this scene

Requirements from the task: scroll-driven explosion via GSAP ScrollTrigger scrub, lazy-loaded chapter that never blocks first paint, `/assembly` keeps its own full controls, one shared scene/data module, working `prefers-reduced-motion`/no-JS fallback.

**Shared source of truth: `src/components/RacecarAssembly.tsx`.** It already exports the right unit — `RacecarAssemblyCanvas`, a presentational component whose entire animatable state comes in as props (`explosion: number`, `hiddenParts`, `labelsVisible`, `selectedPart`, `wireframe`, `autoRotate`, `resetKey`, `assemblyRef`, `onReady`, `onSelect`). Nothing about it is `/assembly`-specific except how its *caller* wires those props to UI. Concretely:

1. Keep `RacecarAssembly.tsx` + `racecarAssemblyData.ts` as the single shared module (no fork). Both already live under `src/components/`, so no new package boundary is needed — just merge the branch.
2. New file `src/components/landing/ExplodedModelChapter.tsx` (new, page-specific, thin):
   - `const RacecarAssemblyCanvas = lazy(() => import("../RacecarAssembly").then(m => ({ default: m.RacecarAssemblyCanvas })))` so the ~2 MB of meshes and the three.js/R3F runtime are only fetched when this chapter scrolls into view (pair with an `IntersectionObserver`-gated mount, not just `React.lazy`, so it doesn't even start loading on page load).
   - Owns a GSAP `useGSAP` + `ScrollTrigger` hook (`scrub: true`) that maps chapter scroll progress (0–1) to a piece of local state `explosion`, passed straight through as the `explosion` prop — no new animation system needed, `ExplodedPart`'s existing `useFrame` lerp already smooths it.
   - Passes `hiddenParts={new Set()}`, `labelsVisible={false}`, `wireframe={false}`, `autoRotate={false}`, a fixed `resetKey`, and a no-op `onSelect` — the chapter is a fly-through, not an inspector; it should not carry `/assembly`'s side panel or export button.
3. `Assembly.tsx` (unchanged) keeps owning all of the interactive chrome (side panel, export, keyboard shortcuts, wireframe/labels/auto-rotate toggles) and continues to render `RacecarAssemblyCanvas` directly, fully interactive.
4. `prefers-reduced-motion` / JS-disabled fallback for the landing chapter: render a static `<img>` poster (a pre-rendered screenshot of the exploded assembly, e.g. `public/landing/racecar-exploded-poster.webp`, produced once and committed under the 1.5 MB rule) inside a `<noscript>` and inside a `window.matchMedia('(prefers-reduced-motion: reduce)')` branch, instead of ever mounting the R3F canvas. This mirrors the CLAUDE.md rule 6 requirement ("content must be visible and usable with JS animations disabled") and avoids paying the WebGL + mesh-download cost for users who opted out of motion or have no JS.

**Risks:**
- **Mid-range mobile GPU cost**: `dpr={[1, 1.75]}`, shadows, `ContactShadows`, and a fog pass are tuned for a full-screen dedicated viewer; reusing the same `<Canvas>` props inside a landing-page chapter that also has to coexist with the rest of the scroll-driven page (Lenis smooth scroll + other GSAP timelines) risks frame drops on mid-range phones. Recommend a lighter `gl`/`shadows` prop path for the chapter variant (still same component, just different Canvas config) — that config difference is a legitimate reason to expose `canvasProps?: Partial<CanvasProps>` on `RacecarAssemblyCanvas` rather than fork it.
- **Payload budget**: 2.1 MB of meshes plus the R3F/three.js/drei runtime (not currently in the shared bundle at all, per the build output above) is a meaningful addition to a page that CLAUDE.md implies should have a fast, no-blocking first paint. The lazy+`IntersectionObserver` gating above is required, not optional.
- **R3F + ScrollTrigger integration**: GSAP's `ScrollTrigger` and R3F's `useFrame` both want to own the render loop's timing; the existing `lerp`-based smoothing in `ExplodedPart` means the `explosion` prop can be driven by a `scrub: true` ScrollTrigger's `onUpdate` without fighting R3F, but `Lenis` smooth-scroll (already in the stack) needs to be told to update `ScrollTrigger` on its `scroll` event (`lenis.on('scroll', ScrollTrigger.update)`) or the mapping will lag/jump. This is a real integration cost, budget QA time for it specifically.
- **Draco/meshopt savings**: none of the 7 GLBs are compressed. A Draco pass (`gltf-transform` or `gltfpack`) would likely take the wheel GLBs (~310-330 KB each, largely repeated geometry across 4 wheels) and the 706 KB chassis down substantially — worth doing before the landing chapter ships, since the chapter pays this cost on every mobile visit that scrolls far enough, not just on an opt-in `/assembly` visit.

### Merge sequencing

**Yes, merge `feat/assembly-viewer` into the revamp line first**, before building the landing `ExplodedModel` chapter. Verified via `git merge-tree $(git merge-base main feat/assembly-viewer) main feat/assembly-viewer` and the same check against current `HEAD` — **both produce zero conflicts** (the branch's merge-base, `4ea2e09`, is identical to current `main`, and `App.tsx`/`Layout.tsx`/`package.json` changes on the branch are pure additive diffs that don't touch lines this branch has changed). Building the landing chapter against `RacecarAssembly.tsx` before that file exists on the revamp line would mean redoing the merge later against a moved target. The only manual follow-up after merging: reconcile `README.md` (the branch rewrites it wholesale — see `git diff main feat/assembly-viewer -- README.md`) and decide whether `scripts/sync-racecar-assets.mjs`'s hardcoded `../f1tenth_gym_ros/meshes` sibling-repo path is acceptable for this environment.

## Risks

1. **Dead weight ships to production.** ~54 MB of unreferenced `public/crew/` photos plus `f110_fpv.mp4`, `Logo_Gradient.gif`, orphaned `public/partners/` and `public/testimonials/` files, and the entire `src/pages/sections/` tree (~30 MB) all get bundled into every `gh-pages` deploy via `build_to_pages.yml`'s `npm run build` + full `dist/` publish, inflating GitHub Pages storage and clone/checkout time for no user-facing benefit.
2. **No code splitting on a 1.2 MB single-chunk bundle**, and `feat/assembly-viewer` is about to add three.js/R3F/drei as load-bearing (not just transitively-present) dependencies once merged. Without `manualChunks` or per-route `React.lazy` (already the pattern the assembly branch introduces correctly), every route pays for every other route's JS, including three.js on pages that never render a canvas.
3. **Content staleness the team won't notice without an audit**: `upcoming_events.json`'s IV 2026 entry is already in the past as of today; `news.json`'s newest item is 2.5 years old; 3 `team_alumni.json` entries fall back to the `crew/avatar.svg` placeholder. None of this breaks the build, so it can sit stale indefinitely.

## Recommended order of work

1. Delete confirmed-dead code and assets in one `content/`-or-`infra/`-scoped PR: `src/App.css`, `src/pages/sections/`, `src/components/{EmailSubscribeForm,PoppingParticles,Model,ModelViewer,TerrainRenderer,renderer,Grid2D,fbm2d}.tsx`, the 59 orphaned `public/crew/*` files, 47 orphaned `public/partners/*` files, 17 orphaned `public/testimonials/*` files, `public/landing/f110_fpv.mp4`, `public/logos/Logo_Gradient.gif`, `public/logos/logo-white.svg` + `logo-white-vector-animated.svg` + `logo square with text.png`, `public/events/placeholder.png`, `public/buttons/three-lines.svg`, `public/models/anim_2.glb` (unless the assembly-viewer merge wants to keep it — check first). Re-run `npm run build` and confirm the referenced-elsewhere set is untouched before deleting.
2. Merge `feat/assembly-viewer` into the revamp line (clean per `git merge-tree`), resolve the `README.md` rewrite, decide on `scripts/sync-racecar-assets.mjs`'s sibling-repo path.
3. Fix `upcoming_events.json` staleness (move IV 2026 to `past_races.json`) and flag `news.json` for a content refresh — data-only change, no component edits, per CLAUDE.md rule 4/10.
4. Once step 1 shrinks `public/`, compress the remaining oversized-but-used binaries (`hero-bg.jpg` 4.4 MB, `image-2.JPG`/`image-3.JPG` 1.5-1.6 MB, `billy.png` 2.9 MB, `Roshan_Benefo.jpeg` 2.2 MB) to WebP/AVIF per CLAUDE.md rule 3.
5. Add route-level `React.lazy` for the remaining heavy routes (`Research.tsx`'s bibtex-parser, `About.tsx`'s embla) and/or `manualChunks` in `vite.config.ts` to stop shipping unused three.js/tsparticles code to every route once dependencies are pruned in step 1.
6. Build the landing `ExplodedModel` chapter per the proposal above, after a Draco/meshopt pass on the `racecar/*.glb` files.
