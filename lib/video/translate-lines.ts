import { z } from "zod";
import { GROQ_MODELS } from "@/lib/analysis/analyze-lyrics";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { withGroqFallback } from "@/lib/analysis/openrouter-chat";
import { buildVideoTranslationPrompt, VIDEO_TRANSLATION_SYSTEM } from "./build-translation-prompt";

// Dùng tên model cụ thể, KHÔNG dùng alias `-latest`: ngày 13/10/2026 hai alias flash-lite/flash trỏ vào model quá tải (treo hoặc 503) trong khi gemini-3-flash-preview vẫn chạy.
const GEMINI_3_FLASH = "gemini:gemini-3-flash-preview";
const GEMINI_25_FLASH = "gemini:gemini-2.5-flash";

/**
 * Chuỗi model dịch phụ đề video: Gemini 3 Flash (mức suy nghĩ "minimal", xem `gemini-chat.ts`), Gemini 2.5 Flash (nhanh nhưng một số dự án Google mới không còn dùng được:
 * khóa đó tự bị bỏ qua), Groq khóa THỨ HAI (miễn phí, hạn mức riêng), DeepSeek trả phí (rẻ, nhanh, dự phòng đáng tin nhất khi Gemini quá tải: nhớ giữ số dư), cuối cùng
 * OpenRouter. Model lỗi/quá tải/hết hạn mức/thiếu khóa thì tự rớt sang model sau, không làm hỏng việc thêm video.
 */
export const VIDEO_TRANSLATION_MODELS = [
  GEMINI_3_FLASH,
  GEMINI_25_FLASH,
  ...withGroqFallback([GROQ_MODELS[0]]),
  "deepseek:deepseek-chat",
  "openrouter:google/gemini-2.5-flash",
];

/** Chuỗi cho việc admin chủ động dịch lại: hiện dùng chung chuỗi trên (mức suy nghĩ do `gemini-chat.ts` quyết định theo model, không theo từng yêu cầu). */
export const VIDEO_TRANSLATION_QUALITY_MODELS = VIDEO_TRANSLATION_MODELS;

/** Thời gian chờ tối đa của MỘT lần gọi theo model: model nghẽn thì bỏ qua sớm để rớt sang model kế thay vì chờ hết ngân sách. */
export function modelTimeoutMs(model: string): number {
  if (model === GEMINI_3_FLASH) return 15_000;
  if (model === GEMINI_25_FLASH) return 12_000;
  if (model.startsWith("groq")) return 15_000;
  return CHUNK_DEADLINE_MS;
}

/** Số đoạn dịch cùng lúc. Mỗi đoạn mất ~3–12 giây nên với 3 luồng, video 365 câu (13 đoạn) không kịp ngân sách 25 giây (đo 13/10/2026: hai đoạn cuối không được bắt đầu); có hàng chục khóa Gemini nên 8 luồng vẫn rải đều các khóa. */
export const VIDEO_TRANSLATION_CONCURRENCY = 8;
/** Quá khoảng này kể từ lúc bắt đầu dịch thì ngừng bắt đầu đoạn mới (dòng còn lại để trống). Cộng với hạn chót một lần gọi (`CHUNK_TIMEOUT_MS`) phải còn dưới 60 giây của gói Hobby, nếu không route bị cắt giữa chừng và mất cả kết quả. */
export const VIDEO_TRANSLATION_TIME_BUDGET_MS = 25_000;
const CHUNK_SIZE = 30;
const CONTEXT_BEFORE = 3;
const CONTEXT_AFTER = 2;
// Model "suy nghĩ" tính cả token suy nghĩ vào giới hạn đầu ra; 30 dòng dịch chỉ cần vài trăm token, chừa dư để không bị cắt cụt JSON.
const CHUNK_MAX_TOKENS = 5000;
/** Tổng thời gian tối đa dành cho MỘT đoạn (qua mọi model thử lần lượt). Hạn chót bắt đầu đoạn mới + giá trị này = trần ~50 giây, nằm trong 60 giây của route. */
const CHUNK_DEADLINE_MS = 25_000;
/** Còn ít hơn từng này thì không thử thêm model (không đủ thời gian để trả lời). */
const MIN_ATTEMPT_MS = 3_000;

