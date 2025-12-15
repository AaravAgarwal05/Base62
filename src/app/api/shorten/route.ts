import { NextRequest, NextResponse } from "next/server";
import { initApp } from "@/lib/config";
import { getNextID } from "@/lib/counter/counter";
import { obfuscate } from "@/lib/encoding/obfuscation";
import { encodeBase62 } from "@/lib/encoding/base62";
import { validateURL } from "@/lib/utils/validateURL";
import { dbPool } from "@/lib/db/postgres";

initApp();

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (!body || typeof body.longUrl !== "string") {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const longURL: string = body.longUrl.trim();

    if (!validateURL(longURL)) {
        return NextResponse.json(
            { error: "Invalid URL format" },
            { status: 400 }
        );
    }

    const id = getNextID();
    const obfuscatedID = obfuscate(id);
    const code = encodeBase62(obfuscatedID);
    await dbPool.query(
        'INSERT INTO urls (id, long_url) VALUES ($1, $2)',
        [id.toString(), longURL]
    );

    const shortUrl = `${process.env.NEXT_PUBLIC_URL}/r/${code}`;

    return NextResponse.json({ code, shortUrl }, { status: 201 });
}
