import { z } from "zod";
import type { AnalyzedLine } from "./analysis-types";
import type { ChatFn } from "./groq-chat";

const CHUNK_SIZE = 30;
// Một đoạn 30 dòng dịch xong chỉ cần vài nghìn token; đặt thấp để không chiếm hạn mức token/phút.
const CHUNK_MAX_TOKENS = 3000;

const SYSTEM =
  "Bạn là người dịch lời bài hát tiếng Trung sang tiếng Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Chỉ dịch các dòng được đưa, giữ đúng chỉ số, không thêm hay bớt dòng.";

const outputSchema = z.object({ translations: z.array(z.object({ lineIndex: z.number().int().min(0), vi: z.string().min(1) })) });

const buildPrompt = (lines: Pick<AnalyzedLine, "index" | "text">[]) =>
  `CÁC DÒNG CẦN DỊCH (mỗi dòng: chỉ số, tab, lời):\n${lines.map((l) => `${l.index}\t${l.text}`).join("\n")}\n\n` +
  `Trả về JSON: {"translations": [{"lineIndex": <chỉ số>, "vi": "bản dịch tiếng Việt tự nhiên, sát nghĩa"}]}. Dịch đủ MỌI dòng ở trên.`;

/** Dịch một đoạn dòng: thử lần lượt các model, mỗi lần chỉ hỏi những dòng còn thiếu. Lỗi từng model được bỏ qua. */
async function translateChunk(chat: ChatFn, models: string[], lines: Pick<AnalyzedLine, "index" | "text">[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  for (const model of models) {
    const todo = lines.filter((l) => !result.has(l.index));
    if (todo.length === 0) break;
    try {
      const raw = await chat({ model, system: SYSTEM, user: buildPrompt(todo), maxTokens: CHUNK_MAX_TOKENS });
      const wanted = new Set(todo.map((l) => l.index));
      for (const t of outputSchema.parse(JSON.parse(raw)).translations) if (wanted.has(t.lineIndex)) result.set(t.lineIndex, t.vi.trim());
    } catch {
      // thử model kế tiếp
    }
  }
  return result;
}

/**
 * Bù bản dịch cho các dòng mà lần phân tích chính bỏ sót (bài dài làm LLM dịch dở dang hoặc bị cắt vì hết token).
 * Chỉ điền dòng còn thiếu, không đụng dòng đã có. Trả cùng mảng dòng, dòng nào vẫn dịch không được thì để trống.
 */
export async function fillMissingTranslations<T extends Pick<AnalyzedLine, "index" | "text" | "translation">>(lines: T[], chat: ChatFn, models: string[]): Promise<T[]> {
  const missing = lines.filter((l) => !l.translation && l.text.trim());
  if (missing.length === 0) return lines;
  const chunks: typeof missing[] = [];
  for (let i = 0; i < missing.length; i += CHUNK_SIZE) chunks.push(missing.slice(i, i + CHUNK_SIZE));
  const maps = await Promise.all(chunks.map((c) => translateChunk(chat, models, c)));
  const filled = new Map(maps.flatMap((m) => [...m]));
  return lines.map((l) => (!l.translation && filled.has(l.index) ? { ...l, translation: filled.get(l.index) } : l));
}
