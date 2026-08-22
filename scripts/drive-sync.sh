#!/usr/bin/env bash
# Mirror the media folders of the "RoboRacer Events" shared drive into _harvest/drive
# (git-ignored) with rclone, so media-curator can read them locally.
#
# One-time setup (Cedric, interactive, about two minutes):
#   brew install rclone        # or: sudo apt install rclone  /  curl https://rclone.org/install.sh | sudo bash
#   rclone config              # n) new remote -> name: rr -> storage: drive -> scope: drive.readonly
#                              #   -> "Configure this as a Shared Drive (Team Drive)?" y -> pick "RoboRacer Events"
#                              #   (shared drive id 0AGa1gzpAFb_kUk9PVA if it asks)
#   rclone lsd rr:             # should list 2026 ICRA, 2026 IROS, Logo, Posters 2026, ...
#
# Then: scripts/drive-sync.sh [all|icra|iv|brand]     default: all
# Re-running only transfers new or changed files. Videos are large (Teams Intro is ~2.7 GB);
# nothing here is committed, the curator promotes processed files into public/media.
set -euo pipefail
REMOTE=${RR_REMOTE:-rr}
OUT=_harvest/drive
what=${1:-all}
mkdir -p "$OUT"

sync() { # sync <remote path> <local subdir> [extra rclone args...]
  local src=$1 dst=$2; shift 2
  echo "== $src -> $OUT/$dst"
  rclone copy "$REMOTE:$src" "$OUT/$dst" --progress --transfers 4 --checkers 8 \
    --drive-acknowledge-abuse --create-empty-src-dirs "$@"
}

case $what in
  all|icra)
    sync "2026 ICRA/Media" "2026-icra/Media" \
      --include "*.{JPG,jpg,JPEG,jpeg,PNG,png,HEIC,heic,WEBP,webp,MOV,mov,MP4,mp4}"
    ;;&
  all|iv)
    sync "2026 IEEE IV" "2026-iv" \
      --include "*.{JPG,jpg,JPEG,jpeg,PNG,png,HEIC,heic,WEBP,webp,MOV,mov,MP4,mp4}"
    ;;&
  all|brand)
    sync "Logo" "logo"
    sync "Posters 2026" "posters-2026"
    sync "Old Banners, Flyers, Shirts, Stickers" "old-banners"
    sync "2026 ICRA/Logos" "2026-icra/Logos" || true
    ;;&
esac

echo; echo "inventory:"
find "$OUT" -type f | wc -l | sed 's/^/  files: /'
du -sh "$OUT" | sed 's/^/  size: /'
echo "RW2 raws are skipped by the include filters on purpose (the JPG twins are enough)."
