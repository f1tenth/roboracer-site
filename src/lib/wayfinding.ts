/**
 * The landing's "Start here" (ui/StartHere) sits under the hero at #start; the
 * nav's "Start here" button links there from every route. One constant so the
 * id and the link cannot drift apart.
 */
export const START_ID = "start";
export const START_HREF = `/#${START_ID}`;

/** /about has its own "Start here" section (01, the fuller rows). On that
 * page the nav's button goes there instead of leaving for the landing's
 * copy of the same five rows (QA p3-integration, item 3). */
export const ABOUT_START_ID = "about-start";

/** The nav's "Start here" target for the route on screen. */
export const startHrefFor = (pathname: string) =>
  pathname === "/about" ? `/about#${ABOUT_START_ID}` : START_HREF;
