import type { BadgeTier } from "./game-types";

/** Số liệu gộp toàn thời gian dùng để đánh giá huy hiệu. */
export interface BadgeFacts {
  learnedWords: number;
  /** Số bài kiểm tra cuối cấp HSK đã đạt (mỗi cấp tối đa một). */
  levelsCompleted: number;
  totalReviews: number;
  unitsCompleted: number;
  level: number;
  longestStreak: number;
  songsCompleted: number;
  dictationGood: number;
  shadowingGood: number;
  roomsPlayed: number;
  roomsWon: number;
  perfectRounds: number;
  nightReviews: number;
  earlyReviews: number;
}

export type BadgeGroup = "learn" | "streak" | "listen" | "speak" | "battle";
export const BADGE_GROUP_LABELS: Record<BadgeGroup, string> = { learn: "Học", streak: "Chuỗi ngày", listen: "Nghe", speak: "Nói", battle: "Thi đấu" };

export const TIER_ORDER: BadgeTier[] = ["bronze", "silver", "gold", "diamond"];

export interface BadgeDef {
  id: string;
  group: BadgeGroup;
  title: string;
  /** Mô tả cách mở, `{n}` thay bằng mốc của bậc. */
  hint: string;
  /** Huy hiệu ẩn: chưa mở thì không lộ tên và cách mở. */
  hidden?: boolean;
  metric: keyof BadgeFacts;
  /** Mốc từng bậc, tăng dần; có thể ít hơn 4 bậc (dùng các bậc đầu). */
  thresholds: number[];
}

export const BADGES: BadgeDef[] = [
  { id: "learn-words", group: "learn", title: "Kho từ", hint: "Học {n} từ (ôn ít nhất một lần)", metric: "learnedWords", thresholds: [10, 50, 200, 1000] },
  { id: "learn-reviews", group: "learn", title: "Chăm ôn", hint: "Chấm {n} lượt ôn thẻ", metric: "totalReviews", thresholds: [50, 300, 1500, 6000] },
  { id: "learn-units", group: "learn", title: "Chinh phục chặng", hint: "Hoàn thành {n} chặng lộ trình", metric: "unitsCompleted", thresholds: [1, 10, 36, 100] },
  { id: "learn-hsk", group: "learn", title: "Hoàn thành cấp HSK", hint: "Qua bài kiểm tra cuối cấp của {n} cấp HSK", metric: "levelsCompleted", thresholds: [1, 2, 4, 6] },
  { id: "learn-level", group: "learn", title: "Thăng cấp", hint: "Đạt cấp {n}", metric: "level", thresholds: [5, 10, 20, 30] },
  { id: "streak-days", group: "streak", title: "Giữ lửa", hint: "Chuỗi học dài nhất {n} ngày", metric: "longestStreak", thresholds: [3, 7, 30, 100] },
  { id: "listen-songs", group: "listen", title: "Thính giả", hint: "Nghe hết {n} bài hát", metric: "songsCompleted", thresholds: [1, 5, 20, 60] },
  { id: "listen-dictation", group: "listen", title: "Tai thính", hint: "Chép đúng {n} câu chính tả", metric: "dictationGood", thresholds: [10, 50, 200, 800] },
  { id: "speak-shadowing", group: "speak", title: "Giọng ca", hint: "Luyện nói tốt {n} câu", metric: "shadowingGood", thresholds: [5, 30, 150, 600] },
  { id: "battle-played", group: "battle", title: "Đấu sĩ", hint: "Chơi {n} ván thi đấu", metric: "roomsPlayed", thresholds: [1, 5, 20, 60] },
  { id: "battle-won", group: "battle", title: "Bất bại", hint: "Thắng {n} ván thi đấu", metric: "roomsWon", thresholds: [1, 5, 20, 50] },
  { id: "hidden-perfect", group: "learn", title: "Hoàn hảo", hint: "Đúng hết một lượt luyện tập (từ 5 câu) {n} lần", hidden: true, metric: "perfectRounds", thresholds: [1, 10, 50, 200] },
  { id: "hidden-night-owl", group: "learn", title: "Cú đêm", hint: "Ôn thẻ lúc 0–5 giờ sáng {n} lần", hidden: true, metric: "nightReviews", thresholds: [1, 20, 100] },
  { id: "hidden-early-bird", group: "learn", title: "Chim sớm", hint: "Ôn thẻ lúc 5–8 giờ sáng {n} lần", hidden: true, metric: "earlyReviews", thresholds: [1, 20, 100] },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));
