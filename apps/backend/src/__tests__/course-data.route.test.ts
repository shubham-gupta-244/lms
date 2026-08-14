import axios from "axios";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../app";
import { resetCourseCache } from "../services/upstream";

const COURSE_PATH = "/api/v1/assignment/course-data";
const UPSTREAM_COURSE_URL = "https://syncsphere-hiv6.onrender.com/assignment/course-data";
const UPSTREAM_COUNTRY_URL = "https://syncsphere-hiv6.onrender.com/assignment/country-code";

const sampleCourse = {
  courseName: "How To YouTube",
  courseCode: "how-to-youtube",
  description: "From concept to creation.",
  mainCategory: "Content Creation",
  shortCourse: "YouTube",
  courseType: "Original",
  pricePaise: 199900,
  priceUsdCents: 3999,
  mangoId: "a1b2c3d4e5f6789012345678",
  refundable: true,
};

interface MockResponse {
  status: number;
  data: unknown;
}

function jsonResponse(body: unknown, status = 200): MockResponse {
  return { status, data: body };
}

const originalGet = axios.get;

beforeEach(() => {
  resetCourseCache();
});

afterEach(() => {
  axios.get = originalGet;
});

function mockFetch(handlers: {
  courses?: () => MockResponse | Promise<MockResponse>;
  country?: () => MockResponse | Promise<MockResponse>;
}) {
  axios.get = (async (url: string) => {
    if (url === UPSTREAM_COURSE_URL) {
      if (!handlers.courses) throw new Error("unexpected course-data fetch");
      const res = await handlers.courses();
      if (res.status >= 400) {
        throw Object.assign(new Error(`Request failed with status code ${res.status}`), {
          isAxiosError: true,
          response: res,
        });
      }
      return res;
    }
    if (url === UPSTREAM_COUNTRY_URL) {
      if (!handlers.country) throw new Error("unexpected country-code fetch");
      const res = await handlers.country();
      if (res.status >= 400) {
        throw Object.assign(new Error(`Request failed with status code ${res.status}`), {
          isAxiosError: true,
          response: res,
        });
      }
      return res;
    }
    throw new Error(`unexpected fetch url: ${url}`);
  }) as typeof axios.get;
}

describe("GET /api/v1/assignment/course-data", () => {
  test("returns converted rupee prices when country is IN", async () => {
    mockFetch({
      courses: () => jsonResponse([sampleCourse]),
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ countryCode: "IN", countrySource: "live" });
    expect(res.body.courses).toHaveLength(1);
    expect(res.body.courses[0].price).toEqual({
      currency: "INR",
      amount: 1999,
      formatted: "1999.00",
    });
    expect(res.body.courses[0].pricePaise).toBeUndefined();
    expect(res.body.courses[0].priceUsdCents).toBeUndefined();
  });

  test("returns converted dollar prices when country is US", async () => {
    mockFetch({
      courses: () => jsonResponse([sampleCourse]),
      country: () => jsonResponse({ country_code: "US" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(200);
    expect(res.body.courses[0].price).toEqual({
      currency: "USD",
      amount: 39.99,
      formatted: "39.99",
    });
  });

  test("falls back to US when the country-code call fails, but still returns courses", async () => {
    mockFetch({
      courses: () => jsonResponse([sampleCourse]),
      country: () => jsonResponse({ error: "boom" }, 500),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ countryCode: "US", countrySource: "fallback" });
    expect(res.body.courses[0].price.currency).toBe("USD");
  });

  test("falls back to US when country-code returns malformed schema", async () => {
    mockFetch({
      courses: () => jsonResponse([sampleCourse]),
      country: () => jsonResponse({ nonsense: true }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(200);
    expect(res.body.meta.countrySource).toBe("fallback");
  });

  test("returns 502 with a structured error when course-data upstream 500s", async () => {
    mockFetch({
      courses: () => jsonResponse({ error: "server error" }, 500),
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(502);
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
    expect(res.body.stack).toBeUndefined();
  });

  test("returns 502 when course-data upstream 404s", async () => {
    mockFetch({
      courses: () => jsonResponse({ error: "not found" }, 404),
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(502);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 502 when course-data upstream returns malformed schema", async () => {
    mockFetch({
      courses: () => jsonResponse([{ courseName: "Missing fields" }]),
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(502);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 200 with an empty array when upstream legitimately has zero courses", async () => {
    mockFetch({
      courses: () => jsonResponse([]),
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(200);
    expect(res.body.courses).toEqual([]);
  });

  test("does not leak a raw error/stack trace on failure", async () => {
    mockFetch({
      courses: () => {
        throw new TypeError("network down");
      },
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const res = await request(app).get(COURSE_PATH);

    expect(res.status).toBe(502);
    expect(res.text).not.toContain("TypeError");
    expect(res.text).not.toContain("at ");
  });
});

describe("in-memory caching of upstream course data", () => {
  test("reuses cached courses on the next request instead of calling upstream again", async () => {
    let courseCalls = 0;
    mockFetch({
      courses: () => {
        courseCalls += 1;
        return jsonResponse([sampleCourse]);
      },
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const first = await request(app).get(COURSE_PATH);
    const second = await request(app).get(COURSE_PATH);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(courseCalls).toBe(1);
    expect(second.body.courses).toEqual(first.body.courses);
  });

  test("calls upstream again after the cache is reset (data lost)", async () => {
    let courseCalls = 0;
    mockFetch({
      courses: () => {
        courseCalls += 1;
        return jsonResponse([sampleCourse]);
      },
      country: () => jsonResponse({ country_code: "IN" }),
    });

    await request(app).get(COURSE_PATH);
    resetCourseCache();
    await request(app).get(COURSE_PATH);

    expect(courseCalls).toBe(2);
  });

  test("does not cache a failed upstream call, and retries on the next request", async () => {
    let courseCalls = 0;
    mockFetch({
      courses: () => {
        courseCalls += 1;
        return courseCalls === 1
          ? jsonResponse({ error: "boom" }, 500)
          : jsonResponse([sampleCourse]);
      },
      country: () => jsonResponse({ country_code: "IN" }),
    });

    const first = await request(app).get(COURSE_PATH);
    const second = await request(app).get(COURSE_PATH);

    expect(first.status).toBe(502);
    expect(second.status).toBe(200);
    expect(courseCalls).toBe(2);
  });
});

describe("method restrictions on /api/v1/assignment/course-data", () => {
  for (const method of ["post", "put", "delete", "patch"] as const) {
    test(`${method.toUpperCase()} returns 405`, async () => {
      const res = await (request(app) as any)[method](COURSE_PATH);
      expect(res.status).toBe(405);
      expect(res.body.error).toBeTruthy();
    });
  }
});
