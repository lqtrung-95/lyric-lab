import type { GameWord } from "./game-word";
import { toneOptions } from "./tone-options";

/** Quái đi từ trái sang phải trên một làn; mang một từ và các cách đọc để chọn (chỉ khác thanh điệu). `rush` = chọn sai nên nó lao thẳng vào nhà. */
export interface Monster { id: number; word: GameWord; lane: number; x: number; options: string[]; answer: number; rush: boolean; skin: number }
export interface TowerShot { id: number; lane: number; x: number; age: number }
export interface TowerBoom { id: number; lane: number; x: number; age: number; points: number; good: boolean }
/** Kết quả câu vừa trả lời, hiện ngắn để người chơi thấy cách đọc đúng. */
export interface Reveal { han: string; pinyin: string; ok: boolean; age: number }
export interface TowerState {
  monsters: Monster[]; shots: TowerShot[]; booms: TowerBoom[]; reveal: Reveal | null;
  score: number; combo: number; bestCombo: number; kills: number; wrong: number; lives: number; wave: number;
  spawned: number; nextSpawn: number; shake: number; waveBanner: number; answered: number; supers: number;
  nextId: number; missed: GameWord[]; lastHan: string; over: boolean;
}

export const LANES = 3;
export const LIVES = 5;
export const SKINS = 5;
export const SHOT_SECONDS = 0.3;
export const BOOM_SECONDS = 0.7;
export const REVEAL_SECONDS = 1.6;
const PER_WAVE = 6;
const MAX_ON_FIELD = 4;
const RUSH_SPEED = 1.6;
const SUPER_EVERY = 5;

export const waveOf = (spawned: number): number => 1 + Math.floor(Math.max(0, spawned - 1) / PER_WAVE);
/** Tốc độ đi (phần chiều ngang sân mỗi giây), nhanh dần theo đợt. */
export const walkSpeed = (wave: number): number => Math.min(0.16, 0.06 + 0.01 * (wave - 1));
export const spawnGap = (wave: number): number => Math.max(2.2, 4.2 - 0.3 * (wave - 1));

export const initTower = (): TowerState => ({
  monsters: [], shots: [], booms: [], reveal: null, score: 0, combo: 0, bestCombo: 0, kills: 0, wrong: 0, lives: LIVES, wave: 1,
  spawned: 0, nextSpawn: 0.5, shake: 0, waveBanner: 0, answered: 0, supers: 0, nextId: 1, missed: [], lastHan: "", over: false,
});

/** Con quái cần trả lời: đi xa nhất về phía nhà và chưa lao vào nhà. */
export function frontMonster(s: TowerState): Monster | undefined {
  return s.monsters.reduce<Monster | undefined>((best, m) => (m.rush || (best && best.x >= m.x) ? best : m), undefined);
}

function spawn(s: TowerState, pool: readonly GameWord[], rng: () => number): TowerState {
  const onField = new Set(s.monsters.map((m) => m.word.han));
  for (let tries = 0; tries < 30; tries++) {
    const word = pool[Math.floor(rng() * pool.length)];
    if (!word || word.han === s.lastHan || onField.has(word.han)) continue;
    const opts = toneOptions(word.han, word.pinyin, rng);
    if (!opts) continue;
    // Làn ít quái ở gần điểm xuất phát nhất, để quái mới không đè lên quái trước.
    const crowd = Array.from({ length: LANES }, (_, lane) => Math.min(1, ...s.monsters.filter((m) => m.lane === lane).map((m) => m.x)));
    const lane = crowd.indexOf(Math.max(...crowd));
    const spawned = s.spawned + 1, wave = waveOf(spawned);
    const monster: Monster = { id: s.nextId, word, lane, x: 0, options: opts.options, answer: opts.answer, rush: false, skin: Math.floor(rng() * SKINS) };
    return { ...s, monsters: [...s.monsters, monster], nextId: s.nextId + 1, spawned, wave, lastHan: word.han, nextSpawn: spawnGap(wave), waveBanner: wave > s.wave ? 1.6 : s.waveBanner };
  }
  return { ...s, nextSpawn: 1 };
}

