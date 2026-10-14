import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { transcribeChunkForUser } from "@/lib/video/asr/transcribe-chunk-for-user";
import { parseVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
// Một đoạn 2 phút (+12 giây dư) Gemini nghe mất 15-25 giây, hạn chót một lần gọi 50 giây: nằm trong 60 giây của gói Hobby.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const bodySchema = z.object({ video: z.string().min(1).max(300), chunk: z.number().int().min(0).max(20) });
const NO_STORE = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: NO_STORE });
const STATUS: Record<string, number> = {
  account_required: 403, not_found: 404, exists: 409, not_embeddable: 422, too_short: 422, too_long: 413, invalid_chunk: 400, user_limit: 429, global_limit: 429, ai_unavailable: 503,
};

/**
 * POST {video, chunk} → Gemini nghe một đoạn ~2 phút của video YouTube chưa có phụ đề và trả {lines:[{text,start,end}], chunkCount} (giờ tính từ đầu video).
 * Giao diện gọi lần lượt từng đoạn 0..chunkCount-1 rồi gửi cả bản chép sang /api/videos/add. Mỗi đoạn trừ một lượt hạn mức `transcribe` (hoàn lại khi AI lỗi).
 * Lỗi: 400 invalid_video/invalid_chunk, 401 unauthorized, 403 account_required (tài khoản ẩn danh), 404 not_found, 409 exists, 413 too_long, 422 not_embeddable/too_short, 429 user_limit/global_limit, 503 ai_unavailable, 500 server_error.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  const videoId = parsed.success ? parseVideoId(parsed.data.video) : null;
  if (!parsed.success || !videoId) return fail("invalid_video", 400);
  try {
    const outcome = await transcribeChunkForUser(user, videoId, parsed.data.chunk);
    if (outcome.kind === "ok") return Response.json({ lines: outcome.lines, chunkCount: outcome.chunkCount }, { headers: NO_STORE });
    return fail(outcome.kind, STATUS[outcome.kind]);
  } catch (error) {
    console.error(JSON.stringify({ event: "video_transcribe_route_error", videoId, message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}
