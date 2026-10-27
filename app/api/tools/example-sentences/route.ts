import { z } from "zod";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { EXAMPLES_PER_QUERY, normalizeExampleQuery, toExampleItems } from "@/lib/tools/example-sentences";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { formatMeanings } from "@/lib/tra-tu/format-meanings";

export const runtime = "nodejs";

// Chỉ tra chỉ mục và từ điển (không AI); giới hạn thô theo IP để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(240, 60 * 60 * 1000);
const bodySchema = z.object({ query: z.string().max(40) });

/** POST /api/tools/example-sentences {query} → {term, pinyin, meaning, sentences:[{text,pinyin,translation,watchPath}]}. Câu lấy từ video đã duyệt (chỉ từ HSK có trong chỉ mục); không có chữ Hán trả `no_han` (400). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  const term = normalizeExampleQuery(parsed.data.query);
  if (!term) return Response.json({ error: "no_han" }, { status: 400 });
  try {
    const [sentences, words] = await Promise.all([
      loadTermSentences([term], EXAMPLES_PER_QUERY),
      lookupWords(createSupabaseServiceClient() as never, [term]),
    ]);
    const row = pickPrimaryEntry([...(words.get(term) ?? [])]);
    return Response.json({
      term,
      pinyin: row?.pinyin ?? null,
      meaning: row ? formatMeanings(row.meanings).senses.slice(0, 2).join("; ") : null,
      sentences: toExampleItems(sentences[term] ?? []),
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "example_sentences_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
