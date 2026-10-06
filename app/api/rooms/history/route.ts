import { getCurrentUser } from "@/lib/auth/current-user";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, rateLimited, serverError } from "@/lib/rooms/room-http";
import { listRoomHistory } from "@/lib/rooms/room-history-repo";
import { summarizeHistory } from "@/lib/rooms/room-history-logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → lịch sử thi đấu của người đang xem ({entries, stats}): các ván đã kết thúc gần nhất, mới trước. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  try {
    const entries = await listRoomHistory(user.id);
    return Response.json({ entries, stats: summarizeHistory(entries.map((e) => e.result)) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "room_history_error", message: (error as Error)?.message }));
    return serverError();
  }
}
