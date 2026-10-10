import "server-only";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { readCachedAnalysis } from "@/lib/analysis/server-deps";
import { lessonLinesToAnalyzed } from "@/lib/video/lesson-to-lines";
import { getLessonLinesForExplain } from "@/lib/video/video-repo";

/** Các câu của một bài hát đã phân tích, hoặc của video luyện nghe (không ẩn); null nếu không có cả hai. Dùng cho các API hỏi/nhận xét theo câu. */
export async function loadLinesForVideo(videoId: string): Promise<AnalyzedLine[] | null> {
  const analysis = await readCachedAnalysis(videoId);
  if (analysis) return analysis.lines;
  const lesson = await getLessonLinesForExplain(videoId);
  return lesson ? lessonLinesToAnalyzed(lesson) : null;
}
