import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { bufferEvent } from "@/lib/queue/analytics-buffer";

async function handler(request: Request) {
  const body = await request.json();
  const { urlId, type, timestamp } = body;

  if (!urlId || !type) {
    return Response.json({ error: "urlId and type required" }, { status: 400 });
  }

  await bufferEvent({
    urlId,
    type,
    timestamp: timestamp ?? new Date().toISOString(),
  });

  return Response.json({ ok: true });
}

export const POST = verifySignatureAppRouter(handler);
