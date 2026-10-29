import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { GrammarPattern } from "./grammar-types";

/** Mẫu có các từ khoá thay thế nhau (không nối bằng "…"): mặt thẻ ôn dùng dấu "/". */
const ALTERNATIVES: Record<string, string> = {
  "you-meiyou": "有/没有", "xiang-yao": "想/要", "question-words": "什么/谁", "danshi": "但是/可是", "rang-jiao": "让/叫",
  "measure-word": "个/本/杯", "word-order-basic": "时间+地点+动词", "jiu-cai": "就/才", "geng-hai": "更/还",
};

/** Chữ Hán hiện ở mặt trước thẻ ôn: khung của mẫu, ví dụ 把, 因为…所以. */
export const grammarCardTerm = (p: GrammarPattern): string => ALTERNATIVES[p.id] ?? p.key.join("…");

/** Thẻ ôn FSRS cho một mẫu ngữ pháp (không có câu bài hát làm nguồn; mặt sau hiện công thức và giải thích ngắn). */
export function grammarSavedItem(p: GrammarPattern, now = Date.now()): SavedItem {
  const term = grammarCardTerm(p);
  return {
    key: itemKey({ type: "grammar", term }), videoId: "", type: "grammar", term, lineIndex: 0, start: 0, savedAt: now,
    reading: p.pattern, level: p.level, meaning: p.explain.split(/(?<=[.!?])\s/)[0] ?? p.explain,
  };
}
