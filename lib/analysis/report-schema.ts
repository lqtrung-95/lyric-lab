import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";
import { REPORT_REASONS } from "./report-reasons";

export const reportRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  promptVersion: z.string().min(1).max(20),
  itemId: z.string().min(1).max(200),
  reason: z.enum(REPORT_REASONS),
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;
