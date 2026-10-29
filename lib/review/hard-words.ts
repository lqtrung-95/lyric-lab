
/** Phần của thẻ cần để chấm độ khó (cột FSRS + nội dung hiện). */
export interface HardCardLike { item_key: string; kind: string; term: string; reps: number; lapses: number; difficulty: number; stability: number; state: number; due: string }

export const HARD_MIN_REPS = 2;
export const HARD_LIST_SIZE = 20;

/**
 * Điểm "khó nhớ" của một thẻ đã học: số lần quên (lapses) nặng nhất, rồi độ khó FSRS (1–10), và thẻ đang học lại hoặc nhớ chưa bền (stability thấp) cộng thêm.
 * Thẻ mới tinh hoặc mới ôn ít lần (reps < 2) chưa đủ dữ liệu nên điểm 0 (không đoán).
 */
export function hardScore(c: Pick<HardCardLike, "reps" | "lapses" | "difficulty" | "stability" | "state">): number {
  if (c.reps < HARD_MIN_REPS) return 0;
  const lapses = Math.min(c.lapses, 8) * 3;
  const difficulty = Math.max(0, c.difficulty - 5) * 1.2;
  const fragile = c.stability < 3 ? 2 : c.stability < 10 ? 1 : 0;
  const relearning = c.state === 3 ? 2 : 0;
  return lapses + difficulty + fragile + relearning;
}

/** Các từ vựng khó nhất (điểm > 0 và đã từng quên hoặc khó hơn mức giữa), sắp từ khó nhất; hòa thì từ quên nhiều hơn trước. */
export function pickHardWords<T extends HardCardLike>(cards: readonly T[], size = HARD_LIST_SIZE): T[] {
  return cards
    .filter((c) => c.kind === "vocab" && hardScore(c) >= 3)
    .sort((a, b) => hardScore(b) - hardScore(a) || b.lapses - a.lapses || a.term.localeCompare(b.term))
    .slice(0, size);
}

