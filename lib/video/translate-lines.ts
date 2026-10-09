import { GROQ_MODELS } from "@/lib/analysis/analyze-lyrics";
import { fillMissingTranslations } from "@/lib/analysis/fill-translations";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { withGroqFallback } from "@/lib/analysis/openrouter-chat";

/**
 * Thứ tự model dịch phụ đề video: khóa Groq THỨ HAI trước (miễn phí, hạn mức đếm riêng nên không làm cạn khóa chính đang phục vụ giải nghĩa khi
 * bấm từ), rồi DeepSeek trả phí (rẻ), cuối cùng OpenRouter. Groq lỗi/hết hạn mức/thiếu khóa thì tự rớt sang model sau, không làm hỏng việc thêm video.
 */
export const VIDEO_TRANSLATION_MODELS = [
  ...withGroqFallback([GROQ_MODELS[0]]),
  "deepseek:deepseek-chat",
  "openrouter:google/gemini-2.5-flash",
];

/** Số đoạn (30 dòng) dịch cùng lúc: đủ nhanh nhưng không đẩy cùng lúc cả chục yêu cầu vào hạn mức token/phút của gói miễn phí. */
export const VIDEO_TRANSLATION_CONCURRENCY = 3;
/** Quá khoảng này kể từ lúc bắt đầu dịch thì ngừng bắt đầu đoạn mới (dòng còn lại để trống), để cả request nằm trong 60 giây của gói Hobby. */
export const VIDEO_TRANSLATION_TIME_BUDGET_MS = 35_000;

interface Translatable {
  text: string;
  translation: string | null;
}

/**
 * Điền bản dịch tiếng Việt cho các dòng chưa có (video người dùng thêm, hoặc admin dịch bù). Dùng lại bộ dịch theo đoạn của bài hát với chuỗi model
 * và giới hạn riêng của video; đoạn nào lỗi hoặc quá hạn chót thì các dòng đó giữ `translation: null`, giao diện vẫn dùng được.
 */
export async function translateLines<T extends Translatable>(lines: T[], chat: ChatFn, models: string[] = VIDEO_TRANSLATION_MODELS): Promise<T[]> {
  const indexed = lines.map((l, index) => ({ index, text: l.text, translation: l.translation ?? undefined }));
  const filled = await fillMissingTranslations(indexed, chat, models, {
    concurrency: VIDEO_TRANSLATION_CONCURRENCY,
    deadline: Date.now() + VIDEO_TRANSLATION_TIME_BUDGET_MS,
  });
  return lines.map((l, i) => ({ ...l, translation: filled[i].translation ?? null }));
}
