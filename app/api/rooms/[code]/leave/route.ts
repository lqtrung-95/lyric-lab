import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { authRequired, badRequest, serverError } from "@/lib/rooms/room-http";
import { leaveRoom } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/** POST → rời phòng (idempotent: không ở trong phòng thì vẫn trả ok). */
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const code = normalizeRoomCode((await params).code);
  if (!code) return badRequest("invalid_code");
  try {
    await leaveRoom(user.id, code);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_leave_error", message: (error as Error)?.message }));
    return serverError();
  }
}
