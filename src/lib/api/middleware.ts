import { z } from "zod";
import { ValidationError } from "@/lib/api/errors";
import { handleError } from "@/lib/api/response";

/**
 * Wraps an API handler with error handling.
 * Catches AppError/ValidationError and returns structured JSON.
 */
export function withErrorHandler<T>(
  fn: (...args: any[]) => Promise<T>,
): (...args: any[]) => Promise<Response> {
  return async (...args: any[]) => {
    try {
      return (await fn(...args)) as unknown as Response;
    } catch (err) {
      return handleError(err);
    }
  };
}

/**
 * Parses request body against a Zod schema.
 * Throws ValidationError if body is missing or invalid.
 */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    throw new ValidationError(messages.join("; "));
  }

  return result.data;
}
