// Mục tiêu tuần của linh vật: 3 việc nhỏ mỗi tuần (học vài ngày, viết vài chữ, đọc vài truyện). Làm đủ cả ba thì nhận "huy hiệu tuần", và mỗi huy hiệu
// mở thêm đồ cho nhà của pet. Chỉ lưu ở thiết bị này (số đếm trong tuần hiện tại + danh sách tuần đã nhận); số ngày học lấy từ chuỗi ngày có sẵn.

export type WeeklyKind = "write" | "read";

export const WEEKLY_TARGETS = { days: 5, write: 10, read: 2 } as const;
export const WEEKLY_LABELS: Record<keyof typeof WEEKLY_TARGETS, string> = {
  days: "Học ít nhất 5 ngày trong tuần",
  write: "Viết xong 10 từ chữ Hán",
  read: "Đọc xong 2 truyện ngắn",
};

export interface WeeklyState {
  /** Thứ Hai đầu tuần của các số đếm dưới đây (YYYY-MM-DD). */
  week: string;
  write: number;
  /** Id truyện đã đọc xong trong tuần (mỗi truyện chỉ tính một lần). */
  readIds: string[];
  /** Các tuần đã nhận huy hiệu. */
  claimed: string[];
}
export const emptyWeekly: WeeklyState = { week: "", write: 0, readIds: [], claimed: [] };

/** Thứ Hai (giờ địa phương) của tuần chứa `t`, dạng YYYY-MM-DD. */
export function mondayOf(t: number): string {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toLocaleDateString("sv");
}

export function parseWeekly(raw: unknown): WeeklyState {
  if (!raw || typeof raw !== "object") return emptyWeekly;
  const r = raw as Record<string, unknown>;
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 200) : []);
  return {
    week: typeof r.week === "string" ? r.week : "",
    write: typeof r.write === "number" && r.write >= 0 ? Math.min(Math.floor(r.write), 10_000) : 0,
    readIds: strs(r.readIds), claimed: strs(r.claimed),
  };
}

/** Sang tuần mới thì xóa số đếm (giữ danh sách tuần đã nhận). */
export const rollWeek = (s: WeeklyState, week: string): WeeklyState => (s.week === week ? s : { ...s, week, write: 0, readIds: [] });

export function bumpWeekly(s: WeeklyState, week: string, kind: WeeklyKind, id?: string): WeeklyState {
  const cur = rollWeek(s, week);
  if (kind === "write") return { ...cur, write: cur.write + 1 };
  return id && !cur.readIds.includes(id) ? { ...cur, readIds: [...cur.readIds, id] } : cur;
}

export interface GoalRow { id: keyof typeof WEEKLY_TARGETS; label: string; have: number; target: number; done: boolean }

export function weeklyRows(s: WeeklyState, week: string, daysStudied: number): GoalRow[] {
  const cur = rollWeek(s, week);
  const have = { days: daysStudied, write: cur.write, read: cur.readIds.length };
  return (Object.keys(WEEKLY_TARGETS) as (keyof typeof WEEKLY_TARGETS)[]).map((id) => ({
    id, label: WEEKLY_LABELS[id], have: Math.min(have[id], WEEKLY_TARGETS[id]), target: WEEKLY_TARGETS[id], done: have[id] >= WEEKLY_TARGETS[id],
  }));
}

export const canClaim = (s: WeeklyState, week: string, daysStudied: number): boolean => weeklyRows(s, week, daysStudied).every((r) => r.done) && !s.claimed.includes(week);
export const claimWeek = (s: WeeklyState, week: string): WeeklyState => (s.claimed.includes(week) ? s : { ...rollWeek(s, week), claimed: [...s.claimed, week] });
