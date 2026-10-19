import { computeStreak, shiftDay, type StreakSummary } from "./streak-logic";

/** Số đóng băng tối đa được giữ cùng lúc (kiếm bằng nhiệm vụ, không mua). */
export const MAX_FREEZES = 2;
/** Chỉ cứu ngày lỡ trong chừng này ngày gần nhất. */
const FREEZE_WINDOW_DAYS = 14;

export interface StreakWithFreezes extends StreakSummary {
  frozenDays: string[];
  week: (StreakSummary["week"][number] & { frozen: boolean })[];
}

/**
 * Chuỗi ngày có tính ngày đóng băng: ngày đóng băng nối chuỗi nhưng không tính là ngày học (không tăng số, không tô tuần).
 * Không có ngày đóng băng thì kết quả giống hệt `computeStreak`.
 */
export function computeStreakWithFreezes(studiedDays: Iterable<string>, frozenDays: Iterable<string>, today: string): StreakWithFreezes {
  const studied = new Set(studiedDays);
  const frozen = new Set(frozenDays);
  const base = computeStreak(studied, today);
  const bridged = (d: string) => studied.has(d) || frozen.has(d);

  let current = 0;
  for (let d = studied.has(today) ? today : shiftDay(today, -1); bridged(d); d = shiftDay(d, -1)) if (studied.has(d)) current++;

  const all = [...new Set([...studied, ...frozen])].sort();
  let longest = 0;
  let run = 0;
  all.forEach((d, i) => {
    const continues = i > 0 && shiftDay(all[i - 1], 1) === d;
    run = (continues ? run : 0) + (studied.has(d) ? 1 : 0);
    longest = Math.max(longest, run);
  });

  return { ...base, current, longest, frozenDays: [...frozen].sort(), week: base.week.map((w) => ({ ...w, frozen: frozen.has(w.day) })) };
}

/**
 * Chọn các ngày lỡ đơn lẻ cần đóng băng, đi ngược từ hôm nay qua chuỗi đang chạy: ngày D chưa học được cứu khi D−1 còn trong chuỗi
 * (đã học hoặc đã đóng băng) và D+1 đã nối tới hôm nay. Chỉ vá chuỗi hiện tại, không vá ngược lịch sử cũ; ngày lỡ liên tiếp từ hai ngày
 * trở lên thì chuỗi đã đứt, không cứu. Tối đa `available` ngày. Hàm thuần, chạy lại cho cùng dữ liệu ra cùng kết quả.
 */
export function planFreezes(studiedDays: Iterable<string>, frozenDays: Iterable<string>, today: string, available: number): string[] {
  const studied = new Set(studiedDays);
  const frozen = new Set(frozenDays);
  const planned: string[] = [];
  const bridged = (d: string) => studied.has(d) || frozen.has(d) || planned.includes(d);
  for (let back = 0; back <= FREEZE_WINDOW_DAYS; back++) {
    const d = shiftDay(today, -back);
    if (bridged(d) || d === today) continue; // hôm nay chưa học vẫn còn cả ngày để học
    if (!bridged(shiftDay(d, -1)) || planned.length >= available) break;
    planned.push(d);
  }
  return planned.sort();
}
