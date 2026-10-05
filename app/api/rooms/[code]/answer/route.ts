import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeRoomCode } from "@/lib/rooms/room-code";
import { answerFailure, authRequired, badRequest, serverError } from "@/lib/rooms/room-http";
import { submitAnswer } from "@/lib/rooms/room-repo";

export const runtime = "nodejs";

const isIndex = (v: unknown, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;

/**
 * POST {index, choice} → trả lời một câu của ván đang chơi. Chấm và tính thời gian ở server (giờ server, không tin client);
 * mỗi người chỉ trả lời một lần cho mỗi câu. Trả {correct, points, elapsedMs, correctIndex} cho chính người trả lời.
 */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return authRequired();
  const code = normalizeRoomCode((await params).code);
  const body = (await req.json().catch(() => null)) as { index?: unknown; choice?: unknown } | null;
  if (!code || !isIndex(body?.index, 19) || !isIndex(body?.choice, 3)) return badRequest("invalid_request");
  try {
    const result = await submitAnswer(user.id, code, body.index, body.choice);
    return result.ok ? Response.json(result.feedback, { headers: { "Cache-Control": "private, no-store" } }) : answerFailure(result.error);
  } catch (error) {
    console.error(JSON.stringify({ event: "room_answer_error", message: (error as Error)?.message }));
    return serverError();
  }
}
