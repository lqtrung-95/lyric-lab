import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, serverError, rateLimited } from "@/lib/rooms/room-http";
import { setReady } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/** POST {ready: boolean} → đặt sẵn sàng/bỏ sẵn sàng khi phòng còn chờ. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const code = normalizeRoomCode((await params).code);
  const body = (await req.json().catch(() => null)) as { ready?: unknown } | null;
  if (!code || typeof body?.ready !== "boolean") return badRequest("invalid_request");
  try {
    return (await setReady(user.id, code, body.ready)) ? Response.json({ ok: true }) : Response.json({ error: "not_in_waiting_room" }, { status: 409 });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_ready_error", message: (error as Error)?.message }));
    return serverError();
  }
}
