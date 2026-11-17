"""Draw the four test pictures walk.py and walk2.py drop into the writer.

Usage: python make_pictures.py   (writes next to this file; needs Pillow)
"""
import random
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).parent
random.seed(4)


def make(name, w, h, top, bottom):
    im = Image.new("RGB", (w, h))
    px = im.load()
    for y in range(h):
        t = y / h
        row = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            px[x, y] = row
    d = ImageDraw.Draw(im)
    for _ in range(40):
        x, y = random.randint(0, w), random.randint(0, h)
        r = random.randint(w // 40, w // 10)
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 255, 255), width=max(2, w // 400))
    d.rectangle([w // 10, h // 2 - h // 12, w - w // 10, h // 2 + h // 12], fill=(7, 7, 13))
    im.save(HERE / name, quality=90)


make("landscape.jpg", 3000, 2000, (124, 58, 237), (0, 209, 218))
make("portrait.png", 1200, 1600, (251, 0, 255), (109, 40, 217))
make("portrait2.jpg", 1080, 1920, (14, 15, 26), (124, 58, 237))
make("cover.jpg", 2400, 1800, (0, 209, 218), (109, 40, 217))
