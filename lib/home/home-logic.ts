import type { RemoteSongProgress } from "@/lib/library/merge-library-songs";

export interface ContinueSong {
  videoId: string;
  title: string;
  positionSec: number;
}

/**
 * Bài đang nghe dở gần nhất: chưa hoàn thành, đã nghe ít nhất 5 giây và chưa gần hết bài (dưới 95%).
 * Trả null nếu không có bài nào như vậy.
 */
export function pickContinueSong(songs: RemoteSongProgress[]): ContinueSong | null {
  const candidates = songs
    .filter((s) => !s.completed && s.lastPositionSec >= 5 && (s.durationSec <= 0 || s.lastPositionSec / s.durationSec < 0.95))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const top = candidates[0];
  return top ? { videoId: top.videoId, title: top.title, positionSec: Math.floor(top.lastPositionSec) } : null;
}

export type NextAction =
  | { kind: "review"; due: number }
  | { kind: "continue"; song: ContinueSong }
  | { kind: "discover" };

/** Một hành động nổi bật duy nhất: thẻ đến hạn trước, rồi bài nghe dở, cuối cùng là gợi ý bài để bắt đầu. */
export function chooseNextAction(input: { due: number; continueSong: ContinueSong | null }): NextAction {
  if (input.due > 0) return { kind: "review", due: input.due };
  if (input.continueSong) return { kind: "continue", song: input.continueSong };
  return { kind: "discover" };
}

/** Dải cấp HSK của tab Khám phá phù hợp với level người dùng (level 1–7). */
export function levelToBand(level: number): "1-2" | "3-4" | "5-6" | "7" {
  if (level <= 2) return "1-2";
  if (level <= 4) return "3-4";
  if (level <= 6) return "5-6";
  return "7";
}

/** Tỉ lệ hoàn thành mục tiêu thẻ mới trong ngày, kẹp 0–1 (mục tiêu 0 thì coi như chưa có mục tiêu). */
export function goalFraction(started: number, perDay: number): number {
  if (perDay <= 0) return 0;
  return Math.max(0, Math.min(1, started / perDay));
}

/** m:ss cho vị trí bài hát. */
export function formatPosition(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
