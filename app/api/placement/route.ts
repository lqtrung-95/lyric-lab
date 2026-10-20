import { loadPlacementQuestions } from "@/lib/courses/load-placement";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";

const limiter = new InMemoryRateLimiter(60, 60 * 60 * 1000);

/** GET → bài xếp lớp (30 câu, 5 câu mỗi cấp HSK 1–6). Dữ liệu công khai; mỗi lần gọi lấy mẫu khác nhau nên không đệm. */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  try {
    const questions = await loadPlacementQuestions();
    if (questions.length === 0) return Response.json({ error: "not_available" }, { status: 503 });
    return Response.json({ questions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "placement_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
