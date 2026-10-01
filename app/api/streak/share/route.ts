import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loadStreak } from "@/lib/streak/load-streak";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { SITE_URL } from "@/lib/seo/site-url";

export const runtime = "nodejs";

/**
 * POST → chụp lại số liệu chuỗi ngày học hiện tại của người dùng vào một bản ghi dùng-một-lần (token ngẫu nhiên),
 * trả link công khai /share/streak/[token] để chia sẻ. Số liệu đọc server-side từ phiên hiện tại, không tin số
 * client gửi lên, để link chia sẻ không bị giả mạo. Ảnh chụp cố định tại thời điểm chia sẻ, không đổi về sau.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });

  try {
    const streak = await loadStreak(user.id);
    const token = randomUUID().replace(/-/g, "");
    const sb = createSupabaseServiceClient();
    const { error } = await sb.from("streak_shares").insert({
      token, current_streak: streak.current, learned_words: streak.learnedWords, week_count: streak.weekCount,
    });
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    return Response.json({ url: `${SITE_URL}/share/streak/${token}` });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
