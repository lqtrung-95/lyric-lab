import { JOURNEYS } from "@/lib/explore/journeys";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";

export const runtime = "nodejs";

/**
 * GET /api/explore/journeys-pinyin → {pinyin: {câu tiếng Trung: pinyin}} cho tên và câu hướng dẫn của mọi hành trình. Pinyin tra từ TỪ ĐIỂN (quy tắc 2).
 * Công khai và không phụ thuộc người dùng nên cache CDN một ngày; lỗi tra từ điển thì rỗng (giao diện chỉ thiếu dòng pinyin).
 */
export async function GET() {
  const texts = JOURNEYS.flatMap((j) => [j.title.zh, ...j.steps.map((s) => s.zh)]);
  const pinyin = await annotatePinyin(texts);
  const ok = Object.keys(pinyin).length > 0;
  return Response.json({ pinyin }, { headers: { "Cache-Control": ok ? "public, s-maxage=86400, stale-while-revalidate=604800" : "no-store" } });
}
