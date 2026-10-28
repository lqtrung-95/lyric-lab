/** Thưởng khi phá án cùng bạn: điểm XP nhân 1,5 (không vượt trần 150 điểm mỗi câu mà server cho phép) và ghi nhận vào sổ "cặp thám tử" của tài khoản. */
export const COOP_BONUS = 1.5;
export const coopPoints = (points: number): number => Math.round(points * COOP_BONUS);

/** Ghi nhận các vụ án đã giải cùng bạn và các ngày đã chơi chung, lưu trong khối `story` của tài khoản: `coop: { solved: string[]; days: string[] }`. */
export interface CoopRecord { solved: string[]; days: string[] }

export function parseCoopRecord(raw: unknown): CoopRecord {
  const d = raw as { solved?: unknown; days?: unknown } | null;
  const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 400) : []);
  return { solved: strs(d?.solved), days: strs(d?.days) };
}

/** Thêm một lần phá án chung (mỗi vụ chỉ tính một lần, mỗi ngày tính một lần). Trả bản mới. */
export function withCoopSolve(rec: CoopRecord, caseId: string, dayKey: string): CoopRecord {
  return { solved: rec.solved.includes(caseId) ? rec.solved : [...rec.solved, caseId], days: rec.days.includes(dayKey) ? rec.days : [...rec.days, dayKey] };
}
