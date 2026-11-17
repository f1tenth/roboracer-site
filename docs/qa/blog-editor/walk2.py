"""Second pass on the post writer: the interactions walk.py leaves out, and axe.

Usage: python walk2.py   (dev server on http://localhost:4201, Chromium)
"""
import base64
import json
import sys
from pathlib import Path

from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import sync_playwright

import os
BASE = os.environ.get("BASE", "http://localhost:4201")
HERE = Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
results = []
axe_report = {}


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""), flush=True)


def scan(page, label):
    res = Axe().run(page).response
    bad = [v for v in res["violations"] if v["impact"] in ("serious", "critical")]
    axe_report[label] = [
        {"id": v["id"], "impact": v["impact"], "help": v["help"], "nodes": [n["target"] for n in v["nodes"]][:6]} for v in res["violations"]
    ]
    check(f"axe {label}: no serious or critical", len(bad) == 0, "; ".join(f'{v["id"]} x{len(v["nodes"])}' for v in res["violations"]))


def paste(page, html=None, text=None, files=None):
    page.evaluate(
        """([html, text, files]) => {
            const el = document.querySelector('#post-text');
            el.focus();
            const dt = new DataTransfer();
            if (html) dt.setData('text/html', html);
            if (text) dt.setData('text/plain', text);
            for (const [name, type, b64] of files || []) {
                dt.items.add(new File([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], name, { type }));
            }
            el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        }""",
        [html, text, files],
    )


