"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import type { Course } from "../../../lib/logic";

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

  React.useEffect(() => {
    let cancelled = false;
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
  }, []);

  return state;
}

function courseInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { loading, error, courses } = useCourseData();

  const course = React.useMemo(
    () => courses.find((c) => c.mangoId === params.id),
    [courses, params.id],
  );

  return (
    <main>
      <Navbar />
      <section className="bg-sp-bg px-6 py-12 text-sp-text">
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/#courses"
            className="mb-6 inline-block text-sm font-medium text-sp-text-muted no-underline transition-colors duration-150 ease-out hover:text-sp-accent"
          >
            ← Back to courses
          </Link>

          {loading && <p className="text-sm text-sp-text-muted">Loading course...</p>}

          {!loading && (error || !course) && (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-sp-border bg-sp-surface p-8">
              <p className="m-0 text-sm text-sp-text-muted">
                We couldn't find that course. It may have moved or no longer exists.
              </p>
            </div>
          )}

          {!loading && course && (
            <div className="flex flex-wrap gap-10 max-[768px]:flex-col">
              <div className="flex w-[360px] flex-none items-center justify-center rounded-xl border border-sp-border bg-sp-surface p-10 max-[768px]:w-full">
                <span className="text-6xl font-bold text-sp-accent" aria-hidden>
                  {courseInitials(course.courseName)}
                </span>
              </div>

              <div className="flex min-w-[280px] flex-1 flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wide text-sp-text-muted">
                    {course.courseType}
                  </span>
                  {course.refundable ? (
                    <span className="rounded-full border border-sp-accent/35 bg-sp-accent/10 px-2 py-1 text-[11px] text-sp-accent">
                      Refundable
                    </span>
                  ) : null}
                </div>

                <h1 className="m-0 text-[28px] font-semibold text-sp-text">
                  {course.courseName}
                </h1>

                <p className="m-0 text-sm text-sp-text-muted">
                  {course.mainCategory} · {course.shortCourse}
                </p>

                <p className="m-0 text-[15px] leading-relaxed text-sp-text-muted">
                  {course.description}
                </p>

                <div className="mt-2">
                  <span className="text-2xl font-semibold text-sp-text">
                    {course.price.currency === "INR" ? "₹" : "$"}
                    {course.price.formatted}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-2 w-fit rounded-lg border border-transparent bg-sp-accent px-6 py-3 text-sm font-medium text-white transition-all duration-150 ease-out hover:-translate-y-px hover:scale-105 hover:shadow-[0_4px_16px_color-mix(in_srgb,var(--color-sp-accent)_40%,transparent)] active:translate-y-0 active:scale-[0.98]"
                >
                  Enroll now
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
