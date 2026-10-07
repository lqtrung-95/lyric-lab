import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export interface EmailPrefs {
  userId: string;
  welcomeSentAt: string | null;
  weeklyEnabled: boolean;
  reminderEnabled: boolean;
  lastWeeklyAt: string | null;
  lastReminderAt: string | null;
  unsubscribeToken: string;
}

const COLUMNS = "user_id, welcome_sent_at, weekly_enabled, reminder_enabled, last_weekly_at, last_reminder_at, unsubscribe_token";
const sb = () => createSupabaseServiceClient();

interface Row { user_id: string; welcome_sent_at: string | null; weekly_enabled: boolean; reminder_enabled: boolean; last_weekly_at: string | null; last_reminder_at: string | null; unsubscribe_token: string }
const toPrefs = (r: Row): EmailPrefs => ({
  userId: r.user_id, welcomeSentAt: r.welcome_sent_at, weeklyEnabled: r.weekly_enabled, reminderEnabled: r.reminder_enabled,
  lastWeeklyAt: r.last_weekly_at, lastReminderAt: r.last_reminder_at, unsubscribeToken: r.unsubscribe_token,
});

/** Lấy tùy chọn của người dùng, tạo hàng mặc định (bật tổng kết và nhắc, chưa gửi chào mừng) nếu chưa có. */
export async function ensurePrefs(userId: string): Promise<EmailPrefs> {
  await sb().from("email_prefs").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  const { data, error } = await sb().from("email_prefs").select(COLUMNS).eq("user_id", userId).single();
  if (error) throw new Error(`email_prefs: ${error.message}`);
  return toPrefs(data as Row);
}

/** Giành quyền gửi chào mừng: chỉ MỘT lời gọi (kể cả chạy song song) nhận được true cho mỗi người. */
export async function claimWelcome(userId: string): Promise<boolean> {
  const { data } = await sb().from("email_prefs").update({ welcome_sent_at: new Date().toISOString() }).eq("user_id", userId).is("welcome_sent_at", null).select("user_id");
  return (data?.length ?? 0) > 0;
}

/** Trả lại quyền gửi chào mừng khi gửi thất bại, để lần đăng nhập sau thử lại. */
export async function releaseWelcome(userId: string): Promise<void> {
  await sb().from("email_prefs").update({ welcome_sent_at: null }).eq("user_id", userId);
}

export async function markSent(userId: string, kind: "weekly" | "reminder"): Promise<void> {
  await sb().from("email_prefs").update(kind === "weekly" ? { last_weekly_at: new Date().toISOString() } : { last_reminder_at: new Date().toISOString() }).eq("user_id", userId);
}

export async function updatePrefs(userId: string, change: { weeklyEnabled?: boolean; reminderEnabled?: boolean }): Promise<EmailPrefs> {
  await ensurePrefs(userId);
  const patch: Record<string, boolean> = {};
  if (change.weeklyEnabled !== undefined) patch.weekly_enabled = change.weeklyEnabled;
  if (change.reminderEnabled !== undefined) patch.reminder_enabled = change.reminderEnabled;
  if (Object.keys(patch).length > 0) await sb().from("email_prefs").update(patch).eq("user_id", userId);
  return ensurePrefs(userId);
}

/** Hủy nhận mọi email định kỳ bằng mã trong link cuối email. False nếu mã không tồn tại. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const { data } = await sb().from("email_prefs").update({ weekly_enabled: false, reminder_enabled: false }).eq("unsubscribe_token", token).select("user_id");
  return (data?.length ?? 0) > 0;
}

/** Những người còn bật ít nhất một loại email định kỳ (tối đa `limit`, ưu tiên người lâu chưa được gửi). */
export async function listDigestCandidates(limit: number): Promise<EmailPrefs[]> {
  const { data, error } = await sb().from("email_prefs").select(COLUMNS).or("weekly_enabled.eq.true,reminder_enabled.eq.true").order("last_weekly_at", { ascending: true, nullsFirst: true }).limit(limit);
  if (error) throw new Error(`email_prefs: ${error.message}`);
  return (data as Row[]).map(toPrefs);
}
