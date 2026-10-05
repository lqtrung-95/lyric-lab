import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { getProfile } from "@/lib/leaderboard/profile-repo";
import { authRequired, badRequest, nicknameRequired, rateLimited, serverError } from "@/lib/rooms/room-http";
import { RoomError, createRoom } from "@/lib/rooms/room-repo";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * POST {videoId?} → tạo phòng thi đấu và đưa người tạo vào (chủ phòng) với biệt danh của tài khoản (chưa có thì 409 `nickname_required`).
 * `videoId` trống = chọn ngẫu nhiên khi bắt đầu. Trả {code} (mã 6 số). Giới hạn số phòng tạo mỗi 24 giờ theo tài khoản.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const body = (await req.json().catch(() => null)) as { videoId?: unknown } | null;
  const rawVideo = body?.videoId;
  if (rawVideo != null && !(typeof rawVideo === "string" && isValidVideoId(rawVideo))) return badRequest("invalid_video");
  const profile = await getProfile(user.id);
  if (!profile) return nicknameRequired();
  if (!(await consumeUsage(user, "room"))) return rateLimited();

  try {
    return Response.json({ code: await createRoom(user.id, profile.nickname, (rawVideo as string | null | undefined) ?? null) });
  } catch (error) {
    if (error instanceof RoomError) return error.code === "invalid_song" ? badRequest("song_unavailable") : Response.json({ error: "code_unavailable" }, { status: 503 });
    console.error(JSON.stringify({ event: "room_create_error", message: (error as Error)?.message }));
    return serverError();
  }
}
