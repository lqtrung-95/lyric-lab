import { z } from "zod";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { measureWordsFor, normalizeMeasureQuery } from "@/lib/tools/find-measure-words";

export const runtime = "nodejs";

// Chỉ tra từ điển (không AI); giới hạn thô theo IP để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(240, 60 * 60 * 1000);
const bodySchema = z.object({ query: z.string().max(60) });

/** POST /api/tools/measure-words {query} → {result: {term, traditional, pinyin, meaning, classifiers:[{text,pinyin}]} | null}. Không có chữ Hán trả `no_han` (400). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  const term = normalizeMeasureQuery(parsed.data.query);
  if (!term) return Response.json({ error: "no_han" }, { status: 400 });
  try {
    const rows = await lookupWords(createSupabaseServiceClient() as never, [term]);
    return Response.json({ result: measureWordsFor(term, rows.get(term) ?? []) });
  } catch (error) {
    console.error(JSON.stringify({ event: "measure_words_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
