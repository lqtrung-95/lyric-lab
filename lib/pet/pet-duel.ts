import type { GameWord } from "@/lib/games/game-word";
import type { PetSpecies, PetStage } from "./pet-logic";

/**
 * Đấu với pet: 5 câu, mỗi câu hiện pinyin + nghĩa, chọn đúng chữ Hán trong 4 lựa chọn. Pet cũng "bấm" theo tính cách riêng từng loài
 * (nhanh hay chậm, hay nhầm hay không); pet lớn hơn thì giỏi hơn một chút. Ai bấm đúng trước được điểm. Không ghi XP (chỉ giữ kỷ lục thắng/thua).
 */
export const DUEL_ROUNDS = 5;
export const DUEL_OPTIONS = 4;
/** Hết thời gian mỗi câu (ms) mà chưa ai đúng thì hòa câu đó. */
export const DUEL_ROUND_MS = 7000;
export const PET_DUEL_RECORD_KEY = "lyric-lab-pet-duel";
export const PET_DUEL_RECORD_EVENT = "lyric-lab-pet-duel";

interface Style { /** Xác suất bấm đúng ở giai đoạn 1. */ accuracy: number; /** Thời gian bấm trung bình (ms) ở giai đoạn 1. */ speedMs: number; trait: string }

/** Tính cách từng loài: mèo và cún nhanh nhưng hay nhầm, cú và rồng chậm mà chắc. */
export const PET_DUEL_STYLE: Record<PetSpecies, Style> = {
  dragon: { accuracy: 0.74, speedMs: 3000, trait: "bình tĩnh, ít khi nhầm" },
  cat: { accuracy: 0.58, speedMs: 2000, trait: "nhanh tay nhưng hay nhầm" },
  dog: { accuracy: 0.55, speedMs: 2200, trait: "hăng hái, bấm lia lịa" },
  panda: { accuracy: 0.66, speedMs: 3800, trait: "thong thả" },
  owl: { accuracy: 0.84, speedMs: 4200, trait: "chậm mà chắc" },
  rabbit: { accuracy: 0.5, speedMs: 1800, trait: "nhanh như chớp, hay vội" },
  fox: { accuracy: 0.7, speedMs: 2800, trait: "láu lỉnh" },
  penguin: { accuracy: 0.62, speedMs: 3300, trait: "lạch bạch nhưng cố gắng" },
};

export interface PetPlan { correct: boolean; atMs: number }

/** Pet định bấm lúc nào và đúng hay sai. Mỗi giai đoạn lớn thêm 5% chính xác và nhanh hơn 8%; thời gian dao động ±30% theo `rng`. */
export function petPlan(species: PetSpecies, stage: PetStage, rng: () => number): PetPlan {
  const s = PET_DUEL_STYLE[species];
  const accuracy = Math.min(0.95, s.accuracy + (stage - 1) * 0.05);
  const base = s.speedMs * (1 - (stage - 1) * 0.08);
  return { correct: rng() < accuracy, atMs: Math.round(base * (0.7 + rng() * 0.6)) };
}

export interface DuelRound { answer: GameWord; options: GameWord[] }

/** Một câu: đáp án và 3 chữ gây nhiễu khác chữ Hán, xáo trộn. Cần ít nhất 4 từ khác nhau (theo chữ Hán). */
export function makeDuelRound(pool: readonly GameWord[], used: ReadonlySet<string>, rng: () => number): DuelRound | null {
  const unique = [...new Map(pool.filter((w) => w.han && w.pinyin).map((w) => [w.han, w])).values()];
  if (unique.length < DUEL_OPTIONS) return null;
  const fresh = unique.filter((w) => !used.has(w.han));
  const source = fresh.length > 0 ? fresh : unique;
  const answer = source[Math.floor(rng() * source.length)];
  const others = unique.filter((w) => w.han !== answer.han);
  const picks: GameWord[] = [];
  while (picks.length < DUEL_OPTIONS - 1) picks.push(others.splice(Math.floor(rng() * others.length), 1)[0]);
  const options = [answer, ...picks];
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { answer, options };
}

export type DuelWinner = "user" | "pet" | "none";
export type DuelOutcome = "win" | "lose" | "draw";

export const duelOutcome = (user: number, pet: number): DuelOutcome => (user > pet ? "win" : user < pet ? "lose" : "draw");

/** Người chơi bấm: chỉ được điểm khi bấm đúng và pet chưa ghi điểm câu này. */
export const resolveTap = (userCorrect: boolean, petAlreadyScored: boolean): DuelWinner => (userCorrect && !petAlreadyScored ? "user" : "none");

export interface DuelRecord { win: number; lose: number; draw: number }
export const EMPTY_DUEL_RECORD: DuelRecord = { win: 0, lose: 0, draw: 0 };

export function parseDuelRecord(raw: unknown): DuelRecord {
  if (!raw || typeof raw !== "object") return EMPTY_DUEL_RECORD;
  const r = raw as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  return { win: n(r.win), lose: n(r.lose), draw: n(r.draw) };
}

export const addDuelOutcome = (rec: DuelRecord, o: DuelOutcome): DuelRecord => ({ ...rec, [o]: rec[o] + 1 });
