import { getCurrentUser } from "@/lib/auth/current-user";
import { validateScore } from "@/lib/leaderboard/validate-score";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * POST {mode, points, correct, total, durationSec} → ghi điểm một lượt luyện tập cho bảng xếp hạng.
 * Kiểm tra giá trị hợp lý (xem `validateScore`) và giới hạn số lượt gửi mỗi giờ. Điểm luôn được lưu cho chủ tài khoản;
 * chỉ hiện trên bảng khi người đó đã bật tham gia.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = validateScore(await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  if (!(await consumeUsage(user, "score"))) return Response.json({ error: "rate_limited" }, { status: 429 });

  const { mode, points, correct, total, durationSec } = parsed.value;
  const { error } = await createSupabaseServiceClient().from("practice_scores").insert({ user_id: user.id, mode, points, correct, total, duration_sec: durationSec });
  if (error) {
    console.error(JSON.stringify({ event: "score_insert_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
