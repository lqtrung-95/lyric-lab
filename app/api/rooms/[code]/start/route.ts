import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, serverError, startFailure, rateLimited } from "@/lib/rooms/room-http";
import { startRoom } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/** POST → chủ phòng bắt đầu ván (cần đủ 2 người, cả hai sẵn sàng). Phòng chưa chọn bài thì chọn ngẫu nhiên ở bước này. */
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const code = normalizeRoomCode((await params).code);
  if (!code) return badRequest("invalid_code");
  try {
    const result = await startRoom(user.id, code);
    return result === "ok" ? Response.json({ ok: true }) : startFailure(result);
  } catch (error) {
    console.error(JSON.stringify({ event: "room_start_error", message: (error as Error)?.message }));
    return serverError();
  }
}
