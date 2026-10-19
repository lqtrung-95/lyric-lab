import { shiftDay } from "@/lib/streak/streak-logic";
import type { DayActivity } from "./game-types";
import { practiceRoundXp, PERFECT_ROUND_MIN_ITEMS, roomXp, unitXp } from "./xp-rules";

/** Dữ liệu thô đọc từ các bảng sự kiện (chỉ các cột cần). */
export interface RawActivity {
  reviews: { at: string }[];
  rounds: { at: string; mode: string; correct: number; total: number }[];
  songs: { at: string; completed: boolean }[];
  units: { at: string; bestScore: number }[];
  rooms: { at: string; won: boolean }[];
}

export const emptyDay = (): DayActivity => ({
  reviews: 0, practiceRounds: 0, practiceRawXp: 0, perfectRounds: 0, dictationGood: 0, shadowingGood: 0, songsCompleted: 0,
  unitsCompleted: 0, unitRawXp: 0, roomsPlayed: 0, roomsWon: 0, roomRawXp: 0, nightReviews: 0, earlyReviews: 0,
});

/** Một formatter dùng cho cả nghìn dòng (tạo Intl.DateTimeFormat mỗi dòng rất chậm). Trả ngày YYYY-MM-DD và giờ 0–23 theo múi giờ. */
export function makeLocalizer(timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });
  return (iso: string): { day: string; hour: number } => {
    const p: Record<string, string> = {};
    for (const part of fmt.formatToParts(new Date(iso))) p[part.type] = part.value;
    return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
  };
}

export const VIDEO_DICTATION = "dictation";
export const VIDEO_SHADOWING = "shadowing";

/**
 * Gom dữ liệu thô thành số liệu từng ngày theo múi giờ người dùng.
 * `studiedDays` định nghĩa giống chuỗi ngày hiện có (ôn thẻ, lượt luyện tập, tiến độ nghe), không tính chặng/thi đấu,
 * để không đổi hành vi chuỗi ngày đang chạy.
 */
export function aggregateActivity(raw: RawActivity, timeZone: string): { days: Record<string, DayActivity>; studiedDays: Set<string> } {
  const local = makeLocalizer(timeZone);
  const days: Record<string, DayActivity> = {};
  const studiedDays = new Set<string>();
  const at = (iso: string, studied: boolean): { a: DayActivity; hour: number } => {
    const { day, hour } = local(iso);
    if (studied) studiedDays.add(day);
    return { a: (days[day] ??= emptyDay()), hour };
  };

  for (const r of raw.reviews) {
    const { a, hour } = at(r.at, true);
    a.reviews++;
    if (hour < 5) a.nightReviews++;
    else if (hour < 8) a.earlyReviews++;
  }
  for (const r of raw.rounds) {
    const { a } = at(r.at, true);
    if (r.mode === VIDEO_DICTATION) a.dictationGood += r.correct > 0 ? r.correct : 0;
    else if (r.mode === VIDEO_SHADOWING) a.shadowingGood += r.correct > 0 ? r.correct : 0;
    else if (r.correct > 0) {
      a.practiceRounds++;
      a.practiceRawXp += practiceRoundXp(r.correct, r.total);
      if (r.correct >= r.total && r.total >= PERFECT_ROUND_MIN_ITEMS) a.perfectRounds++;
    }
  }
  for (const s of raw.songs) {
    const { a } = at(s.at, true);
    if (s.completed) a.songsCompleted++;
  }
  for (const u of raw.units) {
    const { a } = at(u.at, false);
    a.unitsCompleted++;
    a.unitRawXp += unitXp(u.bestScore);
  }
  for (const r of raw.rooms) {
    const { a } = at(r.at, false);
    a.roomsPlayed++;
    if (r.won) a.roomsWon++;
    a.roomRawXp += roomXp(r.won);
  }
  return { days, studiedDays };
}

/** Cộng số liệu các ngày trong [from, to] (khóa ngày YYYY-MM-DD, so sánh chuỗi). */
export function sumDays(days: Record<string, DayActivity>, from: string, to: string): DayActivity {
  const total = emptyDay();
  for (const [day, a] of Object.entries(days)) {
    if (day < from || day > to) continue;
    for (const k of Object.keys(total) as (keyof DayActivity)[]) total[k] += a[k];
  }
  return total;
}

/** Thứ Hai của tuần chứa `day`. */
export function weekStart(day: string): string {
  const wd = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
  return shiftDay(day, -wd);
}
