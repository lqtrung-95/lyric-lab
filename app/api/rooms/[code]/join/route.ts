import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { parseDisplayName } from "@/lib/rooms/display-name";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { authRequired, badRequest, joinFailure, rateLimited, serverError } from "@/lib/rooms/room-http";
import { joinRoom } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/** POST {displayName} → vào phòng bằng mã. Mỗi lần thử (kể cả sai mã) tính vào hạn mức theo giờ để chặn đoán mã. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const code = normalizeRoomCode((await params).code);
  if (!code) return badRequest("invalid_code");
  const body = (await req.json().catch(() => null)) as { displayName?: unknown } | null;
  const displayName = parseDisplayName(body?.displayName);
  if (!displayName) return badRequest("invalid_name");
  if (!(await consumeUsage(user, "room_join"))) return rateLimited();

  try {
    const result = await joinRoom(user.id, code, displayName);
    return result === "ok" ? Response.json({ code }) : joinFailure(result);
  } catch (error) {
    console.error(JSON.stringify({ event: "room_join_error", message: (error as Error)?.message }));
    return serverError();
  }
}
