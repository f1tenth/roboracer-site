import type { ReactNode } from "react";

/** The writer's icons: 1.5px ink strokes on a 20px grid, drawn here so the
 * page adds no icon library. Decorative: every button carries its own label. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      {children}
    </svg>
  );
}

export const IconLink = () => (
  <Icon>
    <path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5L10 5" />
    <path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" />
  </Icon>
);
export const IconBullets = () => (
  <Icon>
    <path d="M8 5h9M8 10h9M8 15h9" />
    <path d="M3.5 5h.01M3.5 10h.01M3.5 15h.01" strokeWidth="2.5" />
  </Icon>
);
export const IconNumbers = () => (
  <Icon>
    <path d="M8 5h9M8 10h9M8 15h9" />
    <path d="M3 4l1-.5V7M3 12.5h1.6L3 15h1.8" strokeWidth="1.2" />
  </Icon>
);
export const IconQuote = () => (
  <Icon>
    <path d="M4 4v12" strokeWidth="2.5" />
    <path d="M8 6h8M8 10h8M8 14h5" />
  </Icon>
);
export const IconCode = () => (
  <Icon>
    <path d="M7 6l-4 4 4 4M13 6l4 4-4 4" />
  </Icon>
);
export const IconCodeBlock = () => (
  <Icon>
    <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
    <path d="M6 8l2 2-2 2M10.5 12.5H14" />
  </Icon>
);
export const IconRule = () => (
  <Icon>
    <path d="M3 10h14" />
    <path d="M6 5h8M6 15h8" opacity="0.35" />
  </Icon>
);
export const IconPicture = () => (
  <Icon>
    <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
    <circle cx="7" cy="8" r="1.5" />
    <path d="M3 14l4-3.5 3 2.5 3-3 4 4" />
  </Icon>
);
export const IconVideo = () => (
  <Icon>
    <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
    <path d="M8.5 7.5v5l4-2.5z" fill="currentColor" stroke="none" />
  </Icon>
);
export const IconUndo = () => (
  <Icon>
    <path d="M7 5L3.5 8.5 7 12" />
    <path d="M4 8.5h7.5a4 4 0 0 1 0 8H9" />
  </Icon>
);
export const IconRedo = () => (
  <Icon>
    <path d="M13 5l3.5 3.5L13 12" />
    <path d="M16 8.5H8.5a4 4 0 0 0 0 8H11" />
  </Icon>
);
export const IconUp = () => (
  <Icon>
    <path d="M10 16V4M5 9l5-5 5 5" />
  </Icon>
);
export const IconDown = () => (
  <Icon>
    <path d="M10 4v12M5 11l5 5 5-5" />
  </Icon>
);
export const IconTrash = () => (
  <Icon>
    <path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6" />
  </Icon>
);
/* Where a picture sits: the filled box is the picture, the lines the text. */
export const IconWrapLeft = () => (
  <Icon>
    <rect x="2.5" y="4" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
    <path d="M12.5 5h5M12.5 8.5h5M2.5 13.5h15M2.5 16.5h10" />
  </Icon>
);
export const IconWrapRight = () => (
  <Icon>
    <rect x="10.5" y="4" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
    <path d="M2.5 5h5M2.5 8.5h5M2.5 13.5h15M2.5 16.5h10" />
  </Icon>
);
export const IconCentre = () => (
  <Icon>
    <rect x="6.5" y="6.5" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
    <path d="M2.5 3.5h15M2.5 16.5h15" />
  </Icon>
);
export const IconFull = () => (
  <Icon>
    <rect x="2.5" y="6.5" width="15" height="7" rx="1" fill="currentColor" stroke="none" />
    <path d="M2.5 3.5h15M2.5 16.5h15" />
  </Icon>
);
export const IconZoom = () => (
  <Icon>
    <circle cx="8.5" cy="8.5" r="5" />
    <path d="M12.5 12.5l4.5 4.5M8.5 6.5v4M6.5 8.5h4" />
  </Icon>
);
export const IconSwap = () => (
  <Icon>
    <path d="M4 7h11M12 4l3 3-3 3" />
    <path d="M16 13H5M8 10l-3 3 3 3" />
  </Icon>
);
export const IconCheck = () => (
  <Icon>
    <path d="M4 10.5l4 4 8-9" />
  </Icon>
);
export const IconArrow = () => (
  <Icon>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </Icon>
);
