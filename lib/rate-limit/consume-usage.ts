import "server-only";
import type { CurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isUnlimitedAccount } from "./unlimited-accounts";
import { usageLimit, usageWindowHours, type UsageKind } from "./usage-limit-config";

/**
 * Ghi nhận một lượt dùng của tài khoản; false nếu đã hết hạn mức 24 giờ gần nhất.
 * Đếm nằm trong Postgres (hàm `consume_usage`, có khóa) nên đúng cả khi chạy nhiều instance serverless.
 * Lỗi DB thì ném ra (không cho qua) để hạn mức không bị vô hiệu khi hệ thống trục trặc.
 */
export async function consumeUsage(user: CurrentUser, kind: UsageKind): Promise<boolean> {
  if (isUnlimitedAccount(user.email)) return true;
  const { data, error } = await createSupabaseServiceClient().rpc("consume_usage", {
    p_user: user.id,
    p_kind: kind,
    p_limit: usageLimit(kind, user.isAnonymous),
    p_window_hours: usageWindowHours(kind),
  });
  if (error) throw new Error(`consume_usage: ${error.message}`);
  return data === true;
}

/**
 * Hoàn lại một lượt vừa trừ khi việc người dùng nhờ làm không xong vì lỗi phía hệ thống (Gemini lỗi, hết khóa, quá giờ): xóa dòng `usage_events` mới nhất của loại đó.
 * Chỉ gọi khi `consumeUsage` vừa trả true cho chính yêu cầu này. Lỗi khi hoàn bị nuốt (chỉ ghi log): hoàn không được làm hỏng việc báo lỗi cho người dùng.
 */
export async function refundUsage(user: CurrentUser, kind: UsageKind): Promise<void> {
  if (isUnlimitedAccount(user.email)) return;
  try {
    const sb = createSupabaseServiceClient();
    const { data } = await sb.from("usage_events").select("id").eq("user_id", user.id).eq("kind", kind).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) await sb.from("usage_events").delete().eq("id", (data as { id: number }).id);
  } catch (error) {
    console.error(JSON.stringify({ event: "refund_usage_error", kind, message: (error as Error)?.message }));
  }
}
