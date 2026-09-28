import { z } from "zod";

/** Góp ý bản dịch 1 câu trong màn Nghe: người học thấy bản dịch chưa tự nhiên có thể đề xuất câu khác. */
export const translationSuggestionRequestSchema = z.object({
  videoId: z.string().min(1).max(20),
  promptVersion: z.string().min(1).max(20),
  lineIndex: z.number().int().min(0),
  currentTranslation: z.string().max(500),
  suggestedTranslation: z.string().trim().min(3, "Viết thêm một chút để mình hiểu rõ hơn nhé.").max(500),
});
