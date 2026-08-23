#!/usr/bin/env python3
"""Crop the dead margin off the partner ribbon logos.

Cedric, 2026-08-23: some logos take far more lateral space in the ribbon than
their mark deserves (UNC was the example). The cause is baked-in padding in the
source file, not the layout: the ribbon caps a logo's WIDTH, so a mark sitting
inside a wide transparent or white canvas is scaled down to fit a box it never
fills, and it eats the row's horizontal budget for nothing.

This trims the rendered assets (public/partners/{tint,color}) to the bounding
box of their actual ink, then re-pads by a small, uniform margin so nothing
touches its neighbour. The originals are left alone: they are the source
partner-tint.py re-derives from, and the tint recipe sweeps hue across the
logo's own width, so it must keep seeing the file it was designed against.

Only uniform borders are removed. A logo whose canvas is a deliberate coloured
block (Binghamton's green panel) has no uniform margin to find beyond its own
edge, so it survives untouched.

Usage: partner-trim.py [--dry-run] [--pad 0.02] [--dir public/partners]
"""
import argparse, pathlib, sys
from PIL import Image, ImageChops

# Below this the crop is not worth a rewrite; above it something is wrong with
# the detection and we would be cropping the mark itself.
MIN_GAIN = 0.02
MAX_CROP = 0.80


def ink_box(im: Image.Image):
    """Bounding box of everything that is not the uniform border colour."""
    if im.mode in ("RGBA", "LA") and im.getchannel("A").getextrema()[0] < 250:
        return im.getchannel("A").getbbox()
    rgb = im.convert("RGB")
    w, h = rgb.size
    corners = [rgb.getpixel(p) for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    # Not a uniform frame: leave it alone rather than guess.
    if max(max(c) - min(c) for c in zip(*corners)) > 12:
        return None
    bg = Image.new("RGB", rgb.size, corners[0])
    # A small offset before the threshold keeps JPEG ringing from counting as ink.
    return ImageChops.difference(rgb, bg).convert("L").point(lambda v: 255 if v > 18 else 0).getbbox()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="public/partners")
    ap.add_argument("--pad", type=float, default=0.02)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    changed = skipped = 0
    for sub in ("tint", "color"):
        for f in sorted(pathlib.Path(a.dir, sub).glob("*.webp")):
            im = Image.open(f)
            box = ink_box(im)
            if not box:
                skipped += 1
                continue
            w, h = im.size
            bw, bh = box[2] - box[0], box[3] - box[1]
            gain = 1 - (bw * bh) / (w * h)
            if gain < MIN_GAIN or gain > MAX_CROP:
                skipped += 1
                continue
            pad = int(round(max(bw, bh) * a.pad))
            out = im.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                           min(w, box[2] + pad), min(h, box[3] + pad)))
            print(f"  {f.name}: {w}x{h} -> {out.size[0]}x{out.size[1]} ({gain:.0%} margin)")
            if not a.dry_run:
                tmp = f.with_suffix(".webp.tmp")
                out.save(tmp, "WEBP", quality=88, method=6)
                tmp.replace(f)
            changed += 1
    print(f"{'would trim' if a.dry_run else 'trimmed'} {changed}, left {skipped} alone")
    return 0


if __name__ == "__main__":
    sys.exit(main())
