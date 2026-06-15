import { NextResponse } from "next/server";
import { AppError } from "@/lib/api/errors";

/* ─── Success ─── */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/* ─── Errors ─── */
export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/* ─── Catch-all (handles AppError instances) ─── */
export function handleError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.statusCode },
    );
  }

  console.error("[API] Unhandled error:", err);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}
