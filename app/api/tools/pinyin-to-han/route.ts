import { z } from "zod";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { searchWords } from "@/lib/tra-tu/server-search";
import { filterByTone, MAX_PINYIN_RESULTS, normalizePinyinQuery, toPinyinResults } from "@/lib/tools/pinyin-to-han";

export const runtime = "nodejs";

// Chỉ tra từ điển (không AI); giới hạn thô theo IP để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(240, 60 * 60 * 1000);
const bodySchema = z.object({ query: z.string().max(120) });

/** POST /api/tools/pinyin-to-han {query} → {results: [{han, traditional, pinyin, meaning, sinoViet, gloss, hskLevel}], relaxed}; relaxed=true khi gõ thanh mà không từ nào đúng thanh (danh sách là các từ cùng âm). Pinyin không hợp lệ trả `invalid_pinyin` (400). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  const query = normalizePinyinQuery(parsed.data.query);
  if (!query) return Response.json({ error: "invalid_pinyin" }, { status: 400 });
  try {
    const words = await searchWords(query, MAX_PINYIN_RESULTS * 2);
    const { results, relaxed } = filterByTone(query, toPinyinResults(words, MAX_PINYIN_RESULTS * 2));
    return Response.json({ results: results.slice(0, MAX_PINYIN_RESULTS), relaxed });
  } catch (error) {
    console.error(JSON.stringify({ event: "pinyin_to_han_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
