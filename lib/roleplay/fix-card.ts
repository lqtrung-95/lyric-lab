import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";

export interface FixFeedback { issue: string; better: string; betterVi?: string; pinyin?: string }

/**
 * Thẻ ôn cho CÂU ĐÃ SỬA của AI (loại "grammar", videoId rỗng): mặt trước là câu đúng, mặt sau pinyin và nghĩa. Dùng loại "grammar" để câu dài không lọt vào các game luyện từ
 * (game chỉ lấy thẻ từ vựng). Chưa có bản dịch thì dùng lời giải thích lỗi làm nghĩa.
 */
export function fixSavedItem(f: FixFeedback, now = Date.now()): SavedItem {
  const term = f.better.trim();
  return { key: itemKey({ type: "grammar", term }), videoId: "", type: "grammar", term, lineIndex: 0, start: 0, savedAt: now, reading: f.pinyin, level: null, meaning: f.betterVi ?? f.issue };
}

/** Thẻ là một câu hoàn chỉnh (không phải mẫu ngữ pháp dạng khung): nhiều chữ Hán, không có "…". */
export const isSentenceTerm = (term: string): boolean => (term.match(/\p{Script=Han}/gu) ?? []).length >= 7 && !term.includes("…");
