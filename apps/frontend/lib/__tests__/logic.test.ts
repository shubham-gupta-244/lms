import { describe, expect, test } from "bun:test";
import {
  deriveState,
  filterCourses,
  formatCopyright,
  groupCourses,
  sortCoursesByPrice,
  type Course,
} from "../logic";

function makeCourse(overrides: Partial<Course>): Course {
  return {
    courseName: "How To YouTube",
    courseCode: "how-to-youtube",
    description: "desc",
    mainCategory: "Content Creation",
    shortCourse: "YouTube",
    courseType: "Original",
    mangoId: "a1b2c3d4e5f6789012345678",
    refundable: false,
    price: { currency: "USD", amount: 39.99, formatted: "39.99" },
    ...overrides,
  };
}

describe("deriveState", () => {
  test("loading takes priority", () => {
    expect(deriveState({ loading: true, error: true, courseCount: 5 })).toBe("loading");
  });
  test("error when not loading and errored", () => {
    expect(deriveState({ loading: false, error: true, courseCount: 5 })).toBe("error");
  });
  test("empty when no error, no courses", () => {
    expect(deriveState({ loading: false, error: false, courseCount: 0 })).toBe("empty");
  });
  test("success when courses present", () => {
    expect(deriveState({ loading: false, error: false, courseCount: 3 })).toBe("success");
  });
});

describe("filterCourses", () => {
  const courses = [
    makeCourse({ courseName: "How To YouTube", mainCategory: "Content Creation", shortCourse: "YouTube" }),
    makeCourse({ courseName: "Twitter Growth", mainCategory: "Social Media", shortCourse: "Twitter" }),
  ];

  test("empty query returns all courses", () => {
    expect(filterCourses(courses, "")).toEqual(courses);
  });

  test("matches by course name case-insensitively", () => {
    expect(filterCourses(courses, "youtube")).toHaveLength(1);
  });

  test("matches by mainCategory", () => {
    expect(filterCourses(courses, "social media")).toHaveLength(1);
  });

  test("returns empty array when nothing matches", () => {
    expect(filterCourses(courses, "nonexistent")).toEqual([]);
  });
});

describe("sortCoursesByPrice", () => {
  const cheap = makeCourse({ courseName: "Cheap", price: { currency: "USD", amount: 10, formatted: "10.00" } });
  const expensive = makeCourse({
    courseName: "Expensive",
    price: { currency: "USD", amount: 100, formatted: "100.00" },
  });

  test("asc sorts lowest first", () => {
    expect(sortCoursesByPrice([expensive, cheap], "asc")).toEqual([cheap, expensive]);
  });

  test("desc sorts highest first", () => {
    expect(sortCoursesByPrice([cheap, expensive], "desc")).toEqual([expensive, cheap]);
  });

  test("none leaves original order untouched", () => {
    expect(sortCoursesByPrice([expensive, cheap], "none")).toEqual([expensive, cheap]);
  });

  test("does not mutate the input array", () => {
    const input = [expensive, cheap];
    sortCoursesByPrice(input, "asc");
    expect(input).toEqual([expensive, cheap]);
  });
});

describe("groupCourses", () => {
  test("groups by mainCategory then shortCourse", () => {
    const courses = [
      makeCourse({ courseName: "YT 1", mainCategory: "Content Creation", shortCourse: "YouTube" }),
      makeCourse({ courseName: "YT 2", mainCategory: "Content Creation", shortCourse: "YouTube" }),
      makeCourse({ courseName: "Twitter Growth", mainCategory: "Social Media", shortCourse: "Twitter" }),
    ];

    const grouped = groupCourses(courses);

    expect(grouped.size).toBe(2);
    expect(grouped.get("Content Creation")?.get("YouTube")).toHaveLength(2);
    expect(grouped.get("Social Media")?.get("Twitter")).toHaveLength(1);
  });

  test("empty input produces empty map", () => {
    expect(groupCourses([]).size).toBe(0);
  });
});

describe("formatCopyright", () => {
  test("formats brand and year into a copyright line", () => {
    expect(formatCopyright("SkillPath", 2026)).toBe("© 2026 SkillPath. All rights reserved.");
  });
});
