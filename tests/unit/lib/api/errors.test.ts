import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  RateLimitError,
} from "@/lib/api/errors";

describe("API errors", () => {
  it("AppError has correct shape", () => {
    const err = new AppError(400, "BAD_REQUEST", "Something went wrong");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Something went wrong");
    expect(err.name).toBe("AppError");
  });

  it("NotFoundError defaults to 404", () => {
    const err = new NotFoundError("User not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("ValidationError defaults to 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("UnauthorizedError defaults to 401", () => {
    const err = new UnauthorizedError("Login required");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("RateLimitError defaults to 429", () => {
    const err = new RateLimitError("Too many requests");
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
  });

  it("errors are instanceof AppError and Error", () => {
    const err = new NotFoundError("test");
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });
});
