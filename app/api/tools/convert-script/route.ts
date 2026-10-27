import { z } from "zod";
import { convertScript, MAX_SCRIPT_CHARS } from "@/lib/tools/convert-script";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";

// Công cụ công khai chỉ chạy bảng chuyển chữ (không AI, không cơ sở dữ liệu); giới hạn thô theo IP để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(240, 60 * 60 * 1000);
const bodySchema = z.object({ text: z.string().max(MAX_SCRIPT_CHARS * 2), mode: z.enum(["s2t", "s2tw", "s2hk", "t2s"]) });

/** POST /api/tools/convert-script {text, mode} → {output, changed, check:[{char,options}]}. Văn bản không có chữ Hán trả `no_han` (400). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  if (!/\p{Script=Han}/u.test(parsed.data.text)) return Response.json({ error: "no_han" }, { status: 400 });
  return Response.json(convertScript(parsed.data.text, parsed.data.mode));
}
