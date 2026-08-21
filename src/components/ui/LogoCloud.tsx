import type { Partner } from "../../lib/data";

type LogoCloudProps = {
  partners: Partner[];
  /** Fixed logo box height in px so rows never shift. */
  logoHeight?: number;
};

/** Static wrapped partner-logo grid, alphabetical, untiered (partners are
 * proof of scale, not sponsors). For the moving variant wrap logos in
 * <Marquee> instead. */
export default function LogoCloud({ partners, logoHeight = 48 }: LogoCloudProps) {
  const sorted = [...partners].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
      {sorted.map((p) => (
        <li key={p.name} className="flex items-center" style={{ height: logoHeight }}>
          <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}${p.image}`}
              alt={p.name}
              height={logoHeight}
              width="auto"
              loading="lazy"
              decoding="async"
              className="max-h-full w-auto"
              style={{ maxHeight: logoHeight }}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
