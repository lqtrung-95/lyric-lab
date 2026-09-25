import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const REPORT_REASONS = ["wrong_meaning", "wrong_pinyin", "not_worth_learning"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  wrong_meaning: "Sai nghĩa",
  wrong_pinyin: "Sai pinyin",
  not_worth_learning: "Không đáng học",
};

export const reportRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  promptVersion: z.string().min(1).max(20),
  itemId: z.string().min(1).max(200),
  reason: z.enum(REPORT_REASONS),
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;
