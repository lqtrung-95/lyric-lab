import { Rating, type Grade } from "ts-fsrs";
import type { PinyinResult } from "./pinyin-answer";

export type PracticeOutcome = "correct" | "partial" | "wrong";

/** Kết quả gõ pinyin → kết quả chung của một lượt trả lời. */
export const outcomeFromPinyin = (r: PinyinResult): PracticeOutcome => (r === "exact" ? "correct" : r === "wrong" ? "wrong" : "partial");

/**
 * Mức FSRS cho một câu trả lời trong game. Không bao giờ cho "Dễ": trả lời nhanh không chứng minh nhớ lâu,
 * "Dễ" chỉ có ở ôn thẻ chuẩn. Đúng = Được, đúng âm nhưng thiếu/sai thanh = Khó, sai = Quên.
 */
export function gradeFromOutcome(outcome: PracticeOutcome): Grade {
  return outcome === "correct" ? Rating.Good : outcome === "partial" ? Rating.Hard : Rating.Again;
}

/**
 * Thẻ có được tính vào lịch ôn không: chỉ thẻ ĐÃ HỌC và ĐÃ ĐẾN HẠN. Thẻ mới chỉ vào lịch qua ôn chuẩn để giữ hạn mức thẻ mới mỗi ngày.
 * Sau khi chấm, hạn dời ra tương lai nên cùng một thẻ không bị chấm hai lần trong một buổi.
 */
export const isGradable = (card: { state: number; due: string }, now: Date): boolean => card.state !== 0 && Date.parse(card.due) <= now.getTime();

/** Điểm của một câu gõ pinyin: đúng hoàn toàn 100, đúng âm thiếu/sai thanh 50; trừ 20 mỗi gợi ý (tối thiểu 20 nếu không sai); cộng combo. */
export function pinyinPoints(outcome: PracticeOutcome, hintsUsed: number, combo: number): number {
  if (outcome === "wrong") return 0;
  const base = outcome === "correct" ? 100 : 50;
  return Math.max(20, base - 20 * hintsUsed) + Math.min(combo, 10) * 5;
}
