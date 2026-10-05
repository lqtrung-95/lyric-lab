import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { getProfile } from "@/lib/leaderboard/profile-repo";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { authRequired, badRequest, joinFailure, nicknameRequired, rateLimited, serverError } from "@/lib/rooms/room-http";
import { joinRoom } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

/** POST → vào phòng bằng mã với biệt danh của tài khoản (chưa có thì 409 `nickname_required`). Mỗi lần thử (kể cả sai mã) tính vào hạn mức theo giờ để chặn đoán mã. */
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const code = normalizeRoomCode((await params).code);
  if (!code) return badRequest("invalid_code");
  const profile = await getProfile(user.id);
  if (!profile) return nicknameRequired();
  if (!(await consumeUsage(user, "room_join"))) return rateLimited();

  try {
    const result = await joinRoom(user.id, code, profile.nickname);
    return result === "ok" ? Response.json({ code }) : joinFailure(result);
  } catch (error) {
    console.error(JSON.stringify({ event: "room_join_error", message: (error as Error)?.message }));
    return serverError();
  }
}
