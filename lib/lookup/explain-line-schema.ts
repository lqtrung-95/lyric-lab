import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Yêu cầu giải nghĩa cả câu: video và chỉ số dòng, không cần chỉ ra từ cụ thể (khác explain-schema.ts). */
export const explainLineRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  lineIndex: z.number().int().min(0).max(5000),
});
export type ExplainLineRequest = z.infer<typeof explainLineRequestSchema>;

/** Đầu ra LLM: nghĩa cả câu (thường tự nhiên hơn bản dịch máy) và ghi chú ngữ pháp/cách dùng. */
export const explainLineOutputSchema = z.object({
  meaning: z.string().min(1).max(400),
  grammarNote: z.string().max(400).optional(),
});
export type ExplainLineOutput = z.infer<typeof explainLineOutputSchema>;

export interface LineExplanation extends ExplainLineOutput {
  model: string;
  fromCache: boolean;
}
