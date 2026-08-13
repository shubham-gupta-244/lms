import { Router } from "express";
import { centsToDollars, paiseToRupees } from "../lib/pricing";
import { fetchCountryCode, fetchCourses } from "../services/upstream";
import type { Course } from "../lib/schemas";

export const courseDataRouter = Router();

const COURSE_DATA_PATH = "/api/v1/assignment/course-data";

courseDataRouter.get(COURSE_DATA_PATH, async (_req, res) => {
  let courses: Course[];
  try {
    courses = await fetchCourses();
  } catch {
    res.status(502).json({
      error: "Unable to fetch course data from the upstream service right now. Please try again.",
    });
    return;
  }

  let countryCode: string;
  let countrySource: "live" | "fallback";
  try {
    countryCode = await fetchCountryCode();
    countrySource = "live";
  } catch {
    countryCode = "US";
    countrySource = "fallback";
  }

  const currency = countryCode === "IN" ? "INR" : "USD";

  const mappedCourses = courses.map((course) => {
    const { pricePaise, priceUsdCents, ...rest } = course;
    const converted = currency === "INR" ? paiseToRupees(pricePaise) : centsToDollars(priceUsdCents);
    return {
      ...rest,
      price: { currency, ...converted },
    };
  });

  res.status(200).json({
    courses: mappedCourses,
    meta: { countryCode, countrySource },
  });
});

courseDataRouter.all(COURSE_DATA_PATH, (_req, res) => {
  res.status(405).json({ error: "Method Not Allowed" });
});
