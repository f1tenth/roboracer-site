#!/usr/bin/env python3
"""Still photos -> budgeted WebP for roboracer.ai (the `media.sh photo` command).

  python3 scripts/photo.py shot.JPG -o public/media/race/           # 1200px, <= 220 KB
  python3 scripts/photo.py drive/day2/ -o public/media/race/timeline/ --width 800 --budget 150k
  python3 scripts/photo.py public/about/image-2.JPG                 # -> public/about/image-2.webp
  python3 scripts/photo.py --report public/media/race --budget 220k

Run with /home/cedric/.venvs/ml/bin/python3 (Pillow lives there). cwebp is not
installed on this machine, so the WebP encoder is Pillow's.

The file is written only once it fits its budget: an image that will not fit at
the lowest rung of the quality ladder is an error, never a quietly oversized
asset that nobody notices until the page is slow.
"""
from __future__ import annotations

import argparse
import io
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

DEFAULT_WIDTH = 1200
DEFAULT_BUDGET = 220 * 1024  # 150 KB for the timeline tiles (--budget 150k)
QUALITY_START = 82
QUALITY_FLOOR = 34  # below this WebP smears faces and jersey numbers; fail instead
GIT_RULE = 1572864  # CLAUDE.md rule 3: no binary over 1.5 MB enters git
SRC_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".gif"}


def parse_budget(s: str) -> int:
    """Bytes, or 220k / 1.5m the way the budgets are written down in the skill."""
    t = str(s).strip().lower().rstrip("b")
    mult = 1
    if t.endswith("k"):
        mult, t = 1024, t[:-1]
    elif t.endswith("m"):
        mult, t = 1024 * 1024, t[:-1]
    try:
        n = int(float(t) * mult)
    except ValueError:
        raise SystemExit(f"--budget wants bytes or 220k / 1.5m, not {s!r}")
    if n <= 0:
        raise SystemExit("--budget must be positive")
    return n


def ladder(start: int) -> list[int]:
    """82, 74, 66, ... 34 - the same rungs paper_thumbs.py steps down."""
    return [q for q in range(min(start, 100), QUALITY_FLOOR - 1, -8)] or [QUALITY_FLOOR]


def inputs(paths: list[str], recursive: bool) -> list[Path]:
    out: list[Path] = []
    for raw in paths:
        p = Path(raw)
        if p.is_dir():
            found = sorted(q for q in (p.rglob("*") if recursive else p.iterdir())
                           if q.is_file() and q.suffix.lower() in SRC_EXT)
            if not found:
                print(f"  {p}: no images{'' if recursive else ' (try --recursive)'}")
            out += found
        elif p.exists():
            out.append(p)
        else:
            raise SystemExit(f"no such file or directory: {p}")
    return out


def prepare(src: Path, width: int) -> tuple[Image.Image, str]:
    """Open, straighten, downscale. Nothing may come before exif_transpose: DSLR and
    phone stills store the rotation in a tag, every later resize reads raw pixel
    order, and a sideways photo on the race timeline is the bug this prevents."""
    img = Image.open(src)
    img.load()
    img = ImageOps.exif_transpose(img)
    note = ""
    if img.width <= width:
        note = f"native {img.width}px, source narrower than {width}px, not upscaled"
    else:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    # Keep alpha where the source has it (PNG logos and screenshots); WebP carries it.
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    elif img.mode != "RGB":
        img = img.convert("RGB")
    return img, note


def fit_encode(img: Image.Image, budget: int, start: int) -> tuple[bytes, int] | None:
    """Step the quality down until the bytes fit, like fit_encode in media.sh.
    Returns None rather than a too-big buffer - the caller must not write it."""
    for q in ladder(start):
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=q, method=6)
        data = buf.getvalue()
        if len(data) <= budget:
            return data, q
    return None


def write_atomic(out: Path, data: bytes) -> None:
    # The dev server watches this tree; a truncated file gets cached as an empty module.
    tmp = out.with_name(out.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, out)


def out_path(src: Path, dest: str, many: bool, suffix: str) -> Path:
    name = src.stem + suffix + ".webp"
    if not dest:
        # No -o: sit next to the source. This is the re-encode-in-place-ish path,
        # e.g. public/about/image-2.JPG -> public/about/image-2.webp.
        return src.with_name(name)
    d = Path(dest)
    if d.is_dir() or many or dest.endswith("/"):
        d.mkdir(parents=True, exist_ok=True)
        return d / name
    d.parent.mkdir(parents=True, exist_ok=True)
    return d


