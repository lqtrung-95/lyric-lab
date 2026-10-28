import type { GameWord } from "./game-word";

export const HOLES = 9;
export const WHACK_SECONDS = 30;
export interface WhackRound { answer: GameWord; cells: (GameWord | null)[] }

/** Số chữ hiện cùng lúc: tăng dần theo số lượt đã qua (4 → 6). */
export const crowdFor = (played: number): number => Math.min(6, 4 + Math.floor(played / 5));
/** Thời gian mỗi lượt (ms): ngắn dần nhưng không dưới 1,2 giây. */
export const windowMs = (played: number): number => Math.max(1200, 2600 - played * 60);

/** Một lượt: đáp án và vài chữ gây nhiễu nằm ở các hố khác nhau, các hố còn lại trống. Cần ít nhất 2 từ khác nhau. */
export function makeWhackRound(pool: readonly GameWord[], played: number, rng: () => number): WhackRound | null {
  if (pool.length < 2) return null;
  const words = [...pool];
  const pull = () => words.splice(Math.floor(rng() * words.length), 1)[0];
  const answer = pull();
  const crowd = Math.min(crowdFor(played), pool.length);
  const shown = [answer, ...Array.from({ length: crowd - 1 }, pull)];
  const holes = Array.from({ length: HOLES }, (_, i) => i);
  const cells: (GameWord | null)[] = Array(HOLES).fill(null);
  for (const w of shown) cells[holes.splice(Math.floor(rng() * holes.length), 1)[0]] = w;
  return { answer, cells };
}

/** Điểm một cú đập đúng: 100, cộng thưởng nhanh (tối đa 50, theo phần thời gian còn lại) và combo (mỗi bước 10, tối đa 100). */
export const whackPoints = (fractionLeft: number, combo: number): number => 100 + Math.round(50 * Math.min(1, Math.max(0, fractionLeft))) + Math.min(combo, 10) * 10;
