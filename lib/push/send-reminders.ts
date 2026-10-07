import "server-only";
import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "./push-config";
import { loadStreak } from "@/lib/streak/load-streak";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { deleteSubscriptionByEndpoint, listSubscriptionsToRemind, markSent } from "./push-subscriptions-repo";
import { buildReminder } from "./reminder-message";

const MAX_PER_RUN = 500;
/** Không gửi lại cho cùng một thiết bị trong chừng này giờ (cron chạy lại hay gọi tay cũng không làm phiền hai lần một ngày). */
const MIN_HOURS_BETWEEN = 20;
const GONE = new Set([404, 410]);

export interface ReminderRunResult {
  considered: number;
  sent: number;
  skipped: number;
  removed: number;
  failed: number;
}

async function dueCardCount(userId: string): Promise<number> {
  const { count } = await createSupabaseServiceClient().from("user_cards")
    .select("item_key", { count: "exact", head: true }).eq("user_id", userId).lte("due", new Date().toISOString());
  return count ?? 0;
}

/**
 * Gửi nhắc học cho các thiết bị đã đăng ký mà hôm nay (theo múi giờ của người dùng) chưa học. Thiết bị trả 404/410 (đã gỡ đăng ký) bị xóa.
 * Không in nội dung người dùng; chỉ trả số liệu tổng hợp.
 */
export async function sendReminders(): Promise<ReminderRunResult> {
  webpush.setVapidDetails((process.env.VAPID_SUBJECT ?? "mailto:admin@example.com").trim(), VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY!.trim());
  const subs = await listSubscriptionsToRemind(MIN_HOURS_BETWEEN, MAX_PER_RUN);
  const result: ReminderRunResult = { considered: subs.length, sent: 0, skipped: 0, removed: 0, failed: 0 };
  // Một người có thể có nhiều thiết bị: tính trạng thái học một lần cho mỗi người.
  const perUser = new Map<string, ReturnType<typeof buildReminder>>();

  for (const sub of subs) {
    try {
      if (!perUser.has(sub.userId)) {
        const [streak, due] = await Promise.all([loadStreak(sub.userId), dueCardCount(sub.userId)]);
        perUser.set(sub.userId, buildReminder({ dueCards: due, currentStreak: streak.current, studiedToday: streak.studiedToday }));
      }
      const message = perUser.get(sub.userId);
      if (!message) { result.skipped++; continue; }
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(message), { TTL: 6 * 3600 });
      await markSent(sub.endpoint);
      result.sent++;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status && GONE.has(status)) { await deleteSubscriptionByEndpoint(sub.endpoint); result.removed++; }
      else result.failed++;
    }
  }
  return result;
}
