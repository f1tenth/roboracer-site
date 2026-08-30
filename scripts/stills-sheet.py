#!/usr/bin/env python3
"""Tile stills into one labelled contact sheet (docs/plans/hero-cinematic-v1.md section 3).

  scripts/stills-sheet.py <out.jpg> <label>=<image> [<label>=<image> ...] [--cols 2] [--width 480] [--max-kb 400]

Each still is scaled to `--width` px wide (480 by default: a 4-up stays under 400 KB), the label
is burned into its top-left corner, and the JPEG quality steps down until the sheet fits
`--max-kb`. Needs Pillow: run with /home/cedric/.venvs/ml/bin/python3.
"""
from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw, ImageFont


def font(size: int):
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 1
    out = argv[0]
    items: list[tuple[str, str]] = []
    cols, width, max_kb = 2, 480, 400
    i = 1
    while i < len(argv):
        a = argv[i]
        if a == "--cols":
            cols = int(argv[i + 1]); i += 2; continue
        if a == "--width":
            width = int(argv[i + 1]); i += 2; continue
        if a == "--max-kb":
            max_kb = int(argv[i + 1]); i += 2; continue
        label, path = a.split("=", 1)
        items.append((label, path))
        i += 1
    if not items:
        print("no images given", file=sys.stderr)
        return 1

    f = font(22)
    tiles = []
    for label, path in items:
        im = Image.open(path).convert("RGB")
        h = max(1, round(im.height * width / im.width))
        im = im.resize((width, h), Image.LANCZOS)
        d = ImageDraw.Draw(im)
        x0, y0, x1, y1 = d.textbbox((0, 0), label, font=f)
        d.rectangle([6, 6, 6 + (x1 - x0) + 16, 6 + (y1 - y0) + 14], fill=(0, 0, 0))
        d.text((14, 10), label, fill=(255, 255, 255), font=f)
        tiles.append(im)

    gap = 4
    th = max(t.height for t in tiles)
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * width + (cols - 1) * gap, rows * th + (rows - 1) * gap), (18, 18, 18))
    for k, t in enumerate(tiles):
        r, c = divmod(k, cols)
        sheet.paste(t, (c * (width + gap), r * (th + gap)))

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    q = 86
    tmp = out + ".tmp"
    while True:
        sheet.save(tmp, "JPEG", quality=q, optimize=True)
        if os.path.getsize(tmp) <= max_kb * 1024 or q <= 40:
            break
        q -= 5
    os.replace(tmp, out)
    print(f"{out}: {sheet.width}x{sheet.height}, {len(tiles)} stills, q{q}, {os.path.getsize(out) // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
