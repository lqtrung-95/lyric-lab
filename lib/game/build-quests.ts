import { seededRng, shuffle } from "@/lib/practice/random";
import { shiftDay } from "@/lib/streak/streak-logic";
import { sumDays } from "./aggregate-activity";
import type { DayActivity, QuestView } from "./game-types";
import { DAILY_QUESTS, DAILY_QUEST_COUNT, WEEKLY_ALWAYS, WEEKLY_EXTRA_COUNT, WEEKLY_POOL, questId, type QuestTemplate } from "./quest-catalog";

/** Hash chuỗi → số nguyên 32 bit (FNV-1a) làm hạt giống: cùng (user, kỳ) luôn ra cùng bộ nhiệm vụ. */
export function seedOf(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

export interface QuestSlot {
  id: string;
  template: QuestTemplate;
  /** Khoảng ngày [from, to] mà tiến độ được tính. */
  from: string;
  to: string;
}

/** Nhiệm vụ hiện tại của người dùng: 3 nhiệm vụ ngày và 3 nhiệm vụ tuần, sinh xác định theo (user, ngày/tuần). */
export function currentQuestSlots(userId: string, today: string, monday: string): QuestSlot[] {
  const daily = shuffle(DAILY_QUESTS, seededRng(seedOf(`${userId}|d|${today}`))).slice(0, DAILY_QUEST_COUNT);
  const weekly = [WEEKLY_ALWAYS, ...shuffle(WEEKLY_POOL, seededRng(seedOf(`${userId}|w|${monday}`))).slice(0, WEEKLY_EXTRA_COUNT)];
  return [
    ...daily.map((t) => ({ id: questId("daily", today, t.id), template: t, from: today, to: today })),
    ...weekly.map((t) => ({ id: questId("weekly", monday, t.id), template: t, from: monday, to: shiftDay(monday, 6) })),
  ];
}

export function buildQuestViews(slots: QuestSlot[], days: Record<string, DayActivity>, studiedDays: Set<string>, claimed: Set<string>): QuestView[] {
  return slots.map((s) => {
    const studiedDaysInPeriod = [...studiedDays].filter((d) => d >= s.from && d <= s.to).length;
    const raw = s.template.progress(sumDays(days, s.from, s.to), { studiedDaysInPeriod });
    const done = raw >= s.template.target;
    const isClaimed = claimed.has(s.id);
    return {
      id: s.id, kind: s.template.kind, title: s.template.title, progress: Math.min(raw, s.template.target), target: s.template.target,
      rewardXp: s.template.rewardXp, rewardFreeze: s.template.rewardFreeze === true, claimable: done && !isClaimed, claimed: isClaimed,
    };
  });
}

const ALL_TEMPLATES = [...DAILY_QUESTS, WEEKLY_ALWAYS, ...WEEKLY_POOL];

/** Tách id nhiệm vụ `kind:kỳ:mẫu` → tiêu đề mẫu (để giải thích khoản thưởng cũ). */
export function questTitleOf(id: string): string {
  const templateId = id.split(":")[2];
  return ALL_TEMPLATES.find((t) => t.id === templateId)?.title ?? "Nhiệm vụ";
}
