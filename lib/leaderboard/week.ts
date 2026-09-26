// Tuần của bảng xếp hạng bắt đầu thứ Hai 00:00 giờ Việt Nam (UTC+7, không có giờ mùa hè). Khớp với `date_trunc('week', ...)` trong SQL.
const VN_OFFSET_MS = 7 * 3_600_000;
const WEEK_MS = 7 * 24 * 3_600_000;

/** Thời điểm bắt đầu tuần hiện tại (thứ Hai 00:00 giờ VN). */
export function weekStart(now: Date): Date {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  const daysSinceMonday = (vn.getUTCDay() + 6) % 7;
  const mondayVn = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate() - daysSinceMonday);
  return new Date(mondayVn - VN_OFFSET_MS);
}

/** Thời điểm kết thúc tuần (thứ Hai kế tiếp 00:00 giờ VN). */
export const weekEnd = (now: Date): Date => new Date(weekStart(now).getTime() + WEEK_MS);

/** Còn bao lâu tới khi bảng tuần reset, viết ngắn ("3 ngày 5 giờ", "5 giờ", "12 phút"). */
export function formatTimeLeft(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  return `${Math.max(1, minutes)} phút`;
}
