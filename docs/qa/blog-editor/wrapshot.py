"""A realistic wrapped layout, in the writer and in the preview, for a look.

Usage: python wrapshot.py   (dev server on BASE, default http://localhost:4201)
"""
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:4201")
HERE = Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
TEXT = [
    "We spent a season on one controller, and most of what we learned came from the laps that went wrong.",
    "The first version followed the centre line and nothing else. It was slow, but it finished, and a car that finishes gives you data. From those laps we fitted the tyre model, and the tyre model told us how late we could brake into the hairpin without the rear stepping out on the exit.",
    "The second version planned a racing line offline and tracked it with pure pursuit. The lookahead was the whole game: too short and the car weaved down the straight, too long and it cut the inside of every corner. We ended up scheduling it on speed, and that one change took a second off the lap.",
    "On race day the track was not the track we had mapped. A barrier had moved overnight and the localisation drifted in the long corridor, so we remapped between heats and ran the last qualifying lap on a map that was eleven minutes old. It held.",
    "What we would do differently: log everything from the first day, keep one person on the map and nothing else, and test the stop button before the car is on the track.",
]


def place(page, mark):
    page.evaluate(
        """(mark) => { const e = document.querySelector('#post-text').editor; let at = -1;
                      e.state.doc.forEach((n, pos) => { if (n.textContent.startsWith(mark)) at = pos + 1; });
                      e.chain().focus().setTextSelection(at).run(); }""",
        mark,
    )


with sync_playwright() as p:
    b = p.chromium.launch(channel="chromium")
    page = b.new_page(viewport={"width": 1440, "height": 1100})
    page.goto(f"{BASE}/news/write", wait_until="networkidle")
    page.wait_for_selector("#post-text")
    page.fill("#post-headline", "One controller, one season")
    page.fill("#post-author", "Ada Tester")
    page.locator("#post-text").click()
    for i, para in enumerate(TEXT):
        if i == 1:
            page.get_by_role("button", name="Heading", exact=True).click()
            page.keyboard.type("What the slow laps taught us")
            page.keyboard.press("Enter")
        page.keyboard.insert_text(para)
        page.keyboard.press("Enter")
    place(page, "The first version")
    page.set_input_files("input[type=file][multiple]", [str(HERE / "landscape.jpg")])
    page.wait_for_function("document.querySelectorAll('.rr-figure img').length >= 1")
    place(page, "On race day")
    page.set_input_files("input[type=file][multiple]", [str(HERE / "portrait.png")])
    page.wait_for_function("document.querySelectorAll('.rr-figure img').length >= 2")
    page.wait_for_timeout(500)
    page.locator('.rr-figure input[aria-label="Caption"]').first.fill("The car on the back straight.")
    page.locator("#post-text > .rr-media").first.locator("img").click()
    page.locator("#post-text h2").scroll_into_view_if_needed()
    page.mouse.wheel(0, -260)
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / "wrap-write-1440.png"))
    page.get_by_role("button", name="Preview", exact=True).click()
    page.wait_for_selector("article h1")
    page.locator("article h2").first.scroll_into_view_if_needed()
    page.mouse.wheel(0, -260)
    page.wait_for_timeout(600)
    page.screenshot(path=str(OUT / "wrap-preview-1440.png"))
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(500)
    page.locator("article h2").first.scroll_into_view_if_needed()
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / "wrap-preview-390.png"))
    b.close()
