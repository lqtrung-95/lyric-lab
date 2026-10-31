import { dayKey, shiftDay } from "@/lib/streak/streak-logic";

export interface RoundRow { played_at: string; mode: string; points: number; correct: number; total: number }

export const MODE_LABELS: Record<string, string> = {
  pinyin: "Gõ pinyin", cloze: "Điền lời", listen: "Nghe và chọn", match: "Ghép cặp", karaoke: "Karaoke", explore: "Khám phá", truth: "Hai thật một giả", truthduo: "Hai thật một giả (đôi)",
  order: "Xếp câu", reflex: "Hỏi nhanh – Đáp nhanh", fiveword: "Dùng 5 từ", roleplay: "Trò chuyện", blaster: "Bắn chữ", rain: "Nhạc rơi", whack: "Đập chữ", daily: "Hán tự mỗi ngày",
  duel: "Đấu 1–1", write: "Viết chữ Hán", radical: "Luyện bộ thủ", drill: "Luyện từ đã lưu", dictation: "Chép chính tả", shadowing: "Nhại theo video",
};

export interface DayBar { day: string; items: number; studied: boolean }
export interface WeekStats { studyDays: number; cardsReviewed: number; practiceRounds: number; answered: number; correct: number; points: number }
export interface WeekReport {
  /** Ngày đầu và cuối của 7 ngày gần nhất (YYYY-MM-DD, múi giờ người dùng). */
  from: string;
  to: string;
  current: WeekStats;
  previous: WeekStats;
  bars: DayBar[];
  accuracyPct: number | null;
  topModes: { mode: string; label: string; rounds: number }[];
  bestDay: { day: string; items: number } | null;
  newCards: number;
  totalLearned: number;
}

const emptyStats = (): WeekStats => ({ studyDays: 0, cardsReviewed: 0, practiceRounds: 0, answered: 0, correct: 0, points: 0 });

/**
 * Báo cáo 7 ngày gần nhất (kể cả hôm nay) so với 7 ngày liền trước, tính thuần từ nhật ký chấm thẻ và lượt luyện tập (múi giờ của người dùng).
 * "Mục" trong thanh ngày = số lần chấm thẻ + số câu luyện tập của ngày đó.
 */
export function buildWeekReport(input: { now: Date; timeZone: string; reviews: string[]; rounds: RoundRow[]; newCardStamps: string[]; totalLearned: number }): WeekReport {
  const { now, timeZone: tz } = input;
  const today = dayKey(now, tz);
  const from = shiftDay(today, -6), prevFrom = shiftDay(today, -13), prevTo = shiftDay(today, -7);
  const inCur = (d: string) => d >= from && d <= today;
  const inPrev = (d: string) => d >= prevFrom && d <= prevTo;

  const cur = emptyStats(), prev = emptyStats();
  const curDays = new Set<string>(), prevDays = new Set<string>();
  const perDay = new Map<string, number>();
  const modeCount = new Map<string, number>();

  for (const iso of input.reviews) {
    const d = dayKey(new Date(iso), tz);
    if (inCur(d)) { cur.cardsReviewed++; curDays.add(d); perDay.set(d, (perDay.get(d) ?? 0) + 1); }
    else if (inPrev(d)) { prev.cardsReviewed++; prevDays.add(d); }
  }
  for (const r of input.rounds) {
    const d = dayKey(new Date(r.played_at), tz);
    if (inCur(d)) {
      cur.practiceRounds++; cur.answered += r.total; cur.correct += r.correct; cur.points += r.points; curDays.add(d);
      perDay.set(d, (perDay.get(d) ?? 0) + r.total);
      modeCount.set(r.mode, (modeCount.get(r.mode) ?? 0) + 1);
    } else if (inPrev(d)) { prev.practiceRounds++; prev.answered += r.total; prev.correct += r.correct; prev.points += r.points; prevDays.add(d); }
  }
  cur.studyDays = curDays.size; prev.studyDays = prevDays.size;

  const bars: DayBar[] = Array.from({ length: 7 }, (_, i) => { const day = shiftDay(from, i); return { day, items: perDay.get(day) ?? 0, studied: curDays.has(day) }; });
  const best = [...bars].sort((a, b) => b.items - a.items)[0];
  return {
    from, to: today, current: cur, previous: prev, bars,
    accuracyPct: cur.answered > 0 ? Math.round((cur.correct / cur.answered) * 100) : null,
    topModes: [...modeCount].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([mode, rounds]) => ({ mode, label: MODE_LABELS[mode] ?? mode, rounds })),
    bestDay: best && best.items > 0 ? { day: best.day, items: best.items } : null,
    newCards: input.newCardStamps.filter((s) => inCur(dayKey(new Date(s), tz))).length,
    totalLearned: input.totalLearned,
  };
}

/** Mức thay đổi so với tuần trước, dạng "+12" / "−3" / "như tuần trước"; null khi cả hai đều bằng 0 (không có gì để so). */
export function deltaText(cur: number, prev: number): string | null {
  if (cur === 0 && prev === 0) return null;
  const d = cur - prev;
  return d === 0 ? "như tuần trước" : d > 0 ? `+${d} so với tuần trước` : `−${Math.abs(d)} so với tuần trước`;
}

/** Câu tóm tắt để chia sẻ hoặc chép, không kèm tên hay dữ liệu cá nhân khác. */
export function shareSummary(r: WeekReport): string {
  const c = r.current;
  const parts = [`${c.studyDays}/7 ngày học`, `${c.cardsReviewed} thẻ đã ôn`, `${c.practiceRounds} lượt luyện`];
  if (r.accuracyPct !== null) parts.push(`đúng ${r.accuracyPct}%`);
  return `Tuần qua của mình trên SongHanzi: ${parts.join(", ")}.`;
}
