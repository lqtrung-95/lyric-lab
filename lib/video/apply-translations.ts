import type { LessonLine } from "./video-lesson-types";

export interface AppliedTranslations {
  lines: LessonLine[];
  translatedLineCount: number;
  /** Số dòng vừa được điền bản dịch (trước đó trống). */
  newlyTranslated: number;
}

/**
 * Áp kết quả dịch bù (cùng thứ tự và số dòng với `before`) vào các dòng còn trống. Chỉ điền dòng trước đó chưa có bản dịch, giữ nguyên dòng đã có
 * (kể cả bản admin đã sửa), và đánh dấu dòng mới điền là bản AI. Không sửa mảng gốc.
 */
export function applyTranslations(before: LessonLine[], translated: { translation: string | null }[]): AppliedTranslations {
  let newlyTranslated = 0;
  const lines = before.map((l, i) => {
    const fresh = translated[i]?.translation?.trim();
    if (l.translation || !fresh) return l;
    newlyTranslated++;
    return { ...l, translation: fresh, translationBy: "ai" as const };
  });
  return { lines, translatedLineCount: lines.filter((l) => l.translation).length, newlyTranslated };
}
