import { z } from "zod";
import { convertHanText, MAX_CONVERT_CHARS } from "@/lib/tools/convert-han-text";
import { createConvertDeps } from "@/lib/tools/convert-han-text-deps";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";

// Công cụ công khai, không gọi AI (chỉ tra từ điển) nên không tốn hạn mức; giới hạn thô theo IP chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(120, 60 * 60 * 1000);
const bodySchema = z.object({ text: z.string().max(MAX_CONVERT_CHARS * 4) });

/** POST /api/tools/han-to-pinyin {text} → {lines:[{tokens:[{text,pinyin,sinoViet}]}]}. Văn bản không có chữ Hán trả `no_han` (400). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  if (!/\p{Script=Han}/u.test(parsed.data.text)) return Response.json({ error: "no_han" }, { status: 400 });
  try {
    const lines = await convertHanText(parsed.data.text, createConvertDeps());
    return Response.json({ lines });
  } catch (error) {
    console.error(JSON.stringify({ event: "han_to_pinyin_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
