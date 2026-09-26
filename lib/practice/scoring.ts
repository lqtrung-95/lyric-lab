import type { PracticeOutcome } from "./practice-grade";

export type PracticeMode = "pinyin" | "cloze" | "listen" | "match" | "karaoke";

const BASE = 100;
const COMBO_STEP = 5;
const COMBO_CAP = 10;

/** Điểm một câu trả lời đúng ở các chế độ chọn đáp án (Điền lời, Nghe và chọn, Karaoke): 100 + 5 điểm mỗi combo (tối đa +50). */
export const answerPoints = (outcome: PracticeOutcome, combo: number): number =>
  outcome === "correct" ? BASE + Math.min(combo, COMBO_CAP) * COMBO_STEP : 0;

/** Điểm một vòng Ghép cặp: 200, cộng thưởng tốc độ (tối đa 240, mất 4 điểm mỗi giây), trừ 25 mỗi lần nhầm; tối thiểu 50. */
export const matchPoints = (seconds: number, mistakes: number): number =>
  Math.max(50, 200 + Math.max(0, 240 - 4 * Math.max(0, seconds)) - 25 * Math.max(0, mistakes));

const PER_ANSWER_CAP = BASE + COMBO_STEP * COMBO_CAP; // 150, cũng là trần của Gõ pinyin (100 + combo)
const MATCH_CAP = 440;
export const MAX_ITEMS_PER_ROUND = 20;

/** Trần điểm hợp lệ của một lượt chơi: server dùng để loại điểm vô lý. */
export function maxRoundPoints(mode: PracticeMode, total: number): number {
  return mode === "match" ? MATCH_CAP : total * PER_ANSWER_CAP;
}

export const PRACTICE_MODES: readonly PracticeMode[] = ["pinyin", "cloze", "listen", "match", "karaoke"];
