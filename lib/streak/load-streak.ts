import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { parseDailyGoal } from "./daily-goal";
import { computeStreak, dayKey, type StreakSummary } from "./streak-logic";

const VIDEO_MODES = ["dictation", "shadowing"];

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const LOOKBACK_DAYS = 400;
const MAX_ROWS = 5000;

export interface ActivityDays {
  days: Set<string>;
  timeZone: string;
}

export interface StreakData extends StreakSummary {
  /** Số thẻ đã ôn ít nhất một lần. */
  learnedWords: number;
  /** Số "mục" đã học hôm nay (thẻ ôn + câu video + câu hỏi luyện tập) và mục tiêu mỗi ngày (0 = tắt). */
  todayItems: number;
  dailyGoal: number;
  /** Tổng số câu đã chép chính tả hoặc luyện nói theo video. */
  videoLines: number;
}

/**
 * Ngày có hoạt động học = có lần chấm thẻ, lượt luyện tập (kể cả câu chép chính tả và luyện nói theo video) hoặc tiến độ nghe bài trong ngày (múi giờ của người dùng).
 * Tính từ dữ liệu sẵn có nên hoàn tác một lần chấm cũng tự cập nhật, không cần bảng riêng.
 */
export async function loadActivityDays(userId: string, now = new Date()): Promise<ActivityDays & { learnedWords: number; todayItems: number; dailyGoal: number; videoLines: number }> {
  const sb = createSupabaseServiceClient();
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const [profile, logs, scores, songs, learned] = await Promise.all([
    sb.from("user_profiles").select("timezone,daily_goal").eq("user_id", userId).maybeSingle(),
    sb.from("review_logs").select("reviewed_at").eq("user_id", userId).gte("reviewed_at", since).limit(MAX_ROWS),
    sb.from("practice_scores").select("played_at,total,mode").eq("user_id", userId).gte("played_at", since).limit(MAX_ROWS),
    sb.from("user_song_progress").select("updated_at").eq("user_id", userId).gte("updated_at", since).limit(MAX_ROWS),
    sb.from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).gt("reps", 0),
  ]);
  const tz = profile.data?.timezone ?? DEFAULT_TIMEZONE;
  const stamps = [
    ...(logs.data ?? []).map((r) => r.reviewed_at as string),
    ...(scores.data ?? []).map((r) => r.played_at as string),
    ...(songs.data ?? []).map((r) => r.updated_at as string),
  ];
  const today = dayKey(now, tz);
  const rounds = (scores.data ?? []) as { played_at: string; total: number; mode: string }[];
  const todayItems =
    (logs.data ?? []).filter((r) => dayKey(new Date(r.reviewed_at as string), tz) === today).length +
    rounds.filter((r) => dayKey(new Date(r.played_at), tz) === today).reduce((sum, r) => sum + r.total, 0);
  const videoLines = rounds.filter((r) => VIDEO_MODES.includes(r.mode)).reduce((sum, r) => sum + r.total, 0);
  return { days: new Set(stamps.map((s) => dayKey(new Date(s), tz))), timeZone: tz, learnedWords: learned.count ?? 0, todayItems, dailyGoal: parseDailyGoal(profile.data?.daily_goal), videoLines };
}

/** Chuỗi ngày học của người dùng tính từ các ngày có hoạt động. */
export async function loadStreak(userId: string, now = new Date()): Promise<StreakData> {
  const { days, timeZone, learnedWords, todayItems, dailyGoal, videoLines } = await loadActivityDays(userId, now);
  return { ...computeStreak(days, dayKey(now, timeZone)), learnedWords, todayItems, dailyGoal, videoLines };
}
