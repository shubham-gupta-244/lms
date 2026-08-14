"use client";

import Link from "next/link";
import * as React from "react";
import {
  deriveState,
  filterCourses,
  groupCourses,
  sortCoursesByPrice,
  type Course,
  type SortDirection,
} from "../lib/logic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://skillpath-backend-eo23.onrender.com";
const COURSE_DATA_ENDPOINT = `${API_BASE_URL}/api/v1/assignment/course-data`;

interface FetchState {
  loading: boolean;
  error: boolean;
  courses: Course[];
}

function useCourseData() {
  const [state, setState] = React.useState<FetchState>({
    loading: true,
    error: false,
    courses: [],
  });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: false }));

    fetch(COURSE_DATA_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then((data: { courses: Course[] }) => {
        if (cancelled) return;
        setState({ loading: false, error: false, courses: data.courses ?? [] });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ loading: false, error: true, courses: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}

const shimmerStyle = {
  backgroundImage:
    "linear-gradient(90deg, var(--color-sp-surface-raised) 25%, var(--color-sp-border) 37%, var(--color-sp-surface-raised) 63%)",
  backgroundSize: "400% 100%",
};

function SkeletonCard() {
  return (
    <div className="flex w-[280px] flex-none flex-col gap-2.5 rounded-xl border border-sp-border bg-sp-surface p-5">
      <div
        className="h-[18px] w-[70%] animate-[sp-shimmer_1.4s_ease_infinite] rounded"
        style={shimmerStyle}
      />
      <div
        className="h-3 animate-[sp-shimmer_1.4s_ease_infinite] rounded"
        style={shimmerStyle}
      />
      <div
        className="h-3 w-[40%] animate-[sp-shimmer_1.4s_ease_infinite] rounded"
        style={shimmerStyle}
      />
    </div>
  );
}

function RefundableBadge() {
  return (
    <span className="rounded-full border border-sp-accent/35 bg-sp-accent/10 px-2 py-1 text-[11px] text-sp-accent">
      Refundable
    </span>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/course/${course.mangoId}`}
      className="flex w-[280px] flex-none animate-[sp-fade-in_0.35s_ease_both] flex-col gap-2 rounded-xl border border-sp-border bg-sp-surface p-5 text-inherit no-underline transition-all duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.04] hover:border-sp-accent hover:shadow-[0_16px_28px_rgba(39,63,245,0.16)] active:translate-y-[-2px] active:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-sp-text-muted">
          {course.courseType}
        </span>
        {course.refundable ? <RefundableBadge /> : null}
      </div>
      <h4 className="m-0 text-base font-semibold text-sp-text">{course.courseName}</h4>
      <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-sp-text-muted">
        {course.description}
      </p>
      <div className="mt-auto pt-2">
        <span className="text-[15px] font-semibold text-sp-text">
          {course.price.currency === "INR" ? "₹" : "$"}
          {course.price.formatted}
        </span>
      </div>
    </Link>
  );
}

interface MainCategoryCardProps {
  name: string;
  courseCount: number;
  subCourseCount: number;
  onClick: () => void;
}

function MainCategoryCard({ name, courseCount, subCourseCount, onClick }: MainCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[260px] flex-none animate-[sp-fade-in_0.35s_ease_both] flex-col gap-2.5 rounded-xl border border-sp-border bg-sp-surface p-[22px] text-left font-inherit text-inherit transition-all duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.03] hover:border-sp-accent hover:shadow-[0_16px_28px_rgba(39,63,245,0.16)] active:translate-y-[-2px] active:scale-[1.01]"
    >
      <h4 className="m-0 text-lg font-semibold text-sp-text">{name}</h4>
      <p className="m-0 text-[13px] text-sp-text-muted">
        {subCourseCount} sub-course{subCourseCount === 1 ? "" : "s"} · {courseCount} course
        {courseCount === 1 ? "" : "s"}
      </p>
      <span className="mt-auto text-lg font-semibold text-sp-accent" aria-hidden>
        →
      </span>
    </button>
  );
}

export default function CourseSection() {
  const { loading, error, courses, retry } = useCourseData();
  const [query, setQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("none");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const mainCategories = React.useMemo(() => {
    const map = new Map<string, { courseCount: number; subCourses: Set<string> }>();
    for (const course of courses) {
      if (!map.has(course.mainCategory)) {
        map.set(course.mainCategory, { courseCount: 0, subCourses: new Set() });
      }
      const entry = map.get(course.mainCategory)!;
      entry.courseCount += 1;
      entry.subCourses.add(course.shortCourse);
    }
    return Array.from(map.entries()).map(([name, entry]) => ({
      name,
      courseCount: entry.courseCount,
      subCourseCount: entry.subCourses.size,
    }));
  }, [courses]);

  const categoryCourses = React.useMemo(
    () => (selectedCategory ? courses.filter((c) => c.mainCategory === selectedCategory) : []),
    [courses, selectedCategory],
  );

  const filtered = React.useMemo(
    () => filterCourses(categoryCourses, query),
    [categoryCourses, query],
  );
  const sorted = React.useMemo(
    () => sortCoursesByPrice(filtered, sortDirection),
    [filtered, sortDirection],
  );
  const grouped = React.useMemo(() => groupCourses(sorted), [sorted]);

  const status = deriveState({ loading, error, courseCount: courses.length });

  function cycleSort() {
    setSortDirection((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
  }

  function openCategory(name: string) {
    setSelectedCategory(name);
    setQuery("");
    setSortDirection("none");
  }

  function backToCategories() {
    setSelectedCategory(null);
  }

  const btnGhost =
    "rounded-lg border border-sp-border bg-transparent px-4 py-2.5 text-sm font-medium text-sp-text transition-all duration-150 ease-out hover:-translate-y-px hover:scale-105 hover:border-sp-accent hover:text-sp-accent active:translate-y-0 active:scale-[0.98]";
  const btnPrimary =
    "rounded-lg border border-transparent bg-sp-accent px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 ease-out hover:-translate-y-px hover:scale-105 hover:shadow-[0_4px_16px_color-mix(in_srgb,var(--color-sp-accent)_40%,transparent)] active:translate-y-0 active:scale-[0.98]";

  return (
    <section id="courses" className="bg-sp-bg px-6 py-12 text-sp-text">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
          {selectedCategory ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={`${btnGhost} whitespace-nowrap`}
                onClick={backToCategories}
              >
                ← All categories
              </button>
              <h2 className="m-0 text-[28px] font-semibold text-sp-text">{selectedCategory}</h2>
            </div>
          ) : (
            <h2 className="m-0 text-[28px] font-semibold text-sp-text">Explore Courses</h2>
          )}

          {selectedCategory && (
            <div className="flex flex-wrap gap-3 max-[640px]:w-full">
              <input
                type="text"
                placeholder="Search courses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search courses"
                className="min-w-[220px] rounded-lg border border-sp-border bg-sp-bg px-3.5 py-2.5 text-sm text-sp-text transition-all duration-200 ease-out focus:border-sp-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-sp-accent)_20%,transparent)] focus:outline-none max-[640px]:min-w-0 max-[640px]:flex-1"
              />
              <button type="button" className={btnGhost} onClick={cycleSort}>
                Sort by price
                {sortDirection === "asc" ? " ↑" : sortDirection === "desc" ? " ↓" : ""}
              </button>
            </div>
          )}
        </div>

        {status === "loading" && (
          <div className="flex flex-wrap justify-start gap-4 pb-2.5 max-[640px]:flex-col">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-sp-border bg-sp-surface p-8">
            <p className="m-0 text-sm text-sp-text-muted">
              We couldn't load courses right now. This service is occasionally flaky — give it
              another try.
            </p>
            <button type="button" className={btnPrimary} onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {status === "success" && !selectedCategory && (
          <div className="flex flex-wrap justify-start gap-4 pb-1 max-[640px]:flex-col">
            {mainCategories.map((category) => (
              <MainCategoryCard
                key={category.name}
                name={category.name}
                courseCount={category.courseCount}
                subCourseCount={category.subCourseCount}
                onClick={() => openCategory(category.name)}
              />
            ))}
          </div>
        )}

        {status === "success" && selectedCategory && sorted.length === 0 && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-sp-border bg-sp-surface p-8">
            <p className="m-0 text-sm text-sp-text-muted">
              No courses match right now. Try a different search.
            </p>
          </div>
        )}

        {status === "success" && selectedCategory && sorted.length > 0 && (
          <div>
            {Array.from(grouped.entries()).map(([, subGroups]) => (
              <React.Fragment key={selectedCategory}>
                {Array.from(subGroups.entries()).map(([shortCourse, groupCourseList]) => (
                  <div key={shortCourse} className="mb-6">
                    <h4 className="m-0 mb-3 text-sm font-medium uppercase tracking-wide text-sp-text-muted">
                      {shortCourse}
                    </h4>
                    <div className="flex flex-wrap justify-start gap-4 pb-2.5 max-[640px]:flex-col">
                      {groupCourseList.map((course) => (
                        <CourseCard key={course.mangoId} course={course} />
                      ))}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

