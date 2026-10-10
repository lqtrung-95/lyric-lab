import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Trần kích thước âm thanh (base64) nhận vào: ~20 giây WAV 16 kHz mono 16-bit ≈ 640 KB, nới thêm cho định dạng khác. */
export const MAX_AUDIO_BASE64_CHARS = 1_200_000;
export const ALLOWED_AUDIO_MIME = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/aac", "audio/ogg", "audio/flac"] as const;

export const feedbackRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  lineIndex: z.number().int().min(0).max(5000),
  mimeType: z.enum(ALLOWED_AUDIO_MIME),
  audio: z.string().min(100).max(MAX_AUDIO_BASE64_CHARS).regex(/^[A-Za-z0-9+/]+=*$/, "audio phải là base64"),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

const issueSchema = z.object({
  word: z.string().trim().min(1).max(20),
  problem: z.string().trim().min(1).max(300),
  tip: z.string().trim().max(300).optional(),
});

/** Đầu ra LLM: chữ nghe được, điểm 0-100, nhận xét chung và các chỗ cần sửa (mỗi chỗ gắn với một cụm chữ Hán trong câu mẫu). */
export const feedbackOutputSchema = z.object({
  heard: z.string().trim().max(200).default(""),
  score: z.number().min(0).max(100).transform((n) => Math.round(n)),
  summary: z.string().trim().min(1).max(500),
  issues: z.array(issueSchema).max(8).default([]),
});
export type FeedbackOutput = z.infer<typeof feedbackOutputSchema>;
