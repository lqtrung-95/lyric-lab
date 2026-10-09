import type { LessonLine } from "./video-lesson-types";

/**
 * Khôi phục bản dịch cũ của một dòng mà AI đã dịch lại sau khi bị báo sai (admin thấy bản AI tệ hơn hoặc bị người phá). Dòng được đánh dấu
 * `translationBy: "admin"` nên không bị AI dịch lại lần nữa dù bị báo tiếp. Trả null (không đổi gì) nếu không có dòng, bản cũ rỗng, hoặc dòng
 * không còn là bản AI (đã được admin sửa/khôi phục trong lúc đó). Không sửa mảng gốc.
 */
export function restoreLineTranslation(lines: LessonLine[], idx: number, oldTranslation: string | null): LessonLine[] | null {
  const old = (oldTranslation ?? "").trim();
  const line = lines.find((l) => l.idx === idx);
  if (!old || !line || line.translationBy !== "ai") return null;
  return lines.map((l) => (l.idx === idx ? { ...l, translation: old, translationBy: "admin" as const } : l));
}
