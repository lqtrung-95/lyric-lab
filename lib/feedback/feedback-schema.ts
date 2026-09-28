import { z } from "zod";

export const FEEDBACK_CATEGORIES = ["bug", "feature", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Báo lỗi",
  feature: "Đề xuất tính năng",
  other: "Khác",
};

export const feedbackRequestSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z.string().trim().min(5, "Viết thêm một chút để mình hiểu rõ hơn nhé.").max(2000),
  pageUrl: z.string().max(300).optional(),
});
