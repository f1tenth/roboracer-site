#!/usr/bin/env python3
"""Partner ribbon logos: resting-state tint + colour hover asset (landing v5, section 4).

Cedric, 2026-08-22: the ribbon logos are too black and white; give them a touch of
the accent colours, a mix of cyan and magenta, minimal, only a slight touch. This is
that recipe, chosen from docs/design/partner-tint-preview.png. Run it once; commit
the outputs; the ribbon swaps the tinted file in at rest and crossfades to the colour
file on hover and focus.

Recipe (per pixel, luminance preserved):
  1. luminance Y of the pixel (Rec. 709 on linear sRGB) -> OKLab L = cbrt(Y)
  2. hue h(x) sweeps the logo's own width: 195 deg (cyan, #00d1da) at the left edge
     to 330 deg (magenta, #fc00ff) at the right edge, increasing through blue
  3. chroma C = STRENGTH * clip(L / 0.2) * clip((1 - L) / 0.25): a flat cast across
     dark marks and mid greys, ramping to zero at black and at white (white
     backgrounds stay white; a flat grey block gets no more tint than thin text)
  4. OKLCH(L, C, h) -> sRGB, clipped; alpha untouched
STRENGTH 0.04 is the approved value (0.03 reads as grey, 0.06 reads as coloured).

Outputs (WebP, 2x the ribbon's 120 px cell height, width capped at 2x 336 px):
  public/partners/tint/<stem>.webp   resting state
  public/partners/color/<stem>.webp  hover / focus state (the original, downsized)
and the two paths written back into each item of public/data/partners.json as
`image_rest` and `image_hover` (the original `image` field is kept for /about).
Usage: python3 scripts/partner-tint.py [--strength 0.04] [--preview out.png]
Needs Pillow with WebP support and numpy.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PARTNERS = ROOT / "public" / "data" / "partners.json"
SRC_DIR = ROOT / "public"
OUT_TINT = ROOT / "public" / "partners" / "tint"
OUT_COLOR = ROOT / "public" / "partners" / "color"
CELL_H = 120 * 2  # ribbon logo height at 1.5x (80 -> 120 px), 2x for HiDPI
CELL_W = 336 * 2  # ribbon logo max width at 1.5x (224 -> 336 px), 2x
HUE_LEFT, HUE_RIGHT = 195.0, 330.0  # OKLCH hue of #00d1da and #fc00ff, short way round
STRENGTH = 0.04
PAPER = (251, 251, 253)  # --color-paper-50, preview background only


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def oklab_to_linear_rgb(L: np.ndarray, a: np.ndarray, b: np.ndarray) -> np.ndarray:
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return np.stack([r, g, bb], axis=-1)


def tint(img: Image.Image, strength: float = STRENGTH) -> Image.Image:
    """Grey the logo and give it the luminance-preserving cyan -> magenta cast."""
    rgba = np.asarray(img.convert("RGBA"), dtype=np.float64) / 255.0
    rgb, alpha = rgba[..., :3], rgba[..., 3:4]
    lin = srgb_to_linear(rgb)
    Y = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
    L = np.cbrt(np.clip(Y, 0.0, 1.0))
    h, w = L.shape
    x = np.linspace(0.0, 1.0, w)[None, :].repeat(h, axis=0)
    hue = np.deg2rad(HUE_LEFT + (HUE_RIGHT - HUE_LEFT) * x)
    C = strength * np.clip(L / 0.2, 0.0, 1.0) * np.clip((1.0 - L) / 0.25, 0.0, 1.0)
    a, b = C * np.cos(hue), C * np.sin(hue)
    out = linear_to_srgb(oklab_to_linear_rgb(L, a, b))
    out = np.concatenate([out, alpha], axis=-1)
    return Image.fromarray((np.clip(out, 0, 1) * 255.0 + 0.5).astype(np.uint8), "RGBA")


def fit(img: Image.Image) -> Image.Image:
    """Downsize to the ribbon cell (never upscale), keep alpha."""
    img = img.convert("RGBA")
    scale = min(CELL_H / img.height, CELL_W / img.width, 1.0)
    if scale < 1.0:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    return img


def load_partners() -> list[dict]:
    data = json.loads(PARTNERS.read_text())
    return data["items"] if isinstance(data, dict) else data


def build(strength: float) -> None:
    OUT_TINT.mkdir(parents=True, exist_ok=True)
    OUT_COLOR.mkdir(parents=True, exist_ok=True)
    data = json.loads(PARTNERS.read_text())
    items = data["items"] if isinstance(data, dict) else data
    for p in items:
        src = SRC_DIR / p["image"]
        stem = src.stem.lower()
        base = fit(Image.open(src))
        base.save(OUT_COLOR / f"{stem}.webp", "WEBP", quality=88, method=6)
        tint(base, strength).save(OUT_TINT / f"{stem}.webp", "WEBP", quality=88, method=6)
        p["image_rest"] = f"partners/tint/{stem}.webp"
        p["image_hover"] = f"partners/color/{stem}.webp"
        print(f"{p['name']}: {p['image_rest']}")
    PARTNERS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def preview(path: Path, strengths: tuple[float, ...] = (0.0, 0.03, 0.04, 0.06), names: int = 8) -> None:
    """Contact sheet on paper: one row per strength, logos at the 120 px cell height."""
    from PIL import ImageDraw

    partners = load_partners()[:names]
    logos = [fit(Image.open(SRC_DIR / p["image"])) for p in partners]
    cell_h, pad, gap, label_w = 120, 24, 40, 180
    row_h = cell_h + pad
    widths = [round(l.width * cell_h / l.height) for l in logos]
    sheet_w = label_w + sum(widths) + gap * (len(logos) - 1) + pad * 2
    sheet_h = row_h * len(strengths) + pad
    sheet = Image.new("RGB", (sheet_w, sheet_h), PAPER)
    draw = ImageDraw.Draw(sheet)
    for r, s in enumerate(strengths):
        y = pad + r * row_h
        label = "grayscale (now)" if s == 0 else f"strength {s:.3g}"
        draw.text((pad, y + cell_h // 2 - 6), label, fill=(98, 103, 127))
        x = label_w + pad
        for logo, w in zip(logos, widths):
            small = logo.resize((w, cell_h), Image.LANCZOS)
            out = tint(small, s) if s > 0 else tint(small, 0.0)
            sheet.paste(out, (x, y), out)
            x += w + gap
    sheet.save(path)
    print(f"preview: {path} ({sheet_w}x{sheet_h})")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--strength", type=float, default=STRENGTH)
    ap.add_argument("--preview", type=Path, help="write a contact sheet instead of the assets")
    args = ap.parse_args()
    if args.preview:
        preview(args.preview)
    else:
        build(args.strength)
