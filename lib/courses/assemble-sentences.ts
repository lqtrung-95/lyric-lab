import type { ExampleSentence } from "./course-types";

export interface IndexRow { term: string; video_id: string; line_idx: number; quality: number }
export interface LessonLines { lines: { idx: number; start: number; end: number; text: string; pinyin: string; translation: string | null }[] }

/**
 * Ghép các dòng chỉ mục với lời của video thành câu ví dụ theo từ. Bỏ dòng không còn trong video (video bị sửa/gỡ sau khi dựng chỉ mục) hoặc mất bản dịch;
 * mỗi từ sắp theo điểm giảm dần và giữ tối đa `perTerm` câu.
 */
export function assembleSentences(rows: IndexRow[], lessons: Map<string, LessonLines>, perTerm: number): Record<string, ExampleSentence[]> {
  const out: Record<string, ExampleSentence[]> = {};
  for (const row of [...rows].sort((a, b) => b.quality - a.quality)) {
    const line = lessons.get(row.video_id)?.lines.find((l) => l.idx === row.line_idx);
    if (!line || !line.translation) continue;
    const list = (out[row.term] ??= []);
    if (list.length >= perTerm) continue;
    list.push({ videoId: row.video_id, lineIdx: row.line_idx, start: line.start, end: line.end, text: line.text, pinyin: line.pinyin, translation: line.translation, quality: row.quality });
  }
  return out;
}
