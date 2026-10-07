import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, rateLimited, serverError } from "@/lib/rooms/room-http";
import { normalizeRoomCode } from "@/lib/rooms/room-code-format";

export const runtime = "nodejs";

const REASONS = new Set(["offensive_name", "cheating", "harassment", "other"]);
const MAX_REPORTS_PER_DAY = 20;

/**
 * POST {context: "room"|"challenge", code, name, reason} → báo cáo một người chơi (tên không phù hợp, gian lận, quấy rối...). Ghi vào
 * `player_reports` để quản trị viên xem; mỗi tài khoản tối đa 20 báo cáo mỗi ngày. Không trả thông tin người bị báo cáo.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const body = (await req.json().catch(() => null)) as { context?: unknown; code?: unknown; name?: unknown; reason?: unknown } | null;
  const context = body?.context;
  const code = typeof body?.code === "string" ? (context === "room" ? normalizeRoomCode(body.code) : context === "challenge" ? normalizeChallengeCode(body.code) : null) : null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : "";
  if ((context !== "room" && context !== "challenge") || !code || !name || typeof body?.reason !== "string" || !REASONS.has(body.reason)) return badRequest("bad_request");
  try {
    const sb = createSupabaseServiceClient();
    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { count } = await sb.from("player_reports").select("id", { count: "exact", head: true }).eq("reporter_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= MAX_REPORTS_PER_DAY) return rateLimited();
    const { error } = await sb.from("player_reports").insert({ reporter_id: user.id, context, context_code: code, reported_name: name, reason: body.reason });
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ event: "player_report_error", message: (error as Error)?.message }));
    return serverError();
  }
}
