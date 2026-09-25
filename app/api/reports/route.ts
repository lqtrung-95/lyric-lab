import { reportRequestSchema } from "@/lib/analysis/report-schema";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

// 30 báo sai/ngày/IP (lớp chặn thô, xem ghi chú trong InMemoryRateLimiter).
const limiter = new InMemoryRateLimiter(30, 24 * 60 * 60 * 1000);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = reportRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const { videoId, promptVersion, itemId, reason } = parsed.data;
  const { error } = await createSupabaseServiceClient()
    .from("item_reports")
    .insert({ video_id: videoId, prompt_version: promptVersion, item_id: itemId, reason });
  if (error) {
    console.error(JSON.stringify({ event: "report_error", videoId, message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
