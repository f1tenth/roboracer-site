// GET /<key> -> the object from R2 with Range support (video seeking),
// long-lived caching (files are content-addressed by name: a new cut gets a
// new name), CORS open for GET so the files can be fetched from any origin.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!key) return new Response("roboracer.ai media", { status: 200 });

    const object = await env.MEDIA.get(key, {
      range: request.headers,
      onlyIf: request.headers,
    });
    if (object === null) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("accept-ranges", "bytes");
    headers.set("cache-control", CACHE_CONTROL);
    headers.set("access-control-allow-origin", "*");
    if (!headers.has("content-type")) headers.set("content-type", guessType(key));

    if (object.range) {
      const { offset = 0, length = object.size - offset } = object.range;
      headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
      headers.set("content-length", String(length));
      return new Response(request.method === "HEAD" ? null : object.body, { status: 206, headers });
    }
    headers.set("content-length", String(object.size));
    // onlyIf matched: R2 returns a body-less object.
    if (!("body" in object) || object.body === null) return new Response(null, { status: 304, headers });
    return new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
  },
};

function guessType(key) {
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}
