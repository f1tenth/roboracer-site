#!/usr/bin/env node
// Builds the static world map used by the landing "community" chapter.
//   in : data/events_map.source.json   (hand-maintained: events with lat/lng, verified flag)
//        node_modules/world-atlas/countries-110m.json (Natural Earth, public domain), Antarctica dropped
//   out: public/media/map/world-land.svg  (one land path, Natural Earth I projection, 1600 wide, height fitted to the land)
//        public/data/events_map.json      (same events + projected x/y in the SVG's viewBox)
// Runtime needs no d3: the chapter inlines the SVG and positions pins from x/y.
// Run: node scripts/build-world-map.mjs   (devDependencies: d3-geo, topojson-client, world-atlas@2)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature, merge } from "topojson-client";

const require = createRequire(import.meta.url);
const W = 1600;
const PAD = 8;

// countries-110m lets us drop Antarctica (id 010) so the map does not spend a
// fifth of its height on an empty continent; the remaining countries merge into
// one land geometry.
const world = require("world-atlas/countries-110m.json");
const geometries = world.objects.countries.geometries.filter((g) => g.id !== "010");
const landGeo = merge(world, geometries);

// Size the viewBox to the land: without Antarctica the world is wider than
// 1600x820, so a fixed height left about a fifth of the box as empty rows above
// and below the continents (the chapter rendered a 740x340 map in an 800x410
// frame at 1440). Fit by width, measure, then fit the exact extent.
const probe = geoNaturalEarth1().fitWidth(W - 2 * PAD, landGeo);
const [[, top], [, bottom]] = geoPath(probe).bounds(landGeo);
const H = Math.ceil(bottom - top + 2 * PAD);

const projection = geoNaturalEarth1().fitExtent(
  [
    [PAD, PAD],
    [W - PAD, H - PAD],
  ],
  landGeo,
);
const path = geoPath(projection);
const d = path(landGeo);

const source = JSON.parse(readFileSync("data/events_map.source.json", "utf8"));
const events = source.events.map((e) => {
  const [x, y] = projection([e.lng, e.lat]);
  return { ...e, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
});
const countries = source.countries.map((c) => {
  const [x, y] = projection([c.lng, c.lat]);
  return { ...c, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
});

mkdirSync("public/media/map", { recursive: true });
mkdirSync("public/data", { recursive: true });

// Fill and stroke use currentColor so the chapter can recolor it for ink or paper.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
<path d="${d}" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.28" stroke-width="0.8" stroke-linejoin="round"/>
</svg>
`;
writeFileSync("public/media/map/world-land.svg", svg);
writeFileSync(
  "public/data/events_map.json",
  JSON.stringify({ viewBox: [0, 0, W, H], projection: "naturalEarth1", updated: source.updated, events, countries }, null, 2) + "\n",
);
console.log(`world-land.svg: ${W}x${H}, ${(svg.length / 1024).toFixed(0)} KB, ${events.length} events, ${countries.length} countries`);
