import { convertName, joinHan } from "@/lib/names/chinese-name";
import { NAME_PINYIN } from "@/lib/names/name-data";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { fallbackSummary, summarizeName } from "@/lib/names/name-summary";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";
export const maxDuration = 30;

// Trang công khai nên chặn thô theo IP; câu tóm tắt chỉ phụ thuộc các chữ Hán (không phụ thuộc tên gõ vào) nên nhớ theo chuỗi chữ Hán: tên phổ biến không tốn thêm lượt gọi model.
const ipLimiter = new InMemoryRateLimiter(40, 60 * 60 * 1000);
const summaryCache = new Map<string, string>();
const SUMMARY_CACHE_MAX = 2000;
const SUMMARY_TIMEOUT_MS = 9000;

/**
 * POST /api/ten-tieng-trung {name} → tên Hán gợi ý kèm pinyin từng chữ. Chữ Hán và nghĩa lấy từ bảng gợi ý (lib/names), pinyin tra từ ĐIỂN (quy tắc 2).
 * Dùng POST để tên người dùng không nằm trong URL và nhật ký truy cập. Lỗi tra từ điển thì chữ đó thiếu pinyin (giao diện vẫn hiện chữ Hán).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const parts = typeof body?.name === "string" ? convertName(body.name) : [];
  if (parts.length === 0) return Response.json({ error: "bad_name" }, { status: 400 });
  const withPinyin = await Promise.all(parts.map(async (p) => {
    if (!p.han) return { ...p, pinyin: null };
    if (NAME_PINYIN[p.han]) return { ...p, pinyin: NAME_PINYIN[p.han] };
    const entry = await lookupTermEntry(p.han).catch(() => null);
    return { ...p, pinyin: entry?.pinyin ?? null };
  }));
  const han = joinHan(parts);
  const summary = han ? await summaryFor(request, han, parts) : null;
  return Response.json({ parts: withPinyin, han, pinyin: withPinyin.every((p) => p.pinyin) ? withPinyin.map((p) => p.pinyin).join(" ") : null, summary }, { headers: { "Cache-Control": "no-store" } });
}

/** Một câu tóm tắt ý nghĩa cả tên. Có cache theo chữ Hán; hết lượt theo IP, quá thời gian hoặc model lỗi thì dùng câu ghép nghĩa dự phòng (luôn có chữ để hiện). */
async function summaryFor(request: Request, han: string, parts: ReturnType<typeof convertName>): Promise<string | null> {
  const cached = summaryCache.get(han);
  if (cached) return cached;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ipLimiter.tryConsume(ip)) return fallbackSummary(parts);
  try {
    const out = await Promise.race([
      summarizeName(parts, createChat(getServerEnv()), EXPLAIN_MODELS),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), SUMMARY_TIMEOUT_MS)),
    ]);
    if (!out) return fallbackSummary(parts);
    if (out.ai) { if (summaryCache.size >= SUMMARY_CACHE_MAX) summaryCache.clear(); summaryCache.set(han, out.text); }
    return out.text;
  } catch {
    return fallbackSummary(parts);
  }
}
