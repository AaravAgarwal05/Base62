import { describe, it, expect } from "vitest";
import { ok, created, notFound, badRequest, handleError } from "@/lib/api/response";

describe("API response helpers", () => {
  it("ok() returns 200 JSON", async () => {
    const res = ok({ hello: "world" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.hello).toBe("world");
  });

  it("created() returns 201 JSON", async () => {
    const res = created({ id: 1 });
    expect(res.status).toBe(201);
  });

  it("notFound() returns 404", async () => {
    const res = notFound("Missing");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("Missing");
  });

  it("badRequest() returns 400", async () => {
    const res = badRequest("Invalid");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });

  it("handleError() maps AppError status code", async () => {
    const { NotFoundError } = await import("@/lib/api/errors");
    const err = new NotFoundError("Not here");
    const res = handleError(err);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("Not here");
  });

  it("handleError() defaults to 500 for unknown errors", async () => {
    const res = handleError(new Error("Boom"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});
