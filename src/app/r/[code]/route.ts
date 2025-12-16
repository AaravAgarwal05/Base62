import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "@/lib/encoding/base62";
import { deobfuscate } from "@/lib/encoding/obfuscation";
import { dbPool } from "@/lib/db/postgres";
import { redisClient } from "@/lib/cache/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const cached = await redisClient.get(`url:${code}`);
    if (cached) {
      return NextResponse.redirect(cached);
    }
  } catch (err) {
    console.error("Redis cache error:", err);
  }

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

  const result = await dbPool.query("SELECT long_url FROM urls WHERE id = $1", [
    databaseId.toString(),
  ]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "URL not found." }, { status: 404 });
  }

  const longUrl = result.rows[0].long_url;

  redisClient
    .set(`url:${code}`, longUrl, {
      EX: 60 * 60 * 24,
    })
    .catch((err) => console.error("Redis set error:", err));

  return NextResponse.redirect(longUrl);
}
