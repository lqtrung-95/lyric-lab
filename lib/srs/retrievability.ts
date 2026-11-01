/** Hằng số của đường quên FSRS (bản FSRS-4.5/5): R(t, S) = (1 + FACTOR · t / S) ^ DECAY, với t là số ngày kể từ lần ôn cuối và S là độ bền (stability) của thẻ. */
const DECAY = -0.5;
const FACTOR = 19 / 81;

/** Xác suất còn nhớ (0..1) sau `elapsedDays` ngày với độ bền `stability` (ngày). Độ bền ≤ 0 hoặc thời gian âm thì coi như vừa ôn (1). */
export function retrievability(stability: number, elapsedDays: number): number {
  if (!(stability > 0) || elapsedDays <= 0) return 1;
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

export interface MemoryRow { reps: number; stability: number; last_review: string | null; due: string }

/** Xác suất còn nhớ của một thẻ tại `now`; null nếu thẻ chưa từng được ôn (không có gì để nói về trí nhớ). */
export function cardRetrievability(c: MemoryRow, now: Date): number | null {
  if (c.reps <= 0 || !c.last_review) return null;
  return retrievability(c.stability, (now.getTime() - Date.parse(c.last_review)) / 86_400_000);
}
