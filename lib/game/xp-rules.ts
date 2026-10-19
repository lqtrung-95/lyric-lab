import type { DayActivity, LedgerEntry, XpSource } from "./game-types";

/** Công thức XP minh bạch: mỗi nguồn có đơn giá và trần mỗi ngày (chống cày). Điểm `points` do client tính không dùng. */
export const XP_PER_REVIEW = 2;
export const XP_PER_DICTATION_LINE = 3;
export const XP_PER_SHADOWING_LINE = 4;
export const XP_PER_SONG = 20;
export const XP_UNIT_BASE = 30;
export const XP_UNIT_GOOD_SCORE_BONUS = 10;
export const UNIT_GOOD_SCORE = 80;
export const XP_ROOM_PLAYED = 10;
export const XP_ROOM_WON = 15;
export const XP_PER_CORRECT_ANSWER = 2;
export const XP_PERFECT_ROUND_BONUS = 5;
export const PERFECT_ROUND_MIN_ITEMS = 5;

export const DAILY_CAPS: Record<Exclude<XpSource, "quest">, number> = {
  review: 100, practice: 80, dictation: 45, shadowing: 60, song: 60, unit: 120, room: 50,
};
export const DAILY_CAP_TOTAL = Object.values(DAILY_CAPS).reduce((a, b) => a + b, 0);

export const SOURCE_LABELS: Record<XpSource, string> = {
  review: "Ôn thẻ", practice: "Luyện tập", dictation: "Chép chính tả", shadowing: "Luyện nói", song: "Nghe hết bài", unit: "Hoàn thành chặng", room: "Thi đấu", quest: "Thưởng nhiệm vụ",
};

type CappedSource = keyof typeof DAILY_CAPS;

const rawXp = (a: DayActivity): Record<CappedSource, number> => ({
  review: a.reviews * XP_PER_REVIEW,
  practice: a.practiceRawXp,
  dictation: a.dictationGood * XP_PER_DICTATION_LINE,
  shadowing: a.shadowingGood * XP_PER_SHADOWING_LINE,
  song: a.songsCompleted * XP_PER_SONG,
  unit: a.unitRawXp,
  room: a.roomRawXp,
});

/** XP của một lượt luyện tập: chỉ tính câu đúng (kết quả 0 đúng = 0 XP); thưởng thêm khi đúng hết một lượt đủ dài. */
export function practiceRoundXp(correct: number, total: number): number {
  if (correct <= 0 || total <= 0) return 0;
  return correct * XP_PER_CORRECT_ANSWER + (correct >= total && total >= PERFECT_ROUND_MIN_ITEMS ? XP_PERFECT_ROUND_BONUS : 0);
}

export const unitXp = (bestScore: number): number => XP_UNIT_BASE + (bestScore >= UNIT_GOOD_SCORE ? XP_UNIT_GOOD_SCORE_BONUS : 0);
export const roomXp = (won: boolean): number => XP_ROOM_PLAYED + (won ? XP_ROOM_WON : 0);

const reasonFor = (source: CappedSource, a: DayActivity, xp: number, capped: boolean): string => {
  const detail: Record<CappedSource, string> = {
    review: `Ôn ${a.reviews} thẻ`,
    practice: `${a.practiceRounds} lượt luyện tập`,
    dictation: `Chép đúng ${a.dictationGood} câu`,
    shadowing: `Nói tốt ${a.shadowingGood} câu`,
    song: `Nghe hết ${a.songsCompleted} bài`,
    unit: `Hoàn thành ${a.unitsCompleted} chặng`,
    room: `${a.roomsPlayed} ván thi đấu${a.roomsWon ? `, thắng ${a.roomsWon}` : ""}`,
  };
  return `${detail[source]}${capped ? ` (đạt trần ${DAILY_CAPS[source]} XP/ngày)` : ""}`;
};

/** Các khoản XP của một ngày sau khi áp trần theo nguồn. */
export function dayLedger(day: string, a: DayActivity): LedgerEntry[] {
  const raw = rawXp(a);
  return (Object.keys(raw) as CappedSource[]).flatMap((source) => {
    const xp = Math.min(raw[source], DAILY_CAPS[source]);
    return xp > 0 ? [{ day, xp, source, reason: reasonFor(source, a, xp, raw[source] > DAILY_CAPS[source]) }] : [];
  });
}

/** Sổ cái XP từ các ngày hoạt động + thưởng nhiệm vụ đã nhận. Mới nhất trước. */
export function buildLedger(days: Record<string, DayActivity>, questRewards: { day: string; xp: number; title: string }[]): LedgerEntry[] {
  const entries = [
    ...Object.entries(days).flatMap(([day, a]) => dayLedger(day, a)),
    ...questRewards.filter((q) => q.xp > 0).map((q): LedgerEntry => ({ day: q.day, xp: q.xp, source: "quest", reason: `Hoàn thành nhiệm vụ: ${q.title}` })),
  ];
  return entries.sort((x, y) => (x.day < y.day ? 1 : x.day > y.day ? -1 : y.xp - x.xp));
}

export const totalXp = (ledger: LedgerEntry[]): number => ledger.reduce((s, e) => s + e.xp, 0);
