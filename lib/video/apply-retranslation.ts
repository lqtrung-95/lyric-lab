import type { LessonLine } from "./video-lesson-types";

export interface AppliedRetranslation {
  lines: LessonLine[];
  translatedLineCount: number;
  /** Số dòng vừa được thay bằng bản AI. */
  replaced: number;
  /** Số dòng đủ điều kiện nhưng chưa được dịch lại (đoạn lỗi hoặc quá hạn chót), còn giữ bản cũ: bấm lại để dịch tiếp. */
  remaining: number;
}

/**
 * Dòng được dịch lại: dòng admin đã sửa/khôi phục luôn được giữ nguyên. Mặc định dòng AI đã dịch lại cũng được giữ (để bấm lại thì dịch tiếp phần còn dở);
 * `includeAi` = true khi muốn làm lại cả bản AI cũ bằng model tốt hơn.
 */
export const canRetranslate = (l: LessonLine, includeAi = false) => l.translationBy !== "admin" && (includeAi || l.translationBy !== "ai");

/**
 * Áp kết quả dịch lại toàn bộ (cùng thứ tự và số dòng với `before`): thay bản dịch của các dòng đủ điều kiện bằng bản AI mới và đánh dấu `translationBy: "ai"`.
 * Dòng nào AI chưa dịch được thì GIỮ bản cũ (không để trống). Không sửa mảng gốc.
 */
export function applyRetranslation(before: LessonLine[], fresh: { translation: string | null }[], includeAi = false): AppliedRetranslation {
  let replaced = 0;
  let remaining = 0;
  const lines = before.map((l, i) => {
    if (!canRetranslate(l, includeAi)) return l;
    const next = fresh[i]?.translation?.trim();
    if (!next) { remaining++; return l; }
    replaced++;
    return { ...l, translation: next, translationBy: "ai" as const };
  });
  return { lines, translatedLineCount: lines.filter((l) => l.translation).length, replaced, remaining };
}
