import { describe, expect, test } from "bun:test";
import { centsToDollars, paiseToRupees } from "../lib/pricing";

describe("paiseToRupees", () => {
  test("converts paise to rupees by dividing by 100", () => {
    expect(paiseToRupees(199900)).toEqual({ amount: 1999, formatted: "1999.00" });
  });

  test("keeps two decimal places for non-round values", () => {
    expect(paiseToRupees(39999)).toEqual({ amount: 399.99, formatted: "399.99" });
  });

  test("handles zero", () => {
    expect(paiseToRupees(0)).toEqual({ amount: 0, formatted: "0.00" });
  });
});

describe("centsToDollars", () => {
  test("converts cents to dollars by dividing by 100", () => {
    expect(centsToDollars(3999)).toEqual({ amount: 39.99, formatted: "39.99" });
  });

  test("keeps two decimal places for round values", () => {
    expect(centsToDollars(10000)).toEqual({ amount: 100, formatted: "100.00" });
  });
});
