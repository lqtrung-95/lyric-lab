import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";
import { SONG_REPORT_REASONS } from "./song-report-reasons";

export const songReportRequestSchema = z.object({
  videoId: z.string().refine(isValidVideoId, "videoId không hợp lệ"),
  reason: z.enum(SONG_REPORT_REASONS),
});
