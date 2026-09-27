import { useEffect, useState } from "react";
import { loadCourses, type CoursesFile } from "../lib/data";

/** public/data/courses.json for the three course pages: undefined while it
 * loads, null if it failed. */
export function useCourses(): CoursesFile | null | undefined {
  const [courses, setCourses] = useState<CoursesFile | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadCourses()
      .then((c) => live && setCourses(c))
      .catch(() => live && setCourses(null));
    return () => {
      live = false;
    };
  }, []);
  return courses;
}
