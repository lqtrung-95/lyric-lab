/** Độ lệch (ms) của múi giờ `timeZone` so với UTC tại thời điểm `at`. */
function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
  }).formatToParts(at);
  const n = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Thời điểm 00:00 của ngày hiện tại (theo múi giờ người dùng) và của ngày kế tiếp: ranh giới "hôm nay" cho hạn mức thẻ mới. */
export function dayBounds(now: Date, timeZone: string): { start: Date; end: Date } {
  const localMidnight = (at: Date, shiftDays: number) => {
    const local = new Date(at.getTime() + zoneOffsetMs(at, timeZone));
    const guess = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + shiftDays);
    // Trừ độ lệch tại chính thời điểm đó (đúng cả khi múi giờ có giờ mùa hè đổi trong ngày).
    return new Date(guess - zoneOffsetMs(new Date(guess), timeZone));
  };
  return { start: localMidnight(now, 0), end: localMidnight(now, 1) };
}
