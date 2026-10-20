import { createContext } from "react";

/**
 * Whether the tab panel around a component is the one showing. CourseTabs
 * provides it for each panel; outside the tabs (the catalog's outline) it is
 * always true. CourseOutline reads it to close a playing recording when its
 * panel is hidden, so a lecture never keeps playing out of sight.
 */
export const PanelActive = createContext(true);
