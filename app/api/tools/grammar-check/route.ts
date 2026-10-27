import { z } from "zod";
import { createChat } from "@/lib/analysis/server-deps";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { getServerEnv } from "@/lib/env/server-env";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { convertHanText, joinField } from "@/lib/tools/convert-han-text";
import { createConvertDeps } from "@/lib/tools/convert-han-text-deps";
import { checkGrammar, cleanSentence, GrammarError } from "@/lib/tools/grammar-check/check-grammar";
import { MAX_GRAMMAR_CHARS, type GrammarOutput } from "@/lib/tools/grammar-check/grammar-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

// Công cụ công khai nhưng có gọi AI nên giới hạn chặt: mỗi IP 15 lượt/ngày, và một trần chung cho cả máy chủ để chi phí không vượt tầm kiểm soát.
const ipLimiter = new InMemoryRateLimiter(15, 24 * 60 * 60 * 1000);
const globalLimiter = new InMemoryRateLimiter(1500, 24 * 60 * 60 * 1000);
// Cùng một câu hỏi lại thì dùng kết quả cũ (không tốn lượt và không tốn token).
const cache = new TtlCache<GrammarOutput & { model: string }>(60 * 60 * 1000, 300);
const bodySchema = z.object({ sentence: z.string().max(MAX_GRAMMAR_CHARS * 3) });

/** Pinyin (từ từ điển, không phải do AI viết) của các câu chữ Hán trong kết quả. */
async function pinyinOf(text: string | undefined): Promise<string | null> {
  if (!text) return null;
  const lines = await convertHanText(text, createConvertDeps());
  return joinField(lines, "pinyin");
}

/** POST /api/tools/grammar-check {sentence} → {result: {verdict, minimalFix?, natural, summary, issues, pinyin:{minimalFix, natural}}}. Lỗi: invalid_sentence (400), rate_limited (429), check_failed (502). */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  const sentence = cleanSentence(parsed.data.sentence);
  if (!sentence) return Response.json({ error: "invalid_sentence" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    let result = cache.get(sentence);
    if (!result) {
      result = await checkGrammar(sentence, {
        chat: createChat(getServerEnv()),
        models: EXPLAIN_MODELS,
        allowLlmCall: () => ipLimiter.tryConsume(ip) && globalLimiter.tryConsume("all"),
      });
      cache.set(sentence, result);
    }
    const [minimalFix, natural] = await Promise.all([pinyinOf(result.minimalFix), pinyinOf(result.natural)]);
    return Response.json({ result: { ...result, pinyin: { minimalFix, natural } } });
  } catch (error) {
    if (error instanceof GrammarError) return Response.json({ error: error.code }, { status: error.code === "rate_limited" ? 429 : error.code === "invalid_sentence" ? 400 : 502 });
    console.error(JSON.stringify({ event: "grammar_check_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
