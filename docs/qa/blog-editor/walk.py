"""Drive the post writer end to end in headless Chromium and report what it sees.

Usage: python walk.py [--shots]   (dev server on http://localhost:4201)
"""
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

import os
BASE = os.environ.get("BASE", "http://localhost:4201")
HERE = Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
SHOTS = "--shots" in sys.argv
ENGINE = next((a.split("=")[1] for a in sys.argv if a.startswith("--browser=")), "chromium")

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""), flush=True)


PASTE_HTML = """
<meta charset='utf-8'><b style="font-weight:normal;" id="docs-internal-guid-1">
<h1 dir="ltr"><span style="font-size:20pt;font-family:Arial;color:#ff0000">How we tuned the controller</span></h1>
<p dir="ltr"><span style="font-size:11pt;font-family:Comic Sans MS;color:#00ff00;background-color:#ffff00">We started from </span><span style="font-weight:700">pure pursuit</span><span> and a </span><a href="https://example.org/paper"><span style="color:#1155cc;text-decoration:underline">short paper</span></a><span>.</span></p>
<h2 dir="ltr"><span>Lookahead</span></h2>
<ul><li dir="ltr"><p><span>Short lookahead oscillates</span></p></li><li dir="ltr"><p><span style="font-style:italic">Long lookahead cuts corners</span></p></li></ul>
<p><script>window.__pwned = 1</script><img src="x" onerror="window.__pwned = 2"><a href="javascript:window.__pwned=3">bad link</a></p>
<iframe src="https://example.org"></iframe>
</b>
"""

MARKDOWN = """## Results

We ran **three** laps:

- lap one: 12.4 s
- lap two: 11.9 s

See [the repo](https://github.com/example/repo) for `code`.
"""


MARKDOWN_AS_HTML = """<h2>Results</h2><p>We ran <strong>three</strong> laps:</p><ul><li>lap one: 12.4 s</li><li>lap two: 11.9 s</li></ul><p>See <a href="https://github.com/example/repo">the repo</a> for <code>code</code>.</p>"""


