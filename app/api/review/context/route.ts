import { getCurrentUser } from "@/lib/auth/current-user";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import type { ReviewContext } from "@/lib/review/review-context-types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/review/context?videoId=… → câu hát cho các thẻ ôn của người dùng thuộc video này.
 * Chỉ trả những dòng mà chính người dùng có thẻ tham chiếu (đọc qua RLS), nên không dùng được để lấy toàn bộ lời bài hát.
 */
export async function GET(req: Request) {
  const videoId = new URL(req.url).searchParams.get("videoId") ?? "";
  if (!isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });
  if (!(await getCurrentUser())) return Response.json({ error: "auth_required" }, { status: 401 });

  const sb = await createSupabaseServerClient();
  const { data: cards, error } = await sb.from("user_cards").select("line_index").eq("video_id", videoId);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });
  const wanted = new Set((cards ?? []).map((c) => c.line_index as number | null).filter((i): i is number => i !== null));
  if (wanted.size === 0) return Response.json({ error: "no_cards" }, { status: 404 });

  const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
  if (!analysis) return Response.json({ error: "song_unavailable" }, { status: 404 });

  const lines: ReviewContext["lines"] = {};
  for (const line of analysis.lines) {
    if (wanted.has(line.index)) {
      lines[line.index] = { text: line.text, pinyin: line.pinyin, translation: line.translation, start: line.start, end: line.end };
    }
  }
  const body: ReviewContext = {
    videoId, lines,
    title: analysis.track?.title ?? song?.title ?? "",
    artist: analysis.track?.artist ?? song?.channelTitle ?? "",
  };
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
