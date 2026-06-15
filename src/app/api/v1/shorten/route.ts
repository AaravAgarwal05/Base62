import { NextRequest, NextResponse } from "next/server";
import { initApp } from "@/lib/init";
import { getNextID } from "@/lib/counter/counter";
import { obfuscate } from "@/lib/encoding/obfuscation";
import { encodeBase62 } from "@/lib/encoding/base62";
import { handleError } from "@/lib/api/response";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { createUrlSchema } from "@/lib/validation/url";
import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const parsed = createUrlSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json(
        { error: first },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const { longUrl: longURL, slug } = parsed.data;

    let code: string;

    if (slug) {
      // Custom slug — check uniqueness
      const existing = await db
        .select({ id: urls.id })
        .from(urls)
        .where(eq(urls.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 409, headers: rateLimitHeaders },
        );
      }

      const id = await getNextID();
      code = slug;

      await db.insert(urls).values({
        id,
        longUrl: longURL,
        slug,
      });
    } else {
      // Auto-generated code
      const id = await getNextID();
      const obfuscatedID = obfuscate(id);
      code = encodeBase62(obfuscatedID);

      await db.insert(urls).values({
        id,
        longUrl: longURL,
      });
    }

    const shortUrl = `${process.env.NEXT_PUBLIC_URL}/r/${code}`;

    return NextResponse.json(
      { code, shortUrl, ...(slug ? { slug } : {}) },
      { status: 201, headers: rateLimitHeaders },
    );
  } catch (err) {
    return handleError(err);
  }
}
