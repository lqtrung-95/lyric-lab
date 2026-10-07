import "server-only";
import { loadActivityDays } from "@/lib/streak/load-streak";
import { computeStreak, dayKey } from "@/lib/streak/streak-logic";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { activeDaysInLastWeek, daysBetween, isWeeklyDay, lastStudiedDay, shouldSendReminder, shouldSendWeekly } from "./email-schedule";
import { listDigestCandidates, markSent } from "./email-prefs-repo";
import { isEmailConfigured, sendEmail } from "./email-sender";
import { oneClickUnsubscribeUrl, SITE_URL, unsubscribeUrl } from "./email-links";
import { renderReminderEmail, renderWeeklyEmail } from "./email-templates";

const MAX_PER_RUN = 200;

export interface DigestRunResult { considered: number; weekly: number; reminder: number; skipped: number; failed: number }

async function countSince(table: "review_logs" | "user_song_progress", column: string, userId: string, sinceIso: string): Promise<number> {
  const { count } = await createSupabaseServiceClient().from(table).select(column, { count: "exact", head: true }).eq("user_id", userId).gte(column, sinceIso);
  return count ?? 0;
}

async function dueCards(userId: string): Promise<number> {
  const { count } = await createSupabaseServiceClient().from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).lte("due", new Date().toISOString());
  return count ?? 0;
}

/**
 * Chạy hằng ngày: thứ Hai (giờ Việt Nam) gửi tổng kết tuần cho người tuần qua có học; mọi ngày gửi nhắc quay lại cho người bỏ học 3–30 ngày
 * (tối đa một lần mỗi 7 ngày). Một người nhận tối đa MỘT email mỗi lần chạy (tổng kết ưu tiên hơn nhắc). Mỗi email có link hủy nhận.
 * Không ghi nội dung email hay địa chỉ vào log; trả số liệu tổng hợp.
 */
export async function sendDigests(now = new Date()): Promise<DigestRunResult> {
  const result: DigestRunResult = { considered: 0, weekly: 0, reminder: 0, skipped: 0, failed: 0 };
  if (!isEmailConfigured()) return result;
  const admin = createSupabaseServiceClient().auth.admin;
  const weeklyDay = isWeeklyDay(now);
  const candidates = await listDigestCandidates(MAX_PER_RUN);
  result.considered = candidates.length;

  for (const prefs of candidates) {
    try {
      const { data } = await admin.getUserById(prefs.userId);
      const email = data.user?.email;
      if (!email || data.user?.is_anonymous) { result.skipped++; continue; }

      const { days, timeZone } = await loadActivityDays(prefs.userId, now);
      const today = dayKey(now, timeZone);
      const base = { siteUrl: SITE_URL, unsubscribeUrl: unsubscribeUrl(prefs.unsubscribeToken) };
      const headers = oneClickUnsubscribeUrl(prefs.unsubscribeToken);
      const activeDays = activeDaysInLastWeek(days, today);
      const last = lastStudiedDay(days);
      const inactiveDays = last ? daysBetween(last, today) : null;

      if (weeklyDay && shouldSendWeekly({ enabled: prefs.weeklyEnabled, lastSentAt: prefs.lastWeeklyAt, activeDays }, now)) {
        const since = new Date(now.getTime() - 7 * 86_400_000).toISOString();
        const [reviewed, songs, due] = await Promise.all([countSince("review_logs", "reviewed_at", prefs.userId, since), countSince("user_song_progress", "updated_at", prefs.userId, since), dueCards(prefs.userId)]);
        const streak = computeStreak(days, today).current;
        await sendEmail({ to: email, ...renderWeeklyEmail(base, { activeDays, reviewed, songs, streak, dueCards: due }), unsubscribeUrl: headers });
        await markSent(prefs.userId, "weekly");
        result.weekly++;
      } else if (shouldSendReminder({ enabled: prefs.reminderEnabled, lastSentAt: prefs.lastReminderAt, inactiveDays }, now)) {
        const due = await dueCards(prefs.userId);
        await sendEmail({ to: email, ...renderReminderEmail(base, { inactiveDays: inactiveDays!, dueCards: due, streakLost: true }), unsubscribeUrl: headers });
        await markSent(prefs.userId, "reminder");
        result.reminder++;
      } else result.skipped++;
    } catch (error) {
      result.failed++;
      console.error(JSON.stringify({ event: "digest_email_error", message: (error as Error)?.message }));
    }
  }
  return result;
}
