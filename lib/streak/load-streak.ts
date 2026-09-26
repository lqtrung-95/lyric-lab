import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { computeStreak, dayKey, type StreakSummary } from "./streak-logic";

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const LOOKBACK_DAYS = 400;
const MAX_ROWS = 5000;

export interface StreakData extends StreakSummary {
  /** Số thẻ đã ôn ít nhất một lần. */
  learnedWords: number;
}

/**
 * Ngày có hoạt động học = có lần chấm thẻ, lượt luyện tập hoặc tiến độ nghe bài trong ngày (múi giờ của người dùng).
 * Tính từ dữ liệu sẵn có nên hoàn tác một lần chấm cũng tự cập nhật, không cần bảng riêng.
 */
export async function loadStreak(userId: string, now = new Date()): Promise<StreakData> {
  const sb = createSupabaseServiceClient();
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const [profile, logs, scores, songs, learned] = await Promise.all([
    sb.from("user_profiles").select("timezone").eq("user_id", userId).maybeSingle(),
    sb.from("review_logs").select("reviewed_at").eq("user_id", userId).gte("reviewed_at", since).limit(MAX_ROWS),
    sb.from("practice_scores").select("played_at").eq("user_id", userId).gte("played_at", since).limit(MAX_ROWS),
    sb.from("user_song_progress").select("updated_at").eq("user_id", userId).gte("updated_at", since).limit(MAX_ROWS),
    sb.from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).gt("reps", 0),
  ]);
  const tz = profile.data?.timezone ?? DEFAULT_TIMEZONE;
  const stamps = [
    ...(logs.data ?? []).map((r) => r.reviewed_at as string),
    ...(scores.data ?? []).map((r) => r.played_at as string),
    ...(songs.data ?? []).map((r) => r.updated_at as string),
  ];
  const days = new Set(stamps.map((s) => dayKey(new Date(s), tz)));
  return { ...computeStreak(days, dayKey(now, tz)), learnedWords: learned.count ?? 0 };
}
