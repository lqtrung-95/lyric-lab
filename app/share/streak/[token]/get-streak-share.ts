import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export interface StreakShare {
  currentStreak: number;
  learnedWords: number;
  weekCount: number;
}

/** Đọc ảnh chụp số liệu chuỗi ngày học đã lưu theo token chia sẻ. null nếu token không tồn tại. */
export async function getStreakShare(token: string): Promise<StreakShare | null> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("streak_shares").select("current_streak,learned_words,week_count").eq("token", token).maybeSingle();
  if (!data) return null;
  return { currentStreak: data.current_streak, learnedWords: data.learned_words, weekCount: data.week_count };
}
