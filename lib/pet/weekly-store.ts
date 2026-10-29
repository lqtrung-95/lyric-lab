import { bumpWeekly, mondayOf, parseWeekly, type WeeklyKind } from "./weekly-goals";

export const WEEKLY_KEY = "lyric-lab-pet-weekly";
export const WEEKLY_EVENT = "lyric-lab-pet-weekly-change";

/** Ghi một việc đã làm vào mục tiêu tuần (viết xong một từ, đọc xong một truyện). Chạy ở trình duyệt; localStorage bị chặn thì bỏ qua (chỉ mất phần đếm phụ). */
export function recordWeekly(kind: WeeklyKind, id?: string): void {
  try {
    const raw = localStorage.getItem(WEEKLY_KEY);
    const cur = parseWeekly(raw ? JSON.parse(raw) : null);
    localStorage.setItem(WEEKLY_KEY, JSON.stringify(bumpWeekly(cur, mondayOf(Date.now()), kind, id)));
    window.dispatchEvent(new Event(WEEKLY_EVENT));
  } catch { /* bỏ qua */ }
}
