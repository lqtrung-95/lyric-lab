import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { searchWords } from "@/lib/tra-tu/server-search";

export const runtime = "nodejs";

// Từ điển là dữ liệu công khai; gợi ý khi gõ gọi liên tục nên hạn mức rộng, chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(1200, 60 * 60 * 1000);

/** GET /api/tra-tu/search?q=xihuan&limit=8 → danh sách từ khớp (đã xếp hạng). */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").slice(0, 80);
  const limit = Math.min(Math.max(Number(params.get("limit")) || 8, 1), 40);
  try {
    return Response.json({ results: await searchWords(q, limit) }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "tra_tu_search_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
