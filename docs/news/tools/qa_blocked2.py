import time, base64, io, sys
from PIL import Image
from playwright.sync_api import sync_playwright
OUT=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch()
    for (w,h) in [(1366,650),(390,844)]:
        ctx=b.new_context(viewport={"width":w,"height":h}, has_touch=w<900, is_mobile=w<700)
        ctx.route("**/*linkedin.com/**", lambda r: r.abort())
        page=ctx.new_page()
        page.goto("http://127.0.0.1:4188/news", wait_until="networkidle"); page.wait_for_selector("#all-news"); time.sleep(1)
        cdp=ctx.new_cdp_session(page)
        btn=page.locator("article button[aria-expanded]").first
        btn.scroll_into_view_if_needed(); btn.click(); time.sleep(3)
        panel=page.locator("article div[id]").first
        y=page.evaluate("(e)=>e.getBoundingClientRect().top+window.scrollY", panel.element_handle())
        page.evaluate(f"window.scrollTo(0,{y-200})"); page.mouse.wheel(0,1); time.sleep(0.8)
        Image.open(io.BytesIO(base64.b64decode(cdp.send("Page.captureScreenshot",{"format":"png"})["data"]))).save(f"{OUT}/news-{w}x{h}-embed-blocked-noposter.png")
        ctx.close()
    b.close()
