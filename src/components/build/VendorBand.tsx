import { useState, type ReactNode } from "react";
import { buttonClasses } from "../ui/buttonStyles";
import { VENDORS, VENDORS_HEADING, VENDORS_SUMMARY } from "../../lib/vendors";

// Whether a builder folded the band away. Kept in this browser: someone who
// spends an evening in the docs gets the frame's height back for good. A
// browser that refuses storage sees the band open on each visit.
const KEY = "rr-build-vendors";

function wasFolded(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "folded";
  } catch {
    return false;
  }
}

function rememberFolded(folded: boolean): void {
  try {
    if (folded) window.localStorage.setItem(KEY, "folded");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Private windows and blocked storage: the choice holds for this visit.
  }
}

const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;

const LINK =
  "underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

function NewTab() {
  return (
    <>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}

/**
 * Where to buy a part, above the build docs (Rahul Mangharam, Slack,
 * 2026-11-17: "add the powerboard under vendors"). One row per product in
 * public/data/vendors.json: its picture, what it does and who makes it, the
 * vendor's shop as the one violet button, and any other link as text.
 *
 * The docs frame under it is one window tall, so the band folds: its heading
 * is the switch, and the fold is remembered. `phoneAside` rides in the
 * heading row on `compact` screens only (the page's own "Open the docs"
 * link), so the band and the page's strip are one bar, not two.
 */
export default function VendorBand({ phoneAside }: { phoneAside?: ReactNode }) {
  const [open, setOpen] = useState(() => !wasFolded());
  const products = VENDORS.flatMap((vendor) => vendor.products);

  const toggle = () => {
    rememberFolded(open);
    setOpen(!open);
  };

  if (products.length === 0) {
    return phoneAside ? (
      <div className="flex justify-end border-b border-paper-200 px-6 desktop:hidden">{phoneAside}</div>
    ) : null;
  }

  return (
    <section aria-labelledby="vendors-title" className="relative border-b border-paper-200 bg-paper-50">
      {/* The logo gradient as the band's top rule, as on the /news note. */}
      {open && <div aria-hidden="true" className="h-[3px] bg-gradient-scale" />}
      <div
        className={`flex flex-wrap items-center gap-x-6 px-6 lg:flex-nowrap ${
          open ? "gap-y-2 pb-3 pt-2 lg:py-3" : "gap-y-0"
        }`}
      >
        <h2 id="vendors-title" className="shrink-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="vendors-panel"
            onClick={toggle}
            className="-mx-2 inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-btn px-2 font-mono text-small font-semibold text-text-strong transition-colors duration-[var(--duration-fast)] hover:bg-ink-950/[0.06] coarse:min-h-11"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-rr-violet" />
            {VENDORS_HEADING}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className={`h-4 w-4 motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </h2>
        {!open && <p className="min-w-0 truncate text-small text-text-muted max-sm:hidden">{VENDORS_SUMMARY}</p>}
        {phoneAside && <div className="ml-auto shrink-0 desktop:hidden lg:order-last">{phoneAside}</div>}
        <ul id="vendors-panel" hidden={!open} className="flex min-w-0 basis-full flex-col gap-4 lg:flex-1 lg:basis-auto">
          {products.map((product) => (
            // From `lg` the row never wraps: on a narrow laptop the line
            // breaks in two before the button drops under it.
            <li key={product.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:flex-nowrap">
              {product.image && (
                <img
                  src={asset(product.image.src)}
                  alt={product.image.alt}
                  width={product.image.width}
                  height={product.image.height}
                  decoding="async"
                  className="h-14 w-[5.25rem] shrink-0 rounded-media border border-ink-950/10 object-cover sm:h-16 sm:w-24 lg:h-[4.5rem] lg:w-[6.75rem]"
                />
              )}
              <div className="min-w-[13rem] flex-1 lg:flex-initial">
                <h3 className="font-display text-body font-semibold leading-snug text-text-strong lg:text-[1.125rem]">
                  {product.name}
                </h3>
                {/* From `lg` a laptop's root size is 75% (index.css), so the line
                    steps up to body size there and may run on one line. */}
                <p className="mt-0.5 max-w-[70ch] text-pretty text-small text-text-body lg:max-w-[96ch] lg:text-body">
                  {product.line}
                </p>
              </div>
              <p className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 text-small lg:text-body">
                <a
                  href={product.order.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClasses("primary", "paper", "sm")} coarse:min-h-11`}
                >
                  {product.order.label}
                  <NewTab />
                </a>
                {product.links?.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block font-semibold text-text-strong coarse:-my-3 coarse:py-3 ${LINK}`}
                  >
                    {link.label}&nbsp;
                    <NewTab />
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
