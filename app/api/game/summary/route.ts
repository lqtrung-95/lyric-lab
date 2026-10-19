import { getCurrentUser } from "@/lib/auth/current-user";
import { getGameSummary } from "@/lib/game/game-service";

export const runtime = "nodejs";

/** GET → XP, cấp, chuỗi ngày (có đóng băng), nhiệm vụ, huy hiệu và vài khoản XP gần nhất của người dùng hiện tại. Gọi lúc đọc cũng cấp huy hiệu mới và tự dùng đóng băng. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  try {
    return Response.json(await getGameSummary(user.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error(JSON.stringify({ event: "game_summary_error", message: e instanceof Error ? e.message : String(e) }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
