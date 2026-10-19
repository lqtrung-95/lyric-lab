import type { DayActivity, QuestKind } from "./game-types";

export interface QuestTemplate {
  id: string;
  kind: QuestKind;
  title: string;
  target: number;
  rewardXp: number;
  rewardFreeze?: boolean;
  /** Tiến độ lấy từ số liệu tổng hợp của kỳ (ngày hoặc tuần). */
  progress: (period: DayActivity, ctx: { studiedDaysInPeriod: number }) => number;
}

export const DAILY_QUESTS: QuestTemplate[] = [
  { id: "review10", kind: "daily", title: "Ôn 10 thẻ", target: 10, rewardXp: 15, progress: (a) => a.reviews },
  { id: "listen1", kind: "daily", title: "Nghe hết 1 bài hát", target: 1, rewardXp: 15, progress: (a) => a.songsCompleted },
  { id: "speak1", kind: "daily", title: "Đọc to 1 câu cho máy chấm", target: 1, rewardXp: 15, progress: (a) => a.shadowingGood },
  { id: "dictate3", kind: "daily", title: "Chép đúng 3 câu chính tả", target: 3, rewardXp: 15, progress: (a) => a.dictationGood },
  { id: "practice1", kind: "daily", title: "Chơi 1 lượt luyện tập", target: 1, rewardXp: 15, progress: (a) => a.practiceRounds },
  { id: "unit1", kind: "daily", title: "Hoàn thành 1 chặng", target: 1, rewardXp: 25, progress: (a) => a.unitsCompleted },
];

export const WEEKLY_ALWAYS: QuestTemplate = {
  id: "days5", kind: "weekly", title: "Học đủ 5 ngày trong tuần", target: 5, rewardXp: 50, rewardFreeze: true, progress: (_a, c) => c.studiedDaysInPeriod,
};

export const WEEKLY_POOL: QuestTemplate[] = [
  { id: "review100", kind: "weekly", title: "Ôn 100 thẻ", target: 100, rewardXp: 60, progress: (a) => a.reviews },
  { id: "units3", kind: "weekly", title: "Hoàn thành 3 chặng", target: 3, rewardXp: 60, progress: (a) => a.unitsCompleted },
  { id: "rooms2", kind: "weekly", title: "Chơi 2 ván thi đấu", target: 2, rewardXp: 50, progress: (a) => a.roomsPlayed },
  { id: "shadow10", kind: "weekly", title: "Luyện nói tốt 10 câu", target: 10, rewardXp: 50, progress: (a) => a.shadowingGood },
];

export const DAILY_QUEST_COUNT = 3;
export const WEEKLY_EXTRA_COUNT = 2;
export const questId = (kind: QuestKind, period: string, templateId: string) => `${kind}:${period}:${templateId}`;
