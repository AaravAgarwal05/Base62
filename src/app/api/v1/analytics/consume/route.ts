import { bufferEvent } from "@/lib/queue/analytics-buffer";

interface AnalyticsEventBody {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
  ip?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
}

async function handlerInner(request: Request) {
  const body: AnalyticsEventBody = await request.json();
  const {
    urlId,
    type,
    timestamp,
    ip,
    userAgent,
    referrer,
    country,
    city,
    region,
    browser,
    os,
    device,
  } = body;

  if (!urlId || !type) {
    return Response.json({ error: "urlId and type required" }, { status: 400 });
  }

  await bufferEvent({
    urlId,
    type,
    timestamp: timestamp ?? new Date().toISOString(),
    ip: ip ?? null,
    userAgent: userAgent ?? null,
    referrer: referrer ?? null,
    country: country ?? null,
    city: city ?? null,
    region: region ?? null,
    browser: browser ?? null,
    os: os ?? null,
    device: device ?? null,
  });

  return Response.json({ ok: true });
}

/* ─── Lazy-import QStash verify to avoid build-time signing key requirement ─── */
export const POST = async (request: Request) => {
  const { verifySignatureAppRouter } = await import("@upstash/qstash/nextjs");
  const wrapped = verifySignatureAppRouter(handlerInner);
  return wrapped(request);
};
