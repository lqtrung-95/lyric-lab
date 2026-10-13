import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { translateMissingForUser } from "@/lib/video/translate-missing-for-user";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
// Một lượt dịch tối đa ~18 giây cộng hạn chót một đoạn: nằm trong 60 giây của gói Hobby.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: NO_STORE });

/**
 * POST → dịch bù bằng AI các câu còn trống của video cho người học (mỗi lượt vài chục đến ~một trăm câu; giao diện gọi lặp tới khi hết).
 * Trả {kind:"progress", translated, remaining, filled:[{idx,translation}]} hoặc {kind:"busy"} (người khác đang dịch video này).
 * Lỗi: 401 unauthorized, 404 not_found, 429 user_limit, 503 ai_unavailable (AI quá tải, đã hoàn lượt hạn mức), 500 server_error.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return fail("not_found", 404);
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);
  try {
    const outcome = await translateMissingForUser(user, videoId);
    if (outcome.kind === "not_found") return fail("not_found", 404);
    if (outcome.kind === "user_limit") return fail("user_limit", 429);
    if (outcome.kind === "ai_unavailable") return Response.json({ error: "ai_unavailable", remaining: outcome.remaining }, { status: 503, headers: NO_STORE });
    if (outcome.kind === "progress" && outcome.translated > 0) {
      revalidatePath("/api/videos");
      revalidatePath(`/api/videos/${videoId}`);
    }
    return Response.json(outcome, { headers: NO_STORE });
  } catch (error) {
    console.error(JSON.stringify({ event: "user_translate_missing_error", videoId, message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}