def b64(name):
    return base64.b64encode((HERE / name).read_bytes()).decode()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chromium")
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))

        # ---- the published post still renders after PostArticle was split out
        page.goto(f"{BASE}/news/aurorus", wait_until="networkidle")
        page.wait_for_selector("article h1")
        check("/news/aurorus renders", page.locator("article h1").count() == 1 and page.locator("article figure").count() > 3)

        page.goto(f"{BASE}/news", wait_until="networkidle")
        page.wait_for_timeout(1500)
        scan(page, "/news")

        # ---- empty writer
        page.goto(f"{BASE}/news/write", wait_until="networkidle")
        page.wait_for_selector("#post-text")
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "empty-1440.png"))
        check("placeholder shown in an empty text", page.locator("#post-text p.is-editor-empty").count() == 1)
        scan(page, "/news/write empty")

        ed = page.locator("#post-text")
        ed.click()
        page.keyboard.type("Read the paper before the race.")

        # ---- link form
        page.keyboard.press("Home")
        for _ in range(4):
            page.keyboard.press("Shift+ArrowRight")
        page.get_by_role("button", name="Link", exact=True).click()
        page.fill("#writer-panel-input", "javascript:alert(1)")
        page.get_by_role("button", name="Apply").click()
        check("link form refuses a script address", page.locator("#writer-panel-error").count() == 1 and ed.locator("a").count() == 0)
        page.fill("#writer-panel-input", "example.org/paper")
        page.get_by_role("button", name="Apply").click()
        check("link form adds https to a bare address", ed.locator('a[href="https://example.org/paper"]').inner_text() == "Read")

        # ---- a picture carried inside pasted HTML is fetched and re-encoded
        data_uri = "data:image/png;base64," + b64("portrait.png")
        page.keyboard.press("Control+End")
        page.keyboard.press("Enter")
        paste(page, html=f'<p>Before the picture.</p><p><img src="{data_uri}" alt="A pasted portrait"></p><p>After the picture.</p>')
        page.wait_for_selector(".rr-figure img", timeout=15000)
        src = page.locator(".rr-figure img").first.get_attribute("src")
        check("pasted picture is adopted as the draft's own file", src.startswith("blob:"), src[:30])
        check("pasted picture keeps its alt text", page.locator('.rr-figure input[aria-label^="Describe the picture"]').first.input_value() == "A pasted portrait")

        # ---- one that cannot be fetched is dropped, with a line for the writer
        page.keyboard.press("Control+End")
        paste(page, html='<p>Text around.</p><p><img src="https://example.invalid/nope.png" alt="x"></p>')
        page.wait_for_function("document.querySelector('p[role=status].fixed') !== null", timeout=20000)
        note = page.locator("p[role=status].fixed").inner_text()
        check("unreachable pasted picture is removed with a notice", "could not be copied" in note and page.locator(".rr-figure").count() == 1, note)

        # ---- a copied picture (a file on the clipboard)
        page.keyboard.press("Control+End")
        paste(page, files=[["shot.jpg", "image/jpeg", b64("landscape.jpg")]])
        page.wait_for_function("document.querySelectorAll('.rr-figure img').length >= 2", timeout=20000)
        check("picture pasted from the clipboard", True)

        # ---- resize with the corner handle
        wide = page.locator('.rr-media[data-size="column"]').first
        wide.locator("img").scroll_into_view_if_needed()
        wide.locator("img").click()
        page.wait_for_timeout(200)
        hb = wide.locator(".rr-resize-handle").bounding_box()
        page.mouse.move(hb["x"] + 4, hb["y"] + 4)
        page.mouse.down()
        page.mouse.move(hb["x"] - 220, hb["y"] - 80, steps=10)
        page.mouse.up()
        page.wait_for_timeout(200)
        check("dragging the corner in makes it narrow", page.locator('.rr-media[data-size="column"]').count() == 0)
        page.screenshot(path=str(OUT / "after-resize-1440.png"))

        # ---- keyboard reaches a picture's own controls, and they show
        cap = page.locator('.rr-figure input[aria-label="Caption"]').first
        cap.focus()
        page.wait_for_timeout(350)
        opacity = page.evaluate("getComputedStyle(document.querySelector('.rr-figure:focus-within .rr-media-bar')).opacity")
        check("a picture's bar shows when the keyboard is inside it", opacity == "1", opacity)
        page.keyboard.press("Shift+Tab")
        focused = page.evaluate("document.activeElement.getAttribute('aria-label')")
        check("Shift+Tab from the caption lands on the bar's last button", focused == "Remove the picture", str(focused))

        # ---- things that are not pictures
        page.evaluate(
            """() => {
                const dt = new DataTransfer();
                dt.items.add(new File(['%PDF-1.4'], 'paper.pdf', { type: 'application/pdf' }));
                const el = document.querySelector('#post-text');
                const r = el.getBoundingClientRect();
                el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.left + 20, clientY: r.top + 20 }));
            }"""
        )
        page.wait_for_timeout(300)
        check("a dropped PDF is refused in words", "Only pictures" in page.locator("p[role=status].fixed").inner_text())
        svg = HERE / "evil.svg"
        svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" onload="window.__pwned=1"><script>window.__pwned=1</script></svg>')
        page.set_input_files('input[type=file][multiple]', [str(svg)])
        page.wait_for_timeout(800)
        note = page.locator("p[role=status].fixed").inner_text()
        check("an SVG is refused in words, never run", page.evaluate("window.__pwned") is None and ("SVG" in note or "JPEG" in note), note)

        page.fill("#post-headline", "A second pass")
        page.fill("#post-author", "Ada Tester")
        page.wait_for_timeout(300)
        scan(page, "/news/write with a draft")

        # ---- send dialog, both states
        page.get_by_role("button", name="Send post").click()
        page.wait_for_selector("dialog[open]")
        scan(page, "send dialog (things missing)")
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        check("Escape closes the dialog and returns to the page", page.locator("dialog[open]").count() == 0)
        for i in range(page.locator('.rr-figure input[aria-label^="Describe the picture"]').count()):
            f = page.locator('.rr-figure input[aria-label^="Describe the picture"]').nth(i)
            if not f.input_value():
                f.fill(f"Test picture {i + 1}")
        page.keyboard.press("Tab")
        page.wait_for_timeout(700)
        page.get_by_role("button", name="Send post").click()
        page.wait_for_selector("dialog[open]")
        check("dialog is ready once the gaps are filled", page.locator("dialog[open] h2").inner_text() == "Ready to send", page.locator("dialog[open] h2").inner_text())
        scan(page, "send dialog (ready)")
        page.screenshot(path=str(OUT / "send-ready-nouser-1440.png"))
        page.keyboard.press("Escape")

        # ---- preview
        page.get_by_role("button", name="Preview", exact=True).click()
        page.wait_for_selector("article h1")
        page.wait_for_timeout(400)
        scan(page, "/news/write preview")
        page.get_by_role("button", name="Write", exact=True).click()

        # ---- start over
        page.get_by_role("button", name="Start over").click()
        page.get_by_role("button", name="Delete it").click()
        page.wait_for_timeout(500)
        check("start over empties the page", page.input_value("#post-headline") == "" and page.locator(".rr-figure").count() == 0 and ed.inner_text().strip() == "")
        page.reload(wait_until="networkidle")
        page.wait_for_selector("#post-text")
        page.wait_for_timeout(600)
        check("and it stays empty after a reload", page.input_value("#post-headline") == "" and page.locator(".rr-figure").count() == 0)

        # The unreachable picture above is this test's own doing.
        real = [e for e in errors if "ERR_NAME_NOT_RESOLVED" not in e]
        check("no console errors", len(real) == 0, " || ".join(real[:4]))
        ctx.close()

        # ---- reduced motion: the page is whole and quiet
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        page = ctx.new_page()
        errors2 = []
        page.on("pageerror", lambda e: errors2.append(str(e)))
        page.goto(f"{BASE}/news/write", wait_until="networkidle")
        page.wait_for_selector("#post-text")
        # The design system keeps colour changes under reduced motion; what
        # must stop is movement: transforms, opacity fades, keyframes.
        moving = page.evaluate(
            """() => [...document.querySelectorAll('.rr-write *')].filter(e => {
                const s = getComputedStyle(e);
                if (s.animationName !== 'none') return true;
                if (parseFloat(s.transitionDuration) === 0) return false;
                return /all|transform|translate|scale|rotate|opacity|height|width|top|left/.test(s.transitionProperty);
            }).map(e => e.className.toString().slice(0, 70)).slice(0, 8)"""
        )
        check("reduced motion: nothing moves or fades in the writer", len(moving) == 0 and not errors2, json.dumps(moving))
        ctx.close()

        # ---- keyboard only: the page can be driven without a mouse
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
        page = ctx.new_page()
        page.goto(f"{BASE}/news/write", wait_until="networkidle")
        page.wait_for_selector("#post-text")
        wide = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check("phone: no sideways scroll", wide <= 0, str(wide))
        small = page.evaluate(
            """() => [...document.querySelectorAll('.rr-write button, .rr-write a, .rr-write input:not([type=file])')]
                .filter(e => e.offsetParent !== null)
                .map(e => [e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30) || e.id, Math.round(e.getBoundingClientRect().height)])
                .filter(([, h]) => h < 40)"""
        )
        check("phone: controls are at least 40px tall", len(small) == 0, json.dumps(small[:10]))
        scan(page, "/news/write phone")
        browser.close()

    (OUT / "axe.json").write_text(json.dumps(axe_report, indent=1))
    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
