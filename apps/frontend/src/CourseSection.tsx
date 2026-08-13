import * as React from "react";
import { addPropertyControls, ControlType } from "framer";
import {
  deriveState,
  filterCourses,
  groupCourses,
  sortCoursesByPrice,
  type Course,
  type SortDirection,
} from "./logic";

// Infra config, not a design knob — deliberately not a property control.
const API_BASE_URL = "https://skillpath-backend-eo23.onrender.com";
const COURSE_DATA_ENDPOINT = `${API_BASE_URL}/api/v1/assignment/course-data`;

const PALETTE = {
  bg: "#0f0b16",
  surface: "#1b1424",
  surfaceRaised: "#241a30",
  border: "#3a2c4a",
  text: "#f5f3f7",
  textMuted: "#b7aec2",
  black: "#050308",
};

interface CourseSectionProps {
  accentColor: string;
  sectionTitle: string;
}

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

function SkeletonCard() {
  return (
    <div className="sp-card sp-skeleton">
      <div className="sp-skeleton-line sp-skeleton-title" />
      <div className="sp-skeleton-line" />
      <div className="sp-skeleton-line sp-skeleton-short" />
    </div>
  );
}

function RefundableBadge() {
  return <span className="sp-badge">Refundable</span>;
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="sp-card">
      <div className="sp-card-top">
        <span className="sp-card-type">{course.courseType}</span>
        {course.refundable ? <RefundableBadge /> : null}
      </div>
      <h4 className="sp-card-title">{course.courseName}</h4>
      <p className="sp-card-desc">{course.description}</p>
      <div className="sp-card-footer">
        <span className="sp-card-price">
          {course.price.currency === "INR" ? "₹" : "$"}
          {course.price.formatted}
        </span>
      </div>
    </div>
  );
}

export default function CourseSection(props: CourseSectionProps) {
  const { loading, error, courses, retry } = useCourseData();
  const [query, setQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("none");

  const filtered = React.useMemo(() => filterCourses(courses, query), [courses, query]);
  const sorted = React.useMemo(
    () => sortCoursesByPrice(filtered, sortDirection),
    [filtered, sortDirection],
  );
  const grouped = React.useMemo(() => groupCourses(sorted), [sorted]);

  const status = deriveState({ loading, error, courseCount: courses.length });

  function cycleSort() {
    setSortDirection((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
  }

  return (
    <section
      className="sp-section"
      style={{ "--sp-accent": props.accentColor } as React.CSSProperties}
    >
      <style>{STYLES}</style>

      <div className="sp-header">
        <h2 className="sp-title">{props.sectionTitle}</h2>

        <div className="sp-controls">
          <input
            className="sp-search"
            type="text"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search courses"
          />
          <button type="button" className="sp-btn sp-btn-ghost" onClick={cycleSort}>
            Sort by price
            {sortDirection === "asc" ? " ↑" : sortDirection === "desc" ? " ↓" : ""}
          </button>
        </div>
      </div>

      {status === "loading" && (
        <div className="sp-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="sp-state-panel">
          <p className="sp-state-text">
            We couldn't load courses right now. This service is occasionally flaky — give it
            another try.
          </p>
          <button type="button" className="sp-btn sp-btn-primary" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {status === "empty" && (
        <div className="sp-state-panel">
          <p className="sp-state-text">No courses match right now. Try a different search.</p>
        </div>
      )}

      {status === "success" && (
        <div className="sp-groups">
          {Array.from(grouped.entries()).map(([mainCategory, subGroups]) => (
            <div key={mainCategory} className="sp-group">
              <h3 className="sp-group-title">{mainCategory}</h3>
              {Array.from(subGroups.entries()).map(([shortCourse, groupCourseList]) => (
                <div key={shortCourse} className="sp-subgroup">
                  <h4 className="sp-subgroup-title">{shortCourse}</h4>
                  <div className="sp-grid">
                    {groupCourseList.map((course) => (
                      <CourseCard key={course.mangoId} course={course} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

addPropertyControls(CourseSection, {
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: "#7c5cbf",
  },
  sectionTitle: {
    type: ControlType.String,
    title: "Section Title",
    defaultValue: "Explore Courses",
  },
});

const STYLES = `
.sp-section {
  --sp-bg: ${PALETTE.bg};
  --sp-surface: ${PALETTE.surface};
  --sp-surface-raised: ${PALETTE.surfaceRaised};
  --sp-border: ${PALETTE.border};
  --sp-text: ${PALETTE.text};
  --sp-text-muted: ${PALETTE.textMuted};
  background: var(--sp-bg);
  color: var(--sp-text);
  padding: 48px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.sp-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.sp-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: var(--sp-text);
}

.sp-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.sp-search {
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  color: var(--sp-text);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  min-width: 220px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.sp-search:focus {
  outline: none;
  border-color: var(--sp-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sp-accent) 25%, transparent);
}

.sp-btn {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.sp-btn:hover {
  transform: translateY(-1px);
}
.sp-btn:active {
  transform: translateY(0);
}
.sp-btn-primary {
  background: var(--sp-accent);
  color: ${PALETTE.black};
}
.sp-btn-primary:hover {
  box-shadow: 0 4px 16px color-mix(in srgb, var(--sp-accent) 45%, transparent);
}
.sp-btn-ghost {
  background: transparent;
  border-color: var(--sp-border);
  color: var(--sp-text);
}
.sp-btn-ghost:hover {
  border-color: var(--sp-accent);
  color: var(--sp-accent);
}

.sp-group {
  margin-bottom: 40px;
  animation: sp-fade-in 0.4s ease both;
}
.sp-group-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--sp-text);
}
.sp-subgroup {
  margin-bottom: 24px;
}
.sp-subgroup-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--sp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 12px;
}

.sp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .sp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .sp-grid {
    grid-template-columns: 1fr;
  }
}

.sp-card {
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: sp-fade-in 0.35s ease both;
}
.sp-card:hover {
  transform: translateY(-4px);
  border-color: var(--sp-accent);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

.sp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sp-card-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sp-text-muted);
}
.sp-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--sp-accent) 20%, transparent);
  color: var(--sp-accent);
  border: 1px solid color-mix(in srgb, var(--sp-accent) 40%, transparent);
}

.sp-card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--sp-text);
}
.sp-card-desc {
  font-size: 13px;
  color: var(--sp-text-muted);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sp-card-footer {
  margin-top: auto;
  padding-top: 8px;
}
.sp-card-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--sp-text);
}

.sp-skeleton {
  gap: 10px;
}
.sp-skeleton-line {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--sp-surface-raised) 25%,
    var(--sp-border) 37%,
    var(--sp-surface-raised) 63%
  );
  background-size: 400% 100%;
  animation: sp-shimmer 1.4s ease infinite;
}
.sp-skeleton-title {
  height: 18px;
  width: 70%;
}
.sp-skeleton-short {
  width: 40%;
}

.sp-state-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 32px;
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  border-radius: 12px;
}
.sp-state-text {
  margin: 0;
  color: var(--sp-text-muted);
  font-size: 14px;
}

@keyframes sp-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
@keyframes sp-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