def paste(page, html=None, text=None):
    """A paste as the page sees it. Chromium accepts a synthetic clipboard
    event; Firefox does not, so there the editor's own paste entry point is
    called (same clean-up and schema, but not the page's clipboard hooks)."""
    if ENGINE == "chromium":
        page.evaluate(
            """([html, text]) => {
                const el = document.querySelector('#post-text');
                el.focus();
                const dt = new DataTransfer();
                if (html) dt.setData('text/html', html);
                if (text) dt.setData('text/plain', text);
                el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
            }""",
            [html, text],
        )
        return
    page.evaluate(
        """([html, text]) => {
            const view = document.querySelector('#post-text').editor.view;
            view.focus();
            if (html) view.pasteHTML(html); else view.pasteText(text);
        }""",
        [html, text],
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chromium") if ENGINE == "chromium" else getattr(p, ENGINE).launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))

        # ---- the way in from /news: a note that stays in the corner
        page.goto(f"{BASE}/news", wait_until="networkidle")
        note = page.locator('aside[aria-label="Write your own post"]')
        note.wait_for(state="visible")
        page.wait_for_timeout(600)
        check("news page shows the note", note.is_visible())
        if SHOTS:
            page.screenshot(path=str(OUT / "news-note-1440.png"))
        page.mouse.wheel(0, 2400)
        page.wait_for_timeout(500)
        box = note.bounding_box()
        check("the note stays in the corner while scrolling", note.is_visible() and box["x"] + box["width"] > 1440 - 40 and box["y"] + box["height"] > 900 - 40, json.dumps(box))
        if SHOTS:
            page.screenshot(path=str(OUT / "news-note-scrolled-1440.png"))
        note.get_by_role("link", name="Start writing").click()
        page.wait_for_url("**/news/write")
        page.wait_for_selector("#post-text")
        check("the note opens the writer", True)
        check("one h1", page.locator("h1").count() == 1, page.locator("h1").first.inner_text())
        check("title", page.title() == "Write a post - RoboRacer", page.title())

        # ---- headline and byline
        page.fill("#post-headline", "Tuning pure pursuit for a tight track")
        page.fill("#post-author", "Ada Tester")
        page.fill("#post-author-role", "Team lead")
        page.fill("#post-affiliation", "Example University")
        page.fill("#post-author-url", "https://github.com/ada-tester")

        # ---- typing and formatting
        ed = page.locator("#post-text")
        ed.click()
        page.keyboard.type("We spent a season on one controller. This is what we learned.")
        page.keyboard.press("Enter")
        page.get_by_role("button", name="Heading", exact=True).click()
        page.keyboard.type("Why pure pursuit")
        page.keyboard.press("Enter")
        page.keyboard.type("It is simple and it is ")
        page.keyboard.press("Control+b")
        page.keyboard.type("fast")
        page.keyboard.press("Control+b")
        page.keyboard.type(" enough.")
        check("heading made", ed.locator("h2").count() == 1)
        check("bold made", ed.locator("strong").inner_text() == "fast")

        # ---- paste from a document: structure kept, styling and scripts dropped
        page.keyboard.press("Enter")
        paste(page, html=PASTE_HTML, text="fallback")
        page.wait_for_timeout(400)
        html = ed.inner_html()
        check("paste keeps headings (levels fitted)", ed.locator("h2", has_text="How we tuned the controller").count() == 1 and ed.locator("h3", has_text="Lookahead").count() == 1)
        check("paste keeps bold, italic, link, list", ed.locator("strong", has_text="pure pursuit").count() == 1 and ed.locator("em").count() >= 1 and ed.locator('a[href="https://example.org/paper"]').count() == 1 and ed.locator("ul li").count() == 2)
        check("paste drops fonts and colours", "Comic" not in html and "color" not in html and "font-size" not in html, "")
        check("paste drops script, handler, js link, frame", page.evaluate("window.__pwned") is None and "javascript:" not in html and "<iframe" not in html and "onerror" not in html)

        # ---- paste Markdown source
        page.keyboard.press("Control+End")
        page.keyboard.press("Enter")
        if ENGINE == "chromium":
            paste(page, text=MARKDOWN)
        else:
            paste(page, html=MARKDOWN_AS_HTML)
        page.wait_for_timeout(300)
        check("markdown paste becomes structure" if ENGINE == "chromium" else "(markdown paste not driven in this engine; same text pasted as HTML)", ed.locator("h2", has_text="Results").count() == 1 and ed.locator("code", has_text="code").count() == 1 and ed.locator('a[href="https://github.com/example/repo"]').count() == 1)

        # ---- pictures: beside the text by default
        page.keyboard.press("Control+End")
        page.keyboard.press("Enter")
        page.keyboard.type("WRAPMARK " + "The car held the racing line through the hairpin and the planner kept it there lap after lap. " * 9)
        # The cursor at the start of that paragraph (set through the editor:
        # a click near a paragraph's top can land under the sticky bars).
        page.evaluate(
            """() => { const e = document.querySelector('#post-text').editor; let at = -1;
                       e.state.doc.forEach((n, pos) => { if (n.textContent.includes('WRAPMARK')) at = pos + 1; });
                       e.chain().focus().setTextSelection(at).run(); }"""
        )
        page.set_input_files('input[type=file][multiple]', [str(HERE / "landscape.jpg")])
        page.wait_for_selector(".rr-figure img", timeout=15000)
        fig = page.locator(".rr-media").first
        check("picture added by the picker", fig.locator("img").count() == 1)
        page.wait_for_timeout(300)
        geo = page.evaluate(
            """() => {
                const fig = document.querySelector('#post-text > .rr-media');
                const para = [...document.querySelectorAll('#post-text > p')].find(p => p.textContent.includes('WRAPMARK'));
                const f = fig.getBoundingClientRect(), p = para.getBoundingClientRect();
                const range = document.createRange(); range.selectNodeContents(para);
                const first = range.getClientRects()[0];
                return { float: getComputedStyle(fig).float, wrap: fig.dataset.wrap, before: !!(fig.compareDocumentPosition(para) & 4),
                         beside: p.top < f.bottom && p.bottom > f.top, lineEndsBeforePicture: first.right <= f.left + 2, share: f.width / p.width };
            }"""
        )
        check("a new picture sits on the right with the text flowing around it", geo["float"] == "right" and geo["wrap"] == "right" and geo["before"] and geo["beside"] and geo["lineEndsBeforePicture"], json.dumps(geo))

        # drop two portraits onto the top of the same paragraph
        page.evaluate(
            """async (urls) => {
                const dt = new DataTransfer();
                for (const [name, type, b64] of urls) {
                    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
                    dt.items.add(new File([bin], name, { type }));
                }
                const el = document.querySelector('#post-text');
                const para = [...document.querySelectorAll('#post-text > p')].find(p => p.textContent.includes('WRAPMARK'));
                para.scrollIntoView({ block: 'center' });
                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                const r = para.getBoundingClientRect();
                const init = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.left + 30, clientY: r.top + 6 };
                el.dispatchEvent(new DragEvent('dragover', init));
                el.dispatchEvent(new DragEvent('drop', init));
            }""",
            [
                ["portrait.png", "image/png", __import__("base64").b64encode((HERE / "portrait.png").read_bytes()).decode()],
                ["portrait2.jpg", "image/jpeg", __import__("base64").b64encode((HERE / "portrait2.jpg").read_bytes()).decode()],
            ],
        )
        page.wait_for_function("document.querySelectorAll('.rr-figure img').length >= 3", timeout=20000)
        page.wait_for_timeout(400)
        sides = page.evaluate("[...document.querySelectorAll('#post-text > .rr-media')].map(e => e.dataset.wrap)")
        check("pictures alternate sides down the text", sides == ["right", "left", "right"], json.dumps(sides))
        if SHOTS:
            page.locator("#post-text > .rr-media").first.scroll_into_view_if_needed()
            page.mouse.wheel(0, -200)
            page.wait_for_timeout(300)
            page.screenshot(path=str(OUT / "wrap-1440.png"))

        # two small pictures on their own line share it
        for i in (1, 2):
            m = page.locator("#post-text > .rr-media").nth(i)
            m.locator("img").click()
            m.get_by_role("button", name="Small, on its own line", exact=False).click()
        page.wait_for_timeout(400)
        check("two small pictures pair on one line", page.locator(".rr-pair").count() == 2)
        if page.locator(".rr-pair").count() == 2:
            a = page.locator(".rr-pair-first").bounding_box()
            b = page.locator(".rr-pair-second").bounding_box()
            fa = page.locator(".rr-pair-first img").bounding_box()
            fb = page.locator(".rr-pair-second img").bounding_box()
            check("pair sits side by side at equal height", abs(a["y"] - b["y"]) < 2 and b["x"] > a["x"] + a["width"] - 2 and abs(fa["height"] - fb["height"]) < 3, f'{fa["height"]:.0f} vs {fb["height"]:.0f}')

        # ---- captions and descriptions
        first = page.locator(".rr-figure").first
        first.locator('input[aria-label="Caption"]').fill("The car on the back straight.")
        first.locator('input[aria-label^="Describe the picture"]').fill("A small autonomous car on a track")
        page.keyboard.press("Tab")

        # ---- move and place with the bar
        before = page.evaluate("[...document.querySelectorAll('#post-text > *')].findIndex(e => e.classList.contains('rr-media'))")
        first.locator("img").click()
        first.get_by_role("button", name="Move up").click()
        after = page.evaluate("[...document.querySelectorAll('#post-text > *')].findIndex(e => e.classList.contains('rr-media'))")
        check("Move up moves the picture", after == before - 1, f"{before} -> {after}")
        top = page.locator("#post-text > .rr-media").first
        top.get_by_role("button", name="Full width, on its own line").click()
        check("Full width takes it out of the text", top.get_attribute("data-wrap") == "none" and top.get_attribute("data-size") == "column")
        top.get_by_role("button", name="Left, with the text flowing around it").click()
        page.wait_for_timeout(150)
        check("Left puts it beside the text on the left", top.get_attribute("data-wrap") == "left" and top.evaluate("e => getComputedStyle(e).float") == "left")

        # ---- drag a picture to another place: the half it lands on is its side
        handle = top.locator("[data-drag-handle]")
        target = ed.locator("h2", has_text="Results")
        target.scroll_into_view_if_needed()
        hb = handle.bounding_box()
        tb = target.bounding_box()
        col = ed.bounding_box()
        idx_before = page.evaluate("[...document.querySelectorAll('#post-text > *')].findIndex(e => e.classList.contains('rr-media'))")
        if hb and tb:
            page.mouse.move(hb["x"] + hb["width"] / 2, hb["y"] + hb["height"] / 2)
            page.mouse.down()
            page.mouse.move(hb["x"] + hb["width"] / 2 + 5, hb["y"] + hb["height"] / 2 + 5, steps=3)
            page.mouse.move(col["x"] + col["width"] - 60, tb["y"] + tb["height"] + 6, steps=14)
            page.wait_for_timeout(150)
            page.mouse.up()
            page.wait_for_timeout(400)
        moved = page.evaluate(
            """() => { const all = [...document.querySelectorAll('#post-text > *')]; const i = all.findIndex(e => e.classList.contains('rr-media'));
                       const sel = document.querySelector('#post-text > .rr-media.ProseMirror-selectednode'); return { i, wrap: sel ? sel.dataset.wrap : null }; }"""
        )
        check("dragging moves the picture", moved["i"] != idx_before or moved["wrap"] is not None, f"{idx_before} -> {moved['i']}")
        check("dropped on the right half, it takes the right side", moved["wrap"] == "right", json.dumps(moved))

        # ---- a YouTube link pasted on an empty line
        page.keyboard.press("Control+End")
        page.keyboard.press("Enter")
        if ENGINE == "chromium":
            paste(page, text="https://www.youtube.com/watch?v=cEtLJ8aXSXk")
        else:
            page.get_by_role("button", name="Add a YouTube video").click()
            page.fill("#writer-panel-input", "https://youtu.be/cEtLJ8aXSXk")
            page.get_by_role("button", name="Add video").click()
        page.wait_for_timeout(300)
        check("YouTube link becomes a video block", page.locator('.rr-figure input[aria-label="The video\'s title"]').count() == 1)

        # ---- cover
        page.set_input_files("#post-cover input[type=file]", [str(HERE / "cover.jpg")])
        page.wait_for_selector("#post-cover img", timeout=15000)
        check("cover added", True)

        # ---- send while things are missing
        page.get_by_role("button", name="Send post").click()
        page.wait_for_selector("dialog[open]")
        issues = page.locator("dialog[open] ul li").all_inner_texts()
        check("send lists what is missing", len(issues) >= 2, " | ".join(issues))
        if SHOTS:
            page.screenshot(path=str(OUT / "send-missing-1440.png"))
        page.locator("dialog[open] ul li button").first.click()
        page.wait_for_timeout(300)
        check("a missing item takes the writer back", page.locator("dialog[open]").count() == 0)

        # fill everything that is missing
        for i in range(page.locator('.rr-figure input[aria-label^="Describe the picture"]').count()):
            f = page.locator('.rr-figure input[aria-label^="Describe the picture"]').nth(i)
            if not f.input_value():
                f.fill(f"Test picture {i + 1}")
        page.locator('.rr-figure input[aria-label="The video\'s title"]').fill("ICRA 2025 final")
        page.fill("#post-cover-alt", "A test cover")
        page.keyboard.press("Tab")
        page.wait_for_timeout(900)

        # ---- the draft survives a reload
        page.reload(wait_until="networkidle")
        page.wait_for_selector("#post-text")
        page.wait_for_timeout(800)
        check("reload restores the headline", page.input_value("#post-headline") == "Tuning pure pursuit for a tight track")
        check("reload restores the text", page.locator("#post-text h2").count() >= 3)
        check("reload restores the pictures", page.locator(".rr-figure img").count() >= 4, str(page.locator(".rr-figure img").count()))
        check("reload restores the cover", page.locator("#post-cover img").count() == 1)
        if SHOTS:
            page.screenshot(path=str(OUT / "write-1440.png"), full_page=True)

        # ---- preview is the real post page
        page.get_by_role("button", name="Preview", exact=True).click()
        page.wait_for_selector("article h1")
        check("preview: one h1, the headline", page.locator("h1").count() == 1 and page.locator("h1").inner_text() == "Tuning pure pursuit for a tight track", page.locator("h1").first.inner_text())
        check("preview shows the byline", page.locator("article", has_text="By Ada Tester").count() == 1)
        check("preview shows figures and captions", page.locator("article figure img").count() >= 4 and page.locator("article figcaption", has_text="The car on the back straight.").count() == 1)
        broken = page.evaluate("[...document.querySelectorAll('article img')].filter(i => i.complete && i.naturalWidth === 0 && !i.src.includes('ytimg')).length")
        check("preview pictures all load", broken == 0, str(broken))
        floats = page.evaluate("[...document.querySelectorAll('article figure')].map(f => getComputedStyle(f).float).filter(f => f !== 'none')")
        check("preview shows a picture beside the text", len(floats) >= 1, json.dumps(floats))
        if SHOTS:
            page.screenshot(path=str(OUT / "preview-1440.png"), full_page=True)
        page.get_by_role("button", name="Write", exact=True).click()

        # ---- send
        page.get_by_role("button", name="Send post").click()
        page.wait_for_selector("dialog[open]")
        check("ready to send", page.locator("dialog[open] h2").inner_text() == "Ready to send", page.locator("dialog[open] h2").inner_text())
        dl_button = page.get_by_role("button", name="Download the post")
        check("download waits for the tick box", dl_button.is_disabled())
        page.locator("dialog[open] input[type=checkbox]").check()
        with page.expect_download() as dl:
            dl_button.click()
        zip_path = OUT / dl.value.suggested_filename
        dl.value.save_as(str(zip_path))
        check("package downloaded", zip_path.exists() and zip_path.stat().st_size > 1000, f"{zip_path.name} {zip_path.stat().st_size} bytes")
        check("username read from the author's page", page.input_value("#send-github-user") == "ada-tester")
        href = page.get_by_role("link", name="Open your upload page").get_attribute("href")
        check("upload link points at the writer's fork", href == "https://github.com/ada-tester/roboracer-site/upload/main/submissions", str(href))
        if SHOTS:
            page.screenshot(path=str(OUT / "send-ready-1440.png"))
        page.keyboard.press("Escape")

        check("no console errors", len(errors) == 0, " || ".join(errors[:5]))
        (OUT / "result.json").write_text(json.dumps({"zip": str(zip_path), "results": results}, indent=1))

        if SHOTS:
            for w, h, name in [(768, 1024, "768"), (390, 844, "390")]:
                page.set_viewport_size({"width": w, "height": h})
                page.wait_for_timeout(500)
                page.screenshot(path=str(OUT / f"write-{name}.png"), full_page=True)
                page.get_by_role("button", name="Preview", exact=True).click()
                page.wait_for_selector("article h1")
                page.screenshot(path=str(OUT / f"preview-{name}.png"), full_page=True)
                page.get_by_role("button", name="Write", exact=True).click()
        browser.close()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
