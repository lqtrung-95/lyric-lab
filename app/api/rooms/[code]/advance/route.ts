import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, serverError, rateLimited } from "@/lib/rooms/room-http";
import { advanceRoom } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/**
 * POST → tiến ván sang câu kế hoặc kết thúc khi câu hiện tại đã đóng. Mọi người trong phòng gọi được và gọi thừa vô hại
 * (idempotent, trả `not_ready` khi chưa đóng): máy nào thấy hết giờ hoặc mọi người đã trả lời thì gọi, vì Vercel không có timer nền.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const code = normalizeRoomCode((await params).code);
  if (!code) return badRequest("invalid_code");
  try {
    const result = await advanceRoom(user.id, code);
    if (result === "not_in_room") return Response.json({ error: "room_not_found" }, { status: 404 });
    return Response.json({ result });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_advance_error", message: (error as Error)?.message }));
    return serverError();
  }
}
