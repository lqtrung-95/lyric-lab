import { getCurrentUser } from "@/lib/auth/current-user";
import { MAX_VIDEO_STUDY_PER_HOUR, VIDEO_STUDY_MODES, validateVideoStudy } from "@/lib/practice/video-study";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * POST {mode: "dictation" | "shadowing", lines, correct} → ghi nhận một lần học theo video để tính chuỗi ngày và mục tiêu hằng ngày.
 * Lưu vào `practice_scores` với 0 điểm (không cộng bảng xếp hạng). Giới hạn số lần gửi mỗi giờ theo chính các dòng đã lưu.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = validateVideoStudy(await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: "invalid" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count, error: countError } = await sb.from("practice_scores").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).in("mode", [...VIDEO_STUDY_MODES]).gte("played_at", since);
  if (countError) return Response.json({ error: "server_error" }, { status: 500 });
  if ((count ?? 0) >= MAX_VIDEO_STUDY_PER_HOUR) return Response.json({ error: "rate_limited" }, { status: 429 });

  const { mode, lines, correct } = parsed.value;
  const { error } = await sb.from("practice_scores").insert({ user_id: user.id, mode, points: 0, correct, total: lines, duration_sec: 0 });
  if (error) {
    console.error(JSON.stringify({ event: "video_study_insert_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
