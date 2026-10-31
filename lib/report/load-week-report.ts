import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { buildWeekReport, type RoundRow, type WeekReport } from "./week-report";

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const LOOKBACK_DAYS = 16;
const MAX_ROWS = 5000;

/** Báo cáo 7 ngày gần nhất của người dùng, từ nhật ký chấm thẻ, lượt luyện tập và thẻ mới lưu (xem `buildWeekReport`). */
export async function loadWeekReport(userId: string, now = new Date()): Promise<WeekReport> {
  const sb = createSupabaseServiceClient();
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const [profile, logs, scores, cards, learned] = await Promise.all([
    sb.from("user_profiles").select("timezone").eq("user_id", userId).maybeSingle(),
    sb.from("review_logs").select("reviewed_at").eq("user_id", userId).gte("reviewed_at", since).limit(MAX_ROWS),
    sb.from("practice_scores").select("played_at,mode,points,correct,total").eq("user_id", userId).gte("played_at", since).limit(MAX_ROWS),
    sb.from("user_cards").select("created_at").eq("user_id", userId).gte("created_at", since).limit(MAX_ROWS),
    sb.from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).gt("reps", 0),
  ]);
  return buildWeekReport({
    now, timeZone: (profile.data?.timezone as string | undefined) ?? DEFAULT_TIMEZONE,
    reviews: (logs.data ?? []).map((r) => r.reviewed_at as string),
    rounds: (scores.data ?? []) as RoundRow[],
    newCardStamps: (cards.data ?? []).map((r) => r.created_at as string),
    totalLearned: learned.count ?? 0,
  });
}
