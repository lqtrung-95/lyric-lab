const pad = (n: number) => String(n).padStart(2, "0");

/** Thời gian của một tin cho người xem: "vừa xong", "5 phút trước", "14:05" (hôm nay), "Hôm qua 14:05", "12/10 14:05". `now` truyền vào để test. */
export function formatChatTime(iso: string, now: number = Date.now()): string {
  const t = new Date(iso);
  const diffMin = Math.floor((now - t.getTime()) / 60_000);
  if (diffMin < 1) return "vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const clock = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
  const today = new Date(now);
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(t, today)) return clock;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(t, yesterday)) return `Hôm qua ${clock}`;
  return `${pad(t.getDate())}/${pad(t.getMonth() + 1)} ${clock}`;
}
