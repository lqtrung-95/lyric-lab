/** Kiểu dữ liệu dùng chung của hệ thống game hóa (XP, cấp, huy hiệu, nhiệm vụ). */

/** Số liệu học của MỘT ngày (theo múi giờ người dùng), suy ra từ các bảng sự kiện có sẵn. */
export interface DayActivity {
  reviews: number;
  /** Lượt luyện tập (pinyin/cloze/listen/match/karaoke) có ít nhất một câu đúng. */
  practiceRounds: number;
  /** Tổng XP thô của các lượt luyện tập, chưa áp trần. */
  practiceRawXp: number;
  perfectRounds: number;
  dictationGood: number;
  shadowingGood: number;
  songsCompleted: number;
  unitsCompleted: number;
  unitRawXp: number;
  roomsPlayed: number;
  roomsWon: number;
  roomRawXp: number;
  /** Số lần ôn thẻ lúc 0–4 giờ / 5–7 giờ sáng theo giờ địa phương (huy hiệu ẩn). */
  nightReviews: number;
  earlyReviews: number;
}

export type XpSource = "review" | "practice" | "dictation" | "shadowing" | "song" | "unit" | "room" | "quest";

export interface LedgerEntry {
  /** Ngày địa phương YYYY-MM-DD. */
  day: string;
  xp: number;
  source: XpSource;
  reason: string;
}

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";
export type QuestKind = "daily" | "weekly";

export interface EarnedBadge {
  id: string;
  tier: BadgeTier;
  earnedAt: string | null;
}

export interface QuestView {
  id: string;
  kind: QuestKind;
  title: string;
  progress: number;
  target: number;
  rewardXp: number;
  rewardFreeze: boolean;
  claimable: boolean;
  claimed: boolean;
}

export interface GameSummary {
  xp: { total: number; today: number; todayCap: number; todaySources: { source: XpSource; label: string; xp: number; cap: number | null }[] };
  level: { n: number; name: string; progressXp: number; nextXp: number; maxed: boolean };
  streak: {
    current: number;
    longest: number;
    freezes: number;
    studiedToday: boolean;
    week: { day: string; studied: boolean; isToday: boolean; frozen: boolean }[];
    frozenDays: string[];
  };
  quests: QuestView[];
  badges: { earned: EarnedBadge[]; recent: EarnedBadge[] };
  ledger: LedgerEntry[];
}
