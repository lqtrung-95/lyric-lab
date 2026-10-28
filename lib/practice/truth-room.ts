import type { Trial } from "./truth-or-lie";

/** Giá trị đặc biệt: hết giờ mà chưa chọn (không bao giờ trùng chỉ số câu sai nên tính là chưa đúng). */
export const TIMEOUT = 3;
/** Giây cho mỗi vòng ở chế độ chơi cùng bạn. */
export const ROUND_SECONDS = 20;

/** Lượt chọn của một người qua từng vòng: chỉ số câu họ cho là sai (0 đến 2), `TIMEOUT` nếu hết giờ, hoặc null nếu chưa trả lời. */
export type Picks = (number | null)[];

/** Số vòng của một phòng. */
export const ROOM_ROUNDS = 8;

export const emptyPicks = (n: number): Picks => Array.from({ length: n }, () => null);

/** Điểm của một người: số vòng chọn đúng câu sai. */
export const scoreOf = (trials: readonly Trial[], picks: Picks): number => trials.reduce((n, t, i) => n + (picks[i] === t.lieIndex ? 1 : 0), 0);

/** Xong khi đã trả lời mọi vòng. */
export const isComplete = (picks: Picks, rounds: number): boolean => picks.length >= rounds && picks.slice(0, rounds).every((p) => p !== null);

export type RoomResult = "win" | "lose" | "draw";
export const resultFor = (mine: number, theirs: number): RoomResult => (mine > theirs ? "win" : mine < theirs ? "lose" : "draw");

/**
 * Đọc tin đáp án của đồng đội qua kênh: một mảng đúng `rounds` phần tử, mỗi phần tử là null, chỉ số 0 đến 2 hoặc `TIMEOUT`. Sai dạng thì bỏ (null),
 * nên người ngoài gửi gì lên kênh cũng không làm hỏng trạng thái.
 */
export function parsePicks(payload: unknown, rounds: number): { from: "a" | "b"; picks: Picks } | null {
  const d = payload as { from?: unknown; picks?: unknown } | null;
  if (!d || (d.from !== "a" && d.from !== "b") || !Array.isArray(d.picks) || d.picks.length !== rounds) return null;
  return d.picks.every((p) => p === null || (Number.isInteger(p) && p >= 0 && p <= TIMEOUT)) ? { from: d.from, picks: d.picks as Picks } : null;
}

/** Hợp hai bản đáp án của cùng một người (giữ đáp án đã có, không để bản cũ xóa bản mới): dùng khi nhận lại trạng thái sau khi vào phòng. */
export const mergePicks = (a: Picks, b: Picks): Picks => a.map((p, i) => p ?? b[i] ?? null);
