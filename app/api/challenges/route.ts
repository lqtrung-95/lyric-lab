import { ChallengeError, canPlayChallengeSong, createChallenge } from "@/lib/challenges/challenge-repo";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfile } from "@/lib/leaderboard/profile-repo";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { authRequired, badRequest, nicknameRequired, rateLimited, serverError } from "@/lib/rooms/room-http";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST {videoId?} → tạo thử thách không cần cùng lúc (bộ 10 câu cố định, ai cũng chơi được lúc nào tùy ý rồi so điểm). `videoId` trống = chọn
 * bài ngẫu nhiên. Cần biệt danh (chưa có thì 409 `nickname_required`). Dùng chung hạn mức tạo phòng (`room`). Trả {code}.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const body = (await req.json().catch(() => null)) as { videoId?: unknown } | null;
  const rawVideo = body?.videoId;
  if (rawVideo != null && !(typeof rawVideo === "string" && isValidVideoId(rawVideo))) return badRequest("invalid_video");
  const profile = await getProfile(user.id);
  if (!profile) return nicknameRequired();
  if (typeof rawVideo === "string" && !(await canPlayChallengeSong(rawVideo))) return badRequest("song_unavailable");
  if (!(await consumeUsage(user, "room"))) return rateLimited();
  try {
    return Response.json({ code: await createChallenge(user.id, profile.nickname, (rawVideo as string | null | undefined) ?? null) });
  } catch (error) {
    if (error instanceof ChallengeError) return error.code === "invalid_song" ? badRequest("song_unavailable") : Response.json({ error: "code_unavailable" }, { status: 503 });
    console.error(JSON.stringify({ event: "challenge_create_error", message: (error as Error)?.message }));
    return serverError();
  }
}
