import type { LessonLine } from "./video-lesson-types";

export const MAX_TRANSLATION_CHARS = 500;

export interface LineEdit {
  lines: LessonLine[];
  translatedLineCount: number;
}

/**
 * Sửa bản dịch của một dòng (admin rà lại dòng dịch sai hoặc còn trống); dòng sửa tay được đánh dấu `translationBy: "admin"`. Chuỗi rỗng sau khi bỏ khoảng trắng nghĩa là xóa bản dịch.
 * Trả null nếu không có dòng `idx` hoặc bản dịch quá dài. Không sửa mảng gốc.
 */
export function withLineTranslation(lines: LessonLine[], idx: number, translation: string): LineEdit | null {
  const text = translation.replace(/\s+/g, " ").trim();
  if (text.length > MAX_TRANSLATION_CHARS || !lines.some((l) => l.idx === idx)) return null;
  // Bản do admin gõ là bản đã xác nhận: khóa khỏi việc AI dịch lại. Xóa bản dịch thì bỏ dấu.
  const next = lines.map((l) => {
    if (l.idx !== idx) return l;
    const edited: LessonLine = { ...l, translation: text === "" ? null : text, translationBy: text === "" ? undefined : "admin" };
    if (edited.translationBy === undefined) delete edited.translationBy;
    return edited;
  });
  return { lines: next, translatedLineCount: next.filter((l) => l.translation).length };
}
