export interface CoursePrice {
  currency: "INR" | "USD";
  amount: number;
  formatted: string;
}

export interface Course {
  courseName: string;
  courseCode: string;
  description: string;
  mainCategory: string;
  shortCourse: string;
  courseType: string;
  mangoId: string;
  refundable: boolean;
  price: CoursePrice;
}

export type SectionState = "loading" | "error" | "empty" | "success";

export function formatCopyright(brand: string, year: number): string {
  return `© ${year} ${brand}. All rights reserved.`;
}

export function deriveState(params: {
  loading: boolean;
  error: boolean;
  courseCount: number;
}): SectionState {
  if (params.loading) return "loading";
  if (params.error) return "error";
  if (params.courseCount === 0) return "empty";
  return "success";
}

export function filterCourses(courses: Course[], query: string): Course[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return courses;
  return courses.filter((course) =>
    [course.courseName, course.mainCategory, course.shortCourse]
      .join(" ")
      .toLowerCase()
      .includes(trimmed),
  );
}

export type SortDirection = "asc" | "desc" | "none";

export function sortCoursesByPrice(courses: Course[], direction: SortDirection): Course[] {
  if (direction === "none") return courses;
  const sorted = [...courses].sort((a, b) => a.price.amount - b.price.amount);
  return direction === "asc" ? sorted : sorted.reverse();
}

export type GroupedCourses = Map<string, Map<string, Course[]>>;

export function groupCourses(courses: Course[]): GroupedCourses {
  const grouped: GroupedCourses = new Map();
  for (const course of courses) {
    if (!grouped.has(course.mainCategory)) {
      grouped.set(course.mainCategory, new Map());
    }
    const subGroups = grouped.get(course.mainCategory)!;
    if (!subGroups.has(course.shortCourse)) {
      subGroups.set(course.shortCourse, []);
    }
    subGroups.get(course.shortCourse)!.push(course);
  }
  return grouped;
}
