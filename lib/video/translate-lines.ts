import { DEFAULT_MODELS } from "@/lib/analysis/analyze-lyrics";
import { fillMissingTranslations } from "@/lib/analysis/fill-translations";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { PreparedLine } from "./build-lesson-lines";

/**
 * Dịch tiếng Việt cho các dòng của video người dùng thêm (không có track tiếng Việt do người làm). Dùng lại bộ dịch theo đoạn của bài hát
 * (chuỗi model dự phòng, đoạn nào lỗi thì bỏ trống dòng đó). Dòng dịch không được giữ `translation: null`, giao diện vẫn dùng được.
 */
export async function translatePreparedLines(lines: PreparedLine[], chat: ChatFn, models: string[] = DEFAULT_MODELS): Promise<PreparedLine[]> {
  const indexed = lines.map((l, index) => ({ index, text: l.text, translation: l.translation ?? undefined }));
  const filled = await fillMissingTranslations(indexed, chat, models);
  return lines.map((l, i) => ({ ...l, translation: filled[i].translation ?? null }));
}
