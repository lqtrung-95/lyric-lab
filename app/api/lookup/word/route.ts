import type { ExampleSentence } from "@/lib/courses/course-types";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { loadWordDetail } from "@/lib/tra-tu/load-word-detail";
import { savedItemForDetail } from "@/lib/tra-tu/saved-item-for-detail";

export const runtime = "nodejs";

// Dữ liệu từ điển công khai và rẻ; giới hạn thô chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(600, 60 * 60 * 1000);
const HAN_WORD = /^\p{Script=Han}{1,8}$/u;

/**
 * GET /api/lookup/word?term=城市 → thông tin để tra nhanh một từ bấm được trong khung trò chuyện (pinyin, Hán Việt, cấp HSK, nghĩa) kèm `item`:
 * thẻ ôn sẵn sàng lưu, dựng từ MỘT câu thật trong kho video đã duyệt làm nguồn (cùng quy tắc trang Tra từ). Từ chưa có câu thật thì `item` null.
 * Pinyin, Hán Việt, cấp HSK đều từ từ điển (quy tắc 2).
 */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const term = new URL(req.url).searchParams.get("term") ?? "";
  if (!HAN_WORD.test(term)) return Response.json({ error: "invalid_term" }, { status: 400 });
  try {
    const detail = await loadWordDetail(term);
    if (!detail) return Response.json({ detail: null, item: null }, { headers: { "Cache-Control": "public, max-age=3600" } });
    const found: Record<string, ExampleSentence[]> = await loadTermSentences([detail.simplified], 1).catch(() => ({}));
    const sentences = found[detail.simplified] ?? [];
    const item = savedItemForDetail(detail, sentences[0], null);
    const main = detail.readings[0];
    return Response.json({
      detail: { term: detail.simplified, pinyin: main?.pinyin ?? "", sinoViet: detail.sinoViet, hskLevel: detail.hskLevel, gloss: detail.gloss, meanings: (main?.meanings ?? []).slice(0, 3) },
      item,
    }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "lookup_word_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
