import "server-only";
import { loadStreak } from "@/lib/streak/load-streak";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { shouldSendStreakRisk } from "./email-schedule";
import { listStreakCandidates, markStreakSent } from "./email-prefs-repo";
import { isEmailConfigured, sendEmail } from "./email-sender";
import { oneClickUnsubscribeUrl, SITE_URL, unsubscribeUrl } from "./email-links";
import { renderStreakRiskEmail } from "./email-templates";

const MAX_PER_RUN = 200;

export interface StreakEmailRunResult { considered: number; sent: number; skipped: number; failed: number }

async function dueCards(userId: string): Promise<number> {
  const { count } = await createSupabaseServiceClient().from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).lte("due", new Date().toISOString());
  return count ?? 0;
}

/**
 * Chạy buổi tối (20:00 giờ Việt Nam): nhắc giữ chuỗi cho người đang có chuỗi ≥ 3 ngày mà hôm nay (theo múi giờ của họ) chưa học. Dùng chung công tắc
 * nhắc học và link hủy nhận với email nhắc quay lại. Không ghi nội dung email hay địa chỉ vào log; trả số liệu tổng hợp.
 */
export async function sendStreakEmails(now = new Date()): Promise<StreakEmailRunResult> {
  const result: StreakEmailRunResult = { considered: 0, sent: 0, skipped: 0, failed: 0 };
  if (!isEmailConfigured()) return result;
  const admin = createSupabaseServiceClient().auth.admin;
  const candidates = await listStreakCandidates(MAX_PER_RUN);
  result.considered = candidates.length;

  for (const c of candidates) {
    try {
      const { data } = await admin.getUserById(c.userId);
      const email = data.user?.email;
      if (!email || data.user?.is_anonymous) { result.skipped++; continue; }
      const streak = await loadStreak(c.userId, now);
      if (!shouldSendStreakRisk({ enabled: true, lastSentAt: c.lastStreakAt, currentStreak: streak.current, studiedToday: streak.studiedToday }, now)) { result.skipped++; continue; }
      const due = await dueCards(c.userId);
      const base = { siteUrl: SITE_URL, unsubscribeUrl: unsubscribeUrl(c.unsubscribeToken) };
      await sendEmail({ to: email, ...renderStreakRiskEmail(base, { streak: streak.current, dueCards: due }), unsubscribeUrl: oneClickUnsubscribeUrl(c.unsubscribeToken) });
      await markStreakSent(c.userId);
      result.sent++;
    } catch (error) {
      result.failed++;
      console.error(JSON.stringify({ event: "streak_email_error", message: (error as Error)?.message }));
    }
  }
  return result;
}
