import { hashString, seededRng } from "@/lib/practice/seeded-rng";
import type { GameWord } from "./game-word";

export const DUEL_WORDS = 10;
/** Mỗi lần bỏ qua một từ bị cộng thêm chừng này mili giây vào thời gian. */
export const SKIP_PENALTY_MS = 5000;

export type DuelRole = "a" | "b";
export interface DuelState { from: DuelRole; ready: boolean; done: number; finishedMs: number | null }

/** Bộ từ của phòng: suy ra từ mã phòng nên hai người nhận giống hệt nhau (kho từ phải giống nhau, nên lấy từ máy chủ). */
export function duelWords(bank: readonly GameWord[], code: string, count = DUEL_WORDS): GameWord[] {
  const rng = seededRng(hashString(`duel:${code}`));
  const rest = [...bank];
  const out: GameWord[] = [];
  while (out.length < count && rest.length > 0) out.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  return out;
}

/** Đọc tin trạng thái đối thủ qua kênh; sai dạng thì bỏ để người ngoài gửi gì lên kênh cũng không làm hỏng ván. */
export function parseDuelState(payload: unknown, total = DUEL_WORDS): DuelState | null {
  const d = payload as Partial<DuelState> | null;
  if (!d || (d.from !== "a" && d.from !== "b") || typeof d.ready !== "boolean") return null;
  if (!Number.isInteger(d.done) || d.done! < 0 || d.done! > total) return null;
  if (d.finishedMs !== null && !(Number.isFinite(d.finishedMs) && d.finishedMs! >= 0 && d.finishedMs! < 3_600_000)) return null;
  return { from: d.from, ready: d.ready, done: d.done!, finishedMs: d.finishedMs ?? null };
}

export type DuelResult = "win" | "lose" | "draw";
/** Ai xong nhanh hơn (đã cộng phạt) thắng. */
export const duelResult = (mine: number, theirs: number): DuelResult => (mine < theirs ? "win" : mine > theirs ? "lose" : "draw");
