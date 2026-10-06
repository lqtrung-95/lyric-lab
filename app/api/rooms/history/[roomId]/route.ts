import { getCurrentUser } from "@/lib/auth/current-user";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, rateLimited, serverError } from "@/lib/rooms/room-http";
import { getFinishedRoomView } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET → xem lại một ván đã kết thúc của chính người xem. 404 cho cả "không có ván" lẫn "không phải thành viên". */
export async function GET(_req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const { roomId } = await params;
  if (!UUID.test(roomId)) return Response.json({ error: "room_not_found" }, { status: 404 });
  try {
    const view = await getFinishedRoomView(user.id, roomId);
    return view ? Response.json(view, { headers: { "Cache-Control": "private, no-store" } }) : Response.json({ error: "room_not_found" }, { status: 404 });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_history_view_error", message: (error as Error)?.message }));
    return serverError();
  }
}
