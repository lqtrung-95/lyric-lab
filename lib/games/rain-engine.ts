import type { GameWord } from "./game-word";

export const LANES = 4;
export const ROW_H = 0.2;
export interface Row { id: number; y: number; words: GameWord[]; answer: number; done: boolean; hit: boolean }
export interface RainState {
  base: number; rows: Row[]; score: number; combo: number; bestCombo: number; cleared: number; level: number; lives: number; nextId: number;
  missed: GameWord[]; over: boolean; shake: number;
}

export const RAIN_LIVES = 3;
const PER_LEVEL = 8;
export const rainLevel = (cleared: number): number => 1 + Math.floor(cleared / PER_LEVEL);
/** Tốc độ rơi cơ bản (phần màn hình mỗi giây) theo độ khó: dễ ≈ 12 giây để một hàng chạm đáy. */
export const DIFFICULTY = { easy: 0.08, normal: 0.11, hard: 0.15 } as const;
export type Difficulty = keyof typeof DIFFICULTY;
/** Tốc độ rơi: tăng chậm theo cấp, trần gấp đôi tốc độ cơ bản để vẫn chơi được. */
export const rainSpeed = (level: number, base: number): number => Math.min(base * 2, base + 0.012 * (level - 1));

export const initRain = (base: number = DIFFICULTY.easy): RainState => ({ base, rows: [], score: 0, combo: 0, bestCombo: 0, cleared: 0, level: 1, lives: RAIN_LIVES, nextId: 1, missed: [], over: false, shake: 0 });

/** Hàng đang chờ trả lời: hàng thấp nhất chưa xử lý. */
export const activeRow = (s: RainState): Row | undefined => s.rows.filter((r) => !r.done).sort((a, b) => b.y - a.y)[0];

function makeRow(id: number, y: number, pool: readonly GameWord[], rng: () => number): Row {
  const picks: GameWord[] = [];
  const rest = [...pool];
  while (picks.length < LANES && rest.length > 0) picks.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  return { id, y, words: picks, answer: Math.floor(rng() * picks.length), done: false, hit: false };
}

/** Tiến `dt` giây: các hàng rơi, hàng chạm đáy mà chưa trả lời mất một mạng, hàng mới nối đuôi hàng trên cùng. Cần ít nhất `LANES` từ khác nhau. */
export function stepRain(state: RainState, dt: number, pool: readonly GameWord[], rng: () => number): RainState {
  if (state.over || pool.length < LANES) return state;
  const speed = rainSpeed(state.level, state.base);
  let s: RainState = { ...state, shake: Math.max(0, state.shake - dt), rows: state.rows.map((r) => ({ ...r, y: r.y + speed * dt })) };
  const fallen = s.rows.filter((r) => r.y + ROW_H >= 1 && !r.done);
  if (fallen.length > 0) {
    const lives = s.lives - fallen.length;
    s = { ...s, lives, combo: 0, shake: 0.3, missed: [...s.missed, ...fallen.map((r) => r.words[r.answer])], rows: s.rows.map((r) => (fallen.includes(r) ? { ...r, done: true } : r)), over: lives <= 0 };
  }
  s = { ...s, rows: s.rows.filter((r) => r.y < 1) };
  const top = s.rows.reduce((m, r) => Math.min(m, r.y), Infinity);
  if (s.rows.length === 0 || top >= 0) s = { ...s, rows: [...s.rows, makeRow(s.nextId, (Number.isFinite(top) ? top : 0) - ROW_H, pool, rng)], nextId: s.nextId + 1 };
  return s;
}

/** Chạm một cột ở hàng đang chờ: đúng thì xóa hàng và cộng điểm, sai thì mất một mạng và mất combo. */
export function tapLane(state: RainState, lane: number): RainState {
  const row = activeRow(state);
  if (state.over || !row || lane < 0 || lane >= LANES) return state;
  if (lane === row.answer) {
    const combo = state.combo + 1, cleared = state.cleared + 1;
    return { ...state, rows: state.rows.map((r) => (r.id === row.id ? { ...r, done: true, hit: true } : r)), score: state.score + 100 + Math.min(combo - 1, 10) * 10, combo, bestCombo: Math.max(state.bestCombo, combo), cleared, level: rainLevel(cleared) };
  }
  const lives = state.lives - 1;
  return { ...state, lives, combo: 0, shake: 0.3, missed: [...state.missed, row.words[row.answer]], rows: state.rows.map((r) => (r.id === row.id ? { ...r, done: true } : r)), over: lives <= 0 };
}
