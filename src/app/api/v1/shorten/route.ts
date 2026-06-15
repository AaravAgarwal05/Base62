import { NextRequest, NextResponse } from "next/server";
import { initApp } from "@/lib/init";
import { getNextID } from "@/lib/counter/counter";
import { obfuscate } from "@/lib/encoding/obfuscation";
import { encodeBase62 } from "@/lib/encoding/base62";
import { validateURL } from "@/lib/utils/validateURL";
import { handleError } from "@/lib/api/response";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    await initApp();

    // Rate limit by client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitHeaders = await applyRateLimit("shorten", ip);

    const body = await request.json();

    if (!body || typeof body.longUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const longURL: string = body.longUrl.trim();

    if (!validateURL(longURL)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const id = await getNextID();
    const obfuscatedID = obfuscate(id);
    const code = encodeBase62(obfuscatedID);

    await db.insert(urls).values({
      id: id,
      longUrl: longURL,
    });

    const shortUrl = `${process.env.NEXT_PUBLIC_URL}/r/${code}`;

    return NextResponse.json(
      { code, shortUrl },
      { status: 201, headers: rateLimitHeaders },
    );
  } catch (err) {
    return handleError(err);
  }
}
