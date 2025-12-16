import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "../../../../lib/encoding/base62";
import { deobfuscate } from "../../../../lib/encoding/obfuscation";
import { db } from "../../../../lib/db";
import { urls } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { redisClient } from "../../../../lib/cache/redis";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  let databaseId: bigint;

  try {
    const obfuscatedId = decodeBase62(code);
    databaseId = deobfuscate(obfuscatedId);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid code format." },
      { status: 400 }
    );
  }

  try {
    // Delete from Database
    const deletedUrls = await db
      .delete(urls)
      .where(eq(urls.id, databaseId))
      .returning();

    if (deletedUrls.length === 0) {
      return NextResponse.json({ error: "URL not found." }, { status: 404 });
    }

    // Delete from Redis Cache
    await redisClient.del(`url:${code}`);

    return NextResponse.json(
      { message: "URL deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
