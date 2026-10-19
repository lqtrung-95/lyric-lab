import { getCurrentUser } from "@/lib/auth/current-user";
import { getBadgeCatalog } from "@/lib/game/game-service";

export const runtime = "nodejs";

/** GET → toàn bộ danh mục huy hiệu kèm trạng thái mở/khóa, bậc và gợi ý cách mở (huy hiệu ẩn chưa mở bị che). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  try {
    return Response.json({ badges: await getBadgeCatalog(user.id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error(JSON.stringify({ event: "game_badges_error", message: e instanceof Error ? e.message : String(e) }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
