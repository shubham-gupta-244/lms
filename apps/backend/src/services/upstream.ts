import { CountryCodeSchema, CourseListSchema, type Course } from "../lib/schemas";

const BASE_URL = process.env.BASE_URL ?? "https://syncsphere-hiv6.onrender.com";
const FETCH_TIMEOUT_MS = 5000;

export class UpstreamError extends Error {}

async function fetchJson(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
  } catch (err) {
    throw new UpstreamError(`Request to ${path} failed: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new UpstreamError(`Upstream ${path} responded with status ${res.status}`);
  }

  try {
    return await res.json();
  } catch {
    throw new UpstreamError(`Upstream ${path} returned invalid JSON`);
  }
}

export async function fetchCourses(): Promise<Course[]> {
  const data = await fetchJson("/assignment/course-data");
  const parsed = CourseListSchema.safeParse(data);
  if (!parsed.success) {
    throw new UpstreamError("Upstream course-data payload failed schema validation");
  }
  return parsed.data;
}

export async function fetchCountryCode(): Promise<string> {
  const data = await fetchJson("/assignment/country-code");
  const parsed = CountryCodeSchema.safeParse(data);
  if (!parsed.success) {
    throw new UpstreamError("Upstream country-code payload failed schema validation");
  }
  return parsed.data.country_code;
}
