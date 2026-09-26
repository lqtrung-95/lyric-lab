import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeNickname, validateNickname } from "@/lib/leaderboard/nickname";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * POST {optedIn: true, nickname} → tham gia hoặc đổi biệt danh; POST {optedIn: false} → rời bảng (giữ biệt danh để quay lại).
 * Biệt danh duy nhất không phân biệt hoa thường (trùng thì 409). Không nhận email hay tên Google.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { optedIn?: unknown; nickname?: unknown };
  const sb = createSupabaseServiceClient();

  if (body.optedIn === false) {
    await sb.from("leaderboard_profiles").update({ opted_in: false, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    return Response.json({ ok: true });
  }
  if (typeof body.nickname !== "string") return Response.json({ error: "invalid_chars" }, { status: 400 });
  const invalid = validateNickname(body.nickname);
  if (invalid) return Response.json({ error: invalid }, { status: 400 });

  const { error } = await sb.from("leaderboard_profiles").upsert({
    user_id: user.id, nickname: normalizeNickname(body.nickname), opted_in: true, updated_at: new Date().toISOString(),
  });
  if (error?.code === "23505") return Response.json({ error: "taken" }, { status: 409 });
  if (error) return Response.json({ error: "server_error" }, { status: 500 });
  return Response.json({ ok: true });
}
