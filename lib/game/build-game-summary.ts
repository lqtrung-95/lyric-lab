import { MAX_FREEZES, planFreezes, computeStreakWithFreezes } from "@/lib/streak/streak-freeze";
import { dayKey } from "@/lib/streak/streak-logic";
import { aggregateActivity, emptyDay, makeLocalizer, sumDays, weekStart, type RawActivity } from "./aggregate-activity";
import type { BadgeFacts } from "./badge-catalog";
import { mergeBadges } from "./evaluate-badges";
import { buildQuestViews, currentQuestSlots, questTitleOf, type QuestSlot } from "./build-quests";
import type { BadgeTier, EarnedBadge, GameSummary } from "./game-types";
import { levelFromXp } from "./levels";
import { buildLedger, DAILY_CAPS, DAILY_CAP_TOTAL, dayLedger, SOURCE_LABELS, totalXp } from "./xp-rules";

export interface QuestClaimRow {
  questId: string;
  rewardXp: number;
  freezeGranted: boolean;
  claimedAt: string;
}

export interface GameInputs {
  userId: string;
  now: Date;
  timeZone: string;
  raw: RawActivity;
  /** Số thẻ đã ôn ít nhất một lần. */
  learnedWords: number;
  levelsCompleted: number;
  /** Số vụ án Khám phá đã giải và riêng vụ mức Khó (mặc định 0 nếu chưa đọc được). */
  casesSolved?: number;
  hardCasesSolved?: number;
  claims: QuestClaimRow[];
  storedBadges: EarnedBadge[];
  /** Ngày đã được đóng băng (đã lưu). */
  frozenDays: string[];
}

export interface GameComputation {
  summary: GameSummary;
  facts: BadgeFacts;
  slots: QuestSlot[];
  /** Cần ghi: huy hiệu mới đạt và ngày vừa được đóng băng. */
  freshBadges: { id: string; tier: BadgeTier }[];
  newFrozenDays: string[];
  /** Đóng băng còn giữ được sau khi tự dùng (để claim kiểm tra trần). */
  freezesHeld: number;
}

const RECENT_LEDGER = 8;
const RECENT_BADGES = 3;

/** Số đóng băng đang giữ = đã kiếm − đã dùng, không âm. */
export const freezesAvailable = (claims: QuestClaimRow[], frozenDays: string[]) => Math.max(0, claims.filter((c) => c.freezeGranted).length - frozenDays.length);

/** Toàn bộ trạng thái game từ dữ liệu thô. Hàm thuần: không đọc/ghi DB, nên test được múi giờ, trần ngày, đóng băng, idempotent. */
export function computeGame(input: GameInputs): GameComputation {
  const { userId, now, timeZone, raw, claims, storedBadges } = input;
  const today = dayKey(now, timeZone);
  const monday = weekStart(today);
  const { days, studiedDays } = aggregateActivity(raw, timeZone);

  // Đóng băng: tự dùng cho ngày lỡ đơn lẻ nếu đang giữ lượt.
  const available = freezesAvailable(claims, input.frozenDays);
  const newFrozenDays = planFreezes(studiedDays, input.frozenDays, today, available);
  const frozenDays = [...input.frozenDays, ...newFrozenDays];
  const streak = computeStreakWithFreezes(studiedDays, frozenDays, today);

  // XP và cấp.
  const toLocalDay = makeLocalizer(timeZone);
  const questRewards = claims.map((c) => ({ day: toLocalDay(c.claimedAt).day, xp: c.rewardXp, title: questTitleOf(c.questId) }));
  const ledger = buildLedger(days, questRewards);
  const total = totalXp(ledger);
  const level = levelFromXp(total);
  const todayEntries = ledger.filter((e) => e.day === today);
  const todaySources = (Object.keys(DAILY_CAPS) as (keyof typeof DAILY_CAPS)[]).map((source) => ({
    source, label: SOURCE_LABELS[source], xp: dayLedger(today, days[today] ?? emptyDay()).find((e) => e.source === source)?.xp ?? 0, cap: DAILY_CAPS[source],
  }));

  // Huy hiệu.
  const all = sumDays(days, "0000-00-00", "9999-99-99");
  const facts: BadgeFacts = {
    learnedWords: input.learnedWords, levelsCompleted: input.levelsCompleted, totalReviews: all.reviews, unitsCompleted: all.unitsCompleted, level: level.n, longestStreak: streak.longest,
    songsCompleted: all.songsCompleted, dictationGood: all.dictationGood, shadowingGood: all.shadowingGood, roomsPlayed: all.roomsPlayed,
    roomsWon: all.roomsWon, perfectRounds: all.perfectRounds, nightReviews: all.nightReviews, earlyReviews: all.earlyReviews,
    exploreRounds: all.exploreRounds, casesSolved: input.casesSolved ?? 0, hardCasesSolved: input.hardCasesSolved ?? 0,
  };
  const { earned, fresh } = mergeBadges(storedBadges, facts);
  const recent = [...earned].sort((a, b) => (b.earnedAt ?? "9").localeCompare(a.earnedAt ?? "9")).slice(0, RECENT_BADGES);

  // Nhiệm vụ.
  const slots = currentQuestSlots(userId, today, monday);
  const quests = buildQuestViews(slots, days, studiedDays, new Set(claims.map((c) => c.questId)));

  const freezesHeld = Math.min(MAX_FREEZES, available - newFrozenDays.length);
  return {
    summary: {
      xp: { total, today: todayEntries.reduce((s, e) => s + e.xp, 0), todayCap: DAILY_CAP_TOTAL, todaySources },
      level,
      streak: { current: streak.current, longest: streak.longest, freezes: freezesHeld, studiedToday: streak.studiedToday, week: streak.week, frozenDays: streak.frozenDays },
      quests,
      badges: { earned, recent },
      ledger: ledger.slice(0, RECENT_LEDGER),
    },
    facts, slots, freshBadges: fresh, newFrozenDays, freezesHeld,
  };
}