interface Translatable {
  text: string;
  translation: string | null;
}

export interface TranslateOptions {
  /** Tiêu đề video, đưa vào prompt làm ngữ cảnh chủ đề. */
  title?: string;
  /** Mặc định `VIDEO_TRANSLATION_TIME_BUDGET_MS`. */
  timeBudgetMs?: number;
  concurrency?: number;
}

const outputSchema = z.object({ translations: z.array(z.object({ lineIndex: z.number().int().min(0), vi: z.string().min(1) })) });

/** Dịch một đoạn: thử lần lượt các model, mỗi lần chỉ hỏi những dòng còn thiếu. Lỗi từng model được bỏ qua. */
async function translateChunk(chat: ChatFn, models: string[], chunk: { index: number; text: string }[], lines: Translatable[], title?: string): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const first = chunk[0].index;
  const last = chunk[chunk.length - 1].index;
  const before = lines.slice(Math.max(0, first - CONTEXT_BEFORE), first).map((l) => l.text);
  const after = lines.slice(last + 1, last + 1 + CONTEXT_AFTER).map((l) => l.text);
  const chunkDeadline = Date.now() + CHUNK_DEADLINE_MS;
  for (const model of models) {
    const todo = chunk.filter((l) => !result.has(l.index));
    if (todo.length === 0) break;
    const remaining = chunkDeadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) break;
    try {
      const raw = await chat({ model, system: VIDEO_TRANSLATION_SYSTEM, user: buildVideoTranslationPrompt({ title, before, after, lines: todo }), maxTokens: CHUNK_MAX_TOKENS, timeoutMs: Math.min(modelTimeoutMs(model), remaining) });
      const wanted = new Set(todo.map((l) => l.index));
      for (const t of outputSchema.parse(JSON.parse(raw)).translations) if (wanted.has(t.lineIndex)) result.set(t.lineIndex, t.vi.trim());
    } catch {
      // thử model kế tiếp
    }
  }
  return result;
}

/**
 * Điền bản dịch tiếng Việt cho các dòng chưa có (video người dùng thêm, hoặc admin dịch bù/dịch lại). Mỗi đoạn 30 dòng được dịch kèm tiêu đề video và vài dòng
 * lân cận làm ngữ cảnh (phụ đề tự động hay ngắt giữa câu). Đoạn nào lỗi hoặc quá hạn chót thì các dòng đó giữ `translation: null`, giao diện vẫn dùng được.
 */
export async function translateLines<T extends Translatable>(lines: T[], chat: ChatFn, models: string[] = VIDEO_TRANSLATION_MODELS, options: TranslateOptions = {}): Promise<T[]> {
  const missing = lines.map((l, index) => ({ index, text: l.text, has: !!l.translation })).filter((l) => !l.has && l.text.trim());
  if (missing.length === 0) return lines.map((l) => ({ ...l, translation: l.translation ?? null }));
  const chunks: typeof missing[] = [];
  for (let i = 0; i < missing.length; i += CHUNK_SIZE) chunks.push(missing.slice(i, i + CHUNK_SIZE));
  const deadline = Date.now() + (options.timeBudgetMs ?? VIDEO_TRANSLATION_TIME_BUDGET_MS);
  const maps: Map<number, string>[] = [];
  let next = 0;
  const worker = async () => {
    while (next < chunks.length && Date.now() <= deadline) {
      const i = next++;
      maps[i] = await translateChunk(chat, models, chunks[i], lines, options.title);
    }
  };
  const workers = Math.max(1, Math.min(options.concurrency ?? VIDEO_TRANSLATION_CONCURRENCY, chunks.length));
  await Promise.all(Array.from({ length: workers }, worker));
  const filled = new Map(maps.flatMap((m) => (m ? [...m] : [])));
  return lines.map((l, i) => ({ ...l, translation: l.translation || filled.get(i) || null }));
}
