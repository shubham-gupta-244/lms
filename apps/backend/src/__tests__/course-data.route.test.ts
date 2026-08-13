import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../app";

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(handlers: {
  courses?: () => Response | Promise<Response>;
  country?: () => Response | Promise<Response>;
}) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url === UPSTREAM_COURSE_URL) {
      if (!handlers.courses) throw new Error("unexpected course-data fetch");
      return handlers.courses();
    }
    if (url === UPSTREAM_COUNTRY_URL) {
      if (!handlers.country) throw new Error("unexpected country-code fetch");
      return handlers.country();
    }
    throw new Error(`unexpected fetch url: ${url}`);
  }) as typeof fetch;
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

describe("method restrictions on /api/v1/assignment/course-data", () => {
  for (const method of ["post", "put", "delete", "patch"] as const) {
    test(`${method.toUpperCase()} returns 405`, async () => {
      const res = await (request(app) as any)[method](COURSE_PATH);
      expect(res.status).toBe(405);
      expect(res.body.error).toBeTruthy();
    });
  }
});
