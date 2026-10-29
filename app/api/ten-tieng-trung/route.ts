import { convertName, joinHan } from "@/lib/names/chinese-name";
import { NAME_PINYIN } from "@/lib/names/name-data";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { nameSummaryModels } from "@/lib/names/name-summary-models";
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
  const summary = han ? await summaryFor(request, han, parts) : { text: null, source: "none" };
  return Response.json({ parts: withPinyin, han, pinyin: withPinyin.every((p) => p.pinyin) ? withPinyin.map((p) => p.pinyin).join(" ") : null, summary: summary.text, summarySource: summary.source }, { headers: { "Cache-Control": "no-store" } });
}

/** Nguồn của câu tóm tắt để chẩn đoán (không chứa dữ liệu người dùng): model đã trả lời, bộ nhớ đệm, hoặc lý do dùng câu dự phòng. */
interface Summary { text: string | null; source: string }

/**
 * Một câu tóm tắt ý nghĩa cả tên. Có cache theo chữ Hán; hết lượt theo IP, quá thời gian hoặc model lỗi thì dùng câu liệt kê nghĩa dự phòng (luôn có chữ để hiện).
 * Lỗi từng model được ghi log có cấu trúc (chỉ tên model và thông báo lỗi đã cắt ngắn, không có khóa hay tên người dùng) để xem trên Vercel.
 */
async function summaryFor(request: Request, han: string, parts: ReturnType<typeof convertName>): Promise<Summary> {
  const cached = summaryCache.get(han);
  if (cached) return { text: cached, source: "cache" };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ipLimiter.tryConsume(ip)) return { text: fallbackSummary(parts), source: "fallback:rate_limited" };
  try {
    const env = getServerEnv();
    const out = await Promise.race([
      summarizeName(parts, createChat(env), nameSummaryModels(env), (model, message) => console.error(JSON.stringify({ event: "name_summary_model_error", model, message: message.slice(0, 160) }))),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), SUMMARY_TIMEOUT_MS)),
    ]);
    if (!out) { console.error(JSON.stringify({ event: "name_summary_timeout", ms: SUMMARY_TIMEOUT_MS })); return { text: fallbackSummary(parts), source: "fallback:timeout" }; }
    if (out.ai) { if (summaryCache.size >= SUMMARY_CACHE_MAX) summaryCache.clear(); summaryCache.set(han, out.text); }
    return { text: out.text, source: out.ai ? `ai:${out.model}` : "fallback:no_model" };
  } catch {
    return { text: fallbackSummary(parts), source: "fallback:error" };
  }
}
