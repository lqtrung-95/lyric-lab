import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { startAttempt } from "@/lib/challenges/challenge-repo";
import { getProfile } from "@/lib/leaderboard/profile-repo";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, nicknameRequired, rateLimited, serverError } from "@/lib/rooms/room-http";

export const runtime = "nodejs";

/** POST → bắt đầu hoặc tiếp tục lượt chơi của mình (mỗi người một lượt). Trả câu hỏi (không đáp án) và các câu đã trả lời. */
export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await ctx.params).code);
  if (!code) return badRequest("invalid_code");
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const profile = await getProfile(user.id);
  if (!profile) return nicknameRequired();
  try {
    const result = await startAttempt(code, user.id, profile.nickname);
    if (result === "not_found") return Response.json({ error: "not_found" }, { status: 404 });
    if (result === "expired") return Response.json({ error: "expired" }, { status: 410 });
    if (result === "already_finished") return Response.json({ error: "already_finished" }, { status: 409 });
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "challenge_start_error", message: (error as Error)?.message }));
    return serverError();
  }
}
