/** Chuỗi ngày học + tiến độ tuần, tính thuần từ tập ngày (YYYY-MM-DD theo múi giờ người dùng) có hoạt động học. */

export const WEEKLY_GOAL_DAYS = 5;

/** Khóa ngày YYYY-MM-DD của một thời điểm theo múi giờ. */
export function dayKey(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

const toUtc = (key: string) => Date.parse(`${key}T00:00:00Z`);
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const shiftDay = (key: string, days: number) => fromUtc(toUtc(key) + days * 86_400_000);

export interface StreakSummary {
  /** Số ngày liên tiếp đang chạy. Hôm nay chưa học vẫn giữ nếu hôm qua đã học (còn cả ngày để học). */
  current: number;
  longest: number;
  studiedToday: boolean;
  /** 7 ngày của tuần hiện tại (thứ Hai → Chủ nhật). */
  week: { day: string; studied: boolean; isToday: boolean }[];
  weekCount: number;
}

export function computeStreak(studiedDays: Iterable<string>, today: string): StreakSummary {
  const days = new Set(studiedDays);
  const studiedToday = days.has(today);

  let current = 0;
  for (let d = studiedToday ? today : shiftDay(today, -1); days.has(d); d = shiftDay(d, -1)) current++;

  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  sorted.forEach((d, i) => {
    run = i > 0 && shiftDay(sorted[i - 1], 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
  });

  const weekday = (new Date(toUtc(today)).getUTCDay() + 6) % 7; // 0 = thứ Hai
  const monday = shiftDay(today, -weekday);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = shiftDay(monday, i);
    return { day, studied: days.has(day), isToday: day === today };
  });
  return { current, longest, studiedToday, week, weekCount: week.filter((w) => w.studied).length };
}
