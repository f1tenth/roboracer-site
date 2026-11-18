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

/**
 * Where to buy, above the build docs (Rahul Mangharam, Slack, 2026-11-17:
 * "add the powerboard under vendors"; Cedric, the same day: cars and the
 * power board, not the board alone). Each vendor in
 * public/data/vendors.json is named once with its standing, then one tile
 * per product: its picture, its name, one line, and the vendor's page for
 * it as a violet button.
 *
 * The docs frame under it is one window tall, so the band folds: its heading
 * is the switch, and the fold is remembered. `phoneAside` rides in the
 * heading row on `compact` screens only (the page's own "Open the docs"
 * link), so the band and the page's strip are one bar, not two.
 *
 * Widths: from `xl` everything is one row (heading, vendor, tiles); from
 * `lg` the vendor's name sits over its tiles; below that the heading has a
 * row of its own. Tiles are two across from `sm`. On a phone a tile is one
 * line (picture, name, button): the product's line is left out and the
 * button may carry a shorter label, so two products cost two rows.
 */
export default function VendorBand({ phoneAside }: { phoneAside?: ReactNode }) {
  const [open, setOpen] = useState(() => !wasFolded());
  const vendors = VENDORS.filter((vendor) => vendor.products.length > 0);

  const toggle = () => {
    rememberFolded(open);
    setOpen(!open);
  };

  if (vendors.length === 0) {
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
          open ? "gap-y-1 pb-3 pt-2 lg:py-3" : "gap-y-0"
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
          {vendors.map((vendor) => (
            <li key={vendor.id} className="flex min-w-0 flex-col gap-x-8 gap-y-2 xl:flex-row xl:items-center">
              {/* From `lg` a laptop's root size is 75% (index.css), so the
                  band's running text steps up to body size there. */}
              <p className="shrink-0 text-small text-text-body lg:text-body xl:flex xl:flex-col">
                <span className="font-display font-semibold text-text-strong">{vendor.name}</span>{" "}
                <span>{vendor.standing}</span>
              </p>
              <ul className="grid min-w-0 flex-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 sm:gap-y-3">
                {vendor.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex min-w-0 items-center gap-x-3 gap-y-2 sm:flex-wrap sm:gap-x-4 lg:flex-nowrap"
                  >
                    {product.image && (
                      <img
                        src={asset(product.image.src)}
                        alt={product.image.alt}
                        width={product.image.width}
                        height={product.image.height}
                        decoding="async"
                        className="h-10 w-[3.75rem] shrink-0 rounded-media border border-ink-950/10 object-cover sm:h-16 sm:w-24 lg:h-[4.5rem] lg:w-[6.75rem]"
                      />
                    )}
                    <div className="min-w-0 flex-1 sm:min-w-[9rem]">
                      <h3 className="font-display text-body font-semibold leading-snug text-text-strong lg:text-[1.125rem]">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-pretty text-small text-text-body max-sm:hidden lg:text-body">
                        {product.line}
                      </p>
                    </div>
                    <a
                      href={product.order.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonClasses("primary", "paper", "sm")} shrink-0 coarse:min-h-11 lg:text-body`}
                    >
                      {product.order.short ? (
                        <>
                          <span className="sm:hidden">{product.order.short}</span>
                          <span className="max-sm:hidden">{product.order.label}</span>
                        </>
                      ) : (
                        product.order.label
                      )}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
