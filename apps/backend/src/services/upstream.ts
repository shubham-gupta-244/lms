import axios from "axios";
import { CountryCodeSchema, CourseListSchema, type Course } from "../lib/schemas";

const BASE_URL = process.env.BASE_URL ?? "https://syncsphere-hiv6.onrender.com";
const FETCH_TIMEOUT_MS = 5000;

export class UpstreamError extends Error {}

let cachedCourses: Course[] | null = null;

async function fetchJson(path: string): Promise<unknown> {
  try {
    const res = await axios.get(`${BASE_URL}${path}`, { timeout: FETCH_TIMEOUT_MS });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw new UpstreamError(`Upstream ${path} responded with status ${err.response.status}`);
      }
      throw new UpstreamError(`Request to ${path} failed: ${err.message}`);
    }
    throw new UpstreamError(`Request to ${path} failed: ${(err as Error).message}`);
  }
}

export function resetCourseCache(): void {
  cachedCourses = null;
}

export async function fetchCourses(): Promise<Course[]> {
  if (cachedCourses) return cachedCourses;

  const data = await fetchJson("/assignment/course-data");
  const parsed = CourseListSchema.safeParse(data);
  if (!parsed.success) {
    throw new UpstreamError("Upstream course-data payload failed schema validation");
  }
  cachedCourses = parsed.data;
  return cachedCourses;
}

export async function fetchCountryCode(): Promise<string> {
  const data = await fetchJson("/assignment/country-code");
  const parsed = CountryCodeSchema.safeParse(data);
  if (!parsed.success) {
    throw new UpstreamError("Upstream country-code payload failed schema validation");
  }
  return parsed.data.country_code;
}
