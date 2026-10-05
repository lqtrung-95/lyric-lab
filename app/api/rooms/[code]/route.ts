import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, serverError, rateLimited } from "@/lib/rooms/room-http";
import { getRoomView } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → trạng thái phòng cho thành viên. 404 cho cả "không có phòng" lẫn "không phải thành viên" để không lộ phòng của người khác. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const code = normalizeRoomCode((await params).code);
  if (!code) return Response.json({ error: "room_not_found" }, { status: 404 });
  try {
    const view = await getRoomView(user.id, code);
    return view ? Response.json(view, { headers: { "Cache-Control": "private, no-store" } }) : Response.json({ error: "room_not_found" }, { status: 404 });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_view_error", message: (error as Error)?.message }));
    return serverError();
  }
}