def cmd_encode(args: argparse.Namespace) -> int:
    budget = parse_budget(args.budget)
    srcs = inputs(args.inputs, args.recursive)
    if not srcs:
        raise SystemExit("nothing to encode")
    many = len(srcs) > 1
    seen: dict[Path, Path] = {}
    failed = 0
    for src in srcs:
        out = out_path(src, args.out, many, args.suffix)
        if out in seen:
            print(f"  ERROR: {src} and {seen[out]} both want {out}; rename one", file=sys.stderr)
            failed += 1
            continue
        seen[out] = src
        if out.resolve() == src.resolve():
            print(f"  ERROR: {src} would overwrite itself; pass -o or --suffix", file=sys.stderr)
            failed += 1
            continue
        img, note = prepare(src, args.width)
        fit = fit_encode(img, budget, args.quality)
        if fit is None:
            print(f"  ERROR: {src} -> {out}: will not fit {budget} bytes even at q{QUALITY_FLOOR}; "
                  f"crop it, drop --width below {args.width}, or raise --budget", file=sys.stderr)
            failed += 1
            continue
        data, q = fit
        write_atomic(out, data)
        tail = f" [{note}]" if note else ""
        print(f"  {out}: {len(data)} bytes (q{q}, {img.width}x{img.height}) OK{tail}")
    if failed:
        print(f"{failed} of {len(srcs)} image(s) failed; see the errors above", file=sys.stderr)
    return 1 if failed else 0


def cmd_report(directory: str, budget: int) -> int:
    d = Path(directory)
    if not d.is_dir():
        raise SystemExit(f"--report wants a directory, not {d}")
    total = over = 0
    for f in sorted(p for p in d.rglob("*") if p.is_file()):
        s = f.stat().st_size
        total += s
        dims = ""
        try:
            with Image.open(f) as im:
                dims = f"  {im.width}x{im.height}"
        except Exception:  # noqa: BLE001 - not an image; still worth its size line
            pass
        flag = ""
        if s > budget:
            flag = f"  <-- OVER the {budget} byte budget"
            over += 1
        elif s > GIT_RULE:
            flag = "  <-- OVER 1.5 MB git rule"
            over += 1
        print(f"  {s:10d}  {f}{dims}{flag}")
    print(f"total: {total} bytes; files over the {budget} byte budget: {over}")
    return 1 if over else 0


def main() -> int:
    ap = argparse.ArgumentParser(
        prog="media.sh photo",
        description="Downscale stills to budgeted WebP (EXIF orientation applied first).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="examples:\n"
               "  media.sh photo shot.JPG -o public/media/race/\n"
               "  media.sh photo drive/day2/ -o public/media/race/timeline/ --width 800 --budget 150k\n"
               "  media.sh photo public/about/image-2.JPG        # -> public/about/image-2.webp\n"
               "  media.sh photo --report public/media/race\n",
    )
    ap.add_argument("inputs", nargs="*", help="image files, or a directory of images")
    ap.add_argument("-o", "--out", default="", help="output file, or directory for a batch "
                                                    "(default: next to each source, .webp)")
    ap.add_argument("--width", type=int, default=DEFAULT_WIDTH,
                    help=f"target width in px (default {DEFAULT_WIDTH}; 800 for timeline tiles); "
                         "a narrower source keeps its native width")
    ap.add_argument("--budget", default=f"{DEFAULT_BUDGET // 1024}k",
                    help="max bytes per file, e.g. 150k (default 220k)")
    ap.add_argument("--quality", type=int, default=QUALITY_START,
                    help=f"first rung of the quality ladder (default {QUALITY_START}, floor {QUALITY_FLOOR})")
    ap.add_argument("--suffix", default="", help="appended to the output stem, e.g. --suffix -800")
    ap.add_argument("--recursive", action="store_true", help="walk sub-directories of a directory input")
    ap.add_argument("--report", metavar="DIR", default="",
                    help="list the sizes under DIR and flag anything over budget")
    args = ap.parse_args()
    if args.report:
        if args.inputs:
            raise SystemExit("--report takes no input files")
        return cmd_report(args.report, parse_budget(args.budget))
    if not args.inputs:
        ap.print_help()
        return 1
    if args.width < 1:
        raise SystemExit("--width must be positive")
    return cmd_encode(args)


if __name__ == "__main__":
    sys.exit(main())
