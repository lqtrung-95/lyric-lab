import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { getChallengeInfo } from "@/lib/challenges/challenge-repo";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { badRequest, rateLimited, serverError } from "@/lib/rooms/room-http";

export const runtime = "nodejs";

/** GET → thông tin thử thách (người tạo, bài, bảng điểm, lượt chơi của mình). Không có câu hỏi hay đáp án. Không cần đăng nhập để xem. */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await ctx.params).code);
  if (!code) return badRequest("invalid_code");
  const user = await getCurrentUser();
  if (user && !allowRoomRequest(user.id)) return rateLimited();
  try {
    const info = await getChallengeInfo(code, user?.id ?? null);
    return info ? Response.json(info, { headers: { "Cache-Control": "private, no-store" } }) : Response.json({ error: "not_found" }, { status: 404 });
  } catch {
    return serverError();
  }
}
