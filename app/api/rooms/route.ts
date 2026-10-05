import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { parseDisplayName } from "@/lib/rooms/display-name";
import { authRequired, badRequest, rateLimited, serverError } from "@/lib/rooms/room-http";
import { RoomError, createRoom } from "@/lib/rooms/room-repo";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * POST {displayName, videoId?} → tạo phòng thi đấu và đưa người tạo vào (chủ phòng). `videoId` trống = chọn ngẫu nhiên khi bắt đầu.
 * Trả {code} (mã 6 số). Giới hạn số phòng tạo mỗi 24 giờ theo tài khoản.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const body = (await req.json().catch(() => null)) as { displayName?: unknown; videoId?: unknown } | null;
  const displayName = parseDisplayName(body?.displayName);
  if (!displayName) return badRequest("invalid_name");
  const rawVideo = body?.videoId;
  if (rawVideo != null && !(typeof rawVideo === "string" && isValidVideoId(rawVideo))) return badRequest("invalid_video");
  if (!(await consumeUsage(user, "room"))) return rateLimited();

  try {
    return Response.json({ code: await createRoom(user.id, displayName, (rawVideo as string | null | undefined) ?? null) });
  } catch (error) {
    if (error instanceof RoomError) return error.code === "invalid_song" ? badRequest("song_unavailable") : Response.json({ error: "code_unavailable" }, { status: 503 });
    console.error(JSON.stringify({ event: "room_create_error", message: (error as Error)?.message }));
    return serverError();
  }
}
