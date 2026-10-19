import { loadUnit } from "@/lib/courses/load-unit";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";

// Nội dung chặng là dữ liệu công khai, chỉ đọc; giới hạn thô theo IP chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(600, 60 * 60 * 1000);
const SLUG = /^[a-z0-9-]{1,40}$/;

/** GET /api/courses/hsk-1/3 → chặng 3 của khóa: từ (pinyin, Hán Việt, nghĩa Việt) và câu ví dụ thật từ video đã duyệt. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; idx: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const { slug, idx } = await params;
  const n = Number(idx);
  if (!SLUG.test(slug) || !Number.isInteger(n) || n < 1 || n > 500) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const unit = await loadUnit(slug, n);
    if (!unit) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json(unit, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "course_unit_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
