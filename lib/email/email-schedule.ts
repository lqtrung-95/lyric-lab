import { shiftDay } from "@/lib/streak/streak-logic";

/** Chỉ nhắc quay lại trong khoảng này: dưới 3 ngày là chưa lâu, quá 30 ngày là đã bỏ hẳn (không làm phiền thêm). */
export const REMINDER_MIN_INACTIVE_DAYS = 3;
export const REMINDER_MAX_INACTIVE_DAYS = 30;
const WEEK_MS = 7 * 86_400_000;
/** Email "chuỗi sắp đứt": chỉ khi chuỗi đã đủ dài để đáng giữ, và cách nhau ít nhất ~3 ngày (trừ 2 giờ cho cron chạy lệch giờ). */
export const STREAK_RISK_MIN_STREAK = 3;
const STREAK_GAP_MS = 3 * 86_400_000 - 2 * 3_600_000;
/** Cách nhau ít nhất 6 ngày giữa hai email cùng loại (cron có thể chạy lệch giờ). */
const MIN_GAP_MS = 6 * 86_400_000;

const toUtc = (key: string) => Date.parse(`${key}T00:00:00Z`);

/** Số ngày từ ngày học gần nhất tới hôm nay (cùng định dạng YYYY-MM-DD theo múi giờ người dùng). */
export function daysBetween(fromDay: string, today: string): number {
  return Math.round((toUtc(today) - toUtc(fromDay)) / 86_400_000);
}

export const lastStudiedDay = (days: ReadonlySet<string>): string | null => (days.size === 0 ? null : [...days].sort().at(-1)!);

/** Số ngày có học trong 7 ngày kết thúc ở `today` (gồm cả hôm nay). */
export function activeDaysInLastWeek(days: ReadonlySet<string>, today: string): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (days.has(shiftDay(today, -i))) n++;
  return n;
}

const longAgo = (iso: string | null, now: Date, gapMs: number) => iso === null || now.getTime() - Date.parse(iso) >= gapMs;

/** Gửi tổng kết tuần khi đã bật, đã cách lần trước đủ lâu và tuần qua có học. */
export function shouldSendWeekly(p: { enabled: boolean; lastSentAt: string | null; activeDays: number }, now: Date): boolean {
  return p.enabled && p.activeDays > 0 && longAgo(p.lastSentAt, now, MIN_GAP_MS);
}

/** Nhắc quay lại khi đã bật, đã bỏ học 3–30 ngày và lần nhắc trước cách ít nhất 7 ngày. */
export function shouldSendReminder(p: { enabled: boolean; lastSentAt: string | null; inactiveDays: number | null }, now: Date): boolean {
  if (!p.enabled || p.inactiveDays === null) return false;
  if (p.inactiveDays < REMINDER_MIN_INACTIVE_DAYS || p.inactiveDays > REMINDER_MAX_INACTIVE_DAYS) return false;
  return longAgo(p.lastSentAt, now, WEEK_MS);
}

/**
 * Nhắc giữ chuỗi vào buổi tối: đã bật, chuỗi hiện tại ≥ 3 ngày, hôm nay chưa học và lần nhắc trước cách ≥ ~3 ngày. Người đã bỏ học lâu (chuỗi 0)
 * thuộc về email nhắc quay lại, hai loại không bao giờ trùng nhau.
 */
export function shouldSendStreakRisk(p: { enabled: boolean; lastSentAt: string | null; currentStreak: number; studiedToday: boolean }, now: Date): boolean {
  return p.enabled && !p.studiedToday && p.currentStreak >= STREAK_RISK_MIN_STREAK && longAgo(p.lastSentAt, now, STREAK_GAP_MS);
}

/** Thứ Hai (theo giờ Việt Nam) là ngày gửi tổng kết tuần. */
export function isWeeklyDay(now: Date, timeZone = "Asia/Ho_Chi_Minh"): boolean {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now) === "Mon";
}
