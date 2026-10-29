import type { GameWord } from "./game-word";

/** Kiểu câu hỏi của đợt máy bay: cho nghĩa Việt hoặc cho pinyin, người chơi bắn máy bay mang đúng chữ Hán. */
export type QuestionKind = "meaning" | "pinyin";
export type PowerKind = "spread" | "shield" | "slow";

export interface Question { kind: QuestionKind; prompt: string; answer: GameWord }
export interface Enemy { id: number; word: GameWord; x: number; y: number; correct: boolean; boss: boolean; hp: number; maxHp: number; flash: number }
export interface Bullet { id: number; x: number; y: number; vx: number }
export interface Pickup { id: number; kind: PowerKind; x: number; y: number }
/** Vụ nổ chỉ để vẽ: `points` > 0 là điểm bay lên, `good` false là nổ đỏ (bắn nhầm hoặc va chạm). */
export interface Boom { id: number; x: number; y: number; age: number; points: number; good: boolean }

export interface SquadronState {
  shipX: number; enemies: Enemy[]; bullets: Bullet[]; pickups: Pickup[]; booms: Boom[];
  question: Question | null; asked: number; lastHan: string;
  fire: number; waveGap: number; spread: number; slow: number; shield: boolean;
  score: number; combo: number; bestCombo: number; kills: number; wrong: number; lives: number; level: number;
  shake: number; levelUp: number; fired: number; got: number;
  missed: GameWord[]; nextId: number; over: boolean;
}

/** Tay điều khiển: `dir` từ phím mũi tên/A/D (ưu tiên), `targetX` từ chuột hoặc ngón tay (0..1 theo bề ngang sân), `fire` = đang bấm/giữ nút bắn (chuột, chạm, Space). */
export interface SquadronInput { dir: -1 | 0 | 1; targetX: number | null; fire: boolean }

export const SHIP_Y = 0.86;
export const ENEMY_H = 0.1;
export const BOOM_SECONDS = 0.7;
export const LIVES = 3;
export const BOSS_EVERY = 5;
export const BOSS_HP = 4;
/** Nửa bề ngang vùng trúng đạn của một máy bay (theo bề ngang sân); trùm to hơn. */
export const halfWidth = (e: Pick<Enemy, "boss">): number => (e.boss ? 0.12 : 0.085);
