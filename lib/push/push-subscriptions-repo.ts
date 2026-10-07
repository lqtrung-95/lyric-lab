import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface StoredSubscription extends PushSubscriptionInput {
  userId: string;
}

/** Lưu (hoặc gán lại cho người dùng hiện tại) một đăng ký: cùng endpoint đổi chủ khi tài khoản ẩn danh được gộp vào Google. */
export async function saveSubscription(userId: string, sub: PushSubscriptionInput): Promise<void> {
  const { error } = await createSupabaseServiceClient().from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, user_id: userId, p256dh: sub.p256dh, auth: sub.auth }, { onConflict: "endpoint" });
  if (error) throw new Error(`push_subscriptions: ${error.message}`);
}

export async function deleteSubscription(userId: string, endpoint: string): Promise<void> {
  await createSupabaseServiceClient().from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", userId);
}

export async function deleteSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await createSupabaseServiceClient().from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/** Đăng ký chưa nhận nhắc trong `minHours` giờ gần nhất (tối đa `limit` dòng mỗi lượt chạy). */
export async function listSubscriptionsToRemind(minHours: number, limit: number): Promise<StoredSubscription[]> {
  const cutoff = new Date(Date.now() - minHours * 3_600_000).toISOString();
  const { data, error } = await createSupabaseServiceClient().from("push_subscriptions")
    .select("endpoint, user_id, p256dh, auth").or(`last_sent_at.is.null,last_sent_at.lt.${cutoff}`).limit(limit);
  if (error) throw new Error(`push_subscriptions: ${error.message}`);
  return (data ?? []).map((r) => ({ endpoint: r.endpoint, userId: r.user_id, p256dh: r.p256dh, auth: r.auth }));
}

export async function markSent(endpoint: string): Promise<void> {
  await createSupabaseServiceClient().from("push_subscriptions").update({ last_sent_at: new Date().toISOString() }).eq("endpoint", endpoint);
}
