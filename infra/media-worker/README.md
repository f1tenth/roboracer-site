# roboracer-media worker

Serves large media (landing hero clips) from the Cloudflare R2 bucket
`roboracer-media` at `https://roboracer-media.<account>.workers.dev/<key>`.

One-time setup (Cedric's Cloudflare account):

```
cd infra/media-worker
npx wrangler login                      # approve in the browser
npx wrangler r2 bucket create roboracer-media
npx wrangler deploy                     # prints the workers.dev URL
```

Upload a file (keys mirror the site path without the leading slash):

```
npx wrangler r2 object put roboracer-media/media/hero/hero-race-01-1920.mp4 \
  --file ../../public/media/hero/hero-race-01-1920.mp4 --content-type video/mp4
```

Files are immutable by name: a new cut gets a new file name. The site keeps
`src/lib/media.ts` (`MEDIA_BASE`) as the single place that knows the host.
