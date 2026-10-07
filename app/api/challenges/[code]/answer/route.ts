import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { submitAnswer } from "@/lib/challenges/challenge-repo";
import { allowRoomRequest } from "@/lib/rooms/room-rate-limit";
import { authRequired, badRequest, rateLimited, serverError } from "@/lib/rooms/room-http";

export const runtime = "nodejs";

const FAILURES = { not_found: 404, forbidden: 403, out_of_order: 409, already_finished: 409 } as const;
const isInt = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** POST {attemptId, idx, choice, elapsedMs} → chấm một câu (choice -1 = hết giờ). Phải trả lời theo thứ tự. Trả đáp án đúng của câu đó và tổng điểm. */
export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  if (!normalizeChallengeCode((await ctx.params).code)) return badRequest("invalid_code");
  const user = await getCurrentUser();
  if (!user) return authRequired();
  if (!allowRoomRequest(user.id)) return rateLimited();
  const body = (await req.json().catch(() => null)) as { attemptId?: unknown; idx?: unknown; choice?: unknown; elapsedMs?: unknown } | null;
  if (!body || typeof body.attemptId !== "string" || !isInt(body.idx, 0, 99) || !isInt(body.choice, -1, 3) || !isInt(body.elapsedMs, 0, 600_000)) return badRequest("bad_request");
  try {
    const result = await submitAnswer(body.attemptId, user.id, body.idx, body.choice, body.elapsedMs);
    if (typeof result === "string") return Response.json({ error: result }, { status: FAILURES[result] });
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "challenge_answer_error", message: (error as Error)?.message }));
    return serverError();
  }
}
