import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Yêu cầu giải nghĩa: video, chỉ số dòng, và từ đúng như hiển thị trong dòng đó. */
export const explainRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  lineIndex: z.number().int().min(0).max(5000),
  term: z.string().min(1).max(12),
});
export type ExplainRequest = z.infer<typeof explainRequestSchema>;

/** Đầu ra LLM: chỉ nghĩa theo ngữ cảnh và ghi chú ngắn (pinyin, cấp, Hán Việt lấy từ từ điển). */
export const explainOutputSchema = z.object({
  meaningInContext: z.string().min(1).max(300),
  note: z.string().max(300).optional(),
});
export type ExplainOutput = z.infer<typeof explainOutputSchema>;

export interface TermExplanation extends ExplainOutput {
  model: string;
  fromCache: boolean;
}
