import time, base64, io, sys
from PIL import Image
from playwright.sync_api import sync_playwright
OUT=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch()
    for (w,h) in [(1366,650),(390,844)]:
        ctx=b.new_context(viewport={"width":w,"height":h}, has_touch=w<900, is_mobile=w<700)
        ctx.route("**/*linkedin.com/**", lambda r: r.abort())
        page=ctx.new_page(); errs=[]
        page.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
        page.goto("http://127.0.0.1:4188/news", wait_until="networkidle"); page.wait_for_selector("#all-news"); time.sleep(1)
        cdp=ctx.new_cdp_session(page)
        # first card toggle (a third-party post, no poster)
        btn=page.locator("article button[aria-expanded]").first
        btn.scroll_into_view_if_needed(); btn.click(); time.sleep(3)
        page.evaluate("window.scrollBy(0, 120)"); page.mouse.wheel(0,1); time.sleep(0.8)
        Image.open(io.BytesIO(base64.b64decode(cdp.send("Page.captureScreenshot",{"format":"png"})["data"]))).save(f"{OUT}/news-{w}x{h}-embed-blocked-noposter.png")
        # open 2025 fold if closed, then the techfest card's toggle (poster)
        for d in page.locator("details").all():
            if "2025" in d.locator("summary").inner_text():
                if not d.evaluate("e=>e.open"): d.locator("summary").click()
        card=page.locator("article", has_text="The 26th competition goes to Techfest")
        t=card.locator("button[aria-expanded]")
        t.scroll_into_view_if_needed(); t.click(); time.sleep(3)
        box=card.bounding_box(); page.evaluate(f"window.scrollBy(0, {box['y']-80})"); page.mouse.wheel(0,1); time.sleep(0.8)
        Image.open(io.BytesIO(base64.b64decode(cdp.send("Page.captureScreenshot",{"format":"png"})["data"]))).save(f"{OUT}/news-{w}x{h}-embed-blocked-poster.png")
        # keyboard: focus lands and aria-expanded toggles
        print(w, "expanded:", t.get_attribute("aria-expanded"), "focus-visible link count in panel:", card.locator("div[id] a").count(), "errors:", [e for e in errs if 'linkedin' not in e.lower()][:5])
        ctx.close()
    b.close()
