import { z } from "zod";

export const CourseSchema = z.object({
  courseName: z.string(),
  courseCode: z.string(),
  description: z.string(),
  mainCategory: z.string(),
  shortCourse: z.string(),
  courseType: z.string(),
  pricePaise: z.number(),
  priceUsdCents: z.number(),
  mangoId: z.string(),
  refundable: z.boolean(),
});

export const CourseListSchema = z.array(CourseSchema);

export type Course = z.infer<typeof CourseSchema>;

export const CountryCodeSchema = z.object({
  country_code: z.string(),
});
