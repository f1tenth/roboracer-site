// Static hosts have no server-side router, so a request for /race is a request
// for a file that does not exist. Both of ours answer it with 404.html.
//
// That file used to be a meta-refresh to "/", which meant every deep link and
// every refresh on a route dumped the reader on the home page - on the live
// site, not just the preview. Copying the built index.html instead boots the
// SPA with the real hashed entry, and the router renders the route that was
// asked for.
//
// It has to be generated rather than kept in public/, because the entry
// filename carries a content hash that does not exist until after the build.
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const out = process.env.BUILD_OUT_DIR || "dist";
const index = join(out, "index.html");
if (!existsSync(index)) {
  console.error(`spa-fallback: ${index} not found; run the build first`);
  process.exit(1);
}
copyFileSync(index, join(out, "404.html"));
console.log(`spa-fallback: ${out}/404.html written from index.html`);
