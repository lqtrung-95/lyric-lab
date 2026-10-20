import { z } from "zod";

// Nội dung một bài (cột `course_units.content`): bài HSK (danh sách từ) và chặng ôn tổng hợp; các loại khác (tình huống, tập viết) thêm vào đây khi làm tới.
export const hskUnitContentSchema = z.object({
  kind: z.literal("hsk"),
  /** Từ của bài (chữ giản thể), theo thứ tự học. */
  terms: z.array(z.string().min(1).max(8)).min(1).max(30),
  /** Tên chủ đề ngắn bằng tiếng Việt (tùy chọn, hiện ở bản đồ lộ trình). */
  topic: z.string().max(40).optional(),
  /** Nghĩa tiếng Việt ngắn của từng từ (từ điển chỉ có nghĩa tiếng Anh); sinh bằng `scripts/gloss-hsk-course.mts`, người dùng duyệt trước khi ghi. */
  glosses: z.record(z.string(), z.string().min(1).max(80)).optional(),
  /** Emoji minh họa cho từ cụ thể (một emoji mỗi từ; từ trừu tượng không có). Sinh bằng `scripts/enrich-hsk-course.mts`. */
  emojis: z.record(z.string(), z.string().min(1).max(16)).optional(),
  /** Mẹo nhớ ngắn bằng tiếng Việt (thường nối với âm Hán Việt). AI sinh, CHƯA rà soát: giao diện gắn nhãn "gợi ý". */
  tips: z.record(z.string(), z.string().min(1).max(160)).optional(),
});
/**
 * Chặng ôn tổng hợp: không có từ riêng mà ôn lại các chặng đã học của cùng khóa. `checkpoint` ôn các chặng học có số thứ tự từ `from` đến `to`
 * (số thứ tự của khóa); `final` là bài kiểm tra cuối cấp trên toàn bộ khóa. Máy chủ lấy mẫu từ khi người học mở chặng (xem `load-unit.ts`).
 */
export const reviewUnitContentSchema = z.object({
  kind: z.literal("review"),
  variant: z.enum(["checkpoint", "final"]),
  from: z.number().int().min(1).optional(),
  to: z.number().int().min(1).optional(),
  topic: z.string().max(40).optional(),
});
export const unitContentSchema = z.discriminatedUnion("kind", [hskUnitContentSchema, reviewUnitContentSchema]);
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
