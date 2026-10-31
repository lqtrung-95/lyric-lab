import type { SavedItem } from "@/lib/user-state/learner-state";
import type { RadicalEntry } from "./radicals";

export const radicalCardKey = (e: Pick<RadicalEntry, "char">) => `radical:${e.char}`;
export const isRadicalCardKey = (key: string) => key.startsWith("radical:");

/**
 * Thẻ ôn FSRS cho một bộ thủ (loại "grammar", videoId rỗng) để không lọt vào game luyện từ. Khóa riêng `radical:<chữ>` để không đụng thẻ ngữ pháp cùng chữ (ví dụ 比).
 * Mặt sau: pinyin trong `reading`, nghĩa là "bộ Nhân: người".
 */
export function radicalSavedItem(e: RadicalEntry, now = Date.now()): SavedItem {
  return { key: radicalCardKey(e), videoId: "", type: "grammar", term: e.char, lineIndex: 0, start: 0, savedAt: now, reading: e.pinyin, level: null, meaning: `Bộ ${e.name}: ${e.meaning}` };
}
