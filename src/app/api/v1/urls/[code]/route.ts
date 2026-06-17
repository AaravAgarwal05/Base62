import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "@/lib/encoding/base62";
import { deobfuscate } from "@/lib/encoding/obfuscation";
import { db } from "@/lib/db";
import { urls, analytics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redisClient } from "@/lib/cache/redis";
import { CACHE_KEYS } from "@/lib/cache/keys";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Try slug lookup first
  const slugMatch = await db
    .select({ id: urls.id })
    .from(urls)
    .where(eq(urls.slug, code))
    .limit(1);

  let databaseId: bigint;

  if (slugMatch.length > 0) {
    databaseId = slugMatch[0].id;
  } else {
    // Fallback to legacy ID-based decode
    try {
      const obfuscatedId = decodeBase62(code);
      databaseId = deobfuscate(obfuscatedId);
    } catch {
      return NextResponse.json(
        { error: "Invalid code format." },
        { status: 400 },
      );
    }
  }

  try {
    // Delete analytics first (FK constraint)
    await db.delete(analytics).where(eq(analytics.urlId, databaseId));

    // Delete URL
    const deletedUrls = await db
      .delete(urls)
      .where(eq(urls.id, databaseId))
      .returning();

    if (deletedUrls.length === 0) {
      return NextResponse.json({ error: "URL not found." }, { status: 404 });
    }

    // Delete from Redis cache (both key formats)
    await redisClient.del(CACHE_KEYS.url(code));
    await redisClient.del(`slug:${code}`);

    return NextResponse.json(
      { message: "URL deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
