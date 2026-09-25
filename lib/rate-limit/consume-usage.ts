import "server-only";
import type { CurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { USAGE_WINDOW_HOURS, usageLimit, type UsageKind } from "./usage-limit-config";

/**
 * Ghi nhận một lượt dùng của tài khoản; false nếu đã hết hạn mức 24 giờ gần nhất.
 * Đếm nằm trong Postgres (hàm `consume_usage`, có khóa) nên đúng cả khi chạy nhiều instance serverless.
 * Lỗi DB thì ném ra (không cho qua) để hạn mức không bị vô hiệu khi hệ thống trục trặc.
 */
export async function consumeUsage(user: CurrentUser, kind: UsageKind): Promise<boolean> {
  const { data, error } = await createSupabaseServiceClient().rpc("consume_usage", {
    p_user: user.id,
    p_kind: kind,
    p_limit: usageLimit(kind, user.isAnonymous),
    p_window_hours: USAGE_WINDOW_HOURS,
  });
  if (error) throw new Error(`consume_usage: ${error.message}`);
  return data === true;
}
