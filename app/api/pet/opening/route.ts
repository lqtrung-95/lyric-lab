import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { findScenario } from "@/lib/roleplay/scenarios";

export const runtime = "nodejs";

/**
 * GET /api/pet/opening → {zh, pinyin} của câu mở đầu cố định khi nói chuyện với pet. Pinyin tra từ TỪ ĐIỂN (quy tắc 2), không do AI sinh.
 * Công khai và không phụ thuộc người dùng nên cache CDN một ngày; lỗi tra từ điển thì pinyin rỗng (giao diện chỉ thiếu dòng pinyin).
 */
export async function GET() {
  const zh = findScenario("pet")?.opening.zh ?? "";
  const pinyin = (await annotatePinyin([zh]))[zh] ?? "";
  return Response.json({ zh, pinyin }, { headers: { "Cache-Control": pinyin ? "public, s-maxage=86400, stale-while-revalidate=604800" : "no-store" } });
}
