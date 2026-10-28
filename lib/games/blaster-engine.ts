import { typingLetters, type GameWord } from "./game-word";

export interface Target { id: number; word: GameWord; letters: string; x: number; y: number }
export interface Blast { id: number; x: number; y: number; age: number }
export interface BlasterState {
  targets: Target[]; blasts: Blast[]; typed: string; lockedId: number | null;
  score: number; combo: number; bestCombo: number; kills: number; lives: number; level: number;
  nextSpawn: number; nextId: number; missed: GameWord[]; over: boolean;
}

export const LIVES = 3;
const KILLS_PER_LEVEL = 6;
const MAX_TARGETS = 5;
const BLAST_SECONDS = 0.45;

export const levelOf = (kills: number): number => 1 + Math.floor(kills / KILLS_PER_LEVEL);
/** Tốc độ rơi (phần màn hình mỗi giây): ban đầu mất khoảng 17 giây để chạm đáy, tăng dần theo cấp. */
export const fallSpeed = (level: number): number => Math.min(0.2, 0.06 + 0.012 * (level - 1));
/** Khoảng cách giữa hai lần xuất hiện (giây), ngắn dần theo cấp. */
export const spawnGap = (level: number): number => Math.max(1.2, 3.2 - 0.25 * (level - 1));

export const initBlaster = (): BlasterState => ({ targets: [], blasts: [], typed: "", lockedId: null, score: 0, combo: 0, bestCombo: 0, kills: 0, lives: LIVES, level: 1, nextSpawn: 0.4, nextId: 1, missed: [], over: false });

function spawn(s: BlasterState, pool: readonly GameWord[], rng: () => number): BlasterState {
  const onScreen = new Set(s.targets.map((t) => t.word.han));
  const fresh = pool.filter((w) => !onScreen.has(w.han) && typingLetters(w.pinyin).length > 0);
  if (fresh.length === 0) return s;
  const word = fresh[Math.floor(rng() * fresh.length)];
  // Chọn cột ít bị che nhất trong vài lần thử để các từ vừa xuất hiện không chồng lên nhau.
  let x = 0.08, bestGap = -1;
  for (let k = 0; k < 6; k++) {
    const cx = 0.06 + rng() * 0.7;
    const gap = Math.min(1, ...s.targets.filter((t) => t.y < 0.3).map((t) => Math.abs(t.x - cx)));
    if (gap > bestGap) { bestGap = gap; x = cx; }
  }
  return { ...s, targets: [...s.targets, { id: s.nextId, word, letters: typingLetters(word.pinyin), x, y: 0 }], nextId: s.nextId + 1 };
}

/** Tiến `dt` giây: từ rơi, từ chạm đáy mất một mạng, tia nổ già đi, từ mới xuất hiện đúng nhịp theo cấp. */
export function stepBlaster(state: BlasterState, dt: number, pool: readonly GameWord[], rng: () => number): BlasterState {
  if (state.over) return state;
  const speed = fallSpeed(state.level);
  let s: BlasterState = { ...state, targets: state.targets.map((t) => ({ ...t, y: t.y + speed * dt })), blasts: state.blasts.map((b) => ({ ...b, age: b.age + dt })).filter((b) => b.age < BLAST_SECONDS) };
  const hit = s.targets.filter((t) => t.y >= 1);
  if (hit.length > 0) {
    const lives = s.lives - hit.length;
    const lockedHit = hit.some((t) => t.id === s.lockedId);
    s = { ...s, targets: s.targets.filter((t) => t.y < 1), lives, combo: 0, missed: [...s.missed, ...hit.map((t) => t.word)], typed: lockedHit ? "" : s.typed, lockedId: lockedHit ? null : s.lockedId, over: lives <= 0 };
    if (s.over) return s;
  }
  const nextSpawn = s.nextSpawn - dt;
  if (nextSpawn <= 0 && s.targets.length < MAX_TARGETS) return spawn({ ...s, nextSpawn: spawnGap(s.level) }, pool, rng);
  return { ...s, nextSpawn: Math.max(0, nextSpawn) };
}

/** Một phím chữ cái: khóa từ thấp nhất có pinyin bắt đầu bằng chuỗi đã gõ; gõ sai thì bỏ chuỗi và mất combo; gõ đủ thì nổ từ đó. */
export function typeLetter(state: BlasterState, ch: string): BlasterState {
  if (state.over || !/^[a-z]$/.test(ch)) return state;
  const typed = state.typed + ch;
  const locked = state.lockedId !== null ? state.targets.find((t) => t.id === state.lockedId) : undefined;
  const candidates = locked ? [locked] : [...state.targets].sort((a, b) => b.y - a.y);
  const target = candidates.find((t) => t.letters.startsWith(typed));
  if (!target) return { ...state, typed: "", lockedId: null, combo: 0 };
  if (typed !== target.letters) return { ...state, typed, lockedId: target.id };
  const combo = state.combo + 1, kills = state.kills + 1;
  const gain = Math.round(target.letters.length * 10 * (1 + Math.min(combo - 1, 10) * 0.1));
  return {
    ...state, targets: state.targets.filter((t) => t.id !== target.id), blasts: [...state.blasts, { id: target.id, x: target.x, y: target.y, age: 0 }],
    typed: "", lockedId: null, score: state.score + gain, combo, bestCombo: Math.max(state.bestCombo, combo), kills, level: levelOf(kills),
  };
}

/** Xóa (Backspace) hoặc đặt lại chuỗi đang gõ; chuỗi rỗng thì bỏ khóa. */
export const setTyped = (state: BlasterState, typed: string): BlasterState => (typed === "" ? { ...state, typed: "", lockedId: null } : { ...state, typed });
