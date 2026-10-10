import type { LessonLine } from "./video-lesson-types";

export interface AppliedRetranslation {
  lines: LessonLine[];
  translatedLineCount: number;
  /** Số dòng vừa được thay bằng bản AI. */
  replaced: number;
  /** Số dòng đủ điều kiện nhưng chưa được dịch lại (đoạn lỗi hoặc quá hạn chót), còn giữ bản cũ: bấm lại để dịch tiếp. */
  remaining: number;
}

/** Dòng được dịch lại: chưa có người chốt bản dịch. Dòng admin đã sửa/khôi phục và dòng AI đã dịch lại (kể cả lần bấm trước) được giữ nguyên. */
export const canRetranslate = (l: LessonLine) => l.translationBy !== "admin" && l.translationBy !== "ai";

/**
 * Áp kết quả dịch lại toàn bộ (cùng thứ tự và số dòng với `before`): thay bản dịch của các dòng đủ điều kiện bằng bản AI mới và đánh dấu `translationBy: "ai"`.
 * Dòng nào AI chưa dịch được thì GIỮ bản cũ (không để trống). Không sửa mảng gốc.
 */
export function applyRetranslation(before: LessonLine[], fresh: { translation: string | null }[]): AppliedRetranslation {
  let replaced = 0;
  let remaining = 0;
  const lines = before.map((l, i) => {
    if (!canRetranslate(l)) return l;
    const next = fresh[i]?.translation?.trim();
    if (!next) { remaining++; return l; }
    replaced++;
    return { ...l, translation: next, translationBy: "ai" as const };
  });
  return { lines, translatedLineCount: lines.filter((l) => l.translation).length, replaced, remaining };
}
