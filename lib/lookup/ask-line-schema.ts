import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const MAX_QUESTION_CHARS = 300;
const MAX_HISTORY_TURNS = 4;

/** Một lượt hỏi-đáp trước đó (client giữ và gửi lại để câu hỏi tiếp theo nối được mạch). */
const turnSchema = z.object({ q: z.string().trim().min(1).max(MAX_QUESTION_CHARS), a: z.string().trim().min(1).max(1500) });

export const askLineRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  lineIndex: z.number().int().min(0).max(5000),
  question: z.string().trim().min(2).max(MAX_QUESTION_CHARS),
  history: z.array(turnSchema).max(MAX_HISTORY_TURNS).optional(),
});
export type AskLineRequest = z.infer<typeof askLineRequestSchema>;

/** Đầu ra LLM: một câu trả lời văn bản tiếng Việt. */
export const askLineOutputSchema = z.object({ answer: z.string().trim().min(1).max(2500) });
export type AskLineOutput = z.infer<typeof askLineOutputSchema>;
