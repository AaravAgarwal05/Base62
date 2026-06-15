import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

export async function POST() {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "QSTASH_TOKEN not set" },
      { status: 400 }
    );
  }

  try {
    const client = new Client({ token });
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_URL not set" },
        { status: 400 }
      );
    }

    // Create recurring schedule every 1 minute
    const schedule = await client.schedules.create({
      destination: `${baseUrl}/api/v1/analytics/flush`,
      cron: "* * * * *",
      method: "POST",
      retries: 0,
    });

    return NextResponse.json({
      ok: true,
      scheduleId: schedule.scheduleId,
    });
  } catch (error: any) {
    console.error("[QStash Setup] Failed:", error);
    return NextResponse.json(
      { error: error.message ?? "Setup failed" },
      { status: 500 }
    );
  }
}
