import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime = process.uptime ? Math.floor(process.uptime()) : 0;

  return ok({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime,
  });
}
