import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ExampleSentence } from "./course-types";
import { assembleSentences, type IndexRow, type LessonLines } from "./assemble-sentences";

const MAX_TERMS = 60;
const ROWS_PER_WANTED = 3;

/**
 * Câu ví dụ thật (từ video đã duyệt) cho một nhóm từ. Trả `{}` khi chưa có chỉ mục (migration/script chưa chạy) để màn học vẫn hiện, chỉ không có phần nghe câu thật.
 * Chỉ đọc video `listed`: video bị ẩn sau khi dựng chỉ mục tự biến mất khỏi kết quả.
 */
export async function loadTermSentences(terms: string[], perTerm = 2): Promise<Record<string, ExampleSentence[]>> {
  const unique = [...new Set(terms)].slice(0, MAX_TERMS);
  if (unique.length === 0) return {};
  const sb = createSupabaseServiceClient();
  const index = await sb.from("term_sentences").select("term,video_id,line_idx,quality").in("term", unique);
  if (index.error || !index.data?.length) return {};
  // Chỉ lấy lời của các video chứa vài câu tốt nhất mỗi từ (dư ra để bù dòng mất bản dịch): lời cả video rất nặng nên đọc hết mọi video của chỉ mục làm chặng tải chậm hàng giây.
  const keep = perTerm * ROWS_PER_WANTED;
  const seen = new Map<string, number>();
  const rows = (index.data as IndexRow[]).sort((a, b) => b.quality - a.quality).filter((r) => {
    const n = (seen.get(r.term) ?? 0) + 1;
    seen.set(r.term, n);
    return n <= keep;
  });
  const videoIds = [...new Set(rows.map((r) => r.video_id))];
  const lessons = await sb.from("video_lessons").select("video_id,lines").eq("status", "listed").in("video_id", videoIds);
  if (lessons.error) return {};
  const byId = new Map((lessons.data as { video_id: string; lines: LessonLines["lines"] }[]).map((l) => [l.video_id, { lines: l.lines }]));
  return assembleSentences(rows, byId, perTerm);
}
