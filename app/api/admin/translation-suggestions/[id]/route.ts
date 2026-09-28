import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { EXPLAIN_LANG, LEARN_LANG } from "@/lib/analysis/analyze-video";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * PATCH { action: "apply" | "dismiss" } → duyệt góp ý dịch một câu.
 * "apply" ghi thẳng vào `song_analyses.analysis.lines[lineIndex].translation` (bản dịch không có bảng riêng, nằm
 * trong JSON phân tích) rồi bung cache Next để hiện ngay, không cần đợi hết hạn.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const suggestionId = Number(id);
  if (!Number.isInteger(suggestionId)) return Response.json({ error: "invalid_id" }, { status: 400 });

  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  if (body?.action !== "apply" && body?.action !== "dismiss") return Response.json({ error: "invalid_action" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { data: suggestion, error: readError } = await sb
    .from("translation_suggestions").select("video_id,prompt_version,line_index,suggested_translation,status")
    .eq("id", suggestionId).maybeSingle();
  if (readError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!suggestion) return Response.json({ error: "not_found" }, { status: 404 });
  if (suggestion.status !== "pending") return Response.json({ error: "already_reviewed" }, { status: 409 });

  if (body.action === "apply") {
    const { data: row, error: analysisError } = await sb
      .from("song_analyses").select("analysis")
      .eq("video_id", suggestion.video_id).eq("learn_lang", LEARN_LANG).eq("explain_lang", EXPLAIN_LANG).eq("prompt_version", suggestion.prompt_version)
      .maybeSingle();
    if (analysisError) return Response.json({ error: "server_error" }, { status: 500 });
    if (!row) return Response.json({ error: "analysis_not_found" }, { status: 404 });

    const analysis = row.analysis as SongAnalysis;
    const line = analysis.lines[suggestion.line_index];
    if (!line) return Response.json({ error: "line_not_found" }, { status: 404 });
    const updated: SongAnalysis = { ...analysis, lines: analysis.lines.map((l, i) => (i === suggestion.line_index ? { ...l, translation: suggestion.suggested_translation } : l)) };

    const { error: writeError } = await sb
      .from("song_analyses").update({ analysis: updated })
      .eq("video_id", suggestion.video_id).eq("learn_lang", LEARN_LANG).eq("explain_lang", EXPLAIN_LANG).eq("prompt_version", suggestion.prompt_version);
    if (writeError) return Response.json({ error: "server_error" }, { status: 500 });
    // Không bung cache ở đây (revalidateTag lệch API giữa các bản Next): cache phân tích tự hết hạn trong tối đa 1 giờ,
    // giống các lần sửa dữ liệu phân tích trực tiếp trong DB khác.
  }

  const { error: statusError } = await sb.from("translation_suggestions").update({ status: body.action === "apply" ? "applied" : "dismissed" }).eq("id", suggestionId);
  if (statusError) return Response.json({ error: "server_error" }, { status: 500 });
  return Response.json({ done: body.action });
}
