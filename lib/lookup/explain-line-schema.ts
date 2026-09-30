import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Yêu cầu giải nghĩa cả câu: video và chỉ số dòng, không cần chỉ ra từ cụ thể (khác explain-schema.ts). */
export const explainLineRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  lineIndex: z.number().int().min(0).max(5000),
});
export type ExplainLineRequest = z.infer<typeof explainLineRequestSchema>;

const vocabEntrySchema = z.object({
  term: z.string().min(1).max(30),
  pinyin: z.string().max(60).optional(),
  meaning: z.string().min(1).max(200),
});

const grammarPointSchema = z.object({
  title: z.string().min(1).max(150),
  explanation: z.string().min(1).max(500),
});

/** Đầu ra LLM: bản dịch, từ vựng đáng chú ý, điểm ngữ pháp, và ghi chú khác (sắc thái, ngữ cảnh bài hát…). */
export const explainLineOutputSchema = z.object({
  translation: z.string().min(1).max(300),
  vocabulary: z.array(vocabEntrySchema).max(15),
  grammarPoints: z.array(grammarPointSchema).max(8),
  notes: z.array(z.string().min(1).max(500)).max(8),
});
export type ExplainLineOutput = z.infer<typeof explainLineOutputSchema>;

export interface LineExplanation extends ExplainLineOutput {
  model: string;
  fromCache: boolean;
}
