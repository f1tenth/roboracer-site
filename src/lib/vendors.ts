import { heading, summary, vendors } from "../../public/data/vendors.json";

/**
 * Where a builder buys the car or a part of it: public/data/vendors.json, read at
 * build time. The Vendors band on /build sits above a frame one window tall,
 * so it has to be in the first paint (a fetched band would push the frame
 * down when it arrived); /assembly reads the same list for its part rows.
 * Named imports: the file's bookkeeping (`_about`, `sources`) stays out of the
 * bundle. `_about` says what belongs in the file and who asked for it.
 */
export type VendorLink = { label: string; href: string };

/** The one action on a product. `short` replaces `label` on a phone, where
 * a tile is a single line. */
export type VendorOrder = VendorLink & { short?: string };

export type VendorImage = { src: string; width: number; height: number; alt: string };

export type VendorProduct = {
  id: string;
  /** The part id of the 3D view (racecarAssemblyData `CAR_PARTS`), when the
   * product is one of the car's parts. */
  part?: string;
  /** Plain name, as the part list spells it. */
  name: string;
  /** One short sentence: what it is or does. Not shown on a phone. */
  line: string;
  /** The one action: the vendor's page for this product. */
  order: VendorOrder;
  /** Anything else worth a text link (verb + object labels). Shown on the
   * part's row on /assembly, not in the band. */
  links?: VendorLink[];
  image?: VendorImage;
};

export type Vendor = {
  id: string;
  name: string;
  /** One sentence beside the name: how the vendor stands to RoboRacer. */
  standing: string;
  /** The vendor's own page about RoboRacer. */
  url: string;
  products: VendorProduct[];
};

export const VENDORS_HEADING: string = heading;

/** One line for the band once it is folded away. */
export const VENDORS_SUMMARY: string = summary;

export const VENDORS: readonly Vendor[] = vendors;

/** The vendor that sells the part with this id, and the product it is. */
export function sellerOfPart(part: string): { vendor: Vendor; product: VendorProduct } | undefined {
  for (const vendor of VENDORS) {
    const product = vendor.products.find((p) => p.part === part);
    if (product) return { vendor, product };
  }
  return undefined;
}
