import { z } from "zod";

// Nội dung một bài (cột `course_units.content`). Hiện chỉ có bài HSK (danh sách từ); các loại khác (tình huống, tập viết) thêm vào đây khi làm tới.
export const hskUnitContentSchema = z.object({
  kind: z.literal("hsk"),
  /** Từ của bài (chữ giản thể), theo thứ tự học. */
  terms: z.array(z.string().min(1).max(8)).min(1).max(30),
  /** Tên chủ đề ngắn bằng tiếng Việt (tùy chọn, hiện ở bản đồ lộ trình). */
  topic: z.string().max(40).optional(),
});
export const unitContentSchema = hskUnitContentSchema;
export type UnitContent = z.infer<typeof unitContentSchema>;

export type CourseKind = "hsk" | "situation" | "writing";

export interface CourseSummary { id: string; slug: string; kind: CourseKind; title: string; level: number | null; sortOrder: number }
export interface UnitSummary { id: string; courseId: string; idx: number; title: string; summary: string; content: UnitContent }

export type UnitStatus = "in_progress" | "completed";
export interface UnitProgress { unitId: string; status: UnitStatus; bestScore: number; stepState: Record<string, unknown>; completedAt: string | null }

/** Một câu ví dụ thật cho một từ: lấy từ dòng của video đã duyệt (lời đọc từ `video_lessons`, không lưu trong chỉ mục). */
export interface ExampleSentence {
  videoId: string;
  lineIdx: number;
  start: number;
  end: number;
  text: string;
  pinyin: string;
  translation: string;
  quality: number;
}
