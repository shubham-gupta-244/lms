import { describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../app";

describe("GET /healthz", () => {
  test("returns 200 without touching the upstream service", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
