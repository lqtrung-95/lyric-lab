import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";

// Tra từ điển là dữ liệu công khai và rẻ; giới hạn thô chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(600, 60 * 60 * 1000);
const HAN_WORD = /^\p{Script=Han}{1,8}$/u;

/** GET /api/lookup?term=城市 → thông tin từ điển của từ (hoặc `entry: null` nếu không có). */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const term = new URL(req.url).searchParams.get("term") ?? "";
  if (!HAN_WORD.test(term)) return Response.json({ error: "invalid_term" }, { status: 400 });

  try {
    const entry = await lookupTermEntry(term);
    return Response.json({ entry }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "lookup_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
