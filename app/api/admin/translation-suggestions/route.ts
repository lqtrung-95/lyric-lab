import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { EXPLAIN_LANG, LEARN_LANG } from "@/lib/analysis/analyze-video";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** GET → danh sách góp ý dịch đang chờ duyệt (mới nhất trước), kèm tên bài để admin biết đang xem câu của bài nào. */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("translation_suggestions")
    .select("id,video_id,prompt_version,line_index,current_translation,suggested_translation,created_at,songs(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  // Đếm các câu khác trong cùng bài có cùng nguyên văn Hán tự với câu được góp ý, để admin biết có thể áp dụng
  // cùng bản dịch cho điệp khúc lặp lại hay không — chỉ cần đọc `analysis`, không ghi gì ở bước liệt kê này.
  const analysisCache = new Map<string, SongAnalysis | null>();
  async function getAnalysis(videoId: string, promptVersion: string) {
    const key = `${videoId}:${promptVersion}`;
    if (analysisCache.has(key)) return analysisCache.get(key)!;
    const { data: row } = await sb
      .from("song_analyses").select("analysis")
      .eq("video_id", videoId).eq("learn_lang", LEARN_LANG).eq("explain_lang", EXPLAIN_LANG).eq("prompt_version", promptVersion)
      .maybeSingle();
    const analysis = (row?.analysis as SongAnalysis | undefined) ?? null;
    analysisCache.set(key, analysis);
    return analysis;
  }

  const items = await Promise.all((data ?? []).map(async (r) => {
    const analysis = await getAnalysis(r.video_id, r.prompt_version);
    const lineText = analysis?.lines[r.line_index]?.text;
    const matchingLineCount = lineText ? analysis!.lines.filter((l, i) => i !== r.line_index && l.text === lineText).length : 0;
    return {
      id: r.id, videoId: r.video_id, promptVersion: r.prompt_version, lineIndex: r.line_index,
      currentTranslation: r.current_translation, suggestedTranslation: r.suggested_translation, createdAt: r.created_at,
      songTitle: (r.songs as unknown as { title: string } | null)?.title ?? r.video_id,
      matchingLineCount,
    };
  }));
  return Response.json({ items });
}
