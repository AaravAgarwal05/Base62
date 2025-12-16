import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "@/lib/encoding/base62";
import { deobfuscate } from "@/lib/encoding/obfuscation";
import { dbPool } from "@/lib/db/postgres";
import { redisClient } from "@/lib/cache/redis";

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
    const result = await dbPool.query("DELETE FROM urls WHERE id = $1", [
      databaseId.toString(),
    ]);

    if (result.rowCount === 0) {
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