/** Chọn cách đọc thứ `index` cho con quái đầu hàng. Đúng: pet bắn hạ nó (đủ 5 combo thì bắn cả đàn). Sai: nó lọt qua, lao vào nhà. */
export function answerTower(state: TowerState, index: number): TowerState {
  const m = frontMonster(state);
  if (state.over || !m) return state;
  const ok = index === m.answer;
  const reveal: Reveal = { han: m.word.han, pinyin: m.options[m.answer], ok, age: 0 };
  const base = { ...state, reveal, answered: state.answered + 1 };
  if (!ok) {
    return { ...base, monsters: state.monsters.map((x) => (x.id === m.id ? { ...x, rush: true } : x)), combo: 0, wrong: state.wrong + 1, missed: [...state.missed, m.word] };
  }
  const combo = state.combo + 1, super_ = combo % SUPER_EVERY === 0;
  const others = super_ ? state.monsters.filter((x) => x.id !== m.id) : [];
  const points = Math.round(100 * (1 + Math.min(combo - 1, 10) * 0.1));
  let id = state.nextId;
  const booms: TowerBoom[] = [{ id: id++, lane: m.lane, x: m.x, age: 0, points, good: true }, ...others.map((o) => ({ id: id++, lane: o.lane, x: o.x, age: 0, points: 50, good: true }))];
  const shots = [m, ...others].map((t) => ({ id: id++, lane: t.lane, x: t.x, age: 0 }));
  return {
    ...base, monsters: super_ ? state.monsters.filter((x) => x.rush) : state.monsters.filter((x) => x.id !== m.id), shots: [...state.shots, ...shots], booms: [...state.booms, ...booms],
    combo, bestCombo: Math.max(state.bestCombo, combo), kills: state.kills + 1 + others.length, score: state.score + points + others.length * 50, supers: state.supers + (super_ ? 1 : 0), nextId: id,
  };
}

/** Tiến `dt` giây: quái đi tới, quái chạm nhà làm mất một tim, hiệu ứng già đi, quái mới xuất hiện đúng nhịp. */
export function stepTower(state: TowerState, dt: number, pool: readonly GameWord[], rng: () => number): TowerState {
  if (state.over) return state;
  const speed = walkSpeed(state.wave);
  let s: TowerState = {
    ...state,
    monsters: state.monsters.map((m) => ({ ...m, x: m.x + (m.rush ? RUSH_SPEED : speed) * dt })),
    shots: state.shots.map((h) => ({ ...h, age: h.age + dt })).filter((h) => h.age < SHOT_SECONDS),
    booms: state.booms.map((b) => ({ ...b, age: b.age + dt })).filter((b) => b.age < BOOM_SECONDS),
    reveal: state.reveal && state.reveal.age + dt < REVEAL_SECONDS ? { ...state.reveal, age: state.reveal.age + dt } : null,
    shake: Math.max(0, state.shake - dt), waveBanner: Math.max(0, state.waveBanner - dt), nextSpawn: state.nextSpawn - dt,
  };
  const home = s.monsters.filter((m) => m.x >= 1);
  if (home.length > 0) {
    const lives = s.lives - home.length;
    const unanswered = home.filter((m) => !m.rush).map((m) => m.word);
    let id = s.nextId;
    s = { ...s, monsters: s.monsters.filter((m) => m.x < 1), lives, shake: 0.5, combo: 0, missed: [...s.missed, ...unanswered], booms: [...s.booms, ...home.map((m) => ({ id: id++, lane: m.lane, x: 1, age: 0, points: 0, good: false }))], nextId: id, over: lives <= 0 };
    if (s.over) return s;
  }
  if ((s.nextSpawn <= 0 && s.monsters.length < MAX_ON_FIELD) || s.monsters.length === 0) return spawn(s, pool, rng);
  return s;
}
