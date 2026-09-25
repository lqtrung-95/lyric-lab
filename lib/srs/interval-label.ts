const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Khoảng thời gian tới lần ôn kế, viết ngắn bằng tiếng Việt cho nút chấm ("10 phút", "3 ngày", "2 tháng"). */
export function formatInterval(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} phút`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} giờ`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${days} ngày`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, "")} năm`;
}
