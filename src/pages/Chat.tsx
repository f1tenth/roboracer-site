import { useEffect } from "react";

declare global {
  interface Window {
    ChatWidget?: { siteId: string };
  }
}

const CHAT_WIDGET_SITE_ID = "cmobun0dh002zry1ybnu8046q";
const CHAT_WIDGET_SRC = "https://altegolabs.com/widget.js";
const BUILD_IFRAME_SRC = "https://f1tenth.readthedocs.io/en/foxy_test/";

export default function Chat() {
  useEffect(() => {
    window.ChatWidget = { siteId: CHAT_WIDGET_SITE_ID };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHAT_WIDGET_SRC}"]`,
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = CHAT_WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="w-full h-[100svh]">
      <iframe
        className="w-full h-full border-none"
        src={BUILD_IFRAME_SRC}
        title="Build"
      />
    </div>
  );
}

